import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requireAgency } from '@/lib/auth-middleware'
import { z } from 'zod'

const permissionSchema = z.object({
  name: z.string().min(1, 'Permission name is required'),
  description: z.string().optional(),
  resource: z.string().min(1, 'Resource is required'),
  action: z.string().min(1, 'Action is required'),
  scope: z.enum(['AGENCY', 'BRANCH', 'TEAM']).default('AGENCY')
})

// Get all permissions for the agency
export const GET = requireAgency(async (request: NextRequest, context) => {
  try {
    const { agency } = context
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    const where: any = {
      agencyId: agency.id
    }

    if (userId) {
      where.userId = userId
    }

    const permissions = await db.userPermission.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        permission: {
          select: {
            id: true,
            name: true,
            description: true,
            resource: true,
            action: true
          }
        }
      },
      orderBy: { grantedAt: 'desc' }
    })

    return NextResponse.json({ permissions })
  } catch (error) {
    console.error('Error fetching permissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch permissions' },
      { status: 500 }
    )
  }
})

// Grant a permission to a user
export const POST = requireAgency(async (request: NextRequest, context) => {
  try {
    const { agency, user } = context
    const body = await request.json()

    const { userId, permissionId, grantedBy } = body

    if (!userId || !permissionId) {
      return NextResponse.json(
        { error: 'User ID and Permission ID are required' },
        { status: 400 }
      )
    }

    // Check if user exists and belongs to the agency
    const targetUser = await db.user.findFirst({
      where: {
        id: userId,
        agencyId: agency.id
      }
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found or does not belong to this agency' },
        { status: 404 }
      )
    }

    // Check if permission exists
    const permission = await db.permission.findFirst({
      where: {
        id: permissionId
      }
    })

    if (!permission) {
      return NextResponse.json(
        { error: 'Permission not found' },
        { status: 404 }
      )
    }

    // Check if user already has this permission
    const existingPermission = await db.userPermission.findFirst({
      where: {
        userId,
        permissionId,
        revokedAt: null
      }
    })

    if (existingPermission) {
      return NextResponse.json(
        { error: 'User already has this permission' },
        { status: 400 }
      )
    }

    // Grant the permission
    const userPermission = await db.userPermission.create({
      data: {
        userId,
        permissionId,
        grantedBy: grantedBy || user.id,
        grantedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        permission: {
          select: {
            id: true,
            name: true,
            description: true,
            resource: true,
            action: true
          }
        }
      }
    })

    // Log the permission grant
    await db.activityLog.create({
      data: {
        agencyId: agency.id,
        userId: user.id,
        action: 'PERMISSION_GRANTED',
        entityType: 'UserPermission',
        entityId: userPermission.id,
        changes: JSON.stringify({
          userId,
          permissionId,
          grantedBy: user.id
        })
      }
    })

    return NextResponse.json(userPermission, { status: 201 })
  } catch (error) {
    console.error('Error granting permission:', error)
    return NextResponse.json(
      { error: 'Failed to grant permission' },
      { status: 500 }
    )
  }
})

// Revoke a permission from a user
export const DELETE = requireAgency(async (request: NextRequest, context) => {
  try {
    const { agency, user } = context
    const { searchParams } = new URL(request.url)
    const permissionId = searchParams.get('permissionId')

    if (!permissionId) {
      return NextResponse.json(
        { error: 'Permission ID is required' },
        { status: 400 }
      )
    }

    // Find the permission
    const permission = await db.userPermission.findFirst({
      where: {
        id: permissionId,
        agencyId: agency.id
      }
    })

    if (!permission) {
      return NextResponse.json(
        { error: 'Permission not found' },
        { status: 404 }
      )
    }

    // Revoke the permission (soft delete)
    const revokedPermission = await db.userPermission.update({
      where: { id: permissionId },
      data: {
        revokedAt: new Date(),
        revokedBy: user.id
      }
    })

    // Log the revocation
    await db.activityLog.create({
      data: {
        agencyId: agency.id,
        userId: user.id,
        action: 'PERMISSION_REVOKED',
        entityType: 'UserPermission',
        entityId: permissionId,
        changes: JSON.stringify({
          userId: permission.userId,
          permissionId: permission.permissionId,
          revokedBy: user.id
        })
      }
    })

    return NextResponse.json({
      message: 'Permission revoked successfully',
      permission: revokedPermission
    })
  } catch (error) {
    console.error('Error revoking permission:', error)
    return NextResponse.json(
      { error: 'Failed to revoke permission' },
      { status: 500 }
    )
  }
})