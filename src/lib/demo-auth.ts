import { NextRequest, NextResponse } from 'next/server'

// Simple demo authentication that works for all subdomains
export function createDemoAuthContext(subdomain: string) {
  const demoUser = {
    id: `demo-user-${subdomain}`,
    email: `demo@${subdomain}.com`,
    name: 'Demo User',
    role: 'AGENCY_ADMIN',
    status: 'ACTIVE',
    agencyId: `demo-agency-${subdomain}`,
    branchId: `demo-branch-${subdomain}`
  }

  const demoAgency = {
    id: `demo-agency-${subdomain}`,
    name: `${subdomain.charAt(0).toUpperCase() + subdomain.slice(1)} Education Agency`,
    subdomain: subdomain,
    customDomain: null,
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    status: 'ACTIVE',
    plan: 'FREE',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const demoBranch = {
    id: `demo-branch-${subdomain}`,
    agencyId: demoAgency.id,
    name: 'Main Office',
    code: 'MAIN',
    type: 'MAIN',
    status: 'ACTIVE',
    email: `info@${subdomain}.com`,
    phone: '+1 (555) 123-4567',
    address: '123 Business Avenue',
    city: 'New York',
    state: 'NY',
    country: 'US',
    postalCode: '10001',
    maxStudents: 1000,
    maxStaff: 50,
    description: `Main headquarters of ${subdomain} Education Agency`,
    features: [],
    settings: {},
    businessHours: {},
    studentCount: 0,
    userCount: 1,
    applicationCount: 0,
    documentCount: 0,
    activeStudentCount: 0,
    activeUserCount: 1,
    manager: null,
    students: [],
    users: [],
    _count: {
      students: 0,
      users: 1
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  return {
    user: demoUser,
    agency: demoAgency,
    branch: demoBranch,
    accessDecision: { allowed: true },
    accessibleBranches: [demoBranch.id],
    branchAccessLevel: 'AGENCY',
    requestMetadata: {
      ip: '::1',
      userAgent: 'Demo-Client/1.0',
      timestamp: new Date()
    }
  }
}

// Demo authentication middleware
export function demoAuth(handler: (request: NextRequest, context: any) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    try {
      // Extract subdomain from URL
      const url = new URL(request.url)
      const pathname = url.pathname
      const pathParts = pathname.split('/')
      
      // Find subdomain in path (e.g., /api/[subdomain]/settings)
      const subdomainIndex = pathParts.indexOf('api') + 1
      const subdomain = subdomainIndex < pathParts.length ? pathParts[subdomainIndex] : 'demo'
      
      // Create demo auth context
      const authContext = createDemoAuthContext(subdomain)
      
      // Call the original handler with demo context
      return await handler(request, authContext)
    } catch (error) {
      console.error('Demo auth error:', error)
      return NextResponse.json(
        { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      )
    }
  }
}