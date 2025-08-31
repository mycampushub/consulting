import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSubdomainForAPI } from "@/lib/utils"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; subdomain: string } }
) {
  try {
    const subdomain = params.subdomain
    const formId = params.id

    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    const form = await db.form.findUnique({
      where: { id: formId, agencyId: agency.id },
      include: {
        submissions: {
          orderBy: { createdAt: "desc" },
          take: 50
        },
        landingPages: true
      }
    })

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }

    return NextResponse.json(form)
  } catch (error) {
    console.error("Error fetching form:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; subdomain: string } }
) {
  try {
    const subdomain = params.subdomain
    const formId = params.id

    const body = await request.json()
    const {
      name,
      description,
      fields,
      submitButton,
      successMessage,
      redirectUrl,
      facebookLeadId,
      googleLeadId,
      webhookUrl,
      status
    } = body

    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    const form = await db.form.update({
      where: { id: formId, agencyId: agency.id },
      data: {
        name,
        description,
        fields: JSON.stringify(fields),
        submitButton: submitButton || "Submit",
        successMessage: successMessage || "Thank you for your submission!",
        redirectUrl,
        facebookLeadId,
        googleLeadId,
        webhookUrl,
        status
      },
      include: {
        submissions: true,
        landingPages: true
      }
    })

    return NextResponse.json(form)
  } catch (error) {
    console.error("Error updating form:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; subdomain: string } }
) {
  try {
    const subdomain = params.subdomain
    const formId = params.id

    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    await db.form.delete({
      where: { id: formId, agencyId: agency.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting form:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}