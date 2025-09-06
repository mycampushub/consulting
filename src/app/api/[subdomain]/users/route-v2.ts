import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSubdomainForAPI } from "@/lib/utils"
import { 
  RBACMiddlewareV2, 
  ResourceType, 
  PermissionAction,
  type RBACContextV2
} from "@/lib/rbac-middleware-v2"
import { 
  ActivityLogger,
  logActivity,
  logPermissionActivity,
  logBranchActivity
} from "@/lib/activity-logger"
import { z } from "zod"
import bcrypt from "bcryptjs"

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["AGENCY_ADMIN", "CONSULTANT", "SUPPORT", "STUDENT"]).optional(),
  title: z.string().optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
  branchId: z.string().optional()
})

const updateUserSchema = userSchema.partial().omit({ password: true })

// Get all users for the agency with enhanced branch-based scoping v2
export const GET = RBACMiddlewareV2.requireAgency(
  RBACMiddlewareV2.withBranchFilter(
    RBACMiddlewareV2.requirePermissions([
      { resource: ResourceType.USERS, action: PermissionAction.READ }
    ])(async (request: NextRequest, context: RBACContextV2) => {
      try {
        const { agency, user, userContext, branchFilter } = context
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "20")
        const search = searchParams.get("search")
        const role = searchParams.get("role")
        const status = searchParams.get("status")
        const branchId = searchParams.get("branchId")

        // Build where clause with enhanced branch-based scoping
        const where: any = {
          ...branchFilter, // Apply automatic branch filtering
          agencyId: agency.id,
          ...(search && {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
              { title: { contains: search, mode: "insensitive" as const } }
            ]
          }),
          ...(role && { role: role }),
          ...(status && { status: status })
        }

        // Additional branch filtering for users with higher access levels
        if (userContext.accessLevel === 'AGENCY' || userContext.accessLevel === 'GLOBAL') {
          // Agency admins and global admins can filter by specific branch
          if (branchId) {
            where.branchId = branchId
          }
        }

        const [users, total] = await Promise.all([
          db.user.findMany({
            where,
            include: {
              agency: {
                select: {
                  id: true,
                  name: true,
                  subdomain: true
                }
              },
              branch: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  type: true,
                  status: true
                }
              },
              managedBranches: {
                select: {
                  id: true,
                  name: true,
                  code: true
                }
              },
              userRoles: {
                include: {
                  role: {
                    select: {
                      id: true,
                      name: true,
                      slug: true,
                      scope: true,
                      level: true
                    }
                  }
                },
                where: { isActive: true }
              },
              userPermissions: {
                include: {
                  permission: {
                    select: {
                      id: true,
                      name: true,
                      slug: true,
                      resource: true,
                      action: true
                    }
                  }
                },
                where: { isActive: true }
              }
            },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit
          }),
          db.user.count({ where })
        ])

        // Add access level information to response
        const usersWithAccessInfo = users.map(u => ({
          ...u,
          accessLevel: userContext.accessibleBranches.includes(u.branchId || '') ? 'accessible' : 'restricted',
          canManage: userContext.managedBranches.includes(u.branchId || '') || userContext.accessLevel === 'AGENCY'
        }))

        // Log data access activity
        await logDataAccess(user.id, 'DATA_VIEWED', 'User', '', {
          filter: { search, role, status, branchId },
          count: total,
          format: 'json'
        })

        return NextResponse.json({
          users: usersWithAccessInfo,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          },
          userContext: {
            accessLevel: userContext.accessLevel,
            accessibleBranches: userContext.accessibleBranches,
            managedBranches: userContext.managedBranches,
            effectiveRole: userContext.effectiveRole
          }
        })
      } catch (error) {
        console.error("Error fetching users:", error)
        
        // Log system event for error
        await logSystemEvent('USERS_FETCH_ERROR', agency.id, {
          component: 'users-api',
          error: error instanceof Error ? error.message : 'Unknown error'
        })

        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
      }
    }),
    {
      resource: ResourceType.USERS,
      action: PermissionAction.READ,
      includeAssigned: true
    }
  )
)

