import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSubdomainForAPI } from "@/lib/utils"
import jwt from "jsonwebtoken"
import { writeFile } from "fs/promises"
import path from "path"

export async function GET(request: NextRequest) {
  try {
    const subdomain = getSubdomainForAPI(request)
    
    if (!subdomain) {
      return NextResponse.json({ error: "Subdomain required" }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")

    if (!studentId) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 })
    }

    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    // Get student documents
    const documents = await db.document.findMany({
      where: {
        studentId: studentId,
        agencyId: agency.id
      },
      include: {
        application: {
          include: {
            university: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    // Get required documents based on student's applications
    const applications = await db.application.findMany({
      where: {
        studentId: studentId,
        agencyId: agency.id
      }
    })

    const requiredDocuments = getRequiredDocumentsForStudent(applications)
    
    // Merge with existing documents
    const enhancedDocuments = requiredDocuments.map(reqDoc => {
      const existingDoc = documents.find(doc => 
        doc.name.toLowerCase().includes(reqDoc.name.toLowerCase().split(' ')[0])
      )
      return existingDoc ? { ...reqDoc, ...existingDoc } : reqDoc
    })

    // Calculate document statistics
    const totalDocuments = enhancedDocuments.length
    const requiredDocsCount = enhancedDocuments.filter(doc => doc.required).length
    const uploadedDocuments = enhancedDocuments.filter(doc => doc.status === 'UPLOADED').length
    const approvedDocuments = enhancedDocuments.filter(doc => doc.status === 'APPROVED').length
    const pendingDocuments = enhancedDocuments.filter(doc => 
      ['UPLOADED', 'PENDING', 'REVIEWED'].includes(doc.status)
    ).length

    // Group documents by type
    const documentsByType = enhancedDocuments.reduce((acc, doc) => {
      if (!acc[doc.type]) {
        acc[doc.type] = []
      }
      acc[doc.type].push(doc)
      return acc
    }, {} as Record<string, any[]>)

    // Calculate upload progress
    const uploadProgress = Math.round((uploadedDocuments / totalDocuments) * 100)
    const approvalProgress = requiredDocsCount > 0 ? Math.round((approvedDocuments / requiredDocsCount) * 100) : 0

    return NextResponse.json({
      documents: enhancedDocuments,
      statistics: {
        totalDocuments,
        requiredDocuments: requiredDocsCount,
        uploadedDocuments,
        approvedDocuments,
        pendingDocuments,
        uploadProgress,
        approvalProgress
      },
      documentsByType,
      uploadDeadlines: getUploadDeadlines(applications),
      storageInfo: {
        usedStorage: documents.reduce((sum, doc) => sum + (doc.size || 0), 0),
        maxStorage: 50 * 1024 * 1024, // 50MB limit
        availableStorage: 50 * 1024 * 1024 - documents.reduce((sum, doc) => sum + (doc.size || 0), 0)
      }
    })

  } catch (error) {
    console.error("Error fetching student documents:", error)
    return NextResponse.json({ 
      error: "Internal server error",
      details: error.message 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const subdomain = getSubdomainForAPI(request)
    
    if (!subdomain) {
      return NextResponse.json({ error: "Subdomain required" }, { status: 400 })
    }

    const formData = await request.formData()
    const studentId = formData.get("studentId") as string
    const documentType = formData.get("documentType") as string
    const applicationId = formData.get("applicationId") as string
    const file = formData.get("file") as File

    if (!studentId || !documentType || !file) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    // Validate file
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: "Invalid file type. Only PDF, JPEG, PNG, and Word documents are allowed." 
      }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return NextResponse.json({ 
        error: "File size too large. Maximum size is 10MB." 
      }, { status: 400 })
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'uploads', agency.id, studentId)
    await import('fs').then(fs => {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }
    })

    // Generate unique filename
    const fileExtension = path.extname(file.name)
    const uniqueFilename = `${documentType}-${Date.now()}${fileExtension}`
    const filePath = path.join(uploadDir, uniqueFilename)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Create document record
    const document = await db.document.create({
      data: {
        agencyId: agency.id,
        studentId: studentId,
        applicationId: applicationId || null,
        name: file.name,
        type: documentType,
        status: 'UPLOADED',
        size: file.size,
        filePath: `/uploads/${agency.id}/${studentId}/${uniqueFilename}`,
        uploadedAt: new Date()
      }
    })

    // Create activity log
    await db.activityLog.create({
      data: {
        agencyId: agency.id,
        action: 'DOCUMENT_UPLOADED',
        entityType: 'Document',
        entityId: document.id,
        changes: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          documentType: documentType
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      success: true,
      message: "Document uploaded successfully",
      document: {
        id: document.id,
        name: document.name,
        type: document.type,
        status: document.status,
        size: document.size,
        uploadedAt: document.uploadedAt
      }
    })

  } catch (error) {
    console.error("Error uploading document:", error)
    return NextResponse.json({ 
      error: "Internal server error",
      details: error.message 
    }, { status: 500 })
  }
}

function getRequiredDocumentsForStudent(applications: any[]): any[] {
  // Standard document requirements for international students
  const baseDocuments = [
    { id: 'passport', name: 'Passport Copy', type: 'Identification', required: true, status: 'PENDING' },
    { id: 'transcript', name: 'Academic Transcript', type: 'Academic', required: true, status: 'PENDING' },
    { id: 'english', name: 'English Proficiency Certificate', type: 'Language', required: true, status: 'PENDING' },
    { id: 'statement', name: 'Personal Statement', type: 'Application', required: true, status: 'PENDING' },
    { id: 'financial', name: 'Financial Documents', type: 'Financial', required: true, status: 'PENDING' }
  ]

  // Add additional documents based on applications
  const additionalDocuments = []
  
  if (applications.some(app => app.program.toLowerCase().includes('art') || app.program.toLowerCase().includes('design'))) {
    additionalDocuments.push({ id: 'portfolio', name: 'Portfolio', type: 'Academic', required: true, status: 'PENDING' })
  }
  
  if (applications.some(app => app.program.toLowerCase().includes('research') || app.program.toLowerCase().includes('phd'))) {
    additionalDocuments.push({ id: 'research', name: 'Research Proposal', type: 'Academic', required: true, status: 'PENDING' })
  }

  return [...baseDocuments, ...additionalDocuments]
}

function getUploadDeadlines(applications: any[]): any[] {
  // Calculate upload deadlines based on application deadlines
  const deadlines = []
  
  applications.forEach(app => {
    if (app.intake) {
      const intakeDate = new Date(app.intake)
      const deadline = new Date(intakeDate)
      deadline.setMonth(deadline.getMonth() - 2) // 2 months before intake
      
      deadlines.push({
        applicationId: app.id,
        applicationName: `${app.university?.name || 'Unknown'} - ${app.program}`,
        deadline: deadline.toISOString().split('T')[0],
        priority: new Date(deadline) < new Date() ? 'OVERDUE' : 'UPCOMING'
      })
    }
  })
  
  return deadlines.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
}