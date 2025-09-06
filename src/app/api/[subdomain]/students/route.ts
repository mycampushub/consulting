import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSubdomainForAPI } from "@/lib/utils"
import { requireEnhancedPermissions } from "@/lib/auth-middleware"
import { RBAC } from "@/lib/rbac-utils"
import { logCreation, logUpdate } from "@/lib/activity-logger"
import { requirePermissions } from "@/lib/auth-middleware"
import { z } from "zod"

const studentSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  nationality: z.string().optional(),
  passportNumber: z.string().optional(),
  status: z.enum(["PROSPECT", "APPLIED", "ACCEPTED", "ENROLLED", "GRADUATED", "WITHDRAWN"]).optional(),
  stage: z.enum(["INQUIRY", "CONSULTATION", "APPLICATION", "DOCUMENTATION", "VISA_PROCESSING", "PRE_DEPARTURE", "POST_ARRIVAL"]).optional(),
  currentEducation: z.string().optional(),
  gpa: z.number().min(0).max(4).optional(),
  testScores: z.string().optional(),
  preferredCountries: z.array(z.string()).optional(),
  preferredCourses: z.array(z.string()).optional(),
  budget: z.number().min(0).optional(),
  assignedTo: z.string().optional(),
  branchId: z.string().optional(),
  notes: z.string().optional(),
})

const updateStudentSchema = studentSchema.partial()

