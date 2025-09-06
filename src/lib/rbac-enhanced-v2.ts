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
  RoleRestriction,
  Branch
} from '@prisma/client'

// ============================================================================
// Enhanced Types and Interfaces
// ============================================================================

export interface EnhancedRBACContext {
  userId: string
  agencyId: string
  branchId?: string
  accessibleBranches: string[]
  managedBranches: string[]
  effectiveRole: string
  accessLevel: EnhancedAccessLevel
  permissions: Permission[]
  roles: Role[]
  restrictions: string[]
  metadata?: {
    ip?: string
    userAgent?: string
    timestamp?: Date
  }
}

export interface EnhancedPermissionCheck {
  resource: string
  action: string
  resourceId?: string
  conditions?: Record<string, any>
  requireOwnership?: boolean
  requireBranchAccess?: boolean
  scope?: 'GLOBAL' | 'AGENCY' | 'BRANCH' | 'OWN' | 'ASSIGNED'
}

export interface EnhancedAccessDecision {
  allowed: boolean
  reason?: string
  accessLevel: EnhancedAccessLevel
  accessibleBranches: string[]
  managedBranches: string[]
  policies?: string[]
  restrictions?: string[]
  conditions?: Record<string, any>
}

export interface BranchHierarchy {
  id: string
  name: string
  code: string
  type: 'MAIN' | 'BRANCH' | 'FRANCHISE' | 'PARTNER'
  parentId?: string
  children: BranchHierarchy[]
  level: number
  path: string[]
}

export enum EnhancedAccessLevel {
  GLOBAL = 'GLOBAL',          // Super admin - all agencies
  AGENCY = 'AGENCY',          // Agency admin - all branches in agency
  BRANCH_GROUP = 'BRANCH_GROUP', // Regional manager - group of branches
  BRANCH = 'BRANCH',          // Branch manager - specific branch
  TEAM = 'TEAM',              // Team lead - team within branch
  OWN = 'OWN'                // Individual user - own resources only
}

// ============================================================================
// Enhanced RBAC Service v2
// ============================================================================

export class EnhancedRBACServiceV2 {
  private static userContextCache = new Map<string, { context: EnhancedRBACContext, expires: number }>()
  private static branchHierarchyCache = new Map<string, { hierarchy: BranchHierarchy[], expires: number }>()
  private static cacheTTL = 5 * 60 * 1000 // 5 minutes

