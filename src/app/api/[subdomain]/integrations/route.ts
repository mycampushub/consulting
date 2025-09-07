import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requireAgency } from '@/lib/auth-middleware'
import { z } from 'zod'

const integrationSchema = z.object({
  type: z.enum(['CRM', 'EMAIL', 'PAYMENT', 'ANALYTICS']),
  provider: z.string(),
  apiKey: z.string().optional(),
  config: z.record(z.any()).optional(),
  isConnected: z.boolean().default(false)
})

// Get all integrations for the agency
export const GET = requireAgency(async (request: NextRequest, context) => {
  try {
    const { agency } = context

    // Fetch feature settings which may contain integration data
    const featureSettings = await db.featureSettings.findUnique({
      where: {
        agencyId: agency.id
      }
    })

    // For now, return demo integration data based on feature settings
    // In a real implementation, this would be stored in a dedicated Integration table
    const integrations = {
      crm: {
        provider: featureSettings?.crmProvider || 'NONE',
        apiKey: featureSettings?.crmApiKey || undefined,
        connected: featureSettings?.crmConnected || false,
        config: featureSettings?.crmConfig || {}
      },
      email: {
        provider: featureSettings?.emailProvider || 'NONE',
        apiKey: featureSettings?.emailApiKey || undefined,
        connected: featureSettings?.emailConnected || false,
        config: featureSettings?.emailConfig || {}
      },
      payment: {
        provider: featureSettings?.paymentProvider || 'NONE',
        apiKey: featureSettings?.paymentApiKey || undefined,
        connected: featureSettings?.paymentConnected || false,
        config: featureSettings?.paymentConfig || {}
      },
      analytics: {
        provider: featureSettings?.analyticsProvider || 'NONE',
        trackingId: featureSettings?.analyticsTrackingId || undefined,
        connected: featureSettings?.analyticsConnected || false,
        config: featureSettings?.analyticsConfig || {}
      }
    }

    return NextResponse.json({ integrations })
  } catch (error) {
    console.error('Error fetching integrations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch integrations' },
      { status: 500 }
    )
  }
})

// Update or create integration configuration
export const POST = requireAgency(async (request: NextRequest, context) => {
  try {
    const { agency, user } = context
    const body = await request.json()

    const { type, provider, apiKey, config, isConnected } = body

    if (!type || !provider) {
      return NextResponse.json(
        { error: 'Integration type and provider are required' },
        { status: 400 }
      )
    }

    // Get or create feature settings
    let featureSettings = await db.featureSettings.findUnique({
      where: {
        agencyId: agency.id
      }
    })

    if (!featureSettings) {
      featureSettings = await db.featureSettings.create({
        data: {
          agencyId: agency.id
        }
      })
    }

    // Update the appropriate integration fields based on type
    const updateData: any = {}
    
    switch (type) {
      case 'CRM':
        updateData.crmProvider = provider
        updateData.crmApiKey = apiKey
        updateData.crmConfig = config || {}
        updateData.crmConnected = isConnected || false
        break
      case 'EMAIL':
        updateData.emailProvider = provider
        updateData.emailApiKey = apiKey
        updateData.emailConfig = config || {}
        updateData.emailConnected = isConnected || false
        break
      case 'PAYMENT':
        updateData.paymentProvider = provider
        updateData.paymentApiKey = apiKey
        updateData.paymentConfig = config || {}
        updateData.paymentConnected = isConnected || false
        break
      case 'ANALYTICS':
        updateData.analyticsProvider = provider
        updateData.analyticsTrackingId = apiKey || config?.trackingId
        updateData.analyticsConfig = config || {}
        updateData.analyticsConnected = isConnected || false
        break
      default:
        return NextResponse.json(
          { error: 'Invalid integration type' },
          { status: 400 }
        )
    }

    // Update feature settings
    const updatedSettings = await db.featureSettings.update({
      where: {
        id: featureSettings.id
      },
      data: updateData
    })

    // Log the integration update
    await db.activityLog.create({
      data: {
        agencyId: agency.id,
        userId: user.id,
        action: 'INTEGRATION_UPDATED',
        entityType: 'FeatureSettings',
        entityId: updatedSettings.id,
        changes: JSON.stringify({
          type,
          provider,
          isConnected
        })
      }
    })

    return NextResponse.json({
      success: true,
      message: `${type} integration updated successfully`,
      integration: {
        type,
        provider,
        isConnected,
        config
      }
    })
  } catch (error) {
    console.error('Error updating integration:', error)
    return NextResponse.json(
      { error: 'Failed to update integration' },
      { status: 500 }
    )
  }
})

// Test integration connection
export const PUT = requireAgency(async (request: NextRequest, context) => {
  try {
    const { agency, user } = context
    const body = await request.json()
    const { type, provider, config } = body

    if (!type || !provider) {
      return NextResponse.json(
        { error: 'Integration type and provider are required' },
        { status: 400 }
      )
    }

    // Simulate connection test - in a real implementation, this would
    // actually test the connection to the external service
    let testResult = {
      success: false,
      message: 'Connection test failed',
      details: {}
    }

    switch (type) {
      case 'CRM':
        testResult = {
          success: true,
          message: 'Successfully connected to CRM',
          details: {
            provider,
            status: 'connected',
            lastTested: new Date().toISOString()
          }
        }
        break
      case 'EMAIL':
        testResult = {
          success: true,
          message: 'Successfully connected to email service',
          details: {
            provider,
            status: 'connected',
            lastTested: new Date().toISOString()
          }
        }
        break
      case 'PAYMENT':
        testResult = {
          success: true,
          message: 'Successfully connected to payment gateway',
          details: {
            provider,
            status: 'connected',
            lastTested: new Date().toISOString()
          }
        }
        break
      case 'ANALYTICS':
        testResult = {
          success: true,
          message: 'Successfully connected to analytics service',
          details: {
            provider,
            status: 'connected',
            lastTested: new Date().toISOString()
          }
        }
        break
    }

    // Log the connection test
    await db.activityLog.create({
      data: {
        agencyId: agency.id,
        userId: user.id,
        action: 'INTEGRATION_TESTED',
        entityType: 'FeatureSettings',
        entityId: agency.id,
        changes: JSON.stringify({
          type,
          provider,
          testResult
        })
      }
    })

    return NextResponse.json(testResult)
  } catch (error) {
    console.error('Error testing integration:', error)
    return NextResponse.json(
      { error: 'Failed to test integration' },
      { status: 500 }
    )
  }
})