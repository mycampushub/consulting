import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSubdomainForAPI } from "@/lib/utils"
import { z } from "zod"

const campusSchema = z.object({
  universityId: z.string().min(1, "University ID is required"),
  name: z.string().min(1, "Campus name is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  address: z.string().optional(),
  website: z.string().url().optional(),
  description: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  studentCapacity: z.number().int().positive().optional(),
  facilities: z.array(z.string()).optional()
})

const updateCampusSchema = campusSchema.partial()

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
    const universityId = searchParams.get("universityId")
    const country = searchParams.get("country")

    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    const where: any = {
      agencyId: agency.id
    }

    // Add search filters
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { country: { contains: search, mode: "insensitive" } }
      ]
    }

    if (universityId) {
      where.universityId = universityId
    }

    if (country) {
      where.country = { contains: country, mode: "insensitive" }
    }

    const [campuses, total] = await Promise.all([
      db.campus.findMany({
        where,
        include: {
          university: {
            select: {
              id: true,
              name: true,
              country: true,
              city: true
            }
          },
          subjects: {
            select: {
              id: true,
              name: true,
              level: true,
              enrolled: true
            }
          },
          applications: {
            select: {
              id: true,
              status: true,
              studentId: true
            }
          }
        },
        orderBy: [
          { university: { name: "asc" } },
          { name: "asc" }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      db.campus.count({ where })
    ])

    // Parse JSON fields
    const processedCampuses = campuses.map(campus => ({
      ...campus,
      facilities: campus.facilities ? JSON.parse(campus.facilities) : []
    }))

    return NextResponse.json({
      campuses: processedCampuses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching campuses:", error)
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
    const validatedData = campusSchema.parse(body)

    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    // Verify university belongs to the same agency
    const university = await db.university.findFirst({
      where: {
        id: validatedData.universityId,
        agencyId: agency.id
      }
    })

    if (!university) {
      return NextResponse.json({ error: "University not found or access denied" }, { status: 404 })
    }

    const campus = await db.campus.create({
      data: {
        agencyId: agency.id,
        universityId: validatedData.universityId,
        name: validatedData.name,
        city: validatedData.city,
        state: validatedData.state,
        country: validatedData.country,
        address: validatedData.address,
        website: validatedData.website,
        description: validatedData.description,
        contactEmail: validatedData.contactEmail,
        contactPhone: validatedData.contactPhone,
        studentCapacity: validatedData.studentCapacity,
        facilities: validatedData.facilities ? JSON.stringify(validatedData.facilities) : null
      },
      include: {
        university: {
          select: {
            id: true,
            name: true,
            country: true,
            city: true
          }
        },
        subjects: {
          select: {
            id: true,
            name: true,
            level: true,
            enrolled: true
          }
        },
        applications: {
          select: {
            id: true,
            status: true,
            studentId: true
          }
        }
      }
    })

    // Parse JSON fields for response
    const processedCampus = {
      ...campus,
      facilities: campus.facilities ? JSON.parse(campus.facilities) : []
    }

    return NextResponse.json(processedCampus)
  } catch (error) {
    console.error("Error creating campus:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const subdomain = getSubdomainForAPI(request)
    if (!subdomain) {
      return NextResponse.json({ error: "Subdomain required" }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const campusId = searchParams.get("id")

    if (!campusId) {
      return NextResponse.json({ error: "Campus ID required" }, { status: 400 })
    }

    const body = await request.json()
    const validatedData = updateCampusSchema.parse(body)

    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    // If universityId is being updated, verify it belongs to the same agency
    if (validatedData.universityId) {
      const university = await db.university.findFirst({
        where: {
          id: validatedData.universityId,
          agencyId: agency.id
        }
      })

      if (!university) {
        return NextResponse.json({ error: "University not found or access denied" }, { status: 404 })
      }
    }

    const campus = await db.campus.update({
      where: { id: campusId, agencyId: agency.id },
      data: {
        universityId: validatedData.universityId,
        name: validatedData.name,
        city: validatedData.city,
        state: validatedData.state,
        country: validatedData.country,
        address: validatedData.address,
        website: validatedData.website,
        description: validatedData.description,
        contactEmail: validatedData.contactEmail,
        contactPhone: validatedData.contactPhone,
        studentCapacity: validatedData.studentCapacity,
        facilities: validatedData.facilities ? JSON.stringify(validatedData.facilities) : null
      },
      include: {
        university: {
          select: {
            id: true,
            name: true,
            country: true,
            city: true
          }
        },
        subjects: {
          select: {
            id: true,
            name: true,
            level: true,
            enrolled: true
          }
        },
        applications: {
          select: {
            id: true,
            status: true,
            studentId: true
          }
        }
      }
    })

    // Parse JSON fields for response
    const processedCampus = {
      ...campus,
      facilities: campus.facilities ? JSON.parse(campus.facilities) : []
    }

    return NextResponse.json(processedCampus)
  } catch (error) {
    console.error("Error updating campus:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

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
    const campusId = searchParams.get("id")

    if (!campusId) {
      return NextResponse.json({ error: "Campus ID required" }, { status: 400 })
    }

    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    await db.campus.delete({
      where: { id: campusId, agencyId: agency.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting campus:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}