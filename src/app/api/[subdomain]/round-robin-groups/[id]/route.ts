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

    const group = await db.roundRobinGroup.findFirst({
      where: {
        id: params.id,
        agency: {
          subdomain
        }
      }
    })

    if (!group) {
      return NextResponse.json({ error: 'Round Robin group not found' }, { status: 404 })
    }

    // Get member details
    const memberOrder = JSON.parse(group.memberOrder || '[]')
    const members = await db.user.findMany({
      where: {
        id: { in: memberOrder },
        agencyId: group.agencyId
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        status: true
      }
    })

    // Get current workload for each member
    const membersWithWorkload = await Promise.all(
      members.map(async (member) => {
        const activeTasks = await db.task.count({
          where: {
            assignedTo: member.id,
            status: { in: ['PENDING', 'IN_PROGRESS'] },
            agencyId: group.agencyId
          }
        })
        
        return {
          ...member,
          workload: activeTasks,
          orderPosition: memberOrder.indexOf(member.id)
        }
      })
    )

    const enhancedGroup = {
      ...group,
      members: membersWithWorkload.sort((a, b) => a.orderPosition - b.orderPosition),
      memberCount: members.length
    }

    return NextResponse.json(enhancedGroup)
  } catch (error) {
    console.error('Error fetching round robin group:', error)
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
      name,
      description,
      strategy,
      skipUnavailable,
      resetDaily,
      memberOrder,
      isActive
    } = body

    // Get existing group
    const existingGroup = await db.roundRobinGroup.findFirst({
      where: {
        id: params.id,
        agency: {
          subdomain
        }
      }
    })

    if (!existingGroup) {
      return NextResponse.json({ error: 'Round Robin group not found' }, { status: 404 })
    }

    // Validate member order if provided
    if (memberOrder) {
      const users = await db.user.findMany({
        where: {
          id: { in: memberOrder },
          agencyId: existingGroup.agencyId
        }
      })

      if (users.length !== memberOrder.length) {
        return NextResponse.json({ error: 'One or more users not found' }, { status: 404 })
      }
    }

    // Update group
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (strategy !== undefined) updateData.strategy = strategy
    if (skipUnavailable !== undefined) updateData.skipUnavailable = skipUnavailable
    if (resetDaily !== undefined) updateData.resetDaily = resetDaily
    if (memberOrder !== undefined) updateData.memberOrder = JSON.stringify(memberOrder)
    if (isActive !== undefined) updateData.isActive = isActive

    const group = await db.roundRobinGroup.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json(group)
  } catch (error) {
    console.error('Error updating round robin group:', error)
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

    // Check if group exists and belongs to agency
    const group = await db.roundRobinGroup.findFirst({
      where: {
        id: params.id,
        agency: {
          subdomain
        }
      }
    })

    if (!group) {
      return NextResponse.json({ error: 'Round Robin group not found' }, { status: 404 })
    }

    // Delete group
    await db.roundRobinGroup.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Round Robin group deleted successfully' })
  } catch (error) {
    console.error('Error deleting round robin group:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}