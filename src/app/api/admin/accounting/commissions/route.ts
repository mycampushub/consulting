import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    
    const offset = (page - 1) * limit
    
    // Build where clause
    const where: any = {}
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (search) {
      where.OR = [
        {
          university: {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          student: {
            firstName: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          student: {
            lastName: {
              contains: search,
              mode: 'insensitive'
            }
          }
        }
      ]
    }
    
    // Get commissions with related data
    const [commissions, totalCount] = await Promise.all([
      db.universityCommission.findMany({
        where,
        include: {
          agency: {
            select: {
              id: true,
              name: true,
              subdomain: true
            }
          },
          university: {
            select: {
              id: true,
              name: true,
              country: true,
              city: true
            }
          },
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          application: {
            select: {
              id: true,
              program: true,
              status: true
            }
          },
          invoice: {
            select: {
              id: true,
              invoiceNumber: true,
              status: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: limit
      }),
      db.universityCommission.count({ where })
    ])
    
    return NextResponse.json({
      success: true,
      data: commissions,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching commissions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch commissions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      agencyId,
      universityId,
      commissionType,
      commissionRate,
      fixedAmount,
      invoiceAmount,
      paymentTerm,
      applicationId,
      studentId,
      notes
    } = body
    
    // Calculate commission amount
    let commissionAmount = 0
    if (commissionType === 'PERCENTAGE') {
      commissionAmount = (invoiceAmount * commissionRate) / 100
    } else if (commissionType === 'FIXED') {
      commissionAmount = fixedAmount
    } else if (commissionType === 'TIERED') {
      // For tiered commissions, use the rate as a base
      commissionAmount = (invoiceAmount * commissionRate) / 100
    } else if (commissionType === 'HYBRID') {
      commissionAmount = fixedAmount + ((invoiceAmount * commissionRate) / 100)
    }
    
    // Calculate due date based on payment term
    const dueDate = new Date()
    const termDays = parseInt(paymentTerm.replace('NET_', '')) || 30
    dueDate.setDate(dueDate.getDate() + termDays)
    
    // Create commission
    const commission = await db.universityCommission.create({
      data: {
        agencyId,
        universityId,
        commissionType,
        commissionRate,
        fixedAmount,
        invoiceAmount,
        commissionAmount,
        currency: 'USD',
        status: 'PENDING',
        paymentTerm,
        dueDate,
        applicationId,
        studentId,
        notes
      },
      include: {
        agency: {
          select: {
            id: true,
            name: true,
            subdomain: true
          }
        },
        university: {
          select: {
            id: true,
            name: true,
            country: true,
            city: true
          }
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        application: {
          select: {
            id: true,
            program: true,
            status: true
          }
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      data: commission,
      message: 'Commission created successfully'
    })
  } catch (error) {
    console.error('Error creating commission:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create commission' },
      { status: 500 }
    )
  }
}