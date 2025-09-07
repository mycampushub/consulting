import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSubdomainForAPI } from "@/lib/utils"
import { requireAuth, requireAgency, requirePermissions } from "@/lib/auth-middleware"
import { z } from "zod"

const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Valid email is required").optional(),
  role: z.enum(["AGENCY_ADMIN", "CONSULTANT", "SUPPORT", "MANAGER", "INTERN"]).optional(),
  phone: z.string().optional(),
  title: z.string().optional(),
  department: z.string().optional(),
  branchId: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING", "SUSPENDED"]).optional(),
})

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    const user = await db.user.findFirst({
      where: {
        id: params.id,
        agencyId: agency.id
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const user = await db.user.findFirst({
      where: {
        id: params.id,
        agencyId: agency.id
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = updateUserSchema.parse(body)

    // Check if email is being changed and if it already exists
    if (validatedData.email && validatedData.email !== user.email) {
      const existingUser = await db.user.findFirst({
        where: {
          email: validatedData.email,
          id: { not: params.id }
        }
      })

      if (existingUser) {
        return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
      }
    }

    // Validate branch if provided
    if (validatedData.branchId) {
      const branch = await db.branch.findFirst({
        where: {
          id: validatedData.branchId,
          agencyId: agency.id
        }
      })

      if (!branch) {
        return NextResponse.json({ error: "Branch not found" }, { status: 404 })
      }
    }

    const updatedUser = await db.user.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    })

    // Log activity
    await db.activityLog.create({
      data: {
        agencyId: agency.id,
        userId: params.id,
        action: "USER_UPDATED",
        entityType: "User",
        entityId: params.id,
        changes: JSON.stringify(validatedData),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    const processedUser = {
      id: updatedUser.id,
      firstName: updatedUser.name?.split(' ')[0] || '',
      lastName: updatedUser.name?.split(' ').slice(1).join(' ') || '',
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      department: updatedUser.department || 'General',
      title: updatedUser.title || 'Team Member',
      status: updatedUser.status,
      avatar: updatedUser.avatar,
      lastLogin: updatedUser.lastLoginAt,
      joinDate: updatedUser.createdAt,
      permissions: [],
      managedBy: updatedUser.branch?.managerId,
      teamMembers: 0,
      projects: 0,
      performance: 85
    }

    return NextResponse.json(processedUser)
  } catch (error) {
    console.error("Error updating user:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const user = await db.user.findFirst({
      where: {
        id: params.id,
        agencyId: agency.id
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    await db.user.delete({
      where: { id: params.id }
    })

    // Log activity
    await db.activityLog.create({
      data: {
        agencyId: agency.id,
        userId: params.id,
        action: "USER_DELETED",
        entityType: "User",
        entityId: params.id,
        changes: JSON.stringify({ deleted: true }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}