import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSubdomainForAPI } from "@/lib/utils"

export async function GET(request: NextRequest) {
  try {
    const subdomain = getSubdomainForAPI(request)
    if (!subdomain) {
      return NextResponse.json({ error: "Subdomain required" }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const type = searchParams.get("type") // EMAIL, SMS, IN_APP
    const category = searchParams.get("category")

    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    // Get email templates
    const emailTemplates = await db.emailTemplate.findMany({
      where: {
        agencyId: agency.id,
        ...(type && { type: type }),
        ...(category && { category: category })
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: (page - 1) * limit
    })

    // Get SMS templates
    const smsTemplates = await db.smsTemplate.findMany({
      where: {
        agencyId: agency.id,
        ...(type && { type: type }),
        ...(category && { category: category })
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: (page - 1) * limit
    })

    // Get recent email messages
    const recentEmailMessages = await db.emailMessage.findMany({
      where: {
        agencyId: agency.id
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 10
    })

    // Get recent SMS messages
    const recentSmsMessages = await db.smsMessage.findMany({
      where: {
        agencyId: agency.id
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 10
    })

    // Get communication statistics
    const totalEmailTemplates = await db.emailTemplate.count({
      where: { agencyId: agency.id }
    })

    const totalSmsTemplates = await db.smsTemplate.count({
      where: { agencyId: agency.id }
    })

    const totalEmailMessages = await db.emailMessage.count({
      where: { agencyId: agency.id }
    })

    const totalSmsMessages = await db.smsMessage.count({
      where: { agencyId: agency.id }
    })

    const stats = {
      templates: {
        email: totalEmailTemplates,
        sms: totalSmsTemplates,
        total: totalEmailTemplates + totalSmsTemplates
      },
      messages: {
        email: totalEmailMessages,
        sms: totalSmsMessages,
        total: totalEmailMessages + totalSmsMessages
      }
    }

    return NextResponse.json({
      emailTemplates,
      smsTemplates,
      recentEmailMessages,
      recentSmsMessages,
      stats,
      pagination: {
        page,
        limit,
        total: totalEmailTemplates + totalSmsTemplates,
        pages: Math.ceil((totalEmailTemplates + totalSmsTemplates) / limit)
      }
    })

  } catch (error) {
    console.error("Error fetching communications data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const subdomain = getSubdomainForAPI(request)
    if (!subdomain) {
      return NextResponse.json({ error: "Subdomain required" }, { status: 400 })
    }

    const body = await request.json()
    const {
      type,
      category,
      name,
      subject,
      content,
      isDefault
    } = body

    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    if (type === "EMAIL") {
      const emailTemplate = await db.emailTemplate.create({
        data: {
          agencyId: agency.id,
          name,
          subject,
          content,
          category: category || "GENERAL",
          isDefault: isDefault || false
        }
      })

      return NextResponse.json(emailTemplate)
    } else if (type === "SMS") {
      const smsTemplate = await db.smsTemplate.create({
        data: {
          agencyId: agency.id,
          name,
          content,
          category: category || "GENERAL",
          isDefault: isDefault || false
        }
      })

      return NextResponse.json(smsTemplate)
    } else {
      return NextResponse.json({ error: "Invalid communication type" }, { status: 400 })
    }

  } catch (error) {
    console.error("Error creating communication template:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}