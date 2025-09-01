import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'overview'
    const agencyId = searchParams.get('agencyId')

    if (type === 'overview') {
      // Get integrations overview
      const [
        totalIntegrations,
        activeIntegrations,
        failedIntegrations,
        recentSyncs,
        integrationUsage
      ] = await Promise.all([
        // Total integrations (mock data - would need to implement integration tracking)
        Promise.resolve(15),
        
        // Active integrations
        Promise.resolve(12),
        
        // Failed integrations
        Promise.resolve(1),
        
        // Recent sync activities
        db.activityLog.count({
          where: {
            action: {
              in: ['INTEGRATION_SYNC', 'INTEGRATION_SUCCESS', 'INTEGRATION_FAILED']
            },
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            },
            ...(agencyId && { agencyId })
          }
        }),
        
        // Integration usage by category
        Promise.resolve([
          { category: 'CRM', count: 5, active: 4 },
          { category: 'Marketing', count: 4, active: 3 },
          { category: 'Accounting', count: 3, active: 3 },
          { category: 'Communication', count: 2, active: 2 },
          { category: 'Analytics', count: 1, active: 0 }
        ])
      ])

      return NextResponse.json({
        success: true,
        data: {
          overview: {
            totalIntegrations,
            activeIntegrations,
            failedIntegrations,
            recentSyncs,
            integrationUsage
          }
        }
      })
    }

    if (type === 'available') {
      // Get available integrations
      const availableIntegrations = [
        {
          id: 'salesforce',
          name: 'Salesforce',
          category: 'CRM',
          description: 'Connect with Salesforce CRM for unified customer management',
          status: 'AVAILABLE',
          pricing: 'premium',
          features: ['Contact Sync', 'Lead Management', 'Opportunity Tracking'],
          setupTime: '15 minutes',
          documentation: 'https://docs.example.com/salesforce'
        },
        {
          id: 'hubspot',
          name: 'HubSpot',
          category: 'Marketing',
          description: 'Marketing automation and CRM platform integration',
          status: 'AVAILABLE',
          pricing: 'premium',
          features: ['Contact Sync', 'Email Marketing', 'Lead Scoring', 'Analytics'],
          setupTime: '10 minutes',
          documentation: 'https://docs.example.com/hubspot'
        },
        {
          id: 'quickbooks',
          name: 'QuickBooks',
          category: 'Accounting',
          description: 'Accounting and financial management integration',
          status: 'AVAILABLE',
          pricing: 'premium',
          features: ['Invoice Sync', 'Payment Tracking', 'Financial Reports'],
          setupTime: '20 minutes',
          documentation: 'https://docs.example.com/quickbooks'
        },
        {
          id: 'slack',
          name: 'Slack',
          category: 'Communication',
          description: 'Team communication and collaboration platform',
          status: 'AVAILABLE',
          pricing: 'free',
          features: ['Notifications', 'Channel Updates', 'File Sharing'],
          setupTime: '5 minutes',
          documentation: 'https://docs.example.com/slack'
        },
        {
          id: 'google-analytics',
          name: 'Google Analytics',
          category: 'Analytics',
          description: 'Web analytics and marketing insights',
          status: 'AVAILABLE',
          pricing: 'free',
          features: ['Traffic Analysis', 'Conversion Tracking', 'Custom Reports'],
          setupTime: '10 minutes',
          documentation: 'https://docs.example.com/ga'
        },
        {
          id: 'zapier',
          name: 'Zapier',
          category: 'Automation',
          description: 'Connect with 5000+ apps through Zapier',
          status: 'AVAILABLE',
          pricing: 'premium',
          features: ['Multi-app Workflows', 'Custom Triggers', 'Data Transformation'],
          setupTime: '15 minutes',
          documentation: 'https://docs.example.com/zapier'
        }
      ]

      return NextResponse.json({
        success: true,
        data: {
          integrations: availableIntegrations
        }
      })
    }

    if (type === 'installed') {
      // Get installed integrations for an agency
      if (!agencyId) {
        return NextResponse.json(
          { success: false, error: 'Agency ID is required' },
          { status: 400 }
        )
      }

      const installedIntegrations = [
        {
          id: 'salesforce',
          name: 'Salesforce',
          category: 'CRM',
          status: 'ACTIVE',
          installedAt: '2024-01-15T10:30:00Z',
          lastSync: '2024-01-20T14:45:00Z',
          syncStatus: 'SUCCESS',
          config: {
            apiKey: '••••••••',
            instanceUrl: 'https://example.my.salesforce.com',
            version: '56.0'
          },
          usage: {
            contactsSynced: 1250,
            leadsSynced: 340,
            last24hSyncs: 15
          }
        },
        {
          id: 'slack',
          name: 'Slack',
          category: 'Communication',
          status: 'ACTIVE',
          installedAt: '2024-01-10T09:15:00Z',
          lastSync: '2024-01-20T16:20:00Z',
          syncStatus: 'SUCCESS',
          config: {
            webhookUrl: 'https://hooks.slack.com/services/••••••••',
            channel: '#agency-updates'
          },
          usage: {
            messagesSent: 2450,
            notificationsDelivered: 1890,
            last24hSyncs: 45
          }
        }
      ]

      return NextResponse.json({
        success: true,
        data: {
          integrations: installedIntegrations
        }
      })
    }

    if (type === 'sync-logs') {
      // Get integration sync logs
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '50')
      const offset = (page - 1) * limit

      const where: any = {
        action: {
          in: ['INTEGRATION_SYNC', 'INTEGRATION_SUCCESS', 'INTEGRATION_FAILED']
        }
      }
      if (agencyId) where.agencyId = agencyId

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

    return NextResponse.json(
      { success: false, error: 'Invalid integrations type' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error fetching enterprise integrations data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch enterprise integrations data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, action, data } = body

    if (type === 'install') {
      const { integrationId, agencyId, config } = data

      // Validate integration exists
      const availableIntegrations = ['salesforce', 'hubspot', 'quickbooks', 'slack', 'google-analytics', 'zapier']
      if (!availableIntegrations.includes(integrationId)) {
        return NextResponse.json(
          { success: false, error: 'Invalid integration ID' },
          { status: 400 }
        )
      }

      // Create installation log
      const installLog = await db.activityLog.create({
        data: {
          action: 'INTEGRATION_INSTALLED',
          entityType: 'INTEGRATION',
          entityId: integrationId,
          changes: JSON.stringify({
            integrationId,
            config: {
              ...config,
              apiKey: '••••••••' // Mask sensitive data
            }
          }),
          agencyId,
          userId: data.userId,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      })

      return NextResponse.json({
        success: true,
        data: {
          id: installLog.id,
          integrationId,
          status: 'INSTALLING',
          message: 'Integration installation initiated'
        }
      })
    }

    if (type === 'uninstall') {
      const { integrationId, agencyId, reason } = data

      // Create uninstallation log
      const uninstallLog = await db.activityLog.create({
        data: {
          action: 'INTEGRATION_UNINSTALLED',
          entityType: 'INTEGRATION',
          entityId: integrationId,
          changes: JSON.stringify({
            integrationId,
            reason
          }),
          agencyId,
          userId: data.userId,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      })

      return NextResponse.json({
        success: true,
        data: {
          id: uninstallLog.id,
          integrationId,
          status: 'UNINSTALLED',
          message: 'Integration uninstalled successfully'
        }
      })
    }

    if (type === 'sync') {
      const { integrationId, agencyId, syncType } = data

      // Create sync log
      const syncLog = await db.activityLog.create({
        data: {
          action: 'INTEGRATION_SYNC',
          entityType: 'INTEGRATION',
          entityId: integrationId,
          changes: JSON.stringify({
            integrationId,
            syncType,
            timestamp: new Date().toISOString()
          }),
          agencyId,
          userId: data.userId,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      })

      return NextResponse.json({
        success: true,
        data: {
          id: syncLog.id,
          integrationId,
          status: 'SYNCING',
          message: 'Integration sync initiated'
        }
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid integration action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error processing enterprise integration action:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process enterprise integration action' },
      { status: 500 }
    )
  }
}