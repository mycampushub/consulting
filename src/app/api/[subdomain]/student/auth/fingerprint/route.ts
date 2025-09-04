import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSubdomainForAPI } from "@/lib/utils"
import jwt from "jsonwebtoken"
import { v4 as uuidv4 } from "uuid"
import bcrypt from "bcryptjs"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Simple encryption for demo purposes
// In production, use proper encryption like AES-256
function encryptData(data: string): string {
  // This is a simple obfuscation for demo purposes
  // In production, use proper encryption
  return Buffer.from(data).toString('base64')
}

function decryptData(encryptedData: string): string {
  // This is a simple deobfuscation for demo purposes
  // In production, use proper decryption
  return Buffer.from(encryptedData, 'base64').toString()
}

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
        fingerprintEnabled: true,
        fingerprintRegisteredAt: true
      }
    })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      fingerprint: {
        enabled: student.fingerprintEnabled,
        registered: !!student.fingerprintRegisteredAt,
        registeredAt: student.fingerprintRegisteredAt
      }
    })

  } catch (error) {
    console.error("Error in fingerprint GET API:", error)
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    return NextResponse.json({ 
      error: "Internal server error",
      details: error.message 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const subdomain = getSubdomainForAPI(request)
    
    if (!subdomain) {
      return NextResponse.json({ error: "Subdomain required" }, { status: 400 })
    }

    const body = await request.json()
    const { action, fingerprintData, password, sessionId } = body

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 })
    }

    if (action === "register" && !fingerprintData) {
      return NextResponse.json({ error: "Fingerprint data is required for registration" }, { status: 400 })
    }

    if (action === "verify" && !fingerprintData) {
      return NextResponse.json({ error: "Fingerprint data is required for verification" }, { status: 400 })
    }

    // Get the agency
    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    let student = null
    let token = null

    if (action === "register") {
      // Get the token from cookies or Authorization header
      const authHeader = request.headers.get('authorization')
      token = authHeader?.replace('Bearer ', '') || request.cookies.get('student_token')?.value

      if (!token) {
        return NextResponse.json({ error: "No token provided" }, { status: 401 })
      }

      // Verify the token
      const decoded = jwt.verify(token, JWT_SECRET) as any
      
      if (!decoded.studentId) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 })
      }

      // Get the student
      student = await db.student.findFirst({
        where: {
          id: decoded.studentId,
          agencyId: agency.id
        }
      })

      if (!student) {
        return NextResponse.json({ error: "Student not found" }, { status: 404 })
      }

      // Verify password for security
      if (student.password) {
        const isPasswordValid = await bcrypt.compare(password, student.password)
        if (!isPasswordValid) {
          return NextResponse.json({ error: "Invalid password" }, { status: 401 })
        }
      }

      // Encrypt and store fingerprint data
      const encryptedFingerprintData = encryptData(fingerprintData)

      await db.student.update({
        where: { id: student.id },
        data: {
          fingerprintEnabled: true,
          fingerprintData: encryptedFingerprintData,
          fingerprintRegisteredAt: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        message: "Fingerprint registered successfully",
        registeredAt: new Date()
      })

    } else if (action === "verify") {
      // For login verification, we need to find the student by session ID or email
      if (sessionId) {
        student = await db.student.findFirst({
          where: {
            currentSessionId: sessionId,
            agencyId: agency.id
          }
        })
      } else {
        // Try to get student from token if available
        const authHeader = request.headers.get('authorization')
        token = authHeader?.replace('Bearer ', '') || request.cookies.get('student_token')?.value

        if (token) {
          const decoded = jwt.verify(token, JWT_SECRET) as any
          if (decoded.studentId) {
            student = await db.student.findFirst({
              where: {
                id: decoded.studentId,
                agencyId: agency.id
              }
            })
          }
        }
      }

      if (!student) {
        return NextResponse.json({ error: "Student not found" }, { status: 404 })
      }

      if (!student.fingerprintEnabled || !student.fingerprintData) {
        return NextResponse.json({ error: "Fingerprint not enabled for this account" }, { status: 400 })
      }

      // Check if account is locked
      if (student.accountLocked && student.lockedUntil && new Date() < student.lockedUntil) {
        return NextResponse.json({ 
          error: "Account temporarily locked. Please try again later." 
        }, { status: 403 })
      }

      // Decrypt and verify fingerprint data
      const storedFingerprintData = decryptData(student.fingerprintData)
      
      // Simple comparison for demo purposes
      // In production, use proper fingerprint matching algorithms
      const isFingerprintValid = storedFingerprintData === fingerprintData

      if (!isFingerprintValid) {
        // Increment login attempts
        const newAttempts = (student.loginAttempts || 0) + 1
        
        await db.student.update({
          where: { id: student.id },
          data: {
            loginAttempts: newAttempts,
            // Lock account after 5 failed attempts
            ...(newAttempts >= 5 && {
              accountLocked: true,
              lockedUntil: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
            })
          }
        })

        return NextResponse.json({ error: "Fingerprint verification failed" }, { status: 401 })
      }

      // Reset login attempts on success
      await db.student.update({
        where: { id: student.id },
        data: {
          loginAttempts: 0,
          accountLocked: false,
          lockedUntil: null,
          lastLoginAt: new Date()
        }
      })

      // Generate new JWT token
      const newToken = jwt.sign(
        { 
          studentId: student.id,
          email: student.email,
          agencyId: agency.id,
          fingerprintVerified: true
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      )

      // Create response with token
      const response = NextResponse.json({
        success: true,
        message: "Fingerprint verification successful",
        student: {
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          status: student.status
        },
        token: newToken,
        security: {
          fingerprintVerified: true,
          method: "FINGERPRINT"
        }
      })

      // Set HTTP-only cookie with the token
      response.cookies.set('student_token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 // 7 days
      })

      return response

    } else if (action === "disable") {
      // Get the token from cookies or Authorization header
      const authHeader = request.headers.get('authorization')
      token = authHeader?.replace('Bearer ', '') || request.cookies.get('student_token')?.value

      if (!token) {
        return NextResponse.json({ error: "No token provided" }, { status: 401 })
      }

      // Verify the token
      const decoded = jwt.verify(token, JWT_SECRET) as any
      
      if (!decoded.studentId) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 })
      }

      // Get the student
      student = await db.student.findFirst({
        where: {
          id: decoded.studentId,
          agencyId: agency.id
        }
      })

      if (!student) {
        return NextResponse.json({ error: "Student not found" }, { status: 404 })
      }

      // Verify password for security
      if (student.password) {
        const isPasswordValid = await bcrypt.compare(password, student.password)
        if (!isPasswordValid) {
          return NextResponse.json({ error: "Invalid password" }, { status: 401 })
        }
      }

      await db.student.update({
        where: { id: student.id },
        data: {
          fingerprintEnabled: false,
          fingerprintData: null,
          fingerprintRegisteredAt: null
        }
      })

      return NextResponse.json({
        success: true,
        message: "Fingerprint authentication disabled successfully"
      })

    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

  } catch (error) {
    console.error("Error in fingerprint API:", error)
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    return NextResponse.json({ 
      error: "Internal server error",
      details: error.message 
    }, { status: 500 })
  }
}