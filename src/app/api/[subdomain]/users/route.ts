import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSubdomainForAPI } from "@/lib/utils"
import { requireAuth, requireAgency, requirePermissions } from "@/lib/auth-middleware"
import { z } from "zod"

const userSchema = z.object({
  email: z.string().email("Valid email is required"),
  name: z.string().min(1, "Name is required"),
  role: z.enum(["AGENCY_ADMIN", "CONSULTANT", "SUPPORT", "MANAGER", "INTERN"]).optional(),
  phone: z.string().optional(),
  title: z.string().optional(),
  department: z.string().optional(),
  branchId: z.string().optional(),
})

// Get all users for the agency with proper RBAC checks
export const GET = requireAgency(
  requirePermissions([
    { resource: "users", action: "read" }
  ])(async (request: NextRequest, context) => {
    try {
      const { agency, user, branch } = context
      const { searchParams } = new URL(request.url)
      const page = parseInt(searchParams.get("page") || "1")
      const limit = parseInt(searchParams.get("limit") || "20")
      const search = searchParams.get("search")
      const role = searchParams.get("role")
      const status = searchParams.get("status")
      const department = searchParams.get("department")

      // Build where clause with branch-based scoping
      const where: any = {
        agencyId: agency.id,
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { title: { contains: search, mode: "insensitive" as const } }
          ]
        }),
        ...(role && { role: role }),
        ...(status && { status: status }),
        ...(department && { 
          OR: [
            { department: { contains: department, mode: "insensitive" as const } }
          ]
        })
      }

      // Apply branch-based scoping for non-admin users
      if (user.role !== "AGENCY_ADMIN") {
        // Regular users can only see users in their branch
        where.branchId = user.branchId
      }

      const [users, total] = await Promise.all([
        db.user.findMany({
          where,
          include: {
            branch: {
              select: {
                id: true,
                name: true,
                code: true
              }
            },
            agency: {
              select: {
                id: true,
                name: true,
                subdomain: true
              }
            }
          },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit
        }),
        db.user.count({ where })
      ])

      // Transform users to match expected format
      const processedUsers = users.map(user => ({
        id: user.id,
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email,
        phone: user.phone,
        role: user.role,
        department: user.department || 'General',
        title: user.title || 'Team Member',
        status: user.status,
        avatar: user.avatar,
        lastLogin: user.lastLoginAt,
        joinDate: user.createdAt,
        permissions: [], // TODO: Fetch actual permissions from role assignments
        managedBy: user.branch?.managerId,
        teamMembers: 0, // TODO: Calculate based on reporting structure
        projects: 0, // TODO: Fetch from projects/tasks
        performance: 85 // TODO: Calculate based on performance metrics
      }))

      return NextResponse.json({
        users: processedUsers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      })
    } catch (error) {
      console.error("Error fetching users:", error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  })
)

// Create a new user with proper RBAC checks
export const POST = requireAgency(
  requirePermissions([
    { resource: "users", action: "create" }
  ])(async (request: NextRequest, context) => {
    try {
      const { agency, user } = context
      const body = await request.json()
      
      // Only agency admins can create users
      if (user.role !== "AGENCY_ADMIN") {
        return NextResponse.json({ error: "Insufficient permissions to create users" }, { status: 403 })
      }

      const validatedData = userSchema.parse(body)

      // Check if user email already exists
      const existingUser = await db.user.findFirst({
        where: {
          email: validatedData.email
        }
      })

      if (existingUser) {
        return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
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

      const newUser = await db.user.create({
        data: {
          email: validatedData.email,
          name: validatedData.name,
          role: validatedData.role || "CONSULTANT",
          phone: validatedData.phone,
          title: validatedData.title,
          department: validatedData.department,
          agencyId: agency.id,
          branchId: validatedData.branchId,
          status: "PENDING", // New users start as pending until they accept invitation
          emailVerified: false,
        },
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

      // TODO: Send invitation email
      // TODO: Assign default role based on user.role

      // Log activity
      await db.activityLog.create({
        data: {
          agencyId: agency.id,
          userId: user.id,
          action: "USER_CREATED",
          entityType: "User",
          entityId: newUser.id,
          changes: JSON.stringify({
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
            branchId: newUser.branchId
          })
        }
      })

      const processedUser = {
        id: newUser.id,
        firstName: newUser.name?.split(' ')[0] || '',
        lastName: newUser.name?.split(' ').slice(1).join(' ') || '',
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        department: newUser.department || 'General',
        title: newUser.title || 'Team Member',
        status: newUser.status,
        avatar: newUser.avatar,
        lastLogin: newUser.lastLoginAt,
        joinDate: newUser.createdAt,
        permissions: [],
        managedBy: newUser.branch?.managerId,
        teamMembers: 0,
        projects: 0,
        performance: 85
      }

      return NextResponse.json(processedUser, { status: 201 })
    } catch (error) {
      console.error("Error creating user:", error)
      
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