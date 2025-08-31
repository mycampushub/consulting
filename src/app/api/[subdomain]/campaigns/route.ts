import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { z } from "zod"

const campaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  description: z.string().optional(),
  type: z.enum(["EMAIL", "SMS", "SOCIAL", "MULTI_CHANNEL"]),
  targetAudience: z.any().optional(),
  content: z.any().optional(),
  templateId: z.string().optional(),
  workflowId: z.string().optional(),
  budget: z.number().optional(),
  scheduledAt: z.date().optional()
})

const updateCampaignSchema = campaignSchema.partial()

export async function GET(request: NextRequest) {
  try {
    // Extract subdomain from the URL path
    const urlParts = request.nextUrl.pathname.split('/')
    const subdomain = urlParts[2] // /api/[subdomain]/campaigns
    
    if (!subdomain) {
      return NextResponse.json({ error: "Subdomain required" }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const type = searchParams.get("type")
    const status = searchParams.get("status")

    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    const where: any = {
      agencyId: agency.id,
      ...(type && { type: type }),
      ...(status && { status: status })
    }

    const [campaigns, total] = await Promise.all([
      db.marketingCampaign.findMany({
        where,
        include: {
          leads: {
            take: 5,
            orderBy: { createdAt: "desc" }
          },
          workflow: {
            select: {
              id: true,
              name: true,
              status: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.marketingCampaign.count({ where })
    ])

    // Parse JSON fields
    const processedCampaigns = campaigns.map(campaign => ({
      ...campaign,
      targetAudience: campaign.targetAudience ? JSON.parse(campaign.targetAudience) : null,
      content: campaign.content ? JSON.parse(campaign.content) : null
    }))

    return NextResponse.json({
      campaigns: processedCampaigns,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching campaigns:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Extract subdomain from the URL path
    const urlParts = request.nextUrl.pathname.split('/')
    const subdomain = urlParts[2] // /api/[subdomain]/campaigns
    
    if (!subdomain) {
      return NextResponse.json({ error: "Subdomain required" }, { status: 400 })
    }

    const body = await request.json()
    const validatedData = campaignSchema.parse(body)

    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    // Create campaign
    const campaign = await db.marketingCampaign.create({
      data: {
        agencyId: agency.id,
        name: validatedData.name,
        description: validatedData.description,
        type: validatedData.type,
        targetAudience: validatedData.targetAudience ? JSON.stringify(validatedData.targetAudience) : null,
        content: validatedData.content ? JSON.stringify(validatedData.content) : null,
        templateId: validatedData.templateId,
        workflowId: validatedData.workflowId,
        budget: validatedData.budget,
        scheduledAt: validatedData.scheduledAt
      },
      include: {
        leads: {
          take: 5,
          orderBy: { createdAt: "desc" }
        },
        workflow: {
          select: {
            id: true,
            name: true,
            status: true
          }
        }
      }
    })

    // Parse JSON fields for response
    const processedCampaign = {
      ...campaign,
      targetAudience: campaign.targetAudience ? JSON.parse(campaign.targetAudience) : null,
      content: campaign.content ? JSON.parse(campaign.content) : null
    }

    return NextResponse.json(processedCampaign)
  } catch (error) {
    console.error("Error creating campaign:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}