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
    const limit = parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")

    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    const where = {
      agencyId: agency.id,
      ...(status && { status: status })
    }

    const [landingPages, total] = await Promise.all([
      db.landingPage.findMany({
        where,
        include: {
          form: true
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.landingPage.count({ where })
    ])

    return NextResponse.json({
      landingPages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching landing pages:", error)
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
      name,
      slug,
      title,
      description,
      content,
      templateId,
      customCss,
      customJs,
      metaTitle,
      metaDescription,
      metaKeywords,
      formId
    } = body

    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    // Check if slug is unique
    const existingPage = await db.landingPage.findUnique({
      where: {
        agencyId_slug: {
          agencyId: agency.id,
          slug
        }
      }
    })

    if (existingPage) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 })
    }

    const landingPage = await db.landingPage.create({
      data: {
        agencyId: agency.id,
        name,
        slug,
        title,
        description,
        content: JSON.stringify(content),
        templateId,
        customCss,
        customJs,
        metaTitle,
        metaDescription,
        metaKeywords,
        formId
      },
      include: {
        form: true
      }
    })

    return NextResponse.json(landingPage)
  } catch (error) {
    console.error("Error creating landing page:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const subdomain = getSubdomainForAPI(request)
    if (!subdomain) {
      return NextResponse.json({ error: "Subdomain required" }, { status: 400 })
    }

    const body = await request.json()
    const {
      id,
      name,
      slug,
      title,
      description,
      content,
      templateId,
      customCss,
      customJs,
      metaTitle,
      metaDescription,
      metaKeywords,
      formId,
      status
    } = body

    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    // Check if slug is unique (excluding current page)
    if (slug) {
      const existingPage = await db.landingPage.findUnique({
        where: {
          agencyId_slug: {
            agencyId: agency.id,
            slug
          }
        }
      })

      if (existingPage && existingPage.id !== id) {
        return NextResponse.json({ error: "Slug already exists" }, { status: 400 })
      }
    }

    const landingPage = await db.landingPage.update({
      where: { id, agencyId: agency.id },
      data: {
        name,
        slug,
        title,
        description,
        content: content ? JSON.stringify(content) : undefined,
        templateId,
        customCss,
        customJs,
        metaTitle,
        metaDescription,
        metaKeywords,
        formId,
        status,
        publishedAt: status === 'PUBLISHED' ? new Date() : undefined
      },
      include: {
        form: true
      }
    })

    return NextResponse.json(landingPage)
  } catch (error) {
    console.error("Error updating landing page:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const subdomain = getSubdomainForAPI(request)
    if (!subdomain) {
      return NextResponse.json({ error: "Subdomain required" }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const pageId = searchParams.get("id")

    if (!pageId) {
      return NextResponse.json({ error: "Page ID required" }, { status: 400 })
    }

    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    await db.landingPage.delete({
      where: { id: pageId, agencyId: agency.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting landing page:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}