import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSubdomainForAPI } from "@/lib/utils"
import { z } from "zod"

const documentSchema = z.object({
  name: z.string().min(1, "Document name is required"),
  description: z.string().optional(),
  type: z.enum(["IDENTITY", "ACADEMIC", "FINANCIAL", "VISA", "MEDICAL", "CUSTOM"]),
  category: z.string().min(1, "Category is required"),
  fileName: z.string().min(1, "File name is required"),
  filePath: z.string().min(1, "File path is required"),
  fileSize: z.number().int().min(0),
  mimeType: z.string().min(1, "MIME type is required"),
  isPublic: z.boolean().optional(),
  accessLevel: z.enum(["VIEW", "DOWNLOAD", "EDIT", "ADMIN"]).optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.any().optional()
})

const updateDocumentSchema = documentSchema.partial()

export async function GET(request: NextRequest) {
  try {
    const subdomain = getSubdomainForAPI(request)
    if (!subdomain) {
      return NextResponse.json({ error: "Subdomain required" }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const type = searchParams.get("type")
    const category = searchParams.get("category")
    const isPublic = searchParams.get("isPublic")
    const accessLevel = searchParams.get("accessLevel")
    const tags = searchParams.get("tags")?.split(",")
    const search = searchParams.get("search")

    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    const where: any = {
      agencyId: agency.id,
      ...(type && { type: type }),
      ...(category && { category: category }),
      ...(isPublic !== null && { isPublic: isPublic === "true" }),
      ...(accessLevel && { accessLevel: accessLevel })
    }

    // Handle tags filter
    if (tags && tags.length > 0) {
      where.tags = {
        contains: JSON.stringify(tags)
      }
    }

    // Handle search
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { fileName: { contains: search, mode: "insensitive" } }
      ]
    }

    const [documents, total] = await Promise.all([
      db.document.findMany({
        where,
        include: {
          branch: {
            select: {
              id: true,
              name: true,
              code: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.document.count({ where })
    ])

    // Parse JSON fields
    const processedDocuments = documents.map(document => ({
      ...document,
      tags: document.tags ? JSON.parse(document.tags) : [],
      metadata: document.metadata ? JSON.parse(document.metadata) : null
    }))

    return NextResponse.json({
      documents: processedDocuments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching documents:", error)
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
    const validatedData = documentSchema.parse(body)

    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    // Validate associated entities exist and belong to agency
    if (validatedData.studentId) {
      const student = await db.student.findFirst({
        where: { id: validatedData.studentId, agencyId: agency.id }
      })
      if (!student) {
        return NextResponse.json({ error: "Student not found" }, { status: 404 })
      }
    }

    if (validatedData.leadId) {
      const lead = await db.lead.findFirst({
        where: { id: validatedData.leadId, agencyId: agency.id }
      })
      if (!lead) {
        return NextResponse.json({ error: "Lead not found" }, { status: 404 })
      }
    }

    if (validatedData.applicationId) {
      const application = await db.application.findFirst({
        where: { id: validatedData.applicationId, agencyId: agency.id }
      })
      if (!application) {
        return NextResponse.json({ error: "Application not found" }, { status: 404 })
      }
    }

    // Create document
    const document = await db.document.create({
      data: {
        agencyId: agency.id,
        name: validatedData.name,
        description: validatedData.description,
        type: validatedData.type,
        category: validatedData.category,
        fileName: validatedData.fileName,
        fileSize: validatedData.fileSize,
        fileType: validatedData.fileType,
        fileUrl: validatedData.fileUrl,
        thumbnailUrl: validatedData.thumbnailUrl,
        studentId: validatedData.studentId,
        leadId: validatedData.leadId,
        applicationId: validatedData.applicationId,
        tags: validatedData.tags ? JSON.stringify(validatedData.tags) : null,
        isRequired: validatedData.isRequired ?? false,
        isVerified: validatedData.isVerified ?? false,
        verifiedBy: validatedData.verifiedBy,
        verifiedAt: validatedData.verifiedAt,
        expiresAt: validatedData.expiresAt,
        isPublic: validatedData.isPublic ?? false,
        downloadCount: validatedData.downloadCount || 0,
        metadata: validatedData.metadata ? JSON.stringify(validatedData.metadata) : null
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        },
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        },
        application: {
          select: {
            id: true,
            studentId: true,
            universityId: true,
            status: true
          }
        },
        verifiedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    })

    // Create document activity log
    await db.documentActivity.create({
      data: {
        agencyId: agency.id,
        documentId: document.id,
        action: "UPLOADED",
        userId: "SYSTEM", // This would be the actual user in a real implementation
        changes: JSON.stringify({
          fileName: validatedData.fileName,
          fileSize: validatedData.fileSize,
          fileType: validatedData.fileType
        })
      }
    })

    // Send notifications if document is required
    if (validatedData.isRequired) {
      await sendRequiredDocumentNotification(document, agency.id)
    }

    // Parse JSON fields for response
    const processedDocument = {
      ...document,
      tags: document.tags ? JSON.parse(document.tags) : [],
      metadata: document.metadata ? JSON.parse(document.metadata) : null
    }

    return NextResponse.json(processedDocument)
  } catch (error) {
    console.error("Error creating document:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper function to send required document notification
async function sendRequiredDocumentNotification(document: any, agencyId: string) {
  const recipientId = document.studentId || document.leadId
  const recipientType = document.studentId ? "STUDENT" : "LEAD"

  if (!recipientId) return

  await db.notification.create({
    data: {
      agencyId,
      type: "INFO",
      title: "Required Document Uploaded",
      message: `Your required document "${document.name}" has been uploaded successfully`,
      recipientId: recipientId,
      recipientType: recipientType,
      channel: "IN_APP",
      status: "PENDING",
      priority: "MEDIUM",
      data: JSON.stringify({
        documentId: document.id,
        documentName: document.name,
        documentType: document.type
      })
    }
  })
}