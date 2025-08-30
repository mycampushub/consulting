import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSubdomainForAPI } from "@/lib/utils"
import { z } from "zod"

const universitySchema = z.object({
  name: z.string().min(1, "University name is required"),
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  website: z.string().url().optional(),
  description: z.string().optional(),
  worldRanking: z.number().int().min(1).optional(),
  nationalRanking: z.number().int().min(1).optional(),
  accreditation: z.array(z.string()).optional(),
  programs: z.array(z.string()).optional(),
  requirements: z.string().optional(),
  isPartner: z.boolean().default(false),
  partnershipLevel: z.enum(["NONE", "BASIC", "PREMIUM", "STRATEGIC"]).default("NONE"),
  commissionRate: z.number().min(0).max(100).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  address: z.string().optional()
})

const updateUniversitySchema = universitySchema.partial()

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
    const country = searchParams.get("country")
    const isPartner = searchParams.get("isPartner")
    const partnershipLevel = searchParams.get("partnershipLevel")

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
        { country: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } }
      ]
    }

    if (country) {
      where.country = { contains: country, mode: "insensitive" }
    }

    if (isPartner !== null) {
      where.isPartner = isPartner === "true"
    }

    if (partnershipLevel) {
      where.partnershipLevel = partnershipLevel
    }

    const [universities, total] = await Promise.all([
      db.university.findMany({
        where,
        include: {
          applications: {
            select: {
              id: true,
              status: true,
              studentId: true
            }
          }
        },
        orderBy: [
          { isPartner: "desc" },
          { partnershipLevel: "desc" },
          { name: "asc" }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      db.university.count({ where })
    ])

    // Parse JSON fields
    const processedUniversities = universities.map(university => ({
      ...university,
      accreditation: university.accreditation ? JSON.parse(university.accreditation) : [],
      programs: university.programs ? JSON.parse(university.programs) : [],
      requirements: university.requirements ? JSON.parse(university.requirements) : null
    }))

    return NextResponse.json({
      universities: processedUniversities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching universities:", error)
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
    const validatedData = universitySchema.parse(body)

    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    const university = await db.university.create({
      data: {
        agencyId: agency.id,
        name: validatedData.name,
        country: validatedData.country,
        city: validatedData.city,
        website: validatedData.website,
        description: validatedData.description,
        worldRanking: validatedData.worldRanking,
        nationalRanking: validatedData.nationalRanking,
        accreditation: validatedData.accreditation ? JSON.stringify(validatedData.accreditation) : null,
        programs: validatedData.programs ? JSON.stringify(validatedData.programs) : null,
        requirements: validatedData.requirements,
        isPartner: validatedData.isPartner,
        partnershipLevel: validatedData.partnershipLevel,
        commissionRate: validatedData.commissionRate,
        contactEmail: validatedData.contactEmail,
        contactPhone: validatedData.contactPhone,
        address: validatedData.address
      },
      include: {
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
    const processedUniversity = {
      ...university,
      accreditation: university.accreditation ? JSON.parse(university.accreditation) : [],
      programs: university.programs ? JSON.parse(university.programs) : [],
      requirements: university.requirements ? JSON.parse(university.requirements) : null
    }

    return NextResponse.json(processedUniversity)
  } catch (error) {
    console.error("Error creating university:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}