import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Build where clause
    const where: any = {
      isVisible: true
    }
    
    if (category && category !== 'ALL') {
      where.category = category
    }

    // Get features with pagination
    const [features, total] = await Promise.all([
      db.subscriptionFeature.findMany({
        where,
        include: {
          planFeatures: {
            include: {
              plan: true
            }
          },
          featureAccess: {
            include: {
              agency: true,
              branch: true
            },
            take: 5
          }
        },
        orderBy: {
          sortOrder: 'asc'
        },
        skip: offset,
        take: limit
      }),
      db.subscriptionFeature.count({ where })
    ])

    // Get feature categories
    const categories = await db.subscriptionFeature.groupBy({
      by: ['category'],
      _count: {
        category: true
      },
      where: {
        isVisible: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        features,
        categories,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching enterprise features:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch enterprise features' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      slug,
      category,
      type,
      config,
      defaultValue,
      isToggleable,
      dependencies,
      metadata
    } = body

    // Validate required fields
    if (!name || !slug || !category || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingFeature = await db.subscriptionFeature.findUnique({
      where: { slug }
    })

    if (existingFeature) {
      return NextResponse.json(
        { success: false, error: 'Feature with this slug already exists' },
        { status: 400 }
      )
    }

    // Create the feature
    const feature = await db.subscriptionFeature.create({
      data: {
        name,
        description,
        slug,
        category,
        type,
        config: config ? JSON.stringify(config) : null,
        defaultValue: defaultValue ? JSON.stringify(defaultValue) : null,
        isToggleable: isToggleable ?? true,
        dependencies: dependencies ? JSON.stringify(dependencies) : null,
        metadata: metadata ? JSON.stringify(metadata) : null,
        isVisible: true
      }
    })

    return NextResponse.json({
      success: true,
      data: feature
    })
  } catch (error) {
    console.error('Error creating enterprise feature:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create enterprise feature' },
      { status: 500 }
    )
  }
}