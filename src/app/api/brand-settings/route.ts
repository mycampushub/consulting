import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const brandSettingsSchema = z.object({
  agencyId: z.string(),
  logo: z.string().optional(),
  favicon: z.string().optional(),
  primaryColor: z.string().default('#3B82F6'),
  secondaryColor: z.string().default('#10B981'),
  customCss: z.string().optional(),
  emailTemplate: z.string().optional(),
  smsTemplate: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = brandSettingsSchema.parse(body)

    // Check if agency exists
    const agency = await db.agency.findUnique({
      where: { id: validatedData.agencyId }
    })

    if (!agency) {
      return NextResponse.json(
        { error: 'Agency not found' },
        { status: 404 }
      )
    }

    // Update or create brand settings
    const brandSettings = await db.brandSettings.upsert({
      where: { agencyId: validatedData.agencyId },
      update: {
        logo: validatedData.logo,
        favicon: validatedData.favicon,
        primaryColor: validatedData.primaryColor,
        secondaryColor: validatedData.secondaryColor,
        customCss: validatedData.customCss,
        emailTemplate: validatedData.emailTemplate,
        smsTemplate: validatedData.smsTemplate
      },
      create: {
        agencyId: validatedData.agencyId,
        logo: validatedData.logo,
        favicon: validatedData.favicon,
        primaryColor: validatedData.primaryColor,
        secondaryColor: validatedData.secondaryColor,
        customCss: validatedData.customCss,
        emailTemplate: validatedData.emailTemplate,
        smsTemplate: validatedData.smsTemplate
      }
    })

    // Update agency colors if they changed
    await db.agency.update({
      where: { id: validatedData.agencyId },
      data: {
        primaryColor: validatedData.primaryColor,
        secondaryColor: validatedData.secondaryColor
      }
    })

    // Log activity
    await db.activityLog.create({
      data: {
        agencyId: validatedData.agencyId,
        action: 'BRAND_SETTINGS_UPDATED',
        entityType: 'BrandSettings',
        entityId: brandSettings.id,
        changes: JSON.stringify({
          primaryColor: validatedData.primaryColor,
          secondaryColor: validatedData.secondaryColor,
          hasLogo: !!validatedData.logo,
          hasFavicon: !!validatedData.favicon
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Brand settings saved successfully',
      brandSettings: {
        id: brandSettings.id,
        primaryColor: brandSettings.primaryColor,
        secondaryColor: brandSettings.secondaryColor,
        logo: brandSettings.logo,
        favicon: brandSettings.favicon
      }
    })

  } catch (error) {
    console.error('Brand settings error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const agencyId = searchParams.get('agencyId')

    if (!agencyId) {
      return NextResponse.json(
        { error: 'Agency ID is required' },
        { status: 400 }
      )
    }

    const brandSettings = await db.brandSettings.findUnique({
      where: { agencyId }
    })

    if (!brandSettings) {
      // Return default settings
      return NextResponse.json({
        success: true,
        brandSettings: {
          primaryColor: '#3B82F6',
          secondaryColor: '#10B981',
          logo: null,
          favicon: null,
          customCss: null,
          emailTemplate: null,
          smsTemplate: null
        }
      })
    }

    return NextResponse.json({
      success: true,
      brandSettings
    })

  } catch (error) {
    console.error('Error fetching brand settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}