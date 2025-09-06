import { EnhancedRBACService, EnhancedBranchAccessLevel, EnhancedRBACAccessLevel } from './rbac-enhanced'
import { db } from './db'

// ============================================================================
// RBAC Utility Functions
// ============================================================================

/**
 * Create a comprehensive permission check object
 */
export function createPermissionCheck(
  resource: string,
  action: string,
  options: {
    resourceId?: string
    field?: string
    conditions?: Record<string, any>
    requireExact?: boolean
  } = {}
) {
  return {
    resource,
    action,
    ...options
  }
}

/**
 * Common permission checks for education agency system
 */
export const PermissionChecks = {
  // Student permissions
  STUDENT_READ: () => createPermissionCheck('students', 'read'),
  STUDENT_CREATE: () => createPermissionCheck('students', 'create'),
  STUDENT_UPDATE: () => createPermissionCheck('students', 'update'),
  STUDENT_DELETE: () => createPermissionCheck('students', 'delete'),
  STUDENT_MANAGE: () => createPermissionCheck('students', 'manage'),
  
  // Application permissions
  APPLICATION_READ: () => createPermissionCheck('applications', 'read'),
  APPLICATION_CREATE: () => createPermissionCheck('applications', 'create'),
  APPLICATION_UPDATE: () => createPermissionCheck('applications', 'update'),
  APPLICATION_DELETE: () => createPermissionCheck('applications', 'delete'),
  APPLICATION_MANAGE: () => createPermissionCheck('applications', 'manage'),
  
  // User permissions
  USER_READ: () => createPermissionCheck('users', 'read'),
  USER_CREATE: () => createPermissionCheck('users', 'create'),
  USER_UPDATE: () => createPermissionCheck('users', 'update'),
  USER_DELETE: () => createPermissionCheck('users', 'delete'),
  USER_MANAGE: () => createPermissionCheck('users', 'manage'),
  
  // Branch permissions
  BRANCH_READ: () => createPermissionCheck('branches', 'read'),
  BRANCH_CREATE: () => createPermissionCheck('branches', 'create'),
  BRANCH_UPDATE: () => createPermissionCheck('branches', 'update'),
  BRANCH_DELETE: () => createPermissionCheck('branches', 'delete'),
  BRANCH_MANAGE: () => createPermissionCheck('branches', 'manage'),
  
  // Role permissions
  ROLE_READ: () => createPermissionCheck('roles', 'read'),
  ROLE_CREATE: () => createPermissionCheck('roles', 'create'),
  ROLE_UPDATE: () => createPermissionCheck('roles', 'update'),
  ROLE_DELETE: () => createPermissionCheck('roles', 'delete'),
  ROLE_MANAGE: () => createPermissionCheck('roles', 'manage'),
  
  // Permission permissions
  PERMISSION_READ: () => createPermissionCheck('permissions', 'read'),
  PERMISSION_GRANT: () => createPermissionCheck('permissions', 'grant'),
  PERMISSION_REVOKE: () => createPermissionCheck('permissions', 'revoke'),
  PERMISSION_MANAGE: () => createPermissionCheck('permissions', 'manage'),
  
  // Agency permissions
  AGENCY_READ: () => createPermissionCheck('agency', 'read'),
  AGENCY_UPDATE: () => createPermissionCheck('agency', 'update'),
  AGENCY_MANAGE: () => createPermissionCheck('agency', 'manage'),
  
  // System permissions
  SYSTEM_READ: () => createPermissionCheck('system', 'read'),
  SYSTEM_MANAGE: () => createPermissionCheck('system', 'manage'),
  SYSTEM_ADMIN: () => createPermissionCheck('system', 'admin'),
  
  // Field-level permissions
  STUDENT_FINANCIAL_READ: () => createPermissionCheck('students', 'read', { field: 'financial' }),
  STUDENT_CONTACT_READ: () => createPermissionCheck('students', 'read', { field: 'contact' }),
  STUDENT_ACADEMIC_READ: () => createPermissionCheck('students', 'read', { field: 'academic' }),
  
  APPLICATION_FINANCIAL_READ: () => createPermissionCheck('applications', 'read', { field: 'financial' }),
  APPLICATION_PERSONAL_READ: () => createPermissionCheck('applications', 'read', { field: 'personal' }),
  APPLICATION_DOCUMENTS_READ: () => createPermissionCheck('applications', 'read', { field: 'documents' }),
}

