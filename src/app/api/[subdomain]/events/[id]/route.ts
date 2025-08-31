import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSubdomainForAPI } from "@/lib/utils"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const subdomain = getSubdomainForAPI(request)
    if (!subdomain) {
      return NextResponse.json({ error: "Subdomain required" }, { status: 400 })
    }

    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    const event = await db.event.findFirst({
      where: {
        id: params.id,
        agencyId: agency.id
      },
      include: {
        registrations: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        analytics: true
      }
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Parse JSON fields
    const processedEvent = {
      ...event,
      agenda: event.agenda ? JSON.parse(event.agenda) : [],
      speakers: event.speakers ? JSON.parse(event.speakers) : [],
      materials: event.materials ? JSON.parse(event.materials) : [],
      platformConfig: event.platformConfig ? JSON.parse(event.platformConfig) : {}
    }

    return NextResponse.json(processedEvent)
  } catch (error) {
    console.error("Error fetching event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const subdomain = getSubdomainForAPI(request)
    if (!subdomain) {
      return NextResponse.json({ error: "Subdomain required" }, { status: 400 })
    }

    const body = await request.json()
    const { action, ...updateData } = body

    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    const existingEvent = await db.event.findFirst({
      where: {
        id: params.id,
        agencyId: agency.id
      }
    })

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Handle different actions
    if (action === "cancel") {
      const updatedEvent = await db.event.update({
        where: { id: params.id },
        data: {
          status: "CANCELLED"
        },
        include: {
          registrations: true,
          analytics: true
        }
      })

      // Send cancellation notifications
      await sendEventCancellationNotifications(updatedEvent, agency.id)

      return NextResponse.json({
        success: true,
        event: updatedEvent,
        message: "Event cancelled successfully"
      })
    } else if (action === "publish") {
      const updatedEvent = await db.event.update({
        where: { id: params.id },
        data: {
          status: "PUBLISHED"
        },
        include: {
          registrations: true,
          analytics: true
        }
      })

      return NextResponse.json({
        success: true,
        event: updatedEvent,
        message: "Event published successfully"
      })
    } else {
      // Handle general updates
      const updatePayload: any = {}
      
      if (updateData.title) updatePayload.title = updateData.title
      if (updateData.description) updatePayload.description = updateData.description
      if (updateData.type) updatePayload.type = updateData.type
      if (updateData.startTime) updatePayload.startTime = new Date(updateData.startTime)
      if (updateData.endTime) updatePayload.endTime = new Date(updateData.endTime)
      if (updateData.maxAttendees) updatePayload.maxAttendees = updateData.maxAttendees
      if (updateData.platform) updatePayload.platform = updateData.platform
      if (updateData.virtualMeetingUrl) updatePayload.virtualMeetingUrl = updateData.virtualMeetingUrl
      if (updateData.location) updatePayload.location = updateData.location
      if (updateData.bannerImage) updatePayload.bannerImage = updateData.bannerImage
      if (updateData.agenda !== undefined) updatePayload.agenda = updateData.agenda ? JSON.stringify(updateData.agenda) : null
      if (updateData.speakers !== undefined) updatePayload.speakers = updateData.speakers ? JSON.stringify(updateData.speakers) : null
      if (updateData.materials !== undefined) updatePayload.materials = updateData.materials ? JSON.stringify(updateData.materials) : null

      const updatedEvent = await db.event.update({
        where: { id: params.id },
        data: updatePayload,
        include: {
          registrations: true,
          analytics: true
        }
      })

      // Parse JSON fields for response
      const processedEvent = {
        ...updatedEvent,
        agenda: updatedEvent.agenda ? JSON.parse(updatedEvent.agenda) : [],
        speakers: updatedEvent.speakers ? JSON.parse(updatedEvent.speakers) : [],
        materials: updatedEvent.materials ? JSON.parse(updatedEvent.materials) : [],
        platformConfig: updatedEvent.platformConfig ? JSON.parse(updatedEvent.platformConfig) : {}
      }

      return NextResponse.json({
        success: true,
        event: processedEvent,
        message: "Event updated successfully"
      })
    }
  } catch (error) {
    console.error("Error updating event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const subdomain = getSubdomainForAPI(request)
    if (!subdomain) {
      return NextResponse.json({ error: "Subdomain required" }, { status: 400 })
    }

    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    const existingEvent = await db.event.findFirst({
      where: {
        id: params.id,
        agencyId: agency.id
      }
    })

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Delete associated registrations
    await db.eventRegistration.deleteMany({
      where: {
        eventId: params.id
      }
    })

    // Delete associated analytics
    await db.eventAnalytics.delete({
      where: {
        eventId: params.id
      }
    })

    // Delete the event
    await db.event.delete({
      where: { id: params.id }
    })

    // Send deletion notifications to registered attendees
    await sendEventDeletionNotifications(existingEvent, agency.id)

    return NextResponse.json({ 
      success: true, 
      message: "Event deleted successfully" 
    })
  } catch (error) {
    console.error("Error deleting event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper functions
async function sendEventCancellationNotifications(event: any, agencyId: string) {
  // Send notifications to all registered attendees
  const notifications = event.registrations.map((registration: any) => ({
    agencyId,
    type: "WARNING" as const,
    title: "Event Cancelled",
    message: `The event "${event.title}" has been cancelled`,
    recipientId: registration.studentId,
    recipientType: "STUDENT" as const,
    channel: "IN_APP" as const,
    status: "PENDING" as const,
    priority: "HIGH" as const,
    data: JSON.stringify({
      eventId: event.id,
      eventTitle: event.title,
      cancellationReason: "Event cancelled by organizer"
    })
  }))

  await db.notification.createMany({
    data: notifications
  })
}

async function sendEventDeletionNotifications(event: any, agencyId: string) {
  // Send notifications to all registered attendees
  const notifications = event.registrations.map((registration: any) => ({
    agencyId,
    type: "WARNING" as const,
    title: "Event Deleted",
    message: `The event "${event.title}" has been deleted`,
    recipientId: registration.studentId,
    recipientType: "STUDENT" as const,
    channel: "IN_APP" as const,
    status: "PENDING" as const,
    priority: "HIGH" as const,
    data: JSON.stringify({
      eventId: event.id,
      eventTitle: event.title
    })
  }))

  await db.notification.createMany({
    data: notifications
  })
}