import { NextRequest, NextResponse } from 'next/server'
import { db } from './db'
import { getSubdomainForAPI } from './utils'

export interface SimpleAuthContext {
  user: any
  agency: any
  branch?: any
}

/**
 * Very simple authentication middleware that bypasses RBAC
 */
export function simpleAuth(handler: (request: NextRequest, context: SimpleAuthContext) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const subdomain = getSubdomainForAPI(request) || 'demo'
      
      console.log(`Simple auth for subdomain: ${subdomain}`)
      
      // Get or create agency
      let agency = await db.agency.findUnique({
        where: { subdomain }
      })

      if (!agency) {
        agency = await db.agency.create({
          data: {
            name: `${subdomain.charAt(0).toUpperCase() + subdomain.slice(1)} Education Agency`,
            subdomain: subdomain,
            customDomain: null,
            primaryColor: '#3B82F6',
            secondaryColor: '#10B981',
            status: 'ACTIVE',
            plan: 'FREE'
          }
        })
        console.log(`Created agency for subdomain: ${subdomain}`)
      }

      // Get or create user
      let user = await db.user.findUnique({
        where: { email: `demo@${subdomain}.com` }
      })

      if (!user) {
        user = await db.user.create({
          data: {
            email: `demo@${subdomain}.com`,
            name: 'Demo User',
            role: 'AGENCY_ADMIN',
            status: 'ACTIVE',
            agencyId: agency.id
          }
        })
        console.log(`Created user for agency: ${agency.name}`)
      }

      const context: SimpleAuthContext = {
        user,
        agency,
        branch: null
      }

      return await handler(request, context)
    } catch (error) {
      console.error('Simple auth error:', error)
      
      // Ultimate fallback - return demo data
      const subdomain = getSubdomainForAPI(request) || 'demo'
      
      const context: SimpleAuthContext = {
        user: {
          id: `${subdomain}-user-id`,
          email: `demo@${subdomain}.com`,
          name: 'Demo User',
          role: 'AGENCY_ADMIN',
          status: 'ACTIVE',
          agencyId: `${subdomain}-agency-id`
        },
        agency: {
          id: `${subdomain}-agency-id`,
          name: `${subdomain.charAt(0).toUpperCase() + subdomain.slice(1)} Education Agency`,
          subdomain: subdomain,
          customDomain: null,
          primaryColor: '#3B82F6',
          secondaryColor: '#10B981',
          status: 'ACTIVE',
          plan: 'FREE'
        },
        branch: null
      }

      return await handler(request, context)
    }
  }
}