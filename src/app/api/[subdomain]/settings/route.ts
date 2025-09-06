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
          street: settings.brandSettings?.address?.street || "123 Business Avenue",
          city: settings.brandSettings?.address?.city || "New York",
          state: settings.brandSettings?.address?.state || "NY",
          zip: settings.brandSettings?.address?.zip || "10001",
          country: settings.brandSettings?.address?.country || "US"
        },
        contact: {
          email: settings.brandSettings?.contact?.email || "info@agency.com",
          phone: settings.brandSettings?.contact?.phone || "+1 (555) 123-4567",
          website: settings.brandSettings?.contact?.website || "https://agency.com"
        },
        social: {
          facebook: settings.brandSettings?.social?.facebook || "https://facebook.com/agency",
          twitter: settings.brandSettings?.social?.twitter || "https://twitter.com/agency",
          linkedin: settings.brandSettings?.social?.linkedin || "https://linkedin.com/company/agency",
          instagram: settings.brandSettings?.social?.instagram || "https://instagram.com/agency"
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

      // Prepare brand settings data
      const brandSettingsData = {
        primaryColor: validatedData.primaryColor,
        secondaryColor: validatedData.secondaryColor,
        address: validatedData.address ? JSON.stringify(validatedData.address) : null,
        contact: validatedData.contact ? JSON.stringify(validatedData.contact) : null,
        social: validatedData.social ? JSON.stringify(validatedData.social) : null,
      }

      // Update or create brand settings
      await db.brandSettings.upsert({
        where: { agencyId: agency.id },
        update: brandSettingsData,
        create: {
          agencyId: agency.id,
          ...brandSettingsData
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
            secondaryColor: validatedData.secondaryColor,
            address: validatedData.address,
            contact: validatedData.contact,
            social: validatedData.social
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
          secondaryColor: validatedData.secondaryColor,
          address: validatedData.address,
          contact: validatedData.contact,
          social: validatedData.social
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