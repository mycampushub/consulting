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
// Core Types and Interfaces
// ============================================================================

export enum BranchAccessLevel {
  GLOBAL = 'global',      // Super Admin: All agencies and branches
  AGENCY = 'agency',      // Agency Admin: All branches in agency
  BRANCH = 'branch',      // Branch Manager: Specific branch + children
  ASSIGNED = 'assigned',  // Consultant: Assigned resources + own branch  
  OWN = 'own'            // Standard User: Only own branch and resources
}

export interface PermissionCheck {
  resource: string        // e.g., 'students', 'users', 'applications'
  action: string          // e.g., 'create', 'read', 'update', 'delete'
  resourceId?: string     // Specific resource instance
  conditions?: Record<string, any>
}

export interface AccessDecision {
  allowed: boolean
  reason?: string
  accessLevel?: BranchAccessLevel
  accessibleBranches?: string[]
  dataFilters?: Record<string, any>
  fieldPermissions?: string[]
}

export interface RBACContext {
  userId: string
  agencyId?: string
  branchId?: string
  ipAddress?: string
  userAgent?: string
  resource?: string
  action?: string
  resourceId?: string
}

export interface BranchAccessInfo {
  level: BranchAccessLevel
  accessibleBranches: string[]
  managedBranches: string[]
  ownBranch?: string
  canAccessAllAgencyBranches: boolean
}

// ============================================================================
// Unified RBAC Service
// ============================================================================

export class UnifiedRBAC {
  private static permissionCache = new Map<string, { decision: AccessDecision; expires: number }>()
  private static branchAccessCache = new Map<string, { access: BranchAccessInfo; expires: number }>()
  private static CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  /**
   * Main permission check method - SIMPLIFIED FOR DEVELOPMENT
   */
  static async checkPermission(
    userId: string,
    permission: PermissionCheck,
    context?: Partial<RBACContext>
  ): Promise<AccessDecision> {
    try {
      // TEMPORARY: Grant all permissions for demo user
      if (userId === 'demo-user-id') {
        return {
          allowed: true,
          reason: 'Demo user has full access',
          accessLevel: BranchAccessLevel.AGENCY,
          accessibleBranches: ['demo-branch-id']
        }
      }

      const cacheKey = this.getPermissionCacheKey(userId, permission, context)
      const cached = this.permissionCache.get(cacheKey)
      
      if (cached && cached.expires > Date.now()) {
        return cached.decision
      }

      const decision = await this.performPermissionCheck(userId, permission, context)
      
      // Cache the decision
      this.permissionCache.set(cacheKey, {
        decision,
        expires: Date.now() + this.CACHE_TTL
      })

      return decision
    } catch (error) {
      console.error('UnifiedRBAC checkPermission error:', error)
      // Fallback: allow access for development
      return { 
        allowed: true, 
        reason: 'Development mode - access granted',
        accessLevel: BranchAccessLevel.AGENCY,
        accessibleBranches: ['demo-branch-id']
      }
    }
  }

  /**
   * Get branch access information for a user - SIMPLIFIED FOR DEVELOPMENT
   */
  static async getBranchAccess(userId: string, resourceType?: string): Promise<BranchAccessInfo> {
    try {
      // TEMPORARY: Return demo branch access for demo user
      if (userId === 'demo-user-id') {
        return {
          level: BranchAccessLevel.AGENCY,
          accessibleBranches: ['demo-branch-id'],
          managedBranches: ['demo-branch-id'],
          ownBranch: 'demo-branch-id',
          canAccessAllAgencyBranches: true
        }
      }

      const cacheKey = `branch_access:${userId}:${resourceType || 'default'}`
      const cached = this.branchAccessCache.get(cacheKey)
      
      if (cached && cached.expires > Date.now()) {
        return cached.access
      }

      const access = await this.calculateBranchAccess(userId, resourceType)
      
      // Cache the access info
      this.branchAccessCache.set(cacheKey, {
        access,
        expires: Date.now() + this.CACHE_TTL
      })

      return access
    } catch (error) {
      console.error('UnifiedRBAC getBranchAccess error:', error)
      // Fallback: return basic access for development
      return {
        level: BranchAccessLevel.AGENCY,
        accessibleBranches: ['demo-branch-id'],
        managedBranches: ['demo-branch-id'],
        ownBranch: 'demo-branch-id',
        canAccessAllAgencyBranches: true
      }
    }
  }

