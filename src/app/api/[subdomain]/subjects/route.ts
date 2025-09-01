import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSubdomainForAPI } from "@/lib/utils"
import { z } from "zod"

const subjectSchema = z.object({
  campusId: z.string().min(1, "Campus ID is required"),
  name: z.string().min(1, "Subject name is required"),
  code: z.string().optional(),
  level: z.enum(["UNDERGRADUATE", "POSTGRADUATE", "DOCTORAL", "DIPLOMA", "CERTIFICATE", "PROFESSIONAL"]).optional(),
  department: z.string().optional(),
  faculty: z.string().optional(),
  duration: z.number().int().positive().optional(),
  studyMode: z.enum(["FULL_TIME", "PART_TIME", "ONLINE", "DISTANCE", "BLENDED"]).optional(),
  entryRequirements: z.string().optional(),
  tuitionFee: z.number().positive().optional(),
  currency: z.string().default("USD"),
  capacity: z.number().int().positive().optional(),
  accreditation: z.array(z.string()).optional(),
  description: z.string().optional(),
  careerProspects: z.array(z.string()).optional()
})

const updateSubjectSchema = subjectSchema.partial()

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
    const campusId = searchParams.get("campusId")
    const universityId = searchParams.get("universityId")
    const level = searchParams.get("level")

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
        { code: { contains: search, mode: "insensitive" } },
        { department: { contains: search, mode: "insensitive" } }
      ]
    }

    if (campusId) {
      where.campusId = campusId
    }

    if (universityId) {
      where.campus = {
        universityId: universityId
      }
    }

    if (level) {
      where.level = level
    }

    const [subjects, total] = await Promise.all([
      db.subject.findMany({
        where,
        include: {
          campus: {
            include: {
              university: {
                select: {
                  id: true,
                  name: true,
                  country: true,
                  city: true
                }
              }
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
          { campus: { university: { name: "asc" } } },
          { campus: { name: "asc" } },
          { name: "asc" }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      db.subject.count({ where })
    ])

    // Parse JSON fields
    const processedSubjects = subjects.map(subject => ({
      ...subject,
      entryRequirements: subject.entryRequirements ? JSON.parse(subject.entryRequirements) : null,
      accreditation: subject.accreditation ? JSON.parse(subject.accreditation) : [],
      careerProspects: subject.careerProspects ? JSON.parse(subject.careerProspects) : []
    }))

    return NextResponse.json({
      subjects: processedSubjects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching subjects:", error)
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
    const validatedData = subjectSchema.parse(body)

    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    // Verify campus belongs to the same agency
    const campus = await db.campus.findFirst({
      where: {
        id: validatedData.campusId,
        agencyId: agency.id
      }
    })

    if (!campus) {
      return NextResponse.json({ error: "Campus not found or access denied" }, { status: 404 })
    }

    const subject = await db.subject.create({
      data: {
        agencyId: agency.id,
        campusId: validatedData.campusId,
        name: validatedData.name,
        code: validatedData.code,
        level: validatedData.level || "UNDERGRADUATE",
        department: validatedData.department,
        faculty: validatedData.faculty,
        duration: validatedData.duration,
        studyMode: validatedData.studyMode || "FULL_TIME",
        entryRequirements: validatedData.entryRequirements,
        tuitionFee: validatedData.tuitionFee,
        currency: validatedData.currency || "USD",
        capacity: validatedData.capacity,
        accreditation: validatedData.accreditation ? JSON.stringify(validatedData.accreditation) : null,
        description: validatedData.description,
        careerProspects: validatedData.careerProspects ? JSON.stringify(validatedData.careerProspects) : null
      },
      include: {
        campus: {
          include: {
            university: {
              select: {
                id: true,
                name: true,
                country: true,
                city: true
              }
            }
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
    const processedSubject = {
      ...subject,
      entryRequirements: subject.entryRequirements ? JSON.parse(subject.entryRequirements) : null,
      accreditation: subject.accreditation ? JSON.parse(subject.accreditation) : [],
      careerProspects: subject.careerProspects ? JSON.parse(subject.careerProspects) : []
    }

    return NextResponse.json(processedSubject)
  } catch (error) {
    console.error("Error creating subject:", error)
    
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
    const subjectId = searchParams.get("id")

    if (!subjectId) {
      return NextResponse.json({ error: "Subject ID required" }, { status: 400 })
    }

    const body = await request.json()
    const validatedData = updateSubjectSchema.parse(body)

    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    // If campusId is being updated, verify it belongs to the same agency
    if (validatedData.campusId) {
      const campus = await db.campus.findFirst({
        where: {
          id: validatedData.campusId,
          agencyId: agency.id
        }
      })

      if (!campus) {
        return NextResponse.json({ error: "Campus not found or access denied" }, { status: 404 })
      }
    }

    const subject = await db.subject.update({
      where: { id: subjectId, agencyId: agency.id },
      data: {
        campusId: validatedData.campusId,
        name: validatedData.name,
        code: validatedData.code,
        level: validatedData.level,
        department: validatedData.department,
        faculty: validatedData.faculty,
        duration: validatedData.duration,
        studyMode: validatedData.studyMode,
        entryRequirements: validatedData.entryRequirements,
        tuitionFee: validatedData.tuitionFee,
        currency: validatedData.currency,
        capacity: validatedData.capacity,
        accreditation: validatedData.accreditation ? JSON.stringify(validatedData.accreditation) : null,
        description: validatedData.description,
        careerProspects: validatedData.careerProspects ? JSON.stringify(validatedData.careerProspects) : null
      },
      include: {
        campus: {
          include: {
            university: {
              select: {
                id: true,
                name: true,
                country: true,
                city: true
              }
            }
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
    const processedSubject = {
      ...subject,
      entryRequirements: subject.entryRequirements ? JSON.parse(subject.entryRequirements) : null,
      accreditation: subject.accreditation ? JSON.parse(subject.accreditation) : [],
      careerProspects: subject.careerProspects ? JSON.parse(subject.careerProspects) : []
    }

    return NextResponse.json(processedSubject)
  } catch (error) {
    console.error("Error updating subject:", error)
    
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
    const subjectId = searchParams.get("id")

    if (!subjectId) {
      return NextResponse.json({ error: "Subject ID required" }, { status: 400 })
    }

    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    await db.subject.delete({
      where: { id: subjectId, agencyId: agency.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting subject:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}