/**
 * Branch access level utility functions
 */
export const BranchAccessUtils = {
  /**
   * Check if user has at least the specified branch access level
   */
  async hasMinimumAccessLevel(userId: string, minimumLevel: EnhancedBranchAccessLevel): Promise<boolean> {
    const branchAccess = await EnhancedRBACService.getBranchAccessWithHierarchy(userId)
    const levels = Object.values(EnhancedBranchAccessLevel)
    const currentIndex = levels.indexOf(branchAccess.level)
    const minimumIndex = levels.indexOf(minimumLevel)
    return currentIndex >= minimumIndex
  },

  /**
   * Check if user can access a specific branch
   */
  async canAccessBranch(userId: string, branchId: string): Promise<boolean> {
    const branchAccess = await EnhancedRBACService.getBranchAccessWithHierarchy(userId)
    return branchAccess.accessibleBranches.includes(branchId)
  },

  /**
   * Check if user can manage a specific branch
   */
  async canManageBranch(userId: string, branchId: string): Promise<boolean> {
    const branchAccess = await EnhancedRBACService.getBranchAccessWithHierarchy(userId)
    return branchAccess.managedBranches.includes(branchId)
  },

  /**
   * Get all branches user can access
   */
  async getAccessibleBranches(userId: string): Promise<string[]> {
    const branchAccess = await EnhancedRBACService.getBranchAccessWithHierarchy(userId)
    return branchAccess.accessibleBranches
  },

  /**
   * Get all branches user can manage
   */
  async getManagedBranches(userId: string): Promise<string[]> {
    const branchAccess = await EnhancedRBACService.getBranchAccessWithHierarchy(userId)
    return branchAccess.managedBranches
  },

  /**
   * Check if user has agency-wide access
   */
  async hasAgencyAccess(userId: string): Promise<boolean> {
    const branchAccess = await EnhancedRBACService.getBranchAccessWithHierarchy(userId)
    return branchAccess.level === EnhancedBranchAccessLevel.AGENCY || 
           branchAccess.level === EnhancedBranchAccessLevel.GLOBAL
  },

  /**
   * Check if user has global access
   */
  async hasGlobalAccess(userId: string): Promise<boolean> {
    const branchAccess = await EnhancedRBACService.getBranchAccessWithHierarchy(userId)
    return branchAccess.level === EnhancedBranchAccessLevel.GLOBAL
  },
}

/**
 * Permission utility functions
 */
export const PermissionUtils = {
  /**
   * Check if user has a specific permission
   */
  async hasPermission(userId: string, resource: string, action: string, options: {
    resourceId?: string
    field?: string
    conditions?: Record<string, any>
  } = {}): Promise<boolean> {
    const decision = await EnhancedRBACService.checkPermission(userId, {
      resource,
      action,
      ...options
    })
    return decision.allowed
  },

  /**
   * Check if user has all specified permissions
   */
  async hasAllPermissions(userId: string, permissions: Array<{
    resource: string
    action: string
    resourceId?: string
    field?: string
    conditions?: Record<string, any>
  }>): Promise<boolean> {
    const decisions = await EnhancedRBACService.checkPermissions(userId, permissions)
    return decisions.every(decision => decision.allowed)
  },

  /**
   * Check if user has any of the specified permissions
   */
  async hasAnyPermission(userId: string, permissions: Array<{
    resource: string
    action: string
    resourceId?: string
    field?: string
    conditions?: Record<string, any>
  }>): Promise<boolean> {
    const decisions = await EnhancedRBACService.checkPermissions(userId, permissions)
    return decisions.some(decision => decision.allowed)
  },

  /**
   * Grant a permission to a user
   */
  async grantPermission(userId: string, permission: {
    permissionId: string
    accessLevel: EnhancedRBACAccessLevel
    conditions?: Record<string, any>
    expiresAt?: Date
    scope?: 'GLOBAL' | 'AGENCY' | 'BRANCH'
    branchId?: string
  }, grantedBy: string): Promise<void> {
    return await EnhancedRBACService.grantPermission(userId, {
      ...permission,
      grantedBy
    })
  },

  /**
   * Revoke a permission from a user
   */
  async revokePermission(userId: string, permissionId: string, revokedBy: string, reason?: string): Promise<void> {
    return await EnhancedRBACService.revokePermission(userId, {
      permissionId,
      revokedBy,
      reason
    })
  },

  /**
   * Get user's effective permissions for a resource
   */
  async getEffectivePermissions(userId: string, resource: string): Promise<string[]> {
    const actions = ['create', 'read', 'update', 'delete', 'manage']
    const effectivePermissions: string[] = []

    for (const action of actions) {
      const hasAccess = await this.hasPermission(userId, resource, action)
      if (hasAccess) {
        effectivePermissions.push(action)
      }
    }

    return effectivePermissions
  },
}

