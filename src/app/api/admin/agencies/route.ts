import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const plan = searchParams.get('plan')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Build where clause for filtering
    const where: any = {}
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (plan && plan !== 'all') {
      where.plan = plan
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { subdomain: { contains: search, mode: 'insensitive' } },
        { customDomain: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Fetch agencies with related data
    const [agencies, totalCount] = await Promise.all([
      db.agency.findMany({
        where,
        include: {
          _count: {
            select: {
              users: true,
              students: true,
              universities: true,
              applications: true,
              invoices: true
            }
          },
          billing: true,
          featureSettings: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.agency.count({ where })
    ])

    // Calculate additional metrics for each agency
    const agenciesWithMetrics = await Promise.all(
      agencies.map(async (agency) => {
        // Get recent activity
        const recentActivity = await db.activityLog.findFirst({
          where: { agencyId: agency.id },
          orderBy: { createdAt: 'desc' }
        })

        // Get billing status based on invoices
        const billingStatus = agency.billing ? 
          (agency.invoices.length > 0 ? 
            agency.invoices.some(inv => inv.status === 'OVERDUE') ? 'PAST_DUE' :
            agency.invoices.some(inv => inv.status === 'CANCELLED') ? 'CANCELLED' : 'ACTIVE'
          : 'ACTIVE') 
        : 'ACTIVE'

        // Calculate health score based on various factors
        const healthScore = calculateHealthScore(agency, billingStatus)
        
        // Get performance metrics
        const performance = await calculatePerformanceMetrics(agency.id)

        return {
          id: agency.id,
          name: agency.name,
          subdomain: agency.subdomain,
          customDomain: agency.customDomain,
          status: agency.status,
          plan: agency.plan,
          createdAt: agency.createdAt,
          lastActivity: recentActivity?.createdAt,
          billingStatus,
          health: healthScore.grade,
          performance,
          metrics: {
            monthlyActiveUsers: agency._count.users,
            sessionDuration: performance.avgSessionDuration || 0,
            bounceRate: performance.bounceRate || 0
          },
          support: {
            ticketsOpen: 0, // Would need support tickets table
            ticketsResolved: 0,
            avgResponseTime: 0
          },
          stats: {
            userCount: agency._count.users,
            studentCount: agency._count.students,
            universityCount: agency._count.universities,
            applicationCount: agency._count.applications,
            invoiceCount: agency._count.invoices
          }
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: {
        agencies: agenciesWithMetrics,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      }
    })

  } catch (error) {
    console.error("Error fetching agencies:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      subdomain,
      customDomain,
      plan = 'FREE',
      adminEmail,
      adminName,
      adminPassword
    } = body

    // Validate required fields
    if (!name || !subdomain || !adminEmail || !adminName || !adminPassword) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if subdomain is already taken
    const existingSubdomain = await db.agency.findUnique({
      where: { subdomain }
    })

    if (existingSubdomain) {
      return NextResponse.json(
        { error: "Subdomain already exists" },
        { status: 400 }
      )
    }

    // Check if custom domain is already taken
    if (customDomain) {
      const existingCustomDomain = await db.agency.findUnique({
        where: { customDomain }
      })

      if (existingCustomDomain) {
        return NextResponse.json(
          { error: "Custom domain already exists" },
          { status: 400 }
        )
      }
    }

    // Check if admin email already exists
    const existingUser = await db.user.findUnique({
      where: { email: adminEmail }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Admin email already exists" },
        { status: 400 }
      )
    }

    // Create agency
    const agency = await db.agency.create({
      data: {
        name,
        subdomain,
        customDomain,
        plan,
        status: 'ACTIVE',
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981'
      }
    })

    // Create billing record
    await db.billing.create({
      data: {
        agencyId: agency.id,
        plan,
        currency: 'USD'
      }
    })

    // Create feature settings
    await db.featureSettings.create({
      data: {
        agencyId: agency.id,
        maxStudents: plan === 'FREE' ? 50 : plan === 'STARTER' ? 200 : plan === 'PROFESSIONAL' ? 1000 : Infinity,
        maxUsers: plan === 'FREE' ? 3 : plan === 'STARTER' ? 10 : plan === 'PROFESSIONAL' ? 50 : Infinity,
        maxStorage: plan === 'FREE' ? 1024 : plan === 'STARTER' ? 5120 : plan === 'PROFESSIONAL' ? 25600 : Infinity, // MB
        features: {
          customDomain: plan !== 'FREE',
          whiteLabel: plan === 'ENTERPRISE',
          apiAccess: plan !== 'FREE',
          advancedAnalytics: plan !== 'FREE',
          prioritySupport: plan === 'ENTERPRISE',
          customIntegrations: plan !== 'FREE'
        }
      }
    })

    // Hash password
    const bcrypt = require('bcryptjs')
    const hashedPassword = await bcrypt.hash(adminPassword, 12)

    // Create admin user
    const adminUser = await db.user.create({
      data: {
        email: adminEmail,
        name: adminName,
        password: hashedPassword,
        role: 'AGENCY_ADMIN',
        status: 'ACTIVE',
        emailVerified: true,
        agencyId: agency.id
      }
    })

    // Log the agency creation
    await db.activityLog.create({
      data: {
        agencyId: agency.id,
        userId: adminUser.id,
        action: 'AGENCY_CREATED',
        entityType: 'Agency',
        entityId: agency.id,
        changes: JSON.stringify({
          name,
          subdomain,
          plan,
          adminEmail,
          adminName
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        agency: {
          id: agency.id,
          name: agency.name,
          subdomain: agency.subdomain,
          customDomain: agency.customDomain,
          status: agency.status,
          plan: agency.plan,
          createdAt: agency.createdAt
        },
        admin: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role
        }
      }
    })

  } catch (error) {
    console.error("Error creating agency:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}

// Helper functions
function calculateHealthScore(agency: any, billingStatus: string) {
  let score = 100
  
  // Deduct for inactive status
  if (agency.status === 'INACTIVE') score -= 30
  if (agency.status === 'SUSPENDED') score -= 50
  
  // Deduct for billing issues
  if (billingStatus === 'PAST_DUE') score -= 20
  if (billingStatus === 'CANCELLED') score -= 40
  
  // Deduct for low activity
  const daysSinceActivity = agency.lastActivity ? 
    Math.floor((Date.now() - new Date(agency.lastActivity).getTime()) / (1000 * 60 * 60 * 24)) : 999
  if (daysSinceActivity > 30) score -= 15
  if (daysSinceActivity > 90) score -= 25
  
  // Determine grade
  if (score >= 90) return { grade: 'EXCELLENT', score }
  if (score >= 75) return { grade: 'GOOD', score }
  if (score >= 60) return { grade: 'WARNING', score }
  return { grade: 'CRITICAL', score }
}

async function calculatePerformanceMetrics(agencyId: string) {
  // This would normally calculate actual metrics from activity logs
  // For now, return mock data
  return {
    responseTime: Math.floor(Math.random() * 200) + 100,
    uptime: 95 + Math.random() * 5,
    errorRate: Math.random() * 2,
    avgSessionDuration: Math.floor(Math.random() * 1000) + 500,
    bounceRate: Math.random() * 30
  }
}