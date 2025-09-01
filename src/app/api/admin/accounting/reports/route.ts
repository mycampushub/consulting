import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const agencyId = searchParams.get('agencyId')
    
    // Build where clause for reports
    const where: any = {}
    
    if (agencyId) {
      where.agencyId = agencyId
    }
    
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }
    
    let reportData = {}
    
    switch (reportType) {
      case 'PROFIT_LOSS':
        // Get profit and loss data
        const [invoices, expenses] = await Promise.all([
          db.invoice.findMany({
            where: {
              ...where,
              status: 'PAID'
            },
            select: {
              totalAmount: true,
              taxAmount: true
            }
          }),
          db.transaction.findMany({
            where: {
              ...where,
              type: 'EXPENSE'
            },
            select: {
              amount: true
            }
          })
        ])
        
        const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
        const totalTax = invoices.reduce((sum, inv) => sum + inv.taxAmount, 0)
        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
        const netProfit = totalRevenue - totalExpenses
        const grossProfit = totalRevenue - totalTax
        
        reportData = {
          totalRevenue,
          totalTax,
          totalExpenses,
          grossProfit,
          netProfit,
          profitMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
        }
        break
        
      case 'COMMISSION_REPORT':
        // Get commission data
        const commissions = await db.universityCommission.findMany({
          where,
          include: {
            university: {
              select: {
                name: true,
                country: true
              }
            }
          }
        })
        
        const totalCommissions = commissions.reduce((sum, comm) => sum + comm.commissionAmount, 0)
        const paidCommissions = commissions
          .filter(c => c.status === 'PAID')
          .reduce((sum, comm) => sum + comm.commissionAmount, 0)
        const pendingCommissions = commissions
          .filter(c => c.status === 'PENDING')
          .reduce((sum, comm) => sum + comm.commissionAmount, 0)
        
        // Group by university
        const byUniversity = commissions.reduce((acc, comm) => {
          const key = comm.university.name
          if (!acc[key]) {
            acc[key] = {
              university: comm.university.name,
              country: comm.university.country,
              total: 0,
              paid: 0,
              pending: 0,
              count: 0
            }
          }
          acc[key].total += comm.commissionAmount
          acc[key].count += 1
          if (comm.status === 'PAID') {
            acc[key].paid += comm.commissionAmount
          } else if (comm.status === 'PENDING') {
            acc[key].pending += comm.commissionAmount
          }
          return acc
        }, {} as any)
        
        reportData = {
          totalCommissions,
          paidCommissions,
          pendingCommissions,
          byUniversity: Object.values(byUniversity)
        }
        break
        
      case 'AGED_RECEIVABLES':
        // Get aged receivables data
        const unpaidInvoices = await db.invoice.findMany({
          where: {
            ...where,
            status: {
              in: ['SENT', 'OVERDUE']
            }
          },
          select: {
            totalAmount: true,
            dueDate: true,
            createdAt: true
          }
        })
        
        const now = new Date()
        const buckets = {
          current: 0,      // 0-30 days
          days31_60: 0,    // 31-60 days
          days61_90: 0,    // 61-90 days
          over90: 0        // Over 90 days
        }
        
        unpaidInvoices.forEach(invoice => {
          const dueDate = new Date(invoice.dueDate)
          const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
          
          if (daysOverdue <= 0) {
            buckets.current += invoice.totalAmount
          } else if (daysOverdue <= 30) {
            buckets.days31_60 += invoice.totalAmount
          } else if (daysOverdue <= 60) {
            buckets.days61_90 += invoice.totalAmount
          } else {
            buckets.over90 += invoice.totalAmount
          }
        })
        
        reportData = {
          totalOutstanding: Object.values(buckets).reduce((sum, val) => sum + val, 0),
          buckets
        }
        break
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid report type' },
          { status: 400 }
        )
    }
    
    return NextResponse.json({
      success: true,
      data: reportData,
      reportType
    })
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      agencyId,
      reportType,
      title,
      reportPeriod,
      currency = 'USD'
    } = body
    
    // Create financial report
    const report = await db.financialReport.create({
      data: {
        agencyId,
        reportType,
        title,
        reportPeriod,
        currency,
        status: 'GENERATING'
      }
    })
    
    // In a real implementation, you would generate the report asynchronously
    // For now, we'll mark it as completed immediately
    await db.financialReport.update({
      where: { id: report.id },
      data: {
        status: 'COMPLETED',
        generatedAt: new Date(),
        reportData: JSON.stringify({
          generatedAt: new Date().toISOString(),
          message: 'Report generated successfully'
        })
      }
    })
    
    return NextResponse.json({
      success: true,
      data: report,
      message: 'Report generation started'
    })
  } catch (error) {
    console.error('Error creating report:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create report' },
      { status: 500 }
    )
  }
}