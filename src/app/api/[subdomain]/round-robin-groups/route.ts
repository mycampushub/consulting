import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSubdomain } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const subdomain = getSubdomain(request.headers.get('host') || '')
    if (!subdomain) {
      return NextResponse.json({ error: 'Subdomain required' }, { status: 400 })
    }

    const roundRobinGroups = await db.roundRobinGroup.findMany({
      where: {
        agency: {
          subdomain
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Enhance with member details
    const enhancedGroups = await Promise.all(
      roundRobinGroups.map(async (group) => {
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

        return {
          ...group,
          members: membersWithWorkload.sort((a, b) => a.orderPosition - b.orderPosition),
          memberCount: members.length
        }
      })
    )

    return NextResponse.json(enhancedGroups)
  } catch (error) {
    console.error('Error fetching round robin groups:', error)
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
      name,
      description,
      strategy = 'SEQUENTIAL',
      skipUnavailable = true,
      resetDaily = false,
      memberOrder
    } = body

    // Validate required fields
    if (!name || !memberOrder || memberOrder.length === 0) {
      return NextResponse.json({ error: 'Name and member order are required' }, { status: 400 })
    }

    // Get agency
    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    // Validate all users exist and belong to agency
    const users = await db.user.findMany({
      where: {
        id: { in: memberOrder },
        agencyId: agency.id
      }
    })

    if (users.length !== memberOrder.length) {
      return NextResponse.json({ error: 'One or more users not found' }, { status: 404 })
    }

    // Create round robin group
    const group = await db.roundRobinGroup.create({
      data: {
        agencyId: agency.id,
        name,
        description,
        strategy,
        skipUnavailable,
        resetDaily,
        memberOrder: JSON.stringify(memberOrder),
        currentPosition: 0,
        isActive: true
      }
    })

    return NextResponse.json(group, { status: 201 })
  } catch (error) {
    console.error('Error creating round robin group:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}