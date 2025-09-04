import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSubdomainForAPI } from "@/lib/utils"
import { z } from "zod"
import bcrypt from "bcryptjs"

const studentRegistrationSchema = z.object({
  personalInfo: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Valid email is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    phone: z.string().optional(),
    dateOfBirth: z.string().optional(),
    nationality: z.string().optional(),
  }),
  academicInfo: z.object({
    currentEducation: z.string().min(1, "Current education is required"),
    gpa: z.string().optional(),
    institution: z.string().min(1, "Institution is required"),
    graduationYear: z.string().optional(),
  }),
  preferences: z.object({
    preferredCountries: z.array(z.string()),
    preferredCourses: z.array(z.string()),
    budget: z.string().optional(),
    intake: z.string().optional(),
  }),
  terms: z.object({
    acceptTerms: z.boolean().refine(val => val === true, "You must accept the terms"),
    acceptPrivacy: z.boolean().refine(val => val === true, "You must accept the privacy policy"),
    acceptMarketing: z.boolean().optional(),
  })
})

export async function POST(request: NextRequest) {
  try {
    const subdomain = getSubdomainForAPI(request)
    if (!subdomain) {
      return NextResponse.json({ error: "Subdomain required" }, { status: 400 })
    }

    const body = await request.json()
    const validatedData = studentRegistrationSchema.parse(body)

    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    // Check if email already exists
    const existingStudent = await db.student.findFirst({
      where: {
        email: validatedData.personalInfo.email,
        agencyId: agency.id
      }
    })

    if (existingStudent) {
      return NextResponse.json({ error: "Student with this email already exists" }, { status: 400 })
    }

    // Check if user account already exists
    const existingUser = await db.user.findFirst({
      where: {
        email: validatedData.personalInfo.email,
        agencyId: agency.id
      }
    })

    if (existingUser) {
      return NextResponse.json({ error: "User account with this email already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.personalInfo.password, 12)

    // Create student record
    const student = await db.student.create({
      data: {
        agencyId: agency.id,
        firstName: validatedData.personalInfo.firstName,
        lastName: validatedData.personalInfo.lastName,
        email: validatedData.personalInfo.email,
        phone: validatedData.personalInfo.phone,
        dateOfBirth: validatedData.personalInfo.dateOfBirth ? new Date(validatedData.personalInfo.dateOfBirth) : null,
        nationality: validatedData.personalInfo.nationality,
        status: "PROSPECT",
        stage: "INQUIRY",
        currentEducation: validatedData.academicInfo.currentEducation,
        gpa: validatedData.academicInfo.gpa ? parseFloat(validatedData.academicInfo.gpa) : null,
        preferredCountries: JSON.stringify(validatedData.preferences.preferredCountries),
        preferredCourses: JSON.stringify(validatedData.preferences.preferredCourses),
        budget: validatedData.preferences.budget ? parseFloat(validatedData.preferences.budget) : null,
        documents: JSON.stringify([]),
        password: hashedPassword  // Add password to student record for authentication
      }
    })

    // Create user account for the student
    const user = await db.user.create({
      data: {
        email: validatedData.personalInfo.email,
        name: `${validatedData.personalInfo.firstName} ${validatedData.personalInfo.lastName}`,
        password: hashedPassword,
        role: "STUDENT",
        status: "PENDING",
        agencyId: agency.id,
        emailVerified: false
      }
    })

    // Log activity
    await db.activityLog.create({
      data: {
        agencyId: agency.id,
        userId: user.id,
        action: "STUDENT_REGISTERED",
        entityType: "Student",
        entityId: student.id,
        changes: JSON.stringify({
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          currentEducation: student.currentEducation
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      success: true,
      message: "Student registered successfully",
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        status: student.status
      },
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })

  } catch (error) {
    console.error("Student registration error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}