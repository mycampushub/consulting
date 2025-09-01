import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { RBACService } from '@/lib/rbac'
import { requireAuth, requireAgency } from '@/lib/auth-middleware'

// Get all roles for the agency
export const GET = requireAgency(async (request: NextRequest, context) => {
  try {
    const { agency } = context
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get('branchId')

    const where: any = {
      agencyId: agency.id,
      isActive: true
    }

    if (branchId) {
      where.branchId = branchId
    }

    const roles = await db.role.findMany({
      where,
      include: {
        userRoles: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        rolePermissions: {
          include: {
            permission: true
          }
        },
        roleRestrictions: {
          include: {
            restriction: true
          }
        },
        parent: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: [
        { level: 'desc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json({ roles })
  } catch (error) {
    console.error('Error fetching roles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    )
  }
})

// Create a new role
export const POST = requireAgency(async (request: NextRequest, context) => {
  try {
    const { agency, user } = context
    const body = await request.json()

    const { name, description, slug, level, scope, branchId, parentId } = body

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    // Check if slug is unique within the agency
    const existingRole = await db.role.findFirst({
      where: {
        agencyId: agency.id,
        slug,
        branchId: branchId || null
      }
    })

    if (existingRole) {
      return NextResponse.json(
        { error: 'Role with this slug already exists' },
        { status: 400 }
      )
    }

    // Validate parent role if provided
    if (parentId) {
      const parentRole = await db.role.findFirst({
        where: {
          id: parentId,
          agencyId: agency.id
        }
      })

      if (!parentRole) {
        return NextResponse.json(
          { error: 'Parent role not found' },
          { status: 400 }
        )
      }
    }

    const role = await RBACService.createRole({
      agencyId: agency.id,
      name,
      description,
      slug,
      level: level || 0,
      scope: scope || 'AGENCY',
      branchId,
      parentId
    })

    // Log the action
    await RBACService.logAccess({
      userId: user.id,
      agencyId: agency.id,
      resource: 'roles',
      action: 'create',
      resourceId: role.id,
      result: 'ALLOWED',
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    return NextResponse.json({ role }, { status: 201 })
  } catch (error) {
    console.error('Error creating role:', error)
    return NextResponse.json(
      { error: 'Failed to create role' },
      { status: 500 }
    )
  }
})