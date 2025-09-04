import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSubdomainForAPI } from "@/lib/utils"

export async function GET(request: NextRequest) {
  try {
    const subdomain = getSubdomainForAPI(request)
    if (!subdomain) {
      return NextResponse.json({ error: "Subdomain required" }, { status: 400 })
    }

    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    // Get current date and date ranges
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Fetch all relevant data in parallel
    const [
      students,
      applications,
      universities,
      users,
      tasks,
      invoices,
      activityLogs
    ] = await Promise.all([
      // Students data
      db.student.findMany({
        where: { agencyId: agency.id },
        select: {
          id: true,
          status: true,
          stage: true,
          createdAt: true,
          assignedTo: true
        }
      }),

      // Applications data
      db.application.findMany({
        where: { agencyId: agency.id },
        select: {
          id: true,
          status: true,
          createdAt: true,
          studentId: true,
          universityId: true
        }
      }),

      // Universities data
      db.university.findMany({
        where: { agencyId: agency.id },
        select: {
          id: true,
          isPartner: true,
          partnershipLevel: true,
          worldRanking: true
        }
      }),

      // Users data
      db.user.findMany({
        where: { agencyId: agency.id },
        select: {
          id: true,
          role: true,
          status: true,
          lastLoginAt: true
        }
      }),

      // Tasks data
      db.task.findMany({
        where: { agencyId: agency.id },
        select: {
          id: true,
          status: true,
          priority: true,
          dueDate: true,
          assignedTo: true
        }
      }),

      // Invoices data
      db.invoice.findMany({
        where: { agencyId: agency.id },
        select: {
          id: true,
          amount: true,
          currency: true,
          status: true,
          createdAt: true,
          paidDate: true
        }
      }),

      // Activity logs for recent activities
      db.activityLog.findMany({
        where: { agencyId: agency.id },
        include: {
          user: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ])

    // Calculate student statistics
    const studentStats = {
      total: students.length,
      byStatus: {
        PROSPECT: students.filter(s => s.status === 'PROSPECT').length,
        APPLIED: students.filter(s => s.status === 'APPLIED').length,
        ACCEPTED: students.filter(s => s.status === 'ACCEPTED').length,
        ENROLLED: students.filter(s => s.status === 'ENROLLED').length,
        GRADUATED: students.filter(s => s.status === 'GRADUATED').length,
        WITHDRAWN: students.filter(s => s.status === 'WITHDRAWN').length
      },
      byStage: {
        INQUIRY: students.filter(s => s.stage === 'INQUIRY').length,
        CONSULTATION: students.filter(s => s.stage === 'CONSULTATION').length,
        APPLICATION: students.filter(s => s.stage === 'APPLICATION').length,
        DOCUMENTATION: students.filter(s => s.stage === 'DOCUMENTATION').length,
        VISA_PROCESSING: students.filter(s => s.stage === 'VISA_PROCESSING').length,
        PRE_DEPARTURE: students.filter(s => s.stage === 'PRE_DEPARTURE').length,
        POST_ARRIVAL: students.filter(s => s.stage === 'POST_ARRIVAL').length
      },
      thisMonth: students.filter(s => s.createdAt >= startOfMonth).length,
      lastMonth: students.filter(s => s.createdAt >= startOfLastMonth && s.createdAt <= endOfLastMonth).length
    }

    // Calculate application statistics
    const applicationStats = {
      total: applications.length,
      byStatus: {
        DRAFT: applications.filter(a => a.status === 'DRAFT').length,
        SUBMITTED: applications.filter(a => a.status === 'SUBMITTED').length,
        UNDER_REVIEW: applications.filter(a => a.status === 'UNDER_REVIEW').length,
        APPROVED: applications.filter(a => a.status === 'APPROVED').length,
        REJECTED: applications.filter(a => a.status === 'REJECTED').length,
        WITHDRAWN: applications.filter(a => a.status === 'WITHDRAWN').length
      },
      thisMonth: applications.filter(a => a.createdAt >= startOfMonth).length,
      lastMonth: applications.filter(a => a.createdAt >= startOfLastMonth && a.createdAt <= endOfLastMonth).length
    }

    // Calculate university statistics
    const universityStats = {
      total: universities.length,
      partners: universities.filter(u => u.isPartner).length,
      byPartnershipLevel: {
        NONE: universities.filter(u => u.partnershipLevel === 'NONE').length,
        BASIC: universities.filter(u => u.partnershipLevel === 'BASIC').length,
        PREMIUM: universities.filter(u => u.partnershipLevel === 'PREMIUM').length,
        STRATEGIC: universities.filter(u => u.partnershipLevel === 'STRATEGIC').length
      },
      avgRanking: universities.filter(u => u.worldRanking).reduce((sum, u) => sum + (u.worldRanking || 0), 0) / universities.filter(u => u.worldRanking).length || 0
    }

    // Calculate user statistics
    const userStats = {
      total: users.length,
      byRole: {
        AGENCY_ADMIN: users.filter(u => u.role === 'AGENCY_ADMIN').length,
        CONSULTANT: users.filter(u => u.role === 'CONSULTANT').length,
        SUPPORT: users.filter(u => u.role === 'SUPPORT').length,
        STUDENT: users.filter(u => u.role === 'STUDENT').length
      },
      byStatus: {
        ACTIVE: users.filter(u => u.status === 'ACTIVE').length,
        INACTIVE: users.filter(u => u.status === 'INACTIVE').length,
        PENDING: users.filter(u => u.status === 'PENDING').length
      },
      activeThisMonth: users.filter(u => u.lastLoginAt && u.lastLoginAt >= startOfMonth).length
    }

    // Calculate task statistics
    const taskStats = {
      total: tasks.length,
      byStatus: {
        TODO: tasks.filter(t => t.status === 'TODO').length,
        IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS').length,
        COMPLETED: tasks.filter(t => t.status === 'COMPLETED').length,
        OVERDUE: tasks.filter(t => t.status === 'OVERDUE').length,
        CANCELLED: tasks.filter(t => t.status === 'CANCELLED').length
      },
      byPriority: {
        LOW: tasks.filter(t => t.priority === 'LOW').length,
        MEDIUM: tasks.filter(t => t.priority === 'MEDIUM').length,
        HIGH: tasks.filter(t => t.priority === 'HIGH').length,
        URGENT: tasks.filter(t => t.priority === 'URGENT').length
      },
      overdue: tasks.filter(t => t.dueDate && t.dueDate < now && t.status !== 'COMPLETED').length,
      completedThisWeek: tasks.filter(t => t.status === 'COMPLETED' && t.updatedAt >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)).length
    }

    // Calculate revenue statistics
    const revenueStats = {
      totalRevenue: invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0),
      thisMonthRevenue: invoices.filter(inv => inv.createdAt >= startOfMonth).reduce((sum, inv) => sum + (inv.amount || 0), 0),
      lastMonthRevenue: invoices.filter(inv => inv.createdAt >= startOfLastMonth && inv.createdAt <= endOfLastMonth).reduce((sum, inv) => sum + (inv.amount || 0), 0),
      byStatus: {
        PAID: invoices.filter(inv => inv.status === 'PAID').reduce((sum, inv) => sum + (inv.amount || 0), 0),
        PENDING: invoices.filter(inv => inv.status === 'PENDING').reduce((sum, inv) => sum + (inv.amount || 0), 0),
        OVERDUE: invoices.filter(inv => inv.status === 'OVERDUE').reduce((sum, inv) => sum + (inv.amount || 0), 0),
        CANCELLED: invoices.filter(inv => inv.status === 'CANCELLED').reduce((sum, inv) => sum + (inv.amount || 0), 0)
      }
    }

    // Calculate conversion rates
    const conversionRate = studentStats.total > 0 ? (studentStats.ACCEPTED / studentStats.total) * 100 : 0
    const applicationSuccessRate = applicationStats.total > 0 ? (applicationStats.byStatus.APPROVED / applicationStats.total) * 100 : 0

    // Calculate growth rates
    const studentGrowthRate = studentStats.lastMonth > 0 ? ((studentStats.thisMonth - studentStats.lastMonth) / studentStats.lastMonth) * 100 : 0
    const revenueGrowthRate = revenueStats.lastMonthRevenue > 0 ? ((revenueStats.thisMonthRevenue - revenueStats.lastMonthRevenue) / revenueStats.lastMonthRevenue) * 100 : 0

    // Calculate average processing time (mock calculation - in real app, this would be based on actual timestamps)
    const avgProcessingTime = 14 // days

    // Format recent activities
    const recentActivities = activityLogs.map(log => ({
      id: log.id,
      type: log.entityType.toLowerCase(),
      action: log.action,
      user: log.user?.name || 'System',
      timestamp: log.createdAt,
      details: log.changes ? JSON.parse(log.changes) : null
    }))

    // Calculate real-time metrics (simulated)
    const realTimeMetrics = {
      activeUsers: userStats.activeThisMonth,
      activeApplications: applicationStats.byStatus.SUBMITTED + applicationStats.byStatus.UNDER_REVIEW,
      todayActivities: activityLogs.filter(log => new Date(log.createdAt).toDateString() === now.toDateString()).length,
      systemHealth: 'HEALTHY' as const
    }

    return NextResponse.json({
      success: true,
      data: {
        // Student metrics
        students: studentStats,
        
        // Application metrics
        applications: applicationStats,
        
        // University metrics
        universities: universityStats,
        
        // User metrics
        users: userStats,
        
        // Task metrics
        tasks: taskStats,
        
        // Revenue metrics
        revenue: revenueStats,
        
        // Performance metrics
        performance: {
          conversionRate: Math.round(conversionRate * 100) / 100,
          applicationSuccessRate: Math.round(applicationSuccessRate * 100) / 100,
          avgProcessingTime,
          studentGrowthRate: Math.round(studentGrowthRate * 100) / 100,
          revenueGrowthRate: Math.round(revenueGrowthRate * 100) / 100
        },
        
        // Real-time metrics
        realTimeMetrics,
        
        // Recent activities
        recentActivities: recentActivities.slice(0, 10),
        
        // Summary stats for dashboard
        summary: {
          totalStudents: studentStats.total,
          activeApplications: applicationStats.byStatus.SUBMITTED + applicationStats.byStatus.UNDER_REVIEW,
          totalUniversities: universityStats.total,
          partnerUniversities: universityStats.partners,
          monthlyRevenue: revenueStats.thisMonthRevenue,
          teamMembers: userStats.byStatus.ACTIVE,
          conversionRate: Math.round(conversionRate * 100) / 100,
          avgProcessingTime,
          totalTasks: taskStats.total,
          pendingTasks: taskStats.byStatus.TODO + taskStats.byStatus.IN_PROGRESS,
          overdueTasks: taskStats.overdue,
          completedTasksThisWeek: taskStats.completedThisWeek
        }
      }
    })

  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}