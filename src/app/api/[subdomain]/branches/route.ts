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
    const search = searchParams.get("search")
    const status = searchParams.get("status")
    const type = searchParams.get("type")

    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    const where = {
      agencyId: agency.id,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { code: { contains: search, mode: "insensitive" as const } },
          { city: { contains: search, mode: "insensitive" as const } }
        ]
      }),
      ...(status && { status: status }),
      ...(type && { type: type })
    }

    const [branches, total] = await Promise.all([
      db.branch.findMany({
        where,
        include: {
          manager: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          students: {
            select: {
              id: true
            }
          },
          _count: {
            select: {
              students: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.branch.count({ where })
    ])

    // Parse JSON fields
    const processedBranches = branches.map(branch => ({
      ...branch,
      features: branch.features ? JSON.parse(branch.features) : [],
      settings: branch.settings ? JSON.parse(branch.settings) : {},
      studentCount: branch._count.students
    }))

    return NextResponse.json({
      branches: processedBranches,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching branches:", error)
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
      code,
      type,
      email,
      phone,
      address,
      city,
      state,
      country,
      postalCode,
      managerId,
      maxStudents,
      maxStaff,
      description,
      features,
      settings,
      businessHours
    } = body

    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    // Validate branch code uniqueness within agency
    const existingBranch = await db.branch.findFirst({
      where: {
        agencyId: agency.id,
        code: code
      }
    })

    if (existingBranch) {
      return NextResponse.json({ error: "Branch code already exists" }, { status: 400 })
    }

    // Validate manager if provided
    if (managerId) {
      const manager = await db.user.findFirst({
        where: {
          id: managerId,
          agencyId: agency.id
        }
      })

      if (!manager) {
        return NextResponse.json({ error: "Manager not found" }, { status: 404 })
      }
    }

    const branch = await db.branch.create({
      data: {
        agencyId: agency.id,
        name,
        code,
        type,
        email,
        phone,
        address,
        city,
        state,
        country,
        postalCode,
        managerId,
        maxStudents,
        maxStaff,
        description,
        features: features ? JSON.stringify(features) : null,
        settings: settings ? JSON.stringify(settings) : null,
        businessHours: businessHours ? JSON.stringify(businessHours) : null
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        students: {
          select: {
            id: true
          }
        },
        _count: {
          select: {
            students: true
          }
        }
      }
    })

    // Parse JSON fields for response
    const processedBranch = {
      ...branch,
      features: branch.features ? JSON.parse(branch.features) : [],
      settings: branch.settings ? JSON.parse(branch.settings) : {},
      studentCount: branch._count.students
    }

    return NextResponse.json(processedBranch)
  } catch (error) {
    console.error("Error creating branch:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}