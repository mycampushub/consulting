import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSubdomainForAPI } from "@/lib/utils"
import { requireAuth, requireAgency, requirePermissions } from "@/lib/auth-middleware"
import { z } from "zod"

const agencySettingsSchema = z.object({
  name: z.string().min(1, "Agency name is required"),
  subdomain: z.string().min(1, "Subdomain is required"),
  customDomain: z.string().optional(),
  primaryColor: z.string().default("#3B82F6"),
  secondaryColor: z.string().default("#10B981"),
  timezone: z.string().default("America/New_York"),
  currency: z.string().default("USD"),
  language: z.string().default("en"),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zip: z.string(),
    country: z.string()
  }).optional(),
  contact: z.object({
    email: z.string().email(),
    phone: z.string(),
    website: z.string().url().optional()
  }).optional(),
  social: z.object({
    facebook: z.string().url().optional(),
    twitter: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    instagram: z.string().url().optional()
  }).optional()
})

// Get agency settings
export const GET = requireAgency(
  requirePermissions([
    { resource: "settings", action: "read" }
  ])(async (request: NextRequest, context) => {
    try {
      const { agency } = context

      // Get agency settings from database
      const settings = await db.agency.findUnique({
        where: { id: agency.id },
        include: {
          brandSettings: true
        }
      })

      if (!settings) {
        return NextResponse.json({ error: "Agency not found" }, { status: 404 })
      }

      // Transform to match frontend expected format
      const agencySettings = {
        name: settings.name,
        subdomain: settings.subdomain,
        customDomain: settings.customDomain || undefined,
        primaryColor: settings.brandSettings?.primaryColor || settings.primaryColor,
        secondaryColor: settings.brandSettings?.secondaryColor || settings.secondaryColor,
        timezone: "America/New_York", // Default or stored in settings
        currency: "USD", // Default or stored in settings
        language: "en", // Default or stored in settings
        address: {
          street: "123 Business Avenue", // Mock data - should be stored in database
          city: "New York",
          state: "NY",
          zip: "10001",
          country: "US"
        },
        contact: {
          email: "info@agency.com", // Mock data - should be stored in database
          phone: "+1 (555) 123-4567",
          website: "https://agency.com"
        },
        social: {
          facebook: "https://facebook.com/agency",
          linkedin: "https://linkedin.com/company/agency"
        }
      }

      return NextResponse.json(agencySettings)
    } catch (error) {
      console.error("Error fetching agency settings:", error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  })
)

// Update agency settings
export const POST = requireAgency(
  requirePermissions([
    { resource: "settings", action: "update" }
  ])(async (request: NextRequest, context) => {
    try {
      const { agency, user } = context
      const body = await request.json()

      const validatedData = agencySettingsSchema.parse(body)

      // Update agency basic settings
      const updatedAgency = await db.agency.update({
        where: { id: agency.id },
        data: {
          name: validatedData.name,
          subdomain: validatedData.subdomain,
          customDomain: validatedData.customDomain,
          primaryColor: validatedData.primaryColor,
          secondaryColor: validatedData.secondaryColor
        }
      })

      // Update or create brand settings
      await db.brandSettings.upsert({
        where: { agencyId: agency.id },
        update: {
          primaryColor: validatedData.primaryColor,
          secondaryColor: validatedData.secondaryColor,
          // Logo and other branding would be handled separately
        },
        create: {
          agencyId: agency.id,
          primaryColor: validatedData.primaryColor,
          secondaryColor: validatedData.secondaryColor,
        }
      })

      // Log activity
      await db.activityLog.create({
        data: {
          agencyId: agency.id,
          userId: user.id,
          action: "SETTINGS_UPDATED",
          entityType: "Agency",
          entityId: agency.id,
          changes: JSON.stringify({
            name: validatedData.name,
            subdomain: validatedData.subdomain,
            primaryColor: validatedData.primaryColor,
            secondaryColor: validatedData.secondaryColor
          })
        }
      })

      return NextResponse.json({
        success: true,
        message: "Settings updated successfully",
        settings: {
          name: updatedAgency.name,
          subdomain: updatedAgency.subdomain,
          customDomain: updatedAgency.customDomain,
          primaryColor: validatedData.primaryColor,
          secondaryColor: validatedData.secondaryColor
        }
      })
    } catch (error) {
      console.error("Error updating agency settings:", error)
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation failed", details: error.errors },
          { status: 400 }
        )
      }

      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  })
)