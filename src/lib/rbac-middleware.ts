import { NextRequest, NextResponse } from 'next/server'
import { EnhancedRBAC, AccessLevel, ResourceType, PermissionAction, type EnhancedPermissionCheck, type ResourceAccess } from './rbac-enhanced'
import { db } from './db'

// ============================================================================
// Enhanced Middleware Types
// ============================================================================

export interface RBACContext {
  user: any
  agency: any
  branch?: any
  userContext: any
  accessDecision: ResourceAccess
  requestMetadata?: {
    ip: string
    userAgent: string
    timestamp: Date
  }
}

export interface RBACMiddlewareOptions {
  permissions?: EnhancedPermissionCheck[]
  requireAuth?: boolean
  requireAgency?: boolean
  requireBranch?: boolean
  minAccessLevel?: AccessLevel
  resourceType?: ResourceType
  action?: PermissionAction
  enableDataFiltering?: boolean
  auditLevel?: 'NONE' | 'BASIC' | 'DETAILED'
  resourceId?: string
  requireOwnership?: boolean
  includeAssigned?: boolean
  includeOwned?: boolean
}

export type MiddlewareHandler<T = any> = (request: NextRequest, context: RBACContext) => Promise<NextResponse>

// ============================================================================
// Enhanced RBAC Middleware
// ============================================================================

