import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSubdomainForAPI } from "@/lib/utils"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { v4 as uuidv4 } from "uuid"
import { AuthLogger } from "@/lib/auth/logger"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    const subdomain = getSubdomainForAPI(request)
    
    if (!subdomain) {
      return NextResponse.json({ error: "Subdomain required" }, { status: 400 })
    }

    const body = await request.json()
    const { email, password, deviceInfo, security } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Get the agency
    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    // Find the student by email
    const student = await db.student.findFirst({
      where: {
        email: email,
        agencyId: agency.id
      }
    })

    if (!student) {
      // Log failed login attempt
      await AuthLogger.logLoginAttempt(
        agency.id,
        "unknown",
        email,
        false,
        "password",
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        request.headers.get('user-agent') || 'unknown',
        undefined,
        "Student not found"
      )
      
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Check if account is locked
    if (student.accountLocked && student.lockedUntil && new Date() < student.lockedUntil) {
      const remainingTime = Math.ceil((student.lockedUntil.getTime() - Date.now()) / 1000)
      
      // Log failed login attempt due to locked account
      await AuthLogger.logLoginAttempt(
        agency.id,
        student.id,
        email,
        false,
        "password",
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        request.headers.get('user-agent') || 'unknown',
        undefined,
        `Account locked. Try again in ${remainingTime} seconds`
      )
      
      return NextResponse.json({ 
        error: `Account temporarily locked. Try again in ${remainingTime} seconds.` 
      }, { status: 403 })
    }

    // Check if student has a password
    if (student.password) {
      const isPasswordValid = await bcrypt.compare(password, student.password)
      if (!isPasswordValid) {
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

        // Log failed login attempt
        await AuthLogger.logLoginAttempt(
          agency.id,
          student.id,
          email,
          false,
          "password",
          request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          request.headers.get('user-agent') || 'unknown',
          undefined,
          "Invalid password"
        )

        // Log account lock event
        if (newAttempts >= 5) {
          await AuthLogger.logAccountLock(
            agency.id,
            student.id,
            "Too many failed login attempts",
            request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
            request.headers.get('user-agent') || 'unknown'
          )
        }
        
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }
    } else {
      // For demo purposes, allow login without password if not set
      // In production, you would require password setup
      if (password !== "demo123") {
        // Log failed login attempt
        await AuthLogger.logLoginAttempt(
          agency.id,
          student.id,
          email,
          false,
          "password",
          request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          request.headers.get('user-agent') || 'unknown',
          undefined,
          "Invalid credentials"
        )
        
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }
    }

    // Generate session ID
    const sessionId = uuidv4()

    // Check if 2FA is enabled
    const requiresTwoFactor = student.twoFactorEnabled && student.twoFactorMethod

    if (requiresTwoFactor) {
      // Generate 2FA code if needed
      let twoFactorCode = null
      
      if (student.twoFactorMethod === "EMAIL" || student.twoFactorMethod === "SMS") {
        twoFactorCode = Math.floor(100000 + Math.random() * 900000).toString()
        
        // Send the code based on the method
        if (student.twoFactorMethod === "EMAIL") {
          // In production, send email with the code
          console.log(`Sending 2FA code ${twoFactorCode} to email: ${student.email}`)
        } else if (student.twoFactorMethod === "SMS") {
          // In production, send SMS with the code
          console.log(`Sending 2FA code ${twoFactorCode} to phone: ${student.phone}`)
        }
      }

      // Update student with session info
      await db.student.update({
        where: { id: student.id },
        data: {
          currentSessionId: sessionId,
          loginAttempts: 0,
          accountLocked: false,
          lockedUntil: null
        }
      })

      // Log successful login (pending 2FA)
      await AuthLogger.logLoginAttempt(
        agency.id,
        student.id,
        email,
        true,
        "password",
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        request.headers.get('user-agent') || 'unknown',
        sessionId,
        undefined,
        { twoFactorRequired: true, method: student.twoFactorMethod }
      )

      // Generate temporary token for 2FA verification
      const tempToken = jwt.sign(
        { 
          studentId: student.id,
          email: student.email,
          agencyId: agency.id,
          sessionId: sessionId,
          twoFactorPending: true
        },
        JWT_SECRET,
        { expiresIn: '15m' } // Shorter expiration for 2FA pending
      )

      return NextResponse.json({
        success: true,
        message: "2FA verification required",
        security: {
          requiresTwoFactor: true,
          method: student.twoFactorMethod,
          sessionId: sessionId
        },
        token: tempToken,
        student: {
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          status: student.status
        }
      })
    }

    // If no 2FA, complete the login
    await db.student.update({
      where: { id: student.id },
      data: {
        currentSessionId: sessionId,
        loginAttempts: 0,
        accountLocked: false,
        lockedUntil: null,
        lastLoginAt: new Date()
      }
    })

    // Log successful login
    await AuthLogger.logLoginAttempt(
      agency.id,
      student.id,
      email,
      true,
      "password",
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      request.headers.get('user-agent') || 'unknown',
      sessionId,
      undefined,
      { twoFactorRequired: false }
    )

    // Generate JWT token
    const token = jwt.sign(
      { 
        studentId: student.id,
        email: student.email,
        agencyId: agency.id,
        twoFactorVerified: false
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Create response with token
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        status: student.status
      },
      token,
      sessionId: sessionId,
      security: {
        requiresTwoFactor: false,
        twoFactorVerified: false,
        biometricAvailable: {
          fingerprint: student.fingerprintEnabled,
          faceRecognition: student.faceRecognitionEnabled
        }
      }
    })

    // Set HTTP-only cookie with the token
    response.cookies.set('student_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return response

  } catch (error) {
    console.error("Error in student login API:", error)
    
    // Log unexpected error
    try {
      const agency = await db.agency.findUnique({
        where: { subdomain: getSubdomainForAPI(request) }
      })
      
      if (agency) {
        await AuthLogger.logSecurityEvent(
          agency.id,
          "LOGIN_SYSTEM_ERROR",
          {
            error: error.message,
            stack: error.stack
          },
          request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          request.headers.get('user-agent') || 'unknown'
        )
      }
    } catch (logError) {
      console.error("Failed to log login error:", logError)
    }
    
    return NextResponse.json({ 
      error: "Internal server error",
      details: error.message 
    }, { status: 500 })
  }
}