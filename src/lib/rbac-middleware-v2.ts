import { NextRequest, NextResponse } from 'next/server'
import { EnhancedRBACServiceV2, EnhancedAccessLevel, type EnhancedRBACContext, type EnhancedPermissionCheck } from './rbac-enhanced-v2'
import { db } from './db'

// ============================================================================
// Enhanced Middleware Types v2
// ============================================================================

export interface RBACContextV2 {
  user: any
  agency: any
  branch?: any
  userContext: EnhancedRBACContext
  accessDecision: any
  requestMetadata?: {
    ip: string
    userAgent: string
    timestamp: Date
  }
  branchFilter?: any
}

export interface RBACMiddlewareOptionsV2 {
  permissions?: EnhancedPermissionCheck[]
  requireAuth?: boolean
  requireAgency?: boolean
  requireBranch?: boolean
  minAccessLevel?: EnhancedAccessLevel
  resourceType?: string
  action?: string
  enableDataFiltering?: boolean
  auditLevel?: 'NONE' | 'BASIC' | 'DETAILED'
  resourceId?: string
  requireOwnership?: boolean
  includeAssigned?: boolean
  includeOwned?: boolean
  branchScope?: 'GLOBAL' | 'AGENCY' | 'BRANCH' | 'OWN' | 'ASSIGNED'
  enableBranchHierarchy?: boolean
  enableCaching?: boolean
}

export type MiddlewareHandlerV2<T = any> = (request: NextRequest, context: RBACContextV2) => Promise<NextResponse>

// ============================================================================
// Enhanced RBAC Middleware v2
// ============================================================================

export class RBACMiddlewareV2 {
  private static requestCache = new Map<string, any>()
  private static cacheTTL = 60 * 1000 // 1 minute