// Create a new user with enhanced RBAC checks v2
export const POST = RBACMiddlewareV2.requireAgency(
  RBACMiddlewareV2.requirePermissions([
    { resource: ResourceType.USERS, action: PermissionAction.CREATE }
  ])(async (request: NextRequest, context: RBACContextV2) => {
    try {
      const { agency, user, userContext, accessDecision } = context
      const body = await request.json()
      const validatedData = userSchema.parse(body)

      // Enhanced branch access validation
      if (validatedData.branchId) {
        const canAccessBranch = userContext.accessibleBranches.includes(validatedData.branchId)
        if (!canAccessBranch) {
          // Log permission denied activity
          await logPermissionActivity(user.id, 'PERMISSION_DENIED', 'User', '', {
            targetUserId: '',
            reason: 'Cannot create user for inaccessible branch',
            context: userContext
          })

          return NextResponse.json({ 
            error: "Cannot create user for inaccessible branch",
            accessibleBranches: userContext.accessibleBranches 
          }, { status: 403 })
        }

        // Additional validation for branch management
        if (userContext.accessLevel === 'BRANCH' || userContext.accessLevel === 'OWN') {
          const canManageBranch = userContext.managedBranches.includes(validatedData.branchId)
          if (!canManageBranch && validatedData.branchId !== userContext.branchId) {
            await logPermissionActivity(user.id, 'PERMISSION_DENIED', 'User', '', {
              targetUserId: '',
              reason: 'Insufficient privileges to create user for this branch',
              context: userContext
            })

            return NextResponse.json({ 
              error: "Insufficient privileges to create user for this branch",
              requiredAccess: "Branch manager or higher",
              currentAccessLevel: userContext.accessLevel
            }, { status: 403 })
          }
        }
      } else {
        // If no branch specified, use the current user's branch
        validatedData.branchId = userContext.branchId
      }

      // Check if email already exists within the agency
      const existingUser = await db.user.findFirst({
        where: {
          email: validatedData.email,
          agencyId: agency.id
        }
      })

      if (existingUser) {
        return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 12)

      const newUser = await db.user.create({
        data: {
          agencyId: agency.id,
          branchId: validatedData.branchId,
          name: validatedData.name,
          email: validatedData.email,
          password: hashedPassword,
          role: validatedData.role || "CONSULTANT",
          status: "PENDING",
          title: validatedData.title,
          department: validatedData.department,
          phone: validatedData.phone,
          emailVerified: false
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          title: true,
          department: true,
          phone: true,
          avatar: true,
          branchId: true,
          agencyId: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true
        }
      })

      // Assign default role based on user role with enhanced validation
      const defaultRoleSlug = validatedData.role?.toLowerCase() || "consultant"
      const defaultRole = await db.role.findFirst({
        where: {
          agencyId: agency.id,
          slug: defaultRoleSlug,
          isActive: true,
          // Ensure role scope is appropriate for user's access level
          ...(userContext.accessLevel === 'OWN' && { scope: 'BRANCH' })
        }
      })

      if (defaultRole) {
        await db.userRoleAssignment.create({
          data: {
            userId: newUser.id,
            roleId: defaultRole.id,
            agencyId: agency.id,
            branchId: validatedData.branchId,
            assignedBy: user.id
          }
        })

        // Log role assignment activity
        await logPermissionActivity(user.id, 'ROLE_ASSIGNED', 'User', newUser.id, {
          targetUserId: newUser.id,
          roleId: defaultRole.id,
          context: userContext
        })
      }

      // Enhanced activity logging with branch context
      await logActivity({
        userId: user.id,
        agencyId: agency.id,
        branchId: userContext.branchId,
        action: "USER_CREATED",
        entityType: "User",
        entityId: newUser.id,
        changes: {
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          branchId: newUser.branchId,
          createdByAccessLevel: userContext.accessLevel,
          createdFromBranch: userContext.branchId,
          userContext: {
            accessLevel: userContext.accessLevel,
            effectiveRole: userContext.effectiveRole,
            accessibleBranches: userContext.accessibleBranches
          }
        },
        metadata: {
          category: 'USER_ACTION',
          severity: 'INFO'
        }
      })

      // Log branch activity if user is assigned to a different branch
      if (validatedData.branchId && validatedData.branchId !== userContext.branchId) {
        await logBranchActivity(user.id, 'BRANCH_ACCESS_GRANTED', validatedData.branchId, {
          targetUserId: newUser.id,
          branchName: (await db.branch.findUnique({ 
            where: { id: validatedData.branchId }, 
            select: { name: true } 
          }))?.name,
          reason: 'User assigned to branch during creation'
        })
      }

      // Clear user cache to ensure fresh permissions
      RBACMiddlewareV2.clearUserCache(user.id)

      return NextResponse.json({
        ...newUser,
        accessInfo: {
          accessLevel: userContext.accessLevel,
          accessibleBranches: userContext.accessibleBranches,
          managedBranches: userContext.managedBranches,
          roleAssigned: defaultRole?.name || null
        }
      }, { status: 201 })
    } catch (error) {
      console.error("Error creating user:", error)
      
      // Log system event for error
      await logSystemEvent('USER_CREATE_ERROR', context.agency?.id || '', {
        component: 'users-api',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
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