  /**
   * Get comprehensive user context with caching
   */
  static async getUserContext(userId: string, forceRefresh = false): Promise<EnhancedRBACContext> {
    const cacheKey = `user_context_${userId}`
    const cached = this.userContextCache.get(cacheKey)
    
    if (!forceRefresh && cached && cached.expires > Date.now()) {
      return cached.context
    }

    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        include: {
          agency: true,
          branch: true,
          managedBranches: true,
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
                  },
                  parent: true,
                  children: true
                }
              }
            },
            where: { isActive: true }
          },
          userPermissions: {
            include: {
              permission: true
            },
            where: { isActive: true }
          },
          restrictions: {
            include: {
              restriction: true
            }
          }
        }
      })

      if (!user) {
        throw new Error('User not found')
      }

      if (user.status !== 'ACTIVE') {
        throw new Error('User account is not active')
      }

      // Get accessible branches with hierarchy support
      const accessibleBranches = await this.getAccessibleBranchesWithHierarchy(userId)
      const managedBranches = user.managedBranches.map(b => b.id)

      // Determine effective role and access level
      const { effectiveRole, accessLevel } = await this.determineEffectiveAccess(user, accessibleBranches)

      // Get all permissions (user-specific + role-based)
      const permissions = await this.getUserPermissionsWithHierarchy(userId)

      // Get active restrictions
      const restrictions = await this.getActiveRestrictions(userId)

      const context: EnhancedRBACContext = {
        userId: user.id,
        agencyId: user.agencyId!,
        branchId: user.branchId,
        accessibleBranches,
        managedBranches,
        effectiveRole,
        accessLevel,
        permissions,
        roles: user.userRoles.map(ur => ur.role),
        restrictions
      }

      // Cache the context
      this.userContextCache.set(cacheKey, {
        context,
        expires: Date.now() + this.cacheTTL
      })

      return context
    } catch (error) {
      console.error('Error getting user context:', error)
      throw error
    }
  }

  /**
   * Enhanced permission checking with branch hierarchy support
   */
  static async checkPermission(
    userId: string,
    permission: EnhancedPermissionCheck,
    context?: EnhancedRBACContext
  ): Promise<EnhancedAccessDecision> {
    try {
      const userContext = context || await this.getUserContext(userId)

      // Check system-level restrictions first
      const systemRestriction = await this.checkSystemRestrictions(permission, userContext)
      if (!systemRestriction.allowed) {
        return systemRestriction
      }

      // Check branch scope requirements
      if (permission.requireBranchAccess && permission.resourceId) {
        const branchAccess = await this.checkResourceBranchAccess(userId, permission.resource, permission.resourceId, permission.scope || 'BRANCH')
        if (!branchAccess.allowed) {
          return branchAccess
        }
      }

      // Check ownership requirements
      if (permission.requireOwnership && permission.resourceId) {
        const ownership = await this.checkResourceOwnership(userId, permission.resource, permission.resourceId)
        if (!ownership.allowed) {
          return ownership
        }
      }

      // Check user-specific permissions first (highest priority)
      const userPermission = await this.checkUserPermissionEnhanced(userId, permission, userContext)
      if (userPermission.allowed) {
        return userPermission
      }

      // Check role-based permissions with hierarchy
      const rolePermission = await this.checkRolePermissionEnhanced(userId, permission, userContext)
      if (rolePermission.allowed) {
        return rolePermission
      }

      // Check access policies
      const policyDecision = await this.checkAccessPoliciesEnhanced(userId, permission, userContext)
      if (policyDecision.allowed === false) {
        return policyDecision
      }

      // Check resource restrictions
      const restrictionDecision = await this.checkResourceRestrictionsEnhanced(userId, permission, userContext)
      if (!restrictionDecision.allowed) {
        return restrictionDecision
      }

      return {
        allowed: false,
        reason: 'Insufficient permissions',
        accessLevel: userContext.accessLevel,
        accessibleBranches: userContext.accessibleBranches,
        managedBranches: userContext.managedBranches
      }
    } catch (error) {
      console.error('Enhanced RBAC checkPermission error:', error)
      return {
        allowed: false,
        reason: 'Internal server error',
        accessLevel: EnhancedAccessLevel.OWN,
        accessibleBranches: [],
        managedBranches: []
      }
    }
  }

  /**
   * Get branch hierarchy for an agency
   */
  static async getBranchHierarchy(agencyId: string, forceRefresh = false): Promise<BranchHierarchy[]> {
    const cacheKey = `branch_hierarchy_${agencyId}`
    const cached = this.branchHierarchyCache.get(cacheKey)
    
    if (!forceRefresh && cached && cached.expires > Date.now()) {
      return cached.hierarchy
    }

    try {
      const branches = await db.branch.findMany({
        where: { agencyId, status: 'ACTIVE' },
        orderBy: { createdAt: 'asc' }
      })

      // Build hierarchy tree
      const branchMap = new Map<string, BranchHierarchy>()
      const rootBranches: BranchHierarchy[] = []

      // Create branch nodes
      branches.forEach(branch => {
        branchMap.set(branch.id, {
          id: branch.id,
          name: branch.name,
          code: branch.code,
          type: branch.type,
          parentId: undefined, // Will be set below
          children: [],
          level: 0,
          path: []
        })
      })

      // Build parent-child relationships
      branches.forEach(branch => {
        const node = branchMap.get(branch.id)!
        // For now, assume a simple hierarchy. This could be enhanced with a parentId field in Branch model
        if (branch.type === 'MAIN') {
          rootBranches.push(node)
        } else {
          // Find main branch as parent
          const mainBranch = branches.find(b => b.type === 'MAIN')
          if (mainBranch) {
            node.parentId = mainBranch.id
            node.level = 1
            node.path = [mainBranch.id, branch.id]
            branchMap.get(mainBranch.id)!.children.push(node)
          } else {
            rootBranches.push(node)
          }
        }
      })

      // Set paths for root branches
      rootBranches.forEach(branch => {
        if (branch.path.length === 0) {
          branch.path = [branch.id]
        }
      })

      const hierarchy = rootBranches

      // Cache the hierarchy
      this.branchHierarchyCache.set(cacheKey, {
        hierarchy,
        expires: Date.now() + this.cacheTTL
      })

      return hierarchy
    } catch (error) {
      console.error('Error getting branch hierarchy:', error)
      return []
    }
  }

  /**
   * Get accessible branches with hierarchy support
   */
  private static async getAccessibleBranchesWithHierarchy(userId: string): Promise<string[]> {
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

    const accessibleBranches = new Set<string>()

    // Super admins have access to all branches
    if (user.role === 'SUPER_ADMIN') {
      const allBranches = await db.branch.findMany({
        where: { agencyId: user.agencyId, status: 'ACTIVE' },
        select: { id: true }
      })
      allBranches.forEach(branch => accessibleBranches.add(branch.id))
      return Array.from(accessibleBranches)
    }

    // Agency admins have access to all branches in their agency
    if (user.role === 'AGENCY_ADMIN') {
      const agencyBranches = await db.branch.findMany({
        where: { agencyId: user.agencyId, status: 'ACTIVE' },
        select: { id: true }
      })
      agencyBranches.forEach(branch => accessibleBranches.add(branch.id))
      return Array.from(accessibleBranches)
    }

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

    // Add child branches if user has branch group access
    const branchHierarchy = await this.getBranchHierarchy(user.agencyId!)
    const userBranches = Array.from(accessibleBranches)
    
    userBranches.forEach(branchId => {
      const addChildBranches = (branches: BranchHierarchy[]) => {
        branches.forEach(branch => {
          if (userBranches.includes(branch.id)) {
            branch.children.forEach(child => {
              accessibleBranches.add(child.id)
              addChildBranches([child])
            })
          }
        })
      }
      addChildBranches(branchHierarchy)
    })

    return Array.from(accessibleBranches)
  }

  /**
   * Determine effective access level and role
   */
  private static async determineEffectiveAccess(user: any, accessibleBranches: string[]): Promise<{
    effectiveRole: string
    accessLevel: EnhancedAccessLevel
  }> {
    // Super admin
    if (user.role === 'SUPER_ADMIN') {
      return { effectiveRole: 'SUPER_ADMIN', accessLevel: EnhancedAccessLevel.GLOBAL }
    }

    // Agency admin
    if (user.role === 'AGENCY_ADMIN') {
      return { effectiveRole: 'AGENCY_ADMIN', accessLevel: EnhancedAccessLevel.AGENCY }
    }

    // Branch manager (manages multiple branches)
    if (user.managedBranches.length > 1) {
      return { effectiveRole: 'BRANCH_MANAGER', accessLevel: EnhancedAccessLevel.BRANCH_GROUP }
    }

    // Branch manager (manages single branch)
    if (user.managedBranches.length === 1) {
      return { effectiveRole: 'BRANCH_MANAGER', accessLevel: EnhancedAccessLevel.BRANCH }
    }

    // Check for team lead roles
    const hasTeamLeadRole = user.userRoles.some((ur: any) => {
      const role = ur.role
      return role.scope === 'TEAM' || role.name.toLowerCase().includes('team') || role.name.toLowerCase().includes('lead')
    })

    if (hasTeamLeadRole) {
      return { effectiveRole: 'TEAM_LEAD', accessLevel: EnhancedAccessLevel.TEAM }
    }

    // Default to own access level
    return { effectiveRole: user.role, accessLevel: EnhancedAccessLevel.OWN }
  }

  /**
   * Get user permissions with role hierarchy support
   */
  private static async getUserPermissionsWithHierarchy(userId: string): Promise<Permission[]> {
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
                },
                parent: true
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

    // Add role-based permissions with inheritance
    const addRolePermissions = async (roleId: string) => {
      const role = await db.role.findUnique({
        where: { id: roleId },
        include: {
          rolePermissions: {
            include: { permission: true },
            where: { isActive: true }
          },
          parent: true
        }
      })

      if (!role || !role.isActive) return

      // Add direct role permissions
      role.rolePermissions.forEach(rp => {
        if (rp.permission) {
          permissions.add(rp.permission)
        }
      })

      // Add parent role permissions (inheritance)
      if (role.parent) {
        await addRolePermissions(role.parentId)
      }
    }

    // Process all user roles with inheritance
    for (const userRole of user.userRoles) {
      await addRolePermissions(userRole.roleId)
    }

    return Array.from(permissions)
  }

  /**
   * Get active restrictions for a user
   */
  private static async getActiveRestrictions(userId: string): Promise<string[]> {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        restrictions: {
          include: { restriction: true },
          where: { 
            isActive: true,
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } }
            ]
          }
        },
        userRoles: {
          include: {
            role: {
              include: {
                roleRestrictions: {
                  include: { restriction: true },
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

    const restrictions = new Set<string>()

    // Add user-specific restrictions
    user.restrictions.forEach(ur => {
      if (ur.restriction) {
        restrictions.add(ur.restriction.name)
      }
    })

    // Add role-based restrictions
    user.userRoles.forEach(userRole => {
      userRole.role.roleRestrictions.forEach(rr => {
        if (rr.restriction) {
          restrictions.add(rr.restriction.name)
        }
      })
    })

    return Array.from(restrictions)
  }

  /**
   * Check system-level restrictions
   */
  private static async checkSystemRestrictions(
    permission: EnhancedPermissionCheck,
    context: EnhancedRBACContext
  ): Promise<EnhancedAccessDecision> {
    // Check IP-based restrictions
    if (context.metadata?.ip) {
      const ipRestriction = await db.resourceRestriction.findFirst({
        where: {
          type: 'IP_BASED',
          scope: 'GLOBAL',
          isActive: true,
          OR: [
            {
              conditions: {
                path: '$.blocked_ips',
                array_contains: context.metadata.ip
              }
            }
          ]
        }
      })

      if (ipRestriction) {
        return {
          allowed: false,
          reason: 'IP address blocked',
          accessLevel: context.accessLevel,
          accessibleBranches: context.accessibleBranches,
          managedBranches: context.managedBranches
        }
      }
    }

    return {
      allowed: true,
      accessLevel: context.accessLevel,
      accessibleBranches: context.accessibleBranches,
      managedBranches: context.managedBranches
    }
  }

  /**
   * Check resource branch access
   */
  private static async checkResourceBranchAccess(
    userId: string,
    resourceType: string,
    resourceId: string,
    requiredScope: string
  ): Promise<EnhancedAccessDecision> {
    try {
      let resourceBranchId: string | null = null

      // Get resource branch based on type
      switch (resourceType) {
        case 'student':
          const student = await db.student.findUnique({
            where: { id: resourceId },
            select: { branchId: true }
          })
          resourceBranchId = student?.branchId || null
          break

        case 'user':
          const user = await db.user.findUnique({
            where: { id: resourceId },
            select: { branchId: true }
          })
          resourceBranchId = user?.branchId || null
          break

        case 'application':
          const application = await db.application.findUnique({
            where: { id: resourceId },
            select: { branchId: true }
          })
          resourceBranchId = application?.branchId || null
          break

        case 'task':
          const task = await db.task.findUnique({
            where: { id: resourceId },
            select: { branchId: true }
          })
          resourceBranchId = task?.branchId || null
          break

        default:
          return {
            allowed: false,
            reason: 'Unsupported resource type',
            accessLevel: EnhancedAccessLevel.OWN,
            accessibleBranches: [],
            managedBranches: []
          }
      }

      if (!resourceBranchId) {
        return {
          allowed: false,
          reason: 'Resource not found or not associated with a branch',
          accessLevel: EnhancedAccessLevel.OWN,
          accessibleBranches: [],
          managedBranches: []
        }
      }

      const userContext = await this.getUserContext(userId)

      // Check if user has access to the resource's branch
      const hasBranchAccess = userContext.accessibleBranches.includes(resourceBranchId)

      if (!hasBranchAccess) {
        return {
          allowed: false,
          reason: 'No access to resource branch',
          accessLevel: userContext.accessLevel,
          accessibleBranches: userContext.accessibleBranches,
          managedBranches: userContext.managedBranches
        }
      }

      // Check scope requirements
      if (requiredScope === 'OWN' && resourceBranchId !== userContext.branchId) {
        return {
          allowed: false,
          reason: 'Resource not in user\'s own branch',
          accessLevel: userContext.accessLevel,
          accessibleBranches: userContext.accessibleBranches,
          managedBranches: userContext.managedBranches
        }
      }

      return {
        allowed: true,
        accessLevel: userContext.accessLevel,
        accessibleBranches: userContext.accessibleBranches,
        managedBranches: userContext.managedBranches
      }
    } catch (error) {
      console.error('Error checking resource branch access:', error)
      return {
        allowed: false,
        reason: 'Internal server error',
        accessLevel: EnhancedAccessLevel.OWN,
        accessibleBranches: [],
        managedBranches: []
      }
    }
  }

  /**
   * Check resource ownership
   */
  private static async checkResourceOwnership(
    userId: string,
    resourceType: string,
    resourceId: string
  ): Promise<EnhancedAccessDecision> {
    try {
      let isOwner = false

      switch (resourceType) {
        case 'student':
          const student = await db.student.findUnique({
            where: { id: resourceId },
            select: { assignedTo: true }
          })
          isOwner = student?.assignedTo === userId
          break

        case 'task':
          const task = await db.task.findUnique({
            where: { id: resourceId },
            select: { assignedTo: true, createdById: true }
          })
          isOwner = task?.assignedTo === userId || task?.createdById === userId
          break

        case 'application':
          const application = await db.application.findUnique({
            where: { id: resourceId },
            select: { assignedTo: true }
          })
          isOwner = application?.assignedTo === userId
          break

        default:
          return {
            allowed: false,
            reason: 'Ownership check not supported for this resource type',
            accessLevel: EnhancedAccessLevel.OWN,
            accessibleBranches: [],
            managedBranches: []
          }
      }

      const userContext = await this.getUserContext(userId)

      return {
        allowed: isOwner,
        reason: isOwner ? 'Ownership verified' : 'User is not the resource owner',
        accessLevel: userContext.accessLevel,
        accessibleBranches: userContext.accessibleBranches,
        managedBranches: userContext.managedBranches
      }
    } catch (error) {
      console.error('Error checking resource ownership:', error)
      return {
        allowed: false,
        reason: 'Internal server error',
        accessLevel: EnhancedAccessLevel.OWN,
        accessibleBranches: [],
        managedBranches: []
      }
    }
  }

  /**
   * Check user-specific permissions with enhanced conditions
   */
  private static async checkUserPermissionEnhanced(
    userId: string,
    permission: EnhancedPermissionCheck,
    context: EnhancedRBACContext
  ): Promise<EnhancedAccessDecision> {
    const userPermission = await db.userPermission.findFirst({
      where: {
        userId,
        permission: {
          resource: permission.resource,
          action: permission.action
        },
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      include: {
        permission: true
      }
    })

    if (userPermission) {
      // Check conditions
      const conditions = userPermission.conditions ? JSON.parse(userPermission.conditions) : {}
      if (await this.evaluateConditions(conditions, { ...context, permission })) {
        return {
          allowed: true,
          reason: 'User-specific permission granted',
          accessLevel: context.accessLevel,
          accessibleBranches: context.accessibleBranches,
          managedBranches: context.managedBranches,
          conditions
        }
      }
    }

    return {
      allowed: false,
      accessLevel: context.accessLevel,
      accessibleBranches: context.accessibleBranches,
      managedBranches: context.managedBranches
    }
  }

  /**
   * Check role-based permissions with enhanced hierarchy support
   */
  private static async checkRolePermissionEnhanced(
    userId: string,
    permission: EnhancedPermissionCheck,
    context: EnhancedRBACContext
  ): Promise<EnhancedAccessDecision> {
    // Get all user roles including inherited ones
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
              },
              where: { isActive: true }
            },
            parent: true
          }
        }
      }
    })

    for (const userRole of userRoles) {
      const role = userRole.role
      if (!role.isActive) continue

      // Check role scope
      if (role.scope === 'BRANCH' && role.branchId && !context.accessibleBranches.includes(role.branchId)) {
        continue
      }

      // Check direct role permissions
      const rolePermission = role.rolePermissions.find(rp => {
        return rp.permission.resource === permission.resource && 
               rp.permission.action === permission.action
      })

      if (rolePermission) {
        // Check conditions
        const conditions = rolePermission.conditions ? JSON.parse(rolePermission.conditions) : {}
        if (await this.evaluateConditions(conditions, { ...context, permission })) {
          return {
            allowed: true,
            reason: `Role '${role.name}' permission granted`,
            accessLevel: context.accessLevel,
            accessibleBranches: context.accessibleBranches,
            managedBranches: context.managedBranches,
            conditions
          }
        }
      }

      // Check inherited permissions from parent roles
      if (role.parent) {
        const parentDecision = await this.checkParentRolePermission(role.parentId, permission, context)
        if (parentDecision.allowed) {
          return parentDecision
        }
      }
    }

    return {
      allowed: false,
      accessLevel: context.accessLevel,
      accessibleBranches: context.accessibleBranches,
      managedBranches: context.managedBranches
    }
  }

  /**
   * Check parent role permissions recursively
   */
  private static async checkParentRolePermission(
    parentId: string,
    permission: EnhancedPermissionCheck,
    context: EnhancedRBACContext
  ): Promise<EnhancedAccessDecision> {
    const parentRole = await db.role.findUnique({
      where: { id: parentId },
      include: {
        rolePermissions: {
          include: {
            permission: true
          },
          where: { isActive: true }
        },
        parent: true
      }
    })

    if (!parentRole || !parentRole.isActive) {
      return {
        allowed: false,
        accessLevel: context.accessLevel,
        accessibleBranches: context.accessibleBranches,
        managedBranches: context.managedBranches
      }
    }

    // Check parent role permissions
    const rolePermission = parentRole.rolePermissions.find(rp => {
      return rp.permission.resource === permission.resource && 
             rp.permission.action === permission.action
    })

    if (rolePermission) {
      const conditions = rolePermission.conditions ? JSON.parse(rolePermission.conditions) : {}
      if (await this.evaluateConditions(conditions, { ...context, permission })) {
        return {
          allowed: true,
          reason: `Inherited from parent role '${parentRole.name}'`,
          accessLevel: context.accessLevel,
          accessibleBranches: context.accessibleBranches,
          managedBranches: context.managedBranches,
          conditions
        }
      }
    }

    // Check grandparent permissions
    if (parentRole.parent) {
      return await this.checkParentRolePermission(parentRole.parentId, permission, context)
    }

    return {
      allowed: false,
      accessLevel: context.accessLevel,
      accessibleBranches: context.accessibleBranches,
      managedBranches: context.managedBranches
    }
  }

  /**
   * Check access policies with enhanced evaluation
   */
  private static async checkAccessPoliciesEnhanced(
    userId: string,
    permission: EnhancedPermissionCheck,
    context: EnhancedRBACContext
  ): Promise<EnhancedAccessDecision> {
    const policies = await db.accessPolicy.findMany({
      where: {
        agencyId: context.agencyId,
        resource: permission.resource,
        action: permission.action,
        isActive: true,
        OR: [
          {
            targetType: 'USER',
            targetId: userId
          },
          {
            targetType: 'ROLE',
            targetId: {
              in: context.roles.map(r => r.id)
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
      const conditions = policy.conditions ? JSON.parse(policy.conditions) : {}
      
      if (await this.evaluateConditions(conditions, { ...context, permission })) {
        return {
          allowed: policy.effect === 'ALLOW',
          reason: `Policy ${policy.name} ${policy.effect.toLowerCase()}d access`,
          accessLevel: context.accessLevel,
          accessibleBranches: context.accessibleBranches,
          managedBranches: context.managedBranches,
          policies: [policy.name]
        }
      }
    }

    return {
      allowed: true,
      accessLevel: context.accessLevel,
      accessibleBranches: context.accessibleBranches,
      managedBranches: context.managedBranches
    }
  }

  /**
   * Check resource restrictions with enhanced filtering
   */
  private static async checkResourceRestrictionsEnhanced(
    userId: string,
    permission: EnhancedPermissionCheck,
    context: EnhancedRBACContext
  ): Promise<EnhancedAccessDecision> {
    const restrictions: string[] = []

    // Check user-specific restrictions
    const userRestrictions = await db.userRestriction.findMany({
      where: {
        userId,
        restriction: {
          resource: permission.resource,
          isActive: true
        },
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      include: {
        restriction: true
      }
    })

    userRestrictions.forEach(ur => {
      const conditions = ur.conditions ? JSON.parse(ur.conditions) : {}
      if (this.evaluateConditionsSync(conditions, { ...context, permission })) {
        restrictions.push(ur.restriction.name)
      }
    })

    // Check role-based restrictions
    for (const role of context.roles) {
      const roleRestrictions = await db.roleRestriction.findMany({
        where: {
          roleId: role.id,
          restriction: {
            resource: permission.resource,
            isActive: true
          },
          isActive: true
        },
        include: {
          restriction: true
        }
      })

      roleRestrictions.forEach(rr => {
        const conditions = rr.conditions ? JSON.parse(rr.conditions) : {}
        if (this.evaluateConditionsSync(conditions, { ...context, permission })) {
          restrictions.push(rr.restriction.name)
        }
      })
    }

    if (restrictions.length > 0) {
      return {
        allowed: false,
        reason: 'Access restricted by policy',
        accessLevel: context.accessLevel,
        accessibleBranches: context.accessibleBranches,
        managedBranches: context.managedBranches,
        restrictions
      }
    }

    return {
      allowed: true,
      accessLevel: context.accessLevel,
      accessibleBranches: context.accessibleBranches,
      managedBranches: context.managedBranches
    }
  }

  /**
   * Evaluate conditions (async version)
   */
  private static async evaluateConditions(
    conditions: Record<string, any>,
    context: any
  ): Promise<boolean> {
    // This is a simplified condition evaluator
    // In a real implementation, this would support complex expressions
    
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
          if (context.permission?.resourceId !== value) return false
          break
        case 'time_range':
          const now = new Date()
          const start = new Date(value.start)
          const end = new Date(value.end)
          if (now < start || now > end) return false
          break
        case 'access_level':
          const levelHierarchy = {
            [EnhancedAccessLevel.GLOBAL]: 6,
            [EnhancedAccessLevel.AGENCY]: 5,
            [EnhancedAccessLevel.BRANCH_GROUP]: 4,
            [EnhancedAccessLevel.BRANCH]: 3,
            [EnhancedAccessLevel.TEAM]: 2,
            [EnhancedAccessLevel.OWN]: 1
          }
          const currentLevel = levelHierarchy[context.accessLevel]
          const requiredLevel = levelHierarchy[value]
          if (currentLevel < requiredLevel) return false
          break
        case 'branch_in':
          if (!context.accessibleBranches?.includes(value)) return false
          break
        case 'branch_not_in':
          if (context.accessibleBranches?.includes(value)) return false
          break
        // Add more condition types as needed
      }
    }
    return true
  }

  /**
   * Evaluate conditions (sync version for restrictions)
   */
  private static evaluateConditionsSync(
    conditions: Record<string, any>,
    context: any
  ): boolean {
    // Synchronous version of condition evaluation
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
        case 'branch_in':
          if (!context.accessibleBranches?.includes(value)) return false
          break
        case 'branch_not_in':
          if (context.accessibleBranches?.includes(value)) return false
          break
      }
    }
    return true
  }

  /**
   * Apply branch-based filtering to database queries
   */
  static async applyBranchFilter(
    userId: string,
    baseWhere: any = {},
    options: {
      resource: string
      action?: string
      includeAssigned?: boolean
      includeOwned?: boolean
      scope?: 'GLOBAL' | 'AGENCY' | 'BRANCH' | 'OWN' | 'ASSIGNED'
    } = {}
  ): Promise<any> {
    const userContext = await this.getUserContext(userId)

    // Super admins and agency admins can access all branches in their agency
    if (userContext.accessLevel === EnhancedAccessLevel.GLOBAL || 
        userContext.accessLevel === EnhancedAccessLevel.AGENCY) {
      return baseWhere
    }

    // Apply branch filtering based on scope
    switch (options.scope || userContext.accessLevel) {
      case EnhancedAccessLevel.OWN:
        // Only user's own branch
        if (!userContext.branchId) {
          return { ...baseWhere, id: 'none' } // No access
        }
        return { ...baseWhere, branchId: userContext.branchId }

      case EnhancedAccessLevel.BRANCH:
      case EnhancedAccessLevel.TEAM:
        // Any accessible branch
        if (userContext.accessibleBranches.length === 0) {
          return { ...baseWhere, id: 'none' } // No access
        }
        return { ...baseWhere, branchId: { in: userContext.accessibleBranches } }

      case EnhancedAccessLevel.ASSIGNED:
        // Include assigned resources
        const assignedFilter = {
          ...baseWhere,
          OR: [
            { branchId: { in: userContext.accessibleBranches } },
            { assignedTo: userId }
          ]
        }
        return assignedFilter

      default:
        return baseWhere
    }
  }

  /**
   * Clear user context cache
   */
  static clearUserContext(userId: string): void {
    const cacheKey = `user_context_${userId}`
    this.userContextCache.delete(cacheKey)
  }

  /**
   * Clear branch hierarchy cache
   */
  static clearBranchHierarchy(agencyId: string): void {
    const cacheKey = `branch_hierarchy_${agencyId}`
    this.branchHierarchyCache.delete(cacheKey)
  }

  /**
   * Clear all caches
   */
  static clearAllCaches(): void {
    this.userContextCache.clear()
    this.branchHierarchyCache.clear()
  }
}