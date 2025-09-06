import { NextRequest, NextResponse } from 'next/server'
import { RBACService, type RBACContext, type PermissionCheck } from './rbac'
import { CompleteRBAC, type CompleteRBACContext, type CompletePermissionCheck, type CompleteAccessDecision } from './rbac-complete'

export interface CompleteAuthOptions {
  requireAuth?: boolean
  permissions?: CompletePermissionCheck[]
  requireAgency?: boolean
  requireBranch?: boolean
  allowPublicAccess?: boolean
  branchScope?: 'GLOBAL' | 'AGENCY' | 'BRANCH' | 'OWN' | 'ASSIGNED'
  useEnhancedRBAC?: boolean
  resourceType?: string
  enableDataFiltering?: boolean
  auditLevel?: 'BASIC' | 'DETAILED' | 'COMPREHENSIVE'
  validateResourceAccess?: boolean
  resourceId?: string
}

export interface CompleteAuthContext {
  user?: any
  agency?: any
  branch?: any
  permissions?: string[]
  roles?: string[]
  accessibleBranches?: string[]
  branchScope?: 'GLOBAL' | 'AGENCY' | 'BRANCH' | 'OWN' | 'ASSIGNED'
  accessDecision?: CompleteAccessDecision
  fieldPermissions?: Record<string, string[]>
  dataFilters?: Record<string, any>
  appliedRules?: string[]
  requestMetadata?: {
    ip?: string
    userAgent?: string
    timestamp?: Date
  }
}

/**
 * Complete authentication middleware that integrates with Complete RBAC
 */
