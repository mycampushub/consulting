import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSubdomain } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const subdomain = getSubdomain(request.headers.get('host') || '')
    if (!subdomain) {
      return NextResponse.json({ error: 'Subdomain required' }, { status: 400 })
    }

    const body = await request.json()
    const {
      taskId,
      userId,
      assignedBy,
      assignmentType = 'MANUAL',
      roundRobinGroupId,
      roundRobinOrder
    } = body

    // Validate required fields
    if (!taskId || !userId) {
      return NextResponse.json({ error: 'Task ID and User ID are required' }, { status: 400 })
    }

    // Get agency
    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    // Check if task exists and belongs to agency
    const task = await db.task.findFirst({
      where: {
        id: taskId,
        agencyId: agency.id
      }
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Check if user exists and belongs to agency
    const user = await db.user.findFirst({
      where: {
        id: userId,
        agencyId: agency.id
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if assigner exists and belongs to agency
    if (assignedBy) {
      const assigner = await db.user.findFirst({
        where: {
          id: assignedBy,
          agencyId: agency.id
        }
      })
      if (!assigner) {
        return NextResponse.json({ error: 'Assigner not found' }, { status: 404 })
      }
    }

    // Deactivate existing active assignments for this task
    await db.taskAssignment.updateMany({
      where: {
        taskId,
        status: 'ACTIVE'
      },
      data: { status: 'REASSIGNED' }
    })

    // Create new assignment
    const assignment = await db.taskAssignment.create({
      data: {
        agencyId: agency.id,
        taskId,
        userId,
        assignedBy: assignedBy || userId,
        assignmentType,
        roundRobinGroupId,
        roundRobinOrder,
        status: 'ACTIVE'
      },
      include: {
        user: {
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
        }
      }
    })

    // Update task with new assignee
    await db.task.update({
      where: { id: taskId },
      data: {
        assignedTo: userId,
        assignedBy: assignedBy || userId
      }
    })

    return NextResponse.json(assignment, { status: 201 })
  } catch (error) {
    console.error('Error creating task assignment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const subdomain = getSubdomain(request.headers.get('host') || '')
    if (!subdomain) {
      return NextResponse.json({ error: 'Subdomain required' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    const assignmentType = searchParams.get('assignmentType')

    const where: any = {
      agency: {
        subdomain
      }
    }

    if (taskId) where.taskId = taskId
    if (userId) where.userId = userId
    if (status) where.status = status
    if (assignmentType) where.assignmentType = assignmentType

    const assignments = await db.taskAssignment.findMany({
      where,
      include: {
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            dueDate: true
          }
        },
        user: {
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
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(assignments)
  } catch (error) {
    console.error('Error fetching task assignments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}