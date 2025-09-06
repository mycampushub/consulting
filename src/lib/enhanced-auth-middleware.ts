import { NextRequest, NextResponse } from 'next/server'
import { CompleteAuthMiddleware, type CompleteAuthOptions, type CompleteAuthContext } from './auth-complete'

/**
 * Enhanced Auth Middleware - Wrapper around CompleteAuthMiddleware for backward compatibility
 * This provides the interface that some API routes are expecting
 */
export class EnhancedAuthMiddleware {
  /**
   * Protect routes with enhanced authentication
   */
  static async protect(
    request: NextRequest,
    options: CompleteAuthOptions = {}
  ): Promise<{ response: NextResponse | null; context?: CompleteAuthContext }> {
    return await CompleteAuthMiddleware.protect(request, options)
  }

  /**
   * Create authenticated route handler
   */
  static withAuth(
    handler: (request: NextRequest, context: any) => Promise<NextResponse>,
    options: CompleteAuthOptions = {}
  ) {
    return CompleteAuthMiddleware.withAuth(handler, options)
  }

  /**
   * Require authentication
   */
  static requireAuth(handler: (request: NextRequest, context: any) => Promise<NextResponse>) {
    return CompleteAuthMiddleware.requireAuth(handler)
  }

  /**
   * Require agency context
   */
  static requireAgency(handler: (request: NextRequest, context: any) => Promise<NextResponse>) {
    return CompleteAuthMiddleware.requireAgency(handler)
  }

  /**
   * Require branch context
   */
  static requireBranch(handler: (request: NextRequest, context: any) => Promise<NextResponse>, branchScope: 'AGENCY' | 'BRANCH' | 'OWN' = 'BRANCH') {
    return CompleteAuthMiddleware.requireBranch(handler, branchScope)
  }

  /**
   * Require permissions
   */
  static requirePermissions(permissions: any[], options: any = {}) {
    return CompleteAuthMiddleware.requirePermissions(permissions, options)
  }

  /**
   * Require agency admin
   */
  static requireAgencyAdmin(handler: (request: NextRequest, context: any) => Promise<NextResponse>) {
    return CompleteAuthMiddleware.requireAgencyAdmin(handler)
  }

  /**
   * Require own branch access
   */
  static requireOwnBranch(handler: (request: NextRequest, context: any) => Promise<NextResponse>) {
    return CompleteAuthMiddleware.requireOwnBranch(handler)
  }

  /**
   * Require enhanced RBAC
   */
  static requireEnhancedRBAC(permissions: any[], options: any = {}) {
    return CompleteAuthMiddleware.requireEnhancedRBAC(permissions, options)
  }

  /**
   * Require complete permissions
   */
  static requireCompletePermissions(permissions: any[], options: any = {}) {
    return CompleteAuthMiddleware.requireCompletePermissions(permissions, options)
  }
}