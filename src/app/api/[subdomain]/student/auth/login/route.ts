import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSubdomainForAPI } from '@/lib/utils'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  rememberMe: z.boolean().optional().default(false),
  deviceInfo: z.object({
    userAgent: z.string().optional(),
    ipAddress: z.string().optional(),
    deviceType: z.enum(['desktop', 'mobile', 'tablet']).optional(),
    browser: z.string().optional()
  }).optional()
})

// Enhanced demo credentials with more realistic data
const DEMO_STUDENTS = [
  {
    email: 'alex.thompson@demo.com',
    password: 'demo123',
    firstName: 'Alex',
    lastName: 'Thompson',
    nationality: 'Canadian',
    preferredCountries: ['United States', 'United Kingdom', 'Australia'],
    budget: 50000,
    gpa: 3.8,
    status: 'APPLIED' as const,
    stage: 'APPLICATION' as const,
    profileComplete: true,
    lastLogin: new Date('2024-01-15T10:00:00Z'),
    twoFactorEnabled: false
  },
  {
    email: 'maria.garcia@demo.com',
    password: 'demo123',
    firstName: 'Maria',
    lastName: 'Garcia',
    nationality: 'Spanish',
    preferredCountries: ['United States', 'Canada', 'Germany'],
    budget: 40000,
    gpa: 3.6,
    status: 'ACCEPTED' as const,
    stage: 'DOCUMENTATION' as const,
    profileComplete: true,
    lastLogin: new Date('2024-01-16T14:30:00Z'),
    twoFactorEnabled: true
  },
  {
    email: 'james.wilson@demo.com',
    password: 'demo123',
    firstName: 'James',
    lastName: 'Wilson',
    nationality: 'British',
    preferredCountries: ['United States', 'Canada', 'Australia'],
    budget: 60000,
    gpa: 3.9,
    status: 'ENROLLED' as const,
    stage: 'PRE_DEPARTURE' as const,
    profileComplete: true,
    lastLogin: new Date('2024-01-17T09:15:00Z'),
    twoFactorEnabled: false
  }
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, rememberMe, deviceInfo } = loginSchema.parse(body)

    // Rate limiting check (simple implementation)
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    // Check for too many failed attempts
    const recentFailedAttempts = await db.activityLog.count({
      where: {
        action: 'STUDENT_LOGIN_FAILED',
        ipAddress: clientIP,
        createdAt: {
          gte: new Date(Date.now() - 15 * 60 * 1000) // Last 15 minutes
        }
      }
    })

    if (recentFailedAttempts >= 5) {
      return NextResponse.json(
        { error: 'Too many failed attempts. Please try again later.' },
        { status: 429 }
      )
    }

    // Check demo credentials first
    const demoStudent = DEMO_STUDENTS.find(
      student => student.email === email && student.password === password
    )

    if (demoStudent) {
      // Create or get demo agency
      let agency = await db.agency.findFirst({
        where: { 
          OR: [
            { subdomain: 'demo-agency' },
            { name: 'Demo Education Agency' }
          ]
        }
      })

      if (!agency) {
        agency = await db.agency.create({
          data: {
            name: 'Demo Education Agency',
            subdomain: 'demo-agency',
            primaryColor: '#3B82F6',
            secondaryColor: '#10B981',
            status: 'ACTIVE',
            plan: 'PROFESSIONAL'
          }
        })
      }

      // Create or get demo student record
      let student = await db.student.findFirst({
        where: { 
          AND: [
            { email: demoStudent.email },
            { agencyId: agency.id }
          ]
        }
      })

      if (!student) {
        student = await db.student.create({
          data: {
            agencyId: agency.id,
            firstName: demoStudent.firstName,
            lastName: demoStudent.lastName,
            email: demoStudent.email,
            nationality: demoStudent.nationality,
            preferredCountries: JSON.stringify(demoStudent.preferredCountries),
            budget: demoStudent.budget,
            gpa: demoStudent.gpa,
            status: demoStudent.status,
            stage: demoStudent.stage
          }
        })
      }

      // Generate session ID for security
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Generate JWT token with enhanced security
      const token = jwt.sign(
        { 
          studentId: student.id, 
          agencyId: agency.id, 
          email: student.email,
          type: 'student',
          sessionId: sessionId,
          deviceInfo: deviceInfo || {},
          iat: Math.floor(Date.now() / 1000)
        },
        process.env.NEXTAUTH_SECRET || 'fallback-secret',
        { expiresIn: rememberMe ? '30d' : '24h' }
      )

      // Log successful login
      await db.activityLog.create({
        data: {
          agencyId: agency.id,
          action: 'STUDENT_LOGIN_SUCCESS',
          entityType: 'Student',
          entityId: student.id,
          changes: JSON.stringify({ 
            sessionId, 
            deviceInfo: deviceInfo || {},
            loginMethod: 'demo'
          }),
          ipAddress: clientIP,
          userAgent: userAgent
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Demo student login successful',
        token,
        sessionId,
        student: {
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          status: student.status,
          stage: student.stage,
          profileComplete: demoStudent.profileComplete,
          twoFactorEnabled: demoStudent.twoFactorEnabled,
          lastLogin: demoStudent.lastLogin
        },
        agency: {
          id: agency.id,
          name: agency.name,
          subdomain: agency.subdomain
        },
        isDemo: true,
        security: {
          sessionId,
          requiresTwoFactor: demoStudent.twoFactorEnabled
        }
      })
    }

    // Check for real student in database
    const student = await db.student.findFirst({
      where: { email },
      include: {
        agency: true
      }
    })

    if (!student) {
      // Log failed attempt for non-existent student
      await db.activityLog.create({
        data: {
          agencyId: 'unknown',
          action: 'STUDENT_LOGIN_FAILED',
          entityType: 'Student',
          entityId: 'unknown',
          changes: JSON.stringify({ reason: 'Student not found', email }),
          ipAddress: clientIP,
          userAgent: userAgent
        }
      })
      
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // For real students, check if they have a password set
    // In a real implementation, you would have a password field for students
    // For now, we'll check if there's a user account associated with this student
    const userAccount = await db.user.findFirst({
      where: {
        email: email,
        agencyId: student.agencyId
      }
    })

    if (userAccount && userAccount.password) {
      // Validate password using bcrypt
      const isPasswordValid = await bcrypt.compare(password, userAccount.password)
      if (!isPasswordValid) {
        // Log failed login attempt
        await db.activityLog.create({
          data: {
            agencyId: student.agencyId,
            userId: userAccount.id,
            action: 'STUDENT_LOGIN_FAILED',
            entityType: 'Student',
            entityId: student.id,
            changes: JSON.stringify({ reason: 'Invalid password' }),
            ipAddress: clientIP,
            userAgent: userAgent
          }
        })
        
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }
    } else {
      // If no user account exists, create one with the provided password
      const hashedPassword = await bcrypt.hash(password, 12)
      await db.user.create({
        data: {
          email: email,
          password: hashedPassword,
          name: `${student.firstName} ${student.lastName}`,
          role: 'STUDENT',
          agencyId: student.agencyId,
          status: 'ACTIVE'
        }
      })
    }

    // Generate session ID for security
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Generate JWT token with enhanced security
    const token = jwt.sign(
      { 
        studentId: student.id, 
        agencyId: student.agencyId, 
        email: student.email,
        type: 'student',
        sessionId: sessionId,
        deviceInfo: deviceInfo || {},
        iat: Math.floor(Date.now() / 1000)
      },
      process.env.NEXTAUTH_SECRET || 'fallback-secret',
      { expiresIn: rememberMe ? '30d' : '24h' }
    )

    // Update student's last login
    await db.student.update({
      where: { id: student.id },
      data: { lastLoginAt: new Date() }
    })

    // Log successful login
    await db.activityLog.create({
      data: {
        agencyId: student.agencyId,
        userId: userAccount?.id,
        action: 'STUDENT_LOGIN_SUCCESS',
        entityType: 'Student',
        entityId: student.id,
        changes: JSON.stringify({ 
          sessionId, 
          deviceInfo: deviceInfo || {},
          loginMethod: 'standard'
        }),
        ipAddress: clientIP,
        userAgent: userAgent
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      sessionId,
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        status: student.status,
        stage: student.stage,
        profileComplete: true, // Could be calculated based on profile completion
        twoFactorEnabled: false, // Could be enhanced with 2FA
        lastLogin: new Date()
      },
      agency: {
        id: student.agency.id,
        name: student.agency.name,
        subdomain: student.agency.subdomain
      },
      isDemo: false,
      security: {
        sessionId,
        requiresTwoFactor: false
      }
    })

  } catch (error) {
    console.error('Student login error:', error)
    
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