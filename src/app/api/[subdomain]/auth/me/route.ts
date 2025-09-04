import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth-middleware'

async function handler(request: NextRequest, context: any) {
  try {
    const { user, agency } = context

    // Get fresh user data with relations
    const freshUser = await db.user.findUnique({
      where: { id: user.id },
      include: {
        agency: {
          select: {
            id: true,
            name: true,
            subdomain: true,
            status: true,
            plan: true,
            brandSettings: true
          }
        },
        branch: {
          select: {
            id: true,
            name: true,
            status: true
          }
        }
      }
    })

    if (!freshUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: {
        id: freshUser.id,
        email: freshUser.email,
        name: freshUser.name,
        role: freshUser.role,
        status: freshUser.status,
        title: freshUser.title,
        department: freshUser.department,
        avatar: freshUser.avatar,
        phone: freshUser.phone,
        lastLoginAt: freshUser.lastLoginAt,
        emailVerified: freshUser.emailVerified,
        branch: freshUser.branch
      },
      agency: freshUser.agency
    })

  } catch (error) {
    console.error('Auth me error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const GET = requireAuth(handler)