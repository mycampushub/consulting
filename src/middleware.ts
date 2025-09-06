import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import { initializeRBAC } from './lib/init-rbac'

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

// Initialize RBAC when middleware loads
let rbacInitialized = false

export async function middleware(request: NextRequest) {
  // Initialize RBAC system on first request
  if (!rbacInitialized) {
    try {
      await initializeRBAC()
      rbacInitialized = true
      console.log('RBAC system initialized via middleware')
    } catch (error) {
      console.error('Failed to initialize RBAC system:', error)
      // Continue without RBAC initialization for now
    }
  }

  // Apply rate limiting
  const ip = getClientIP(request)
  const url = new URL(request.url)
  
  // Check different rate limits based on endpoint
  let rateLimitKey = `${ip}:${url.pathname}`
  if (url.pathname.includes('/auth/login')) {
    rateLimitKey = `login:${ip}`
  } else if (url.pathname.includes('/api/')) {
    rateLimitKey = `api:${ip}`
  }
  
  if (!checkRateLimit(rateLimitKey, RATE_LIMITS.api)) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }

  // Check for suspicious requests
  if (isSuspiciousRequest(request)) {
    // Log suspicious activity but don't block yet
    console.warn(`Suspicious request detected from IP: ${ip}`)
  }

  // Continue with the request
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}