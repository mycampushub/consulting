import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requireAgency } from '@/lib/auth-middleware'
import { z } from 'zod'

const securitySettingsSchema = z.object({
  twoFactorEnabled: z.boolean().default(false),
  sessionTimeout: z.number().min(300).max(28800).default(3600),
  passwordPolicy: z.object({
    minLength: z.number().min(4).max(32).default(8),
    requireUppercase: z.boolean().default(true),
    requireNumbers: z.boolean().default(true),
    requireSpecialChars: z.boolean().default(true),
    expiryDays: z.number().min(0).max(365).default(90)
  }),
  ipRestrictions: z.array(z.string()).default([]),
  auditLogEnabled: z.boolean().default(true)
})

// Get security settings for the agency
export const GET = requireAgency(async (request: NextRequest, context) => {
  try {
    const { agency } = context

    // For now, return default security settings
    // In a real implementation, this would be stored in a dedicated SecuritySettings table
    const securitySettings = {
      twoFactorEnabled: false,
      sessionTimeout: 3600,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        expiryDays: 90
      },
      ipRestrictions: [],
      auditLogEnabled: true
    }

    return NextResponse.json({ securitySettings })
  } catch (error) {
    console.error('Error fetching security settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch security settings' },
      { status: 500 }
    )
  }
})

// Update security settings for the agency
export const POST = requireAgency(async (request: NextRequest, context) => {
  try {
    const { agency, user } = context
    const body = await request.json()

    const validatedData = securitySettingsSchema.parse(body)

    // For now, we'll store the security settings in the feature settings
    // In a real implementation, this would be stored in a dedicated SecuritySettings table
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

    // Update feature settings with security preferences
    const updatedSettings = await db.featureSettings.update({
      where: {
        id: featureSettings.id
      },
      data: {
        twoFactorEnabled: validatedData.twoFactorEnabled,
        sessionTimeout: validatedData.sessionTimeout,
        passwordPolicy: validatedData.passwordPolicy,
        ipRestrictions: validatedData.ipRestrictions,
        auditLogEnabled: validatedData.auditLogEnabled
      }
    })

    // Log the security settings update
    await db.activityLog.create({
      data: {
        agencyId: agency.id,
        userId: user.id,
        action: 'SECURITY_SETTINGS_UPDATED',
        entityType: 'FeatureSettings',
        entityId: updatedSettings.id,
        changes: JSON.stringify({
          twoFactorEnabled: validatedData.twoFactorEnabled,
          sessionTimeout: validatedData.sessionTimeout,
          auditLogEnabled: validatedData.auditLogEnabled
        })
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Security settings updated successfully',
      securitySettings: validatedData
    })
  } catch (error) {
    console.error('Error updating security settings:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update security settings' },
      { status: 500 }
    )
  }
})

// Enable/disable two-factor authentication for a user
export const PUT = requireAgency(async (request: NextRequest, context) => {
  try {
    const { agency, user } = context
    const body = await request.json()
    const { userId, enable } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Check if user exists and belongs to the agency
    const targetUser = await db.user.findFirst({
      where: {
        id: userId,
        agencyId: agency.id
      }
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found or does not belong to this agency' },
        { status: 404 }
      )
    }

    // Update user's 2FA status
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: enable
      }
    })

    // Log the 2FA status change
    await db.activityLog.create({
      data: {
        agencyId: agency.id,
        userId: user.id,
        action: enable ? 'TWO_FACTOR_ENABLED' : 'TWO_FACTOR_DISABLED',
        entityType: 'User',
        entityId: userId,
        changes: JSON.stringify({
          userId,
          twoFactorEnabled: enable,
          changedBy: user.id
        })
      }
    })

    return NextResponse.json({
      success: true,
      message: `Two-factor authentication ${enable ? 'enabled' : 'disabled'} successfully`,
      user: {
        id: updatedUser.id,
        twoFactorEnabled: updatedUser.twoFactorEnabled
      }
    })
  } catch (error) {
    console.error('Error updating two-factor authentication:', error)
    return NextResponse.json(
      { error: 'Failed to update two-factor authentication' },
      { status: 500 }
    )
  }
})