  /**
   * Main enhanced RBAC middleware v2
   */
  static middleware(options: RBACMiddlewareOptionsV2 = {}) {
    return function <T extends MiddlewareHandlerV2>(handler: T) {
      return async (request: NextRequest, context: any = {}): Promise<NextResponse> => {
        try {
          const requestId = this.generateRequestId()
          
          // Extract authentication token
          const authResult = await this.authenticate(request)
          
          if (!authResult.success) {
            return authResult.response!
          }

          const { user, agency, branch } = authResult

          // Build request metadata
          const requestMetadata = {
            ip: this.getClientIP(request),
            userAgent: request.headers.get('user-agent') || '',
            timestamp: new Date()
          }

          // Get enhanced user context with caching
          const cacheKey = `user_context_${user.id}_${requestId}`
          let userContext: EnhancedRBACContext

          if (options.enableCaching !== false && this.requestCache.has(cacheKey)) {
            userContext = this.requestCache.get(cacheKey)
          } else {
            userContext = await EnhancedRBACServiceV2.getUserContext(user.id)
            if (options.enableCaching !== false) {
              this.requestCache.set(cacheKey, userContext)
            }
          }

          // Check agency requirement
          if (options.requireAgency && !agency) {
            return this.createErrorResponse('Agency context required', 403, {
              requestId,
              userContext,
              metadata: requestMetadata
            })
          }

          // Check branch requirement
          if (options.requireBranch && !branch) {
            return this.createErrorResponse('Branch context required', 403, {
              requestId,
              userContext,
              metadata: requestMetadata
            })
          }

          // Check minimum access level
          if (options.minAccessLevel) {
            const hasRequiredLevel = this.checkAccessLevel(userContext.accessLevel, options.minAccessLevel)
            if (!hasRequiredLevel) {
              return this.createErrorResponse(
                `Insufficient access level. Required: ${options.minAccessLevel}, Current: ${userContext.accessLevel}`,
                403,
                {
                  requestId,
                  userContext,
                  metadata: requestMetadata,
                  details: {
                    requiredLevel: options.minAccessLevel,
                    currentLevel: userContext.accessLevel
                  }
                }
              )
            }
          }

          // Check permissions if specified
          let accessDecision: any = { 
            allowed: true, 
            accessLevel: userContext.accessLevel,
            accessibleBranches: userContext.accessibleBranches 
          }
          
          if (options.permissions && options.permissions.length > 0) {
            // Check all permissions
            for (const permission of options.permissions) {
              const decision = await EnhancedRBACServiceV2.checkPermission(user.id, {
                ...permission,
                resourceId: options.resourceId || permission.resourceId,
                requireOwnership: options.requireOwnership || permission.requireOwnership,
                scope: options.branchScope || permission.scope
              }, userContext)

              if (!decision.allowed) {
                // Log permission denied
                await this.logActivity({
                  userId: user.id,
                  agencyId: agency?.id,
                  branchId: userContext.branchId,
                  action: 'PERMISSION_DENIED',
                  entityType: 'Authorization',
                  changes: JSON.stringify({
                    permissions: options.permissions,
                    reason: decision.reason,
                    requestMetadata,
                    userContext: {
                      accessLevel: userContext.accessLevel,
                      accessibleBranches: userContext.accessibleBranches,
                      managedBranches: userContext.managedBranches
                    }
                  }),
                  ipAddress: requestMetadata.ip,
                  userAgent: requestMetadata.userAgent,
                  requestId
                })

                return this.createErrorResponse(
                  'Insufficient permissions', 
                  403,
                  {
                    requestId,
                    userContext,
                    metadata: requestMetadata,
                    details: {
                      reason: decision.reason,
                      required: options.permissions,
                      currentAccessLevel: userContext.accessLevel,
                      accessibleBranches: userContext.accessibleBranches
                    }
                  }
                )
              }

              // Use the most permissive decision
              accessDecision = decision
            }
          }

          // Check resource-specific permission if specified
          if (options.resourceType && options.action) {
            const resourcePermission = await EnhancedRBACServiceV2.checkPermission(user.id, {
              resource: options.resourceType,
              action: options.action,
              resourceId: options.resourceId,
              requireOwnership: options.requireOwnership,
              scope: options.branchScope
            }, userContext)

            if (!resourcePermission.allowed) {
              return this.createErrorResponse(
                'Resource access denied', 
                403,
                {
                  requestId,
                  userContext,
                  metadata: requestMetadata,
                  details: {
                    reason: resourcePermission.reason,
                    resource: options.resourceType,
                    action: options.action
                  }
                }
              )
            }

            accessDecision = resourcePermission
          }

          // Apply branch filtering if enabled
          let branchFilter: any = undefined
          if (options.enableDataFiltering && options.resourceType) {
            branchFilter = await EnhancedRBACServiceV2.applyBranchFilter(user.id, {}, {
              resource: options.resourceType,
              action: options.action,
              includeAssigned: options.includeAssigned,
              includeOwned: options.includeOwned,
              scope: options.branchScope
            })
          }

          // Build RBAC context
          const rbacContext: RBACContextV2 = {
            user,
            agency,
            branch,
            userContext,
            accessDecision,
            requestMetadata,
            branchFilter
          }

          // Log successful access if audit level requires it
          if (options.auditLevel && options.auditLevel !== 'NONE') {
            await this.logActivity({
              userId: user.id,
              agencyId: agency?.id,
              branchId: userContext.branchId,
              action: 'API_ACCESS_GRANTED',
              entityType: 'Authorization',
              changes: JSON.stringify({
                permissions: options.permissions,
                resourceType: options.resourceType,
                action: options.action,
                accessLevel: userContext.accessLevel,
                accessibleBranches: userContext.accessibleBranches,
                requestMetadata,
                requestId
              }),
              ipAddress: requestMetadata.ip,
              userAgent: requestMetadata.userAgent,
              requestId
            })
          }

          // Call the original handler
          return await handler(request, rbacContext)

        } catch (error) {
          console.error('RBACMiddlewareV2 error:', error)
          
          // Log error
          await this.logActivity({
            userId: context.user?.id,
            agencyId: context.agency?.id,
            branchId: context.branch?.id,
            action: 'AUTH_ERROR',
            entityType: 'Authorization',
            changes: JSON.stringify({
              error: error instanceof Error ? error.message : 'Unknown error',
              options,
              stack: error instanceof Error ? error.stack : undefined,
              timestamp: new Date().toISOString()
            }),
            ipAddress: this.getClientIP(request),
            userAgent: request.headers.get('user-agent') || ''
          })

          return this.createErrorResponse(
            'Internal server error', 
            500,
            {
              details: error instanceof Error ? error.message : 'Unknown error'
            }
          )
        } finally {
          // Clean up request cache
          if (options.enableCaching !== false) {
            setTimeout(() => {
              this.requestCache.clear()
            }, this.cacheTTL)
          }
        }
      }
    }
  }

