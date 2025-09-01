import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '30d'
    const agencyId = searchParams.get('agencyId')
    const type = searchParams.get('type') || 'overview'

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

    if (type === 'overview') {
      // Get comprehensive overview analytics
      const [
        totalAgencies,
        activeAgencies,
        totalSubscriptions,
        activeSubscriptions,
        totalRevenue,
        mrr,
        churnRate,
        conversionRate,
        featureUsage,
        planDistribution
      ] = await Promise.all([
        // Total agencies
        db.agency.count({
          where: {
            createdAt: {
              gte: startDate
            }
          }
        }),
        
        // Active agencies
        db.agency.count({
          where: {
            status: 'ACTIVE',
            createdAt: {
              gte: startDate
            }
          }
        }),
        
        // Total subscriptions
        db.agencySubscription.count({
          where: {
            createdAt: {
              gte: startDate
            }
          }
        }),
        
        // Active subscriptions
        db.agencySubscription.count({
          where: {
            status: 'ACTIVE',
            createdAt: {
              gte: startDate
            }
          }
        }),
        
        // Total revenue
        db.subscriptionBilling.aggregate({
          where: {
            status: 'PAID',
            paidAt: {
              gte: startDate
            }
          },
          _sum: {
            amount: true
          }
        }),
        
        // Monthly recurring revenue
        db.subscriptionBilling.aggregate({
          where: {
            status: 'PAID',
            paidAt: {
              gte: startDate
            }
          },
          _sum: {
            amount: true
          }
        }),
        
        // Churn rate calculation
        db.agencySubscription.count({
          where: {
            status: 'CANCELLED',
            cancelledAt: {
              gte: startDate
            }
          }
        }),
        
        // Conversion rate (trial to paid)
        Promise.all([
          db.agencySubscription.count({
            where: {
              status: 'TRIAL',
              createdAt: {
                gte: startDate
              }
            }
          }),
          db.agencySubscription.count({
            where: {
              status: 'ACTIVE',
              createdAt: {
                gte: startDate
              }
            }
          })
        ]),
        
        // Feature usage analytics
        db.subscriptionUsage.groupBy({
          by: ['featureId'],
          _sum: {
            currentUsage: true
          },
          _avg: {
            currentUsage: true
          },
          where: {
            createdAt: {
              gte: startDate
            }
          },
          orderBy: {
            _sum: {
              currentUsage: 'desc'
            }
          },
          take: 10
        }),
        
        // Plan distribution
        db.agencySubscription.groupBy({
          by: ['planId'],
          _count: {
            planId: true
          },
          where: {
            createdAt: {
              gte: startDate
            }
          }
        })
      ])

      // Calculate derived metrics
      const totalRevenueAmount = totalRevenue._sum.amount || 0
      const mrrAmount = mrr._sum.amount || 0
      const totalTrials = conversionRate[0] || 0
      const totalPaid = conversionRate[1] || 0
      const calculatedConversionRate = totalTrials > 0 ? (totalPaid / totalTrials) * 100 : 0
      const calculatedChurnRate = activeSubscriptions > 0 ? (churnRate / activeSubscriptions) * 100 : 0

      // Get feature details
      const featureDetails = await Promise.all(
        featureUsage.map(async (usage) => {
          const feature = await db.subscriptionFeature.findUnique({
            where: { id: usage.featureId }
          })
          return {
            feature: feature?.name || 'Unknown',
            category: feature?.category || 'Unknown',
            totalUsage: usage._sum.currentUsage || 0,
            averageUsage: usage._avg.currentUsage || 0
          }
        })
      )

      // Get plan details
      const planDetails = await Promise.all(
        planDistribution.map(async (dist) => {
          const plan = await db.subscriptionPlan.findUnique({
            where: { id: dist.planId }
          })
          return {
            plan: plan?.name || 'Unknown',
            count: dist._count.planId
          }
        })
      )

      return NextResponse.json({
        success: true,
        data: {
          overview: {
            totalAgencies,
            activeAgencies,
            totalSubscriptions,
            activeSubscriptions,
            totalRevenue: totalRevenueAmount,
            mrr: mrrAmount,
            churnRate: calculatedChurnRate,
            conversionRate: calculatedConversionRate
          },
          featureUsage: featureDetails,
          planDistribution: planDetails,
          timeframe
        }
      })
    }

    if (type === 'revenue') {
      // Revenue analytics with trend data
      const revenueData = await db.subscriptionBilling.findMany({
        where: {
          status: 'PAID',
          paidAt: {
            gte: startDate
          }
        },
        orderBy: {
          paidAt: 'asc'
        },
        select: {
          amount: true,
          paidAt: true,
          currency: true
        }
      })

      // Group revenue by day/week/month based on timeframe
      const groupedRevenue = revenueData.reduce((acc, billing) => {
        const date = new Date(billing.paidAt)
        let key: string
        
        if (timeframe === '7d') {
          key = date.toISOString().split('T')[0] // Daily
        } else if (timeframe === '30d') {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(Math.floor(date.getDate() / 7) * 7 + 1).padStart(2, '0')}` // Weekly
        } else {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` // Monthly
        }
        
        if (!acc[key]) {
          acc[key] = { date: key, revenue: 0, count: 0 }
        }
        acc[key].revenue += billing.amount
        acc[key].count += 1
        
        return acc
      }, {} as Record<string, { date: string; revenue: number; count: number }>)

      return NextResponse.json({
        success: true,
        data: {
          revenue: Object.values(groupedRevenue),
          timeframe
        }
      })
    }

    if (type === 'user-activity') {
      // User activity analytics
      const userActivity = await db.activityLog.findMany({
        where: {
          createdAt: {
            gte: startDate
          }
        },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          },
          agency: {
            select: {
              name: true,
              subdomain: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 100
      })

      // Group activity by action type
      const activityByType = userActivity.reduce((acc, log) => {
        const action = log.action
        if (!acc[action]) {
          acc[action] = { action, count: 0 }
        }
        acc[action].count += 1
        return acc
      }, {} as Record<string, { action: string; count: number }>)

      return NextResponse.json({
        success: true,
        data: {
          recentActivity: userActivity,
          activityByType: Object.values(activityByType),
          timeframe
        }
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid analytics type' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error fetching enterprise analytics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch enterprise analytics' },
      { status: 500 }
    )
  }
}