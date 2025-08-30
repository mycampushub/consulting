import { NextRequest, NextResponse } from "next/server"
import { getSubdomainForAPI, getSubdomain } from "@/lib/utils"

export async function GET(request: NextRequest) {
  try {
    const subdomain1 = getSubdomain(request)
    const subdomain2 = getSubdomainForAPI(request)
    
    const hostname = request.headers.get('host') || ''
    const url = request.url
    
    return NextResponse.json({
      hostname,
      url,
      getSubdomain: subdomain1,
      getSubdomainForAPI: subdomain2,
      pathname: new URL(url).pathname
    })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' })
  }
}