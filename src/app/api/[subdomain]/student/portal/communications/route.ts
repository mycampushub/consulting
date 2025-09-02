import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSubdomainForAPI } from "@/lib/utils"
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest) {
  try {
    const subdomain = getSubdomainForAPI(request)
    
    if (!subdomain) {
      return NextResponse.json({ error: "Subdomain required" }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")

    if (!studentId) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 })
    }

    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    // Get student's assigned consultant
    const student = await db.student.findUnique({
      where: { id: studentId, agencyId: agency.id },
      include: {
        assignedToUser: true
      }
    })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Get consultant info
    const consultantInfo = student.assignedToUser ? {
      id: student.assignedToUser.id,
      name: student.assignedToUser.name,
      email: student.assignedToUser.email,
      phone: student.assignedToUser.phone,
      title: student.assignedToUser.title,
      department: student.assignedToUser.department,
      availability: getConsultantAvailability(),
      responseTime: 'Usually within 24 hours',
      languages: ['English', 'Spanish'],
      expertise: ['University Applications', 'Visa Processing', 'Document Preparation']
    } : null

    // Sample messages for demo
    const sampleMessages = [
      {
        id: '1',
        content: 'Welcome to our agency! I\'m here to help you with your application process.',
        sender: {
          id: consultantInfo?.id || '1',
          name: consultantInfo?.name || 'Consultant',
          type: 'CONSULTANT'
        },
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        isRead: true
      },
      {
        id: '2',
        content: 'Thank you! I have some questions about the application requirements.',
        sender: {
          id: studentId,
          name: `${student.firstName} ${student.lastName}`,
          type: 'STUDENT'
        },
        createdAt: new Date(Date.now() - 43200000).toISOString(),
        isRead: true
      }
    ]

    return NextResponse.json({
      conversations: [{
        id: '1',
        participant1: { id: studentId, name: `${student.firstName} ${student.lastName}`, type: 'STUDENT' },
        participant2: consultantInfo ? { id: consultantInfo.id, name: consultantInfo.name, type: 'CONSULTANT' } : null,
        messages: sampleMessages,
        lastMessage: sampleMessages[sampleMessages.length - 1],
        unreadCount: 0,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 43200000).toISOString()
      }],
      consultantInfo,
      statistics: {
        totalConversations: 1,
        totalMessages: sampleMessages.length,
        unreadMessages: 0,
        averageResponseTime: '2 hours'
      },
      quickActions: [
        {
          id: 'schedule_call',
          title: 'Schedule a Call',
          description: 'Book a consultation call with your advisor',
          icon: 'Phone',
          action: 'schedule'
        },
        {
          id: 'request_meeting',
          title: 'Request Meeting',
          description: 'Schedule an in-person or virtual meeting',
          icon: 'Calendar',
          action: 'meeting'
        },
        {
          id: 'urgent_contact',
          title: 'Urgent Contact',
          description: 'Get immediate assistance for urgent matters',
          icon: 'AlertTriangle',
          action: 'urgent'
        }
      ]
    })

  } catch (error) {
    console.error("Error fetching student communications:", error)
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
    const { studentId, recipientId, content, type = 'TEXT' } = body

    if (!studentId || !recipientId || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    // Create a simple message record (in a real implementation, this would be stored in the database)
    const message = {
      id: Date.now().toString(),
      content,
      sender: {
        id: studentId,
        name: 'Student',
        type: 'STUDENT'
      },
      createdAt: new Date().toISOString(),
      isRead: false
    }

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
      message
    })

  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ 
      error: "Internal server error",
      details: error.message 
    }, { status: 500 })
  }
}

function getConsultantAvailability(): string {
  const now = new Date()
  const hour = now.getHours()
  
  if (hour >= 9 && hour <= 17) {
    return 'Available'
  } else if (hour >= 8 && hour <= 18) {
    return 'Limited Availability'
  } else {
    return 'Offline'
  }
}