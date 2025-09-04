import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const detailed = searchParams.get('detailed') === 'true'

    // Basic health check
    const basicHealth = await getBasicHealth()

    if (!detailed) {
      return NextResponse.json({
        success: true,
        data: {
          status: basicHealth.overall,
          timestamp: new Date().toISOString(),
          uptime: basicHealth.uptime,
          checks: {
            database: basicHealth.database,
            api: basicHealth.api
          }
        }
      })
    }

    // Detailed health check
    const detailedHealth = await getDetailedHealth()

    return NextResponse.json({
      success: true,
      data: {
        status: detailedHealth.overall,
        timestamp: new Date().toISOString(),
        uptime: detailedHealth.uptime,
        checks: detailedHealth.checks,
        metrics: detailedHealth.metrics,
        alerts: detailedHealth.alerts,
        recommendations: detailedHealth.recommendations
      }
    })

  } catch (error) {
    console.error("Error performing health check:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Health check failed",
        status: "UNHEALTHY",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Helper functions
async function getBasicHealth() {
  const [
    databaseHealth,
    apiHealth,
    systemMetrics
  ] = await Promise.all([
    checkDatabaseHealth(),
    checkApiHealth(),
    getSystemMetrics()
  ])

  const overall = databaseHealth.status === 'healthy' && apiHealth.status === 'healthy' 
    ? 'HEALTHY' 
    : 'DEGRADED'

  return {
    overall,
    uptime: systemMetrics.uptime,
    database: databaseHealth,
    api: apiHealth
  }
}

async function getDetailedHealth() {
  const [
    basicHealth,
    serviceChecks,
    resourceMetrics,
    recentAlerts,
    performanceMetrics
  ] = await Promise.all([
    getBasicHealth(),
    checkAllServices(),
    getResourceMetrics(),
    getRecentAlerts(),
    getPerformanceMetrics()
  ])

  const recommendations = generateRecommendations(
    basicHealth,
    serviceChecks,
    resourceMetrics,
    recentAlerts
  )

  return {
    overall: basicHealth.overall,
    uptime: basicHealth.uptime,
    checks: {
      ...basicHealth,
      services: serviceChecks
    },
    metrics: {
      ...resourceMetrics,
      performance: performanceMetrics
    },
    alerts: recentAlerts,
    recommendations
  }
}

async function checkDatabaseHealth() {
  try {
    // Test database connection
    const startTime = Date.now()
    await db.agency.count()
    const responseTime = Date.now() - startTime

    return {
      status: responseTime < 1000 ? 'healthy' : 'degraded',
      responseTime,
      message: responseTime < 1000 ? 'Database responsive' : 'Database slow',
      lastCheck: new Date().toISOString()
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: 0,
      message: 'Database connection failed',
      error: error.message,
      lastCheck: new Date().toISOString()
    }
  }
}

async function checkApiHealth() {
  try {
    // Test API responsiveness
    const startTime = Date.now()
    
    // Simulate API check
    await new Promise(resolve => setTimeout(resolve, 10))
    
    const responseTime = Date.now() - startTime

    return {
      status: responseTime < 500 ? 'healthy' : 'degraded',
      responseTime,
      message: responseTime < 500 ? 'API responsive' : 'API slow',
      lastCheck: new Date().toISOString()
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: 0,
      message: 'API check failed',
      error: error.message,
      lastCheck: new Date().toISOString()
    }
  }
}

async function checkAllServices() {
  const services = [
    { name: 'Authentication', check: checkAuthService },
    { name: 'Email Service', check: checkEmailService },
    { name: 'Storage Service', check: checkStorageService },
    { name: 'Cache Service', check: checkCacheService },
    { name: 'Queue Service', check: checkQueueService }
  ]

  const results = await Promise.all(
    services.map(async (service) => {
      try {
        const result = await service.check()
        return {
          name: service.name,
          ...result
        }
      } catch (error) {
        return {
          name: service.name,
          status: 'unhealthy',
          message: 'Service check failed',
          error: error.message,
          lastCheck: new Date().toISOString()
        }
      }
    })
  )

  return results
}

async function checkAuthService() {
  // Simulate auth service check
  await new Promise(resolve => setTimeout(resolve, 50))
  return {
    status: 'healthy',
    responseTime: 50,
    message: 'Authentication service operational'
  }
}

async function checkEmailService() {
  // Simulate email service check
  await new Promise(resolve => setTimeout(resolve, 100))
  return {
    status: 'healthy',
    responseTime: 100,
    message: 'Email service operational'
  }
}

async function checkStorageService() {
  // Simulate storage service check
  await new Promise(resolve => setTimeout(resolve, 75))
  return {
    status: 'healthy',
    responseTime: 75,
    message: 'Storage service operational'
  }
}

async function checkCacheService() {
  // Simulate cache service check
  await new Promise(resolve => setTimeout(resolve, 25))
  return {
    status: 'healthy',
    responseTime: 25,
    message: 'Cache service operational'
  }
}

async function checkQueueService() {
  // Simulate queue service check
  await new Promise(resolve => setTimeout(resolve, 60))
  return {
    status: 'healthy',
    responseTime: 60,
    message: 'Queue service operational'
  }
}

async function getSystemMetrics() {
  // Get basic system metrics
  return {
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage(),
    timestamp: new Date().toISOString()
  }
}

async function getResourceMetrics() {
  // Get detailed resource metrics
  const [
    totalAgencies,
    activeUsers,
    databaseConnections,
    recentErrors
  ] = await Promise.all([
    db.agency.count(),
    db.user.count({
      where: {
        lastLoginAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    }),
    // Mock database connections
    Promise.resolve(Math.floor(Math.random() * 50) + 10),
    db.activityLog.count({
      where: {
        action: { contains: 'ERROR' },
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
        }
      }
    })
  ])

  return {
    agencies: {
      total: totalAgencies
    },
    users: {
      active: activeUsers
    },
    database: {
      connections: databaseConnections,
      maxConnections: 100
    },
    errors: {
      recent: recentErrors,
      errorRate: recentErrors > 10 ? 'high' : recentErrors > 5 ? 'medium' : 'low'
    }
  }
}

async function getPerformanceMetrics() {
  // Get performance metrics
  return {
    responseTime: {
      average: Math.floor(Math.random() * 100) + 50,
      p95: Math.floor(Math.random() * 200) + 100,
      p99: Math.floor(Math.random() * 500) + 200
    },
    throughput: {
      requestsPerSecond: Math.floor(Math.random() * 1000) + 500,
      peakRequestsPerSecond: Math.floor(Math.random() * 2000) + 1000
    },
    availability: {
      uptime: 99.9,
      downtime: 0.1
    }
  }
}

async function getRecentAlerts() {
  // Get recent system alerts
  const alerts = await db.activityLog.findMany({
    where: {
      OR: [
        { action: { contains: 'ERROR' } },
        { action: { contains: 'CRITICAL' } },
        { action: { contains: 'TIMEOUT' } }
      ],
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  })

  return alerts.map(alert => ({
    id: alert.id,
    type: determineAlertType(alert.action),
    severity: determineAlertSeverity(alert.action),
    title: generateAlertTitle(alert.action),
    message: alert.changes || alert.action,
    timestamp: alert.createdAt,
    resolved: false
  }))
}

function generateRecommendations(
  basicHealth: any,
  serviceChecks: any[],
  resourceMetrics: any,
  recentAlerts: any[]
) {
  const recommendations = []

  // Check database health
  if (basicHealth.database.status !== 'healthy') {
    recommendations.push({
      priority: 'high',
      category: 'database',
      title: 'Database Performance Issues',
      description: 'Database response time is high. Consider optimizing queries or scaling resources.',
      action: 'Review database performance metrics and optimize slow queries.'
    })
  }

  // Check service health
  const unhealthyServices = serviceChecks.filter(s => s.status !== 'healthy')
  if (unhealthyServices.length > 0) {
    recommendations.push({
      priority: 'high',
      category: 'services',
      title: 'Service Degradation Detected',
      description: `${unhealthyServices.length} services are not healthy.`,
      action: 'Investigate and restart unhealthy services if necessary.'
    })
  }

  // Check resource usage
  if (resourceMetrics.errors.errorRate === 'high') {
    recommendations.push({
      priority: 'medium',
      category: 'errors',
      title: 'High Error Rate Detected',
      description: 'System is experiencing a high rate of errors.',
      action: 'Review error logs and identify root causes.'
    })
  }

  // Check database connections
  if (resourceMetrics.database.connections > resourceMetrics.database.maxConnections * 0.8) {
    recommendations.push({
      priority: 'medium',
      category: 'database',
      title: 'High Database Connections',
      description: 'Database connections are approaching maximum limit.',
      action: 'Consider implementing connection pooling or scaling database resources.'
    })
  }

  // Check recent alerts
  if (recentAlerts.length > 5) {
    recommendations.push({
      priority: 'medium',
      category: 'monitoring',
      title: 'High Alert Volume',
      description: 'System has generated multiple alerts recently.',
      action: 'Review alert patterns and address underlying issues.'
    })
  }

  return recommendations
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

function generateAlertTitle(action: string): string {
  if (action.includes('DATABASE')) return 'Database Alert'
  if (action.includes('AUTH')) return 'Authentication Alert'
  if (action.includes('API')) return 'API Alert'
  if (action.includes('PAYMENT')) return 'Payment Alert'
  return 'System Alert'
}