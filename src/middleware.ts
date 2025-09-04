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
  // Temporarily bypass all middleware logic for testing
  return NextResponse.next()
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