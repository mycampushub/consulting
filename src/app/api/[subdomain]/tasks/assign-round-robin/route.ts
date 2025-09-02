import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSubdomainForAPI } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    // Simple subdomain extraction from URL path (same as GET method)
    const url = new URL(request.url)
    const pathname = url.pathname
    const pathParts = pathname.split('/').filter(Boolean)
    let subdomain = null
    
    // Extract subdomain from path like /api/testagency/tasks/assign-round-robin
    if (pathParts.length > 1 && pathParts[0] === 'api') {
      subdomain = pathParts[1]
    }
    
    console.log('Round Robin API POST - Path:', pathname, 'Subdomain:', subdomain)
    
    if (!subdomain) {
      return NextResponse.json({ error: 'Subdomain required', debug: { pathname, pathParts } }, { status: 400 })
    }

    const body = await request.json()
    const {
      taskId,
      roundRobinGroupId,
      assignedBy,
      strategy = 'SEQUENTIAL'
    } = body

    // Validate required fields
    if (!taskId || !roundRobinGroupId) {
      return NextResponse.json({ error: 'Task ID and Round Robin Group ID are required' }, { status: 400 })
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

    // Get round robin group
    const roundRobinGroup = await db.roundRobinGroup.findFirst({
      where: {
        id: roundRobinGroupId,
        agencyId: agency.id,
        isActive: true
      }
    })

    if (!roundRobinGroup) {
      return NextResponse.json({ error: 'Round Robin group not found or inactive' }, { status: 404 })
    }

    // Parse member order
    const memberOrder = JSON.parse(roundRobinGroup.memberOrder || '[]')
    if (memberOrder.length === 0) {
      return NextResponse.json({ error: 'No members in round robin group' }, { status: 400 })
    }

    // Get next assignee based on strategy
    let nextAssigneeId: string
    let nextPosition: number

    switch (strategy) {
      case 'SEQUENTIAL':
        nextPosition = (roundRobinGroup.currentPosition + 1) % memberOrder.length
        nextAssigneeId = memberOrder[nextPosition]
        break
      
      case 'WEIGHTED':
        // For weighted, we need to get user workloads and assign to least loaded
        const userWorkloads = await Promise.all(
          memberOrder.map(async (userId: string) => {
            const activeTasks = await db.task.count({
              where: {
                assignedTo: userId,
                status: { in: ['PENDING', 'IN_PROGRESS'] },
                agencyId: agency.id
              }
            })
            return { userId, workload: activeTasks }
          })
        )
        
        const leastLoaded = userWorkloads.reduce((min, current) => 
          current.workload < min.workload ? current : min
        )
        nextAssigneeId = leastLoaded.userId
        nextPosition = memberOrder.indexOf(nextAssigneeId)
        break
      
      case 'AVAILABILITY_BASED':
        // For availability-based, check user status and recent activity
        const availableUsers = await Promise.all(
          memberOrder.map(async (userId: string) => {
            const user = await db.user.findUnique({
              where: { id: userId },
              select: { 
                status: true, 
                lastLoginAt: true 
              }
            })
            
            // Consider user available if active and logged in recently (last 7 days)
            const isAvailable = user?.status === 'ACTIVE' && 
              user.lastLoginAt && 
              new Date(user.lastLoginAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            
            return { userId, isAvailable }
          })
        )
        
        const availableUser = availableUsers.find(u => u.isAvailable)
        if (!availableUser) {
          return NextResponse.json({ error: 'No available users in round robin group' }, { status: 400 })
        }
        
        nextAssigneeId = availableUser.userId
        nextPosition = memberOrder.indexOf(nextAssigneeId)
        break
      
      default:
        nextPosition = (roundRobinGroup.currentPosition + 1) % memberOrder.length
        nextAssigneeId = memberOrder[nextPosition]
    }

    // Check if selected user is available (if skipUnavailable is enabled)
    if (roundRobinGroup.skipUnavailable) {
      const user = await db.user.findUnique({
        where: { id: nextAssigneeId },
        select: { status: true }
      })
      
      if (!user || user.status !== 'ACTIVE') {
        // Try to find next available user
        let availableUserFound = false
        let attempts = 0
        let checkPosition = nextPosition
        
        while (!availableUserFound && attempts < memberOrder.length) {
          checkPosition = (checkPosition + 1) % memberOrder.length
          const checkUserId = memberOrder[checkPosition]
          
          const checkUser = await db.user.findUnique({
            where: { id: checkUserId },
            select: { status: true }
          })
          
          if (checkUser && checkUser.status === 'ACTIVE') {
            nextAssigneeId = checkUserId
            nextPosition = checkPosition
            availableUserFound = true
          }
          
          attempts++
        }
        
        if (!availableUserFound) {
          return NextResponse.json({ error: 'No available users in round robin group' }, { status: 400 })
        }
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
        userId: nextAssigneeId,
        assignedBy: assignedBy || nextAssigneeId,
        assignmentType: 'ROUND_ROBIN',
        roundRobinGroupId,
        roundRobinOrder: nextPosition,
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
        assignedTo: nextAssigneeId,
        assignedBy: assignedBy || nextAssigneeId
      }
    })

    // Update round robin group position
    await db.roundRobinGroup.update({
      where: { id: roundRobinGroupId },
      data: {
        currentPosition: nextPosition,
        lastAssignedAt: new Date()
      }
    })

    return NextResponse.json({
      assignment,
      roundRobinGroup: {
        id: roundRobinGroup.id,
        name: roundRobinGroup.name,
        currentPosition: nextPosition,
        strategy: roundRobinGroup.strategy
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error in round robin assignment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Simple subdomain extraction from URL path
    const url = new URL(request.url)
    const pathname = url.pathname
    const pathParts = pathname.split('/').filter(Boolean)
    let subdomain = null
    
    // Extract subdomain from path like /api/testagency/tasks/assign-round-robin
    if (pathParts.length > 1 && pathParts[0] === 'api') {
      subdomain = pathParts[1]
    }
    
    console.log('Round Robin API - Path:', pathname, 'Subdomain:', subdomain)
    
    if (!subdomain) {
      return NextResponse.json({ error: 'Subdomain required', debug: { pathname, pathParts } }, { status: 400 })
    }

    // Return mock round robin groups for testing
    const mockGroups = [
      {
        id: '1',
        name: 'Consulting Team',
        description: 'Round robin group for education consultants',
        strategy: 'SEQUENTIAL',
        skipUnavailable: true,
        resetDaily: false,
        memberOrder: ['2', '3'],
        currentPosition: 0,
        lastAssignedAt: new Date().toISOString(),
        isActive: true,
        members: [
          {
            id: '2',
            name: 'Sarah Johnson',
            email: 'consultant1@demo.com',
            role: 'CONSULTANT',
            status: 'ACTIVE',
            avatar: null,
            workload: 2,
            orderPosition: 0
          },
          {
            id: '3',
            name: 'Michael Chen',
            email: 'consultant2@demo.com',
            role: 'CONSULTANT',
            status: 'ACTIVE',
            avatar: null,
            workload: 1,
            orderPosition: 1
          }
        ],
        memberCount: 2
      }
    ]

    return NextResponse.json(mockGroups)
  } catch (error) {
    console.error('Error fetching round robin groups:', error)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}