/**
 * Data filtering utility functions
 */
export const DataFilterUtils = {
  /**
   * Apply branch-based filtering to a database query
   */
  async applyBranchFilter(userId: string, resourceType: string, baseWhere: any = {}, options: {
    action?: string
    includeAssigned?: boolean
    includeChildren?: boolean
    fieldLevel?: boolean
  } = {}) {
    return await EnhancedRBACService.applyBranchFilter(userId, resourceType, baseWhere, options)
  },

  /**
   * Get filtered data for a specific resource type
   */
  async getFilteredData(userId: string, resourceType: string, options: {
    action?: string
    includeAssigned?: boolean
    includeChildren?: boolean
    fieldLevel?: boolean
    baseWhere?: any
  } = {}) {
    const where = await this.applyBranchFilter(userId, resourceType, options.baseWhere || {}, options)
    
    switch (resourceType) {
      case 'students':
        return await db.student.findMany({ where })
      case 'applications':
        return await db.application.findMany({ where })
      case 'users':
        return await db.user.findMany({ where })
      case 'branches':
        return await db.branch.findMany({ where })
      case 'tasks':
        return await db.task.findMany({ where })
      case 'documents':
        return await db.document.findMany({ where })
      default:
        throw new Error(`Unsupported resource type: ${resourceType}`)
    }
  },

  /**
   * Count filtered records for a specific resource type
   */
  async countFilteredData(userId: string, resourceType: string, options: {
    action?: string
    includeAssigned?: boolean
    includeChildren?: boolean
    fieldLevel?: boolean
    baseWhere?: any
  } = {}) {
    const where = await this.applyBranchFilter(userId, resourceType, options.baseWhere || {}, options)
    
    switch (resourceType) {
      case 'students':
        return await db.student.count({ where })
      case 'applications':
        return await db.application.count({ where })
      case 'users':
        return await db.user.count({ where })
      case 'branches':
        return await db.branch.count({ where })
      case 'tasks':
        return await db.task.count({ where })
      case 'documents':
        return await db.document.count({ where })
      default:
        throw new Error(`Unsupported resource type: ${resourceType}`)
    }
  },
}

/**
 * Audit and logging utility functions
 */
export const AuditUtils = {
  /**
   * Get permission history for a user
   */
  async getPermissionHistory(userId: string, options: {
    eventType?: string
    startDate?: Date
    endDate?: Date
    limit?: number
    offset?: number
  } = {}) {
    return await EnhancedRBACService.getPermissionHistory(userId, options)
  },

  /**
   * Get recent access attempts for a user
   */
  async getRecentAccessAttempts(userId: string, limit: number = 50) {
    return await EnhancedRBACService.getPermissionHistory(userId, {
      eventType: 'ACCESS_GRANTED',
      limit
    })
  },

  /**
   * Get permission denial history for a user
   */
  async getPermissionDenials(userId: string, limit: number = 50) {
    return await EnhancedRBACService.getPermissionHistory(userId, {
      eventType: 'ACCESS_DENIED',
      limit
    })
  },

  /**
   * Get permission grant history for a user
   */
  async getPermissionGrants(userId: string, limit: number = 50) {
    return await EnhancedRBACService.getPermissionHistory(userId, {
      eventType: 'PERMISSION_GRANTED',
      limit
    })
  },

  /**
   * Get permission revocation history for a user
   */
  async getPermissionRevocations(userId: string, limit: number = 50) {
    return await EnhancedRBACService.getPermissionHistory(userId, {
      eventType: 'PERMISSION_REVOKED',
      limit
    })
  },
}

/**
 * Cache management utility functions
 */
