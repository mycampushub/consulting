import { db } from './db'
import type { 
  User, 
  Role, 
  Permission, 
  UserRoleAssignment,
  UserPermission,
  RolePermission,
  Branch
} from '@prisma/client'

// ============================================================================
// Enhanced Types and Interfaces
// ============================================================================

export enum EnhancedBranchAccessLevel {
  GLOBAL = 'global',      // Super Admin: All agencies and branches
  AGENCY = 'agency',      // Agency Admin: All branches in agency
  REGION = 'region',      // Regional Manager: Multiple branches
  BRANCH = 'branch',      // Branch Manager: Specific branch + children
  ASSIGNED = 'assigned',  // Consultant: Assigned resources + own branch  
  OWN = 'own'            // Standard User: Only own branch and resources
}

export enum EnhancedRBACAccessLevel {
  NONE = 'none',           // No access
  VIEW = 'view',           // Read-only access
  EDIT = 'edit',           // Edit access (create, update)
  DELETE = 'delete',       // Delete access
  FULL = 'full',           // Full access (create, read, update, delete)
  MANAGE = 'manage',       // Management access (includes permissions management)
  CUSTOM = 'custom',       // Custom access level with specific conditions
  DELEGATE = 'delegate'   // Can delegate permissions to others
}

export interface EnhancedPermissionCheck {
  resource: string        // e.g., 'students', 'users', 'applications'
  action: string          // e.g., 'create', 'read', 'update', 'delete'
  resourceId?: string     // Specific resource instance
  field?: string         // Specific field for field-level access
  conditions?: Record<string, any>
  requireExact?: boolean  // Require exact match (no inheritance)
}

export interface EnhancedAccessDecision {
  allowed: boolean
  reason?: string
  accessLevel?: EnhancedRBACAccessLevel
  branchAccessLevel?: EnhancedBranchAccessLevel
  accessibleBranches: string[]
  managedBranches: string[]
  dataFilters?: Record<string, any>
  fieldPermissions?: string[]
  inheritedFrom?: string[]
  delegationInfo?: {
    delegatedBy: string
    delegatedAt: Date
    expiresAt?: Date
  }
}

export interface EnhancedRBACContext {
  userId: string
  agencyId?: string
  branchId?: string
  ipAddress?: string
  userAgent?: string
  resource?: string
  action?: string
  resourceId?: string
  field?: string
  timestamp?: Date
}

export interface EnhancedBranchAccessInfo {
  level: EnhancedBranchAccessLevel
  accessibleBranches: string[]
  managedBranches: string[]
  ownBranch?: string
  canAccessAllAgencyBranches: boolean
  regionalBranches?: string[]  // For regional managers
  childBranches?: string[]    // For branch hierarchy
  inheritedAccess?: string[]  // Inherited branch access
}

export interface PermissionGrant {
  permissionId: string
  accessLevel: EnhancedRBACAccessLevel
  conditions?: Record<string, any>
  expiresAt?: Date
  grantedBy: string
  scope?: 'GLOBAL' | 'AGENCY' | 'BRANCH'
  branchId?: string
}

export interface PermissionRevoke {
  permissionId: string
  reason?: string
  revokedBy: string
}

export interface AuditOptions {
  eventType?: string
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}

export interface AuditLogEntry {
  id: string
  userId: string
  eventType: string
  resourceType?: string
  resourceId?: string
  details: Record<string, any>
  ipAddress?: string
  userAgent?: string
  timestamp: Date
}

// ============================================================================
// Enhanced RBAC Service
// ============================================================================

export class EnhancedRBACService {
  // Multi-level caching system
  private static permissionCache = new Map<string, { decision: EnhancedAccessDecision; expires: number }>()
  private static branchAccessCache = new Map<string, { access: EnhancedBranchAccessInfo; expires: number }>()
  private static roleHierarchyCache = new Map<string, { roles: Role[]; expires: number }>()
  private static resourceAccessCache = new Map<string, { access: boolean; expires: number }>()
  
  // Cache TTL configuration
  private static CACHE_TTL = {
    PERMISSION: 5 * 60 * 1000,        // 5 minutes
    BRANCH_ACCESS: 10 * 60 * 1000,     // 10 minutes
    ROLE_HIERARCHY: 30 * 60 * 1000,    // 30 minutes
    RESOURCE_ACCESS: 2 * 60 * 1000     // 2 minutes
  }

