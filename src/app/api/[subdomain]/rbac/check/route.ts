import { NextRequest, NextResponse } from 'next/server'
import { RBACService, type PermissionCheck } from '@/lib/rbac'
import { requireAuth, requireAgency } from '@/lib/auth-middleware'

// Check if current user has specific permissions
export const POST = requireAgency(async (request: NextRequest, context) => {
  try {
    const { user, agency } = context
    const body = await request.json()

    const { permissions }: { permissions: PermissionCheck[] } = body

    if (!permissions || !Array.isArray(permissions) || permissions.length === 0) {
      return NextResponse.json(
        { error: 'Permissions array is required' },
        { status: 400 }
      )
    }

    const results = await Promise.all(
      permissions.map(async (permission) => {
        const decision = await RBACService.checkPermission(user.id, permission, {
          userId: user.id,
          agencyId: agency.id,
          branchId: user.branchId,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        })

        return {
          permission,
          allowed: decision.allowed,
          reason: decision.reason,
          accessLevel: decision.accessLevel,
          policies: decision.policies,
          restrictions: decision.restrictions
        }
      })
    )

    // Log the permission check
    await RBACService.logAccess({
      userId: user.id,
      agencyId: agency.id,
      resource: 'rbac_check',
      action: 'read',
      result: 'ALLOWED',
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      context: { permissions, results }
    })

    return NextResponse.json({
      results,
      summary: {
        total: results.length,
        allowed: results.filter(r => r.allowed).length,
        denied: results.filter(r => !r.allowed).length
      }
    })
  } catch (error) {
    console.error('Error checking permissions:', error)
    return NextResponse.json(
      { error: 'Failed to check permissions' },
      { status: 500 }
    )
  }
})