  /**
   * Apply branch-based filtering to database queries
   */
  static async applyBranchFilter(
    userId: string,
    baseWhere: any = {},
    options: {
      resourceType: string
      action?: string
      includeAssigned?: boolean
    } = { resourceType: 'general' }
  ): Promise<any> {
    try {
      const branchAccess = await this.getBranchAccess(userId, options.resourceType)
      
      if (branchAccess.accessibleBranches.length === 0) {
        return { ...baseWhere, id: 'none' } // No access
      }

      const enhancedWhere = { ...baseWhere }

      switch (options.resourceType) {
        case 'students':
          if (options.includeAssigned) {
            enhancedWhere.OR = [
              { branchId: { in: branchAccess.accessibleBranches } },
              { assignedTo: userId }
            ]
          } else {
            enhancedWhere.branchId = { in: branchAccess.accessibleBranches }
          }
          break

        case 'applications':
          if (options.includeAssigned) {
            enhancedWhere.OR = [
              { branchId: { in: branchAccess.accessibleBranches } },
              { student: { assignedTo: userId } }
            ]
          } else {
            enhancedWhere.branchId = { in: branchAccess.accessibleBranches }
          }
          break

        case 'tasks':
          if (options.includeAssigned) {
            enhancedWhere.OR = [
              { branchId: { in: branchAccess.accessibleBranches } },
              { assignedTo: userId },
              { createdById: userId }
            ]
          } else {
            enhancedWhere.branchId = { in: branchAccess.accessibleBranches }
          }
          break

        case 'users':
          enhancedWhere.OR = [
            { branchId: { in: branchAccess.accessibleBranches } },
            { id: userId } // Users can always see themselves
          ]
          break

        case 'documents':
          enhancedWhere.OR = [
            { branchId: { in: branchAccess.accessibleBranches } },
            { uploadedById: userId }
          ]
          break

        default:
          enhancedWhere.branchId = { in: branchAccess.accessibleBranches }
          break
      }

      return enhancedWhere
    } catch (error) {
      console.error('UnifiedRBAC applyBranchFilter error:', error)
      return baseWhere
    }
  }

  /**
   * Check if user can access a specific resource
   */
  static async canAccessResource(
    userId: string,
    resourceType: string,
    resourceId: string,
    action: string = 'read'
  ): Promise<{ allowed: boolean; reason?: string }> {
    try {
      // Get resource branch information
      const resourceBranchId = await this.getResourceBranchId(resourceType, resourceId)
      
      if (!resourceBranchId) {
        return { allowed: false, reason: 'Resource not found' }
      }

      // Check if user can access this branch
      const branchAccess = await this.getBranchAccess(userId, resourceType)
      const canAccessBranch = branchAccess.accessibleBranches.includes(resourceBranchId)

      if (!canAccessBranch) {
        return { allowed: false, reason: 'Branch access denied' }
      }

      // Check specific permission
      const permissionCheck = await this.checkPermission(userId, {
        resource: resourceType,
        action,
        resourceId
      })

      return {
        allowed: permissionCheck.allowed,
        reason: permissionCheck.reason
      }
    } catch (error) {
      console.error('UnifiedRBAC canAccessResource error:', error)
      return { allowed: false, reason: 'Internal server error' }
    }
  }

  // ============================================================================
  // Private Implementation Methods
  // ============================================================================

