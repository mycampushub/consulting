import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSubdomainForAPI } from "@/lib/utils"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    const subdomain = getSubdomainForAPI(request)
    
    if (!subdomain) {
      return NextResponse.json({ error: "Subdomain required" }, { status: 400 })
    }

    const body = await request.json()
    const { email, password } = body

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
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Check if student has a password (for demo purposes, we'll allow login without password for now)
    if (student.password) {
      const isPasswordValid = await bcrypt.compare(password, student.password)
      if (!isPasswordValid) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        studentId: student.id,
        email: student.email,
        agencyId: agency.id
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Create response with token in cookie
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
      token
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
    return NextResponse.json({ 
      error: "Internal server error",
      details: error.message 
    }, { status: 500 })
  }
}