export class CompleteAuthMiddleware {
  /**
   * Main middleware function for comprehensive route protection
   */
  static async protect(
    request: NextRequest,
    options: CompleteAuthOptions = {}
  ): Promise<{ response: NextResponse | null; context?: CompleteAuthContext }> {
    try {
      // Get authorization header
      const authHeader = request.headers.get('authorization')
      const token = authHeader?.replace('Bearer ', '')

      // If no auth required and public access allowed, proceed
      if (!options.requireAuth && options.allowPublicAccess) {
        return { response: null }
      }

      // If auth required but no token provided
      if (options.requireAuth && !token) {
        return {
          response: NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          )
        }
      }

      // Get user from token
      const user = await this.getUserFromToken(token)
      
      if (!user && options.requireAuth) {
        return {
          response: NextResponse.json(
            { error: 'Invalid or expired token' },
            { status: 401 }
          )
        }
      }

      // Check if user is active
      if (user && user.status !== 'ACTIVE') {
        return {
          response: NextResponse.json(
            { error: 'User account is not active' },
            { status: 403 }
          )
        }
      }

      // Get agency and branch context
      const agency = user?.agencyId ? await this.getAgency(user.agencyId) : null
      const branch = user?.branchId ? await this.getBranch(user.branchId) : null

      // Check agency requirement
      if (options.requireAgency && !agency) {
        return {
          response: NextResponse.json(
            { error: 'Agency context required' },
            { status: 403 }
          )
        }
      }

      // Check branch requirement
      if (options.requireBranch && !branch) {
        return {
          response: NextResponse.json(
            { error: 'Branch context required' },
            { status: 403 }
          )
        }
      }

      // Check permissions if specified
      let userPermissions: string[] = []
      let userRoles: string[] = []
      let accessibleBranches: string[] = []
      let effectiveBranchScope: 'GLOBAL' | 'AGENCY' | 'BRANCH' | 'OWN' | 'ASSIGNED' = 'OWN'
      let accessDecision: CompleteAccessDecision | undefined
      let fieldPermissions: Record<string, string[]> = {}
      let dataFilters: Record<string, any> = {}

      if (options.permissions && options.permissions.length > 0 && user) {
        // Use Complete RBAC for comprehensive permission checking
        const completeContext: CompleteRBACContext = {
          userId: user.id,
          agencyId: user.agencyId,
          branchId: user.branchId,
          userRole: user.role,
          userBranchId: user.branchId,
          userAgencyId: user.agencyId,
          resourceType: options.resourceType,
          ipAddress: this.getClientIP(request),
          userAgent: request.headers.get('user-agent') || undefined,
          enableDataFiltering: options.enableDataFiltering,
          auditLevel: options.auditLevel,
          validateResourceAccess: options.validateResourceAccess
        }

        for (const permission of options.permissions) {
          accessDecision = await CompleteRBAC.checkPermissionComplete(user.id, permission, completeContext)
          
          // Log access attempt
          await RBACService.logAccess({
            userId: user.id,
            agencyId: user.agencyId,
            resource: permission.resource,
            action: permission.action,
            resourceId: permission.resourceId,
            result: accessDecision.allowed ? 'ALLOWED' : 'DENIED',
            reason: accessDecision.reason,
            ipAddress: completeContext.ipAddress,
            userAgent: completeContext.userAgent,
            context: {
              branchScope: accessDecision.branchScope,
              accessibleBranches: accessDecision.accessibleBranches,
              userRole: user.role,
              auditLevel: accessDecision.auditLevel,
              fieldPermissions: accessDecision.fieldPermissions,
              dataFilters: accessDecision.dataFilters
            }
          })

          if (!accessDecision.allowed) {
            return {
              response: NextResponse.json(
                { 
                  error: 'Insufficient permissions',
                  details: accessDecision.reason,
                  resource: permission.resource,
                  action: permission.action,
                  accessibleBranches: accessDecision.accessibleBranches,
                  branchScope: accessDecision.branchScope
                },
                { status: 403 }
              )
            }
          }

          // Collect access information from the first permission check
          if (accessDecision.accessibleBranches) {
            accessibleBranches = accessDecision.accessibleBranches
          }
          if (accessDecision.branchScope) {
            effectiveBranchScope = accessDecision.branchScope
          }
          if (accessDecision.fieldPermissions) {
            fieldPermissions = accessDecision.fieldPermissions
          }
          if (accessDecision.dataFilters) {
            dataFilters = accessDecision.dataFilters
          }
        }

        // Get user permissions and roles for context
        userPermissions = await this.getUserPermissionSlugs(user.id)
        userRoles = await this.getUserRoleSlugs(user.id)
      } else if (user) {
        // Even if no specific permissions required, get basic user info
        userPermissions = await this.getUserPermissionSlugs(user.id)
        userRoles = await this.getUserRoleSlugs(user.id)
        accessibleBranches = await CompleteRBAC.getAccessibleBranches(user.id, 'general')
        
        // Determine branch scope based on user role
        if (user.role === 'SUPER_ADMIN') {
          effectiveBranchScope = 'GLOBAL'
        } else if (user.role === 'AGENCY_ADMIN') {
          effectiveBranchScope = 'AGENCY'
        } else if (accessibleBranches.length > 1) {
          effectiveBranchScope = 'BRANCH'
        } else {
          effectiveBranchScope = 'OWN'
        }
      }

      // Prepare request metadata
      const requestMetadata = {
        ip: this.getClientIP(request),
        userAgent: request.headers.get('user-agent') || undefined,
        timestamp: new Date()
      }

      const authContext: CompleteAuthContext = {
        user,
        agency,
        branch,
        permissions: userPermissions,
        roles: userRoles,
        accessibleBranches,
        branchScope: effectiveBranchScope,
        accessDecision,
        fieldPermissions,
        dataFilters,
        appliedRules: accessDecision?.appliedRules,
        requestMetadata
      }

      return { response: null, context: authContext }
    } catch (error) {
      console.error('Complete auth middleware error:', error)
      return {
        response: NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        )
      }
    }
  }

  /**
   * Get user from authentication token
   */
  private static async getUserFromToken(token: string | null): Promise<any> {
    if (!token) return null

    try {
      const { JWTService } = await import('./jwt')
      
      // Verify JWT token
      const decoded = JWTService.verify(token)
      if (!decoded) {
        return null
      }

      const { db } = await import('./db')
      
      // Get user with related data
      const user = await db.user.findUnique({
        where: { id: decoded.userId },
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

      // Verify user is active and matches the token data
      if (!user || user.status !== 'ACTIVE') {
        return null
      }

      // Verify agency ID matches if present in token
      if (decoded.agencyId && user.agencyId !== decoded.agencyId) {
        return null
      }

      return user
    } catch (error) {
      console.error('Error validating token:', error)
      return null
    }
  }

  /**
   * Get agency by ID
   */
  private static async getAgency(agencyId: string): Promise<any> {
    try {
      const { db } = await import('./db')
      return await db.agency.findUnique({
        where: { id: agencyId }
      })
    } catch (error) {
      console.error('Error getting agency:', error)
      return null
    }
  }

  /**
   * Get branch by ID
   */
  private static async getBranch(branchId: string): Promise<any> {
    try {
      const { db } = await import('./db')
      return await db.branch.findUnique({
        where: { id: branchId },
        include: {
          agency: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })
    } catch (error) {
      console.error('Error getting branch:', error)
      return null
    }
  }

  /**
   * Get user permission slugs
   */
  private static async getUserPermissionSlugs(userId: string): Promise<string[]> {
    try {
      const { db } = await import('./db')
      const permissions = await RBACService.getUserPermissions(userId)
      return permissions.map(p => p.slug)
    } catch (error) {
      console.error('Error getting user permissions:', error)
      return []
    }
  }

  /**
   * Get user role slugs
   */
  private static async getUserRoleSlugs(userId: string): Promise<string[]> {
    try {
      const { db } = await import('./db')
      const userRoles = await db.userRoleAssignment.findMany({
        where: { userId, isActive: true },
        include: {
          role: true
        }
      })
      return userRoles.map(ur => ur.role.slug)
    } catch (error) {
      console.error('Error getting user roles:', error)
      return []
    }
  }

  /**
   * Get client IP address from request
   */
  private static getClientIP(request: NextRequest): string {
    return (
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      request.headers.get('cf-connecting-ip') ||
      'unknown'
    )
  }

  /**
   * Create route handler with authentication
   */
  static withAuth(
    handler: (request: NextRequest, context: any) => Promise<NextResponse>,
    options: CompleteAuthOptions = {}
  ) {
    return async (request: NextRequest, context: any): Promise<NextResponse> => {
      const authResult = await this.protect(request, options)
      
      if (authResult.response) {
        return authResult.response
      }

      // Add user context to the handler
      const enhancedContext = {
        ...context,
        ...authResult.context
      }

      return handler(request, enhancedContext)
    }
  }

  /**
   * Require specific permissions for API routes
   */
  static requirePermissions(permissions: CompletePermissionCheck[], options: Omit<CompleteAuthOptions, 'permissions'> = {}) {
    return (handler: (request: NextRequest, context: any) => Promise<NextResponse>) => {
      return CompleteAuthMiddleware.withAuth(handler, {
        requireAuth: true,
        permissions,
        useEnhancedRBAC: true,
        ...options
      })
    }
  }

  /**
   * Require authentication for API routes
   */
  static requireAuth(handler: (request: NextRequest, context: any) => Promise<NextResponse>) {
    return CompleteAuthMiddleware.withAuth(handler, {
      requireAuth: true
    })
  }

  /**
   * Require agency context for API routes
   */
  static requireAgency(handler: (request: NextRequest, context: any) => Promise<NextResponse>) {
    return CompleteAuthMiddleware.withAuth(handler, {
      requireAuth: true,
      requireAgency: true
    })
  }

  /**
   * Require branch context for API routes
   */
  static requireBranch(handler: (request: NextRequest, context: any) => Promise<NextResponse>, branchScope: 'AGENCY' | 'BRANCH' | 'OWN' | 'ASSIGNED' = 'BRANCH') {
    return CompleteAuthMiddleware.withAuth(handler, {
      requireAuth: true,
      requireAgency: true,
      requireBranch: true,
      branchScope,
      useEnhancedRBAC: true
    })
  }

  /**
   * Require agency admin access
   */
  static requireAgencyAdmin(handler: (request: NextRequest, context: any) => Promise<NextResponse>) {
    return CompleteAuthMiddleware.withAuth(handler, {
      requireAuth: true,
      requireAgency: true,
      branchScope: 'AGENCY',
      useEnhancedRBAC: true
    })
  }

  /**
   * Require branch-level access with own resources only
   */
  static requireOwnBranch(handler: (request: NextRequest, context: any) => Promise<NextResponse>) {
    return CompleteAuthMiddleware.withAuth(handler, {
      requireAuth: true,
      requireAgency: true,
      requireBranch: true,
      branchScope: 'OWN',
      useEnhancedRBAC: true
    })
  }

  /**
   * Require enhanced RBAC with branch-based scoping
   */
  static requireEnhancedRBAC(
    permissions: CompletePermissionCheck[], 
    options: Omit<CompleteAuthOptions, 'permissions' | 'useEnhancedRBAC'> = {}
  ) {
    return (handler: (request: NextRequest, context: any) => Promise<NextResponse>) => {
      return CompleteAuthMiddleware.withAuth(handler, {
        requireAuth: true,
        permissions,
        useEnhancedRBAC: true,
        ...options
      })
    }
  }

  /**
   * Require complete permissions with comprehensive checking
   */
  static requireCompletePermissions(
    permissions: CompletePermissionCheck[], 
    options: Omit<CompleteAuthOptions, 'permissions'> = {}
  ) {
    return (handler: (request: NextRequest, context: any) => Promise<NextResponse>) => {
      return CompleteAuthMiddleware.withAuth(handler, {
        requireAuth: true,
        permissions,
        useEnhancedRBAC: true,
        enableDataFiltering: true,
        auditLevel: 'DETAILED',
        ...options
      })
    }
  }
}

// Export the requireCompletePermissions function for easy import
export const requireCompletePermissions = CompleteAuthMiddleware.requireCompletePermissions.bind(CompleteAuthMiddleware)