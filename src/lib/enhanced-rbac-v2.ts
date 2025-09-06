import { db } from './db'
import { RBACService, type RBACContext, type PermissionCheck, type AccessDecision } from './rbac'

export interface EnhancedRBACv2Context extends RBACContext {
  userRole?: string
  userBranchId?: string
  userAgencyId?: string
  resourceType?: string
  action?: string
  additionalConditions?: Record<string, any>
  requestMethod?: string
  requestPath?: string
}

export interface BranchAccessRule {
  resourceType: string
  action: string
  scope: 'GLOBAL' | 'AGENCY' | 'BRANCH' | 'OWN' | 'ASSIGNED' | 'DEPARTMENT'
  conditions?: Record<string, any>
  inheritFromParent?: boolean
  cascadeToChildren?: boolean
}

export interface ResourceAccessPolicy {
  resourceType: string
  resourceActions: string[]
  defaultScope: 'AGENCY' | 'BRANCH' | 'OWN'
  roleBasedScopes: Record<string, 'GLOBAL' | 'AGENCY' | 'BRANCH' | 'OWN' | 'ASSIGNED'>
  fieldLevelPermissions?: Record<string, string[]> // Fields that require specific permissions
  dataFilters?: Record<string, any> // Additional data filtering rules
}

export class EnhancedRBACv2 {
  private static resourcePolicies: Map<string, ResourceAccessPolicy> = new Map()
  private static branchAccessRules: Map<string, BranchAccessRule[]> = new Map()

  /**
   * Initialize the enhanced RBAC system with default policies
   */
  static async initialize() {
    await this.loadDefaultResourcePolicies()
    await this.loadDefaultBranchRules()
  }

