import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const agencyId = searchParams.get('agencyId')
    const userId = searchParams.get('userId')
    const action = searchParams.get('action')
    const entityType = searchParams.get('entityType')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const exportFormat = searchParams.get('export')

    const skip = (page - 1) * limit

    // Build where clause for filtering
    const where: any = {}
    
    if (agencyId && agencyId !== 'all') {
      where.agencyId = agencyId
    }
    
    if (userId && userId !== 'all') {
      where.userId = userId
    }
    
    if (action && action !== 'all') {
      where.action = { contains: action, mode: 'insensitive' }
    }
    
    if (entityType && entityType !== 'all') {
      where.entityType = entityType
    }
    
    if (startDate) {
      where.createdAt = { gte: new Date(startDate) }
    }
    
    if (endDate) {
      where.createdAt = { 
        ...(where.createdAt || {}),
        lte: new Date(endDate) 
      }
    }

    // Fetch audit logs with related data
    const [auditLogs, totalCount] = await Promise.all([
      db.activityLog.findMany({
        where,
        include: {
          agency: {
            select: {
              id: true,
              name: true,
              subdomain: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.activityLog.count({ where })
    ])

    // Get audit analytics
    const auditAnalytics = await getAuditAnalytics(where)

    // Get compliance metrics
    const complianceMetrics = await getComplianceMetrics(where)

    // Handle export requests
    if (exportFormat === 'csv') {
      return exportToCsv(auditLogs)
    }

    if (exportFormat === 'json') {
      return exportToJson(auditLogs)
    }

    return NextResponse.json({
      success: true,
      data: {
        auditLogs: auditLogs.map(log => ({
          id: log.id,
          agency: log.agency,
          user: log.user,
          action: log.action,
          entityType: log.entityType,
          entityId: log.entityId,
          changes: log.changes ? JSON.parse(log.changes) : null,
          ipAddress: log.ipAddress,
          userAgent: log.userAgent,
          timestamp: log.createdAt
        })),
        analytics: auditAnalytics,
        compliance: complianceMetrics,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      }
    })

  } catch (error) {
    console.error("Error fetching audit logs:", error)
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
      agencyId,
      userId,
      action,
      entityType,
      entityId,
      changes,
      ipAddress,
      userAgent
    } = body

    // Validate required fields
    if (!agencyId || !action || !entityType || !entityId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Create audit log entry
    const auditLog = await db.activityLog.create({
      data: {
        agencyId,
        userId,
        action,
        entityType,
        entityId,
        changes: changes ? JSON.stringify(changes) : null,
        ipAddress: ipAddress || request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: userAgent || request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        auditLog: {
          id: auditLog.id,
          agencyId: auditLog.agencyId,
          userId: auditLog.userId,
          action: auditLog.action,
          entityType: auditLog.entityType,
          entityId: auditLog.entityId,
          timestamp: auditLog.createdAt
        }
      }
    })

  } catch (error) {
    console.error("Error creating audit log:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}

// Helper functions
async function getAuditAnalytics(where: any) {
  const [
    actionsByType,
    entitiesByType,
    usersByActivity,
    agenciesByActivity,
    hourlyActivity,
    dailyActivity
  ] = await Promise.all([
    // Actions by type
    db.activityLog.groupBy({
      by: ['action'],
      _count: { action: true },
      where,
      orderBy: {
        _count: {
          action: 'desc'
        }
      },
      take: 10
    }),

    // Entities by type
    db.activityLog.groupBy({
      by: ['entityType'],
      _count: { entityType: true },
      where,
      orderBy: {
        _count: {
          entityType: 'desc'
        }
      }
    }),

    // Users by activity
    db.activityLog.groupBy({
      by: ['userId'],
      _count: { userId: true },
      where: {
        ...where,
        userId: { not: null }
      },
      orderBy: {
        _count: {
          userId: 'desc'
        }
      },
      take: 10
    }),

    // Agencies by activity
    db.activityLog.groupBy({
      by: ['agencyId'],
      _count: { agencyId: true },
      where,
      orderBy: {
        _count: {
          agencyId: 'desc'
        }
      },
      take: 10
    }),

    // Hourly activity (last 24 hours)
    db.activityLog.groupBy({
      by: ['createdAt'],
      _count: { createdAt: true },
      where: {
        ...where,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    }),

    // Daily activity (last 30 days)
    db.activityLog.groupBy({
      by: ['createdAt'],
      _count: { createdAt: true },
      where: {
        ...where,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    })
  ])

  // Process hourly activity
  const hourlyData = Array.from({ length: 24 }, (_, i) => {
    const hour = new Date()
    hour.setHours(hour.getHours() - i)
    hour.setMinutes(0, 0, 0)
    
    const count = hourlyActivity.filter(log => 
      new Date(log.createdAt).getHours() === hour.getHours()
    ).reduce((sum, log) => sum + log._count.createdAt, 0)

    return {
      hour: hour.getHours(),
      count,
      timestamp: hour.toISOString()
    }
  }).reverse()

  // Process daily activity
  const dailyData = Array.from({ length: 30 }, (_, i) => {
    const day = new Date()
    day.setDate(day.getDate() - i)
    day.setHours(0, 0, 0, 0)
    
    const count = dailyActivity.filter(log => 
      new Date(log.createdAt).toDateString() === day.toDateString()
    ).reduce((sum, log) => sum + log._count.createdAt, 0)

    return {
      date: day.toISOString().split('T')[0],
      count,
      timestamp: day.toISOString()
    }
  }).reverse()

  // Get user details for top users
  const userDetails = await Promise.all(
    usersByActivity.map(async (user) => {
      const userData = await db.user.findUnique({
        where: { id: user.userId },
        select: {
          name: true,
          email: true,
          agency: {
            select: {
              name: true,
              subdomain: true
            }
          }
        }
      })
      return {
        userId: user.userId,
        user: userData,
        activityCount: user._count.userId
      }
    })
  )

  // Get agency details for top agencies
  const agencyDetails = await Promise.all(
    agenciesByActivity.map(async (agency) => {
      const agencyData = await db.agency.findUnique({
        where: { id: agency.agencyId },
        select: {
          name: true,
          subdomain: true,
          plan: true
        }
      })
      return {
        agencyId: agency.agencyId,
        agency: agencyData,
        activityCount: agency._count.agencyId
      }
    })
  )

  return {
    actionsByType: actionsByType.map(item => ({
      action: item.action,
      count: item._count.action
    })),
    entitiesByType: entitiesByType.map(item => ({
      entityType: item.entityType,
      count: item._count.entityType
    })),
    topUsers: userDetails,
    topAgencies: agencyDetails,
    hourlyActivity: hourlyData,
    dailyActivity: dailyData
  }
}

async function getComplianceMetrics(where: any) {
  const [
    totalLogs,
    sensitiveActions,
    failedLogins,
    dataAccessLogs,
    configurationChanges,
    securityEvents
  ] = await Promise.all([
    // Total logs
    db.activityLog.count(where),

    // Sensitive actions
    db.activityLog.count({
      where: {
        ...where,
        OR: [
          { action: { contains: 'DELETE' } },
          { action: { contains: 'UPDATE' } },
          { action: { contains: 'CREATE' } },
          { action: { contains: 'PASSWORD' } },
          { action: { contains: 'PERMISSION' } }
        ]
      }
    }),

    // Failed login attempts
    db.activityLog.count({
      where: {
        ...where,
        action: { contains: 'LOGIN_FAILED' }
      }
    }),

    // Data access logs
    db.activityLog.count({
      where: {
        ...where,
        OR: [
          { entityType: 'Student' },
          { entityType: 'User' },
          { entityType: 'Application' },
          { entityType: 'Document' }
        ]
      }
    }),

    // Configuration changes
    db.activityLog.count({
      where: {
        ...where,
        OR: [
          { action: { contains: 'SETTINGS' } },
          { action: { contains: 'CONFIG' } },
          { action: { contains: 'FEATURE' } }
        ]
      }
    }),

    // Security events
    db.activityLog.count({
      where: {
        ...where,
        OR: [
          { action: { contains: 'SECURITY' } },
          { action: { contains: 'BLOCKED' } },
          { action: { contains: 'SUSPENDED' } },
          { action: { contains: 'UNAUTHORIZED' } }
        ]
      }
    })
  ])

  // Calculate compliance scores
  const sensitiveActionRate = totalLogs > 0 ? (sensitiveActions / totalLogs) * 100 : 0
  const failedLoginRate = totalLogs > 0 ? (failedLogins / totalLogs) * 100 : 0
  const securityEventRate = totalLogs > 0 ? (securityEvents / totalLogs) * 100 : 0

  // Determine compliance status
  let complianceStatus = 'COMPLIANT'
  if (failedLoginRate > 5 || securityEventRate > 2) {
    complianceStatus = 'WARNING'
  }
  if (failedLoginRate > 10 || securityEventRate > 5) {
    complianceStatus = 'NON_COMPLIANT'
  }

  return {
    totalLogs,
    sensitiveActions,
    failedLogins,
    dataAccessLogs,
    configurationChanges,
    securityEvents,
    metrics: {
      sensitiveActionRate,
      failedLoginRate,
      securityEventRate
    },
    complianceStatus,
    recommendations: generateComplianceRecommendations({
      sensitiveActionRate,
      failedLoginRate,
      securityEventRate
    })
  }
}

function generateComplianceRecommendations(metrics: any) {
  const recommendations = []

  if (metrics.failedLoginRate > 5) {
    recommendations.push({
      priority: 'high',
      category: 'security',
      title: 'High Failed Login Rate',
      description: `Failed login rate is ${metrics.failedLoginRate.toFixed(1)}%, which exceeds the 5% threshold.`,
      action: 'Review failed login attempts and implement additional security measures.'
    })
  }

  if (metrics.securityEventRate > 2) {
    recommendations.push({
      priority: 'high',
      category: 'security',
      title: 'Elevated Security Events',
      description: `Security event rate is ${metrics.securityEventRate.toFixed(1)}%, indicating potential security issues.`,
      action: 'Investigate security events and review access controls.'
    })
  }

  if (metrics.sensitiveActionRate > 20) {
    recommendations.push({
      priority: 'medium',
      category: 'monitoring',
      title: 'High Sensitive Action Rate',
      description: `Sensitive action rate is ${metrics.sensitiveActionRate.toFixed(1)}%. Consider reviewing access patterns.`,
      action: 'Review user permissions and sensitive action patterns.'
    })
  }

  return recommendations
}

function exportToCsv(auditLogs: any[]) {
  const headers = [
    'Timestamp',
    'Agency',
    'User',
    'Action',
    'Entity Type',
    'Entity ID',
    'IP Address',
    'User Agent',
    'Changes'
  ]

  const csvContent = [
    headers.join(','),
    ...auditLogs.map(log => [
      log.createdAt,
      log.agency?.name || '',
      log.user?.name || '',
      log.action,
      log.entityType,
      log.entityId,
      log.ipAddress || '',
      `"${log.userAgent || ''}"`,
      `"${log.changes || ''}"`
    ].join(','))
  ].join('\n')

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="audit-logs.csv"'
    }
  })
}

function exportToJson(auditLogs: any[]) {
  const jsonData = auditLogs.map(log => ({
    timestamp: log.createdAt,
    agency: log.agency,
    user: log.user,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    ipAddress: log.ipAddress,
    userAgent: log.userAgent,
    changes: log.changes ? JSON.parse(log.changes) : null
  }))

  return new NextResponse(JSON.stringify(jsonData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="audit-logs.json"'
    }
  })
}