export class RBACMiddleware {
  /**
   * Main RBAC middleware with enhanced access control
   */
  static middleware(options: RBACMiddlewareOptions = {}) {
    return function <T extends MiddlewareHandler>(handler: T) {
      return async (request: NextRequest, context: any = {}): Promise<NextResponse> => {
        try {
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

          // Get enhanced user context
          const userContext = await EnhancedRBAC.getUserContext(user.id)

          // Check agency requirement
          if (options.requireAgency && !agency) {
            return NextResponse.json(
              { error: 'Agency context required' },
              { status: 403 }
            )
          }

          // Check branch requirement
          if (options.requireBranch && !branch) {
            return NextResponse.json(
              { error: 'Branch context required' },
              { status: 403 }
            )
          }

          // Check minimum access level
          if (options.minAccessLevel) {
            const hasRequiredLevel = this.checkAccessLevel(userContext.accessLevel, options.minAccessLevel)
            if (!hasRequiredLevel) {
              return NextResponse.json(
                { error: `Insufficient access level. Required: ${options.minAccessLevel}, Current: ${userContext.accessLevel}` },
                { status: 403 }
              )
            }
          }

          // Check permissions if specified
          let accessDecision: ResourceAccess = { 
            allowed: true, 
            accessLevel: userContext.accessLevel,
            accessibleBranches: userContext.accessibleBranches 
          }
          
          if (options.permissions && options.permissions.length > 0) {
            // Check all permissions
            for (const permission of options.permissions) {
              const decision = await EnhancedRBAC.checkPermission(user.id, {
                ...permission,
                resourceId: options.resourceId || permission.resourceId,
                requireOwnership: options.requireOwnership || permission.requireOwnership
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
                    userContext,
                    accessibleBranches: userContext.accessibleBranches
                  }),
                  ipAddress: requestMetadata.ip,
                  userAgent: requestMetadata.userAgent
                })

                return NextResponse.json(
                  { 
                    error: 'Insufficient permissions', 
                    details: decision.reason,
                    required: options.permissions,
                    currentAccessLevel: userContext.accessLevel
                  },
                  { status: 403 }
                )
              }

              // Use the most permissive decision
              accessDecision = decision
            }
          }

          // Check resource-specific permission if specified
          if (options.resourceType && options.action) {
            const resourcePermission = await EnhancedRBAC.checkPermission(user.id, {
              resource: options.resourceType,
              action: options.action,
              resourceId: options.resourceId,
              requireOwnership: options.requireOwnership
            }, userContext)

            if (!resourcePermission.allowed) {
              return NextResponse.json(
                { 
                  error: 'Resource access denied', 
                  details: resourcePermission.reason,
                  resource: options.resourceType,
                  action: options.action
                },
                { status: 403 }
              )
            }

            accessDecision = resourcePermission
          }

          // Build RBAC context
          const rbacContext: RBACContext = {
            user,
            agency,
            branch,
            userContext,
            accessDecision,
            requestMetadata
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
                requestMetadata
              }),
              ipAddress: requestMetadata.ip,
              userAgent: requestMetadata.userAgent
            })
          }

          // Call the original handler
          return await handler(request, rbacContext)

        } catch (error) {
          console.error('RBACMiddleware error:', error)
          
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
              stack: error instanceof Error ? error.stack : undefined
            }),
            ipAddress: this.getClientIP(request),
            userAgent: request.headers.get('user-agent') || ''
          })

          return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
          )
        }
      }
    }
  }

  /**
   * Require authentication only
   */
  static requireAuth<T extends MiddlewareHandler>(handler: T) {
    return this.middleware({ requireAuth: true })(handler)
  }

  /**
   * Require agency context
   */
  static requireAgency<T extends MiddlewareHandler>(handler: T) {
    return this.middleware({ requireAuth: true, requireAgency: true })(handler)
  }

  /**
   * Require branch context
   */
  static requireBranch<T extends MiddlewareHandler>(handler: T, minAccessLevel: AccessLevel = AccessLevel.BRANCH) {
    return this.middleware({ 
      requireAuth: true, 
      requireAgency: true, 
      requireBranch: true,
      minAccessLevel 
    })(handler)
  }

  /**
   * Require specific permissions
   */
  static requirePermissions(permissions: EnhancedPermissionCheck[], options: Omit<RBACMiddlewareOptions, 'permissions'> = {}) {
    return this.middleware({ ...options, permissions })
  }

  /**
   * Require agency admin access
   */
  static requireAgencyAdmin<T extends MiddlewareHandler>(handler: T) {
    return this.middleware({
      requireAuth: true,
      requireAgency: true,
      minAccessLevel: AccessLevel.AGENCY
    })(handler)
  }

  /**
   * Require branch manager access
   */
  static requireBranchManager<T extends MiddlewareHandler>(handler: T) {
    return this.middleware({
      requireAuth: true,
      requireAgency: true,
      requireBranch: true,
      minAccessLevel: AccessLevel.BRANCH
    })(handler)
  }

  /**
   * Require global access (super admin only)
   */
  static requireGlobalAccess<T extends MiddlewareHandler>(handler: T) {
    return this.middleware({
      requireAuth: true,
      minAccessLevel: AccessLevel.GLOBAL
    })(handler)
  }

  /**
   * Resource-specific access middleware with enhanced filtering
   */
  static requireResourceAccess(
    resourceType: ResourceType, 
    action: PermissionAction = PermissionAction.READ,
    options: Omit<RBACMiddlewareOptions, 'resourceType' | 'action'> = {}
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
  static requireOwnership<T extends MiddlewareHandler>(
    handler: T,
    resourceType: ResourceType,
    resourceId?: string
  ) {
    return this.middleware({
      requireAuth: true,
      requireAgency: true,
      resourceType,
      action: PermissionAction.MANAGE,
      resourceId,
      requireOwnership: true
    })(handler)
  }

  /**
   * Apply branch-based data filtering
   */
  static withBranchFilter<T extends MiddlewareHandler>(
    handler: T,
    options: {
      resource: ResourceType
      action?: PermissionAction
      includeAssigned?: boolean
      includeOwned?: boolean
    }
  ) {
    return async (request: NextRequest, context: any = {}): Promise<NextResponse> => {
      // First, apply authentication and basic RBAC checks
      const authResult = await this.authenticate(request)
      if (!authResult.success) {
        return authResult.response!
      }

      const { user, agency, branch } = authResult
      const userContext = await EnhancedRBAC.getUserContext(user.id)

      // Apply branch filtering to the request
      const filteredContext = {
        ...context,
        user,
        agency,
        branch,
        userContext,
        branchFilter: await EnhancedRBAC.applyBranchFilter(user.id, {}, options)
      }

      return await handler(request, filteredContext)
    }
  }

  // ============================================================================
  // Utility Functions
  // ============================================================================

  /**
   * Get accessible branches for a user (utility function)
   */
  static async getAccessibleBranches(userId: string): Promise<string[]> {
    const userContext = await EnhancedRBAC.getUserContext(userId)
    return userContext.accessibleBranches
  }

  /**
   * Check if user can access a specific branch
   */
  static async canAccessBranch(userId: string, branchId: string): Promise<boolean> {
    const userContext = await EnhancedRBAC.getUserContext(userId)
    return userContext.accessibleBranches.includes(branchId)
  }

  /**
   * Apply branch filtering to a database query
   */
  static async applyBranchFilter(
    userId: string,
    baseWhere: any = {},
    options: {
      resource: ResourceType
      action?: PermissionAction
      includeAssigned?: boolean
      includeOwned?: boolean
    }
  ): Promise<any> {
    return await EnhancedRBAC.applyBranchFilter(userId, baseWhere, options)
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
          response: NextResponse.json(
            { error: 'Missing or invalid authorization header' },
            { status: 401 }
          )
        }
      }

      const token = authHeader.substring(7)
      
      // Verify JWT token
      const jwt = await import('jsonwebtoken')
      const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'fallback-secret')
      
      if (!decoded || !decoded.userId) {
        return {
          success: false,
          response: NextResponse.json(
            { error: 'Invalid token' },
            { status: 401 }
          )
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
          response: NextResponse.json(
            { error: 'User not found or inactive' },
            { status: 401 }
          )
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
          response: NextResponse.json(
            { error: 'Invalid token' },
            { status: 401 }
          )
        }
      }

      if (error.name === 'TokenExpiredError') {
        return {
          success: false,
          response: NextResponse.json(
            { error: 'Token expired' },
            { status: 401 }
          )
        }
      }

      console.error('Authentication error:', error)
      return {
        success: false,
        response: NextResponse.json(
          { error: 'Authentication failed' },
          { status: 401 }
        )
      }
    }
  }

  private static checkAccessLevel(currentLevel: AccessLevel, requiredLevel: AccessLevel): boolean {
    const levelHierarchy = {
      [AccessLevel.GLOBAL]: 6,
      [AccessLevel.AGENCY]: 5,
      [AccessLevel.BRANCH_GROUP]: 4,
      [AccessLevel.BRANCH]: 3,
      [AccessLevel.TEAM]: 2,
      [AccessLevel.OWN]: 1
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

  private static async logActivity(data: {
    userId?: string
    agencyId?: string
    action: string
    entityType: string
    changes: string
    ipAddress: string
    userAgent: string
    branchId?: string
  }) {
    try {
      await ActivityLogger.log({
        userId: data.userId,
        agencyId: data.agencyId || '',
        branchId: data.branchId,
        action: data.action,
        entityType: data.entityType,
        changes: JSON.parse(data.changes),
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        metadata: {
          middlewareEvent: true,
          timestamp: new Date().toISOString()
        }
      }, { async: true })
    } catch (error) {
      console.error('Error logging activity:', error)
      // Don't throw error for logging failures
    }
  }

  // ============================================================================
  // Cache Management
  // ============================================================================

  static clearUserCache(userId: string): void {
    EnhancedRBAC.clearUserCache(userId)
  }

  static clearAllCache(): void {
    EnhancedRBAC.clearAllCache()
  }

  static clearBranchHierarchyCache(agencyId: string): void {
    EnhancedRBAC.clearBranchHierarchyCache(agencyId)
  }
}

// ============================================================================
// Convenience Export Functions
// ============================================================================

export const requireAuth = RBACMiddleware.requireAuth
export const requireAgency = RBACMiddleware.requireAgency
export const requireBranch = RBACMiddleware.requireBranch
export const requirePermissions = RBACMiddleware.requirePermissions
export const requireAgencyAdmin = RBACMiddleware.requireAgencyAdmin
export const requireBranchManager = RBACMiddleware.requireBranchManager
export const requireGlobalAccess = RBACMiddleware.requireGlobalAccess
export const requireResourceAccess = RBACMiddleware.requireResourceAccess
export const requireOwnership = RBACMiddleware.requireOwnership
export const withBranchFilter = RBACMiddleware.withBranchFilter
export const applyBranchFilter = RBACMiddleware.applyBranchFilter
export const getAccessibleBranches = RBACMiddleware.getAccessibleBranches
export const canAccessBranch = RBACMiddleware.canAccessBranch