import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSubdomainForAPI } from "@/lib/utils"
import { z } from "zod"
import bcrypt from "bcryptjs"

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["AGENCY_ADMIN", "CONSULTANT", "SUPPORT", "STUDENT"]).optional(),
  title: z.string().optional(),
  department: z.string().optional(),
  phone: z.string().optional()
})

const updateUserSchema = userSchema.partial().omit({ password: true })

export async function GET(request: NextRequest) {
  try {
    // Simple subdomain extraction from URL path
    const url = new URL(request.url)
    const pathname = url.pathname
    const pathParts = pathname.split('/').filter(Boolean)
    let subdomain = null
    
    // Extract subdomain from path like /api/testagency/users
    if (pathParts.length > 1 && pathParts[0] === 'api') {
      subdomain = pathParts[1]
    }
    
    console.log('Users API - Path:', pathname, 'Subdomain:', subdomain)
    
    if (!subdomain) {
      return NextResponse.json({ error: "Subdomain required", debug: { pathname, pathParts } }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    // For now, return mock data to test if the API works
    const mockUsers = [
      {
        id: '1',
        name: 'Demo Admin',
        email: 'admin@demo.com',
        role: 'AGENCY_ADMIN',
        status: 'ACTIVE',
        title: 'System Administrator',
        department: 'Management',
        avatar: null,
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'consultant1@demo.com',
        role: 'CONSULTANT',
        status: 'ACTIVE',
        title: 'Senior Education Consultant',
        department: 'Consulting',
        avatar: null,
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Michael Chen',
        email: 'consultant2@demo.com',
        role: 'CONSULTANT',
        status: 'ACTIVE',
        title: 'Education Consultant',
        department: 'Consulting',
        avatar: null,
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: '4',
        name: 'Emily Davis',
        email: 'support1@demo.com',
        role: 'SUPPORT',
        status: 'ACTIVE',
        title: 'Student Support Specialist',
        department: 'Support',
        avatar: null,
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }
    ]

    return NextResponse.json({
      users: mockUsers,
      pagination: {
        page,
        limit,
        total: mockUsers.length,
        pages: 1
      }
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Simple subdomain extraction from URL path
    const url = new URL(request.url)
    const pathname = url.pathname
    const pathParts = pathname.split('/').filter(Boolean)
    let subdomain = null
    
    // Extract subdomain from path like /api/testagency/users
    if (pathParts.length > 1 && pathParts[0] === 'api') {
      subdomain = pathParts[1]
    }
    
    console.log('Users API POST - Path:', pathname, 'Subdomain:', subdomain)
    
    if (!subdomain) {
      return NextResponse.json({ error: "Subdomain required", debug: { pathname, pathParts } }, { status: 400 })
    }

    const body = await request.json()
    const validatedData = userSchema.parse(body)

    const agency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    // Check if email already exists
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

    const user = await db.user.create({
      data: {
        agencyId: agency.id,
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
        lastLoginAt: true,
        createdAt: true
      }
    })

    // Log activity
    await db.activityLog.create({
      data: {
        agencyId: agency.id,
        userId: user.id,
        action: "USER_CREATED",
        entityType: "User",
        entityId: user.id,
        changes: JSON.stringify({
          name: user.name,
          email: user.email,
          role: user.role
        })
      }
    })

    return NextResponse.json(user)
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
}