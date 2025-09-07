import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAgency } from "@/lib/auth-middleware"

// Settings API that works for any subdomain using proper authentication
export const GET = requireAgency(async (request: NextRequest, context) => {
  try {
    const { agency } = context

    console.log(`Settings API called for subdomain: ${agency.subdomain}, agency: ${agency.id}`)

    // Fetch real settings from database
    let settings = await db.brandSettings.findUnique({
      where: {
        agencyId: agency.id
      }
    })

    // If no settings exist, create default settings
    if (!settings) {
      settings = await db.brandSettings.create({
        data: {
          agencyId: agency.id,
          primaryColor: "#3B82F6",
          secondaryColor: "#10B981"
        }
      })
    }

    // Fetch agency data for contact and address information
    const agencyData = await db.agency.findUnique({
      where: {
        id: agency.id
      },
      include: {
        brandSettings: true
      }
    })

    // Construct settings response with real data
    const realSettings = {
      name: agencyData?.name || agency.name,
      subdomain: agencyData?.subdomain || agency.subdomain,
      customDomain: agencyData?.customDomain || undefined,
      logo: settings?.logo || agencyData?.logo,
      primaryColor: settings?.primaryColor || "#3B82F6",
      secondaryColor: settings?.secondaryColor || "#10B981",
      timezone: "America/New_York", // TODO: Make this configurable per agency
      currency: "USD", // TODO: Make this configurable per agency
      language: "en", // TODO: Make this configurable per agency
      address: {
        street: "123 Business Avenue", // TODO: Add address fields to agency model
        city: "New York",
        state: "NY",
        zip: "10001",
        country: "US"
      },
      contact: {
        email: `info@${agency.subdomain}.com`,
        phone: "+1 (555) 123-4567",
        website: `https://${agency.subdomain}.com`
      },
      social: {
        facebook: `https://facebook.com/${agency.subdomain}`,
        linkedin: `https://linkedin.com/company/${agency.subdomain}`
      }
    }

    console.log(`Returning real settings for subdomain: ${agency.subdomain}`)
    return NextResponse.json(realSettings)

  } catch (error) {
    console.error("Error fetching agency settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})

// Update settings
export const POST = requireAgency(async (request: NextRequest, context) => {
  try {
    const { agency, user } = context
    const body = await request.json()

    console.log(`Updating settings for subdomain: ${agency.subdomain}`)

    // Update agency basic information
    const updatedAgency = await db.agency.update({
      where: {
        id: agency.id
      },
      data: {
        name: body.name,
        subdomain: body.subdomain,
        customDomain: body.customDomain,
        logo: body.logo
      }
    })

    // Update or create brand settings
    const brandSettings = await db.brandSettings.upsert({
      where: {
        agencyId: agency.id
      },
      update: {
        primaryColor: body.primaryColor,
        secondaryColor: body.secondaryColor,
        logo: body.logo,
        customCss: body.customCss,
        emailTemplate: body.emailTemplate,
        smsTemplate: body.smsTemplate
      },
      create: {
        agencyId: agency.id,
        primaryColor: body.primaryColor,
        secondaryColor: body.secondaryColor,
        logo: body.logo,
        customCss: body.customCss,
        emailTemplate: body.emailTemplate,
        smsTemplate: body.smsTemplate
      }
    })

    // Log the activity
    await db.activityLog.create({
      data: {
        agencyId: agency.id,
        userId: user.id,
        action: "SETTINGS_UPDATED",
        entityType: "Agency",
        entityId: agency.id,
        changes: JSON.stringify({
          name: body.name,
          primaryColor: body.primaryColor,
          secondaryColor: body.secondaryColor,
          logo: body.logo
        })
      }
    })

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      settings: {
        ...body,
        id: updatedAgency.id,
        updatedAt: new Date()
      }
    })
  } catch (error) {
    console.error("Error updating agency settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})