  /**
   * Load default resource access policies
   */
  private static async loadDefaultResourcePolicies() {
    const policies: ResourceAccessPolicy[] = [
      {
        resourceType: 'users',
        resourceActions: ['create', 'read', 'update', 'delete', 'manage'],
        defaultScope: 'AGENCY',
        roleBasedScopes: {
          'SUPER_ADMIN': 'GLOBAL',
          'AGENCY_ADMIN': 'AGENCY',
          'BRANCH_MANAGER': 'BRANCH',
          'CONSULTANT': 'OWN',
          'SUPPORT': 'BRANCH'
        },
        fieldLevelPermissions: {
          'sensitive': ['read_sensitive_user_data'],
          'financial': ['read_financial_data']
        }
      },
      {
        resourceType: 'students',
        resourceActions: ['create', 'read', 'update', 'delete', 'manage', 'assign'],
        defaultScope: 'BRANCH',
        roleBasedScopes: {
          'SUPER_ADMIN': 'GLOBAL',
          'AGENCY_ADMIN': 'AGENCY',
          'BRANCH_MANAGER': 'BRANCH',
          'CONSULTANT': 'ASSIGNED',
          'SUPPORT': 'BRANCH'
        },
        fieldLevelPermissions: {
          'personal': ['read_personal_data'],
          'financial': ['read_financial_data'],
          'academic': ['read_academic_data']
        }
      },
      {
        resourceType: 'branches',
        resourceActions: ['create', 'read', 'update', 'delete', 'manage'],
        defaultScope: 'AGENCY',
        roleBasedScopes: {
          'SUPER_ADMIN': 'GLOBAL',
          'AGENCY_ADMIN': 'AGENCY',
          'BRANCH_MANAGER': 'OWN',
          'CONSULTANT': 'BRANCH',
          'SUPPORT': 'BRANCH'
        }
      },
      {
        resourceType: 'applications',
        resourceActions: ['create', 'read', 'update', 'delete', 'manage', 'approve', 'reject'],
        defaultScope: 'BRANCH',
        roleBasedScopes: {
          'SUPER_ADMIN': 'GLOBAL',
          'AGENCY_ADMIN': 'AGENCY',
          'BRANCH_MANAGER': 'BRANCH',
          'CONSULTANT': 'ASSIGNED',
          'SUPPORT': 'BRANCH'
        }
      },
      {
        resourceType: 'tasks',
        resourceActions: ['create', 'read', 'update', 'delete', 'assign', 'complete'],
        defaultScope: 'ASSIGNED',
        roleBasedScopes: {
          'SUPER_ADMIN': 'GLOBAL',
          'AGENCY_ADMIN': 'AGENCY',
          'BRANCH_MANAGER': 'BRANCH',
          'CONSULTANT': 'ASSIGNED',
          'SUPPORT': 'BRANCH'
        }
      },
      {
        resourceType: 'documents',
        resourceActions: ['create', 'read', 'update', 'delete', 'share', 'download'],
        defaultScope: 'BRANCH',
        roleBasedScopes: {
          'SUPER_ADMIN': 'GLOBAL',
          'AGENCY_ADMIN': 'AGENCY',
          'BRANCH_MANAGER': 'BRANCH',
          'CONSULTANT': 'ASSIGNED',
          'SUPPORT': 'BRANCH'
        }
      },
      {
        resourceType: 'invoices',
        resourceActions: ['create', 'read', 'update', 'delete', 'manage', 'approve'],
        defaultScope: 'AGENCY',
        roleBasedScopes: {
          'SUPER_ADMIN': 'GLOBAL',
          'AGENCY_ADMIN': 'AGENCY',
          'BRANCH_MANAGER': 'BRANCH',
          'CONSULTANT': 'BRANCH',
          'SUPPORT': 'BRANCH'
        },
        fieldLevelPermissions: {
          'financial': ['read_financial_data', 'manage_financial_data']
        }
      },
      {
        resourceType: 'workflows',
        resourceActions: ['create', 'read', 'update', 'delete', 'execute', 'manage'],
        defaultScope: 'AGENCY',
        roleBasedScopes: {
          'SUPER_ADMIN': 'GLOBAL',
          'AGENCY_ADMIN': 'AGENCY',
          'BRANCH_MANAGER': 'BRANCH',
          'CONSULTANT': 'BRANCH',
          'SUPPORT': 'BRANCH'
        }
      },
      {
        resourceType: 'reports',
        resourceActions: ['create', 'read', 'update', 'delete', 'generate', 'export'],
        defaultScope: 'AGENCY',
        roleBasedScopes: {
          'SUPER_ADMIN': 'GLOBAL',
          'AGENCY_ADMIN': 'AGENCY',
          'BRANCH_MANAGER': 'BRANCH',
          'CONSULTANT': 'BRANCH',
          'SUPPORT': 'BRANCH'
        }
      },
      {
        resourceType: 'communications',
        resourceActions: ['create', 'read', 'update', 'delete', 'send', 'manage'],
        defaultScope: 'BRANCH',
        roleBasedScopes: {
          'SUPER_ADMIN': 'GLOBAL',
          'AGENCY_ADMIN': 'AGENCY',
          'BRANCH_MANAGER': 'BRANCH',
          'CONSULTANT': 'ASSIGNED',
          'SUPPORT': 'BRANCH'
        }
      }
    ]

    policies.forEach(policy => {
      this.resourcePolicies.set(policy.resourceType, policy)
    })
  }

