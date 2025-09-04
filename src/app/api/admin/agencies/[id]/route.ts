import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Fetch agency with comprehensive data
    const agency = await db.agency.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            students: true,
            universities: true,
            applications: true,
            invoices: true,
            activityLogs: true
          }
        },
        billing: true,
        featureSettings: true,
        brandSettings: true,
        accounting: true,
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            status: true,
            createdAt: true,
            lastLoginAt: true
          }
        }
      }
    })

    if (!agency) {
      return NextResponse.json(
        { error: "Agency not found" },
        { status: 404 }
      )
    }

    // Get recent activity
    const recentActivity = await db.activityLog.findMany({
      where: { agencyId: id },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Get billing status
    const billingStatus = agency.billing ? 
      (agency.invoices.length > 0 ? 
        agency.invoices.some(inv => inv.status === 'OVERDUE') ? 'PAST_DUE' :
        agency.invoices.some(inv => inv.status === 'CANCELLED') ? 'CANCELLED' : 'ACTIVE'
      : 'ACTIVE') 
    : 'ACTIVE'

    // Calculate health score
    const healthScore = calculateHealthScore(agency, billingStatus)

    // Get performance metrics
    const performance = await calculatePerformanceMetrics(id)

    return NextResponse.json({
      success: true,
      data: {
        agency: {
          id: agency.id,
          name: agency.name,
          subdomain: agency.subdomain,
          customDomain: agency.customDomain,
          status: agency.status,
          plan: agency.plan,
          createdAt: agency.createdAt,
          updatedAt: agency.updatedAt,
          primaryColor: agency.primaryColor,
          secondaryColor: agency.secondaryColor,
          logo: agency.logo,
          favicon: agency.favicon
        },
        billing: agency.billing,
        featureSettings: agency.featureSettings,
        brandSettings: agency.brandSettings,
        accounting: agency.accounting,
        users: agency.users,
        stats: {
          userCount: agency._count.users,
          studentCount: agency._count.students,
          universityCount: agency._count.universities,
          applicationCount: agency._count.applications,
          invoiceCount: agency._count.invoices,
          activityCount: agency._count.activityLogs
        },
        health: healthScore,
        performance,
        billingStatus,
        recentActivity
      }
    })

  } catch (error) {
    console.error("Error fetching agency:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const {
      name,
      subdomain,
      customDomain,
      status,
      plan,
      primaryColor,
      secondaryColor,
      logo,
      favicon
    } = body

    // Check if agency exists
    const existingAgency = await db.agency.findUnique({
      where: { id }
    })

    if (!existingAgency) {
      return NextResponse.json(
        { error: "Agency not found" },
        { status: 404 }
      )
    }

    // Check if subdomain is already taken (if changing)
    if (subdomain && subdomain !== existingAgency.subdomain) {
      const subdomainExists = await db.agency.findUnique({
        where: { subdomain }
      })

      if (subdomainExists) {
        return NextResponse.json(
          { error: "Subdomain already exists" },
          { status: 400 }
        )
      }
    }

    // Check if custom domain is already taken (if changing)
    if (customDomain && customDomain !== existingAgency.customDomain) {
      const customDomainExists = await db.agency.findUnique({
        where: { customDomain }
      })

      if (customDomainExists) {
        return NextResponse.json(
          { error: "Custom domain already exists" },
          { status: 400 }
        )
      }
    }

    // Update agency
    const updatedAgency = await db.agency.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(subdomain && { subdomain }),
        ...(customDomain !== undefined && { customDomain }),
        ...(status && { status }),
        ...(plan && { plan }),
        ...(primaryColor && { primaryColor }),
        ...(secondaryColor && { secondaryColor }),
        ...(logo !== undefined && { logo }),
        ...(favicon !== undefined && { favicon })
      }
    })

    // Update billing if plan changed
    if (plan && plan !== existingAgency.plan) {
      await db.billing.updateMany({
        where: { agencyId: id },
        data: { plan }
      })

      // Update feature settings based on new plan
      await db.featureSettings.updateMany({
        where: { agencyId: id },
        data: {
          studentJourneyEnabled: plan !== 'FREE',
          visualProgressTracker: plan !== 'FREE',
          automatedMilestones: plan !== 'FREE',
          guidelinesRepository: plan !== 'FREE',
          automatedRecommendations: plan === 'ENTERPRISE',
          aiChatbotEnabled: plan === 'ENTERPRISE',
          whatsappIntegration: plan !== 'FREE'
        }
      })
    }

    // Log the update
    await db.activityLog.create({
      data: {
        agencyId: id,
        action: 'AGENCY_UPDATED',
        entityType: 'Agency',
        entityId: id,
        changes: JSON.stringify({
          before: existingAgency,
          after: updatedAgency
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        agency: updatedAgency
      }
    })

  } catch (error) {
    console.error("Error updating agency:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check if agency exists
    const agency = await db.agency.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            students: true,
            applications: true
          }
        }
      }
    })

    if (!agency) {
      return NextResponse.json(
        { error: "Agency not found" },
        { status: 404 }
      )
    }

    // Prevent deletion if agency has active users or data
    if (agency._count.users > 0 || agency._count.students > 0 || agency._count.applications > 0) {
      return NextResponse.json(
        { error: "Cannot delete agency with active users or data" },
        { status: 400 }
      )
    }

    // Delete agency (cascade will handle related records)
    await db.agency.delete({
      where: { id }
    })

    // Log the deletion
    await db.activityLog.create({
      data: {
        agencyId: id,
        action: 'AGENCY_DELETED',
        entityType: 'Agency',
        entityId: id,
        changes: JSON.stringify({
          deletedAgency: agency
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      success: true,
      message: "Agency deleted successfully"
    })

  } catch (error) {
    console.error("Error deleting agency:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}

// Helper functions
function calculateHealthScore(agency: any, billingStatus: string) {
  let score = 100
  
  // Deduct for inactive status
  if (agency.status === 'INACTIVE') score -= 30
  if (agency.status === 'SUSPENDED') score -= 50
  
  // Deduct for billing issues
  if (billingStatus === 'PAST_DUE') score -= 20
  if (billingStatus === 'CANCELLED') score -= 40
  
  // Deduct for low activity
  const daysSinceActivity = agency.updatedAt ? 
    Math.floor((Date.now() - new Date(agency.updatedAt).getTime()) / (1000 * 60 * 60 * 24)) : 999
  if (daysSinceActivity > 30) score -= 15
  if (daysSinceActivity > 90) score -= 25
  
  // Determine grade
  if (score >= 90) return { grade: 'EXCELLENT', score }
  if (score >= 75) return { grade: 'GOOD', score }
  if (score >= 60) return { grade: 'WARNING', score }
  return { grade: 'CRITICAL', score }
}

async function calculatePerformanceMetrics(agencyId: string) {
  // Get recent activity logs for performance metrics
  const recentLogs = await db.activityLog.findMany({
    where: { 
      agencyId,
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      }
    }
  })

  // Calculate metrics based on activity
  const responseTime = Math.floor(Math.random() * 200) + 100 // Mock data
  const uptime = 95 + Math.random() * 5
  const errorRate = (recentLogs.filter(log => log.action.includes('ERROR')).length / Math.max(recentLogs.length, 1)) * 100

  return {
    responseTime,
    uptime,
    errorRate,
    avgSessionDuration: Math.floor(Math.random() * 1000) + 500,
    bounceRate: Math.random() * 30
  }
}