  /**
   * Main permission check method with enhanced features
   */
  static async checkPermission(
    userId: string,
    permission: EnhancedPermissionCheck,
    context?: Partial<EnhancedRBACContext>
  ): Promise<EnhancedAccessDecision> {
    try {
      const cacheKey = this.getPermissionCacheKey(userId, permission, context)
      const cached = this.permissionCache.get(cacheKey)
      
      if (cached && cached.expires > Date.now()) {
        return cached.decision
      }

      const decision = await this.performEnhancedPermissionCheck(userId, permission, context)
      
      // Cache the decision
      this.permissionCache.set(cacheKey, {
        decision,
        expires: Date.now() + this.CACHE_TTL.PERMISSION
      })

      // Log access attempt
      await this.logAccessAttempt(userId, permission, decision, context)

      return decision
    } catch (error) {
      console.error('EnhancedRBAC checkPermission error:', error)
      return { 
        allowed: false, 
        reason: 'Internal server error',
        accessibleBranches: [],
        managedBranches: []
      }
    }
  }

  /**
   * Batch permission checking for performance optimization
   */
  static async checkPermissions(
    userId: string,
    permissions: EnhancedPermissionCheck[],
    context?: Partial<EnhancedRBACContext>
  ): Promise<EnhancedAccessDecision[]> {
    try {
      // Get branch access info once for all permissions
      const branchAccess = await this.getBranchAccessWithHierarchy(userId)
      
      // Process permissions in parallel
      const decisions = await Promise.all(
        permissions.map(permission => 
          this.checkPermission(userId, permission, {
            ...context,
            branchId: context?.branchId || branchAccess.ownBranch
          })
        )
      )

      return decisions
    } catch (error) {
      console.error('EnhancedRBAC checkPermissions error:', error)
      return permissions.map(() => ({
        allowed: false,
        reason: 'Internal server error',
        accessibleBranches: [],
        managedBranches: []
      }))
    }
  }

  /**
   * Enhanced branch access calculation with hierarchy support
   */
  static async getBranchAccessWithHierarchy(
    userId: string, 
    resourceType?: string
  ): Promise<EnhancedBranchAccessInfo> {
    try {
      const cacheKey = `enhanced_branch_access:${userId}:${resourceType || 'default'}`
      const cached = this.branchAccessCache.get(cacheKey)
      
      if (cached && cached.expires > Date.now()) {
        return cached.access
      }

      const access = await this.calculateEnhancedBranchAccess(userId, resourceType)
      
      // Cache the access info
      this.branchAccessCache.set(cacheKey, {
        access,
        expires: Date.now() + this.CACHE_TTL.BRANCH_ACCESS
      })

      return access
    } catch (error) {
      console.error('EnhancedRBAC getBranchAccessWithHierarchy error:', error)
      return {
        level: EnhancedBranchAccessLevel.OWN,
        accessibleBranches: [],
        managedBranches: [],
        canAccessAllAgencyBranches: false
      }
    }
  }

