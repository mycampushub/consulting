import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSubdomainForAPI } from "@/lib/utils"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    const subdomain = getSubdomainForAPI(request)
    
    if (!subdomain) {
      return NextResponse.json({ error: "Subdomain required" }, { status: 400 })
    }

    const body = await request.json()
    const { code, sessionId } = body

    if (!code || !sessionId) {
      return NextResponse.json({ error: "Code and session ID are required" }, { status: 400 })
    }

    // Get the agency
    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    // Find the student by session ID
    const student = await db.student.findFirst({
      where: {
        currentSessionId: sessionId,
        agencyId: agency.id
      }
    })

    if (!student) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // Check if account is locked
    if (student.accountLocked && student.lockedUntil && new Date() < student.lockedUntil) {
      return NextResponse.json({ 
        error: "Account temporarily locked. Please try again later." 
      }, { status: 403 })
    }

    // Verify 2FA code
    let isCodeValid = false
    
    if (student.twoFactorMethod === "EMAIL" || student.twoFactorMethod === "SMS") {
      // For demo purposes, accept any 6-digit code
      // In production, you would verify against stored codes or use a proper 2FA service
      isCodeValid = code.length === 6 && /^\d{6}$/.test(code)
    } else if (student.twoFactorMethod === "AUTHENTICATOR") {
      // For TOTP, you would use a library like 'otplib' to verify the code
      // For demo purposes, we'll accept a simple validation
      isCodeValid = code.length === 6 && /^\d{6}$/.test(code)
    }

    if (!isCodeValid) {
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

      return NextResponse.json({ error: "Invalid verification code" }, { status: 401 })
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
    const token = jwt.sign(
      { 
        studentId: student.id,
        email: student.email,
        agencyId: agency.id,
        twoFactorVerified: true
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Create response with token
    const response = NextResponse.json({
      success: true,
      message: "2FA verification successful",
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        status: student.status
      },
      token,
      security: {
        twoFactorVerified: true,
        method: student.twoFactorMethod
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
    console.error("Error in 2FA verification API:", error)
    return NextResponse.json({ 
      error: "Internal server error",
      details: error.message 
    }, { status: 500 })
  }
}