  /**
   * Require authentication only
   */
  static requireAuth<T extends MiddlewareHandlerV2>(handler: T) {
    return this.middleware({ requireAuth: true })(handler)
  }

  /**
   * Require agency context
   */
  static requireAgency<T extends MiddlewareHandlerV2>(handler: T) {
    return this.middleware({ requireAuth: true, requireAgency: true })(handler)
  }

  /**
   * Require branch context with enhanced scoping
   */
  static requireBranch<T extends MiddlewareHandlerV2>(
    handler: T, 
    minAccessLevel: EnhancedAccessLevel = EnhancedAccessLevel.BRANCH,
    options: Omit<RBACMiddlewareOptionsV2, 'requireAuth' | 'requireAgency' | 'requireBranch' | 'minAccessLevel'> = {}
  ) {
    return this.middleware({ 
      requireAuth: true, 
      requireAgency: true, 
      requireBranch: true,
      minAccessLevel,
      ...options
    })(handler)
  }

  /**
   * Require specific permissions with enhanced checking
   */
  static requirePermissions(permissions: EnhancedPermissionCheck[], options: Omit<RBACMiddlewareOptionsV2, 'permissions'> = {}) {
    return this.middleware({ ...options, permissions })
  }

  /**
   * Require agency admin access
   */
  static requireAgencyAdmin<T extends MiddlewareHandlerV2>(handler: T, options: Omit<RBACMiddlewareOptionsV2, 'minAccessLevel'> = {}) {
    return this.middleware({
      requireAuth: true,
      requireAgency: true,
      minAccessLevel: EnhancedAccessLevel.AGENCY,
      ...options
    })(handler)
  }

  /**
   * Require branch manager access
   */
  static requireBranchManager<T extends MiddlewareHandlerV2>(handler: T, options: Omit<RBACMiddlewareOptionsV2, 'minAccessLevel'> = {}) {
    return this.middleware({
      requireAuth: true,
      requireAgency: true,
      requireBranch: true,
      minAccessLevel: EnhancedAccessLevel.BRANCH,
      ...options
    })(handler)
  }

  /**
   * Require global access (super admin only)
   */
  static requireGlobalAccess<T extends MiddlewareHandlerV2>(handler: T, options: Omit<RBACMiddlewareOptionsV2, 'minAccessLevel'> = {}) {
    return this.middleware({
      requireAuth: true,
      minAccessLevel: EnhancedAccessLevel.GLOBAL,
      ...options
    })(handler)
  }

  /**
   * Resource-specific access middleware with enhanced filtering
   */
  static requireResourceAccess(
    resourceType: string, 
    action: string = 'read',
    options: Omit<RBACMiddlewareOptionsV2, 'resourceType' | 'action'> = {}
  ) {
    return this.middleware({
      ...options,
      resourceType,
      action,
      enableDataFiltering: true
    })
  }

  /**
   * Require ownership of a resource
   */
  static requireOwnership<T extends MiddlewareHandlerV2>(
    handler: T,
    resourceType: string,
    resourceId?: string,
    options: Omit<RBACMiddlewareOptionsV2, 'resourceType' | 'requireOwnership'> = {}
  ) {
    return this.middleware({
      requireAuth: true,
      requireAgency: true,
      resourceType,
      action: 'manage',
      resourceId,
      requireOwnership: true,
      ...options
    })(handler)
  }