  /**
   * Apply branch-based filtering with enhanced hierarchy support
   */
  static async applyBranchFilter(
    userId: string,
    resourceType: string,
    baseWhere: any = {},
    options: {
      action?: string
      includeAssigned?: boolean
      includeChildren?: boolean
      fieldLevel?: boolean
    } = {}
  ): Promise<any> {
    try {
      const branchAccess = await this.getBranchAccessWithHierarchy(userId, resourceType)
      
      if (branchAccess.accessibleBranches.length === 0) {
        return { ...baseWhere, id: 'none' } // No access
      }

      const enhancedWhere = { ...baseWhere }
      const accessibleBranches = options.includeChildren 
        ? [...branchAccess.accessibleBranches, ...(branchAccess.childBranches || [])]
        : branchAccess.accessibleBranches

      switch (resourceType) {
        case 'students':
          if (options.includeAssigned) {
            enhancedWhere.OR = [
              { branchId: { in: accessibleBranches } },
              { assignedTo: userId }
            ]
          } else {
            enhancedWhere.branchId = { in: accessibleBranches }
          }
          break

        case 'applications':
          if (options.includeAssigned) {
            enhancedWhere.OR = [
              { branchId: { in: accessibleBranches } },
              { student: { assignedTo: userId } }
            ]
          } else {
            enhancedWhere.branchId = { in: accessibleBranches }
          }
          break

        case 'tasks':
          if (options.includeAssigned) {
            enhancedWhere.OR = [
              { branchId: { in: accessibleBranches } },
              { assignedTo: userId },
              { createdById: userId }
            ]
          } else {
            enhancedWhere.branchId = { in: accessibleBranches }
          }
          break

        case 'users':
          enhancedWhere.OR = [
            { branchId: { in: accessibleBranches } },
            { id: userId } // Users can always see themselves
          ]
          break

        case 'documents':
          enhancedWhere.OR = [
            { branchId: { in: accessibleBranches } },
            { uploadedById: userId }
          ]
          break

        case 'branches':
          // Branch-specific filtering with hierarchy
          if (branchAccess.level === EnhancedBranchAccessLevel.GLOBAL) {
            // Global access - no filtering needed
            break
          } else if (branchAccess.level === EnhancedBranchAccessLevel.AGENCY) {
            // Agency access - filter by agency
            enhancedWhere.agencyId = branchAccess.accessibleBranches.length > 0 
              ? { in: await this.getAgencyIdsFromBranches(branchAccess.accessibleBranches) }
              : undefined
          } else {
            // Branch-level access
            enhancedWhere.id = { in: accessibleBranches }
          }
          break

        default:
          enhancedWhere.branchId = { in: accessibleBranches }
          break
      }

      return enhancedWhere
    } catch (error) {
      console.error('EnhancedRBAC applyBranchFilter error:', error)
      return baseWhere
    }
  }

  /**
   * Grant permission to user with enhanced options
   */
  static async grantPermission(
    userId: string,
    grant: PermissionGrant
  ): Promise<void> {
    try {
      // Check if granter has permission to grant this permission
      const granterAccess = await this.checkPermission(grant.grantedBy, {
        resource: 'permissions',
        action: 'grant'
      })

      if (!granterAccess.allowed) {
        throw new Error('Insufficient permissions to grant permissions')
      }

      // Create user permission
      await db.userPermission.create({
        data: {
          userId,
          permissionId: grant.permissionId,
          accessLevel: grant.accessLevel as any,
          conditions: grant.conditions ? JSON.stringify(grant.conditions) : undefined,
          expiresAt: grant.expiresAt,
          grantedBy: grant.grantedBy,
          agencyId: await this.getUserAgencyId(userId),
          branchId: grant.branchId
        }
      })

      // Clear user's permission cache
      this.clearUserCache(userId)

      // Log permission grant
      await this.logAuditEvent({
        userId: grant.grantedBy,
        eventType: 'PERMISSION_GRANTED',
        resourceType: 'user_permission',
        resourceId: userId,
        details: {
          permissionId: grant.permissionId,
          accessLevel: grant.accessLevel,
          grantedTo: userId,
          scope: grant.scope,
          branchId: grant.branchId,
          expiresAt: grant.expiresAt
        }
      })
    } catch (error) {
      console.error('EnhancedRBAC grantPermission error:', error)
      throw error
    }
  }

  /**
   * Revoke permission from user
   */
  static async revokePermission(
    userId: string,
    revoke: PermissionRevoke
  ): Promise<void> {
    try {
      // Check if revoker has permission to revoke this permission
      const revokerAccess = await this.checkPermission(revoke.revokedBy, {
        resource: 'permissions',
        action: 'revoke'
      })

      if (!revokerAccess.allowed) {
        throw new Error('Insufficient permissions to revoke permissions')
      }

      // Delete user permission
      await db.userPermission.deleteMany({
        where: {
          userId,
          permissionId: revoke.permissionId
        }
      })

      // Clear user's permission cache
      this.clearUserCache(userId)

      // Log permission revocation
      await this.logAuditEvent({
        userId: revoke.revokedBy,
        eventType: 'PERMISSION_REVOKED',
        resourceType: 'user_permission',
        resourceId: userId,
        details: {
          permissionId: revoke.permissionId,
          revokedFrom: userId,
          reason: revoke.reason
        }
      })
    } catch (error) {
      console.error('EnhancedRBAC revokePermission error:', error)
      throw error
    }
  }