export const CacheUtils = {
  /**
   * Clear cache for a specific user
   */
  clearUserCache(userId: string): void {
    EnhancedRBACService.clearUserCache(userId)
  },

  /**
   * Clear all cache
   */
  clearAllCache(): void {
    EnhancedRBACService.clearAllCache()
  },

  /**
   * Clear cache for multiple users
   */
  clearUsersCache(userIds: string[]): void {
    userIds.forEach(userId => this.clearUserCache(userId))
  },

  /**
   * Clear cache for a specific resource type
   */
  async clearResourceCache(resourceType: string): Promise<void> {
    // This would need to be implemented in the EnhancedRBACService
    // For now, we'll clear all cache
    this.clearAllCache()
  },
}

/**
 * Role and permission setup utilities
 */
export const SetupUtils = {
  /**
   * Create a basic role with standard permissions
   */
  async createBasicRole(data: {
    agencyId: string
    name: string
    description?: string
    slug: string
    scope: 'GLOBAL' | 'AGENCY' | 'BRANCH'
    branchId?: string
    permissions: Array<{
      resource: string
      action: string
      accessLevel: EnhancedRBACAccessLevel
    }>
  }) {
    // First, create the role
    const role = await db.role.create({
      data: {
        agencyId: data.agencyId,
        name: data.name,
        description: data.description,
        slug: data.slug,
        scope: data.scope,
        branchId: data.branchId
      }
    })

    // Get permission IDs for the specified permissions
    const permissionPromises = data.permissions.map(async (perm) => {
      return await db.permission.findFirst({
        where: {
          resource: perm.resource,
          action: perm.action
        }
      })
    })

    const permissions = await Promise.all(permissionPromises)
    const validPermissions = permissions.filter(p => p !== null)

    // Create role permissions
    await Promise.all(validPermissions.map((permission, index) => {
      if (permission) {
        return db.rolePermission.create({
          data: {
            roleId: role.id,
            permissionId: permission.id,
            accessLevel: data.permissions[index].accessLevel as any,
            agencyId: data.agencyId,
            branchId: data.branchId
          }
        })
      }
    }))

    return role
  },

  /**
   * Setup default roles for a new agency
   */
  async setupDefaultAgencyRoles(agencyId: string) {
    const defaultRoles = [
      {
        name: 'Agency Admin',
        slug: 'agency-admin',
        description: 'Full access to agency resources',
        scope: 'AGENCY' as const,
        permissions: [
          { resource: 'students', action: 'manage', accessLevel: EnhancedRBACAccessLevel.FULL },
          { resource: 'applications', action: 'manage', accessLevel: EnhancedRBACAccessLevel.FULL },
          { resource: 'users', action: 'manage', accessLevel: EnhancedRBACAccessLevel.FULL },
          { resource: 'branches', action: 'manage', accessLevel: EnhancedRBACAccessLevel.FULL },
          { resource: 'roles', action: 'manage', accessLevel: EnhancedRBACAccessLevel.FULL },
          { resource: 'permissions', action: 'manage', accessLevel: EnhancedRBACAccessLevel.FULL },
        ]
      },
      {
        name: 'Branch Manager',
        slug: 'branch-manager',
        description: 'Manage specific branch and its resources',
        scope: 'BRANCH' as const,
        permissions: [
          { resource: 'students', action: 'manage', accessLevel: EnhancedRBACAccessLevel.FULL },
          { resource: 'applications', action: 'manage', accessLevel: EnhancedRBACAccessLevel.FULL },
          { resource: 'users', action: 'read', accessLevel: EnhancedRBACAccessLevel.VIEW },
          { resource: 'users', action: 'create', accessLevel: EnhancedRBACAccessLevel.EDIT },
          { resource: 'tasks', action: 'manage', accessLevel: EnhancedRBACAccessLevel.FULL },
        ]
      },
      {
        name: 'Consultant',
        slug: 'consultant',
        description: 'Access to assigned students and applications',
        scope: 'BRANCH' as const,
        permissions: [
          { resource: 'students', action: 'read', accessLevel: EnhancedRBACAccessLevel.VIEW },
          { resource: 'students', action: 'update', accessLevel: EnhancedRBACAccessLevel.EDIT },
          { resource: 'applications', action: 'read', accessLevel: EnhancedRBACAccessLevel.VIEW },
          { resource: 'applications', action: 'update', accessLevel: EnhancedRBACAccessLevel.EDIT },
          { resource: 'tasks', action: 'manage', accessLevel: EnhancedRBACAccessLevel.FULL },
        ]
      },
      {
        name: 'Viewer',
        slug: 'viewer',
        description: 'Read-only access to resources',
        scope: 'BRANCH' as const,
        permissions: [
          { resource: 'students', action: 'read', accessLevel: EnhancedRBACAccessLevel.VIEW },
          { resource: 'applications', action: 'read', accessLevel: EnhancedRBACAccessLevel.VIEW },
          { resource: 'users', action: 'read', accessLevel: EnhancedRBACAccessLevel.VIEW },
          { resource: 'tasks', action: 'read', accessLevel: EnhancedRBACAccessLevel.VIEW },
        ]
      }
    ]

    const createdRoles = await Promise.all(
      defaultRoles.map(role => this.createBasicRole({ ...role, agencyId }))
    )

    return createdRoles
  },

  /**
   * Assign a role to a user
   */
  async assignRoleToUser(userId: string, roleId: string, assignedBy: string, options: {
    expiresAt?: Date
    branchId?: string
  } = {}) {
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      throw new Error('User not found')
    }

    const role = await db.role.findUnique({ where: { id: roleId } })
    if (!role) {
      throw new Error('Role not found')
    }

    return await db.userRoleAssignment.create({
      data: {
        userId,
        roleId,
        assignedBy,
        expiresAt: options.expiresAt,
        agencyId: user.agencyId || role.agencyId,
        branchId: options.branchId || role.branchId
      }
    })
  },
}

