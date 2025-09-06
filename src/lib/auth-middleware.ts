import { NextRequest, NextResponse } from 'next/server'
import { UnifiedAuth, type AuthOptions, type AuthContext } from './auth-unified'
import { EnhancedAuth, type EnhancedAuthOptions, type EnhancedAuthContext } from './auth-enhanced'

// Re-export the main types and interfaces from the unified system
export type { AuthOptions, AuthContext } from './auth-unified'
export type { EnhancedAuthOptions, EnhancedAuthContext } from './auth-enhanced'

/**
 * Require authentication for API routes
 */
export function requireAuth(handler: (request: NextRequest, context: AuthContext) => Promise<NextResponse>) {
  return UnifiedAuth.requireAuth(handler)
}

/**
 * Require agency context for API routes
 */
export function requireAgency(handler: (request: NextRequest, context: AuthContext) => Promise<NextResponse>) {
  return UnifiedAuth.requireAgency(handler)
}

/**
 * Require permissions for API routes
 */
export function requirePermissions(permissions: any[], options: any = {}) {
  return UnifiedAuth.requirePermissions(permissions, options)
}

/**
 * Require branch context for API routes
 */
export function requireBranch(handler: (request: NextRequest, context: AuthContext) => Promise<NextResponse>, branchScope: 'AGENCY' | 'BRANCH' | 'OWN' = 'BRANCH') {
  return UnifiedAuth.requireBranch(handler, branchScope)
}

/**
 * Require agency admin access
 */
export function requireAgencyAdmin(handler: (request: NextRequest, context: AuthContext) => Promise<NextResponse>) {
  return UnifiedAuth.requireAgencyAdmin(handler)
}

/**
 * Require complete permissions with comprehensive checking
 */
export function requireCompletePermissions(permissions: any[], options: any = {}) {
  return UnifiedAuth.requirePermissions(permissions, options)
}

// ===== Enhanced RBAC Middleware Functions =====

/**
 * Require enhanced permissions with comprehensive checking
 */
export function requireEnhancedPermissions(permissions: any[], options: any = {}) {
  return UnifiedAuth.requirePermissions(permissions, options)
}

/**
 * Require branch context with specific scope
 */
export function requireBranchScope(handler: (request: NextRequest, context: AuthContext) => Promise<NextResponse>, scope: 'GLOBAL' | 'AGENCY' | 'BRANCH' | 'OWN' | 'ASSIGNED' | 'CHILDREN' = 'BRANCH', options: any = {}) {
  return UnifiedAuth.requireBranch(handler, scope as any)
}

/**
 * Require branch manager access
 */
export function requireBranchManager(handler: (request: NextRequest, context: AuthContext) => Promise<NextResponse>, options: any = {}) {
  return UnifiedAuth.requireBranchManager(handler)
}

/**
 * Require agency-wide access
 */
export function requireAgencyWide(handler: (request: NextRequest, context: AuthContext) => Promise<NextResponse>, options: any = {}) {
  return UnifiedAuth.requireAgency(handler)
}

/**
 * Require global access (super admin only)
 */
export function requireGlobalAccess(handler: (request: NextRequest, context: AuthContext) => Promise<NextResponse>, options: any = {}) {
  return UnifiedAuth.requireGlobalAccess(handler)
}

/**
 * Require resource-specific access with data filtering
 */
export function requireResourceAccess(resourceType: string, action: string = 'read', options: any = {}) {
  return UnifiedAuth.requireResourceAccess(resourceType, action, options)
}

// ===== New Enhanced Middleware Functions =====

/**
 * Require enhanced authentication with improved features
 */
export function requireEnhancedAuth(handler: (request: NextRequest, context: EnhancedAuthContext) => Promise<NextResponse>) {
  return EnhancedAuth.requireAuth(handler)
}

/**
 * Require enhanced branch context with hierarchy support
 */
export function requireEnhancedBranch(
  handler: (request: NextRequest, context: EnhancedAuthContext) => Promise<NextResponse>, 
  branchScope: import('./rbac-enhanced').EnhancedBranchAccessLevel = import('./rbac-enhanced').EnhancedBranchAccessLevel.BRANCH,
  options: Omit<EnhancedAuthOptions, 'requireBranch' | 'branchScope'> = {}
) {
  return EnhancedAuth.requireBranch(handler, branchScope, options)
}

/**
 * Require enhanced permissions with field-level control
 */
export function requireEnhancedPermissions(
  permissions: import('./rbac-enhanced').EnhancedPermissionCheck[], 
  options: Omit<EnhancedAuthOptions, 'permissions'> = {}
) {
  return EnhancedAuth.requirePermissions(permissions, options)
}

/**
 * Require field-level access control
 */
export function requireFieldAccess(
  resourceType: string,
  field: string,
  action: string = 'read',
  options: Omit<EnhancedAuthOptions, 'resourceType' | 'field'> = {}
) {
  return EnhancedAuth.requireFieldAccess(resourceType, field, action, options)
}

/**
 * Require branch hierarchy-aware access
 */
export function requireBranchHierarchy(
  handler: (request: NextRequest, context: EnhancedAuthContext) => Promise<NextResponse>,
  options: {
    scope: import('./rbac-enhanced').EnhancedBranchAccessLevel
    includeChildren?: boolean
    includeParent?: boolean
  } & Omit<EnhancedAuthOptions, 'branchScope'>
) {
  return EnhancedAuth.requireBranchHierarchy(handler, options)
}

/**
 * Require delegation-aware access
 */
export function requireDelegation(
  handler: (request: NextRequest, context: EnhancedAuthContext) => Promise<NextResponse>,
  options: Omit<EnhancedAuthOptions, 'enableDelegation'> = {}
) {
  return EnhancedAuth.requireDelegation(handler, options)
}

// Export the unified middleware classes for advanced usage
export { UnifiedAuth as AuthMiddleware }
export { EnhancedAuth as EnhancedAuthMiddleware }

// Export utility functions for backward compatibility
export { clearUserCache, clearAllCache } from './auth-unified'
export { EnhancedRBACService } from './rbac-enhanced'