  /**
   * Apply branch-based data filtering with enhanced options
   */
  static withBranchFilter<T extends MiddlewareHandlerV2>(
    handler: T,
    options: {
      resource: string
      action?: string
      includeAssigned?: boolean
      includeOwned?: boolean
      scope?: 'GLOBAL' | 'AGENCY' | 'BRANCH' | 'OWN' | 'ASSIGNED'
      enableHierarchy?: boolean
    }
  ) {
    return async (request: NextRequest, context: any = {}): Promise<NextResponse> => {
      // First, apply authentication and basic RBAC checks
      const authResult = await this.authenticate(request)
      if (!authResult.success) {
        return authResult.response!
      }

      const { user, agency, branch } = authResult
      const userContext = await EnhancedRBACServiceV2.getUserContext(user.id)

      // Apply branch filtering to the request
      const branchFilter = await EnhancedRBACServiceV2.applyBranchFilter(user.id, {}, {
        resource: options.resource,
        action: options.action,
        includeAssigned: options.includeAssigned,
        includeOwned: options.includeOwned,
        scope: options.scope
      })

      const filteredContext = {
        ...context,
        user,
        agency,
        branch,
        userContext,
        branchFilter
      }

      return await handler(request, filteredContext)
    }
  }

  /**
   * Require branch hierarchy-aware access
   */
  static requireBranchHierarchy<T extends MiddlewareHandlerV2>(
    handler: T,
    options: {
      minAccessLevel: EnhancedAccessLevel
      includeChildren?: boolean
      includeParent?: boolean
      enableHierarchy?: boolean
    } & Omit<RBACMiddlewareOptionsV2, 'minAccessLevel'>
  ) {
    return this.middleware({
      requireAuth: true,
      requireAgency: true,
      requireBranch: true,
      minAccessLevel: options.minAccessLevel,
      enableBranchHierarchy: options.enableHierarchy ?? true,
      ...options
    })(handler)
  }

  // ============================================================================
  // Utility Functions
  // ============================================================================

  /**
   * Get accessible branches for a user (utility function)
   */
  static async getAccessibleBranches(userId: string): Promise<string[]> {
    const userContext = await EnhancedRBACServiceV2.getUserContext(userId)
    return userContext.accessibleBranches
  }

  /**
   * Check if user can access a specific branch
   */
  static async canAccessBranch(userId: string, branchId: string): Promise<boolean> {
    const userContext = await EnhancedRBACServiceV2.getUserContext(userId)
    return userContext.accessibleBranches.includes(branchId)
  }

  /**
   * Apply branch filtering to a database query
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
    }
  ): Promise<any> {
    return await EnhancedRBACServiceV2.applyBranchFilter(userId, baseWhere, options)
  }

  /**
   * Clear user context cache
   */
  static clearUserCache(userId: string): void {
    EnhancedRBACServiceV2.clearUserContext(userId)
  }

  /**
   * Clear all caches
   */
  static clearAllCache(): void {
    EnhancedRBACServiceV2.clearAllCaches()
    this.requestCache.clear()
  }

  // ============================================================================
  // Private Implementation Methods
  // ============================================================================

  private static async authenticate(request: NextRequest): Promise<{
    success: boolean
    user?: any
    agency?: any
    branch?: any
    response?: NextResponse
  }> {
    try {
      // Get token from Authorization header
      const authHeader = request.headers.get('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
          success: false,
          response: this.createErrorResponse('Missing or invalid authorization header', 401)
        }
      }

      const token = authHeader.substring(7)
      
      // Verify JWT token
      const jwt = await import('jsonwebtoken')
      const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'fallback-secret')
      
      if (!decoded || !decoded.userId) {
        return {
          success: false,
          response: this.createErrorResponse('Invalid token', 401)
        }
      }

      // Get user with relations
      const user = await db.user.findUnique({
        where: { id: decoded.userId },
        include: {
          agency: true,
          branch: true,
          managedBranches: true
        }
      })

      if (!user || user.status !== 'ACTIVE') {
        return {
          success: false,
          response: this.createErrorResponse('User not found or inactive', 401)
        }
      }