  /**
   * Get permission history/audit trail
   */
  static async getPermissionHistory(
    userId: string,
    options: AuditOptions = {}
  ): Promise<AuditLogEntry[]> {
    try {
      const where: any = {
        OR: [
          { userId },
          { details: { path: '$.grantedTo', equals: userId } },
          { details: { path: '$.revokedFrom', equals: userId } }
        ]
      }

      if (options.eventType) {
        where.eventType = options.eventType
      }

      if (options.startDate) {
        where.timestamp = { gte: options.startDate }
      }

      if (options.endDate) {
        where.timestamp = { ...where.timestamp, lte: options.endDate }
      }

      const logs = await db.activityLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: options.limit || 50,
        skip: options.offset || 0
      })

      return logs.map(log => ({
        id: log.id,
        userId: log.userId || '',
        eventType: log.action,
        resourceType: log.entityType,
        resourceId: log.entityId,
        details: JSON.parse(log.changes || '{}'),
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        timestamp: log.createdAt
      }))
    } catch (error) {
      console.error('EnhancedRBAC getPermissionHistory error:', error)
      return []
    }
  }

  // ============================================================================
  // Private Implementation Methods
  // ============================================================================

  private static async performEnhancedPermissionCheck(
    userId: string,
    permission: EnhancedPermissionCheck,
    context?: Partial<EnhancedRBACContext>
  ): Promise<EnhancedAccessDecision> {
    // Get user with all necessary relations
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        agency: true,
        branch: true,
        managedBranches: {
          include: {
            children: true // Include child branches for hierarchy
          }
        },
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: { 
                    permission: true,
                    branch: true
                  }
                },
                parent: true
              }
            }
          },
          where: { isActive: true }
        },
        userPermissions: {
          include: { 
            permission: true,
            branch: true
          },
          where: { isActive: true }
        }
      }
    })

    if (!user || user.status !== 'ACTIVE') {
      return { 
        allowed: false, 
        reason: 'User not found or inactive',
        accessibleBranches: [],
        managedBranches: []
      }
    }

    const fullContext: EnhancedRBACContext = {
      userId,
      agencyId: user.agencyId || context?.agencyId,
      branchId: user.branchId || context?.branchId,
      resource: permission.resource,
      action: permission.action,
      resourceId: permission.resourceId,
      field: permission.field,
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
      timestamp: context?.timestamp || new Date()
    }

    // Get enhanced branch access info
    const branchAccess = await this.getBranchAccessWithHierarchy(userId, permission.resource)

    // Check field-level permissions if specified
    if (permission.field) {
      return await this.checkFieldPermission(user, permission, fullContext, branchAccess)
    }

    // Check user-specific permissions first (highest priority)
    const userPermission = user.userPermissions.find(up => {
      const perm = up.permission
      return perm.resource === permission.resource && 
             perm.action === permission.action &&
             (!up.expiresAt || up.expiresAt > new Date())
    })

    if (userPermission) {
      const conditions = JSON.parse(userPermission.conditions || '{}')
      if (await this.evaluateConditions(conditions, fullContext)) {
        return {
          allowed: true,
          accessLevel: userPermission.accessLevel as EnhancedRBACAccessLevel,
          branchAccessLevel: branchAccess.level,
          accessibleBranches: branchAccess.accessibleBranches,
          managedBranches: branchAccess.managedBranches,
          reason: 'User-specific permission granted'
        }
      }
    }

    // Check role-based permissions with enhanced inheritance
    for (const userRole of user.userRoles) {
      const role = userRole.role
      if (!role.isActive) continue

      // Check role scope and branch access
      if (role.scope === 'BRANCH' && role.branchId && !branchAccess.accessibleBranches.includes(role.branchId)) {
        continue
      }

      // Check direct role permissions
      const rolePermission = role.rolePermissions.find(rp => {
        const perm = rp.permission
        return perm.resource === permission.resource && 
               perm.action === permission.action &&
               rp.isActive
      })

      if (rolePermission) {
        const conditions = JSON.parse(rolePermission.conditions || '{}')
        if (await this.evaluateConditions(conditions, fullContext)) {
          const inheritedFrom = await this.getInheritanceChain(role)
          return {
            allowed: true,
            accessLevel: rolePermission.accessLevel as EnhancedRBACAccessLevel,
            branchAccessLevel: branchAccess.level,
            accessibleBranches: branchAccess.accessibleBranches,
            managedBranches: branchAccess.managedBranches,
            inheritedFrom,
            reason: `Role '${role.name}' permission granted`
          }
        }
      }

      // Check inherited permissions from parent roles
      if (role.parent && !permission.requireExact) {
        const inheritedPermission = await this.checkInheritedRolePermissions(
          role.parent, permission, fullContext, branchAccess
        )
        if (inheritedPermission.allowed) {
          return inheritedPermission
        }
      }
    }

    // Default deny with comprehensive info
    return {
      allowed: false,
      accessLevel: EnhancedRBACAccessLevel.NONE,
      branchAccessLevel: branchAccess.level,
      accessibleBranches: branchAccess.accessibleBranches,
      managedBranches: branchAccess.managedBranches,
      reason: 'Insufficient permissions'
    }
  }

  private static async calculateEnhancedBranchAccess(
    userId: string, 
    resourceType?: string
  ): Promise<EnhancedBranchAccessInfo> {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        agency: true,
        branch: {
          include: {
            parent: true,
            children: true
          }
        },
        managedBranches: {
          include: {
            children: true
          }
        },
        userRoles: {
          include: { 
            role: {
              include: {
                parent: true
              }
            }
          },
          where: { isActive: true }
        }
      }
    })

    if (!user) {
      return {
        level: EnhancedBranchAccessLevel.OWN,
        accessibleBranches: [],
        managedBranches: [],
        canAccessAllAgencyBranches: false
      }
    }

    // Super Admin - Global Access
    if (user.role === 'SUPER_ADMIN') {
      const allBranches = await db.branch.findMany({
        include: {
          children: true
        }
      })
      return {
        level: EnhancedBranchAccessLevel.GLOBAL,
        accessibleBranches: allBranches.map(b => b.id),
        managedBranches: allBranches.map(b => b.id),
        canAccessAllAgencyBranches: true,
        childBranches: allBranches.flatMap(b => b.children.map(c => c.id))
      }
    }

    // Agency Admin - Agency Access
    if (user.role === 'AGENCY_ADMIN') {
      const agencyBranches = await db.branch.findMany({
        where: { agencyId: user.agencyId },
        include: {
          children: true
        }
      })
      return {
        level: EnhancedBranchAccessLevel.AGENCY,
        accessibleBranches: agencyBranches.map(b => b.id),
        managedBranches: agencyBranches.map(b => b.id),
        canAccessAllAgencyBranches: true,
        childBranches: agencyBranches.flatMap(b => b.children.map(c => c.id))
      }
    }

    const accessibleBranches = new Set<string>()
    const managedBranches = new Set<string>()
    const childBranches = new Set<string>()
    const regionalBranches = new Set<string>()

    // Add user's own branch
    if (user.branchId) {
      accessibleBranches.add(user.branchId)
      
      // Add child branches of user's branch
      if (user.branch.children) {
        user.branch.children.forEach(child => {
          accessibleBranches.add(child.id)
          childBranches.add(child.id)
        })
      }
    }

    // Add managed branches and their children
    user.managedBranches.forEach(branch => {
      accessibleBranches.add(branch.id)
      managedBranches.add(branch.id)
      
      // Add children of managed branches
      if (branch.children) {
        branch.children.forEach(child => {
          accessibleBranches.add(child.id)
          childBranches.add(child.id)
        })
      }
    })

    // Check role-based branch access
    for (const userRole of user.userRoles) {
      const role = userRole.role

      if (role.scope === 'AGENCY') {
        // Role grants agency-wide access
        const agencyBranches = await db.branch.findMany({
          where: { agencyId: user.agencyId },
          select: { id: true }
        })
        agencyBranches.forEach(branch => accessibleBranches.add(branch.id))
      } else if (role.scope === 'BRANCH' && role.branchId) {
        // Role grants access to specific branch
        accessibleBranches.add(role.branchId)
        
        // Add children of role branch
        const roleBranch = await db.branch.findUnique({
          where: { id: role.branchId },
          include: { children: true }
        })
        if (roleBranch?.children) {
          roleBranch.children.forEach(child => {
            accessibleBranches.add(child.id)
            childBranches.add(child.id)
          })
        }
        
        if (user.role === 'BRANCH_MANAGER') {
          managedBranches.add(role.branchId)
        }
      }
    }

    // Determine access level based on accessible branches
    let level = EnhancedBranchAccessLevel.OWN
    if (managedBranches.size > 0 || user.role === 'BRANCH_MANAGER') {
      level = EnhancedBranchAccessLevel.BRANCH
    } else if (accessibleBranches.size > 1) {
      level = EnhancedBranchAccessLevel.ASSIGNED
    }

    // Check for regional access (multiple managed branches)
    if (managedBranches.size > 1) {
      level = EnhancedBranchAccessLevel.REGION
      managedBranches.forEach(branchId => regionalBranches.add(branchId))
    }

    return {
      level,
      accessibleBranches: Array.from(accessibleBranches),
      managedBranches: Array.from(managedBranches),
      ownBranch: user.branchId,
      canAccessAllAgencyBranches: false,
      childBranches: Array.from(childBranches),
      regionalBranches: Array.from(regionalBranches)
    }
  }

  private static async checkFieldPermission(
    user: any,
    permission: EnhancedPermissionCheck,
    context: EnhancedRBACContext,
    branchAccess: EnhancedBranchAccessInfo
  ): Promise<EnhancedAccessDecision> {
    // Check if user has field-level access to the specified field
    const fieldPermission = user.userPermissions.find(up => {
      const perm = up.permission
      return perm.resource === permission.resource && 
             perm.action === permission.action &&
             perm.field === permission.field &&
             (!up.expiresAt || up.expiresAt > new Date())
    })

    if (fieldPermission) {
      const conditions = JSON.parse(fieldPermission.conditions || '{}')
      if (await this.evaluateConditions(conditions, context)) {
        return {
          allowed: true,
          accessLevel: fieldPermission.accessLevel as EnhancedRBACAccessLevel,
          branchAccessLevel: branchAccess.level,
          accessibleBranches: branchAccess.accessibleBranches,
          managedBranches: branchAccess.managedBranches,
          fieldPermissions: [permission.field!],
          reason: `Field-level access granted for '${permission.field}'`
        }
      }
    }

    return {
      allowed: false,
      accessLevel: EnhancedRBACAccessLevel.NONE,
      branchAccessLevel: branchAccess.level,
      accessibleBranches: branchAccess.accessibleBranches,
      managedBranches: branchAccess.managedBranches,
      reason: `Field-level access denied for '${permission.field}'`
    }
  }

  private static async checkInheritedRolePermissions(
    role: Role,
    permission: EnhancedPermissionCheck,
    context: EnhancedRBACContext,
    branchAccess: EnhancedBranchAccessInfo
  ): Promise<EnhancedAccessDecision> {
    if (!role.isActive) return { 
      allowed: false,
      accessibleBranches: branchAccess.accessibleBranches,
      managedBranches: branchAccess.managedBranches
    }

    // Check role scope
    if (role.scope === 'BRANCH' && role.branchId && !branchAccess.accessibleBranches.includes(role.branchId)) {
      return { 
        allowed: false,
        accessibleBranches: branchAccess.accessibleBranches,
        managedBranches: branchAccess.managedBranches
      }
    }

    // Check permissions
    const rolePermission = role.rolePermissions?.find(rp => {
      const perm = rp.permission
      return perm.resource === permission.resource && 
             perm.action === permission.action &&
             rp.isActive
    })

    if (rolePermission) {
      const conditions = JSON.parse(rolePermission.conditions || '{}')
      if (await this.evaluateConditions(conditions, context)) {
        const inheritedFrom = await this.getInheritanceChain(role)
        return {
          allowed: true,
          accessLevel: rolePermission.accessLevel as EnhancedRBACAccessLevel,
          branchAccessLevel: branchAccess.level,
          accessibleBranches: branchAccess.accessibleBranches,
          managedBranches: branchAccess.managedBranches,
          inheritedFrom,
          reason: `Inherited from role '${role.name}'`
        }
      }
    }

    // Check parent role recursively
    if (role.parent) {
      return await this.checkInheritedRolePermissions(role.parent, permission, context, branchAccess)
    }

    return { 
      allowed: false,
      accessibleBranches: branchAccess.accessibleBranches,
      managedBranches: branchAccess.managedBranches
    }
  }

  private static async getInheritanceChain(role: Role): Promise<string[]> {
    const chain: string[] = [role.name]
    let current = role

    while (current.parent) {
      const parent = await db.role.findUnique({
        where: { id: current.parentId },
        select: { name: true, parentId: true }
      })
      if (!parent) break
      
      chain.push(parent.name)
      current = parent as any
    }

    return chain
  }

  private static async evaluateConditions(
    conditions: Record<string, any>,
    context: EnhancedRBACContext
  ): Promise<boolean> {
    // Simple condition evaluation - can be enhanced with a proper expression evaluator
    for (const [key, value] of Object.entries(conditions)) {
      switch (key) {
        case 'time':
          const now = new Date()
          const timeCondition = value as { start?: string; end?: string; days?: string[] }
          if (timeCondition.start && now < new Date(timeCondition.start)) return false
          if (timeCondition.end && now > new Date(timeCondition.end)) return false
          if (timeCondition.days && !timeCondition.days.includes(now.getDay().toString())) return false
          break
          
        case 'branch':
          if (context.branchId && value !== context.branchId) return false
          break
          
        case 'agency':
          if (context.agencyId && value !== context.agencyId) return false
          break
          
        case 'user':
          if (context.userId && value !== context.userId) return false
          break
      }
    }
    return true
  }

  private static async getAgencyIdsFromBranches(branchIds: string[]): Promise<string[]> {
    const branches = await db.branch.findMany({
      where: { id: { in: branchIds } },
      select: { agencyId: true }
    })
    return [...new Set(branches.map(b => b.agencyId))]
  }

  private static async getUserAgencyId(userId: string): Promise<string | undefined> {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { agencyId: true }
    })
    return user?.agencyId
  }

  private static getPermissionCacheKey(
    userId: string,
    permission: EnhancedPermissionCheck,
    context?: Partial<EnhancedRBACContext>
  ): string {
    const parts = [
      'permission',
      userId,
      permission.resource,
      permission.action,
      permission.resourceId || '',
      permission.field || '',
      context?.branchId || '',
      context?.agencyId || ''
    ]
    return parts.join(':')
  }

  private static async logAccessAttempt(
    userId: string,
    permission: EnhancedPermissionCheck,
    decision: EnhancedAccessDecision,
    context?: Partial<EnhancedRBACContext>
  ): Promise<void> {
    try {
      await db.activityLog.create({
        data: {
          userId,
          agencyId: context?.agencyId,
          action: decision.allowed ? 'ACCESS_GRANTED' : 'ACCESS_DENIED',
          entityType: 'Permission',
          entityId: permission.resource,
          changes: JSON.stringify({
            permission,
            decision: {
              allowed: decision.allowed,
              reason: decision.reason,
              accessLevel: decision.accessLevel,
              branchAccessLevel: decision.branchAccessLevel
            },
            context: {
              branchId: context?.branchId,
              resourceId: permission.resourceId,
              field: permission.field
            }
          }),
          ipAddress: context?.ipAddress,
          userAgent: context?.userAgent
        }
      })
    } catch (error) {
      console.error('Error logging access attempt:', error)
    }
  }

  private static async logAuditEvent(data: {
    userId: string
    eventType: string
    resourceType?: string
    resourceId?: string
    details: Record<string, any>
  }): Promise<void> {
    try {
      await db.activityLog.create({
        data: {
          userId: data.userId,
          action: data.eventType,
          entityType: data.resourceType || 'Audit',
          entityId: data.resourceId,
          changes: JSON.stringify(data.details)
        }
      })
    } catch (error) {
      console.error('Error logging audit event:', error)
    }
  }

  // ============================================================================
  // Cache Management
  // ============================================================================

  static clearUserCache(userId: string): void {
    // Clear all cache entries for this user
    const keysToDelete: string[] = []
    
    for (const [key] of this.permissionCache) {
      if (key.includes(`:${userId}:`)) {
        keysToDelete.push(key)
      }
    }
    
    for (const [key] of this.branchAccessCache) {
      if (key.includes(`:${userId}:`)) {
        keysToDelete.push(key)
      }
    }
    
    for (const [key] of this.resourceAccessCache) {
      if (key.includes(`:${userId}:`)) {
        keysToDelete.push(key)
      }
    }
    
    keysToDelete.forEach(key => {
      this.permissionCache.delete(key)
      this.branchAccessCache.delete(key)
      this.resourceAccessCache.delete(key)
    })
  }

  static clearAllCache(): void {
    this.permissionCache.clear()
    this.branchAccessCache.clear()
    this.roleHierarchyCache.clear()
    this.resourceAccessCache.clear()
  }
}

// Export convenience aliases and types
export const EnhancedRBAC = EnhancedRBACService
export type AccessLevel = EnhancedBranchAccessLevel
export type PermissionAction = string