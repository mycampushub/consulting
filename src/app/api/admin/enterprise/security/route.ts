import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'overview'
    const agencyId = searchParams.get('agencyId')

    if (type === 'overview') {
      // Get security overview
      const [
        totalUsers,
        activeUsers,
        suspendedUsers,
        recentFailedLogins,
        securityAlerts,
        complianceStatus
      ] = await Promise.all([
        // Total users
        db.user.count({
          where: agencyId ? { agencyId } : {}
        }),
        
        // Active users
        db.user.count({
          where: {
            status: 'ACTIVE',
            ...(agencyId && { agencyId })
          }
        }),
        
        // Suspended users
        db.user.count({
          where: {
            status: 'SUSPENDED',
            ...(agencyId && { agencyId })
          }
        }),
        
        // Recent failed login attempts (mock - would need to implement login tracking)
        db.activityLog.count({
          where: {
            action: 'LOGIN_FAILED',
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            },
            ...(agencyId && { agencyId })
          }
        }),
        
        // Security alerts
        db.activityLog.count({
          where: {
            action: {
              in: ['SECURITY_ALERT', 'SUSPICIOUS_ACTIVITY', 'UNAUTHORIZED_ACCESS']
            },
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
            },
            ...(agencyId && { agencyId })
          }
        }),
        
        // Compliance status (mock data)
        Promise.resolve({
          soc2: true,
          gdpr: true,
          hipaa: false,
          pciDss: false,
          lastAudit: new Date().toISOString().split('T')[0]
        })
      ])

      return NextResponse.json({
        success: true,
        data: {
          overview: {
            totalUsers,
            activeUsers,
            suspendedUsers,
            recentFailedLogins,
            securityAlerts,
            complianceStatus
          }
        }
      })
    }

    if (type === 'audit-logs') {
      // Get audit logs with pagination
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '50')
      const offset = (page - 1) * limit
      const action = searchParams.get('action')

      const where: any = {}
      if (agencyId) where.agencyId = agencyId
      if (action) where.action = { contains: action }

      const [logs, total] = await Promise.all([
        db.activityLog.findMany({
          where,
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            },
            agency: {
              select: {
                name: true,
                subdomain: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip: offset,
          take: limit
        }),
        db.activityLog.count({ where })
      ])

      return NextResponse.json({
        success: true,
        data: {
          logs,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      })
    }

    if (type === 'access-control') {
      // Get access control matrix
      const accessMatrix = await db.featureAccess.findMany({
        where: agencyId ? { agencyId } : {},
        include: {
          feature: {
            select: {
              name: true,
              category: true,
              slug: true
            }
          },
          agency: {
            select: {
              name: true,
              subdomain: true
            }
          },
          branch: {
            select: {
              name: true,
              code: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 100
      })

      // Group by category
      const byCategory = accessMatrix.reduce((acc, access) => {
        const category = access.feature.category
        if (!acc[category]) {
          acc[category] = []
        }
        acc[category].push(access)
        return acc
      }, {} as Record<string, typeof accessMatrix>)

      return NextResponse.json({
        success: true,
        data: {
          accessMatrix,
          byCategory
        }
      })
    }

    if (type === 'compliance') {
      // Get compliance reports
      const complianceData = {
        soc2: {
          compliant: true,
          lastAudit: '2024-01-15',
          nextAudit: '2025-01-15',
          score: 98,
          findings: [
            { id: 1, severity: 'LOW', description: 'Minor documentation update needed', status: 'OPEN' },
            { id: 2, severity: 'MEDIUM', description: 'Encryption key rotation', status: 'RESOLVED' }
          ]
        },
        gdpr: {
          compliant: true,
          lastAudit: '2024-01-10',
          nextAudit: '2025-01-10',
          score: 96,
          findings: [
            { id: 1, severity: 'LOW', description: 'Data retention policy update', status: 'IN_PROGRESS' }
          ]
        },
        hipaa: {
          compliant: false,
          lastAudit: null,
          nextAudit: null,
          score: 0,
          findings: [
            { id: 1, severity: 'HIGH', description: 'HIPAA compliance not implemented', status: 'OPEN' }
          ]
        },
        pciDss: {
          compliant: false,
          lastAudit: null,
          nextAudit: null,
          score: 0,
          findings: [
            { id: 1, severity: 'HIGH', description: 'PCI DSS compliance not implemented', status: 'OPEN' }
          ]
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          compliance: complianceData
        }
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid security type' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error fetching enterprise security data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch enterprise security data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, action, data } = body

    if (type === 'security-alert') {
      // Create security alert
      const { level, message, agencyId, userId, metadata } = data

      const alert = await db.activityLog.create({
        data: {
          action: 'SECURITY_ALERT',
          entityType: 'SECURITY',
          entityId: 'system',
          changes: JSON.stringify({
            level,
            message,
            metadata
          }),
          agencyId,
          userId,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      })

      return NextResponse.json({
        success: true,
        data: alert
      })
    }

    if (type === 'access-control') {
      // Update access control
      const { featureId, agencyId, branchId, isEnabled, accessLevel, config, limits } = data

      const access = await db.featureAccess.upsert({
        where: {
          agencyId_featureId_branchId: {
            agencyId,
            featureId,
            branchId: branchId || null
          }
        },
        update: {
          isEnabled,
          accessLevel,
          config: config ? JSON.stringify(config) : null,
          limits: limits ? JSON.stringify(limits) : null
        },
        create: {
          agencyId,
          featureId,
          branchId: branchId || null,
          isEnabled,
          accessLevel,
          config: config ? JSON.stringify(config) : null,
          limits: limits ? JSON.stringify(limits) : null
        }
      })

      return NextResponse.json({
        success: true,
        data: access
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid security action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error processing enterprise security action:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process enterprise security action' },
      { status: 500 }
    )
  }
}