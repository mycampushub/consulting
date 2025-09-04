import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { action, reason } = body

    // Check if agency exists
    const agency = await db.agency.findUnique({
      where: { id }
    })

    if (!agency) {
      return NextResponse.json(
        { error: "Agency not found" },
        { status: 404 }
      )
    }

    let updatedAgency
    let actionMessage = ""

    switch (action) {
      case 'suspend':
        updatedAgency = await db.agency.update({
          where: { id },
          data: { status: 'SUSPENDED' }
        })
        actionMessage = "Agency suspended successfully"
        break

      case 'activate':
        updatedAgency = await db.agency.update({
          where: { id },
          data: { status: 'ACTIVE' }
        })
        actionMessage = "Agency activated successfully"
        break

      case 'deactivate':
        updatedAgency = await db.agency.update({
          where: { id },
          data: { status: 'INACTIVE' }
        })
        actionMessage = "Agency deactivated successfully"
        break

      case 'reset_usage':
        // Reset usage counters
        await db.billing.updateMany({
          where: { agencyId: id },
          data: {
            studentCount: 0,
            userCount: 0,
            storageUsed: 0
          }
        })
        actionMessage = "Usage counters reset successfully"
        break

      case 'backup':
        // Trigger backup process (in real implementation, this would call backup service)
        actionMessage = "Backup process initiated"
        break

      case 'migrate':
        // Migration logic would go here
        actionMessage = "Migration process initiated"
        break

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        )
    }

    // Log the action
    await db.activityLog.create({
      data: {
        agencyId: id,
        action: `AGENCY_${action.toUpperCase()}`,
        entityType: 'Agency',
        entityId: id,
        changes: JSON.stringify({
          action,
          reason,
          previousStatus: agency.status,
          newStatus: updatedAgency?.status
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      success: true,
      message: actionMessage,
      data: updatedAgency ? { agency: updatedAgency } : null
    })

  } catch (error) {
    console.error("Error performing agency action:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}