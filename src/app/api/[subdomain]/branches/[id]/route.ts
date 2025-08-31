import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSubdomainForAPI } from "@/lib/utils"
import { z } from "zod"

const updateBranchSchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
  type: z.enum(["MAIN", "BRANCH", "FRANCHISE", "PARTNER"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING", "CLOSED"]).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  managerId: z.string().optional(),
  timezone: z.string().optional(),
  currency: z.string().optional(),
  businessHours: z.any().optional(),
  maxStudents: z.number().min(1).optional(),
  maxStaff: z.number().min(1).optional(),
  description: z.string().optional(),
  features: z.any().optional(),
  settings: z.any().optional(),
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

    const branch = await db.branch.findFirst({
      where: {
        id: params.id,
        agencyId: agency.id
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true
          }
        },
        _count: {
          select: {
            users: true,
            students: true,
            applications: true,
            documents: true
          }
        }
      }
    })

    if (!branch) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 })
    }

    // Parse JSON fields for response
    const processedBranch = {
      ...branch,
      businessHours: branch.businessHours ? JSON.parse(branch.businessHours) : null,
      features: branch.features ? JSON.parse(branch.features) : null,
      settings: branch.settings ? JSON.parse(branch.settings) : null
    }

    return NextResponse.json(processedBranch)
  } catch (error) {
    console.error("Error fetching branch:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const subdomain = getSubdomainForAPI(request)
    if (!subdomain) {
      return NextResponse.json({ error: "Subdomain required" }, { status: 400 })
    }

    const body = await request.json()
    const validatedData = updateBranchSchema.parse(body)

    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    // Check if branch exists and belongs to agency
    const existingBranch = await db.branch.findFirst({
      where: {
        id: params.id,
        agencyId: agency.id
      }
    })

    if (!existingBranch) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 })
    }

    // Check if branch code is unique within the agency (if updating code)
    if (validatedData.code && validatedData.code !== existingBranch.code) {
      const codeExists = await db.branch.findFirst({
        where: {
          agencyId: agency.id,
          code: validatedData.code,
          NOT: { id: params.id }
        }
      })

      if (codeExists) {
        return NextResponse.json({ error: "Branch code already exists" }, { status: 400 })
      }
    }

    // Validate managerId if provided
    if (validatedData.managerId) {
      const manager = await db.user.findFirst({
        where: {
          id: validatedData.managerId,
          agencyId: agency.id
        }
      })

      if (!manager) {
        return NextResponse.json({ error: "Manager not found" }, { status: 404 })
      }

      // Check if manager is already managing another branch (excluding current branch)
      const existingManagerBranch = await db.branch.findUnique({
        where: { 
          managerId: validatedData.managerId,
          NOT: { id: params.id }
        }
      })

      if (existingManagerBranch) {
        return NextResponse.json({ error: "Manager is already assigned to another branch" }, { status: 400 })
      }
    }

    const updateData: any = { ...validatedData }

    // Handle JSON field updates
    if (validatedData.businessHours !== undefined) {
      updateData.businessHours = validatedData.businessHours ? JSON.stringify(validatedData.businessHours) : null
    }

    if (validatedData.features !== undefined) {
      updateData.features = validatedData.features ? JSON.stringify(validatedData.features) : null
    }

    if (validatedData.settings !== undefined) {
      updateData.settings = validatedData.settings ? JSON.stringify(validatedData.settings) : null
    }

    const branch = await db.branch.update({
      where: { id: params.id },
      data: updateData,
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true
          }
        },
        _count: {
          select: {
            users: true,
            students: true,
            applications: true,
            documents: true
          }
        }
      }
    })

    // Parse JSON fields for response
    const processedBranch = {
      ...branch,
      businessHours: branch.businessHours ? JSON.parse(branch.businessHours) : null,
      features: branch.features ? JSON.parse(branch.features) : null,
      settings: branch.settings ? JSON.parse(branch.settings) : null
    }

    return NextResponse.json(processedBranch)
  } catch (error) {
    console.error("Error updating branch:", error)
    
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

    // Check if branch exists and belongs to agency
    const branch = await db.branch.findFirst({
      where: {
        id: params.id,
        agencyId: agency.id
      },
      include: {
        _count: {
          select: {
            users: true,
            students: true,
            applications: true,
            documents: true
          }
        }
      }
    })

    if (!branch) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 })
    }

    // Check if branch has associated records
    const hasAssociatedRecords = 
      branch._count.users > 0 ||
      branch._count.students > 0 ||
      branch._count.applications > 0 ||
      branch._count.documents > 0

    if (hasAssociatedRecords) {
      return NextResponse.json({ 
        error: "Cannot delete branch with associated users, students, applications, or documents" 
      }, { status: 400 })
    }

    await db.branch.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Branch deleted successfully" })
  } catch (error) {
    console.error("Error deleting branch:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}