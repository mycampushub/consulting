import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSubdomainForAPI } from '@/lib/utils'
import { z } from 'zod'

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.enum(['GENERAL', 'FOLLOW_UP', 'APPLICATION', 'VISA', 'PAYMENT', 'DOCUMENTATION', 'MEETING', 'CALL', 'EMAIL']).optional(),
  category: z.enum(['GENERAL', 'STUDENT', 'APPLICATION', 'UNIVERSITY', 'INTERNAL']).optional(),
  assignedTo: z.string().optional(),
  studentId: z.string().optional(),
  leadId: z.string().optional(),
  applicationId: z.string().optional(),
  universityId: z.string().optional(),
  dueDate: z.string().optional(),
  dueTime: z.string().optional(),
  reminderAt: z.string().optional(),
  estimatedHours: z.number().min(0).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  tags: z.array(z.string()).optional(),
})

// Get all tasks for the agency
export async function GET(request: NextRequest) {
  try {
    const subdomain = getSubdomainForAPI(request)
    
    if (!subdomain) {
      return NextResponse.json({ error: 'Subdomain required' }, { status: 400 })
    }

    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")
    const assignedTo = searchParams.get("assignedTo")
    const studentId = searchParams.get("studentId")
    const priority = searchParams.get("priority")
    const type = searchParams.get("type")

    const where: any = {
      agencyId: agency.id,
      ...(status && { status }),
      ...(assignedTo && { assignedTo }),
      ...(studentId && { studentId }),
      ...(priority && { priority }),
      ...(type && { type })
    }

    const [tasks, total] = await Promise.all([
      db.task.findMany({
        where,
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          },
          assigner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          lead: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          application: {
            select: {
              id: true,
              program: true,
              status: true
            }
          },
          university: {
            select: {
              id: true,
              name: true,
              country: true
            }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { dueDate: 'asc' },
          { createdAt: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      db.task.count({ where })
    ])

    // Parse JSON fields for response
    const processedTasks = tasks.map(task => ({
      ...task,
      tags: task.tags ? JSON.parse(task.tags) : []
    }))

    return NextResponse.json({
      tasks: processedTasks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}

// Create a new task
export async function POST(request: NextRequest) {
  try {
    const subdomain = getSubdomainForAPI(request)
    
    if (!subdomain) {
      return NextResponse.json({ error: 'Subdomain required' }, { status: 400 })
    }

    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = taskSchema.parse(body)

    // Validate foreign key references if provided
    if (validatedData.assignedTo) {
      const user = await db.user.findUnique({
        where: { id: validatedData.assignedTo }
      })
      if (!user) {
        return NextResponse.json({ error: 'Assigned user not found' }, { status: 404 })
      }
    }

    if (validatedData.studentId) {
      const student = await db.student.findUnique({
        where: { id: validatedData.studentId }
      })
      if (!student) {
        return NextResponse.json({ error: 'Student not found' }, { status: 404 })
      }
    }

    if (validatedData.leadId) {
      const lead = await db.lead.findUnique({
        where: { id: validatedData.leadId }
      })
      if (!lead) {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
      }
    }

    if (validatedData.applicationId) {
      const application = await db.application.findUnique({
        where: { id: validatedData.applicationId }
      })
      if (!application) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 })
      }
    }

    if (validatedData.universityId) {
      const university = await db.university.findUnique({
        where: { id: validatedData.universityId }
      })
      if (!university) {
        return NextResponse.json({ error: 'University not found' }, { status: 404 })
      }
    }

    // Create task
    const task = await db.task.create({
      data: {
        agencyId: agency.id,
        title: validatedData.title,
        description: validatedData.description,
        type: validatedData.type || 'GENERAL',
        category: validatedData.category || 'GENERAL',
        assignedTo: validatedData.assignedTo,
        studentId: validatedData.studentId,
        leadId: validatedData.leadId,
        applicationId: validatedData.applicationId,
        universityId: validatedData.universityId,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        dueTime: validatedData.dueTime,
        reminderAt: validatedData.reminderAt ? new Date(validatedData.reminderAt) : null,
        estimatedHours: validatedData.estimatedHours,
        priority: validatedData.priority || 'MEDIUM',
        status: validatedData.status || 'PENDING',
        tags: validatedData.tags ? JSON.stringify(validatedData.tags) : null,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        assigner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        application: {
          select: {
            id: true,
            program: true,
            status: true
          }
        },
        university: {
          select: {
            id: true,
            name: true,
            country: true
          }
        }
      }
    })

    // Parse JSON fields for response
    const processedTask = {
      ...task,
      tags: task.tags ? JSON.parse(task.tags) : []
    }

    return NextResponse.json(processedTask, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}