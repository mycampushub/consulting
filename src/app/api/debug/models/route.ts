import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Test database connection and model availability
    const models = [
      'agency',
      'user', 
      'student',
      'university',
      'application',
      'marketingCampaign',
      'lead',
      'workflow',
      'form',
      'landingPage',
      'billing',
      'accounting',
      'invoice',
      'transaction',
      'document',
      'notification',
      'task',
      'appointment',
      'event'
    ]

    const results: Record<string, any> = {}

    for (const model of models) {
      try {
        // @ts-ignore - Dynamic model access
        const count = await db[model].count()
        results[model] = { 
          status: 'OK', 
          count,
          message: 'Model accessible' 
        }
      } catch (error) {
        results[model] = { 
          status: 'ERROR', 
          error: error instanceof Error ? error.message : 'Unknown error',
          message: 'Model not accessible' 
        }
      }
    }

    return NextResponse.json({
      status: 'Database Models Check',
      timestamp: new Date().toISOString(),
      results
    })
  } catch (error) {
    return NextResponse.json({
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}