import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
  subdomain: z.string().min(1, 'Subdomain is required'),
  rememberMe: z.boolean().optional(),
  deviceInfo: z.object({
    userAgent: z.string(),
    deviceType: z.string()
  }).optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = loginSchema.parse(body)

    // Find agency by subdomain
    const agency = await db.agency.findUnique({
      where: { subdomain: validatedData.subdomain }
    })

    if (!agency) {
      return NextResponse.json(
        { error: 'Agency not found' },
        { status: 404 }
      )
    }

    // Find user by email and agency
    const user = await db.user.findFirst({
      where: {
        email: validatedData.email,
        agencyId: agency.id
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Account is suspended or inactive' },
        { status: 403 }
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(validatedData.password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        agencyId: agency.id,
        subdomain: agency.subdomain,
        role: user.role
      },
      process.env.JWT_SECRET || 'fallback-secret-for-development',
      {
        expiresIn: validatedData.rememberMe ? '30d' : '24h'
      }
    )

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    // Log activity
    await db.activityLog.create({
      data: {
        agencyId: agency.id,
        userId: user.id,
        action: 'USER_LOGIN',
        entityType: 'User',
        entityId: user.id,
        changes: JSON.stringify({
          deviceType: validatedData.deviceInfo?.deviceType,
          userAgent: validatedData.deviceInfo?.userAgent
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status
      },
      agency: {
        id: agency.id,
        name: agency.name,
        subdomain: agency.subdomain,
        status: agency.status,
        plan: agency.plan
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}