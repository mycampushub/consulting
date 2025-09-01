import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { RBACService } from '@/lib/rbac'
import { requireAuth, requireAgency } from '@/lib/auth-middleware'

// Get all permissions for the agency
export const GET = requireAgency(async (request: NextRequest, context) => {
  try {
    const { agency } = context
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const resource = searchParams.get('resource')

    const where: any = {
      isActive: true
    }

    if (category) {
      where.category = category
    }

    if (resource) {
      where.resource = resource
    }

    const permissions = await db.permission.findMany({
      where,
      include: {
        rolePermissions: {
          where: {
            role: {
              agencyId: agency.id
            }
          },
          include: {
            role: true
          }
        },
        userPermissions: {
          where: {
            user: {
              agencyId: agency.id
            }
          },
          include: {
            user: true
          }
        }
      },
      orderBy: [
        { category: 'asc' },
        { resource: 'asc' },
        { action: 'asc' }
      ]
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

// Create a new permission (system-wide)
export const POST = requireAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context
    const body = await request.json()

    const { name, slug, description, category, resource, action, dependencies } = body

    // Validate required fields
    if (!name || !slug || !category || !resource || !action) {
      return NextResponse.json(
        { error: 'Name, slug, category, resource, and action are required' },
        { status: 400 }
      )
    }

    // Check if slug is unique
    const existingPermission = await db.permission.findUnique({
      where: { slug }
    })

    if (existingPermission) {
      return NextResponse.json(
        { error: 'Permission with this slug already exists' },
        { status: 400 }
      )
    }

    const permission = await db.permission.create({
      data: {
        name,
        slug,
        description,
        category,
        resource,
        action,
        dependencies: dependencies ? JSON.stringify(dependencies) : null
      }
    })

    // Log the action
    await RBACService.logAccess({
      userId: user.id,
      resource: 'permissions',
      action: 'create',
      resourceId: permission.id,
      result: 'ALLOWED',
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    return NextResponse.json({ permission }, { status: 201 })
  } catch (error) {
    console.error('Error creating permission:', error)
    return NextResponse.json(
      { error: 'Failed to create permission' },
      { status: 500 }
    )
  }
})