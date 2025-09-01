import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSubdomain } from '@/lib/utils'

export async function POST(
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

    // Reset position to 0
    const updatedGroup = await db.roundRobinGroup.update({
      where: { id: params.id },
      data: {
        currentPosition: 0,
        lastAssignedAt: null
      }
    })

    return NextResponse.json({
      message: 'Round Robin group position reset successfully',
      group: updatedGroup
    })
  } catch (error) {
    console.error('Error resetting round robin group position:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}