/**
 * Validation utility functions
 */
export const ValidationUtils = {
  /**
   * Validate that a user has access to a specific resource
   */
  async validateResourceAccess(userId: string, resourceType: string, resourceId: string, action: string = 'read'): Promise<{
    valid: boolean
    reason?: string
    accessLevel?: EnhancedRBACAccessLevel
  }> {
    try {
      const decision = await EnhancedRBACService.checkPermission(userId, {
        resource: resourceType,
        action,
        resourceId
      })

      return {
        valid: decision.allowed,
        reason: decision.reason,
        accessLevel: decision.accessLevel
      }
    } catch (error) {
      return {
        valid: false,
        reason: 'Validation error'
      }
    }
  },

  /**
   * Validate that a user can perform an action on a resource
   */
  async validateAction(userId: string, resourceType: string, action: string, options: {
    resourceId?: string
    field?: string
    conditions?: Record<string, any>
  } = {}): Promise<{
    valid: boolean
    reason?: string
    accessLevel?: EnhancedRBACAccessLevel
  }> {
    try {
      const decision = await EnhancedRBACService.checkPermission(userId, {
        resource: resourceType,
        action,
        ...options
      })

      return {
        valid: decision.allowed,
        reason: decision.reason,
        accessLevel: decision.accessLevel
      }
    } catch (error) {
      return {
        valid: false,
        reason: 'Validation error'
      }
    }
  },

  /**
   * Validate branch access for a user
   */
  async validateBranchAccess(userId: string, branchId: string, requiredAccess: 'view' | 'manage' = 'view'): Promise<{
    valid: boolean
    reason?: string
    accessLevel?: EnhancedBranchAccessLevel
  }> {
    try {
      const branchAccess = await EnhancedRBACService.getBranchAccessWithHierarchy(userId)
      
      if (requiredAccess === 'view') {
        const canView = branchAccess.accessibleBranches.includes(branchId)
        return {
          valid: canView,
          reason: canView ? undefined : 'No view access to branch',
          accessLevel: branchAccess.level
        }
      } else if (requiredAccess === 'manage') {
        const canManage = branchAccess.managedBranches.includes(branchId)
        return {
          valid: canManage,
          reason: canManage ? undefined : 'No management access to branch',
          accessLevel: branchAccess.level
        }
      }

      return {
        valid: false,
        reason: 'Invalid access type specified'
      }
    } catch (error) {
      return {
        valid: false,
        reason: 'Validation error'
      }
    }
  },
}

// Export all utilities as a single object for convenience
export const RBAC = {
  permissions: PermissionChecks,
  branchAccess: BranchAccessUtils,
  permission: PermissionUtils,
  dataFilter: DataFilterUtils,
  audit: AuditUtils,
  cache: CacheUtils,
  setup: SetupUtils,
  validation: ValidationUtils,
  service: EnhancedRBACService,
}