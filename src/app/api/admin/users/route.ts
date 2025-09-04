import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const agencyId = searchParams.get('agencyId')
    const role = searchParams.get('role')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Build where clause for filtering
    const where: any = {}
    
    if (agencyId && agencyId !== 'all') {
      where.agencyId = agencyId
    }
    
    if (role && role !== 'all') {
      where.role = role
    }
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { agency: { name: { contains: search, mode: 'insensitive' } } }
      ]
    }

    // Fetch users with related data
    const [users, totalCount] = await Promise.all([
      db.user.findMany({
        where,
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
              name: true
            }
          },
          _count: {
            select: {
              activityLogs: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.user.count({ where })
    ])

    // Get additional user metrics
    const usersWithMetrics = await Promise.all(
      users.map(async (user) => {
        // Get recent activity
        const recentActivity = await db.activityLog.findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' }
        })

        // Get login statistics
        const loginCount = await db.activityLog.count({
          where: {
            userId: user.id,
            action: 'USER_LOGIN'
          }
        })

        // Get user's role assignments
        const roleAssignments = await db.userRoleAssignment.findMany({
          where: { userId: user.id },
          include: {
            role: {
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          }
        })

        return {
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
          updatedAt: user.updatedAt,
          metrics: {
            activityCount: user._count.activityLogs,
            loginCount,
            lastActivity: recentActivity?.createdAt
          },
          roleAssignments: roleAssignments.map(ra => ({
            id: ra.id,
            role: ra.role,
            assignedAt: ra.assignedAt
          }))
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: {
        users: usersWithMetrics,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      }
    })

  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      name,
      password,
      role = 'AGENCY_USER',
      agencyId,
      branchId,
      phone,
      title,
      department
    } = body

    // Validate required fields
    if (!email || !name || !password || !agencyId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if user email already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User email already exists" },
        { status: 400 }
      )
    }

    // Check if agency exists
    const agency = await db.agency.findUnique({
      where: { id: agencyId }
    })

    if (!agency) {
      return NextResponse.json(
        { error: "Agency not found" },
        { status: 404 }
      )
    }

    // Check if branch exists (if provided)
    if (branchId) {
      const branch = await db.branch.findUnique({
        where: { id: branchId }
      })

      if (!branch) {
        return NextResponse.json(
          { error: "Branch not found" },
          { status: 404 }
        )
      }
    }

    // Hash password
    const bcrypt = await import('bcryptjs')
    const hashedPassword = await bcrypt.default.hash(password, 12)

    // Create user
    const user = await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
        status: 'ACTIVE',
        agencyId,
        branchId,
        phone,
        title,
        department,
        emailVerified: false
      }
    })

    // Log the user creation
    await db.activityLog.create({
      data: {
        agencyId,
        userId: user.id,
        action: 'USER_CREATED',
        entityType: 'User',
        entityId: user.id,
        changes: JSON.stringify({
          email,
          name,
          role,
          agencyId,
          branchId
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
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
          agencyId: user.agencyId,
          branchId: user.branchId,
          createdAt: user.createdAt
        }
      }
    })

  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}