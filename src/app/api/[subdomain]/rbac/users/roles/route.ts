import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requireAgency } from '@/lib/auth-middleware'
import { z } from 'zod'

const userRoleSchema = z.object({
  userId: z.string(),
  roleId: z.string(),
  assignedBy: z.string().optional()
})

// Get user role assignments for the agency
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

    const userRoles = await db.userRoleAssignment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        role: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            level: true,
            scope: true
          }
        },
        assignedByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { assignedAt: 'desc' }
    })

    return NextResponse.json({ userRoles })
  } catch (error) {
    console.error('Error fetching user role assignments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user role assignments' },
      { status: 500 }
    )
  }
})

// Assign a role to a user
export const POST = requireAgency(async (request: NextRequest, context) => {
  try {
    const { agency, user } = context
    const body = await request.json()

    const validatedData = userRoleSchema.parse(body)

    // Check if user exists and belongs to the agency
    const targetUser = await db.user.findFirst({
      where: {
        id: validatedData.userId,
        agencyId: agency.id
      }
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found or does not belong to this agency' },
        { status: 404 }
      )
    }

    // Check if role exists and belongs to the agency
    const role = await db.role.findFirst({
      where: {
        id: validatedData.roleId,
        agencyId: agency.id
      }
    })

    if (!role) {
      return NextResponse.json(
        { error: 'Role not found or does not belong to this agency' },
        { status: 404 }
      )
    }

    // Check if user already has this role
    const existingAssignment = await db.userRoleAssignment.findFirst({
      where: {
        userId: validatedData.userId,
        roleId: validatedData.roleId,
        revokedAt: null
      }
    })

    if (existingAssignment) {
      return NextResponse.json(
        { error: 'User already has this role' },
        { status: 400 }
      )
    }

    // Assign the role
    const userRole = await db.userRoleAssignment.create({
      data: {
        userId: validatedData.userId,
        roleId: validatedData.roleId,
        assignedBy: validatedData.assignedBy || user.id,
        assignedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        role: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true
          }
        }
      }
    })

    // Log the assignment
    await db.activityLog.create({
      data: {
        agencyId: agency.id,
        userId: user.id,
        action: 'ROLE_ASSIGNED',
        entityType: 'UserRoleAssignment',
        entityId: userRole.id,
        changes: JSON.stringify({
          userId: validatedData.userId,
          roleId: validatedData.roleId,
          assignedBy: user.id
        })
      }
    })

    return NextResponse.json(userRole, { status: 201 })
  } catch (error) {
    console.error('Error assigning role to user:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to assign role to user' },
      { status: 500 }
    )
  }
})

// Revoke a role from a user
export const DELETE = requireAgency(async (request: NextRequest, context) => {
  try {
    const { agency, user } = context
    const { searchParams } = new URL(request.url)
    const assignmentId = searchParams.get('assignmentId')

    if (!assignmentId) {
      return NextResponse.json(
        { error: 'Assignment ID is required' },
        { status: 400 }
      )
    }

    // Find the assignment
    const assignment = await db.userRoleAssignment.findFirst({
      where: {
        id: assignmentId,
        agencyId: agency.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        role: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    if (!assignment) {
      return NextResponse.json(
        { error: 'Role assignment not found' },
        { status: 404 }
      )
    }

    // Revoke the assignment (soft delete)
    const revokedAssignment = await db.userRoleAssignment.update({
      where: { id: assignmentId },
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
        action: 'ROLE_REVOKED',
        entityType: 'UserRoleAssignment',
        entityId: assignmentId,
        changes: JSON.stringify({
          userId: assignment.userId,
          roleId: assignment.roleId,
          revokedBy: user.id
        })
      }
    })

    return NextResponse.json({
      message: 'Role revoked successfully',
      assignment: revokedAssignment
    })
  } catch (error) {
    console.error('Error revoking role from user:', error)
    return NextResponse.json(
      { error: 'Failed to revoke role from user' },
      { status: 500 }
    )
  }
})