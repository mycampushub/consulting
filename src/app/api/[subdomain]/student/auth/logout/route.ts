import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSubdomainForAPI } from "@/lib/utils"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    const subdomain = getSubdomainForAPI(request)
    
    if (!subdomain) {
      return NextResponse.json({ error: "Subdomain required" }, { status: 400 })
    }

    // Get the token from cookies or Authorization header
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('student_token')?.value

    if (token) {
      try {
        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET) as any
        
        if (decoded.studentId) {
          // Get the agency
          const agency = await db.agency.findUnique({
            where: { subdomain }
          })

          if (agency) {
            // Clear session data from database
            await db.student.updateMany({
              where: {
                id: decoded.studentId,
                agencyId: agency.id,
                currentSessionId: decoded.sessionId || null
              },
              data: {
                currentSessionId: null
              }
            })

            // Log the logout activity
            await db.activityLog.create({
              data: {
                agencyId: agency.id,
                userId: null,
                action: "STUDENT_LOGOUT",
                entityType: "Student",
                entityId: decoded.studentId,
                changes: JSON.stringify({
                  logoutTime: new Date().toISOString(),
                  sessionId: decoded.sessionId || null,
                  method: "api_call"
                }),
                ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
                userAgent: request.headers.get('user-agent') || 'unknown'
              }
            })
          }
        }
      } catch (error) {
        // Token is invalid or expired, but we still want to clear cookies
        console.log("Invalid token during logout:", error)
      }
    }

    // Create response that clears cookies
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully"
    })

    // Clear the authentication cookie
    response.cookies.set('student_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      expires: new Date(0)
    })

    // Clear any other auth-related cookies
    response.cookies.set('auth_complete', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      expires: new Date(0)
    })

    response.cookies.set('two_factor_verified', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      expires: new Date(0)
    })

    return response

  } catch (error) {
    console.error("Error in logout API:", error)
    
    // Even if there's an error, we want to clear the cookies
    const response = NextResponse.json({ 
      error: "Logout completed with warnings",
      details: error.message 
    }, { status: 500 })

    // Clear cookies even on error
    response.cookies.set('student_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      expires: new Date(0)
    })

    return response
  }
}