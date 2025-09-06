import { NextRequest, NextResponse } from 'next/server'
import { EnhancedRBACService, type EnhancedPermissionCheck, type EnhancedAccessDecision, type EnhancedBranchAccessLevel } from './rbac-enhanced'
import { db } from './db'
import jwt from 'jsonwebtoken'

// ============================================================================
// Enhanced Types and Interfaces
// ============================================================================

export interface EnhancedAuthContext {
  user: any
  agency: any
  branch?: any
  accessDecision: EnhancedAccessDecision
  accessibleBranches: string[]
  managedBranches: string[]
  branchAccessLevel: EnhancedBranchAccessLevel
  requestMetadata?: {
    ip: string
    userAgent: string
    timestamp: Date
  }
  fieldPermissions?: string[]
  delegationInfo?: {
    delegatedBy: string
    delegatedAt: Date
    expiresAt?: Date
  }
}

export interface EnhancedAuthOptions {
  permissions?: EnhancedPermissionCheck[]
  requireAuth?: boolean
  requireAgency?: boolean
  requireBranch?: boolean
  branchScope?: EnhancedBranchAccessLevel
  resourceType?: string
  enableDataFiltering?: boolean
  auditLevel?: 'NONE' | 'BASIC' | 'DETAILED' | 'COMPREHENSIVE'
  resourceId?: string
  field?: string
  includeChildren?: boolean
  requireExact?: boolean
  enableDelegation?: boolean
}

export interface EnhancedMiddlewareHandler<T = any> {
  (request: NextRequest, context: EnhancedAuthContext): Promise<NextResponse>
}

// ============================================================================
// Enhanced Auth Middleware
// ============================================================================

