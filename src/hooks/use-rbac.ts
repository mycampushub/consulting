'use client'

import { useState, useEffect, useCallback } from 'react'
import { useToast } from './use-toast'

export interface PermissionCheck {
  resource: string
  action: string
  resourceId?: string
  conditions?: Record<string, any>
}

export interface PermissionResult {
  allowed: boolean
  reason?: string
  accessLevel?: string
  policies?: string[]
  restrictions?: string[]
}

export interface UseRBACOptions {
  autoCheck?: boolean
  permissions?: PermissionCheck[]
}

export function useRBAC(options: UseRBACOptions = {}) {
  const { autoCheck = false, permissions: initialPermissions = [] } = options
  const [loading, setLoading] = useState(false)
  const [permissionResults, setPermissionResults] = useState<Record<string, PermissionResult>>({})
  const [userPermissions, setUserPermissions] = useState<string[]>([])
  const [userRoles, setUserRoles] = useState<string[]>([])
  const { toast } = useToast()

  // Check multiple permissions
  const checkPermissions = useCallback(async (permissionsToCheck: PermissionCheck[]) => {
    setLoading(true)
    try {
      const response = await fetch('/api/rbac/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        },
        body: JSON.stringify({ permissions: permissionsToCheck })
      })

      if (!response.ok) {
        throw new Error('Failed to check permissions')
      }

      const data = await response.json()
      
      // Convert results to a map for easy lookup
      const resultsMap: Record<string, PermissionResult> = {}
      data.results.forEach((result: any) => {
        const key = `${result.permission.resource}:${result.permission.action}`
        resultsMap[key] = {
          allowed: result.allowed,
          reason: result.reason,
          accessLevel: result.accessLevel,
          policies: result.policies,
          restrictions: result.restrictions
        }
      })

      setPermissionResults(resultsMap)
      return resultsMap
    } catch (error) {
      console.error('Error checking permissions:', error)
      toast({
        title: 'Error',
        description: 'Failed to check permissions',
        variant: 'destructive'
      })
      return {}
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Check a single permission
  const checkPermission = useCallback(async (permission: PermissionCheck) => {
    const results = await checkPermissions([permission])
    const key = `${permission.resource}:${permission.action}`
    return results[key] || { allowed: false }
  }, [checkPermissions])

  // Check if user has all specified permissions
  const hasAllPermissions = useCallback(async (permissionsToCheck: PermissionCheck[]) => {
    const results = await checkPermissions(permissionsToCheck)
    return permissionsToCheck.every(permission => {
      const key = `${permission.resource}:${permission.action}`
      return results[key]?.allowed
    })
  }, [checkPermissions])

  // Check if user has any of the specified permissions
  const hasAnyPermission = useCallback(async (permissionsToCheck: PermissionCheck[]) => {
    const results = await checkPermissions(permissionsToCheck)
    return permissionsToCheck.some(permission => {
      const key = `${permission.resource}:${permission.action}`
      return results[key]?.allowed
    })
  }, [checkPermissions])

  // Load user permissions and roles
  const loadUserPermissions = useCallback(async () => {
    try {
      const response = await fetch('/api/rbac/users/permissions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUserPermissions(data.allPermissions || [])
        setUserRoles(data.roles?.map((role: any) => role.role?.name) || [])
      }
    } catch (error) {
      console.error('Error loading user permissions:', error)
    }
  }, [])

  // Auto-check permissions on mount if enabled
  useEffect(() => {
    if (autoCheck && initialPermissions.length > 0) {
      checkPermissions(initialPermissions)
    }
    loadUserPermissions()
  }, [autoCheck, initialPermissions, checkPermissions, loadUserPermissions])

  return {
    // State
    loading,
    permissionResults,
    userPermissions,
    userRoles,

    // Methods
    checkPermissions,
    checkPermission,
    hasAllPermissions,
    hasAnyPermission,
    loadUserPermissions,

    // Utility functions
    can: (resource: string, action: string) => {
      const key = `${resource}:${action}`
      return permissionResults[key]?.allowed || false
    },

    hasRole: (role: string) => userRoles.includes(role),

    hasPermission: (resource: string, action: string) => {
      const key = `${resource}:${action}`
      return permissionResults[key]?.allowed || false
    }
  }
}

// Custom hooks for common permission checks
export function useCanViewStudents() {
  const rbac = useRBAC({ 
    permissions: [{ resource: 'students', action: 'read' }] 
  })
  return rbac.can('students', 'read')
}

export function useCanCreateStudents() {
  const rbac = useRBAC({ 
    permissions: [{ resource: 'students', action: 'create' }] 
  })
  return rbac.can('students', 'create')
}

export function useCanUpdateStudents() {
  const rbac = useRBAC({ 
    permissions: [{ resource: 'students', action: 'update' }] 
  })
  return rbac.can('students', 'update')
}

export function useCanDeleteStudents() {
  const rbac = useRBAC({ 
    permissions: [{ resource: 'students', action: 'delete' }] 
  })
  return rbac.can('students', 'delete')
}

export function useCanManageUsers() {
  const rbac = useRBAC({ 
    permissions: [
      { resource: 'users', action: 'create' },
      { resource: 'users', action: 'update' },
      { resource: 'users', action: 'delete' }
    ] 
  })
  return rbac.hasAllPermissions([
    { resource: 'users', action: 'create' },
    { resource: 'users', action: 'update' },
    { resource: 'users', action: 'delete' }
  ])
}

export function useCanManageRoles() {
  const rbac = useRBAC({ 
    permissions: [{ resource: 'roles', action: 'manage' }] 
  })
  return rbac.can('roles', 'manage')
}

export function useCanViewAnalytics() {
  const rbac = useRBAC({ 
    permissions: [{ resource: 'analytics', action: 'read' }] 
  })
  return rbac.can('analytics', 'read')
}