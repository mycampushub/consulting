import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { RBACService } from '@/lib/rbac'
import { requireAuth, requireAgency } from '@/lib/auth-middleware'

// Get user roles and permissions
export const GET = requireAgency(async (request: NextRequest, context) => {
  try {
    const { agency } = context
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Verify user belongs to the agency
    const user = await db.user.findFirst({
      where: {
        id: userId,
        agencyId: agency.id
      },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        },
        userPermissions: {
          include: {
            permission: true
          }
        },
        restrictions: {
          include: {
            restriction: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found in this agency' },
        { status: 404 }
      )
    }

    // Get all user permissions
    const allPermissions = await RBACService.getUserPermissions(userId)

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status
      },
      roles: user.userRoles,
      userPermissions: user.userPermissions,
      restrictions: user.restrictions,
      allPermissions
    })
  } catch (error) {
    console.error('Error fetching user roles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user roles' },
      { status: 500 }
    )
  }
})

// Assign role to user
export const POST = requireAgency(async (request: NextRequest, context) => {
  try {
    const { agency, user } = context
    const body = await request.json()

    const { userId, roleId, branchId, expiresAt } = body

    // Validate required fields
    if (!userId || !roleId) {
      return NextResponse.json(
        { error: 'User ID and Role ID are required' },
        { status: 400 }
      )
    }

    // Verify user belongs to the agency
    const targetUser = await db.user.findFirst({
      where: {
        id: userId,
        agencyId: agency.id
      }
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found in this agency' },
        { status: 404 }
      )
    }

    // Verify role belongs to the agency
    const role = await db.role.findFirst({
      where: {
        id: roleId,
        agencyId: agency.id
      }
    })

    if (!role) {
      return NextResponse.json(
        { error: 'Role not found in this agency' },
        { status: 404 }
      )
    }

    // Check if role is already assigned
    const existingAssignment = await db.userRoleAssignment.findFirst({
      where: {
        userId,
        roleId,
        agencyId: agency.id,
        branchId: branchId || null,
        isActive: true
      }
    })

    if (existingAssignment) {
      return NextResponse.json(
        { error: 'Role is already assigned to this user' },
        { status: 400 }
      )
    }

    const assignment = await RBACService.assignRoleToUser({
      userId,
      roleId,
      agencyId: agency.id,
      branchId,
      assignedBy: user.id,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    })

    // Log the action
    await RBACService.logAccess({
      userId: user.id,
      agencyId: agency.id,
      resource: 'user_roles',
      action: 'create',
      resourceId: assignment.id,
      result: 'ALLOWED',
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    return NextResponse.json({ assignment }, { status: 201 })
  } catch (error) {
    console.error('Error assigning role to user:', error)
    return NextResponse.json(
      { error: 'Failed to assign role to user' },
      { status: 500 }
    )
  }
})