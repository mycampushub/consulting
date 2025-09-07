import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSubdomainForAPI } from "@/lib/utils"
import { requireAgency } from "@/lib/auth-middleware"

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
    const category = searchParams.get("category")

    // Create demo agency if it doesn't exist
    let agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      // Create demo agency for development
      agency = await db.agency.create({
        data: {
          id: `${subdomain}-agency-id`,
          name: `${subdomain.charAt(0).toUpperCase() + subdomain.slice(1)} Education Agency`,
          subdomain: subdomain,
          customDomain: null,
          primaryColor: '#3B82F6',
          secondaryColor: '#10B981',
          status: 'ACTIVE',
          plan: 'FREE'
        }
      })
      console.log(`Created demo agency for subdomain: ${subdomain}`)
    }

    const where = {
      agencyId: agency.id,
      ...(status && { status: status }),
      ...(category && { category: category })
    }

    const [workflows, total] = await Promise.all([
      db.workflow.findMany({
        where,
        include: {
          marketingCampaigns: true
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.workflow.count({ where })
    ])

    return NextResponse.json({
      workflows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching workflows:", error)
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
      description,
      category,
      triggers,
      nodes,
      edges,
      isActive,
      priority
    } = body

    // Create or get agency
    let agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      agency = await db.agency.create({
        data: {
          id: `${subdomain}-agency-id`,
          name: `${subdomain.charAt(0).toUpperCase() + subdomain.slice(1)} Education Agency`,
          subdomain: subdomain,
          customDomain: null,
          primaryColor: '#3B82F6',
          secondaryColor: '#10B981',
          status: 'ACTIVE',
          plan: 'FREE'
        }
      })
      console.log(`Created demo agency for subdomain: ${subdomain}`)
    }

    const workflow = await db.workflow.create({
      data: {
        agencyId: agency.id,
        name,
        description,
        category,
        triggers: JSON.stringify(triggers),
        nodes: JSON.stringify(nodes),
        edges: JSON.stringify(edges),
        isActive: isActive || false,
        priority: priority || 0
      },
      include: {
        marketingCampaigns: true
      }
    })

    return NextResponse.json(workflow)
  } catch (error) {
    console.error("Error creating workflow:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}