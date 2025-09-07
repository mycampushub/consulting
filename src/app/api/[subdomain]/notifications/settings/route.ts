import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requireAgency } from '@/lib/auth-middleware'
import { z } from 'zod'

const notificationSettingsSchema = z.object({
  email: z.object({
    newStudent: z.boolean().default(true),
    applicationUpdate: z.boolean().default(true),
    paymentReceived: z.boolean().default(true),
    systemUpdates: z.boolean().default(true),
    marketingEmails: z.boolean().default(false)
  }),
  push: z.object({
    newStudent: z.boolean().default(true),
    applicationUpdate: z.boolean().default(true),
    paymentReceived: z.boolean().default(false),
    systemUpdates: z.boolean().default(true)
  }),
  sms: z.object({
    urgentAlerts: z.boolean().default(true),
    paymentReminders: z.boolean().default(true),
    appointmentReminders: z.boolean().default(true)
  })
})

// Get notification settings for the agency
export const GET = requireAgency(async (request: NextRequest, context) => {
  try {
    const { agency } = context

    // For now, return default notification settings
    // In a real implementation, this would be stored in a dedicated NotificationSettings table
    const notificationSettings = {
      email: {
        newStudent: true,
        applicationUpdate: true,
        paymentReceived: true,
        systemUpdates: true,
        marketingEmails: false
      },
      push: {
        newStudent: true,
        applicationUpdate: true,
        paymentReceived: false,
        systemUpdates: true
      },
      sms: {
        urgentAlerts: true,
        paymentReminders: true,
        appointmentReminders: true
      }
    }

    return NextResponse.json({ notificationSettings })
  } catch (error) {
    console.error('Error fetching notification settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notification settings' },
      { status: 500 }
    )
  }
})

// Update notification settings for the agency
export const POST = requireAgency(async (request: NextRequest, context) => {
  try {
    const { agency, user } = context
    const body = await request.json()

    const validatedData = notificationSettingsSchema.parse(body)

    // For now, we'll store the notification settings in the feature settings
    // In a real implementation, this would be stored in a dedicated NotificationSettings table
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

    // Update feature settings with notification preferences
    const updatedSettings = await db.featureSettings.update({
      where: {
        id: featureSettings.id
      },
      data: {
        emailNotifications: validatedData.email,
        pushNotifications: validatedData.push,
        smsNotifications: validatedData.sms
      }
    })

    // Log the notification settings update
    await db.activityLog.create({
      data: {
        agencyId: agency.id,
        userId: user.id,
        action: 'NOTIFICATION_SETTINGS_UPDATED',
        entityType: 'FeatureSettings',
        entityId: updatedSettings.id,
        changes: JSON.stringify(validatedData)
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Notification settings updated successfully',
      notificationSettings: validatedData
    })
  } catch (error) {
    console.error('Error updating notification settings:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update notification settings' },
      { status: 500 }
    )
  }
})