  /**
   * Load default branch access rules
   */
  private static async loadDefaultBranchRules() {
    const rules: BranchAccessRule[] = [
      {
        resourceType: 'users',
        action: 'create',
        scope: 'AGENCY',
        conditions: { userRole: ['AGENCY_ADMIN', 'SUPER_ADMIN'] }
      },
      {
        resourceType: 'users',
        action: 'read',
        scope: 'AGENCY',
        conditions: { userRole: ['AGENCY_ADMIN', 'SUPER_ADMIN'] }
      },
      {
        resourceType: 'users',
        action: 'update',
        scope: 'BRANCH',
        conditions: { userRole: ['BRANCH_MANAGER', 'AGENCY_ADMIN', 'SUPER_ADMIN'] }
      },
      {
        resourceType: 'students',
        action: 'create',
        scope: 'BRANCH',
        conditions: { userRole: ['AGENCY_ADMIN', 'SUPER_ADMIN', 'BRANCH_MANAGER', 'CONSULTANT'] }
      },
      {
        resourceType: 'students',
        action: 'read',
        scope: 'ASSIGNED',
        conditions: { userRole: ['CONSULTANT', 'SUPPORT'] }
      },
      {
        resourceType: 'students',
        action: 'assign',
        scope: 'BRANCH',
        conditions: { userRole: ['AGENCY_ADMIN', 'SUPER_ADMIN', 'BRANCH_MANAGER'] }
      },
      {
        resourceType: 'branches',
        action: 'create',
        scope: 'AGENCY',
        conditions: { userRole: ['AGENCY_ADMIN', 'SUPER_ADMIN'] }
      },
      {
        resourceType: 'branches',
        action: 'manage',
        scope: 'AGENCY',
        conditions: { userRole: ['AGENCY_ADMIN', 'SUPER_ADMIN'] }
      },
      {
        resourceType: 'applications',
        action: 'approve',
        scope: 'BRANCH',
        conditions: { userRole: ['AGENCY_ADMIN', 'SUPER_ADMIN', 'BRANCH_MANAGER'] }
      },
      {
        resourceType: 'invoices',
        action: 'approve',
        scope: 'AGENCY',
        conditions: { userRole: ['AGENCY_ADMIN', 'SUPER_ADMIN'] }
      }
    ]

    rules.forEach(rule => {
      const key = `${rule.resourceType}:${rule.action}`
      if (!this.branchAccessRules.has(key)) {
        this.branchAccessRules.set(key, [])
      }
      this.branchAccessRules.get(key)!.push(rule)
    })
  }

