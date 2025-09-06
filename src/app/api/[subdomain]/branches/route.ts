import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSubdomainForAPI } from "@/lib/utils"
import { requireAuth, requireAgency, requirePermissions } from "@/lib/auth-middleware"
import { z } from "zod"

const branchSchema = z.object({
  name: z.string().min(1, "Branch name is required"),
  code: z.string().min(1, "Branch code is required"),
  type: z.enum(["BRANCH", "OFFICE", "CENTER", "DEPARTMENT"]).optional(),
  email: z.string().email("Valid email is required").optional().nullable(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  managerId: z.string().optional(),
  maxStudents: z.number().min(1).optional(),
  maxStaff: z.number().min(1).optional(),
  description: z.string().optional(),
  features: z.array(z.string()).optional(),
  settings: z.record(z.any()).optional(),
  businessHours: z.record(z.any()).optional()
})

// Get all branches for the agency with proper RBAC checks
export const GET = requireAgency(
  requirePermissions([
    { resource: "branches", action: "read" }
  ])(async (request: NextRequest, context) => {
    try {
      const { agency, user, branch } = context
      const { searchParams } = new URL(request.url)
      const page = parseInt(searchParams.get("page") || "1")
      const limit = parseInt(searchParams.get("limit") || "20")
      const search = searchParams.get("search")
      const status = searchParams.get("status")
      const type = searchParams.get("type")

      // Build where clause with branch-based scoping
      const where: any = {
        agencyId: agency.id,
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { code: { contains: search, mode: "insensitive" as const } },
            { city: { contains: search, mode: "insensitive" as const } }
          ]
        }),
        ...(status && { status: status }),
        ...(type && { type: type })
      }

      // Apply branch-based scoping for non-admin users
      if (user.role !== "AGENCY_ADMIN") {
        // Regular users can only see their own branch
        where.id = user.branchId
      }

      const [branches, total] = await Promise.all([
        db.branch.findMany({
          where,
          include: {
            manager: {
              select: {
                id: true,
                name: true,
                email: true,
                title: true
              }
            },
            students: {
              select: {
                id: true,
                status: true
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
                students: true,
                users: true
              }
            }
          },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit
        }),
        db.branch.count({ where })
      ])

      // Parse JSON fields
      const processedBranches = branches.map(branch => ({
        ...branch,
        features: branch.features ? JSON.parse(branch.features) : [],
        settings: branch.settings ? JSON.parse(branch.settings) : {},
        businessHours: branch.businessHours ? JSON.parse(branch.businessHours) : {},
        studentCount: branch._count.students,
        userCount: branch._count.users,
        activeStudentCount: branch.students.filter(s => s.status === 'ACTIVE').length,
        activeUserCount: branch.users.filter(u => u.status === 'ACTIVE').length
      }))

      return NextResponse.json({
        branches: processedBranches,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      })
    } catch (error) {
      console.error("Error fetching branches:", error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  })
)

// Create a new branch with proper RBAC checks
export const POST = requireAgency(
  requirePermissions([
    { resource: "branches", action: "create" }
  ])(async (request: NextRequest, context) => {
    try {
      const { agency, user, branch } = context
      const body = await request.json()
      
      // Only agency admins can create branches
      if (user.role !== "AGENCY_ADMIN") {
        return NextResponse.json({ error: "Insufficient permissions to create branches" }, { status: 403 })
      }

      const validatedData = branchSchema.parse(body)

      // Validate branch code uniqueness within agency
      const existingBranch = await db.branch.findFirst({
        where: {
          agencyId: agency.id,
          code: validatedData.code
        }
      })

      if (existingBranch) {
        return NextResponse.json({ error: "Branch code already exists" }, { status: 400 })
      }

      // Validate manager if provided
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
      }

      const newBranch = await db.branch.create({
        data: {
          agencyId: agency.id,
          name: validatedData.name,
          code: validatedData.code,
          type: validatedData.type || "BRANCH",
          email: validatedData.email,
          phone: validatedData.phone,
          address: validatedData.address,
          city: validatedData.city,
          state: validatedData.state,
          country: validatedData.country,
          postalCode: validatedData.postalCode,
          managerId: validatedData.managerId,
          maxStudents: validatedData.maxStudents,
          maxStaff: validatedData.maxStaff,
          description: validatedData.description,
          features: validatedData.features ? JSON.stringify(validatedData.features) : null,
          settings: validatedData.settings ? JSON.stringify(validatedData.settings) : null,
          businessHours: validatedData.businessHours ? JSON.stringify(validatedData.businessHours) : null
        },
        include: {
          manager: {
            select: {
              id: true,
              name: true,
              email: true,
              title: true
            }
          },
          students: {
            select: {
              id: true
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
              students: true,
              users: true
            }
          }
        }
      })

      // Parse JSON fields for response
      const processedBranch = {
        ...newBranch,
        features: newBranch.features ? JSON.parse(newBranch.features) : [],
        settings: newBranch.settings ? JSON.parse(newBranch.settings) : {},
        businessHours: newBranch.businessHours ? JSON.parse(newBranch.businessHours) : {},
        studentCount: newBranch._count.students,
        userCount: newBranch._count.users
      }

      // Log activity
      await db.activityLog.create({
        data: {
          agencyId: agency.id,
          userId: user.id,
          action: "BRANCH_CREATED",
          entityType: "Branch",
          entityId: newBranch.id,
          changes: JSON.stringify({
            name: newBranch.name,
            code: newBranch.code,
            type: newBranch.type,
            managerId: newBranch.managerId
          })
        }
      })

      return NextResponse.json(processedBranch, { status: 201 })
    } catch (error) {
      console.error("Error creating branch:", error)
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation failed", details: error.errors },
          { status: 400 }
        )
      }

      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  })
)