import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSubdomainForAPI } from "@/lib/utils"
import jwt from "jsonwebtoken"

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

    // Get student data with full details
    const student = await db.student.findFirst({
      where: {
        id: studentId,
        agencyId: agency.id
      },
      include: {
        applications: {
          include: {
            university: true,
            campus: true,
            subject: true
          }
        },
        documents: true,
        notifications: {
          orderBy: { createdAt: "desc" },
          take: 10
        },
        tasks: {
          include: {
            assignedToUser: true
          },
          orderBy: { createdAt: "desc" },
          take: 10
        },
        appointments: {
          orderBy: { scheduledAt: "desc" },
          take: 5
        }
      }
    })

    if (!student) {
      console.log("Student not found:", studentId)
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    console.log("Student found:", student.firstName, student.lastName)

    // Calculate statistics
    const totalApplications = student.applications.length
    const activeApplications = student.applications.filter(app => 
      ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW'].includes(app.status)
    ).length
    const completedApplications = student.applications.filter(app => 
      ['APPROVED', 'REJECTED', 'WITHDRAWN'].includes(app.status)
    ).length

    const totalDocuments = student.documents.length
    const approvedDocuments = student.documents.filter(doc => doc.status === 'APPROVED').length
    const pendingDocuments = student.documents.filter(doc => 
      ['UPLOADED', 'PENDING', 'REVIEWED'].includes(doc.status)
    ).length

    const unreadNotifications = student.notifications.filter(notif => !notif.isRead).length
    const pendingTasks = student.tasks.filter(task => 
      ['TODO', 'IN_PROGRESS'].includes(task.status)
    ).length

    const upcomingAppointments = student.appointments.filter(apt => 
      new Date(apt.scheduledAt) > new Date() && apt.status === 'SCHEDULED'
    ).length

    // Calculate profile completion percentage
    const profileFields = [
      student.firstName, student.lastName, student.email, student.phone,
      student.nationality, student.dateOfBirth, student.currentEducation,
      student.gpa, student.budget
    ]
    const completedProfileFields = profileFields.filter(field => field !== null && field !== undefined && field !== '').length
    const profileCompletion = Math.round((completedProfileFields / profileFields.length) * 100)

    // Format application progress
    const applicationProgress = student.applications.map(app => ({
      id: app.id,
      university: app.university?.name || 'Unknown',
      program: app.program,
      intake: app.intake,
      status: app.status,
      progress: calculateApplicationProgress(app),
      documentsRequired: 8, // This could be dynamic based on application requirements
      documentsSubmitted: student.documents.filter(doc => 
        doc.applicationId === app.id && ['UPLOADED', 'PENDING', 'REVIEWED', 'APPROVED'].includes(doc.status)
      ).length,
      submittedAt: app.submittedAt,
      createdAt: app.createdAt
    }))

    // Format recent activity
    const recentActivity = [
      ...student.applications.map(app => ({
        id: `app-${app.id}`,
        type: 'application',
        action: `Application ${app.status.toLowerCase().replace('_', ' ')}`,
        description: `${app.university?.name || 'Unknown'} - ${app.program}`,
        timestamp: app.updatedAt,
        status: app.status
      })),
      ...student.documents.map(doc => ({
        id: `doc-${doc.id}`,
        type: 'document',
        action: `Document ${doc.status.toLowerCase()}`,
        description: doc.name,
        timestamp: doc.updatedAt || doc.createdAt,
        status: doc.status
      })),
      ...student.tasks.map(task => ({
        id: `task-${task.id}`,
        type: 'task',
        action: `Task ${task.status.toLowerCase().replace('_', ' ')}`,
        description: task.title,
        timestamp: task.updatedAt || task.createdAt,
        status: task.status
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10)

    // Format required documents
    const requiredDocuments = [
      { id: 'passport', name: 'Passport Copy', type: 'Identification', required: true, status: 'PENDING' },
      { id: 'transcript', name: 'Academic Transcript', type: 'Academic', required: true, status: 'PENDING' },
      { id: 'english', name: 'English Proficiency Certificate', type: 'Language', required: true, status: 'PENDING' },
      { id: 'statement', name: 'Personal Statement', type: 'Application', required: true, status: 'PENDING' },
      { id: 'recommendation', name: 'Letters of Recommendation', type: 'Academic', required: false, status: 'PENDING' },
      { id: 'financial', name: 'Financial Documents', type: 'Financial', required: true, status: 'PENDING' }
    ].map(reqDoc => {
      const existingDoc = student.documents.find(doc => 
        doc.name.toLowerCase().includes(reqDoc.name.toLowerCase().split(' ')[0])
      )
      return existingDoc ? { ...reqDoc, ...existingDoc } : reqDoc
    })

    // Format upcoming appointments
    const upcomingAppointmentsFormatted = student.appointments
      .filter(apt => new Date(apt.scheduledAt) > new Date() && apt.status === 'SCHEDULED')
      .map(apt => ({
        id: apt.id,
        title: apt.title,
        type: apt.type,
        scheduledAt: apt.scheduledAt,
        duration: apt.duration,
        consultant: apt.consultantName,
        location: apt.location,
        meetingLink: apt.meetingLink
      }))

    // Format pending tasks
    const pendingTasksFormatted = student.tasks
      .filter(task => ['TODO', 'IN_PROGRESS'].includes(task.status))
      .map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        priority: task.priority,
        assignedTo: task.assignedToUser?.name || 'Unassigned',
        status: task.status
      }))

    // Format unread notifications
    const unreadNotificationsFormatted = student.notifications
      .filter(notif => !notif.isRead)
      .map(notif => ({
        id: notif.id,
        title: notif.title,
        message: notif.message,
        type: notif.type,
        createdAt: notif.createdAt,
        priority: notif.priority
      }))

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
        dateOfBirth: student.dateOfBirth,
        gpa: student.gpa,
        budget: student.budget,
        preferredCountries: student.preferredCountries ? JSON.parse(student.preferredCountries) : [],
        preferredCourses: student.preferredCourses ? JSON.parse(student.preferredCourses) : []
      },
      stats: {
        totalApplications,
        activeApplications,
        completedApplications,
        totalDocuments,
        approvedDocuments,
        pendingDocuments,
        profileCompletion,
        unreadNotifications,
        pendingTasks,
        upcomingAppointments
      },
      applicationProgress,
      recentActivity,
      requiredDocuments,
      upcomingAppointments: upcomingAppointmentsFormatted,
      pendingTasks: pendingTasksFormatted,
      unreadNotifications: unreadNotificationsFormatted
    })

  } catch (error) {
    console.error("Error in student portal API:", error)
    return NextResponse.json({ 
      error: "Internal server error",
      details: error.message 
    }, { status: 500 })
  }
}

function calculateApplicationProgress(application: any): number {
  // Simple progress calculation based on application status
  const statusProgress = {
    'DRAFT': 10,
    'SUBMITTED': 30,
    'UNDER_REVIEW': 60,
    'APPROVED': 100,
    'REJECTED': 100,
    'WITHDRAWN': 100
  }
  return statusProgress[application.status] || 0
}