      return {
        success: true,
        user,
        agency: user.agency,
        branch: user.branch
      }

    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return {
          success: false,
          response: this.createErrorResponse('Invalid token', 401)
        }
      }

      if (error.name === 'TokenExpiredError') {
        return {
          success: false,
          response: this.createErrorResponse('Token expired', 401)
        }
      }

      console.error('Authentication error:', error)
      return {
        success: false,
        response: this.createErrorResponse('Authentication failed', 401)
      }
    }
  }

  private static checkAccessLevel(currentLevel: EnhancedAccessLevel, requiredLevel: EnhancedAccessLevel): boolean {
    const levelHierarchy = {
      [EnhancedAccessLevel.GLOBAL]: 6,
      [EnhancedAccessLevel.AGENCY]: 5,
      [EnhancedAccessLevel.BRANCH_GROUP]: 4,
      [EnhancedAccessLevel.BRANCH]: 3,
      [EnhancedAccessLevel.TEAM]: 2,
      [EnhancedAccessLevel.OWN]: 1
    }

    const currentLevelValue = levelHierarchy[currentLevel]
    const requiredLevelValue = levelHierarchy[requiredLevel]

    return currentLevelValue >= requiredLevelValue
  }

  private static getClientIP(request: NextRequest): string {
    return (
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      request.headers.get('cf-connecting-ip') ||
      'unknown'
    )
  }

  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private static createErrorResponse(
    message: string, 
    status: number, 
    additionalData: any = {}
  ): NextResponse {
    return NextResponse.json({
      error: message,
      timestamp: new Date().toISOString(),
      ...additionalData
    }, { status })
  }

  private static async logActivity(data: {
    userId?: string
    agencyId?: string
    branchId?: string
    action: string
    entityType: string
    changes: string
    ipAddress?: string
    userAgent?: string
    requestId?: string
  }): Promise<void> {
    try {
      await db.activityLog.create({
        data: {
          agencyId: data.agencyId,
          userId: data.userId,
          action: data.action,
          entityType: data.entityType,
          changes: data.changes,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent
        }
      })
    } catch (error) {
      console.error('Error logging activity:', error)
      // Don't throw error for logging failures
    }
  }
}

// ============================================================================
// Export Common Types and Constants
// ============================================================================

export enum ResourceType {
  USERS = 'users',
  STUDENTS = 'students',
  APPLICATIONS = 'applications',
  UNIVERSITIES = 'universities',
  CAMPUSES = 'campuses',
  SUBJECTS = 'subjects',
  TASKS = 'tasks',
  DOCUMENTS = 'documents',
  INVOICES = 'invoices',
  TRANSACTIONS = 'transactions',
  REPORTS = 'reports',
  SETTINGS = 'settings',
  ROLES = 'roles',
  PERMISSIONS = 'permissions',
  BRANCHES = 'branches',
  WORKFLOWS = 'workflows',
  MARKETING = 'marketing',
  COMMUNICATIONS = 'communications',
  ACCOUNTING = 'accounting',
  ANALYTICS = 'analytics'
}

export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
  EXECUTE = 'execute',
  EXPORT = 'export',
  IMPORT = 'import',
  APPROVE = 'approve',
  REJECT = 'reject',
  ASSIGN = 'assign',
  UNASSIGN = 'unassign'
}

// ============================================================================
// Convenience Export Functions
// ============================================================================

export const requireAuthV2 = RBACMiddlewareV2.requireAuth
export const requireAgencyV2 = RBACMiddlewareV2.requireAgency
export const requireBranchV2 = RBACMiddlewareV2.requireBranch
export const requirePermissionsV2 = RBACMiddlewareV2.requirePermissions
export const requireAgencyAdminV2 = RBACMiddlewareV2.requireAgencyAdmin
export const requireBranchManagerV2 = RBACMiddlewareV2.requireBranchManager
export const requireGlobalAccessV2 = RBACMiddlewareV2.requireGlobalAccess
export const requireResourceAccessV2 = RBACMiddlewareV2.requireResourceAccess
export const requireOwnershipV2 = RBACMiddlewareV2.requireOwnership
export const withBranchFilterV2 = RBACMiddlewareV2.withBranchFilter
export const requireBranchHierarchyV2 = RBACMiddlewareV2.requireBranchHierarchy