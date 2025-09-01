import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const search = searchParams.get('search')
    
    const offset = (page - 1) * limit
    
    // Build where clause
    const where: any = {}
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (type && type !== 'all') {
      where.invoiceType = type
    }
    
    if (search) {
      where.OR = [
        {
          invoiceNumber: {
            contains: search,
            mode: 'insensitive'
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
        },
        {
          university: {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        }
      ]
    }
    
    // Get invoices with related data
    const [invoices, totalCount] = await Promise.all([
      db.invoice.findMany({
        where,
        include: {
          agency: {
            select: {
              id: true,
              name: true,
              subdomain: true
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
          university: {
            select: {
              id: true,
              name: true,
              country: true,
              city: true
            }
          },
          items: true,
          payments: {
            select: {
              id: true,
              amount: true,
              status: true,
              paymentDate: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: limit
      }),
      db.invoice.count({ where })
    ])
    
    return NextResponse.json({
      success: true,
      data: invoices,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      agencyId,
      invoiceType,
      studentId,
      universityId,
      items,
      issueDate,
      dueDate,
      notes,
      terms
    } = body
    
    // Calculate totals
    let subtotal = 0
    let totalTax = 0
    let totalDiscount = 0
    
    const invoiceItems = items.map((item: any) => {
      const itemTotal = item.quantity * item.unitPrice
      const itemDiscount = (itemTotal * item.discountRate) / 100
      const itemTax = ((itemTotal - itemDiscount) * item.taxRate) / 100
      const itemFinalTotal = itemTotal - itemDiscount + itemTax
      
      subtotal += itemTotal
      totalDiscount += itemDiscount
      totalTax += itemTax
      
      return {
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountRate: item.discountRate,
        discountAmount: itemDiscount,
        taxRate: item.taxRate,
        taxAmount: itemTax,
        totalAmount: itemFinalTotal,
        category: item.category,
        serviceType: item.serviceType,
        notes: item.notes
      }
    })
    
    const totalAmount = subtotal - totalDiscount + totalTax
    
    // Generate invoice number
    const invoiceCount = await db.invoice.count({
      where: {
        agencyId,
        createdAt: {
          gte: new Date(new Date().getFullYear(), 0, 1)
        }
      }
    })
    
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(3, '0')}`
    
    // Create invoice with items
    const invoice = await db.invoice.create({
      data: {
        agencyId,
        invoiceNumber,
        invoiceType,
        studentId,
        universityId,
        subtotal,
        taxRate: (totalTax / (subtotal - totalDiscount)) * 100,
        taxAmount: totalTax,
        discountAmount: totalDiscount,
        totalAmount,
        currency: 'USD',
        status: 'DRAFT',
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        notes,
        terms,
        items: {
          create: invoiceItems
        }
      },
      include: {
        agency: {
          select: {
            id: true,
            name: true,
            subdomain: true
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
        university: {
          select: {
            id: true,
            name: true,
            country: true,
            city: true
          }
        },
        items: true
      }
    })
    
    return NextResponse.json({
      success: true,
      data: invoice,
      message: 'Invoice created successfully'
    })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create invoice' },
      { status: 500 }
    )
  }
}