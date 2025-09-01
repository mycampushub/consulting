import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSubdomain } from '@/lib/utils'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const subdomain = getSubdomain(request.headers.get('host') || '')
    if (!subdomain) {
      return NextResponse.json({ error: 'Subdomain required' }, { status: 400 })
    }

    const task = await db.task.findFirst({
      where: {
        id: params.id,
        agency: {
          subdomain
        }
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
            email: true,
            status: true,
            stage: true
          }
        },
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            status: true
          }
        },
        application: {
          select: {
            id: true,
            program: true,
            status: true,
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        university: {
          select: {
            id: true,
            name: true,
            country: true,
            city: true
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
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
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
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        dependency: {
          select: {
            id: true,
            title: true,
            status: true,
            assignee: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        dependentTasks: {
          select: {
            id: true,
            title: true,
            status: true,
            assignee: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        template: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        assignmentRule: {
          select: {
            id: true,
            name: true,
            type: true,
            configuration: true
          }
        }
      }
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      actualHours,
      priority,
      status,
      progress,
      dependsOn,
      tags,
      metadata,
      customFields,
      startedAt,
      completedAt
    } = body

    // Get existing task
    const existingTask = await db.task.findFirst({
      where: {
        id: params.id,
        agency: {
          subdomain
        }
      }
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Check if dependent task exists
    if (dependsOn && dependsOn !== existingTask.dependsOn) {
      const dependentTask = await db.task.findUnique({
        where: { id: dependsOn }
      })
      if (!dependentTask) {
        return NextResponse.json({ error: 'Dependent task not found' }, { status: 404 })
      }
    }

    // Update task
    const updateData: any = {
      title: title !== undefined ? title : existingTask.title,
      description: description !== undefined ? description : existingTask.description,
      type: type !== undefined ? type : existingTask.type,
      category: category !== undefined ? category : existingTask.category,
      assignedTo: assignedTo !== undefined ? assignedTo : existingTask.assignedTo,
      studentId: studentId !== undefined ? studentId : existingTask.studentId,
      leadId: leadId !== undefined ? leadId : existingTask.leadId,
      applicationId: applicationId !== undefined ? applicationId : existingTask.applicationId,
      universityId: universityId !== undefined ? universityId : existingTask.universityId,
      dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : existingTask.dueDate,
      dueTime: dueTime !== undefined ? dueTime : existingTask.dueTime,
      reminderAt: reminderAt !== undefined ? (reminderAt ? new Date(reminderAt) : null) : existingTask.reminderAt,
      estimatedHours: estimatedHours !== undefined ? estimatedHours : existingTask.estimatedHours,
      actualHours: actualHours !== undefined ? actualHours : existingTask.actualHours,
      priority: priority !== undefined ? priority : existingTask.priority,
      status: status !== undefined ? status : existingTask.status,
      progress: progress !== undefined ? progress : existingTask.progress,
      dependsOn: dependsOn !== undefined ? dependsOn : existingTask.dependsOn,
      tags: tags !== undefined ? (tags ? JSON.stringify(tags) : null) : existingTask.tags,
      metadata: metadata !== undefined ? (metadata ? JSON.stringify(metadata) : null) : existingTask.metadata,
      customFields: customFields !== undefined ? (customFields ? JSON.stringify(customFields) : null) : existingTask.customFields,
      startedAt: startedAt !== undefined ? (startedAt ? new Date(startedAt) : null) : existingTask.startedAt,
      completedAt: completedAt !== undefined ? (completedAt ? new Date(completedAt) : null) : existingTask.completedAt
    }

    // Auto-set timestamps based on status
    if (status === 'IN_PROGRESS' && existingTask.status !== 'IN_PROGRESS' && !updateData.startedAt) {
      updateData.startedAt = new Date()
    }
    if (status === 'COMPLETED' && existingTask.status !== 'COMPLETED' && !updateData.completedAt) {
      updateData.completedAt = new Date()
      updateData.progress = 100
    }

    const task = await db.task.update({
      where: { id: params.id },
      data: updateData,
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

    // Handle assignment changes
    if (assignedTo !== undefined && assignedTo !== existingTask.assignedTo) {
      // Deactivate old assignment
      if (existingTask.assignedTo) {
        await db.taskAssignment.updateMany({
          where: {
            taskId: params.id,
            userId: existingTask.assignedTo,
            status: 'ACTIVE'
          },
          data: { status: 'REASSIGNED' }
        })
      }

      // Create new assignment
      if (assignedTo) {
        await db.taskAssignment.create({
          data: {
            agencyId: existingTask.agencyId,
            taskId: params.id,
            userId: assignedTo,
            assignedBy: body.assignedBy || assignedTo,
            assignmentType: 'MANUAL',
            status: 'ACTIVE'
          }
        })
      }
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const subdomain = getSubdomain(request.headers.get('host') || '')
    if (!subdomain) {
      return NextResponse.json({ error: 'Subdomain required' }, { status: 400 })
    }

    // Check if task exists and belongs to agency
    const task = await db.task.findFirst({
      where: {
        id: params.id,
        agency: {
          subdomain
        }
      }
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Check if task has dependent tasks
    const dependentTasks = await db.task.count({
      where: { dependsOn: params.id }
    })

    if (dependentTasks > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete task with dependent tasks',
        dependentCount: dependentTasks 
      }, { status: 400 })
    }

    // Delete task and related records
    await db.task.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Task deleted successfully' })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}