import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSubdomainForAPI } from "@/lib/utils"

export async function GET(request: NextRequest) {
  try {
    const subdomain = getSubdomainForAPI(request)
    if (!subdomain) {
      return NextResponse.json({ error: "Subdomain required" }, { status: 400 })
    }

    const agency = await db.agency.findUnique({
      where: { subdomain },
      include: {
        accounting: true
      }
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    // Mock integrations data
    const integrations = [
      {
        id: "quickbooks",
        name: "QuickBooks",
        category: "accounting",
        description: "Accounting software integration",
        status: agency.accounting?.isConnected ? "connected" : "disconnected",
        isConnected: agency.accounting?.isConnected || false,
        lastSyncAt: agency.accounting?.lastSyncAt,
        config: agency.accounting?.accountingConfig ? JSON.parse(agency.accounting.accountingConfig) : null,
        features: ["sync_transactions", "sync_invoices", "generate_reports"],
        webhooks: []
      },
      {
        id: "stripe",
        name: "Stripe",
        category: "payments",
        description: "Payment processing",
        status: "disconnected",
        isConnected: false,
        features: ["process_payments", "create_invoices", "manage_subscriptions"],
        webhooks: []
      },
      {
        id: "zoom",
        name: "Zoom",
        category: "communication",
        description: "Video conferencing and webinars",
        status: "disconnected",
        isConnected: false,
        features: ["create_meetings", "schedule_webinars", "record_sessions"],
        webhooks: []
      },
      {
        id: "google_calendar",
        name: "Google Calendar",
        category: "productivity",
        description: "Calendar and scheduling",
        status: "disconnected",
        isConnected: false,
        features: ["sync_events", "create_appointments", "send_reminders"],
        webhooks: []
      },
      {
        id: "mailchimp",
        name: "Mailchimp",
        category: "marketing",
        description: "Email marketing automation",
        status: "disconnected",
        isConnected: false,
        features: ["sync_contacts", "create_campaigns", "track_analytics"],
        webhooks: []
      },
      {
        id: "slack",
        name: "Slack",
        category: "communication",
        description: "Team collaboration",
        status: "disconnected",
        isConnected: false,
        features: ["send_notifications", "create_channels", "share_updates"],
        webhooks: []
      }
    ]

    // Get integration activity logs (mock data)
    const activityLogs = [
      {
        id: "1",
        integration: "QuickBooks",
        action: "sync_started",
        status: "success",
        description: "Started syncing transactions",
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: "2",
        integration: "QuickBooks",
        action: "sync_completed",
        status: "success",
        description: "Successfully synced 25 transactions",
        timestamp: new Date(Date.now() - 3500000).toISOString()
      }
    ]

    // Get webhook endpoints (mock data)
    const webhooks = [
      {
        id: "1",
        integration: "QuickBooks",
        event: "transaction.created",
        url: "https://webhook.example.com/quickbooks",
        isActive: true,
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ]

    return NextResponse.json({
      integrations,
      activityLogs,
      webhooks,
      summary: {
        total: integrations.length,
        connected: integrations.filter(i => i.isConnected).length,
        categories: {
          accounting: integrations.filter(i => i.category === "accounting").length,
          payments: integrations.filter(i => i.category === "payments").length,
          communication: integrations.filter(i => i.category === "communication").length,
          productivity: integrations.filter(i => i.category === "productivity").length,
          marketing: integrations.filter(i => i.category === "marketing").length
        }
      }
    })
  } catch (error) {
    console.error("Error fetching integrations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const subdomain = getSubdomainForAPI(request)
    if (!subdomain) {
      return NextResponse.json({ error: "Subdomain required" }, { status: 400 })
    }

    const body = await request.json()
    const { integrationId, action, config } = body

    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    // Handle different integration actions
    switch (action) {
      case "connect":
        // Simulate integration connection
        return NextResponse.json({
          success: true,
          message: `${integrationId} connected successfully`,
          integration: {
            id: integrationId,
            status: "connected",
            isConnected: true,
            lastSyncAt: new Date().toISOString()
          }
        })

      case "disconnect":
        // Simulate integration disconnection
        return NextResponse.json({
          success: true,
          message: `${integrationId} disconnected successfully`,
          integration: {
            id: integrationId,
            status: "disconnected",
            isConnected: false,
            lastSyncAt: null
          }
        })

      case "sync":
        // Simulate data sync
        return NextResponse.json({
          success: true,
          message: `${integrationId} sync completed`,
          syncResult: {
            recordsProcessed: Math.floor(Math.random() * 100) + 50,
            recordsCreated: Math.floor(Math.random() * 20) + 5,
            recordsUpdated: Math.floor(Math.random() * 30) + 10,
            errors: 0
          }
        })

      case "test":
        // Test integration connection
        return NextResponse.json({
          success: true,
          message: `${integrationId} connection test successful`,
          testResult: {
            status: "success",
            responseTime: Math.floor(Math.random() * 500) + 100,
            message: "Connection established successfully"
          }
        })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error managing integration:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}