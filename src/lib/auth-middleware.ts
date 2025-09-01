import { NextRequest, NextResponse } from 'next/server'
import { RBACService, type RBACContext, type PermissionCheck } from './rbac'

export interface AuthOptions {
  requireAuth?: boolean
  permissions?: PermissionCheck[]
  requireAgency?: boolean
  requireBranch?: boolean
  allowPublicAccess?: boolean
}

export class AuthMiddleware {
  /**
   * Main middleware function for route protection
   */
  static async protect(
    request: NextRequest,
    options: AuthOptions = {}
  ): Promise<{ response: NextResponse | null; user?: any; agency?: any; branch?: any }> {
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

      // Get user from token (this would typically use JWT or session)
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
      if (options.permissions && options.permissions.length > 0 && user) {
        const context: RBACContext = {
          userId: user.id,
          agencyId: user.agencyId,
          branchId: user.branchId,
          ipAddress: this.getClientIP(request),
          userAgent: request.headers.get('user-agent') || undefined
        }

        for (const permission of options.permissions) {
          const decision = await RBACService.checkPermission(user.id, permission, context)
          
          // Log access attempt
          await RBACService.logAccess({
            userId: user.id,
            agencyId: user.agencyId,
            resource: permission.resource,
            action: permission.action,
            resourceId: permission.resourceId,
            result: decision.allowed ? 'ALLOWED' : 'DENIED',
            reason: decision.reason,
            ipAddress: context.ipAddress,
            userAgent: context.userAgent
          })

          if (!decision.allowed) {
            return {
              response: NextResponse.json(
                { 
                  error: 'Insufficient permissions',
                  details: decision.reason,
                  resource: permission.resource,
                  action: permission.action
                },
                { status: 403 }
              )
            }
          }
        }
      }

      return { response: null, user, agency, branch }
    } catch (error) {
      console.error('Auth middleware error:', error)
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
   * This is a simplified version - in production, you'd use JWT or session validation
   */
  private static async getUserFromToken(token: string | null): Promise<any> {
    if (!token) return null

    try {
      // For demo purposes, we'll use a simple token lookup
      // In production, this would verify JWT tokens or session cookies
      const { db } = await import('./db')
      
      // This is a simplified approach - in production, use proper JWT validation
      const user = await db.user.findFirst({
        where: {
          // This would typically be a session token or JWT subject
          id: token, // Simplified for demo
          status: 'ACTIVE'
        },
        include: {
          agency: true,
          branch: true
        }
      })

      return user
    } catch (error) {
      console.error('Error getting user from token:', error)
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
        where: { id: branchId }
      })
    } catch (error) {
      console.error('Error getting branch:', error)
      return null
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
    options: AuthOptions = {}
  ) {
    return async (request: NextRequest, context: any): Promise<NextResponse> => {
      const authResult = await this.protect(request, options)
      
      if (authResult.response) {
        return authResult.response
      }

      // Add user context to the handler
      const enhancedContext = {
        ...context,
        user: authResult.user,
        agency: authResult.agency,
        branch: authResult.branch
      }

      return handler(request, enhancedContext)
    }
  }

  /**
   * Require specific permissions for API routes
   */
  static requirePermissions(permissions: PermissionCheck[]) {
    return (handler: (request: NextRequest, context: any) => Promise<NextResponse>) => {
      return AuthMiddleware.withAuth(handler, {
        requireAuth: true,
        permissions
      })
    }
  }

  /**
   * Require authentication for API routes
   */
  static requireAuth(handler: (request: NextRequest, context: any) => Promise<NextResponse>) {
    return AuthMiddleware.withAuth(handler, {
      requireAuth: true
    })
  }

  /**
   * Require agency context for API routes
   */
  static requireAgency(handler: (request: NextRequest, context: any) => Promise<NextResponse>) {
    return AuthMiddleware.withAuth(handler, {
      requireAuth: true,
      requireAgency: true
    })
  }

  /**
   * Require branch context for API routes
   */
  static requireBranch(handler: (request: NextRequest, context: any) => Promise<NextResponse>) {
    return AuthMiddleware.withAuth(handler, {
      requireAuth: true,
      requireAgency: true,
      requireBranch: true
    })
  }
}

/**
 * Higher-order function for API route protection
 */
export function withAuth(
  handler: (request: NextRequest, context: any) => Promise<NextResponse>,
  options: AuthOptions = {}
) {
  return AuthMiddleware.withAuth(handler, options)
}

/**
 * Permission requirement decorators
 */
export const requirePermissions = (permissions: PermissionCheck[]) => 
  (handler: (request: NextRequest, context: any) => Promise<NextResponse>) =>
    AuthMiddleware.requirePermissions(permissions)(handler)

export const requireAuth = (handler: (request: NextRequest, context: any) => Promise<NextResponse>) =>
  AuthMiddleware.requireAuth(handler)

export const requireAgency = (handler: (request: NextRequest, context: any) => Promise<NextResponse>) =>
  AuthMiddleware.requireAgency(handler)

export const requireBranch = (handler: (request: NextRequest, context: any) => Promise<NextResponse>) =>
  AuthMiddleware.requireBranch(handler)