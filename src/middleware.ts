import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Rate limiting configuration
const RATE_LIMITS = {
  login: { max: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  api: { max: 100, windowMs: 15 * 60 * 1000 }, // 100 requests per 15 minutes
  sensitive: { max: 10, windowMs: 15 * 60 * 1000 } // 10 sensitive operations per 15 minutes
}

// Simple in-memory rate limiting (in production, use Redis)
const rateLimitStore = new Map()

function checkRateLimit(key: string, limit: { max: number, windowMs: number }): boolean {
  const now = Date.now()
  const record = rateLimitStore.get(key)
  
  if (!record) {
    rateLimitStore.set(key, { count: 1, resetTime: now + limit.windowMs })
    return true
  }
  
  if (now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + limit.windowMs })
    return true
  }
  
  if (record.count >= limit.max) {
    return false
  }
  
  record.count++
  return true
}

function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for') || 
         request.headers.get('x-real-ip') || 
         request.headers.get('cf-connecting-ip') || 
         'unknown'
}

function isSuspiciousRequest(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent') || ''
  const ip = getClientIP(request)
  
  // Check for suspicious user agents
  const suspiciousAgents = [
    'bot', 'crawler', 'spider', 'scanner', 'test', 'curl', 'wget', 'python'
  ]
  
  if (suspiciousAgents.some(agent => userAgent.toLowerCase().includes(agent))) {
    return true
  }
  
  // Check for suspicious headers
  const suspiciousHeaders = [
    'x-forwarded-for', 'x-real-ip', 'via', 'forwarded'
  ]
  
  const headerCount = suspiciousHeaders.filter(header => 
    request.headers.get(header) !== null
  ).length
  
  // Too many proxy headers might indicate spoofing
  if (headerCount > 3) {
    return true
  }
  
  return false
}

function validateToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const { pathname } = request.nextUrl
  const ip = getClientIP(request)
  const userAgent = request.headers.get('user-agent') || ''
  
  // Security checks
  if (isSuspiciousRequest(request)) {
    console.log(`Suspicious request detected from ${ip}: ${pathname}`)
  }
  
  // Rate limiting for sensitive endpoints
  if (pathname.includes('/auth/login') || pathname.includes('/auth/verify')) {
    const rateLimitKey = `login:${ip}`
    if (!checkRateLimit(rateLimitKey, RATE_LIMITS.login)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      )
    }
  }
  
  // Rate limiting for API endpoints
  if (pathname.startsWith('/api/')) {
    const rateLimitKey = `api:${ip}`
    if (!checkRateLimit(rateLimitKey, RATE_LIMITS.api)) {
      return NextResponse.json(
        { error: 'Too many API requests. Please try again later.' },
        { status: 429 }
      )
    }
  }
  
  // Skip middleware for static files and specific pages
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') ||
    pathname === '/signup' ||
    pathname === '/signup/success' ||
    pathname === '/admin' ||
    pathname === '/brand-studio' ||
    pathname === '/setup'
  ) {
    return NextResponse.next()
  }
  
  // Handle API routes with subdomains
  if (pathname.startsWith('/api/')) {
    // Extract subdomain from hostname like "testagency.localhost:3000"
    const parts = hostname.split(':')
    const hostParts = parts[0].split('.')
    
    // If we have subdomain.localhost:3000 format
    if (hostParts.length === 2 && hostParts[1] === 'localhost') {
      const subdomain = hostParts[0]
      
      // Skip if it's the main localhost or www
      if (subdomain !== 'localhost' && subdomain !== 'www' && subdomain.length > 2) {
        // For API routes, we need to rewrite to include subdomain in the path
        const apiPathParts = pathname.split('/').filter(Boolean)
        if (apiPathParts.length >= 2) {
          const url = request.nextUrl.clone()
          // Rewrite /api/something to /api/{subdomain}/something
          url.pathname = `/api/${subdomain}/${apiPathParts.slice(1).join('/')}`
          return NextResponse.rewrite(url)
        }
      }
    }
    
    // Handle localhost:3000 format with direct API access like /api/testagency/something
    if (hostParts.length === 1 && hostParts[0] === 'localhost') {
      const pathParts = pathname.split('/').filter(Boolean)
      if (pathParts.length >= 3 && pathParts[0] === 'api') {
        // Already in correct format /api/{subdomain}/{path}
        return NextResponse.next()
      }
    }
    
    return NextResponse.next()
  }
  
  // Handle frontend routes with subdomains - optimized to prevent double loading
  if (hostname.includes('localhost')) {
    // Extract subdomain from hostname like "testagency.localhost:3000"
    const parts = hostname.split(':')
    const hostParts = parts[0].split('.')
    
    // If we have subdomain.localhost:3000 format
    if (hostParts.length === 2 && hostParts[1] === 'localhost') {
      const subdomain = hostParts[0]
      
      // Skip if it's the main localhost or www
      if (subdomain !== 'localhost' && subdomain !== 'www' && subdomain.length > 2) {
        // Check if pathname already starts with the subdomain to avoid duplication
        if (pathname.startsWith(`/${subdomain}/`) || pathname === `/${subdomain}`) {
          // Path already contains subdomain, no rewrite needed
          return NextResponse.next()
        }
        
        // Only rewrite if pathname is root or doesn't start with known routes
        const knownRoutes = ['api', 'signup', 'admin', 'brand-studio', 'setup', '_next', 'static']
        const firstPathPart = pathname.split('/')[1]
        
        if (!firstPathPart || !knownRoutes.includes(firstPathPart)) {
          // Rewrite the URL to the subdomain route
          const url = request.nextUrl.clone()
          url.pathname = `/${subdomain}${pathname}`
          return NextResponse.rewrite(url)
        }
      }
    }
    
    // Handle localhost:3000 format with direct access
    if (hostParts.length === 1 && hostParts[0] === 'localhost') {
      // Check if this is a subdomain path like /testagency/something
      const pathParts = pathname.split('/').filter(Boolean)
      if (pathParts.length > 0) {
        const potentialSubdomain = pathParts[0]
        
        // If it's not a known route, treat it as a subdomain
        const knownRoutes = ['api', 'signup', 'admin', 'brand-studio', 'setup', '_next', 'static']
        if (!knownRoutes.includes(potentialSubdomain) && potentialSubdomain.length > 2) {
          // Only rewrite if not already in subdomain format
          if (!pathname.startsWith(`/${potentialSubdomain}/`)) {
            // Rewrite to subdomain route
            const url = request.nextUrl.clone()
            url.pathname = `/${potentialSubdomain}${pathname.substring(potentialSubdomain.length + 1)}`
            return NextResponse.rewrite(url)
          }
        }
      }
    }
  }

  // Add caching headers for better performance
  const response = NextResponse.next()
  
  // Add comprehensive security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  
  // Add performance headers
  response.headers.set('Cache-Control', 'no-store, must-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  
  // Add Content Security Policy for production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
    )
  }

  // Add security logging headers
  response.headers.set('X-Request-ID', crypto.randomUUID())
  response.headers.set('X-Security-Scan', 'enabled')
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}