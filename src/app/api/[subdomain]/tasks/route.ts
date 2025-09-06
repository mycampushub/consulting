import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSubdomainForAPI } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const subdomain = getSubdomainForAPI(request)
    
    console.log('Tasks API - Subdomain:', subdomain)
    
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
          },
          dependency: {
            select: {
              id: true,
              title: true,
              status: true
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

    return NextResponse.json({
      tasks,
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

export async function POST(request: NextRequest) {
  try {
    const subdomain = getSubdomainForAPI(request)
    
    console.log('Tasks API POST - Subdomain:', subdomain)
    
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
    const {
      title,
      description,
      type,
      category,
      assignedTo,
      studentId,
      leadId,
      applicationId,
      universityId,
      dueDate,
      dueTime,
      reminderAt,
      estimatedHours,
      priority,
      status,
      dependsOn,
      tags,
      metadata,
      customFields,
      templateId,
      assignmentRuleId
    } = body

    // Validate required fields
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // Validate foreign key references if provided
    if (assignedTo) {
      const user = await db.user.findUnique({
        where: { id: assignedTo }
      })
      if (!user) {
        return NextResponse.json({ error: 'Assigned user not found' }, { status: 404 })
      }
    }

    if (studentId) {
      const student = await db.student.findUnique({
        where: { id: studentId }
      })
      if (!student) {
        return NextResponse.json({ error: 'Student not found' }, { status: 404 })
      }
    }

    if (leadId) {
      const lead = await db.lead.findUnique({
        where: { id: leadId }
      })
      if (!lead) {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
      }
    }

    if (applicationId) {
      const application = await db.application.findUnique({
        where: { id: applicationId }
      })
      if (!application) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 })
      }
    }

    if (universityId) {
      const university = await db.university.findUnique({
        where: { id: universityId }
      })
      if (!university) {
        return NextResponse.json({ error: 'University not found' }, { status: 404 })
      }
    }

    if (dependsOn) {
      const dependentTask = await db.task.findUnique({
        where: { id: dependsOn }
      })
      if (!dependentTask) {
        return NextResponse.json({ error: 'Dependent task not found' }, { status: 404 })
      }
    }

    if (templateId) {
      const template = await db.taskTemplate.findUnique({
        where: { id: templateId }
      })
      if (!template) {
        return NextResponse.json({ error: 'Task template not found' }, { status: 404 })
      }
    }

    if (assignmentRuleId) {
      const assignmentRule = await db.assignmentRule.findUnique({
        where: { id: assignmentRuleId }
      })
      if (!assignmentRule) {
        return NextResponse.json({ error: 'Assignment rule not found' }, { status: 404 })
      }
    }

    // Create task
    const task = await db.task.create({
      data: {
        agencyId: agency.id,
        title,
        description,
        type: type || 'GENERAL',
        category: category || 'GENERAL',
        assignedTo,
        studentId,
        leadId,
        applicationId,
        universityId,
        dueDate: dueDate ? new Date(dueDate) : null,
        dueTime,
        reminderAt: reminderAt ? new Date(reminderAt) : null,
        estimatedHours,
        priority: priority || 'MEDIUM',
        status: status || 'PENDING',
        dependsOn,
        tags: tags ? JSON.stringify(tags) : null,
        metadata: metadata ? JSON.stringify(metadata) : null,
        customFields: customFields ? JSON.stringify(customFields) : null,
        templateId,
        assignmentRuleId
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
        },
        dependency: {
          select: {
            id: true,
            title: true,
            status: true
          }
        },
        template: {
          select: {
            id: true,
            name: true
          }
        },
        assignmentRule: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      }
    })

    // Create assignment record if task is assigned
    if (assignedTo) {
      await db.taskAssignment.create({
        data: {
          agencyId: agency.id,
          taskId: task.id,
          userId: assignedTo,
          assignedBy: body.assignedBy || assignedTo, // Default to assigned user if not specified
          assignmentType: 'MANUAL',
          status: 'ACTIVE'
        }
      })
    }

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}