export class EnhancedAuth {
  /**
   * Main authentication and authorization middleware with enhanced features
   */
  static middleware(options: EnhancedAuthOptions = {}) {
    return function <T extends EnhancedMiddlewareHandler>(handler: T) {
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
          let accessDecision: EnhancedAccessDecision = { 
            allowed: true,
            accessibleBranches: [],
            managedBranches: []
          }
          
          if (options.permissions && options.permissions.length > 0) {
            // Check all permissions with enhanced context
            for (const permission of options.permissions) {
              const decision = await EnhancedRBACService.checkPermission(user.id, {
                ...permission,
                resourceId: options.resourceId || permission.resourceId,
                field: options.field || permission.field,
                requireExact: options.requireExact
              }, {
                agencyId: agency?.id,
                branchId: branch?.id,
                ipAddress: requestMetadata.ip,
                userAgent: requestMetadata.userAgent,
                timestamp: requestMetadata.timestamp
              })

              if (!decision.allowed) {
                // Log permission denied with enhanced details
                await this.logActivity({
                  userId: user.id,
                  agencyId: agency?.id,
                  action: 'PERMISSION_DENIED',
                  entityType: 'Authorization',
                  changes: JSON.stringify({
                    permissions: options.permissions,
                    reason: decision.reason,
                    accessLevel: decision.accessLevel,
                    branchAccessLevel: decision.branchAccessLevel,
                    fieldPermissions: decision.fieldPermissions,
                    requestMetadata,
                    options
                  }),
                  ipAddress: requestMetadata.ip,
                  userAgent: requestMetadata.userAgent
                })

                return NextResponse.json(
                  { 
                    error: 'Insufficient permissions', 
                    details: decision.reason,
                    required: options.permissions,
                    currentAccessLevel: decision.accessLevel,
                    branchAccessLevel: decision.branchAccessLevel
                  },
                  { status: 403 }
                )
              }

              // Use the most permissive decision
              accessDecision = decision
            }
          }

          // Get enhanced branch access information
          const branchAccess = await EnhancedRBACService.getBranchAccessWithHierarchy(user.id, options.resourceType)

          // Validate branch scope if specified
          if (options.branchScope) {
            const hasRequiredScope = this.validateBranchScope(branchAccess.level, options.branchScope)
            if (!hasRequiredScope) {
              return NextResponse.json(
                { 
                  error: `Insufficient branch scope. Required: ${options.branchScope}, Current: ${branchAccess.level}`,
                  currentLevel: branchAccess.level,
                  requiredLevel: options.branchScope
                },
                { status: 403 }
              )
            }
          }

          // Check delegation if enabled
          let delegationInfo: EnhancedAuthContext['delegationInfo'] = undefined
          if (options.enableDelegation && accessDecision.delegationInfo) {
            delegationInfo = accessDecision.delegationInfo
            
            // Check if delegation is still valid
            if (delegationInfo.expiresAt && delegationInfo.expiresAt < new Date()) {
              return NextResponse.json(
                { error: 'Delegation has expired' },
                { status: 403 }
              )
            }
          }

          // Build enhanced auth context
          const authContext: EnhancedAuthContext = {
            user,
            agency,
            branch,
            accessDecision,
            accessibleBranches: branchAccess.accessibleBranches,
            managedBranches: branchAccess.managedBranches,
            branchAccessLevel: branchAccess.level,
            requestMetadata,
            fieldPermissions: accessDecision.fieldPermissions,
            delegationInfo
          }

          // Apply data filtering if enabled
          let filteredData: any = undefined
          if (options.enableDataFiltering && options.resourceType) {
            filteredData = await this.applyDataFiltering(user.id, options.resourceType, {
              action: options.permissions?.[0]?.action || 'read',
              includeChildren: options.includeChildren,
              fieldLevel: !!options.field
            })
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
                fieldPermissions: accessDecision.fieldPermissions,
                delegationInfo,
                filteredData,
                requestMetadata,
                options
              }),
              ipAddress: requestMetadata.ip,
              userAgent: requestMetadata.userAgent
            })
          }

          // Add filtering info to context if available
          if (filteredData) {
            (authContext as any).filteredData = filteredData
          }

          // Call the original handler
          return await handler(request, authContext)

        } catch (error) {
          console.error('EnhancedAuth middleware error:', error)
          
          // Log error with enhanced details
          await this.logActivity({
            userId: context.user?.id,
            agencyId: context.agency?.id,
            action: 'AUTH_ERROR',
            entityType: 'Authorization',
            changes: JSON.stringify({
              error: error instanceof Error ? error.message : 'Unknown error',
              options,
              stack: error instanceof Error ? error.stack : undefined,
              timestamp: new Date()
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
  static requireAuth<T extends EnhancedMiddlewareHandler>(handler: T) {
    return this.middleware({ requireAuth: true })(handler)
  }

  /**
   * Require agency context
   */
  static requireAgency<T extends EnhancedMiddlewareHandler>(handler: T) {
    return this.middleware({ requireAuth: true, requireAgency: true })(handler)
  }

  /**
   * Require branch context with enhanced scope support
   */
  static requireBranch<T extends EnhancedMiddlewareHandler>(
    handler: T, 
    branchScope: EnhancedBranchAccessLevel = EnhancedBranchAccessLevel.BRANCH,
    options: Omit<EnhancedAuthOptions, 'requireBranch' | 'branchScope'> = {}
  ) {
    return this.middleware({ 
      ...options,
      requireAuth: true, 
      requireAgency: true, 
      requireBranch: true,
      branchScope 
    })(handler)
  }

  /**
   * Require specific permissions with enhanced features
   */
  static requirePermissions(
    permissions: EnhancedPermissionCheck[], 
    options: Omit<EnhancedAuthOptions, 'permissions'> = {}
  ) {
    return this.middleware({ ...options, permissions })
  }

  /**
   * Require agency admin access
   */
  static requireAgencyAdmin<T extends EnhancedMiddlewareHandler>(handler: T) {
    return this.middleware({
      requireAuth: true,
      requireAgency: true,
      branchScope: EnhancedBranchAccessLevel.AGENCY
    })(handler)
  }

  /**
   * Require branch manager access with hierarchy support
   */
  static requireBranchManager<T extends EnhancedMiddlewareHandler>(
    handler: T,
    options: Omit<EnhancedAuthOptions, 'requireBranch' | 'branchScope'> = {}
  ) {
    return this.middleware({
      ...options,
      requireAuth: true,
      requireAgency: true,
      requireBranch: true,
      branchScope: EnhancedBranchAccessLevel.BRANCH,
      includeChildren: true
    })(handler)
  }

  /**
   * Require global access (super admin only)
   */
  static requireGlobalAccess<T extends EnhancedMiddlewareHandler>(handler: T) {
    return this.middleware({
      requireAuth: true,
      branchScope: EnhancedBranchAccessLevel.GLOBAL
    })(handler)
  }

  /**
   * Resource-specific access middleware with field-level control
   */
  static requireResourceAccess(
    resourceType: string,
    action: string = 'read',
    options: Omit<EnhancedAuthOptions, 'resourceType'> = {}
  ) {
    return this.middleware({
      ...options,
      permissions: [{ resource: resourceType, action }],
      resourceType,
      enableDataFiltering: true
    })
  }

  /**
   * Field-level access control middleware
   */
  static requireFieldAccess(
    resourceType: string,
    field: string,
    action: string = 'read',
    options: Omit<EnhancedAuthOptions, 'field'> = {}
  ) {
    return this.middleware({
      ...options,
      permissions: [{ resource: resourceType, action, field }],
      resourceType,
      field,
      enableDataFiltering: true
    })
  }

  /**
   * Branch hierarchy-aware middleware
   */
  static requireBranchHierarchy<T extends EnhancedMiddlewareHandler>(
    handler: T,
    options: {
      scope: EnhancedBranchAccessLevel
      includeChildren?: boolean
      includeParent?: boolean
    } & Omit<EnhancedAuthOptions, 'branchScope'>
  ) {
    return this.middleware({
      ...options,
      requireAuth: true,
      requireAgency: true,
      requireBranch: true,
      branchScope: options.scope,
      includeChildren: options.includeChildren
    })(handler)
  }

  /**
   * Delegation-aware middleware
   */
  static requireDelegation<T extends EnhancedMiddlewareHandler>(
    handler: T,
    options: Omit<EnhancedAuthOptions, 'enableDelegation'> = {}
  ) {
    return this.middleware({
      ...options,
      requireAuth: true,
      enableDelegation: true
    })(handler)
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

      // Get user with enhanced relations
      const user = await db.user.findUnique({
        where: { id: decoded.userId },
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
          }
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
    currentLevel: EnhancedBranchAccessLevel, 
    requiredScope: EnhancedBranchAccessLevel
  ): boolean {
    const scopeHierarchy = {
      [EnhancedBranchAccessLevel.GLOBAL]: 6,
      [EnhancedBranchAccessLevel.AGENCY]: 5,
      [EnhancedBranchAccessLevel.REGION]: 4,
      [EnhancedBranchAccessLevel.BRANCH]: 3,
      [EnhancedBranchAccessLevel.ASSIGNED]: 2,
      [EnhancedBranchAccessLevel.OWN]: 1
    }

    const currentLevelValue = scopeHierarchy[currentLevel]
    const requiredLevelValue = scopeHierarchy[requiredScope]

    return currentLevelValue >= requiredLevelValue
  }

  private static async applyDataFiltering(
    userId: string,
    resourceType: string,
    options: {
      action?: string
      includeChildren?: boolean
      fieldLevel?: boolean
    }
  ): Promise<any> {
    try {
      return await EnhancedRBACService.applyBranchFilter(userId, resourceType, {}, options)
    } catch (error) {
      console.error('EnhancedAuth applyDataFiltering error:', error)
      return {}
    }
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
    EnhancedRBACService.clearUserCache(userId)
  }

  /**
   * Clear all cache (forwards to RBAC service)
   */
  static clearAllCache(): void {
    EnhancedRBACService.clearAllCache()
  }
}

// ============================================================================
// Convenience Export Functions
// ============================================================================

export const requireAuth = EnhancedAuth.requireAuth
export const requireAgency = EnhancedAuth.requireAgency
export const requireBranch = EnhancedAuth.requireBranch
export const requirePermissions = EnhancedAuth.requirePermissions
export const requireAgencyAdmin = EnhancedAuth.requireAgencyAdmin
export const requireBranchManager = EnhancedAuth.requireBranchManager
export const requireGlobalAccess = EnhancedAuth.requireGlobalAccess
export const requireResourceAccess = EnhancedAuth.requireResourceAccess
export const requireFieldAccess = EnhancedAuth.requireFieldAccess
export const requireBranchHierarchy = EnhancedAuth.requireBranchHierarchy
export const requireDelegation = EnhancedAuth.requireDelegation