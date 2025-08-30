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
    const timeRange = searchParams.get("timeRange") || "30d"

    const agency = await db.agency.findUnique({
      where: { subdomain },
      include: {
        students: true,
        applications: {
          include: {
            university: true
          }
        },
        marketingCampaigns: true,
        invoices: true,
        transactions: true
      }
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    // Calculate student analytics
    const studentsByStatus = agency.students.reduce((acc, student) => {
      acc[student.status] = (acc[student.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const studentsByStage = agency.students.reduce((acc, student) => {
      acc[student.stage] = (acc[student.stage] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Calculate application analytics
    const applicationsByStatus = agency.applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const applicationsByUniversity = agency.applications.reduce((acc, app) => {
      if (app.university) {
        acc[app.university.name] = (acc[app.university.name] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    // Calculate marketing analytics
    const totalLeads = agency.marketingCampaigns.reduce((sum, campaign) => sum + campaign.sentCount, 0)
    const totalConversions = agency.marketingCampaigns.reduce((sum, campaign) => sum + campaign.conversionCount, 0)
    const totalBudget = agency.marketingCampaigns.reduce((sum, campaign) => sum + (campaign.budget || 0), 0)
    const totalSpent = agency.marketingCampaigns.reduce((sum, campaign) => sum + campaign.spent, 0)

    // Calculate financial analytics
    const totalRevenue = agency.transactions
      .filter(t => t.type === "REVENUE")
      .reduce((sum, t) => sum + t.amount, 0)

    const monthlyRevenue = agency.transactions
      .filter(t => {
        const transactionDate = new Date(t.createdAt)
        const oneMonthAgo = new Date()
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
        return t.type === "REVENUE" && transactionDate >= oneMonthAgo
      })
      .reduce((sum, t) => sum + t.amount, 0)

    const avgTransactionValue = totalRevenue > 0 && agency.transactions.length > 0 
      ? totalRevenue / agency.transactions.filter(t => t.type === "REVENUE").length 
      : 0

    const outstandingInvoices = agency.invoices.filter(inv => inv.status === "UNPAID").length

    // Generate mock revenue by month data
    const revenueByMonth = [
      { month: "Jan", revenue: Math.random() * 50000 + 30000 },
      { month: "Feb", revenue: Math.random() * 50000 + 30000 },
      { month: "Mar", revenue: Math.random() * 50000 + 30000 },
      { month: "Apr", revenue: Math.random() * 50000 + 30000 },
      { month: "May", revenue: Math.random() * 50000 + 30000 },
      { month: "Jun", revenue: Math.random() * 50000 + 30000 }
    ]

    // Calculate performance metrics
    const studentSatisfaction = Math.floor(Math.random() * 20) + 80 // 80-100%
    const applicationProcessing = Math.floor(Math.random() * 15) + 85 // 85-100%
    const teamEfficiency = Math.floor(Math.random() * 25) + 75 // 75-100%
    const overall = Math.floor((studentSatisfaction + applicationProcessing + teamEfficiency) / 3)

    const analytics = {
      students: {
        total: agency.students.length,
        active: agency.students.filter(s => s.status === "ACTIVE").length,
        newThisMonth: Math.floor(Math.random() * 10) + 5, // Mock data
        conversionRate: Math.floor(Math.random() * 30) + 60, // Mock data
        byStatus: studentsByStatus,
        byStage: studentsByStage,
        byCountry: {} // Mock empty for now
      },
      applications: {
        total: agency.applications.length,
        active: agency.applications.filter(app => ["PENDING", "UNDER_REVIEW", "IN_PROGRESS"].includes(app.status)).length,
        completed: agency.applications.filter(app => ["COMPLETED", "ACCEPTED"].includes(app.status)).length,
        avgProcessingTime: Math.floor(Math.random() * 20) + 10, // Mock data in days
        successRate: agency.applications.length > 0 ? Math.round((agency.applications.filter(app => ["COMPLETED", "ACCEPTED"].includes(app.status)).length / agency.applications.length) * 100) : 0,
        byStatus: applicationsByStatus,
        byUniversity: applicationsByUniversity
      },
      marketing: {
        totalLeads,
        conversionRate: totalLeads > 0 ? Math.round((totalConversions / totalLeads) * 100) : 0,
        costPerLead: totalConversions > 0 ? Math.round(totalSpent / totalConversions) : 0,
        roi: totalSpent > 0 ? Math.round(totalRevenue / totalSpent) : 0,
        campaigns: {
          active: agency.marketingCampaigns.filter(c => c.status === "ACTIVE").length,
          totalSent: agency.marketingCampaigns.reduce((sum, c) => sum + c.sentCount, 0),
          openRate: agency.marketingCampaigns.length > 0 ? Math.round(agency.marketingCampaigns.reduce((sum, c) => sum + c.openedCount, 0) / agency.marketingCampaigns.reduce((sum, c) => sum + c.deliveredCount, 0) * 100) : 0,
          clickRate: agency.marketingCampaigns.length > 0 ? Math.round(agency.marketingCampaigns.reduce((sum, c) => sum + c.clickedCount, 0) / agency.marketingCampaigns.reduce((sum, c) => sum + c.openedCount, 0) * 100) : 0
        }
      },
      financial: {
        totalRevenue,
        monthlyRevenue,
        avgTransactionValue,
        outstandingInvoices,
        revenueByMonth
      },
      performance: {
        studentSatisfaction,
        applicationProcessing,
        teamEfficiency,
        overall
      }
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}