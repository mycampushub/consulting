import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSubdomainForAPI } from "@/lib/utils"
import { requireAuth, requireAgency, requirePermissions } from "@/lib/auth-middleware"
import { RBACService } from "@/lib/rbac"
import { z } from "zod"

const roleSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  description: z.string().optional(),
  slug: z.string().min(1, "Role slug is required"),
  level: z.number().int().min(0).default(0),
  scope: z.enum(["GLOBAL", "AGENCY", "BRANCH", "DEPARTMENT", "TEAM", "INDIVIDUAL"]).default("AGENCY"),
  branchId: z.string().optional(),
  parentId: z.string().optional(),
  permissions: z.array(z.object({
    permissionId: z.string(),
    accessLevel: z.enum(["NONE", "VIEW", "EDIT", "DELETE", "FULL", "CUSTOM"]).default("FULL"),
    conditions: z.record(z.any()).optional()
  })).optional()
})

const updateRoleSchema = roleSchema.partial().omit({ slug: true })

// Get all roles for the agency with hierarchy support
export const GET = requireAgency(
  requirePermissions([
    { resource: "roles", action: "read" }
  ])(async (request: NextRequest, context) => {
    try {
      const { agency, user, branch } = context
      const { searchParams } = new URL(request.url)
      const scope = searchParams.get("scope") as "AGENCY" | "BRANCH" | "ALL" || "ALL"
      const includeHierarchy = searchParams.get("includeHierarchy") === "true"

      // Build where clause with branch-based scoping
      const where: any = {
        agencyId: agency.id,
        isActive: true
      }

      // Apply branch-based scoping for non-admin users
      if (user.role !== "AGENCY_ADMIN" && user.role !== "SUPER_ADMIN") {
        if (scope === "BRANCH") {
          where.branchId = user.branchId
        } else {
          // Users can only see roles they have access to
          const accessibleBranches = await RBACService.getAccessibleBranches(user.id)
          where.OR = [
            { scope: "AGENCY" },
            { scope: "BRANCH", branchId: { in: accessibleBranches } },
            { branchId: { in: accessibleBranches } }
          ]
        }
      }

      if (includeHierarchy) {
        // Return hierarchy tree
        const roles = await RBACService.getRoleHierarchy(agency.id, scope === "BRANCH" ? user.branchId : undefined)
        return NextResponse.json({ roles })
      } else {
        // Return flat list
        const roles = await db.role.findMany({
          where,
          include: {
            parent: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            },
            children: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            },
            branch: {
              select: {
                id: true,
                name: true,
                code: true
              }
            },
            rolePermissions: {
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
              }
            },
            _count: {
              select: {
                userRoles: true
              }
            }
          },
          orderBy: [
            { level: "desc" },
            { name: "asc" }
          ]
        })

        return NextResponse.json({ roles })
      }
    } catch (error) {
      console.error("Error fetching roles:", error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  })
)

// Create a new role with proper RBAC checks
export const POST = requireAgency(
  requirePermissions([
    { resource: "roles", action: "create" }
  ])(async (request: NextRequest, context) => {
    try {
      const { agency, user, branch } = context
      const body = await request.json()
      const validatedData = roleSchema.parse(body)

      // Validate branch access if branchId is provided
      if (validatedData.branchId) {
        if (user.role === "AGENCY_ADMIN") {
          const targetBranch = await db.branch.findFirst({
            where: {
              id: validatedData.branchId,
              agencyId: agency.id
            }
          })
          if (!targetBranch) {
            return NextResponse.json({ error: "Branch not found" }, { status: 404 })
          }
        } else {
          // Regular users can only create roles for their own branch
          if (validatedData.branchId !== user.branchId) {
            return NextResponse.json({ error: "Cannot create role for different branch" }, { status: 403 })
          }
        }
      } else {
        // If no branch specified and scope is BRANCH, use user's branch
        if (validatedData.scope === "BRANCH") {
          validatedData.branchId = user.branchId
        }
      }

      // Validate parent role if provided
      if (validatedData.parentId) {
        const parentRole = await db.role.findFirst({
          where: {
            id: validatedData.parentId,
            agencyId: agency.id
          }
        })
        if (!parentRole) {
          return NextResponse.json({ error: "Parent role not found" }, { status: 404 })
        }

        // Check if user can access parent role
        const canManageParent = await RBACService.canManageRole(user.id, validatedData.parentId)
        if (!canManageParent) {
          return NextResponse.json({ error: "Cannot manage parent role" }, { status: 403 })
        }
      }

      // Check if role slug already exists within the agency
      const existingRole = await db.role.findFirst({
        where: {
          agencyId: agency.id,
          slug: validatedData.slug
        }
      })

      if (existingRole) {
        return NextResponse.json({ error: "Role with this slug already exists" }, { status: 400 })
      }

      const newRole = await RBACService.createRole({
        agencyId: agency.id,
        name: validatedData.name,
        description: validatedData.description,
        slug: validatedData.slug,
        level: validatedData.level,
        scope: validatedData.scope,
        branchId: validatedData.branchId,
        parentId: validatedData.parentId,
        permissions: validatedData.permissions
      })

      // Log activity
      await db.activityLog.create({
        data: {
          agencyId: agency.id,
          userId: user.id,
          action: "ROLE_CREATED",
          entityType: "Role",
          entityId: newRole.id,
          changes: JSON.stringify({
            name: newRole.name,
            slug: newRole.slug,
            scope: newRole.scope,
            branchId: newRole.branchId,
            parentId: newRole.parentId
          })
        }
      })

      return NextResponse.json(newRole, { status: 201 })
    } catch (error) {
      console.error("Error creating role:", error)
      
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