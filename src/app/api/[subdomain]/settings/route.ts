import { NextRequest, NextResponse } from "next/server"
import { requireAgency } from "@/lib/auth-middleware"

// Settings API that works for any subdomain using proper authentication
export const GET = requireAgency(async (request: NextRequest, context) => {
  try {
    const { agency } = context

    console.log(`Settings API called for subdomain: ${agency.subdomain}, agency: ${agency.id}`)

    // Create demo settings for any subdomain
    const demoSettings = {
      name: agency.name,
      subdomain: agency.subdomain,
      customDomain: undefined,
      primaryColor: "#3B82F6",
      secondaryColor: "#10B981",
      timezone: "America/New_York",
      currency: "USD",
      language: "en",
      address: {
        street: "123 Business Avenue",
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

    console.log(`Returning demo settings for subdomain: ${agency.subdomain}`)
    return NextResponse.json(demoSettings)

  } catch (error) {
    console.error("Error fetching agency settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})

// Update settings
export const POST = requireAgency(async (request: NextRequest, context) => {
  try {
    const { agency } = context
    const body = await request.json()

    console.log(`Updating settings for subdomain: ${agency.subdomain}`)

    // Return success response for demo
    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      settings: body
    })
  } catch (error) {
    console.error("Error updating agency settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})