// Get all students for the agency with enhanced branch-based scoping
export const GET = requireEnhancedPermissions([
  RBAC.permissions.STUDENT_READ()
], {
  resourceType: "students",
  enableDataFiltering: true,
  auditLevel: "DETAILED",
  requireBranch: true
})(async (request: NextRequest, context) => {
  try {
    const { agency, user, accessibleBranches, branchAccessLevel } = context
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search")
    const status = searchParams.get("status")
    const stage = searchParams.get("stage")
    const assignedTo = searchParams.get("assignedTo")
    const branchId = searchParams.get("branchId")

    // Build base where clause with agency scope
    const where: any = {
      agencyId: agency.id,
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: "insensitive" as const } },
          { lastName: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } }
        ]
      }),
      ...(status && { status: status }),
      ...(stage && { stage: stage }),
      ...(assignedTo && { assignedTo: assignedTo })
    }

    // Apply enhanced branch-based filtering using new RBAC utils
    const enhancedWhere = await RBAC.dataFilter.applyBranchFilter(user.id, "students", where, {
      action: "read",
      includeAssigned: true
    })

    // Apply additional branch filtering if specified and user has permission
    if (branchId && accessibleBranches?.includes(branchId)) {
      enhancedWhere.branchId = branchId
    }

    // Calculate pagination
    const skip = (page - 1) * limit
    const orderBy: any = {}
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "desc"
    orderBy[sortBy] = sortOrder

    const [students, total] = await Promise.all([
      db.student.findMany({
        where: enhancedWhere,
        include: {
          branch: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          assignedUser: {
            select: {
              id: true,
              name: true,
              email: true,
              title: true
            }
          },
          applications: {
            include: {
              university: {
                select: {
                  id: true,
                  name: true,
                  country: true,
                  city: true
                }
              },
              campus: {
                select: {
                  id: true,
                  name: true
                }
              },
              subject: {
                select: {
                  id: true,
                  name: true,
                  level: true
                }
              }
            },
            orderBy: { createdAt: "desc" }
          },
          invoices: {
            orderBy: { createdAt: "desc" },
            take: 5
          },
          transactions: {
            orderBy: { createdAt: "desc" },
            take: 5
          },
          leads: {
            orderBy: { createdAt: "desc" },
            take: 3
          },
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  color: true
                }
              }
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      db.student.count({ where: enhancedWhere })
    ])

    // Parse JSON fields and apply field-level filtering
    const processedStudents = students.map(student => {
      const studentData = {
        ...student,
        preferredCountries: student.preferredCountries ? JSON.parse(student.preferredCountries) : [],
        preferredCourses: student.preferredCourses ? JSON.parse(student.preferredCourses) : [],
        testScores: student.testScores ? JSON.parse(student.testScores) : null,
        documents: student.documents ? JSON.parse(student.documents) : []
      }

      // Apply field-level filtering based on user permissions
      if (context.fieldPermissions?.length) {
        // Filter out fields that user doesn't have access to
        const allowedFields = ['id', 'firstName', 'lastName', 'email', 'status', 'stage', 'createdAt', 'updatedAt', ...context.fieldPermissions]
        const filteredStudent: any = {}
        allowedFields.forEach(field => {
          if (studentData[field] !== undefined) {
            filteredStudent[field] = studentData[field]
          }
        })
        return filteredStudent
      }
      
      return studentData
    })

    // Log the activity with branch context
    await logCreation({
      userId: user.id,
      agencyId: agency.id,
      branchId: user.branchId,
      entityType: "Student",
      resourceType: "students",
      changes: {
        action: "LIST_STUDENTS",
        filterCount: total,
        branchScope: branchAccessLevel,
        accessibleBranches: accessibleBranches?.length || 0,
        appliedFilters: Object.keys(enhancedWhere).filter(key => key !== 'agencyId')
      },
      ipAddress: context.requestMetadata?.ip,
      userAgent: context.requestMetadata?.userAgent
    }, {
      includeBranchContext: true,
      includeRBACContext: true,
      auditLevel: "DETAILED"
    })

    return NextResponse.json({
      students: processedStudents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      metadata: {
        branchScope: branchAccessLevel,
        accessibleBranches,
        appliedFilters: Object.keys(enhancedWhere).filter(key => key !== 'agencyId'),
        fieldPermissions: context.fieldPermissions || []
      }
    })
  } catch (error) {
    console.error("Error fetching students:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})

// Create a new student with enhanced RBAC checks
export const POST = requirePermissions([
  { resource: "students", action: "create" }
], {
  resourceType: "students",
  auditLevel: "COMPREHENSIVE",
  requireBranch: true
})(async (request: NextRequest, context) => {
  try {
    const { agency, user, accessibleBranches, branchAccessLevel } = context
    const body = await request.json()
    const validatedData = studentSchema.parse(body)

    // Validate branch access using enhanced RBAC validation
    if (validatedData.branchId) {
      const branchAccess = await RBAC.validateBranchAccess(
        user.id,
        validatedData.branchId,
        "manage"
      )

      if (!branchAccess.valid) {
        return NextResponse.json({ 
          error: "Branch access denied", 
          details: branchAccess.reason 
        }, { status: 403 })
      }
    } else {
      // If no branch specified, use the current user's branch
      validatedData.branchId = user.branchId
    }

    // Validate assigned user if provided
    if (validatedData.assignedTo) {
      const assignedUserAccess = await RBAC.validateBranchAccess(
        user.id,
        user.branchId, // Check if user can assign to users in their branch
        "manage"
      )

      if (!assignedUserAccess.valid) {
        return NextResponse.json({ 
          error: "Cannot assign to specified user", 
          details: "User assignment access denied" 
        }, { status: 403 })
      }
    } else {
      // If no assigned user, assign to current user
      validatedData.assignedTo = user.id
    }

    // Check if email already exists within the agency
    const existingStudent = await db.student.findFirst({
      where: {
        agencyId: agency.id,
        email: validatedData.email
      }
    })

    if (existingStudent) {
      return NextResponse.json({ error: "Student with this email already exists" }, { status: 400 })
    }

    const student = await db.student.create({
      data: {
        agencyId: agency.id,
        branchId: validatedData.branchId,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone,
        dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : null,
        nationality: validatedData.nationality,
        passportNumber: validatedData.passportNumber,
        status: validatedData.status || "PROSPECT",
        stage: validatedData.stage || "INQUIRY",
        currentEducation: validatedData.currentEducation,
        gpa: validatedData.gpa,
        testScores: validatedData.testScores,
        preferredCountries: validatedData.preferredCountries ? JSON.stringify(validatedData.preferredCountries) : null,
        preferredCourses: validatedData.preferredCourses ? JSON.stringify(validatedData.preferredCourses) : null,
        budget: validatedData.budget,
        assignedTo: validatedData.assignedTo,
        documents: JSON.stringify([]) // Initialize empty documents array
      },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
            title: true
          }
        },
        applications: {
          include: {
            university: true,
            campus: true,
            subject: true
          }
        },
        invoices: true,
        transactions: true,
        leads: true
      }
    })

    // Parse JSON fields for response
    const processedStudent = {
      ...student,
      preferredCountries: student.preferredCountries ? JSON.parse(student.preferredCountries) : [],
      preferredCourses: student.preferredCourses ? JSON.parse(student.preferredCourses) : [],
      testScores: student.testScores ? JSON.parse(student.testScores) : null,
      documents: student.documents ? JSON.parse(student.documents) : []
    }

    // Log enhanced activity with RBAC context
    await logCreation({
      userId: user.id,
      agencyId: agency.id,
      branchId: validatedData.branchId,
      entityType: "Student",
      entityId: student.id,
      resourceType: "students",
      resourceName: `${validatedData.firstName} ${validatedData.lastName}`,
      newValues: {
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        branchId: student.branchId,
        assignedTo: student.assignedTo,
        status: student.status,
        stage: student.stage
      },
      ipAddress: context.requestMetadata?.ip,
      userAgent: context.requestMetadata?.userAgent
    }, {
      includeBranchContext: true,
      includeRBACContext: true,
      auditLevel: "COMPREHENSIVE"
    })

    return NextResponse.json(processedStudent, { status: 201 })
  } catch (error) {
    console.error("Error creating student:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})