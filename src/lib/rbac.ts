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
   * Check role-based permissions with hierarchy support
   */
  private static async checkRolePermissions(
    user: any,
    permission: PermissionCheck,
    context: RBACContext
  ): Promise<AccessDecision> {
    // Get all user roles including inherited ones
    const userRoles = await this.getUserRolesWithHierarchy(user.id)
    
    for (const userRole of userRoles) {
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
   * Get user roles with hierarchy support (includes parent roles)
   */
  private static async getUserRolesWithHierarchy(userId: string): Promise<any[]> {
    const userRoles = await db.userRoleAssignment.findMany({
      where: { 
        userId, 
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
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
            },
            parent: true, // Include parent role for hierarchy
            children: true // Include child roles for hierarchy
          }
        }
      }
    })

    // Add inherited roles from parent roles
    const allRoles = [...userRoles]
    
    for (const userRole of userRoles) {
      if (userRole.role.parent) {
        const parentRoles = await this.getParentRoles(userRole.role.parentId, [])
        allRoles.push(...parentRoles.map(parentRole => ({
          ...userRole,
          role: parentRole,
          isInherited: true
        })))
      }
    }

    return allRoles
  }

  /**
   * Get all parent roles recursively
   */
  private static async getParentRoles(roleId: string, accumulated: any[]): Promise<any[]> {
    const role = await db.role.findUnique({
      where: { id: roleId },
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
        },
        parent: true
      }
    })

    if (!role) return accumulated

    accumulated.push(role)

    if (role.parent) {
      return await this.getParentRoles(role.parentId, accumulated)
    }

    return accumulated
  }

  /**
   * Check if a role has permission to access a specific resource
   */
  static async checkRolePermission(
    roleId: string,
    permission: PermissionCheck,
    context?: Partial<RBACContext>
  ): Promise<AccessDecision> {
    try {
      const role = await db.role.findUnique({
        where: { id: roleId },
        include: {
          rolePermissions: {
            include: {
              permission: true
            }
          },
          parent: true
        }
      })

      if (!role || !role.isActive) {
        return { allowed: false, reason: 'Role not found or inactive' }
      }

      // Check direct permissions
      const rolePermission = role.rolePermissions.find((rp: any) => {
        const perm = rp.permission
        return perm.resource === permission.resource && 
               perm.action === permission.action &&
               rp.isActive
      })

      if (rolePermission) {
        const conditions = JSON.parse(rolePermission.conditions || '{}')
        if (await this.evaluateConditions(conditions, { ...context, roleId })) {
          return {
            allowed: true,
            accessLevel: rolePermission.accessLevel,
            reason: `Role '${role.name}' permission granted`
          }
        }
      }

      // Check inherited permissions from parent roles
      if (role.parent) {
        const parentDecision = await this.checkRolePermission(role.parentId, permission, context)
        if (parentDecision.allowed) {
          return {
            allowed: true,
            accessLevel: parentDecision.accessLevel,
            reason: `Inherited from parent role: ${parentDecision.reason}`
          }
        }
      }

      return { allowed: false, reason: 'Permission not found in role or parent roles' }
    } catch (error) {
      console.error('RBAC checkRolePermission error:', error)
      return { allowed: false, reason: 'Internal server error' }
    }
  }

  /**
   * Create a role with hierarchy support
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
    permissions?: Array<{
      permissionId: string
      accessLevel?: string
      conditions?: Record<string, any>
    }>
  }): Promise<Role> {
    const role = await db.role.create({
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

    // Add permissions if provided
    if (data.permissions && data.permissions.length > 0) {
      await Promise.all(data.permissions.map(perm =>
        this.grantPermissionToRole({
          roleId: role.id,
          permissionId: perm.permissionId,
          agencyId: data.agencyId,
          branchId: data.branchId,
          accessLevel: perm.accessLevel || 'FULL',
          conditions: perm.conditions
        })
      ))
    }

    return role
  }

  /**
   * Get role hierarchy tree
   */
  static async getRoleHierarchy(agencyId: string, branchId?: string): Promise<any[]> {
    const roles = await db.role.findMany({
      where: {
        agencyId,
        ...(branchId && { branchId }),
        isActive: true
      },
      include: {
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
        },
        rolePermissions: {
          include: {
            permission: {
              select: {
                id: true,
                name: true,
                slug: true,
                resource: true,
                action: true
              }
            }
          }
        },
        _count: {
          select: {
            userRoles: true
          }
        }
      },
      orderBy: { level: 'desc' }
    })

    // Build hierarchy tree
    const roleMap = new Map(roles.map(role => [role.id, { ...role, children: [] }]))
    const rootRoles: any[] = []

    roles.forEach(role => {
      if (role.parentId) {
        const parent = roleMap.get(role.parentId)
        if (parent) {
          parent.children.push(roleMap.get(role.id))
        }
      } else {
        rootRoles.push(roleMap.get(role.id))
      }
    })

    return rootRoles
  }

  /**
   * Check if user has permission to manage a role
   */
  static async canManageRole(userId: string, roleId: string): Promise<boolean> {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    })

    if (!user) return false

    // Super admins can manage any role
    if (user.role === 'SUPER_ADMIN') return true

    // Agency admins can manage roles in their agency
    const targetRole = await db.role.findUnique({
      where: { id: roleId },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    })

    if (!targetRole) return false

    // Check if user is agency admin and role belongs to same agency
    if (user.role === 'AGENCY_ADMIN' && user.agencyId === targetRole.agencyId) {
      return true
    }

    // Check if user has explicit role management permission
    const hasPermission = await this.checkPermission(userId, {
      resource: 'roles',
      action: 'manage'
    }, { agencyId: user.agencyId })

    return hasPermission.allowed
  }

  /**
   * Enhanced branch-based scoping check
   */
  static async checkBranchScope(
    userId: string,
    targetBranchId?: string,
    scope: 'AGENCY' | 'BRANCH' | 'OWN' = 'AGENCY'
  ): Promise<{ allowed: boolean; reason?: string; accessibleBranches?: string[] }> {
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        include: {
          agency: true,
          branch: true,
          managedBranches: true,
          userRoles: {
            include: {
              role: true
            }
          }
        }
      })

      if (!user) {
        return { allowed: false, reason: 'User not found' }
      }

      // Super admins have access to all branches
      if (user.role === 'SUPER_ADMIN') {
        return { allowed: true, reason: 'Super admin access' }
      }

      // Agency admins have access to all branches in their agency
      if (user.role === 'AGENCY_ADMIN' && scope === 'AGENCY') {
        const agencyBranches = await db.branch.findMany({
          where: { agencyId: user.agencyId },
          select: { id: true }
        })
        return { 
          allowed: true, 
          reason: 'Agency admin access',
          accessibleBranches: agencyBranches.map(b => b.id)
        }
      }

      // For branch-level access, check if user has access to specific branch
      if (scope === 'BRANCH' && targetBranchId) {
        // Check if user is assigned to the target branch
        if (user.branchId === targetBranchId) {
          return { allowed: true, reason: 'User branch access' }
        }

        // Check if user manages the target branch
        const managesBranch = user.managedBranches.some(branch => branch.id === targetBranchId)
        if (managesBranch) {
          return { allowed: true, reason: 'Branch manager access' }
        }

        // Check if user has roles that grant access to the branch
        const hasBranchRole = user.userRoles.some(userRole => {
          const role = userRole.role
          return role.scope === 'BRANCH' && role.branchId === targetBranchId
        })

        if (hasBranchRole) {
          return { allowed: true, reason: 'Role-based branch access' }
        }

        return { allowed: false, reason: 'No access to specified branch' }
      }

      // For own resources only
      if (scope === 'OWN') {
        if (!user.branchId) {
          return { allowed: false, reason: 'User not assigned to any branch' }
        }
        return { 
          allowed: true, 
          reason: 'Own branch access',
          accessibleBranches: [user.branchId]
        }
      }

      // Default: return user's own branch
      const accessibleBranches = user.branchId ? [user.branchId] : []
      return { 
        allowed: accessibleBranches.length > 0,
        reason: accessibleBranches.length > 0 ? 'Branch access granted' : 'No branch access',
        accessibleBranches
      }
    } catch (error) {
      console.error('RBAC checkBranchScope error:', error)
      return { allowed: false, reason: 'Internal server error' }
    }
  }

  /**
   * Get accessible branches for a user
   */
  static async getAccessibleBranches(userId: string): Promise<string[]> {
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        include: {
          agency: true,
          branch: true,
          managedBranches: true,
          userRoles: {
            include: {
              role: true
            },
            where: { isActive: true }
          }
        }
      })

      if (!user) return []

      // Super admins have access to all branches (if we had multi-tenant support)
      if (user.role === 'SUPER_ADMIN') {
        const allBranches = await db.branch.findMany({
          where: { agencyId: user.agencyId },
          select: { id: true }
        })
        return allBranches.map(b => b.id)
      }

      // Agency admins have access to all branches in their agency
      if (user.role === 'AGENCY_ADMIN') {
        const agencyBranches = await db.branch.findMany({
          where: { agencyId: user.agencyId },
          select: { id: true }
        })
        return agencyBranches.map(b => b.id)
      }

      const accessibleBranches = new Set<string>()

      // Add user's own branch
      if (user.branchId) {
        accessibleBranches.add(user.branchId)
      }

      // Add branches user manages
      user.managedBranches.forEach(branch => {
        accessibleBranches.add(branch.id)
      })

      // Add branches from roles with branch scope
      user.userRoles.forEach(userRole => {
        const role = userRole.role
        if (role.scope === 'BRANCH' && role.branchId) {
          accessibleBranches.add(role.branchId)
        }
      })

      return Array.from(accessibleBranches)
    } catch (error) {
      console.error('RBAC getAccessibleBranches error:', error)
      return []
    }
  }

  /**
   * Apply branch-based filtering to database queries
   */
  static async applyBranchFilter(
    userId: string,
    baseWhere: any = {},
    scope: 'AGENCY' | 'BRANCH' | 'OWN' = 'AGENCY'
  ): Promise<any> {
    try {
      const accessibleBranches = await this.getAccessibleBranches(userId)
      
      if (accessibleBranches.length === 0) {
        // No branch access, return empty result
        return { ...baseWhere, id: 'none' }
      }

      const user = await db.user.findUnique({
        where: { id: userId },
        select: { role: true, agencyId: true }
      })

      if (!user) return baseWhere

      // Super admins and agency admins can access all branches in scope
      if (user.role === 'SUPER_ADMIN' || (user.role === 'AGENCY_ADMIN' && scope === 'AGENCY')) {
        return baseWhere
      }

      // Apply branch filtering
      if (scope === 'OWN') {
        // Only user's own branch
        return {
          ...baseWhere,
          branchId: accessibleBranches[0] // User should only have one branch for OWN scope
        }
      }

      // BRANCH scope - any accessible branch
      return {
        ...baseWhere,
        branchId: { in: accessibleBranches }
      }
    } catch (error) {
      console.error('RBAC applyBranchFilter error:', error)
      return baseWhere
    }
  }

  /**
   * Check if user can access a specific resource with branch scoping
   */
  static async canAccessResource(
    userId: string,
    resourceType: string,
    resourceId: string,
    scope: 'AGENCY' | 'BRANCH' | 'OWN' = 'AGENCY'
  ): Promise<{ allowed: boolean; reason?: string }> {
    try {
      // Get the resource and its branch information
      let resourceBranchId: string | null = null
      let resourceAgencyId: string | null = null

      switch (resourceType) {
        case 'student':
          const student = await db.student.findUnique({
            where: { id: resourceId },
            select: { branchId: true, agencyId: true }
          })
          resourceBranchId = student?.branchId || null
          resourceAgencyId = student?.agencyId || null
          break

        case 'user':
          const userResource = await db.user.findUnique({
            where: { id: resourceId },
            select: { branchId: true, agencyId: true }
          })
          resourceBranchId = userResource?.branchId || null
          resourceAgencyId = userResource?.agencyId || null
          break

        case 'application':
          const application = await db.application.findUnique({
            where: { id: resourceId },
            select: { branchId: true, agencyId: true }
          })
          resourceBranchId = application?.branchId || null
          resourceAgencyId = application?.agencyId || null
          break

        case 'university':
          const university = await db.university.findUnique({
            where: { id: resourceId },
            select: { branchId: true, agencyId: true }
          })
          resourceBranchId = university?.branchId || null
          resourceAgencyId = university?.agencyId || null
          break

        case 'task':
          const task = await db.task.findUnique({
            where: { id: resourceId },
            select: { branchId: true, agencyId: true }
          })
          resourceBranchId = task?.branchId || null
          resourceAgencyId = task?.agencyId || null
          break

        case 'document':
          const document = await db.document.findUnique({
            where: { id: resourceId },
            select: { branchId: true, agencyId: true }
          })
          resourceBranchId = document?.branchId || null
          resourceAgencyId = document?.agencyId || null
          break

        default:
          return { allowed: false, reason: 'Unsupported resource type' }
      }

      if (!resourceAgencyId) {
        return { allowed: false, reason: 'Resource not found' }
      }

      // Check agency access first
      const currentUser = await db.user.findUnique({
        where: { id: userId },
        select: { agencyId: true, role: true }
      })

      if (!currentUser || currentUser.agencyId !== resourceAgencyId) {
        return { allowed: false, reason: 'Agency mismatch' }
      }

      // Super admins can access any resource
      if (currentUser.role === 'SUPER_ADMIN') {
        return { allowed: true }
      }

      // Agency admins can access any resource in their agency
      if (currentUser.role === 'AGENCY_ADMIN' && scope === 'AGENCY') {
        return { allowed: true }
      }

      // For branch-level access, check branch scope
      if (scope === 'BRANCH' || scope === 'OWN') {
        const branchCheck = await this.checkBranchScope(userId, resourceBranchId || undefined, scope)
        return branchCheck
      }

      return { allowed: false, reason: 'Insufficient scope' }
    } catch (error) {
      console.error('RBAC canAccessResource error:', error)
      return { allowed: false, reason: 'Internal server error' }
    }
  }
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
   * Get accessible branches for a user
   */
  static async getAccessibleBranches(userId: string): Promise<string[]> {
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        include: {
          agency: true,
          branch: true,
          managedBranches: true,
          userRoles: {
            include: {
              role: true
            }
          }
        }
      })

      if (!user) return []

      // Super admins and agency admins can access all branches in their agency
      if (user.role === 'SUPER_ADMIN' || user.role === 'AGENCY_ADMIN') {
        const agencyBranches = await db.branch.findMany({
          where: { agencyId: user.agencyId },
          select: { id: true }
        })
        return agencyBranches.map(b => b.id)
      }

      // Branch managers can access their managed branches
      if (user.role === 'BRANCH_MANAGER' || user.managedBranches.length > 0) {
        const managedBranchIds = user.managedBranches.map(b => b.id)
        const userBranchId = user.branchId ? [user.branchId] : []
        return [...new Set([...managedBranchIds, ...userBranchId])]
      }

      // Other users can only access their own branch
      return user.branchId ? [user.branchId] : []
    } catch (error) {
      console.error('Error getting accessible branches:', error)
      return []
    }
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
   * Get accessible branches for a user
   */
  static async getAccessibleBranches(userId: string, context: string = 'general'): Promise<string[]> {
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        include: {
          agency: true,
          branch: true,
          managedBranches: true,
          userRoles: {
            include: {
              role: true
            }
          }
        }
      })

      if (!user) return []

      const accessibleBranches: string[] = []

      // Super admins have access to all branches in the system
      if (user.role === 'SUPER_ADMIN') {
        const allBranches = await db.branch.findMany({
          select: { id: true }
        })
        return allBranches.map(b => b.id)
      }

      // Agency admins have access to all branches in their agency
      if (user.role === 'AGENCY_ADMIN') {
        const agencyBranches = await db.branch.findMany({
          where: { agencyId: user.agencyId },
          select: { id: true }
        })
        return agencyBranches.map(b => b.id)
      }

      // Branch managers have access to their branch and children
      if (user.role === 'BRANCH_MANAGER') {
        if (user.branchId) {
          accessibleBranches.push(user.branchId)
          
          // Get child branches
          const childBranches = await db.branch.findMany({
            where: { parentBranchId: user.branchId },
            select: { id: true }
          })
          accessibleBranches.push(...childBranches.map(b => b.id))
        }
        
        // Also include managed branches
        if (user.managedBranches.length > 0) {
          accessibleBranches.push(...user.managedBranches.map(mb => mb.id))
          
          // Get children of managed branches
          for (const managedBranch of user.managedBranches) {
            const children = await db.branch.findMany({
              where: { parentBranchId: managedBranch.id },
              select: { id: true }
            })
            accessibleBranches.push(...children.map(b => b.id))
          }
        }
        
        return [...new Set(accessibleBranches)] // Remove duplicates
      }

      // Other roles have access to their assigned branch
      if (user.branchId) {
        accessibleBranches.push(user.branchId)
      }

      // Check for additional branch access through roles
      for (const userRole of user.userRoles) {
        if (userRole.role.scope === 'AGENCY') {
          const agencyBranches = await db.branch.findMany({
            where: { agencyId: user.agencyId },
            select: { id: true }
          })
          accessibleBranches.push(...agencyBranches.map(b => b.id))
        }
      }

      return [...new Set(accessibleBranches)] // Remove duplicates
    } catch (error) {
      console.error('RBAC getAccessibleBranches error:', error)
      return []
    }
  }

  /**
   * Check if user has access to a specific branch
   */
  static async hasBranchAccess(userId: string, branchId: string): Promise<boolean> {
    try {
      const accessibleBranches = await this.getAccessibleBranches(userId)
      return accessibleBranches.includes(branchId)
    } catch (error) {
      console.error('RBAC hasBranchAccess error:', error)
      return false
    }
  }

  /**
   * Get user permissions with branch context
   */
  static async getUserPermissions(userId: string): Promise<any[]> {
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        include: {
          userPermissions: {
            include: {
              permission: true
            },
            where: { isActive: true }
          },
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
            },
            where: { isActive: true }
          }
        }
      })

      if (!user) return []

      const permissions: any[] = []

      // Add user-specific permissions
      permissions.push(...user.userPermissions.map(up => up.permission))

      // Add role-based permissions
      for (const userRole of user.userRoles) {
        permissions.push(...userRole.role.rolePermissions.map(rp => rp.permission))
      }

      // Remove duplicates
      const uniquePermissions = permissions.filter((perm, index, self) =>
        index === self.findIndex(p => p.id === perm.id)
      )

      return uniquePermissions
    } catch (error) {
      console.error('RBAC getUserPermissions error:', error)
      return []
    }
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