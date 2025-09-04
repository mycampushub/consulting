import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { JWTService } from '@/lib/jwt'
import { AuthMiddleware } from '@/lib/auth-middleware'

export async function POST(request: NextRequest) {
  try {
    const authResult = await AuthMiddleware.protect(request, {
      requireAuth: true
    })

    if (authResult.response) {
      return authResult.response
    }

    const { user, agency } = authResult

    if (!user || !agency) {
      return NextResponse.json(
        { error: 'Invalid authentication data' },
        { status: 401 }
      )
    }

    // Return user and agency data
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
        lastLoginAt: user.lastLoginAt
      },
      agency: {
        id: agency.id,
        name: agency.name,
        subdomain: agency.subdomain,
        primaryColor: agency.primaryColor,
        secondaryColor: agency.secondaryColor,
        status: agency.status,
        plan: agency.plan
      }
    })

  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}