import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSubdomainForAPI } from "@/lib/utils"

export async function GET(request: NextRequest) {
  try {
    console.log("Student portal API called")
    
    const subdomain = getSubdomainForAPI(request)
    console.log("Subdomain:", subdomain)
    
    if (!subdomain) {
      console.log("No subdomain provided")
      return NextResponse.json({ error: "Subdomain required" }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")
    console.log("Student ID:", studentId)

    if (!studentId) {
      console.log("No student ID provided")
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 })
    }

    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      console.log("Agency not found:", subdomain)
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    console.log("Agency found:", agency.name)

    // Get student data
    const student = await db.student.findFirst({
      where: {
        id: studentId,
        agencyId: agency.id
      }
    })

    if (!student) {
      console.log("Student not found:", studentId)
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    console.log("Student found:", student.firstName, student.lastName)

    return NextResponse.json({
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        phone: student.phone,
        status: student.status,
        currentEducation: student.currentEducation,
        nationality: student.nationality,
        dateOfBirth: student.dateOfBirth
      },
      stats: {
        totalApplications: 0,
        activeApplications: 0,
        completedApplications: 0
      },
      applicationProgress: [],
      recentActivity: [],
      requiredDocuments: [],
      upcomingAppointments: [],
      pendingTasks: [],
      unreadNotifications: []
    })

  } catch (error) {
    console.error("Error in student portal API:", error)
    return NextResponse.json({ 
      error: "Internal server error",
      details: error.message 
    }, { status: 500 })
  }
}