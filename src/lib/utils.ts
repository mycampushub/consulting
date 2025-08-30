import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { NextRequest } from "next/server"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getSubdomain(request: NextRequest): string | null {
  const hostname = request.headers.get('host') || ''
  
  // Handle localhost development - extract from hostname
  if (hostname.includes('localhost')) {
    // Remove port if present
    const hostWithoutPort = hostname.split(':')[0]
    const parts = hostWithoutPort.split('.')
    
    // If we have testagency.localhost, parts will be ['testagency', 'localhost']
    if (parts.length > 1 && parts[0] !== 'localhost') {
      return parts[0]
    }
    
    return null
  }
  
  // Handle production domains
  const parts = hostname.split('.')
  if (parts.length > 2) {
    return parts[0]
  }
  
  return null
}

export function getSubdomainFromPath(request: NextRequest): string | null {
  const url = new URL(request.url)
  const pathname = url.pathname
  
  // Extract subdomain from path like /api/testagency/students
  const pathParts = pathname.split('/').filter(Boolean)
  
  // If path starts with /api/[subdomain]/..., subdomain is at index 1
  if (pathParts.length > 1 && pathParts[0] === 'api') {
    return pathParts[1]
  }
  
  return null
}

export function getSubdomainForAPI(request: NextRequest): string | null {
  // For API routes, always extract from path first
  const subdomain = getSubdomainFromPath(request)
  if (subdomain) {
    return subdomain
  }
  
  // Fallback to hostname extraction
  return getSubdomain(request)
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount)
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    // Common statuses
    'ACTIVE': 'bg-green-100 text-green-800',
    'INACTIVE': 'bg-gray-100 text-gray-800',
    'PENDING': 'bg-yellow-100 text-yellow-800',
    'DRAFT': 'bg-gray-100 text-gray-800',
    'COMPLETED': 'bg-blue-100 text-blue-800',
    'CANCELLED': 'bg-red-100 text-red-800',
    
    // Student statuses
    'PROSPECT': 'bg-blue-100 text-blue-800',
    'APPLIED': 'bg-yellow-100 text-yellow-800',
    'ACCEPTED': 'bg-green-100 text-green-800',
    'ENROLLED': 'bg-purple-100 text-purple-800',
    'GRADUATED': 'bg-gray-100 text-gray-800',
    'WITHDRAWN': 'bg-red-100 text-red-800',
    
    // Application statuses
    'INQUIRY': 'bg-blue-100 text-blue-800',
    'CONSULTATION': 'bg-yellow-100 text-yellow-800',
    'APPLICATION': 'bg-orange-100 text-orange-800',
    'DOCUMENTATION': 'bg-purple-100 text-purple-800',
    'VISA_PROCESSING': 'bg-indigo-100 text-indigo-800',
    'PRE_DEPARTURE': 'bg-pink-100 text-pink-800',
    'POST_ARRIVAL': 'bg-green-100 text-green-800',
    
    // Lead statuses
    'NEW': 'bg-blue-100 text-blue-800',
    'CONTACTED': 'bg-yellow-100 text-yellow-800',
    'QUALIFIED': 'bg-green-100 text-green-800',
    'NURTURING': 'bg-purple-100 text-purple-800',
    'CONVERTED': 'bg-gray-100 text-gray-800',
    'LOST': 'bg-red-100 text-red-800',
    
    // Campaign statuses
    'SCHEDULED': 'bg-blue-100 text-blue-800',
    'PAUSED': 'bg-yellow-100 text-yellow-800',
    
    // Default
    'default': 'bg-gray-100 text-gray-800'
  }
  
  return statusColors[status] || statusColors.default
}