  private static async performPermissionCheck(
    userId: string,
    permission: PermissionCheck,
    context?: Partial<RBACContext>
  ): Promise<AccessDecision> {
    // Get user with all necessary relations
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        agency: true,
        branch: true,
        managedBranches: true,
        roleAssignments: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: { permission: true }
                },
                parent: true
              }
            }
          },
          where: { isActive: true }
        },
        userPermissions: {
          include: { permission: true },
          where: { isActive: true }
        }
      }
    })

    if (!user || user.status !== 'ACTIVE') {
      return { allowed: false, reason: 'User not found or inactive' }
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

    // Get branch access info
    const branchAccess = await this.getBranchAccess(userId, permission.resource)

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
          accessLevel: branchAccess.level,
          accessibleBranches: branchAccess.accessibleBranches,
          reason: 'User-specific permission granted'
        }
      }
    }

    // Check role-based permissions
    for (const userRole of user.roleAssignments) {
      const role = userRole.role
      if (!role.isActive) continue

      // Check role scope
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
          return {
            allowed: true,
            accessLevel: branchAccess.level,
            accessibleBranches: branchAccess.accessibleBranches,
            reason: `Role '${role.name}' permission granted`
          }
        }
      }

      // Check inherited permissions from parent roles
      if (role.parent) {
        const inheritedPermission = await this.checkInheritedRolePermissions(
          role.parent, permission, fullContext, branchAccess
        )
        if (inheritedPermission.allowed) {
          return inheritedPermission
        }
      }
    }

    // Default deny
    return {
      allowed: false,
      accessLevel: branchAccess.level,
      accessibleBranches: branchAccess.accessibleBranches,
      reason: 'Insufficient permissions'
    }
  }

  private static async calculateBranchAccess(userId: string, resourceType?: string): Promise<BranchAccessInfo> {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        agency: true,
        branch: true,
        managedBranches: true,
        roleAssignments: {
          include: { role: true },
          where: { isActive: true }
        }
      }
    })

    if (!user) {
      return {
        level: BranchAccessLevel.OWN,
        accessibleBranches: [],
        managedBranches: [],
        canAccessAllAgencyBranches: false
      }
    }

    // Super Admin - Global Access
    if (user.role === 'SUPER_ADMIN') {
      const allBranches = await db.branch.findMany({
        select: { id: true }
      })
      return {
        level: BranchAccessLevel.GLOBAL,
        accessibleBranches: allBranches.map(b => b.id),
        managedBranches: allBranches.map(b => b.id),
        canAccessAllAgencyBranches: true
      }
    }

    // Agency Admin - Agency Access
    if (user.role === 'AGENCY_ADMIN') {
      const agencyBranches = await db.branch.findMany({
        where: { agencyId: user.agencyId },
        select: { id: true }
      })
      return {
        level: BranchAccessLevel.AGENCY,
        accessibleBranches: agencyBranches.map(b => b.id),
        managedBranches: agencyBranches.map(b => b.id),
        canAccessAllAgencyBranches: true
      }
    }

    const accessibleBranches = new Set<string>()
    const managedBranches = new Set<string>()

    // Add user's own branch
    if (user.branchId) {
      accessibleBranches.add(user.branchId)
    }

    // Add managed branches
    user.managedBranches.forEach(branch => {
      accessibleBranches.add(branch.id)
      managedBranches.add(branch.id)
    })

    // Check role-based branch access
    for (const userRole of user.roleAssignments) {
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
        if (user.role === 'BRANCH_MANAGER') {
          managedBranches.add(role.branchId)
        }
      }
    }

    // Determine access level based on accessible branches
    let level = BranchAccessLevel.OWN
    if (managedBranches.size > 0 || user.role === 'BRANCH_MANAGER') {
      level = BranchAccessLevel.BRANCH
    } else if (accessibleBranches.size > 1) {
      level = BranchAccessLevel.ASSIGNED
    }

    return {
      level,
      accessibleBranches: Array.from(accessibleBranches),
      managedBranches: Array.from(managedBranches),
      ownBranch: user.branchId,
      canAccessAllAgencyBranches: false
    }
  }

  private static async checkInheritedRolePermissions(
    role: Role,
    permission: PermissionCheck,
    context: RBACContext,
    branchAccess: BranchAccessInfo
  ): Promise<AccessDecision> {
    if (!role.isActive) return { allowed: false }

    // Check role scope
    if (role.scope === 'BRANCH' && role.branchId && !branchAccess.accessibleBranches.includes(role.branchId)) {
      return { allowed: false }
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
        return {
          allowed: true,
          accessLevel: branchAccess.level,
          accessibleBranches: branchAccess.accessibleBranches,
          reason: `Inherited from role '${role.name}'`
        }
      }
    }

    // Check parent role recursively
    if (role.parent) {
      return await this.checkInheritedRolePermissions(role.parent, permission, context, branchAccess)
    }

    return { allowed: false }
  }

  private static async getResourceBranchId(resourceType: string, resourceId: string): Promise<string | null> {
    try {
      switch (resourceType) {
        case 'student':
          const student = await db.student.findUnique({
            where: { id: resourceId },
            select: { branchId: true }
          })
          return student?.branchId || null

        case 'user':
          const user = await db.user.findUnique({
            where: { id: resourceId },
            select: { branchId: true }
          })
          return user?.branchId || null

        case 'application':
          const application = await db.application.findUnique({
            where: { id: resourceId },
            select: { branchId: true }
          })
          return application?.branchId || null

        case 'branch':
          return resourceId // Branch resource ID is the branch ID itself

        case 'task':
          const task = await db.task.findUnique({
            where: { id: resourceId },
            select: { branchId: true }
          })
          return task?.branchId || null

        case 'document':
          const document = await db.document.findUnique({
            where: { id: resourceId },
            select: { branchId: true }
          })
          return document?.branchId || null

        default:
          return null
      }
    } catch (error) {
      console.error('Error getting resource branch ID:', error)
      return null
    }
  }

  private static async evaluateConditions(
    conditions: Record<string, any>,
    context: RBACContext
  ): Promise<boolean> {
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
        case 'branch_access_level':
          const branchAccess = await this.getBranchAccess(context.userId)
          if (!branchAccess.accessibleBranches.includes(value)) return false
          break
        // Add more condition types as needed
      }
    }
    return true
  }

  private static getPermissionCacheKey(
    userId: string,
    permission: PermissionCheck,
    context?: Partial<RBACContext>
  ): string {
    const contextStr = context ? JSON.stringify(context) : ''
    return `${userId}:${permission.resource}:${permission.action}:${permission.resourceId || ''}:${contextStr}`
  }

  /**
   * Clear cache for a specific user
   */
  static clearUserCache(userId: string): void {
    const keysToDelete: string[] = []
    
    for (const [key] of this.permissionCache) {
      if (key.startsWith(userId + ':')) {
        keysToDelete.push(key)
      }
    }
    
    for (const [key] of this.branchAccessCache) {
      if (key.includes(userId)) {
        keysToDelete.push(key)
      }
    }
    
    keysToDelete.forEach(key => {
      this.permissionCache.delete(key)
      this.branchAccessCache.delete(key)
    })
  }

  /**
   * Clear all cache
   */
  static clearAllCache(): void {
    this.permissionCache.clear()
    this.branchAccessCache.clear()
  }
}