import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSubdomainForAPI } from "@/lib/utils"
import jwt from "jsonwebtoken"
import { v4 as uuidv4 } from "uuid"
import bcrypt from "bcryptjs"

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
        twoFactorEnabled: true,
        twoFactorMethod: true,
        twoFactorSecret: true,
        twoFactorBackupCodes: true,
        fingerprintEnabled: true,
        fingerprintRegisteredAt: true,
        faceRecognitionEnabled: true,
        faceRegisteredAt: true
      }
    })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      twoFactor: {
        enabled: student.twoFactorEnabled,
        method: student.twoFactorMethod,
        hasSecret: !!student.twoFactorSecret,
        backupCodesCount: student.twoFactorBackupCodes ? JSON.parse(student.twoFactorBackupCodes).length : 0
      },
      biometric: {
        fingerprint: {
          enabled: student.fingerprintEnabled,
          registered: !!student.fingerprintRegisteredAt
        },
        faceRecognition: {
          enabled: student.faceRecognitionEnabled,
          registered: !!student.faceRegisteredAt
        }
      }
    })

  } catch (error) {
    console.error("Error in 2FA settings GET API:", error)
    
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
    const { action, method, password } = body

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 })
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
      }
    })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    if (action === "enable_2fa") {
      if (!method || !["EMAIL", "SMS", "AUTHENTICATOR"].includes(method)) {
        return NextResponse.json({ error: "Valid 2FA method is required" }, { status: 400 })
      }

      // Verify password for security
      if (student.password) {
        const isPasswordValid = await bcrypt.compare(password, student.password)
        if (!isPasswordValid) {
          return NextResponse.json({ error: "Invalid password" }, { status: 401 })
        }
      }

      // Generate backup codes
      const backupCodes = Array.from({ length: 10 }, () => 
        Math.floor(100000 + Math.random() * 900000).toString()
      )

      // Generate secret for authenticator
      let secret = null
      if (method === "AUTHENTICATOR") {
        secret = uuidv4().replace(/-/g, '').substring(0, 32)
      }

      await db.student.update({
        where: { id: student.id },
        data: {
          twoFactorEnabled: true,
          twoFactorMethod: method,
          twoFactorSecret: secret,
          twoFactorBackupCodes: JSON.stringify(backupCodes)
        }
      })

      return NextResponse.json({
        success: true,
        message: "2FA enabled successfully",
        method,
        backupCodes,
        secret // For QR code generation in authenticator apps
      })

    } else if (action === "disable_2fa") {
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
          twoFactorEnabled: false,
          twoFactorMethod: null,
          twoFactorSecret: null,
          twoFactorBackupCodes: null
        }
      })

      return NextResponse.json({
        success: true,
        message: "2FA disabled successfully"
      })

    } else if (action === "regenerate_backup_codes") {
      // Verify password for security
      if (student.password) {
        const isPasswordValid = await bcrypt.compare(password, student.password)
        if (!isPasswordValid) {
          return NextResponse.json({ error: "Invalid password" }, { status: 401 })
        }
      }

      const backupCodes = Array.from({ length: 10 }, () => 
        Math.floor(100000 + Math.random() * 900000).toString()
      )

      await db.student.update({
        where: { id: student.id },
        data: {
          twoFactorBackupCodes: JSON.stringify(backupCodes)
        }
      })

      return NextResponse.json({
        success: true,
        message: "Backup codes regenerated successfully",
        backupCodes
      })

    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

  } catch (error) {
    console.error("Error in 2FA settings POST API:", error)
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    return NextResponse.json({ 
      error: "Internal server error",
      details: error.message 
    }, { status: 500 })
  }
}