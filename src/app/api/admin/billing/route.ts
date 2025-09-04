import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const agencyId = searchParams.get('agencyId')
    const status = searchParams.get('status')
    const plan = searchParams.get('plan')
    const timeframe = searchParams.get('timeframe') || '30d'

    const skip = (page - 1) * limit

    // Calculate date range based on timeframe
    const now = new Date()
    let startDate = new Date()
    
    switch (timeframe) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // Build where clause for filtering
    const where: any = {}
    
    if (agencyId && agencyId !== 'all') {
      where.agencyId = agencyId
    }
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (plan && plan !== 'all') {
      where.plan = plan
    }

    // Fetch billing records with related data
    const [billingRecords, totalCount] = await Promise.all([
      db.billing.findMany({
        where,
        include: {
          agency: {
            select: {
              id: true,
              name: true,
              subdomain: true,
              status: true,
              plan: true
            }
          },
          invoices: {
            where: {
              createdAt: { gte: startDate }
            },
            select: {
              id: true,
              invoiceNumber: true,
              amount: true,
              status: true,
              createdAt: true,
              dueDate: true
            }
          },
          _count: {
            select: {
              invoices: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.billing.count({ where })
    ])

    // Get billing analytics
    const billingAnalytics = await getBillingAnalytics(startDate, where)

    // Get revenue metrics
    const revenueMetrics = await getRevenueMetrics(startDate, where)

    // Get subscription metrics
    const subscriptionMetrics = await getSubscriptionMetrics(where)

    return NextResponse.json({
      success: true,
      data: {
        billing: billingRecords,
        analytics: billingAnalytics,
        revenue: revenueMetrics,
        subscriptions: subscriptionMetrics,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        },
        timeframe
      }
    })

  } catch (error) {
    console.error("Error fetching billing data:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      agencyId,
      plan,
      currency = 'USD',
      billingCycle = 'MONTHLY',
      trialDays = 0,
      customPricing,
      features
    } = body

    // Validate required fields
    if (!agencyId || !plan) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if agency exists
    const agency = await db.agency.findUnique({
      where: { id: agencyId }
    })

    if (!agency) {
      return NextResponse.json(
        { error: "Agency not found" },
        { status: 404 }
      )
    }

    // Check if billing record already exists
    const existingBilling = await db.billing.findUnique({
      where: { agencyId }
    })

    if (existingBilling) {
      return NextResponse.json(
        { error: "Billing record already exists for this agency" },
        { status: 400 }
      )
    }

    // Calculate billing period
    const now = new Date()
    const currentPeriodStart = now
    const currentPeriodEnd = new Date(now)
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1)

    // Create billing record
    const billing = await db.billing.create({
      data: {
        agencyId,
        plan,
        currency,
        billingCycle,
        trialDays,
        currentPeriodStart,
        currentPeriodEnd,
        customPricing,
        features: features || getDefaultFeatures(plan)
      }
    })

    // Log the billing setup
    await db.activityLog.create({
      data: {
        agencyId,
        action: 'BILLING_CREATED',
        entityType: 'Billing',
        entityId: billing.id,
        changes: JSON.stringify({
          plan,
          currency,
          billingCycle,
          trialDays
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        billing: {
          id: billing.id,
          agencyId: billing.agencyId,
          plan: billing.plan,
          currency: billing.currency,
          billingCycle: billing.billingCycle,
          currentPeriodStart: billing.currentPeriodStart,
          currentPeriodEnd: billing.currentPeriodEnd,
          createdAt: billing.createdAt
        }
      }
    })

  } catch (error) {
    console.error("Error creating billing record:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}

// Helper functions
async function getBillingAnalytics(startDate: Date, where: any) {
  const [
    totalRevenue,
    mrr,
    arr,
    averageRevenuePerAgency,
    growthRate,
    churnRate,
    lifetimeValue
  ] = await Promise.all([
    // Total revenue
    db.invoice.aggregate({
      where: {
        ...where,
        status: 'PAID',
        paidAt: { gte: startDate }
      },
      _sum: { amount: true }
    }),

    // Monthly Recurring Revenue
    db.invoice.aggregate({
      where: {
        ...where,
        status: 'PAID',
        paidAt: { gte: startDate }
      },
      _sum: { amount: true }
    }),

    // Annual Recurring Revenue
    db.invoice.aggregate({
      where: {
        ...where,
        status: 'PAID',
        paidAt: { gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
      },
      _sum: { amount: true }
    }),

    // Average revenue per agency
    db.invoice.aggregate({
      where: {
        ...where,
        status: 'PAID',
        paidAt: { gte: startDate }
      },
      _avg: { amount: true }
    }),

    // Growth rate (month over month)
    calculateGrowthRate(startDate, where),

    // Churn rate
    calculateChurnRate(startDate, where),

    // Lifetime value
    calculateLifetimeValue(where)
  ])

  return {
    totalRevenue: totalRevenue._sum.amount || 0,
    mrr: mrr._sum.amount || 0,
    arr: arr._sum.amount || 0,
    averageRevenuePerAgency: averageRevenuePerAgency._avg.amount || 0,
    growthRate,
    churnRate,
    lifetimeValue
  }
}

async function getRevenueMetrics(startDate: Date, where: any) {
  // Get revenue by month
  const revenueByMonth = await db.invoice.groupBy({
    by: ['createdAt'],
    where: {
      ...where,
      status: 'PAID',
      paidAt: { gte: startDate }
    },
    _sum: { amount: true },
    _count: { id: true },
    orderBy: { createdAt: 'asc' }
  })

  // Group by month
  const monthlyRevenue = revenueByMonth.reduce((acc, item) => {
    const month = new Date(item.createdAt).toISOString().slice(0, 7) // YYYY-MM
    if (!acc[month]) {
      acc[month] = { revenue: 0, count: 0 }
    }
    acc[month].revenue += item._sum.amount || 0
    acc[month].count += item._count.id
    return acc
  }, {} as Record<string, { revenue: number; count: number }>)

  // Get revenue by plan
  const revenueByPlan = await db.invoice.groupBy({
    by: ['agencyId'],
    where: {
      ...where,
      status: 'PAID',
      paidAt: { gte: startDate }
    },
    _sum: { amount: true },
    _count: { id: true }
  })

  return {
    monthlyRevenue: Object.entries(monthlyRevenue).map(([month, data]) => ({
      month,
      revenue: data.revenue,
      count: data.count
    })),
    revenueByPlan: revenueByPlan.map(item => ({
      agencyId: item.agencyId,
      revenue: item._sum.amount || 0,
      count: item._count.id
    }))
  }
}

async function getSubscriptionMetrics(where: any) {
  const [
    totalSubscriptions,
    activeSubscriptions,
    trialSubscriptions,
    cancelledSubscriptions,
    subscriptionsByPlan,
    averageSubscriptionLength
  ] = await Promise.all([
    // Total subscriptions
    db.billing.count(where),

    // Active subscriptions
    db.billing.count({
      ...where,
      plan: { in: ['STARTER', 'PROFESSIONAL', 'ENTERPRISE'] }
    }),

    // Trial subscriptions
    db.billing.count({
      ...where,
      plan: 'FREE'
    }),

    // Cancelled subscriptions
    db.billing.count({
      ...where,
      status: 'CANCELLED'
    }),

    // Subscriptions by plan
    db.billing.groupBy({
      by: ['plan'],
      _count: { plan: true },
      where
    }),

    // Average subscription length
    db.billing.aggregate({
      where,
      _avg: {
        createdAt: true
      }
    })
  ])

  return {
    total: totalSubscriptions,
    active: activeSubscriptions,
    trial: trialSubscriptions,
    cancelled: cancelledSubscriptions,
    byPlan: subscriptionsByPlan.map(item => ({
      plan: item.plan,
      count: item._count.plan
    })),
    averageLength: averageSubscriptionLength._avg.createdAt || 0
  }
}

async function calculateGrowthRate(startDate: Date, where: any) {
  // Get current month revenue
  const currentMonthRevenue = await db.invoice.aggregate({
    where: {
      ...where,
      status: 'PAID',
      paidAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    },
    _sum: { amount: true }
  })

  // Get previous month revenue
  const previousMonthRevenue = await db.invoice.aggregate({
    where: {
      ...where,
      status: 'PAID',
      paidAt: {
        gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    },
    _sum: { amount: true }
  })

  const current = currentMonthRevenue._sum.amount || 0
  const previous = previousMonthRevenue._sum.amount || 0

  return previous > 0 ? ((current - previous) / previous) * 100 : 0
}

async function calculateChurnRate(startDate: Date, where: any) {
  const [
    activeSubscriptions,
    cancelledSubscriptions
  ] = await Promise.all([
    db.billing.count({
      ...where,
      status: 'ACTIVE'
    }),
    db.billing.count({
      ...where,
      status: 'CANCELLED',
      updatedAt: { gte: startDate }
    })
  ])

  return activeSubscriptions > 0 ? (cancelledSubscriptions / activeSubscriptions) * 100 : 0
}

async function calculateLifetimeValue(where: any) {
  const [
    totalRevenue,
    totalCustomers
  ] = await Promise.all([
    db.invoice.aggregate({
      where: {
        ...where,
        status: 'PAID'
      },
      _sum: { amount: true }
    }),
    db.billing.count({
      ...where,
      status: 'ACTIVE'
    })
  ])

  const revenue = totalRevenue._sum.amount || 0
  return totalCustomers > 0 ? revenue / totalCustomers : 0
}

function getDefaultFeatures(plan: string) {
  const features = {
    customDomain: plan !== 'FREE',
    whiteLabel: plan === 'ENTERPRISE',
    apiAccess: plan !== 'FREE',
    advancedAnalytics: plan !== 'FREE',
    prioritySupport: plan === 'ENTERPRISE',
    customIntegrations: plan !== 'FREE',
    unlimitedStudents: plan === 'ENTERPRISE',
    unlimitedUsers: plan === 'ENTERPRISE',
    unlimitedStorage: plan === 'ENTERPRISE'
  }

  return features
}