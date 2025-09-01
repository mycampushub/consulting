import { db } from './db'
import type { 
  User, 
  Role, 
  Permission, 
  UserRoleAssignment,
  UserPermission,
  RolePermission,
  AccessPolicy,
  ResourceRestriction,
  UserRestriction,
  RoleRestriction
} from '@prisma/client'

export interface RBACContext {
  userId?: string
  agencyId?: string
  branchId?: string
  resourceId?: string
  action?: string
  resource?: string
  ipAddress?: string
  userAgent?: string
}

export interface PermissionCheck {
  resource: string
  action: string
  resourceId?: string
  conditions?: Record<string, any>
}

export interface AccessDecision {
  allowed: boolean
  reason?: string
  policies?: string[]
  restrictions?: string[]
  accessLevel?: string
}

export class RBACService {
  /**
   * Check if a user has permission to perform an action
   */
  static async checkPermission(
    userId: string,
    permission: PermissionCheck,
    context?: Partial<RBACContext>
  ): Promise<AccessDecision> {
    try {
      // Get user with all related data
      const user = await db.user.findUnique({
        where: { id: userId },
        include: {
          agency: true,
          branch: true,
          userRoles: {
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: {
                      permission: true
                    }
                  },
                  roleRestrictions: {
                    include: {
                      restriction: true
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
        return { allowed: false, reason: 'User not found' }
      }

      if (user.status !== 'ACTIVE') {
        return { allowed: false, reason: 'User account is not active' }
      }

      const fullContext: RBACContext = {
        userId,
        agencyId: user.agencyId || context?.agencyId,
        branchId: user.branchId || context?.branchId,
        resource: permission.resource,
        action: permission.action,
        resourceId: permission.resourceId,
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent
      }

      // Check system-level restrictions first
      const systemRestriction = await this.checkSystemRestrictions(fullContext)
      if (!systemRestriction.allowed) {
        return systemRestriction
      }

      // Check access policies
      const policyDecision = await this.checkAccessPolicies(fullContext)
      if (policyDecision.allowed === false) {
        return policyDecision
      }

      // Check user-specific permissions
      const userPermissionDecision = await this.checkUserPermissions(user, permission, fullContext)
      if (userPermissionDecision.allowed) {
        return userPermissionDecision
      }

      // Check role-based permissions
      const rolePermissionDecision = await this.checkRolePermissions(user, permission, fullContext)
      if (rolePermissionDecision.allowed) {
        return rolePermissionDecision
      }

      // Check resource restrictions
      const restrictionDecision = await this.checkResourceRestrictions(user, permission, fullContext)
      if (!restrictionDecision.allowed) {
        return restrictionDecision
      }

      return { allowed: false, reason: 'Insufficient permissions' }
    } catch (error) {
      console.error('RBAC checkPermission error:', error)
      return { allowed: false, reason: 'Internal server error' }
    }
  }

  /**
   * Check system-level restrictions
   */
  private static async checkSystemRestrictions(context: RBACContext): Promise<AccessDecision> {
    // Check IP-based restrictions
    if (context.ipAddress) {
      const ipRestriction = await db.resourceRestriction.findFirst({
        where: {
          type: 'IP_BASED',
          scope: 'GLOBAL',
          isActive: true,
          OR: [
            {
              conditions: {
                path: '$.allowed_ips',
                array_contains: context.ipAddress
              }
            },
            {
              conditions: {
                path: '$.blocked_ips',
                array_contains: context.ipAddress
              }
            }
          ]
        }
      })

      if (ipRestriction) {
        const conditions = JSON.parse(ipRestriction.conditions || '{}')
        if (conditions.blocked_ips?.includes(context.ipAddress)) {
          return { allowed: false, reason: 'IP address blocked' }
        }
        if (conditions.allowed_ips && !conditions.allowed_ips.includes(context.ipAddress)) {
          return { allowed: false, reason: 'IP address not allowed' }
        }
      }
    }

    return { allowed: true }
  }

  /**
   * Check access policies
   */
  private static async checkAccessPolicies(context: RBACContext): Promise<AccessDecision> {
    if (!context.agencyId || !context.resource || !context.action) {
      return { allowed: true }
    }

    const policies = await db.accessPolicy.findMany({
      where: {
        agencyId: context.agencyId,
        resource: context.resource,
        action: context.action,
        isActive: true,
        OR: [
          {
            targetType: 'USER',
            targetId: context.userId
          },
          {
            targetType: 'ROLE',
            targetId: {
              in: await this.getUserRoleIds(context.userId!)
            }
          },
          {
            targetType: 'BRANCH',
            targetId: context.branchId
          }
        ]
      },
      orderBy: {
        priority: 'desc'
      }
    })

    for (const policy of policies) {
      const conditions = JSON.parse(policy.conditions || '{}')
      
      // Check if conditions are met
      if (await this.evaluateConditions(conditions, context)) {
        return {
          allowed: policy.effect === 'ALLOW',
          reason: `Policy ${policy.name} ${policy.effect.toLowerCase()}d access`,
          policies: [policy.name]
        }
      }
    }

    return { allowed: true }
  }

  /**
   * Check user-specific permissions
   */
  private static async checkUserPermissions(
    user: any,
    permission: PermissionCheck,
    context: RBACContext
  ): Promise<AccessDecision> {
    const userPermission = user.userPermissions.find((up: any) => {
      const perm = up.permission
      return perm.resource === permission.resource && 
             perm.action === permission.action &&
             up.isActive &&
             (!up.expiresAt || up.expiresAt > new Date())
    })

    if (userPermission) {
      // Check conditions
      const conditions = JSON.parse(userPermission.conditions || '{}')
      if (await this.evaluateConditions(conditions, context)) {
        return {
          allowed: true,
          accessLevel: userPermission.accessLevel,
          reason: 'User-specific permission granted'
        }
      }
    }

    return { allowed: false }
  }

  /**
   * Check role-based permissions
   */
  private static async checkRolePermissions(
    user: any,
    permission: PermissionCheck,
    context: RBACContext
  ): Promise<AccessDecision> {
    for (const userRole of user.userRoles) {
      const role = userRole.role
      if (!role.isActive) continue

      // Check role scope
      if (role.scope === 'BRANCH' && role.branchId !== context.branchId) continue
      if (role.scope === 'AGENCY' && role.agencyId !== context.agencyId) continue

      const rolePermission = role.rolePermissions.find((rp: any) => {
        const perm = rp.permission
        return perm.resource === permission.resource && 
               perm.action === permission.action &&
               rp.isActive
      })

      if (rolePermission) {
        // Check conditions
        const conditions = JSON.parse(rolePermission.conditions || '{}')
        if (await this.evaluateConditions(conditions, context)) {
          return {
            allowed: true,
            accessLevel: rolePermission.accessLevel,
            reason: `Role '${role.name}' permission granted`
          }
        }
      }
    }

    return { allowed: false }
  }

  /**
   * Check resource restrictions
   */
  private static async checkResourceRestrictions(
    user: any,
    permission: PermissionCheck,
    context: RBACContext
  ): Promise<AccessDecision> {
    const restrictions: string[] = []

    // Check user-specific restrictions
    for (const userRestriction of user.restrictions) {
      const restriction = userRestriction.restriction
      if (!restriction.isActive) continue

      if (restriction.resource === permission.resource) {
        const conditions = JSON.parse(userRestriction.conditions || '{}')
        if (await this.evaluateConditions(conditions, context)) {
          restrictions.push(restriction.name)
        }
      }
    }

    // Check role-based restrictions
    for (const userRole of user.userRoles) {
      const role = userRole.role
      for (const roleRestriction of role.roleRestrictions) {
        const restriction = roleRestriction.restriction
        if (!restriction.isActive) continue

        if (restriction.resource === permission.resource) {
          const conditions = JSON.parse(roleRestriction.conditions || '{}')
          if (await this.evaluateConditions(conditions, context)) {
            restrictions.push(restriction.name)
          }
        }
      }
    }

    if (restrictions.length > 0) {
      return {
        allowed: false,
        reason: 'Access restricted by policy',
        restrictions
      }
    }

    return { allowed: true }
  }

  /**
   * Evaluate conditions against context
   */
  private static async evaluateConditions(
    conditions: Record<string, any>,
    context: RBACContext
  ): Promise<boolean> {
    // Simple condition evaluation - can be extended with more complex logic
    for (const [key, value] of Object.entries(conditions)) {
      switch (key) {
        case 'branch_id':
          if (context.branchId !== value) return false
          break
        case 'agency_id':
          if (context.agencyId !== value) return false
          break
        case 'user_id':
          if (context.userId !== value) return false
          break
        case 'resource_id':
          if (context.resourceId !== value) return false
          break
        case 'time_range':
          const now = new Date()
          const start = new Date(value.start)
          const end = new Date(value.end)
          if (now < start || now > end) return false
          break
        // Add more condition types as needed
      }
    }
    return true
  }

  /**
   * Get user role IDs
   */
  private static async getUserRoleIds(userId: string): Promise<string[]> {
    const userRoles = await db.userRoleAssignment.findMany({
      where: { userId, isActive: true },
      select: { roleId: true }
    })
    return userRoles.map(ur => ur.roleId)
  }

  /**
   * Get user permissions
   */
  static async getUserPermissions(userId: string): Promise<Permission[]> {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        userPermissions: {
          include: { permission: true },
          where: { isActive: true }
        },
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: { permission: true },
                  where: { isActive: true }
                }
              }
            }
          },
          where: { isActive: true }
        }
      }
    })

    if (!user) return []

    const permissions = new Set<Permission>()

    // Add user-specific permissions
    user.userPermissions.forEach(up => {
      if (up.permission && (!up.expiresAt || up.expiresAt > new Date())) {
        permissions.add(up.permission)
      }
    })

    // Add role-based permissions
    user.userRoles.forEach(ur => {
      ur.role.rolePermissions.forEach(rp => {
        if (rp.permission) {
          permissions.add(rp.permission)
        }
      })
    })

    return Array.from(permissions)
  }

  /**
   * Create a new role
   */
  static async createRole(data: {
    agencyId: string
    name: string
    description?: string
    slug: string
    level?: number
    scope?: string
    branchId?: string
    parentId?: string
  }): Promise<Role> {
    return await db.role.create({
      data: {
        agencyId: data.agencyId,
        name: data.name,
        description: data.description,
        slug: data.slug,
        level: data.level || 0,
        scope: data.scope || 'AGENCY',
        branchId: data.branchId,
        parentId: data.parentId
      }
    })
  }

  /**
   * Assign role to user
   */
  static async assignRoleToUser(data: {
    userId: string
    roleId: string
    agencyId: string
    branchId?: string
    assignedBy?: string
    expiresAt?: Date
  }): Promise<UserRoleAssignment> {
    return await db.userRoleAssignment.create({
      data: {
        userId: data.userId,
        roleId: data.roleId,
        agencyId: data.agencyId,
        branchId: data.branchId,
        assignedBy: data.assignedBy,
        expiresAt: data.expiresAt
      }
    })
  }

  /**
   * Grant permission to role
   */
  static async grantPermissionToRole(data: {
    roleId: string
    permissionId: string
    agencyId: string
    branchId?: string
    accessLevel?: string
    conditions?: Record<string, any>
  }): Promise<RolePermission> {
    return await db.rolePermission.create({
      data: {
        roleId: data.roleId,
        permissionId: data.permissionId,
        agencyId: data.agencyId,
        branchId: data.branchId,
        accessLevel: data.accessLevel || 'FULL',
        conditions: data.conditions ? JSON.stringify(data.conditions) : null
      }
    })
  }

  /**
   * Log access attempt
   */
  static async logAccess(data: {
    userId?: string
    agencyId?: string
    resource: string
    action: string
    resourceId?: string
    result: 'ALLOWED' | 'DENIED' | 'RESTRICTED' | 'EXPIRED' | 'PENDING_APPROVAL'
    reason?: string
    ipAddress?: string
    userAgent?: string
    duration?: number
    context?: Record<string, any>
  }): Promise<void> {
    await db.accessAuditLog.create({
      data: {
        userId: data.userId,
        agencyId: data.agencyId,
        resource: data.resource,
        action: data.action,
        resourceId: data.resourceId,
        result: data.result,
        reason: data.reason,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        duration: data.duration,
        context: data.context ? JSON.stringify(data.context) : null
      }
    })
  }
}