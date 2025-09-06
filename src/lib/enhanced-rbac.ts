import { db } from './db'
import { RBACService, type RBACContext, type PermissionCheck, type AccessDecision } from './rbac'

export interface EnhancedRBACContext extends RBACContext {
  userRole?: string
  userBranchId?: string
  userAgencyId?: string
  resourceType?: string
  additionalConditions?: Record<string, any>
}

export interface BranchAccessRule {
  resourceType: string
  action: string
  scope: 'AGENCY' | 'BRANCH' | 'OWN' | 'ASSIGNED'
  conditions?: Record<string, any>
}

export class EnhancedRBAC {
  /**
   * Comprehensive permission check with branch-based scoping
   */
  static async checkPermissionWithBranch(
    userId: string,
    permission: PermissionCheck,
    context?: Partial<EnhancedRBACContext>
  ): Promise<AccessDecision & {
    accessibleBranches?: string[]
        appliedRules?: string[]
        branchScope?: string
  }> {
    try {
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
                  }
                }
              }
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
      const enhancedContext: EnhancedRBACContext = {
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
        additionalConditions: context?.additionalConditions
      }

      // Check basic RBAC permission first
      const basicDecision = await RBACService.checkPermission(userId, permission, context)
      if (!basicDecision.allowed) {
        return { ...basicDecision, accessibleBranches: [] }
      }

      // Apply branch-based scoping
      const branchAccess = await this.applyBranchScoping(user, permission, enhancedContext)
      
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
          ...enhancedContext.additionalConditions
        }
      })

      return {
        ...branchAccess,
        accessibleBranches: branchAccess.accessibleBranches || []
      }
    } catch (error) {
      console.error('Enhanced RBAC checkPermission error:', error)
      return { allowed: false, reason: 'Internal server error' }
    }
  }

  /**
   * Apply branch-based scoping rules
   */
  private static async applyBranchScoping(
    user: any,
    permission: PermissionCheck,
    context: EnhancedRBACContext
  ): Promise<AccessDecision & {
    accessibleBranches?: string[]
    appliedRules?: string[]
    branchScope?: string
  }> {
    // Define branch access rules for different resource types
    const branchRules: BranchAccessRule[] = this.getBranchAccessRules(permission.resource, permission.action)

    for (const rule of branchRules) {
      const ruleResult = await this.evaluateBranchRule(user, rule, context)
      if (ruleResult.allowed) {
        return {
          allowed: true,
          reason: ruleResult.reason,
          accessibleBranches: ruleResult.accessibleBranches,
          appliedRules: [rule.resourceType + ':' + rule.action],
          branchScope: rule.scope
        }
      }
    }

    // Default fallback: user can only access their own branch
    const ownBranches = user.branchId ? [user.branchId] : []
    return {
      allowed: ownBranches.length > 0,
      reason: ownBranches.length > 0 ? 'Own branch access granted' : 'No branch access',
      accessibleBranches: ownBranches,
      branchScope: 'OWN'
    }
  }

  /**
   * Get branch access rules for resource type and action
   */
  private static getBranchAccessRules(resource: string, action: string): BranchAccessRule[] {
    const rules: BranchAccessRule[] = []

    // Super admin and agency admin rules
    switch (resource) {
      case 'users':
        rules.push({
          resourceType: 'users',
          action,
          scope: 'AGENCY',
          conditions: { userRole: ['AGENCY_ADMIN', 'SUPER_ADMIN'] }
        })
        break

      case 'students':
        rules.push({
          resourceType: 'students',
          action,
          scope: 'AGENCY',
          conditions: { userRole: ['AGENCY_ADMIN', 'SUPER_ADMIN'] }
        })
        rules.push({
          resourceType: 'students',
          action,
          scope: 'ASSIGNED',
          conditions: { userRole: ['CONSULTANT', 'SUPPORT'] }
        })
        break

      case 'branches':
        rules.push({
          resourceType: 'branches',
          action,
          scope: 'AGENCY',
          conditions: { userRole: ['AGENCY_ADMIN', 'SUPER_ADMIN'] }
        })
        break

      case 'applications':
        rules.push({
          resourceType: 'applications',
          action,
          scope: 'AGENCY',
          conditions: { userRole: ['AGENCY_ADMIN', 'SUPER_ADMIN'] }
        })
        rules.push({
          resourceType: 'applications',
          action,
          scope: 'ASSIGNED',
          conditions: { userRole: ['CONSULTANT', 'SUPPORT'] }
        })
        break

      case 'invoices':
      case 'transactions':
        rules.push({
          resourceType: resource,
          action,
          scope: 'AGENCY',
          conditions: { userRole: ['AGENCY_ADMIN', 'SUPER_ADMIN'] }
        })
        rules.push({
          resourceType: resource,
          action,
          scope: 'BRANCH',
          conditions: { userRole: ['CONSULTANT', 'SUPPORT'] }
        })
        break

      case 'tasks':
        rules.push({
          resourceType: 'tasks',
          action,
          scope: 'AGENCY',
          conditions: { userRole: ['AGENCY_ADMIN', 'SUPER_ADMIN'] }
        })
        rules.push({
          resourceType: 'tasks',
          action,
          scope: 'ASSIGNED',
          conditions: { userRole: ['CONSULTANT', 'SUPPORT'] }
        })
        break

      case 'documents':
        rules.push({
          resourceType: 'documents',
          action,
          scope: 'AGENCY',
          conditions: { userRole: ['AGENCY_ADMIN', 'SUPER_ADMIN'] }
        })
        rules.push({
          resourceType: 'documents',
          action,
          scope: 'BRANCH',
          conditions: { userRole: ['CONSULTANT', 'SUPPORT'] }
        })
        break

      case 'events':
      case 'appointments':
        rules.push({
          resourceType: resource,
          action,
          scope: 'AGENCY',
          conditions: { userRole: ['AGENCY_ADMIN', 'SUPER_ADMIN'] }
        })
        rules.push({
          resourceType: resource,
          action,
          scope: 'BRANCH',
          conditions: { userRole: ['CONSULTANT', 'SUPPORT'] }
        })
        break

      // Add more resource types as needed
      default:
        rules.push({
          resourceType: resource,
          action,
          scope: 'AGENCY',
          conditions: { userRole: ['AGENCY_ADMIN', 'SUPER_ADMIN'] }
        })
    }

    return rules
  }

  /**
   * Evaluate a single branch access rule
   */
  private static async evaluateBranchRule(
    user: any,
    rule: BranchAccessRule,
    context: EnhancedRBACContext
  ): Promise<AccessDecision & {
    accessibleBranches?: string[]
    branchScope?: string
  }> {
    // Check user role conditions
    if (rule.conditions?.userRole && !rule.conditions.userRole.includes(user.role)) {
      return { allowed: false, reason: 'User role does not match rule conditions' }
    }

    // Get accessible branches based on rule scope
    let accessibleBranches: string[] = []

    switch (rule.scope) {
      case 'AGENCY':
        // Agency-wide access
        if (user.role === 'SUPER_ADMIN' || user.role === 'AGENCY_ADMIN') {
          const agencyBranches = await db.branch.findMany({
            where: { agencyId: user.agencyId },
            select: { id: true }
          })
          accessibleBranches = agencyBranches.map(b => b.id)
        }
        break

      case 'BRANCH':
        // Branch-level access
        accessibleBranches = await RBACService.getAccessibleBranches(user.id)
        break

      case 'OWN':
        // Own branch only
        if (user.branchId) {
          accessibleBranches = [user.branchId]
        }
        break

      case 'ASSIGNED':
        // Assigned resources only
        accessibleBranches = user.branchId ? [user.branchId] : []
        // Additional filtering for assigned resources would be applied at the query level
        break
    }

    // Check additional conditions
    if (rule.conditions && Object.keys(rule.conditions).length > 0) {
      const conditionsMet = await this.evaluateAdditionalConditions(rule.conditions, context)
      if (!conditionsMet) {
        return { allowed: false, reason: 'Additional conditions not met' }
      }
    }

    return {
      allowed: accessibleBranches.length > 0,
      reason: accessibleBranches.length > 0 ? `${rule.scope} scope access granted` : 'No accessible branches',
      accessibleBranches,
      branchScope: rule.scope
    }
  }

  /**
   * Evaluate additional conditions
   */
  private static async evaluateAdditionalConditions(
    conditions: Record<string, any>,
    context: EnhancedRBACContext
  ): Promise<boolean> {
    for (const [key, value] of Object.entries(conditions)) {
      if (key === 'userRole') {
        if (!value.includes(context.userRole)) {
          return false
        }
      }
      // Add more condition types as needed
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
      resourceType?: string
      action?: string
      scope?: 'AGENCY' | 'BRANCH' | 'OWN' | 'ASSIGNED'
      includeAssigned?: boolean
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

      // Get branch access decision
      const accessDecision = await this.checkPermissionWithBranch(userId, {
        resource: options.resourceType || 'general',
        action: options.action || 'read'
      }, {
        resourceType: options.resourceType
      })

      if (!accessDecision.allowed || !accessDecision.accessibleBranches) {
        return { ...baseWhere, id: 'none' } // No access
      }

      const accessibleBranches = accessDecision.accessibleBranches

      // Apply branch filtering based on scope
      let filteredWhere = { ...baseWhere }

      if (options.scope === 'OWN' || accessDecision.branchScope === 'OWN') {
        // Own branch only
        if (user.branchId) {
          filteredWhere.branchId = user.branchId
        } else {
          filteredWhere.id = 'none'
        }
      } else if (options.scope === 'ASSIGNED' || accessDecision.branchScope === 'ASSIGNED') {
        // Assigned resources - this would need resource-specific logic
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

      return filteredWhere
    } catch (error) {
      console.error('Enhanced RBAC applyBranchFilter error:', error)
      return baseWhere
    }
  }

  /**
   * Get comprehensive user access information
   */
  static async getUserAccessInfo(userId: string): Promise<{
    user: any
    accessibleBranches: string[]
    permissions: string[]
    roles: string[]
    branchScope: 'AGENCY' | 'BRANCH' | 'OWN'
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
                  }
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

      // Determine user's branch scope
      let branchScope: 'AGENCY' | 'BRANCH' | 'OWN' = 'OWN'
      if (user.role === 'SUPER_ADMIN' || user.role === 'AGENCY_ADMIN') {
        branchScope = 'AGENCY'
      } else if (accessibleBranches.length > 1) {
        branchScope = 'BRANCH'
      }

      // Get applicable access rules
      const accessRules: BranchAccessRule[] = []
      for (const permission of permissions) {
        const rules = this.getBranchAccessRules(permission.resource, permission.action)
        accessRules.push(...rules)
      }

      return {
        user,
        accessibleBranches,
        permissions: permissions.map(p => p.slug),
        roles,
        branchScope,
        accessRules
      }
    } catch (error) {
      console.error('Enhanced RBAC getUserAccessInfo error:', error)
      throw error
    }
  }

  /**
   * Check if user can access a specific resource instance
   */
  static async canAccessResource(
    userId: string,
    resourceType: string,
    resourceId: string,
    action: string = 'read'
  ): Promise<{ allowed: boolean; reason?: string; accessibleBranches?: string[] }> {
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

        case 'invoice':
          const invoice = await db.invoice.findUnique({
            where: { id: resourceId },
            select: { agencyId: true }
          })
          resourceAgencyId = invoice?.agencyId || null
          // Invoices might not have branchId directly, but we can infer from related entities
          if (invoice?.studentId) {
            const student = await db.student.findUnique({
              where: { id: invoice.studentId },
              select: { branchId: true }
            })
            resourceBranchId = student?.branchId || null
          }
          break

        case 'event':
          const event = await db.event.findUnique({
            where: { id: resourceId },
            select: { agencyId: true }
          })
          resourceAgencyId = event?.agencyId || null
          // Events might not have branchId directly
          break

        case 'appointment':
          const appointment = await db.appointment.findUnique({
            where: { id: resourceId },
            select: { agencyId: true }
          })
          resourceAgencyId = appointment?.agencyId || null
          // Appointments might not have branchId directly
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

      // Use enhanced RBAC to check permission with branch scoping
      const accessDecision = await this.checkPermissionWithBranch(userId, {
        resource: resourceType,
        action,
        resourceId
      }, {
        resourceType
      })

      // If resource has a branch, check if it's in accessible branches
      if (resourceBranchId && accessDecision.accessibleBranches) {
        if (!accessDecision.accessibleBranches.includes(resourceBranchId)) {
          return {
            allowed: false,
            reason: 'Resource branch not accessible',
            accessibleBranches: accessDecision.accessibleBranches
          }
        }
      }

      return {
        allowed: accessDecision.allowed,
        reason: accessDecision.reason,
        accessibleBranches: accessDecision.accessibleBranches
      }
    } catch (error) {
      console.error('Enhanced RBAC canAccessResource error:', error)
      return { allowed: false, reason: 'Internal server error' }
    }
  }
}