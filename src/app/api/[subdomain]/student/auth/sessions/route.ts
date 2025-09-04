import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSubdomainForAPI } from "@/lib/utils"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request: NextRequest) {
  try {
    const subdomain = getSubdomainForAPI(request)
    
    if (!subdomain) {
      return NextResponse.json({ error: "Subdomain required" }, { status: 400 })
    }

    // Get the token from cookies or Authorization header
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('student_token')?.value

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as any
    
    if (!decoded.studentId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Get the agency
    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    // Get the student
    const student = await db.student.findFirst({
      where: {
        id: decoded.studentId,
        agencyId: agency.id
      },
      select: {
        id: true,
        email: true,
        currentSessionId: true,
        lastLoginAt: true,
        trustedDevices: true
      }
    })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Parse trusted devices if available
    let trustedDevices = []
    if (student.trustedDevices) {
      try {
        trustedDevices = JSON.parse(student.trustedDevices)
      } catch (error) {
        console.error("Error parsing trusted devices:", error)
      }
    }

    // Get recent activity logs for this student
    const recentActivity = await db.activityLog.findMany({
      where: {
        agencyId: agency.id,
        entityType: "Student",
        entityId: student.id,
        action: {
          in: ["STUDENT_LOGIN", "STUDENT_LOGOUT", "2FA_VERIFICATION", "BIOMETRIC_VERIFICATION"]
        }
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        action: true,
        createdAt: true,
        ipAddress: true,
        userAgent: true,
        changes: true
      }
    })

    return NextResponse.json({
      success: true,
      session: {
        currentSessionId: student.currentSessionId,
        lastLoginAt: student.lastLoginAt,
        isActive: !!student.currentSessionId
      },
      trustedDevices: trustedDevices.map(device => ({
        id: device.id,
        name: device.name,
        type: device.type,
        lastUsed: device.lastUsed,
        isCurrent: device.sessionId === student.currentSessionId
      })),
      recentActivity: recentActivity.map(activity => ({
        action: activity.action,
        timestamp: activity.createdAt,
        ipAddress: activity.ipAddress,
        userAgent: activity.userAgent,
        details: activity.changes ? JSON.parse(activity.changes) : null
      }))
    })

  } catch (error) {
    console.error("Error in sessions GET API:", error)
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    return NextResponse.json({ 
      error: "Internal server error",
      details: error.message 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const subdomain = getSubdomainForAPI(request)
    
    if (!subdomain) {
      return NextResponse.json({ error: "Subdomain required" }, { status: 400 })
    }

    const body = await request.json()
    const { sessionId, allSessions } = body

    // Get the token from cookies or Authorization header
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('student_token')?.value

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as any
    
    if (!decoded.studentId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Get the agency
    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    // Get the student
    const student = await db.student.findFirst({
      where: {
        id: decoded.studentId,
        agencyId: agency.id
      }
    })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    let clearedSessions = 0

    if (allSessions) {
      // Clear all sessions for this student
      await db.student.update({
        where: { id: student.id },
        data: {
          currentSessionId: null,
          trustedDevices: null
        }
      })
      clearedSessions = 1 // Representing all sessions

      // Log the session cleanup
      await db.activityLog.create({
        data: {
          agencyId: agency.id,
          userId: null,
          action: "ALL_SESSIONS_CLEARED",
          entityType: "Student",
          entityId: student.id,
          changes: JSON.stringify({
            clearedBy: "student",
            clearedAt: new Date().toISOString(),
            reason: "user_request"
          }),
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      })
    } else if (sessionId) {
      // Clear specific session
      if (student.currentSessionId === sessionId) {
        await db.student.update({
          where: { id: student.id },
          data: {
            currentSessionId: null
          }
        })
        clearedSessions = 1

        // Remove from trusted devices if it exists
        if (student.trustedDevices) {
          try {
            const trustedDevices = JSON.parse(student.trustedDevices)
            const updatedDevices = trustedDevices.filter((device: any) => device.sessionId !== sessionId)
            await db.student.update({
              where: { id: student.id },
              data: {
                trustedDevices: JSON.stringify(updatedDevices)
              }
            })
          } catch (error) {
            console.error("Error updating trusted devices:", error)
          }
        }

        // Log the session termination
        await db.activityLog.create({
          data: {
            agencyId: agency.id,
            userId: null,
            action: "SESSION_TERMINATED",
            entityType: "Student",
            entityId: student.id,
            changes: JSON.stringify({
              terminatedSession: sessionId,
              terminatedBy: "student",
              terminatedAt: new Date().toISOString()
            }),
            ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cleared ${clearedSessions} session(s) successfully`,
      clearedSessions
    })

  } catch (error) {
    console.error("Error in sessions DELETE API:", error)
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    return NextResponse.json({ 
      error: "Internal server error",
      details: error.message 
    }, { status: 500 })
  }
}