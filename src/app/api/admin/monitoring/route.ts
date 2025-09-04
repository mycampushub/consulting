import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '24h'
    const type = searchParams.get('type') || 'overview'

    // Calculate date range based on timeframe
    const now = new Date()
    let startDate = new Date()
    
    switch (timeframe) {
      case '1h':
        startDate.setHours(now.getHours() - 1)
        break
      case '24h':
        startDate.setHours(now.getHours() - 24)
        break
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      default:
        startDate.setHours(now.getHours() - 24)
    }

    if (type === 'overview') {
      // Get comprehensive system overview
      const [
        totalAgencies,
        activeAgencies,
        totalUsers,
        activeUsers,
        totalStudents,
        totalApplications,
        systemHealth,
        recentAlerts,
        performanceMetrics
      ] = await Promise.all([
        // Total agencies
        db.agency.count(),
        
        // Active agencies
        db.agency.count({
          where: { status: 'ACTIVE' }
        }),
        
        // Total users
        db.user.count(),
        
        // Active users (logged in within last 24 hours)
        db.user.count({
          where: {
            lastLoginAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
          }
        }),
        
        // Total students
        db.student.count(),
        
        // Total applications
        db.application.count(),
        
        // System health metrics
        getSystemHealthMetrics(),
        
        // Recent alerts
        getRecentAlerts(startDate),
        
        // Performance metrics
        getPerformanceMetrics(startDate)
      ])

      return NextResponse.json({
        success: true,
        data: {
          overview: {
            totalAgencies,
            activeAgencies,
            totalUsers,
            activeUsers,
            totalStudents,
            totalApplications,
            agencyHealth: {
              healthy: activeAgencies,
              warning: totalAgencies - activeAgencies,
              critical: 0
            }
          },
          systemHealth,
          recentAlerts,
          performanceMetrics,
          timeframe
        }
      })
    }

    if (type === 'health') {
      // Detailed health metrics
      const healthMetrics = await getDetailedHealthMetrics(startDate)
      
      return NextResponse.json({
        success: true,
        data: {
          health: healthMetrics,
          timeframe
        }
      })
    }

    if (type === 'performance') {
      // Performance analytics
      const performanceData = await getPerformanceAnalytics(startDate)
      
      return NextResponse.json({
        success: true,
        data: {
          performance: performanceData,
          timeframe
        }
      })
    }

    if (type === 'alerts') {
      // Alerts and notifications
      const alerts = await getAlerts(startDate)
      
      return NextResponse.json({
        success: true,
        data: {
          alerts,
          timeframe
        }
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid monitoring type' },
      { status: 400 }
    )

  } catch (error) {
    console.error("Error fetching monitoring data:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}

// Helper functions
async function getSystemHealthMetrics() {
  // Get system-wide health metrics
  const [
    totalAgencies,
    activeAgencies,
    suspendedAgencies,
    totalActivityLogs,
    errorLogs
  ] = await Promise.all([
    db.agency.count(),
    db.agency.count({ where: { status: 'ACTIVE' } }),
    db.agency.count({ where: { status: 'SUSPENDED' } }),
    db.activityLog.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    }),
    db.activityLog.count({
      where: {
        action: { contains: 'ERROR' },
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    })
  ])

  const errorRate = totalActivityLogs > 0 ? (errorLogs / totalActivityLogs) * 100 : 0
  
  // Determine overall system health
  let overallHealth = 'HEALTHY'
  if (errorRate > 5 || suspendedAgencies > totalAgencies * 0.1) {
    overallHealth = 'WARNING'
  }
  if (errorRate > 10 || suspendedAgencies > totalAgencies * 0.2) {
    overallHealth = 'CRITICAL'
  }

  return {
    overall: overallHealth,
    agencies: {
      total: totalAgencies,
      active: activeAgencies,
      suspended: suspendedAgencies,
      healthPercentage: totalAgencies > 0 ? (activeAgencies / totalAgencies) * 100 : 100
    },
    system: {
      uptime: 99.9, // Mock data
      responseTime: Math.floor(Math.random() * 100) + 50,
      errorRate,
      lastCheck: new Date().toISOString()
    }
  }
}

async function getRecentAlerts(startDate: Date) {
  // Get recent system alerts
  const alerts = await db.activityLog.findMany({
    where: {
      action: { contains: 'ERROR' },
      createdAt: { gte: startDate }
    },
    include: {
      agency: {
        select: {
          name: true,
          subdomain: true
        }
      },
      user: {
        select: {
          name: true,
          email: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  })

  return alerts.map(alert => ({
    id: alert.id,
    type: 'ERROR',
    title: `Error in ${alert.agency?.name || 'System'}`,
    message: alert.action,
    agency: alert.agency?.name,
    timestamp: alert.createdAt,
    severity: 'high'
  }))
}

async function getPerformanceMetrics(startDate: Date) {
  // Get performance metrics
  const [
    totalRequests,
    averageResponseTime,
    databaseConnections,
    memoryUsage,
    cpuUsage
  ] = await Promise.all([
    // Total requests (mock data from activity logs)
    db.activityLog.count({
      where: { createdAt: { gte: startDate } }
    }),
    
    // Average response time (mock)
    Promise.resolve(Math.floor(Math.random() * 200) + 100),
    
    // Database connections (mock)
    Promise.resolve(Math.floor(Math.random() * 50) + 10),
    
    // Memory usage (mock)
    Promise.resolve(Math.floor(Math.random() * 30) + 40),
    
    // CPU usage (mock)
    Promise.resolve(Math.floor(Math.random() * 40) + 20)
  ])

  return {
    requests: {
      total: totalRequests,
      perSecond: totalRequests / (24 * 60 * 60) // Requests per second
    },
    response: {
      average: averageResponseTime,
      p95: averageResponseTime * 1.5,
      p99: averageResponseTime * 2
    },
    system: {
      databaseConnections,
      memoryUsage,
      cpuUsage,
      diskUsage: Math.floor(Math.random() * 30) + 40
    }
  }
}

async function getDetailedHealthMetrics(startDate: Date) {
  // Get detailed health metrics for each component
  const [
    agencyHealth,
    userActivity,
    systemErrors,
    performanceData
  ] = await Promise.all([
    // Agency health distribution
    db.agency.groupBy({
      by: ['status'],
      _count: { status: true }
    }),
    
    // User activity
    db.user.groupBy({
      by: ['status'],
      _count: { status: true }
    }),
    
    // System errors
    db.activityLog.groupBy({
      by: ['action'],
      _count: { action: true },
      where: {
        action: { contains: 'ERROR' },
        createdAt: { gte: startDate }
      }
    }),
    
    // Performance data
    getPerformanceMetrics(startDate)
  ])

  return {
    agencies: agencyHealth.reduce((acc, item) => {
      acc[item.status] = item._count.status
      return acc
    }, {} as Record<string, number>),
    
    users: userActivity.reduce((acc, item) => {
      acc[item.status] = item._count.status
      return acc
    }, {} as Record<string, number>),
    
    errors: systemErrors.map(item => ({
      type: item.action,
      count: item._count.action
    })),
    
    performance: performanceData,
    
    checks: {
      database: { status: 'healthy', latency: Math.floor(Math.random() * 10) + 1 },
      redis: { status: 'healthy', latency: Math.floor(Math.random() * 5) + 1 },
      storage: { status: 'healthy', latency: Math.floor(Math.random() * 20) + 5 },
      api: { status: 'healthy', latency: Math.floor(Math.random() * 100) + 50 }
    }
  }
}

async function getPerformanceAnalytics(startDate: Date) {
  // Get detailed performance analytics
  const activityByHour = await db.activityLog.groupBy({
    by: ['createdAt'],
    _count: { createdAt: true },
    where: {
      createdAt: { gte: startDate }
    },
    orderBy: { createdAt: 'asc' }
  })

  // Group activity by hour
  const hourlyActivity = activityByHour.reduce((acc, item) => {
    const hour = new Date(item.createdAt).getHours()
    if (!acc[hour]) {
      acc[hour] = 0
    }
    acc[hour] += item._count.createdAt
    return acc
  }, {} as Record<number, number>)

  return {
    timeline: Object.entries(hourlyActivity).map(([hour, count]) => ({
      hour: parseInt(hour),
      count,
      timestamp: new Date().setHours(parseInt(hour), 0, 0, 0)
    })),
    topEndpoints: [
      { endpoint: '/api/auth/login', requests: 1250, avgResponseTime: 120 },
      { endpoint: '/api/students', requests: 890, avgResponseTime: 180 },
      { endpoint: '/api/applications', requests: 650, avgResponseTime: 150 },
      { endpoint: '/api/analytics', requests: 420, avgResponseTime: 200 }
    ],
    errorRates: [
      { time: '00:00', rate: 0.5 },
      { time: '06:00', rate: 0.8 },
      { time: '12:00', rate: 1.2 },
      { time: '18:00', rate: 0.9 },
      { time: '23:59', rate: 0.6 }
    ]
  }
}

async function getAlerts(startDate: Date) {
  // Get all alerts with detailed information
  const alerts = await db.activityLog.findMany({
    where: {
      OR: [
        { action: { contains: 'ERROR' } },
        { action: { contains: 'FAILED' } },
        { action: { contains: 'TIMEOUT' } }
      ],
      createdAt: { gte: startDate }
    },
    include: {
      agency: {
        select: {
          name: true,
          subdomain: true
        }
      },
      user: {
        select: {
          name: true,
          email: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return alerts.map(alert => ({
    id: alert.id,
    type: determineAlertType(alert.action),
    severity: determineAlertSeverity(alert.action),
    title: generateAlertTitle(alert.action, alert.agency?.name),
    message: alert.changes || alert.action,
    agency: alert.agency?.name,
    user: alert.user?.name,
    timestamp: alert.createdAt,
    resolved: false,
    metadata: {
      entityType: alert.entityType,
      entityId: alert.entityId,
      ipAddress: alert.ipAddress
    }
  }))
}

function determineAlertType(action: string): 'ERROR' | 'WARNING' | 'INFO' {
  if (action.includes('CRITICAL') || action.includes('FATAL')) return 'ERROR'
  if (action.includes('WARNING') || action.includes('TIMEOUT')) return 'WARNING'
  return 'INFO'
}

function determineAlertSeverity(action: string): 'low' | 'medium' | 'high' | 'critical' {
  if (action.includes('CRITICAL') || action.includes('FATAL')) return 'critical'
  if (action.includes('ERROR')) return 'high'
  if (action.includes('WARNING')) return 'medium'
  return 'low'
}

function generateAlertTitle(action: string, agencyName?: string): string {
  const base = agencyName ? `${agencyName}: ` : 'System: '
  
  if (action.includes('LOGIN')) return base + 'Authentication Issue'
  if (action.includes('DATABASE')) return base + 'Database Error'
  if (action.includes('PAYMENT')) return base + 'Payment Processing Error'
  if (action.includes('API')) return base + 'API Error'
  
  return base + 'System Alert'
}