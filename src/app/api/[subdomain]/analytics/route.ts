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

    // Calculate real revenue by month data
    const currentYear = new Date().getFullYear()
    const revenueByMonth = []
    
    for (let month = 0; month < 12; month++) {
      const startDate = new Date(currentYear, month, 1)
      const endDate = new Date(currentYear, month + 1, 0)
      
      const monthRevenue = agency.transactions
        .filter(t => {
          const transactionDate = new Date(t.createdAt)
          return t.type === "INCOME" && 
                 t.status === "COMPLETED" && 
                 transactionDate >= startDate && 
                 transactionDate <= endDate
        })
        .reduce((sum, t) => sum + t.amount, 0)
      
      revenueByMonth.push({
        month: new Date(currentYear, month).toLocaleString('default', { month: 'short' }),
        revenue: monthRevenue
      })
    }

    // Calculate real performance metrics based on actual data
    const completedApplications = agency.applications.filter(app => 
      ["COMPLETED", "ACCEPTED"].includes(app.status)
    ).length
    
    const totalApplications = agency.applications.length
    const applicationSuccessRate = totalApplications > 0 ? 
      Math.round((completedApplications / totalApplications) * 100) : 0

    // Calculate average processing time for completed applications
    const completedAppsWithDates = agency.applications
      .filter(app => ["COMPLETED", "ACCEPTED"].includes(app.status) && app.createdAt)
      .map(app => ({
        ...app,
        processingDays: Math.floor((new Date().getTime() - new Date(app.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      }))
    
    const avgProcessingTime = completedAppsWithDates.length > 0 ?
      Math.round(completedAppsWithDates.reduce((sum, app) => sum + app.processingDays, 0) / completedAppsWithDates.length) : 0

    // Calculate student satisfaction based on application success rate and processing time
    const studentSatisfaction = Math.min(100, Math.max(60, 
      applicationSuccessRate * 0.7 + (100 - Math.min(avgProcessingTime * 2, 100)) * 0.3
    ))

    // Calculate application processing efficiency
    const applicationProcessing = Math.min(100, Math.max(60,
      avgProcessingTime > 0 ? Math.max(60, 100 - avgProcessingTime * 2) : 90
    ))

    // Calculate team efficiency based on applications per team member
    const activeTeamMembers = await db.user.count({
      where: { 
        agencyId: agency.id, 
        status: "ACTIVE",
        role: { in: ["AGENCY_ADMIN", "CONSULTANT", "SUPPORT"] }
      }
    })
    
    const teamEfficiency = activeTeamMembers > 0 ? 
      Math.min(100, Math.round((totalApplications / activeTeamMembers) * 10)) : 75

    const overall = Math.round((studentSatisfaction + applicationProcessing + teamEfficiency) / 3)

    // Calculate real new students this month
    const currentMonth = new Date()
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const newThisMonth = agency.students.filter(student => 
      new Date(student.createdAt) >= startOfMonth
    ).length

    // Calculate real student conversion rate
    const convertedStudents = agency.students.filter(student => student.status === "ENROLLED").length
    const conversionRate = agency.students.length > 0 ? 
      Math.round((convertedStudents / agency.students.length) * 100) : 0

    // Calculate students by country
    const studentsByCountry = agency.students.reduce((acc, student) => {
      if (student.nationality) {
        acc[student.nationality] = (acc[student.nationality] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    const analytics = {
      students: {
        total: agency.students.length,
        active: agency.students.filter(s => s.status === "ACTIVE").length,
        newThisMonth,
        conversionRate,
        byStatus: studentsByStatus,
        byStage: studentsByStage,
        byCountry: studentsByCountry
      },
      applications: {
        total: agency.applications.length,
        active: agency.applications.filter(app => ["PENDING", "UNDER_REVIEW", "IN_PROGRESS"].includes(app.status)).length,
        completed: agency.applications.filter(app => ["COMPLETED", "ACCEPTED"].includes(app.status)).length,
        avgProcessingTime,
        successRate: applicationSuccessRate,
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