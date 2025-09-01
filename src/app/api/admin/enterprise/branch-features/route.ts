import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const agencyId = searchParams.get('agencyId')
    const branchId = searchParams.get('branchId')
    const featureId = searchParams.get('featureId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (agencyId) where.agencyId = agencyId
    if (branchId) where.branchId = branchId
    if (featureId) where.featureId = featureId

    // Get branch features with pagination
    const [branchFeatures, total] = await Promise.all([
      db.featureAccess.findMany({
        where,
        include: {
          feature: {
            select: {
              id: true,
              name: true,
              description: true,
              slug: true,
              category: true,
              type: true,
              isToggleable: true
            }
          },
          agency: {
            select: {
              id: true,
              name: true,
              subdomain: true
            }
          },
          branch: {
            select: {
              id: true,
              name: true,
              code: true,
              type: true,
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
      db.featureAccess.count({ where })
    ])

    // Get summary statistics
    const summary = await Promise.all([
      // Total branch features
      db.featureAccess.count({ where }),
      
      // Enabled branch features
      db.featureAccess.count({
        where: {
          ...where,
          isEnabled: true
        }
      }),
      
      // Features by category
      db.featureAccess.groupBy({
        by: ['featureId'],
        _count: {
          featureId: true
        },
        where,
        having: {
          featureId: {
            _count: {
              gte: 1
            }
          }
        }
      })
    ])

    // Get feature details for categories
    const featureCategories = await Promise.all(
      summary[2].map(async (group) => {
        const feature = await db.subscriptionFeature.findUnique({
          where: { id: group.featureId }
        })
        return {
          category: feature?.category || 'Unknown',
          count: group._count.featureId
        }
      })
    )

    // Group categories
    const byCategory = featureCategories.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = 0
      }
      acc[item.category] += item.count
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      success: true,
      data: {
        branchFeatures,
        summary: {
          total: summary[0],
          enabled: summary[1],
          byCategory
        },
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching branch features:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch branch features' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      agencyId,
      branchId,
      featureId,
      isEnabled,
      accessLevel,
      config,
      limits,
      metadata
    } = body

    // Validate required fields
    if (!agencyId || !featureId) {
      return NextResponse.json(
        { success: false, error: 'Agency ID and Feature ID are required' },
        { status: 400 }
      )
    }

    // Check if agency exists
    const agency = await db.agency.findUnique({
      where: { id: agencyId }
    })

    if (!agency) {
      return NextResponse.json(
        { success: false, error: 'Agency not found' },
        { status: 404 }
      )
    }

    // Check if feature exists
    const feature = await db.subscriptionFeature.findUnique({
      where: { id: featureId }
    })

    if (!feature) {
      return NextResponse.json(
        { success: false, error: 'Feature not found' },
        { status: 404 }
      )
    }

    // If branchId is provided, check if branch exists and belongs to agency
    if (branchId) {
      const branch = await db.branch.findFirst({
        where: {
          id: branchId,
          agencyId
        }
      })

      if (!branch) {
        return NextResponse.json(
          { success: false, error: 'Branch not found or does not belong to agency' },
          { status: 404 }
        )
      }
    }

    // Create or update branch feature access
    const branchFeature = await db.featureAccess.upsert({
      where: {
        agencyId_featureId_branchId: {
          agencyId,
          featureId,
          branchId: branchId || null
        }
      },
      update: {
        isEnabled: isEnabled ?? true,
        accessLevel: accessLevel || 'ADMIN',
        config: config ? JSON.stringify(config) : null,
        limits: limits ? JSON.stringify(limits) : null,
        metadata: metadata ? JSON.stringify(metadata) : null
      },
      create: {
        agencyId,
        featureId,
        branchId: branchId || null,
        isEnabled: isEnabled ?? true,
        accessLevel: accessLevel || 'ADMIN',
        config: config ? JSON.stringify(config) : null,
        limits: limits ? JSON.stringify(limits) : null,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    })

    // Log the action
    await db.activityLog.create({
      data: {
        action: branchFeature.createdAt ? 'BRANCH_FEATURE_UPDATED' : 'BRANCH_FEATURE_CREATED',
        entityType: 'FEATURE_ACCESS',
        entityId: branchFeature.id,
        changes: JSON.stringify({
          agencyId,
          branchId,
          featureId,
          isEnabled,
          accessLevel,
          config,
          limits
        }),
        agencyId,
        userId: body.userId,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      success: true,
      data: branchFeature
    })
  } catch (error) {
    console.error('Error creating/updating branch feature:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create/update branch feature' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id,
      isEnabled,
      accessLevel,
      config,
      limits,
      metadata
    } = body

    // Check if branch feature exists
    const existingBranchFeature = await db.featureAccess.findUnique({
      where: { id }
    })

    if (!existingBranchFeature) {
      return NextResponse.json(
        { success: false, error: 'Branch feature not found' },
        { status: 404 }
      )
    }

    // Update branch feature
    const updatedBranchFeature = await db.featureAccess.update({
      where: { id },
      data: {
        isEnabled: isEnabled !== undefined ? isEnabled : existingBranchFeature.isEnabled,
        accessLevel: accessLevel || existingBranchFeature.accessLevel,
        config: config ? JSON.stringify(config) : existingBranchFeature.config,
        limits: limits ? JSON.stringify(limits) : existingBranchFeature.limits,
        metadata: metadata ? JSON.stringify(metadata) : existingBranchFeature.metadata
      }
    })

    // Log the action
    await db.activityLog.create({
      data: {
        action: 'BRANCH_FEATURE_UPDATED',
        entityType: 'FEATURE_ACCESS',
        entityId: id,
        changes: JSON.stringify({
          isEnabled,
          accessLevel,
          config,
          limits
        }),
        agencyId: existingBranchFeature.agencyId,
        userId: body.userId,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedBranchFeature
    })
  } catch (error) {
    console.error('Error updating branch feature:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update branch feature' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const userId = searchParams.get('userId')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Branch feature ID is required' },
        { status: 400 }
      )
    }

    // Check if branch feature exists
    const existingBranchFeature = await db.featureAccess.findUnique({
      where: { id }
    })

    if (!existingBranchFeature) {
      return NextResponse.json(
        { success: false, error: 'Branch feature not found' },
        { status: 404 }
      )
    }

    // Delete branch feature
    await db.featureAccess.delete({
      where: { id }
    })

    // Log the action
    await db.activityLog.create({
      data: {
        action: 'BRANCH_FEATURE_DELETED',
        entityType: 'FEATURE_ACCESS',
        entityId: id,
        changes: JSON.stringify({
          deletedBranchFeature: existingBranchFeature
        }),
        agencyId: existingBranchFeature.agencyId,
        userId: userId || 'system',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      success: true,
      data: { message: 'Branch feature deleted successfully' }
    })
  } catch (error) {
    console.error('Error deleting branch feature:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete branch feature' },
      { status: 500 }
    )
  }
}