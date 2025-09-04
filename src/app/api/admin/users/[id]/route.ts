import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Fetch user with comprehensive data
    const user = await db.user.findUnique({
      where: { id },
      include: {
        agency: {
          select: {
            id: true,
            name: true,
            subdomain: true,
            status: true,
            plan: true
          }
        },
        branch: {
          select: {
            id: true,
            name: true,
            agencyId: true
          }
        },
        _count: {
          select: {
            activityLogs: true,
            appointments: true,
            assignedTasks: true,
            createdTasks: true,
            taskComments: true,
            taskTimeLogs: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Get user's permissions
    const userPermissions = await db.userPermission.findMany({
      where: { userId: id },
      include: {
        permission: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true
          }
        }
      }
    })

    // Get user's role assignments
    const roleAssignments = await db.userRoleAssignment.findMany({
      where: { userId: id },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            description: true,
            permissions: true
          }
        }
      }
    })

    // Get recent activity
    const recentActivity = await db.activityLog.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Get user restrictions
    const restrictions = await db.userRestriction.findMany({
      where: { userId: id },
      include: {
        restriction: {
          select: {
            id: true,
            name: true,
            description: true,
            type: true
          }
        }
      }
    })

    // Get login statistics
    const loginStats = await db.activityLog.groupBy({
      by: ['createdAt'],
      where: {
        userId: id,
        action: 'USER_LOGIN'
      },
      _count: { createdAt: true },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          agency: user.agency,
          branch: user.branch,
          avatar: user.avatar,
          phone: user.phone,
          title: user.title,
          department: user.department,
          emailVerified: user.emailVerified,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        stats: {
          activityCount: user._count.activityLogs,
          appointmentsCount: user._count.appointments,
          assignedTasksCount: user._count.assignedTasks,
          createdTasksCount: user._count.createdTasks,
          taskCommentsCount: user._count.taskComments,
          taskTimeLogsCount: user._count.taskTimeLogs
        },
        permissions: userPermissions.map(up => ({
          id: up.id,
          permission: up.permission,
          grantedAt: up.grantedAt,
          expiresAt: up.expiresAt
        })),
        roleAssignments: roleAssignments.map(ra => ({
          id: ra.id,
          role: ra.role,
          assignedAt: ra.assignedAt,
          expiresAt: ra.expiresAt
        })),
        restrictions: restrictions.map(ur => ({
          id: ur.id,
          restriction: ur.restriction,
          restrictedAt: ur.restrictedAt,
          expiresAt: ur.expiresAt,
          reason: ur.reason
        })),
        recentActivity,
        loginStats: {
          totalLogins: loginStats.length,
          lastLogin: loginStats[0]?.createdAt,
          loginHistory: loginStats.slice(0, 10)
        }
      }
    })

  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const {
      name,
      email,
      role,
      status,
      agencyId,
      branchId,
      phone,
      title,
      department,
      password
    } = body

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id },
      include: { agency: true }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Check if email is already taken (if changing)
    if (email && email !== existingUser.email) {
      const emailExists = await db.user.findUnique({
        where: { email }
      })

      if (emailExists) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 }
        )
      }
    }

    // Check if agency exists (if changing)
    if (agencyId && agencyId !== existingUser.agencyId) {
      const agency = await db.agency.findUnique({
        where: { id: agencyId }
      })

      if (!agency) {
        return NextResponse.json(
          { error: "Agency not found" },
          { status: 404 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (role !== undefined) updateData.role = role
    if (status !== undefined) updateData.status = status
    if (agencyId !== undefined) updateData.agencyId = agencyId
    if (branchId !== undefined) updateData.branchId = branchId
    if (phone !== undefined) updateData.phone = phone
    if (title !== undefined) updateData.title = title
    if (department !== undefined) updateData.department = department

    // Hash password if provided
    if (password) {
      const bcrypt = await import('bcryptjs')
      updateData.password = await bcrypt.default.hash(password, 12)
    }

    // Update user
    const updatedUser = await db.user.update({
      where: { id },
      data: updateData
    })

    // Log the update
    await db.activityLog.create({
      data: {
        agencyId: existingUser.agencyId,
        userId: id,
        action: 'USER_UPDATED',
        entityType: 'User',
        entityId: id,
        changes: JSON.stringify({
          before: existingUser,
          after: updatedUser
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
          status: updatedUser.status,
          agencyId: updatedUser.agencyId,
          branchId: updatedUser.branchId,
          updatedAt: updatedUser.updatedAt
        }
      }
    })

  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            activityLogs: true,
            appointments: true,
            assignedTasks: true,
            createdTasks: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Prevent deletion if user has active data
    if (user._count.activityLogs > 0 || user._count.appointments > 0 || 
        user._count.assignedTasks > 0 || user._count.createdTasks > 0) {
      return NextResponse.json(
        { error: "Cannot delete user with active data. Consider deactivating instead." },
        { status: 400 }
      )
    }

    // Delete user
    await db.user.delete({
      where: { id }
    })

    // Log the deletion
    await db.activityLog.create({
      data: {
        agencyId: user.agencyId,
        userId: id,
        action: 'USER_DELETED',
        entityType: 'User',
        entityId: id,
        changes: JSON.stringify({
          deletedUser: {
            email: user.email,
            name: user.name,
            role: user.role
          }
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      success: true,
      message: "User deleted successfully"
    })

  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}