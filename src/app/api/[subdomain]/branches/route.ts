import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSubdomainForAPI } from "@/lib/utils"
import { simpleAuth } from "@/lib/simple-auth"
import { z } from "zod"

const branchSchema = z.object({
  name: z.string().min(1, "Branch name is required"),
  code: z.string().min(1, "Branch code is required"),
  type: z.enum(["MAIN", "BRANCH", "FRANCHISE", "PARTNER"]).optional(),
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

// Enhanced branches API that works for any subdomain
export const GET = simpleAuth(async (request: NextRequest, context) => {
  try {
    const { agency } = context
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search")
    const status = searchParams.get("status")
    const type = searchParams.get("type")
    
    const subdomain = agency.subdomain

    console.log(`Branches API called for subdomain: ${subdomain}, agency: ${agency.id}`)

    // Check if agency exists for this subdomain
    const agencyData = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!agencyData) {
      // If agency doesn't exist, create demo data for development
      const newAgency = await db.agency.create({
        data: {
          name: `${subdomain.charAt(0).toUpperCase() + subdomain.slice(1)} Education Agency`,
          subdomain: subdomain,
          customDomain: null,
          primaryColor: '#3B82F6',
          secondaryColor: '#10B981',
          status: 'ACTIVE',
          plan: 'FREE'
        }
      })
      
      const demoBranch = await db.branch.create({
        data: {
          agencyId: newAgency.id, // Use the real agency ID
          name: `${subdomain.charAt(0).toUpperCase() + subdomain.slice(1)} Main Office`,
          code: 'MAIN',
          type: 'MAIN',
          status: 'ACTIVE',
          email: `info@${subdomain}.com`,
          phone: '+1 (555) 123-4567',
          address: '123 Business Avenue',
          city: 'New York',
          state: 'NY',
          country: 'US',
          postalCode: '10001',
          maxStudents: 1000,
          maxStaff: 50,
          description: `Main headquarters of ${subdomain.charAt(0).toUpperCase() + subdomain.slice(1)} Education Agency`,
          features: JSON.stringify([]),
          settings: JSON.stringify({}),
          businessHours: JSON.stringify({})
        }
      })

      console.log(`Created demo agency and branch for subdomain: ${subdomain}`)
      return NextResponse.json({
        branches: [{
          ...demoBranch,
          features: [],
          settings: {},
          businessHours: {},
          studentCount: 0,
          userCount: 1,
          applicationCount: 0,
          documentCount: 0,
          activeStudentCount: 0,
          activeUserCount: 1,
          manager: null,
          students: [],
          users: [],
          _count: {
            students: 0,
            users: 1
          }
        }],
        pagination: {
          page,
          limit,
          total: 1,
          pages: 1
        }
      })
    }

    // Build where clause
    const where: any = {
      agencyId: agencyData.id,
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

// Create a new branch
export const POST = simpleAuth(async (request: NextRequest, context) => {
  try {
    const { agency } = context
    const body = await request.json()
    const subdomain = agency.subdomain

    const validatedData = branchSchema.parse(body)

    // Get the actual agency from database to ensure we have the correct ID
    const actualAgency = await db.agency.findUnique({
      where: { subdomain }
    })

    if (!actualAgency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    // Validate branch code uniqueness within agency
    const existingBranch = await db.branch.findFirst({
      where: {
        agencyId: actualAgency.id,
        code: validatedData.code
      }
    })

    if (existingBranch) {
      return NextResponse.json({ error: "Branch code already exists" }, { status: 400 })
    }

    const newBranch = await db.branch.create({
      data: {
        agencyId: actualAgency.id,
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