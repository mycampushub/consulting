import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const { pathname } = request.nextUrl
  
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
  
  // Handle frontend routes with subdomains
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
        
        // Rewrite the URL to the subdomain route
        const url = request.nextUrl.clone()
        url.pathname = `/${subdomain}${pathname}`
        return NextResponse.rewrite(url)
      }
    }
    
    // Handle localhost:3000 format with direct access
    if (hostParts.length === 1 && hostParts[0] === 'localhost') {
      // Check if this is a subdomain path like /testagency/something
      const pathParts = pathname.split('/').filter(Boolean)
      if (pathParts.length > 0) {
        const potentialSubdomain = pathParts[0]
        
        // If it's not a known route, treat it as a subdomain
        const knownRoutes = ['api', 'signup', 'admin', 'brand-studio', 'setup']
        if (!knownRoutes.includes(potentialSubdomain) && potentialSubdomain.length > 2) {
          // Rewrite to subdomain route
          const url = request.nextUrl.clone()
          url.pathname = `/${potentialSubdomain}${pathname.substring(potentialSubdomain.length + 1)}`
          return NextResponse.rewrite(url)
        }
      }
    }
  }

  // Add RBAC security headers
  const response = NextResponse.next()
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Add Content Security Policy for production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
    )
  }

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