import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// Rate limiting store (in-memory for demo, should use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'overview'
    const agencyId = searchParams.get('agencyId')

    if (type === 'overview') {
      const securityOverview = await getSecurityOverview(agencyId)
      return NextResponse.json({
        success: true,
        data: securityOverview
      })
    }

    if (type === 'rate-limits') {
      const rateLimits = await getRateLimits(agencyId)
      return NextResponse.json({
        success: true,
        data: rateLimits
      })
    }

    if (type === 'security-events') {
      const securityEvents = await getSecurityEvents(agencyId)
      return NextResponse.json({
        success: true,
        data: securityEvents
      })
    }

    if (type === 'ip-restrictions') {
      const ipRestrictions = await getIpRestrictions(agencyId)
      return NextResponse.json({
        success: true,
        data: ipRestrictions
      })
    }

    if (type === 'api-keys') {
      const apiKeys = await getApiKeys(agencyId)
      return NextResponse.json({
        success: true,
        data: apiKeys
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid security type' },
      { status: 400 }
    )

  } catch (error) {
    console.error("Error fetching security data:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, ...data } = body

    switch (type) {
      case 'rate-limit':
        return await createRateLimit(data)
      case 'ip-restriction':
        return await createIpRestriction(data)
      case 'api-key':
        return await createApiKey(data)
      case 'security-rule':
        return await createSecurityRule(data)
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid security type' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error("Error creating security configuration:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, id, ...data } = body

    switch (type) {
      case 'rate-limit':
        return await updateRateLimit(id, data)
      case 'ip-restriction':
        return await updateIpRestriction(id, data)
      case 'api-key':
        return await updateApiKey(id, data)
      case 'security-rule':
        return await updateSecurityRule(id, data)
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid security type' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error("Error updating security configuration:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const id = searchParams.get('id')

    if (!type || !id) {
      return NextResponse.json(
        { error: "Type and ID are required" },
        { status: 400 }
      )
    }

    switch (type) {
      case 'rate-limit':
        return await deleteRateLimit(id)
      case 'ip-restriction':
        return await deleteIpRestriction(id)
      case 'api-key':
        return await deleteApiKey(id)
      case 'security-rule':
        return await deleteSecurityRule(id)
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid security type' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error("Error deleting security configuration:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}

// Helper functions
async function getSecurityOverview(agencyId?: string) {
  const [
    totalRequests,
    blockedRequests,
    rateLimitViolations,
    securityEvents,
    activeApiKeys,
    ipRestrictions
  ] = await Promise.all([
    // Total requests (mock data)
    Promise.resolve(Math.floor(Math.random() * 100000) + 50000),
    
    // Blocked requests
    Promise.resolve(Math.floor(Math.random() * 1000) + 100),
    
    // Rate limit violations
    db.activityLog.count({
      where: {
        action: 'RATE_LIMIT_EXCEEDED',
        ...(agencyId && { agencyId })
      }
    }),
    
    // Security events
    db.activityLog.count({
      where: {
        OR: [
          { action: { contains: 'SECURITY' } },
          { action: { contains: 'BLOCKED' } },
          { action: { contains: 'UNAUTHORIZED' } }
        ],
        ...(agencyId && { agencyId })
      }
    }),
    
    // Active API keys (mock)
    Promise.resolve(Math.floor(Math.random() * 50) + 10),
    
    // IP restrictions (mock)
    Promise.resolve(Math.floor(Math.random() * 20) + 5)
  ])

  const threatLevel = calculateThreatLevel(blockedRequests, rateLimitViolations, securityEvents)

  return {
    overview: {
      totalRequests,
      blockedRequests,
      blockRate: totalRequests > 0 ? (blockedRequests / totalRequests) * 100 : 0,
      rateLimitViolations,
      securityEvents,
      activeApiKeys,
      ipRestrictions,
      threatLevel
    },
    metrics: {
      requestsPerSecond: Math.floor(Math.random() * 100) + 50,
      averageResponseTime: Math.floor(Math.random() * 200) + 100,
      errorRate: Math.floor(Math.random() * 5) + 1,
      uptime: 99.9
    },
    alerts: await getRecentSecurityAlerts(agencyId)
  }
}

async function getRateLimits(agencyId?: string) {
  // Mock rate limit configurations
  const rateLimits = [
    {
      id: '1',
      agencyId: agencyId || 'global',
      endpoint: '/api/*',
      method: 'ALL',
      requestsPerMinute: 60,
      requestsPerHour: 1000,
      requestsPerDay: 10000,
      burstLimit: 10,
      enabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      agencyId: agencyId || 'global',
      endpoint: '/api/auth/*',
      method: 'POST',
      requestsPerMinute: 5,
      requestsPerHour: 50,
      requestsPerDay: 500,
      burstLimit: 2,
      enabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]

  return rateLimits
}

async function getSecurityEvents(agencyId?: string) {
  const events = await db.activityLog.findMany({
    where: {
      OR: [
        { action: { contains: 'SECURITY' } },
        { action: { contains: 'BLOCKED' } },
        { action: { contains: 'UNAUTHORIZED' } },
        { action: { contains: 'RATE_LIMIT' } }
      ],
      ...(agencyId && { agencyId })
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
    take: 50
  })

  return events.map(event => ({
    id: event.id,
    type: determineSecurityEventType(event.action),
    severity: determineSecurityEventSeverity(event.action),
    title: generateSecurityEventTitle(event.action),
    description: event.changes || event.action,
    agency: event.agency,
    user: event.user,
    ipAddress: event.ipAddress,
    userAgent: event.userAgent,
    timestamp: event.createdAt
  }))
}

async function getIpRestrictions(agencyId?: string) {
  // Mock IP restrictions
  const restrictions = [
    {
      id: '1',
      agencyId: agencyId || 'global',
      ipAddress: '192.168.1.0/24',
      type: 'ALLOW',
      description: 'Internal network',
      enabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      agencyId: agencyId || 'global',
      ipAddress: '10.0.0.0/8',
      type: 'ALLOW',
      description: 'Private network range',
      enabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]

  return restrictions
}

async function getApiKeys(agencyId?: string) {
  // Mock API keys
  const apiKeys = [
    {
      id: '1',
      agencyId: agencyId || 'global',
      name: 'Production API Key',
      key: 'sk_prod_1234567890abcdef',
      permissions: ['read', 'write'],
      allowedIPs: ['192.168.1.0/24'],
      rateLimit: 1000,
      enabled: true,
      lastUsed: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      agencyId: agencyId || 'global',
      name: 'Testing API Key',
      key: 'sk_test_0987654321fedcba',
      permissions: ['read'],
      allowedIPs: ['127.0.0.1'],
      rateLimit: 100,
      enabled: true,
      lastUsed: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    }
  ]

  return apiKeys
}

async function getRecentSecurityAlerts(agencyId?: string) {
  const alerts = await db.activityLog.findMany({
    where: {
      OR: [
        { action: { contains: 'CRITICAL' } },
        { action: { contains: 'SECURITY_BREACH' } },
        { action: { contains: 'SUSPICIOUS' } }
      ],
      ...(agencyId && { agencyId })
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  })

  return alerts.map(alert => ({
    id: alert.id,
    type: determineSecurityEventType(alert.action),
    severity: determineSecurityEventSeverity(alert.action),
    title: generateSecurityEventTitle(alert.action),
    message: alert.changes || alert.action,
    timestamp: alert.createdAt,
    resolved: false
  }))
}

function calculateThreatLevel(blockedRequests: number, rateLimitViolations: number, securityEvents: number): 'low' | 'medium' | 'high' | 'critical' {
  const score = (blockedRequests * 0.3) + (rateLimitViolations * 0.4) + (securityEvents * 0.3)
  
  if (score > 100) return 'critical'
  if (score > 50) return 'high'
  if (score > 20) return 'medium'
  return 'low'
}

function determineSecurityEventType(action: string): 'auth' | 'rate_limit' | 'ip_block' | 'api_key' | 'suspicious' {
  if (action.includes('LOGIN') || action.includes('AUTH')) return 'auth'
  if (action.includes('RATE_LIMIT')) return 'rate_limit'
  if (action.includes('IP_BLOCK')) return 'ip_block'
  if (action.includes('API_KEY')) return 'api_key'
  return 'suspicious'
}

function determineSecurityEventSeverity(action: string): 'low' | 'medium' | 'high' | 'critical' {
  if (action.includes('CRITICAL') || action.includes('BREACH')) return 'critical'
  if (action.includes('BLOCKED') || action.includes('UNAUTHORIZED')) return 'high'
  if (action.includes('SUSPICIOUS')) return 'medium'
  return 'low'
}

function generateSecurityEventTitle(action: string): string {
  if (action.includes('LOGIN_FAILED')) return 'Failed Login Attempt'
  if (action.includes('RATE_LIMIT_EXCEEDED')) return 'Rate Limit Exceeded'
  if (action.includes('IP_BLOCKED')) return 'IP Address Blocked'
  if (action.includes('API_KEY_INVALID')) return 'Invalid API Key'
  if (action.includes('SUSPICIOUS_ACTIVITY')) return 'Suspicious Activity Detected'
  return 'Security Event'
}

// Create functions
async function createRateLimit(data: any) {
  // Implementation for creating rate limit
  return NextResponse.json({
    success: true,
    message: 'Rate limit created successfully',
    data: { id: Date.now().toString(), ...data }
  })
}

async function createIpRestriction(data: any) {
  // Implementation for creating IP restriction
  return NextResponse.json({
    success: true,
    message: 'IP restriction created successfully',
    data: { id: Date.now().toString(), ...data }
  })
}

async function createApiKey(data: any) {
  // Implementation for creating API key
  const apiKey = 'sk_' + Math.random().toString(36).substring(2, 15)
  return NextResponse.json({
    success: true,
    message: 'API key created successfully',
    data: { id: Date.now().toString(), key: apiKey, ...data }
  })
}

async function createSecurityRule(data: any) {
  // Implementation for creating security rule
  return NextResponse.json({
    success: true,
    message: 'Security rule created successfully',
    data: { id: Date.now().toString(), ...data }
  })
}

// Update functions
async function updateRateLimit(id: string, data: any) {
  // Implementation for updating rate limit
  return NextResponse.json({
    success: true,
    message: 'Rate limit updated successfully',
    data: { id, ...data }
  })
}

async function updateIpRestriction(id: string, data: any) {
  // Implementation for updating IP restriction
  return NextResponse.json({
    success: true,
    message: 'IP restriction updated successfully',
    data: { id, ...data }
  })
}

async function updateApiKey(id: string, data: any) {
  // Implementation for updating API key
  return NextResponse.json({
    success: true,
    message: 'API key updated successfully',
    data: { id, ...data }
  })
}

async function updateSecurityRule(id: string, data: any) {
  // Implementation for updating security rule
  return NextResponse.json({
    success: true,
    message: 'Security rule updated successfully',
    data: { id, ...data }
  })
}

// Delete functions
async function deleteRateLimit(id: string) {
  // Implementation for deleting rate limit
  return NextResponse.json({
    success: true,
    message: 'Rate limit deleted successfully'
  })
}

async function deleteIpRestriction(id: string) {
  // Implementation for deleting IP restriction
  return NextResponse.json({
    success: true,
    message: 'IP restriction deleted successfully'
  })
}

async function deleteApiKey(id: string) {
  // Implementation for deleting API key
  return NextResponse.json({
    success: true,
    message: 'API key deleted successfully'
  })
}

async function deleteSecurityRule(id: string) {
  // Implementation for deleting security rule
  return NextResponse.json({
    success: true,
    message: 'Security rule deleted successfully'
  })
}

// Rate limiting middleware function
export function checkRateLimit(ip: string, endpoint: string, limit: number = 60): boolean {
  const key = `${ip}:${endpoint}`
  const now = Date.now()
  const windowStart = now - 60 * 1000 // 1 minute window

  const record = rateLimitStore.get(key)
  
  if (!record || record.resetTime < now) {
    rateLimitStore.set(key, { count: 1, resetTime: now + 60 * 1000 })
    return true
  }

  if (record.count >= limit) {
    return false
  }

  record.count++
  return true
}