import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSubdomainForAPI } from '@/lib/utils'
import { z } from 'zod'

const querySchema = z.object({
  studentId: z.string(),
  status: z.string().optional(),
  university: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  sortBy: z.string().optional().default('updatedAt'),
  sortOrder: z.string().optional().default('desc')
})

export async function GET(request: NextRequest) {
  try {
    const subdomain = getSubdomainForAPI(request)
    
    if (!subdomain) {
      return NextResponse.json({ error: "Subdomain required" }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const validatedQuery = querySchema.parse({
      studentId: searchParams.get('studentId'),
      status: searchParams.get('status') || undefined,
      university: searchParams.get('university') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
      sortBy: searchParams.get('sortBy') || 'updatedAt',
      sortOrder: searchParams.get('sortOrder') || 'desc'
    })

    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    // Verify student belongs to agency
    const student = await db.student.findFirst({
      where: {
        id: validatedQuery.studentId,
        agencyId: agency.id
      }
    })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    const page = parseInt(validatedQuery.page)
    const limit = parseInt(validatedQuery.limit)
    const skip = (page - 1) * limit

    const where: any = {
      studentId: validatedQuery.studentId,
      agencyId: agency.id
    }

    if (validatedQuery.status) {
      where.status = validatedQuery.status
    }

    if (validatedQuery.university) {
      where.university = {
        contains: validatedQuery.university,
        mode: 'insensitive'
      }
    }

    const [applications, total] = await Promise.all([
      db.application.findMany({
        where,
        include: {
          university: true,
          campus: true,
          subject: true,
          documents: true,
          pipelineEntries: {
            include: {
              pipeline: true
            },
            orderBy: { enteredAt: 'desc' },
            take: 1
          },
          tasks: {
            include: {
              assignedTo: true
            },
            orderBy: { createdAt: 'desc' },
            take: 5
          },
          milestoneInstances: {
            include: {
              milestone: true
            },
            orderBy: { dueDate: 'asc' },
            take: 3
          }
        },
        orderBy: {
          [validatedQuery.sortBy]: validatedQuery.sortOrder
        },
        skip,
        take: limit
      }),
      db.application.count({ where })
    ])

    // Enhanced application data with additional insights
    const enhancedApplications = applications.map(app => ({
      ...app,
      progress: calculateApplicationProgress(app),
      statusInsights: getStatusInsights(app),
      upcomingDeadlines: getUpcomingDeadlines(app),
      requirementsStatus: getRequirementsStatus(app),
      timelineEvents: getTimelineEvents(app)
    }))

    return NextResponse.json({
      applications: enhancedApplications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      summary: {
        total,
        byStatus: await getApplicationStatusSummary(validatedQuery.studentId, agency.id),
        averageProgress: await getAverageProgress(validatedQuery.studentId, agency.id)
      }
    })

  } catch (error) {
    console.error("Error fetching applications:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

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
      studentId,
      universityId,
      campusId,
      subjectId,
      program,
      intake,
      status = 'DRAFT'
    } = body

    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    // Verify student belongs to agency
    const student = await db.student.findFirst({
      where: {
        id: studentId,
        agencyId: agency.id
      }
    })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Verify university exists
    const university = await db.university.findFirst({
      where: {
        id: universityId,
        agencyId: agency.id
      }
    })

    if (!university) {
      return NextResponse.json({ error: "University not found" }, { status: 404 })
    }

    // Create application
    const application = await db.application.create({
      data: {
        agencyId: agency.id,
        studentId,
        universityId,
        campusId,
        subjectId,
        program,
        intake,
        status,
        assignedTo: student.assignedTo || null
      },
      include: {
        university: true,
        campus: true,
        subject: true,
        student: true
      }
    })

    // Create initial pipeline entry if pipeline exists
    const pipeline = await db.pipeline.findFirst({
      where: {
        agencyId: agency.id,
        type: 'APPLICATION_PROCESSING'
      }
    })

    if (pipeline) {
      await db.pipelineEntry.create({
        data: {
          pipelineId: pipeline.id,
          applicationId: application.id,
          currentStage: 'Application Started',
          progress: 0,
          enteredAt: new Date()
        }
      })
    }

    // Log activity
    await db.activityLog.create({
      data: {
        agencyId: agency.id,
        userId: student.assignedTo || null,
        action: 'APPLICATION_CREATED',
        entityType: 'Application',
        entityId: application.id,
        changes: JSON.stringify({
          university: university.name,
          program: application.program,
          status: application.status
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json(application)

  } catch (error) {
    console.error("Error creating application:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper functions
function calculateApplicationProgress(application: any): number {
  let progress = 0
  let totalItems = 0

  // Check documents (40% of progress)
  if (application.documents && application.documents.length > 0) {
    const verifiedDocs = application.documents.filter((doc: any) => doc.status === 'VERIFIED').length
    progress += (verifiedDocs / application.documents.length) * 40
    totalItems++
  }

  // Check pipeline progress (30% of progress)
  if (application.pipelineEntries && application.pipelineEntries.length > 0) {
    const latestEntry = application.pipelineEntries[0]
    progress += latestEntry.progress * 0.3
    totalItems++
  }

  // Check tasks completion (20% of progress)
  if (application.tasks && application.tasks.length > 0) {
    const completedTasks = application.tasks.filter((task: any) => task.status === 'COMPLETED').length
    progress += (completedTasks / application.tasks.length) * 20
    totalItems++
  }

  // Check milestones (10% of progress)
  if (application.milestoneInstances && application.milestoneInstances.length > 0) {
    const completedMilestones = application.milestoneInstances.filter((milestone: any) => milestone.status === 'COMPLETED').length
    progress += (completedMilestones / application.milestoneInstances.length) * 10
    totalItems++
  }

  return totalItems > 0 ? Math.min(progress, 100) : 0
}

function getStatusInsights(application: any): any {
  const insights = {
    nextSteps: [] as string[],
    risks: [] as string[],
    recommendations: [] as string[]
  }

  // Analyze current status
  switch (application.status) {
    case 'DRAFT':
      insights.nextSteps.push('Complete application form')
      insights.recommendations.push('Upload required documents')
      break
    case 'SUBMITTED':
      insights.nextSteps.push('Wait for initial review')
      insights.recommendations.push('Prepare for potential interview')
      break
    case 'UNDER_REVIEW':
      insights.nextSteps.push('Respond to any requests for additional information')
      insights.risks.push('Missing documents may delay processing')
      break
    case 'IN_PROGRESS':
      insights.nextSteps.push('Complete pending requirements')
      insights.recommendations.push('Stay in touch with your consultant')
      break
    case 'PENDING_DECISION':
      insights.nextSteps.push('Wait for university decision')
      insights.recommendations.push('Prepare for next steps')
      break
    case 'ACCEPTED':
      insights.nextSteps.push('Accept offer and complete enrollment')
      insights.recommendations.push('Apply for visa if required')
      break
    case 'REJECTED':
      insights.nextSteps.push('Review feedback and consider reapplication')
      insights.recommendations.push('Explore alternative options')
      break
  }

  return insights
}

function getUpcomingDeadlines(application: any): any[] {
  const deadlines = []

  // Add document deadlines
  if (application.documents) {
    const pendingDocs = application.documents.filter((doc: any) => doc.status !== 'VERIFIED')
    pendingDocs.forEach((doc: any) => {
      deadlines.push({
        type: 'Document Verification',
        title: `Verify ${doc.name}`,
        dueDate: doc.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'MEDIUM'
      })
    })
  }

  // Add task deadlines
  if (application.tasks) {
    const pendingTasks = application.tasks.filter((task: any) => task.status !== 'COMPLETED')
    pendingTasks.forEach((task: any) => {
      if (task.dueDate) {
        deadlines.push({
          type: 'Task',
          title: task.title,
          dueDate: task.dueDate,
          priority: task.priority || 'MEDIUM'
        })
      }
    })
  }

  // Add milestone deadlines
  if (application.milestoneInstances) {
    const pendingMilestones = application.milestoneInstances.filter((milestone: any) => milestone.status !== 'COMPLETED')
    pendingMilestones.forEach((milestone: any) => {
      if (milestone.dueDate) {
        deadlines.push({
          type: 'Milestone',
          title: milestone.milestone.name,
          dueDate: milestone.dueDate,
          priority: 'HIGH'
        })
      }
    })
  }

  // Sort by due date and return upcoming ones
  return deadlines
    .filter(deadline => new Date(deadline.dueDate) > new Date())
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5)
}

function getRequirementsStatus(application: any): any[] {
  const requirements = []

  // Document requirements
  if (application.documents) {
    const docStatus = {
      name: 'Required Documents',
      status: application.documents.every((doc: any) => doc.status === 'VERIFIED') ? 'COMPLETED' : 'IN_PROGRESS',
      items: application.documents.map((doc: any) => ({
        name: doc.name,
        status: doc.status,
        category: doc.category
      }))
    }
    requirements.push(docStatus)
  }

  // Task requirements
  if (application.tasks) {
    const taskStatus = {
      name: 'Tasks',
      status: application.tasks.every((task: any) => task.status === 'COMPLETED') ? 'COMPLETED' : 'IN_PROGRESS',
      items: application.tasks.map((task: any) => ({
        name: task.title,
        status: task.status,
        assignee: task.assignedTo?.name || 'Unassigned'
      }))
    }
    requirements.push(taskStatus)
  }

  // Milestone requirements
  if (application.milestoneInstances) {
    const milestoneStatus = {
      name: 'Milestones',
      status: application.milestoneInstances.every((milestone: any) => milestone.status === 'COMPLETED') ? 'COMPLETED' : 'IN_PROGRESS',
      items: application.milestoneInstances.map((milestone: any) => ({
        name: milestone.milestone.name,
        status: milestone.status,
        dueDate: milestone.dueDate
      }))
    }
    requirements.push(milestoneStatus)
  }

  return requirements
}

function getTimelineEvents(application: any): any[] {
  const events = []

  // Application creation
  events.push({
    type: 'APPLICATION_CREATED',
    title: 'Application Started',
    date: application.createdAt,
    description: `Application to ${application.university.name} for ${application.program}`,
    status: 'COMPLETED'
  })

  // Pipeline events
  if (application.pipelineEntries) {
    application.pipelineEntries.forEach((entry: any) => {
      events.push({
        type: 'PIPELINE_STAGE_CHANGED',
        title: `Stage: ${entry.currentStage}`,
        date: entry.enteredAt,
        description: `Moved to ${entry.currentStage} stage`,
        status: 'COMPLETED'
      })
    })
  }

  // Task events
  if (application.tasks) {
    application.tasks.forEach((task: any) => {
      events.push({
        type: 'TASK_' + task.status,
        title: `Task: ${task.title}`,
        date: task.createdAt,
        description: `Task ${task.status.toLowerCase()}`,
        status: task.status
      })
    })
  }

  // Document events
  if (application.documents) {
    application.documents.forEach((doc: any) => {
      events.push({
        type: 'DOCUMENT_UPLOADED',
        title: `Document: ${doc.name}`,
        date: doc.uploadedAt,
        description: `${doc.name} uploaded and marked as ${doc.status}`,
        status: doc.status === 'VERIFIED' ? 'COMPLETED' : 'PENDING'
      })
    })
  }

  // Sort by date and return
  return events
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)
}

async function getApplicationStatusSummary(studentId: string, agencyId: string) {
  const applications = await db.application.findMany({
    where: {
      studentId,
      agencyId
    },
    select: {
      status: true
    }
  })

  const summary = applications.reduce((acc: any, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1
    acc.total += 1
    return acc
  }, {})

  return summary
}

async function getAverageProgress(studentId: string, agencyId: string) {
  const applications = await db.application.findMany({
    where: {
      studentId,
      agencyId
    },
    include: {
      documents: true,
      pipelineEntries: true,
      tasks: true,
      milestoneInstances: true
    }
  })

  if (applications.length === 0) return 0

  const totalProgress = applications.reduce((sum, app) => {
    return sum + calculateApplicationProgress(app)
  }, 0)

  return Math.round(totalProgress / applications.length)
}