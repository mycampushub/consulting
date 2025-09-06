import { NextRequest, NextResponse } from 'next/server'
import { UnifiedRBAC, type PermissionCheck, type AccessDecision, type BranchAccessLevel } from './rbac-unified'
import { db } from './db'

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface AuthContext {
  user: any
  agency: any
  branch?: any
  accessDecision: AccessDecision
  accessibleBranches: string[]
  branchAccessLevel: BranchAccessLevel
  requestMetadata?: {
    ip: string
    userAgent: string
    timestamp: Date
  }
}

export interface AuthOptions {
  permissions?: PermissionCheck[]
  requireAuth?: boolean
  requireAgency?: boolean
  requireBranch?: boolean
  branchScope?: 'GLOBAL' | 'AGENCY' | 'BRANCH' | 'OWN' | 'ASSIGNED'
  resourceType?: string
  enableDataFiltering?: boolean
  auditLevel?: 'NONE' | 'BASIC' | 'DETAILED'
  resourceId?: string
}

export interface MiddlewareHandler<T = any> {
  (request: NextRequest, context: AuthContext): Promise<NextResponse>
}

// ============================================================================
// Unified Auth Middleware
// ============================================================================

export class UnifiedAuth {
  /**
   * Main authentication and authorization middleware
   */
  static middleware(options: AuthOptions = {}) {
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

          // Check permissions if specified
          let accessDecision: AccessDecision = { allowed: true }
          
          if (options.permissions && options.permissions.length > 0) {
            // Check all permissions
            for (const permission of options.permissions) {
              const decision = await UnifiedRBAC.checkPermission(user.id, {
                ...permission,
                resourceId: options.resourceId || permission.resourceId
              }, {
                agencyId: agency?.id,
                branchId: branch?.id,
                ipAddress: requestMetadata.ip,
                userAgent: requestMetadata.userAgent
              })

              if (!decision.allowed) {
                // Log permission denied
                await this.logActivity({
                  userId: user.id,
                  agencyId: agency?.id,
                  action: 'PERMISSION_DENIED',
                  entityType: 'Authorization',
                  changes: JSON.stringify({
                    permissions: options.permissions,
                    reason: decision.reason,
                    requestMetadata
                  }),
                  ipAddress: requestMetadata.ip,
                  userAgent: requestMetadata.userAgent
                })

                return NextResponse.json(
                  { 
                    error: 'Insufficient permissions', 
                    details: decision.reason,
                    required: options.permissions 
                  },
                  { status: 403 }
                )
              }

              // Use the most permissive decision
              accessDecision = decision
            }
          }

          // Get branch access information
          const branchAccess = await UnifiedRBAC.getBranchAccess(user.id, options.resourceType)

          // Validate branch scope if specified
          if (options.branchScope) {
            const hasRequiredScope = this.validateBranchScope(branchAccess.level, options.branchScope)
            if (!hasRequiredScope) {
              return NextResponse.json(
                { error: `Insufficient branch scope. Required: ${options.branchScope}, Current: ${branchAccess.level}` },
                { status: 403 }
              )
            }
          }

          // Build auth context
          const authContext: AuthContext = {
            user,
            agency,
            branch,
            accessDecision,
            accessibleBranches: branchAccess.accessibleBranches,
            branchAccessLevel: branchAccess.level,
            requestMetadata
          }

          // Log successful access if audit level requires it
          if (options.auditLevel && options.auditLevel !== 'NONE') {
            await this.logActivity({
              userId: user.id,
              agencyId: agency?.id,
              action: 'API_ACCESS_GRANTED',
              entityType: 'Authorization',
              changes: JSON.stringify({
                permissions: options.permissions,
                branchScope: options.branchScope,
                resourceType: options.resourceType,
                accessLevel: branchAccess.level,
                requestMetadata
              }),
              ipAddress: requestMetadata.ip,
              userAgent: requestMetadata.userAgent
            })
          }

          // Call the original handler
          return await handler(request, authContext)

        } catch (error) {
          console.error('UnifiedAuth middleware error:', error)
          
          // Log error
          await this.logActivity({
            userId: context.user?.id,
            agencyId: context.agency?.id,
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
  static requireBranch<T extends MiddlewareHandler>(handler: T, branchScope: 'AGENCY' | 'BRANCH' | 'OWN' = 'BRANCH') {
    return this.middleware({ 
      requireAuth: true, 
      requireAgency: true, 
      requireBranch: true,
      branchScope 
    })(handler)
  }

  /**
   * Require specific permissions
   */
  static requirePermissions(permissions: PermissionCheck[], options: Omit<AuthOptions, 'permissions'> = {}) {
    return this.middleware({ ...options, permissions })
  }

  /**
   * Require agency admin access
   */
  static requireAgencyAdmin<T extends MiddlewareHandler>(handler: T) {
    return this.middleware({
      requireAuth: true,
      requireAgency: true,
      branchScope: 'AGENCY'
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
      branchScope: 'BRANCH'
    })(handler)
  }

  /**
   * Require global access (super admin only)
   */
  static requireGlobalAccess<T extends MiddlewareHandler>(handler: T) {
    return this.middleware({
      requireAuth: true,
      branchScope: 'GLOBAL'
    })(handler)
  }

  /**
   * Resource-specific access middleware
   */
  static requireResourceAccess(resourceType: string, action: string = 'read', options: Omit<AuthOptions, 'resourceType'> = {}) {
    return this.middleware({
      ...options,
      permissions: [{ resource: resourceType, action }],
      resourceType
    })
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
      
      // Verify JWT token (you'll need to implement this based on your JWT setup)
      const jwt = require('jsonwebtoken')
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret')
      
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

  private static validateBranchScope(
    currentLevel: BranchAccessLevel, 
    requiredScope: string
  ): boolean {
    const scopeHierarchy = {
      [BranchAccessLevel.GLOBAL]: 5,
      [BranchAccessLevel.AGENCY]: 4,
      [BranchAccessLevel.BRANCH]: 3,
      [BranchAccessLevel.ASSIGNED]: 2,
      [BranchAccessLevel.OWN]: 1
    }

    const requiredLevel = requiredScope.toUpperCase() as BranchAccessLevel
    const currentLevelValue = scopeHierarchy[currentLevel]
    const requiredLevelValue = scopeHierarchy[requiredLevel]

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
  }) {
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

  /**
   * Clear user cache (forwards to RBAC service)
   */
  static clearUserCache(userId: string): void {
    UnifiedRBAC.clearUserCache(userId)
  }

  /**
   * Clear all cache (forwards to RBAC service)
   */
  static clearAllCache(): void {
    UnifiedRBAC.clearAllCache()
  }
}

// ============================================================================
// Convenience Export Functions
// ============================================================================

export const requireAuth = UnifiedAuth.requireAuth
export const requireAgency = UnifiedAuth.requireAgency
export const requireBranch = UnifiedAuth.requireBranch
export const requirePermissions = UnifiedAuth.requirePermissions
export const requireAgencyAdmin = UnifiedAuth.requireAgencyAdmin
export const requireBranchManager = UnifiedAuth.requireBranchManager
export const requireGlobalAccess = UnifiedAuth.requireGlobalAccess
export const requireResourceAccess = UnifiedAuth.requireResourceAccess

// Cache management functions (placeholder implementations)
export const clearUserCache = (userId: string) => {
  // Simple in-memory cache clearing implementation
  if (globalThis._userCache && globalThis._userCache[userId]) {
    delete globalThis._userCache[userId]
  }
}

export const clearAllCache = () => {
  // Clear all cached data
  if (globalThis._userCache) {
    globalThis._userCache = {}
  }
  if (globalThis._agencyCache) {
    globalThis._agencyCache = {}
  }
  if (globalThis._branchCache) {
    globalThis._branchCache = {}
  }
}