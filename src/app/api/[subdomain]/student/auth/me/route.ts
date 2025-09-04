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

    // Get the student with full details
    const student = await db.student.findFirst({
      where: {
        id: decoded.studentId,
        agencyId: agency.id
      },
      include: {
        applications: {
          include: {
            university: true,
            campus: true,
            subject: true
          },
          take: 5,
          orderBy: { updatedAt: "desc" }
        },
        documents: {
          take: 10,
          orderBy: { createdAt: "desc" }
        },
        invoices: {
          take: 5,
          orderBy: { createdAt: "desc" }
        },
        assignedToUser: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            title: true,
            department: true
          }
        }
      }
    })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Calculate profile completion
    const profileFields = [
      student.firstName, student.lastName, student.email, student.phone,
      student.nationality, student.dateOfBirth, student.currentEducation,
      student.gpa, student.budget
    ]
    const completedProfileFields = profileFields.filter(field => field !== null && field !== undefined && field !== '').length
    const profileCompletion = Math.round((completedProfileFields / profileFields.length) * 100)

    // Format the response
    const formattedStudent = {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone,
      status: student.status,
      currentEducation: student.currentEducation,
      gpa: student.gpa,
      nationality: student.nationality,
      dateOfBirth: student.dateOfBirth,
      budget: student.budget,
      preferredCountries: student.preferredCountries ? JSON.parse(student.preferredCountries) : [],
      preferredCourses: student.preferredCourses ? JSON.parse(student.preferredCourses) : [],
      profileCompletion,
      assignedTo: student.assignedToUser,
      stats: {
        totalApplications: student.applications.length,
        activeApplications: student.applications.filter(app => 
          ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS'].includes(app.status)
        ).length,
        totalDocuments: student.documents.length,
        approvedDocuments: student.documents.filter(doc => doc.status === 'APPROVED').length,
        totalInvoices: student.invoices.length,
        paidInvoices: student.invoices.filter(inv => inv.status === 'PAID').length
      }
    }

    return NextResponse.json({
      student: formattedStudent,
      success: true
    })

  } catch (error) {
    console.error("Error in student auth API:", error)
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    return NextResponse.json({ 
      error: "Internal server error",
      details: error.message 
    }, { status: 500 })
  }
}