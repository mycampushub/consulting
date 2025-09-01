import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSubdomain } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const subdomain = getSubdomain(request.headers.get('host') || '')
    if (!subdomain) {
      return NextResponse.json({ error: 'Subdomain required' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const assignedTo = searchParams.get('assignedTo')
    const category = searchParams.get('category')
    const type = searchParams.get('type')
    const search = searchParams.get('search')

    const offset = (page - 1) * limit

    // Build where clause
    const where: any = {
      agency: {
        subdomain
      }
    }

    if (status) where.status = status
    if (priority) where.priority = priority
    if (assignedTo) where.assignedTo = assignedTo
    if (category) where.category = category
    if (type) where.type = type
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
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
          taskComments: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  avatar: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          },
          taskTimeLogs: {
            orderBy: {
              createdAt: 'desc'
            }
          },
          taskAttachments: {
            orderBy: {
              createdAt: 'desc'
            }
          },
          taskAssignments: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              },
              assigner: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
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
        },
        orderBy: [
          { priority: 'desc' },
          { dueDate: 'asc' },
          { createdAt: 'desc' }
        ],
        skip: offset,
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const subdomain = getSubdomain(request.headers.get('host') || '')
    if (!subdomain) {
      return NextResponse.json({ error: 'Subdomain required' }, { status: 400 })
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

    // Get agency
    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    // Check if dependent task exists
    if (dependsOn) {
      const dependentTask = await db.task.findUnique({
        where: { id: dependsOn }
      })
      if (!dependentTask) {
        return NextResponse.json({ error: 'Dependent task not found' }, { status: 404 })
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}