  /**
   * Comprehensive permission check with enhanced branch-based scoping
   */
  static async checkPermissionEnhanced(
    userId: string,
    permission: PermissionCheck,
    context?: Partial<EnhancedRBACv2Context>
  ): Promise<AccessDecision & {
    accessibleBranches?: string[]
    appliedRules?: string[]
    branchScope?: string
    resourcePolicy?: ResourceAccessPolicy
    fieldPermissions?: string[]
    dataFilters?: Record<string, any>
  }> {
    try {
      // Initialize if not already done
      if (this.resourcePolicies.size === 0) {
        await this.initialize()
      }

      // Get user with full context
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
                  parent: true
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
          }
        }
      })

      if (!user) {
        return { allowed: false, reason: 'User not found' }
      }

      if (user.status !== 'ACTIVE') {
        return { allowed: false, reason: 'User account is not active' }
      }

      // Build enhanced context
      const enhancedContext: EnhancedRBACv2Context = {
        userId,
        agencyId: user.agencyId || context?.agencyId,
        branchId: user.branchId || context?.branchId,
        userRole: user.role,
        userBranchId: user.branchId,
        userAgencyId: user.agencyId,
        resource: permission.resource,
        action: permission.action,
        resourceId: permission.resourceId,
        resourceType: context?.resourceType || permission.resource,
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
        requestMethod: context?.requestMethod,
        requestPath: context?.requestPath,
        additionalConditions: context?.additionalConditions
      }

      // Check basic RBAC permission first
      const basicDecision = await RBACService.checkPermission(userId, permission, context)
      if (!basicDecision.allowed) {
        return { 
          ...basicDecision, 
          accessibleBranches: [],
          reason: `Basic RBAC check failed: ${basicDecision.reason}`
        }
      }

      // Get resource policy
      const resourcePolicy = this.resourcePolicies.get(permission.resource) || {
        resourceType: permission.resource,
        resourceActions: [permission.action],
        defaultScope: 'OWN',
        roleBasedScopes: {}
      }

      // Apply enhanced branch-based scoping
      const branchAccess = await this.applyEnhancedBranchScoping(user, permission, enhancedContext, resourcePolicy)
      
      // Get field-level permissions
      const fieldPermissions = this.getFieldLevelPermissions(user, permission, resourcePolicy)

      // Get data filters
      const dataFilters = await this.getDataFilters(user, permission, enhancedContext, resourcePolicy)

      // Log enhanced access check
      await RBACService.logAccess({
        userId: user.id,
        agencyId: user.agencyId,
        resource: permission.resource,
        action: permission.action,
        resourceId: permission.resourceId,
        result: branchAccess.allowed ? 'ALLOWED' : 'DENIED',
        reason: branchAccess.reason,
        ipAddress: enhancedContext.ipAddress,
        userAgent: enhancedContext.userAgent,
        context: {
          branchScope: branchAccess.branchScope,
          accessibleBranches: branchAccess.accessibleBranches,
          appliedRules: branchAccess.appliedRules,
          userRole: user.role,
          resourcePolicy: resourcePolicy.resourceType,
          fieldPermissions,
          dataFilters,
          ...enhancedContext.additionalConditions
        }
      })

      return {
        ...branchAccess,
        accessibleBranches: branchAccess.accessibleBranches || [],
        resourcePolicy,
        fieldPermissions,
        dataFilters
      }
    } catch (error) {
      console.error('Enhanced RBAC v2 checkPermission error:', error)
      return { allowed: false, reason: 'Internal server error' }
    }
  }

  /**
   * Apply enhanced branch-based scoping with resource policies
   */
  private static async applyEnhancedBranchScoping(
    user: any,
    permission: PermissionCheck,
    context: EnhancedRBACv2Context,
    resourcePolicy: ResourceAccessPolicy
  ): Promise<AccessDecision & {
    accessibleBranches?: string[]
    appliedRules?: string[]
    branchScope?: string
  }> {
    // Get user's effective role (consider role hierarchy)
    const effectiveRoles = await this.getEffectiveRoles(user)
    
    // Determine scope based on user role and resource policy
    let effectiveScope: 'GLOBAL' | 'AGENCY' | 'BRANCH' | 'OWN' | 'ASSIGNED' = 'OWN'
    
    for (const role of effectiveRoles) {
      const policyScope = resourcePolicy.roleBasedScopes[role] || resourcePolicy.defaultScope
      if (this.isHigherScope(policyScope, effectiveScope)) {
        effectiveScope = policyScope
      }
    }

    // Get accessible branches based on scope
    const accessibleBranches = await this.getAccessibleBranchesForScope(user, effectiveScope, permission)

    // Apply additional branch access rules
    const branchRules = this.branchAccessRules.get(`${permission.resource}:${permission.action}`) || []
    let appliedRules: string[] = []

    for (const rule of branchRules) {
      if (await this.evaluateBranchRule(user, rule, context)) {
        appliedRules.push(`${rule.resourceType}:${rule.action}:${rule.scope}`)
        
        // If rule has a more restrictive scope, apply it
        if (this.isHigherScope(rule.scope, effectiveScope)) {
          effectiveScope = rule.scope
          const ruleAccessibleBranches = await this.getAccessibleBranchesForScope(user, rule.scope, permission)
          // Intersection of accessible branches
          const intersection = accessibleBranches.filter(branch => ruleAccessibleBranches.includes(branch))
          accessibleBranches.splice(0, accessibleBranches.length, ...intersection)
        }
      }
    }

    // Check if user has access to any branches
    const hasAccess = accessibleBranches.length > 0

    return {
      allowed: hasAccess,
      reason: hasAccess ? `${effectiveScope} scope access granted` : 'No accessible branches',
      accessibleBranches,
      appliedRules,
      branchScope: effectiveScope
    }
  }

  /**
   * Get effective roles considering hierarchy
   */
  private static async getEffectiveRoles(user: any): Promise<string[]> {
    const roles = new Set<string>()
    
    // Add direct role
    if (user.role) {
      roles.add(user.role)
    }

    // Add roles from role assignments
    for (const userRole of user.userRoles) {
      roles.add(userRole.role.slug)
      
      // Add parent roles recursively
      let currentRole = userRole.role
      while (currentRole.parent) {
        roles.add(currentRole.parent.slug)
        currentRole = currentRole.parent
      }
    }

    return Array.from(roles)
  }

  /**
   * Check if scope A is higher than scope B
   */
  private static isHigherScope(scopeA: string, scopeB: string): boolean {
    const scopeHierarchy = {
      'GLOBAL': 5,
      'AGENCY': 4,
      'BRANCH': 3,
      'ASSIGNED': 2,
      'OWN': 1
    }
    
    return (scopeHierarchy[scopeA as keyof typeof scopeHierarchy] || 0) > 
           (scopeHierarchy[scopeB as keyof typeof scopeHierarchy] || 0)
  }

  /**
   * Get accessible branches for a given scope
   */
  private static async getAccessibleBranchesForScope(
    user: any, 
    scope: string, 
    permission: PermissionCheck
  ): Promise<string[]> {
    switch (scope) {
      case 'GLOBAL':
        // Super admin access to all branches
        if (user.role === 'SUPER_ADMIN') {
          const allBranches = await db.branch.findMany({
            select: { id: true }
          })
          return allBranches.map(b => b.id)
        }
        return []

      case 'AGENCY':
        // Agency-wide access
        if (user.role === 'SUPER_ADMIN' || user.role === 'AGENCY_ADMIN') {
          const agencyBranches = await db.branch.findMany({
            where: { agencyId: user.agencyId },
            select: { id: true }
          })
          return agencyBranches.map(b => b.id)
        }
        return []

      case 'BRANCH':
        // Branch-level access (user's branch + managed branches)
        const branchBranches = await RBACService.getAccessibleBranches(user.id)
        return branchBranches

      case 'ASSIGNED':
        // Assigned resources only (user's branch)
        if (user.branchId) {
          return [user.branchId]
        }
        return []

      case 'OWN':
        // Own resources only (user's branch)
        if (user.branchId) {
          return [user.branchId]
        }
        return []

      default:
        return []
    }
  }

  /**
   * Evaluate branch rule conditions
   */
  private static async evaluateBranchRule(
    user: any,
    rule: BranchAccessRule,
    context: EnhancedRBACv2Context
  ): Promise<boolean> {
    // Check user role conditions
    if (rule.conditions?.userRole && !rule.conditions.userRole.includes(user.role)) {
      return false
    }

    // Check additional conditions
    if (rule.conditions && Object.keys(rule.conditions).length > 0) {
      return await this.evaluateEnhancedConditions(rule.conditions, context)
    }

    return true
  }

  /**
   * Evaluate enhanced conditions
   */
  private static async evaluateEnhancedConditions(
    conditions: Record<string, any>,
    context: EnhancedRBACv2Context
  ): Promise<boolean> {
    for (const [key, value] of Object.entries(conditions)) {
      switch (key) {
        case 'userRole':
          if (!value.includes(context.userRole)) return false
          break
        case 'agencyId':
          if (context.agencyId !== value) return false
          break
        case 'branchId':
          if (context.branchId !== value) return false
          break
        case 'requestMethod':
          if (context.requestMethod !== value) return false
          break
        case 'requestPath':
          if (!context.requestPath?.includes(value)) return false
          break
        // Add more condition types as needed
      }
    }
    return true
  }

  /**
   * Get field-level permissions
   */
  private static getFieldLevelPermissions(
    user: any,
    permission: PermissionCheck,
    resourcePolicy: ResourceAccessPolicy
  ): string[] {
    const fieldPermissions: string[] = []

    if (resourcePolicy.fieldLevelPermissions) {
      for (const [fieldType, requiredPermissions] of Object.entries(resourcePolicy.fieldLevelPermissions)) {
        // Check if user has any of the required permissions
        const hasPermission = requiredPermissions.some(permSlug => {
          return user.userPermissions.some((up: any) => 
            up.permission.slug === permSlug && up.isActive
          ) || user.userRoles.some((ur: any) =>
            ur.role.rolePermissions.some((rp: any) =>
              rp.permission.slug === permSlug && rp.isActive
            )
          )
        })

        if (hasPermission) {
          fieldPermissions.push(fieldType)
        }
      }
    }

    return fieldPermissions
  }

  /**
   * Get data filters for the resource
   */
  private static async getDataFilters(
    user: any,
    permission: PermissionCheck,
    context: EnhancedRBACv2Context,
    resourcePolicy: ResourceAccessPolicy
  ): Promise<Record<string, any>> {
    const filters: Record<string, any> = {}

    // Apply resource-specific data filters
    if (resourcePolicy.dataFilters) {
      Object.assign(filters, resourcePolicy.dataFilters)
    }

    // Add user-specific filters
    if (permission.resource === 'students') {
      // For students, filter by assigned consultant if applicable
      if (user.role === 'CONSULTANT') {
        filters.assignedTo = user.id
      }
    }

    if (permission.resource === 'tasks') {
      // For tasks, filter by assigned user or creator
      if (user.role === 'CONSULTANT' || user.role === 'SUPPORT') {
        filters.OR = [
          { assignedTo: user.id },
          { createdById: user.id }
        ]
      }
    }

    return filters
  }

  /**
   * Apply enhanced branch-based filtering to database queries
   */
  static async applyEnhancedBranchFilter(
    userId: string,
    baseWhere: any = {},
    options: {
      resourceType?: string
      action?: string
      scope?: 'GLOBAL' | 'AGENCY' | 'BRANCH' | 'OWN' | 'ASSIGNED'
      includeAssigned?: boolean
      additionalFilters?: Record<string, any>
    } = {}
  ): Promise<any> {
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        include: {
          agency: true,
          branch: true,
          managedBranches: true
        }
      })

      if (!user) return baseWhere

      // Get enhanced access decision
      const accessDecision = await this.checkPermissionEnhanced(userId, {
        resource: options.resourceType || 'general',
        action: options.action || 'read'
      }, {
        resourceType: options.resourceType
      })

      if (!accessDecision.allowed || !accessDecision.accessibleBranches) {
        return { ...baseWhere, id: 'none' } // No access
      }

      const accessibleBranches = accessDecision.accessibleBranches
      let filteredWhere = { ...baseWhere, ...options.additionalFilters }

      // Apply branch filtering based on scope
      const effectiveScope = options.scope || accessDecision.branchScope || 'OWN'

      if (effectiveScope === 'GLOBAL' && user.role === 'SUPER_ADMIN') {
        // Global access - no branch filtering needed
        return filteredWhere
      }

      if (effectiveScope === 'OWN' || effectiveScope === 'ASSIGNED') {
        // Own or assigned resources
        if (user.branchId) {
          filteredWhere.branchId = user.branchId
          if (options.includeAssigned) {
            filteredWhere.OR = [
              { branchId: user.branchId },
              { assignedTo: user.id }
            ]
          }
        } else {
          filteredWhere.id = 'none'
        }
      } else {
        // AGENCY or BRANCH scope - use accessible branches
        if (accessibleBranches.length > 0) {
          filteredWhere.branchId = { in: accessibleBranches }
        } else {
          filteredWhere.id = 'none'
        }
      }

      // Apply data filters from access decision
      if (accessDecision.dataFilters && Object.keys(accessDecision.dataFilters).length > 0) {
        filteredWhere = { ...filteredWhere, ...accessDecision.dataFilters }
      }

      return filteredWhere
    } catch (error) {
      console.error('Enhanced RBAC v2 applyBranchFilter error:', error)
      return baseWhere
    }
  }

  /**
   * Get comprehensive user access information
   */
  static async getUserAccessInfoV2(userId: string): Promise<{
    user: any
    accessibleBranches: string[]
    permissions: string[]
    roles: string[]
    effectiveRoles: string[]
    branchScope: 'GLOBAL' | 'AGENCY' | 'BRANCH' | 'OWN' | 'ASSIGNED'
    resourcePolicies: ResourceAccessPolicy[]
    fieldPermissions: Record<string, string[]>
    accessRules: BranchAccessRule[]
  }> {
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
                  parent: true
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
          }
        }
      })

      if (!user) {
        throw new Error('User not found')
      }

      const accessibleBranches = await RBACService.getAccessibleBranches(userId)
      const permissions = await RBACService.getUserPermissions(userId)
      const roles = user.userRoles.map(ur => ur.role.slug)
      const effectiveRoles = await this.getEffectiveRoles(user)

      // Determine user's branch scope
      let branchScope: 'GLOBAL' | 'AGENCY' | 'BRANCH' | 'OWN' | 'ASSIGNED' = 'OWN'
      if (user.role === 'SUPER_ADMIN') {
        branchScope = 'GLOBAL'
      } else if (user.role === 'AGENCY_ADMIN') {
        branchScope = 'AGENCY'
      } else if (accessibleBranches.length > 1) {
        branchScope = 'BRANCH'
      }

      // Get field permissions for all resource types
      const fieldPermissions: Record<string, string[]> = {}
      for (const [resourceType, policy] of this.resourcePolicies) {
        fieldPermissions[resourceType] = this.getFieldLevelPermissions(user, {
          resource: resourceType,
          action: 'read'
        }, policy)
      }

      // Get all applicable access rules
      const accessRules: BranchAccessRule[] = []
      for (const permission of permissions) {
        const rules = this.branchAccessRules.get(`${permission.resource}:${permission.action}`) || []
        accessRules.push(...rules)
      }

      return {
        user,
        accessibleBranches,
        permissions: permissions.map(p => p.slug),
        roles,
        effectiveRoles,
        branchScope,
        resourcePolicies: Array.from(this.resourcePolicies.values()),
        fieldPermissions,
        accessRules
      }
    } catch (error) {
      console.error('Enhanced RBAC v2 getUserAccessInfo error:', error)
      throw error
    }
  }

  /**
   * Check if user can access a specific resource instance with enhanced validation
   */
  static async canAccessResourceV2(
    userId: string,
    resourceType: string,
    resourceId: string,
    action: string = 'read'
  ): Promise<{ 
    allowed: boolean; 
    reason?: string; 
    accessibleBranches?: string[];
    fieldPermissions?: string[];
    dataFilters?: Record<string, any>;
  }> {
    try {
      // Get the resource and its branch information
      let resourceBranchId: string | null = null
      let resourceAgencyId: string | null = null
      let additionalData: any = null

      switch (resourceType) {
        case 'student':
          const student = await db.student.findUnique({
            where: { id: resourceId },
            select: { branchId: true, agencyId: true, assignedTo: true }
          })
          resourceBranchId = student?.branchId || null
          resourceAgencyId = student?.agencyId || null
          additionalData = { assignedTo: student?.assignedTo }
          break

        case 'user':
          const userResource = await db.user.findUnique({
            where: { id: resourceId },
            select: { branchId: true, agencyId: true, role: true }
          })
          resourceBranchId = userResource?.branchId || null
          resourceAgencyId = userResource?.agencyId || null
          additionalData = { role: userResource?.role }
          break

        case 'application':
          const application = await db.application.findUnique({
            where: { id: resourceId },
            select: { branchId: true, agencyId: true, assignedTo: true }
          })
          resourceBranchId = application?.branchId || null
          resourceAgencyId = application?.agencyId || null
          additionalData = { assignedTo: application?.assignedTo }
          break

        case 'task':
          const task = await db.task.findUnique({
            where: { id: resourceId },
            select: { branchId: true, agencyId: true, assignedTo: true, createdById: true }
          })
          resourceBranchId = task?.branchId || null
          resourceAgencyId = task?.agencyId || null
          additionalData = { assignedTo: task?.assignedTo, createdById: task?.createdById }
          break

        case 'document':
          const document = await db.document.findUnique({
            where: { id: resourceId },
            select: { branchId: true, agencyId: true, createdById: true }
          })
          resourceBranchId = document?.branchId || null
          resourceAgencyId = document?.agencyId || null
          additionalData = { createdById: document?.createdById }
          break

        case 'branch':
          const branch = await db.branch.findUnique({
            where: { id: resourceId },
            select: { agencyId: true }
          })
          resourceBranchId = resourceId
          resourceAgencyId = branch?.agencyId || null
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

      // Get enhanced permission decision
      const permissionDecision = await this.checkPermissionEnhanced(userId, {
        resource: resourceType,
        action,
        resourceId
      }, {
        resourceType,
        additionalConditions: additionalData
      })

      if (!permissionDecision.allowed) {
        return permissionDecision
      }

      // Check if resource is in accessible branches
      if (resourceBranchId && permissionDecision.accessibleBranches) {
        const hasBranchAccess = permissionDecision.accessibleBranches.includes(resourceBranchId)
        if (!hasBranchAccess) {
          return {
            allowed: false,
            reason: 'Resource branch not accessible',
            accessibleBranches: permissionDecision.accessibleBranches
          }
        }
      }

      // Check additional resource-specific conditions
      if (additionalData && resourceType === 'tasks') {
        // For tasks, check if user is assigned or created the task
        const user = await db.user.findUnique({
          where: { id: userId },
          select: { role: true }
        })

        if (user?.role === 'CONSULTANT' || user?.role === 'SUPPORT') {
          const isAssignedOrCreator = additionalData.assignedTo === userId || additionalData.createdById === userId
          if (!isAssignedOrCreator) {
            return { allowed: false, reason: 'Not assigned to this task' }
          }
        }
      }

      return {
        allowed: true,
        accessibleBranches: permissionDecision.accessibleBranches,
        fieldPermissions: permissionDecision.fieldPermissions,
        dataFilters: permissionDecision.dataFilters
      }
    } catch (error) {
      console.error('Enhanced RBAC v2 canAccessResource error:', error)
      return { allowed: false, reason: 'Internal server error' }
    }
  }

  /**
   * Add custom resource policy
   */
  static addResourcePolicy(policy: ResourceAccessPolicy): void {
    this.resourcePolicies.set(policy.resourceType, policy)
  }

  /**
   * Add custom branch access rule
   */
  static addBranchAccessRule(rule: BranchAccessRule): void {
    const key = `${rule.resourceType}:${rule.action}`
    if (!this.branchAccessRules.has(key)) {
      this.branchAccessRules.set(key, [])
    }
    this.branchAccessRules.get(key)!.push(rule)
  }

  /**
   * Remove resource policy
   */
  static removeResourcePolicy(resourceType: string): boolean {
    return this.resourcePolicies.delete(resourceType)
  }

  /**
   * Remove branch access rule
   */
  static removeBranchAccessRule(resourceType: string, action: string, index?: number): boolean {
    const key = `${resourceType}:${action}`
    const rules = this.branchAccessRules.get(key)
    if (!rules) return false

    if (index !== undefined) {
      if (index >= 0 && index < rules.length) {
        rules.splice(index, 1)
        return true
      }
      return false
    } else {
      return this.branchAccessRules.delete(key)
    }
  }
}