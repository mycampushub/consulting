'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  name: string
  email: string
  role: 'AGENCY_ADMIN' | 'CONSULTANT' | 'SUPPORT' | 'STUDENT'
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING'
  avatar?: string
  lastLoginAt?: string
}

interface Agency {
  id: string
  name: string
  subdomain: string
  primaryColor: string
  secondaryColor: string
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING'
  plan: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'
}

interface AuthContextType {
  user: User | null
  agency: Agency | null
  isLoading: boolean
  login: (email: string, password: string, subdomain: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  refreshAuth: () => Promise<void>
  isAuthenticated: boolean
  hasPermission: (resource: string, action: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [agency, setAgency] = useState<Agency | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        setIsLoading(false)
        return
      }

      // Verify token with backend
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setAgency(data.agency)
      } else {
        // Token is invalid, clear localStorage
        localStorage.removeItem('authToken')
        localStorage.removeItem('userData')
        localStorage.removeItem('agencyData')
        localStorage.removeItem('userEmail')
        localStorage.removeItem('userSubdomain')
      }
    } catch (error) {
      console.error('Auth status check failed:', error)
      // Clear potentially invalid data
      localStorage.removeItem('authToken')
      localStorage.removeItem('userData')
      localStorage.removeItem('agencyData')
      localStorage.removeItem('userEmail')
      localStorage.removeItem('userSubdomain')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string, subdomain: string, rememberMe = false) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          subdomain,
          rememberMe,
          deviceInfo: {
            userAgent: navigator.userAgent,
            deviceType: /Mobile|Android|iPhone/.test(navigator.userAgent) ? 'mobile' : 'desktop'
          }
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || 'Login failed' }
      }

      // Store authentication data
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('userEmail', data.user.email)
      localStorage.setItem('userSubdomain', data.agency.subdomain)
      localStorage.setItem('userData', JSON.stringify(data.user))
      localStorage.setItem('agencyData', JSON.stringify(data.agency))

      setUser(data.user)
      setAgency(data.agency)

      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Network error occurred' }
    }
  }

  const logout = () => {
    // Clear all auth-related data
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    localStorage.removeItem('agencyData')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userSubdomain')

    setUser(null)
    setAgency(null)

    // Redirect to login page
    router.push('/login')
  }

  const refreshAuth = async () => {
    await checkAuthStatus()
  }

  const hasPermission = (resource: string, action: string): boolean => {
    if (!user) return false

    // Simple permission check based on role
    // In a real app, this would be more sophisticated and might check with the backend
    const permissions: Record<string, string[]> = {
      'AGENCY_ADMIN': ['*'], // Full access
      'CONSULTANT': ['students:read', 'students:write', 'applications:read', 'applications:write', 'universities:read'],
      'SUPPORT': ['students:read', 'applications:read', 'communications:read', 'communications:write'],
      'STUDENT': ['applications:read', 'documents:read', 'communications:read']
    }

    const userPermissions = permissions[user.role] || []
    
    // Check if user has full access or specific permission
    return userPermissions.includes('*') || userPermissions.includes(`${resource}:${action}`)
  }

  const value: AuthContextType = {
    user,
    agency,
    isLoading,
    login,
    logout,
    refreshAuth,
    isAuthenticated: !!user,
    hasPermission
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Higher-order component for route protection
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: { requireAuth?: boolean; permissions?: [string, string][] } = {}
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading, user, hasPermission } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (isLoading) return

      if (options.requireAuth && !isAuthenticated) {
        router.push('/login')
        return
      }

      // Check permissions if specified
      if (options.permissions && user) {
        const hasAllPermissions = options.permissions.every(([resource, action]) => 
          hasPermission(resource, action)
        )
        
        if (!hasAllPermissions) {
          router.push('/unauthorized')
          return
        }
      }
    }, [isAuthenticated, isLoading, user, router, hasPermission, options])

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      )
    }

    if (options.requireAuth && !isAuthenticated) {
      return null // Will redirect in useEffect
    }

    return <Component {...props} />
  }
}