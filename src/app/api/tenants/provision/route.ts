import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const provisionSchema = z.object({
  agencyId: z.string(),
  customDomain: z.string().optional(),
  enableFeatures: z.object({
    crm: z.boolean().default(true),
    universityPartnerships: z.boolean().default(true),
    visaProcessing: z.boolean().default(true),
    billing: z.boolean().default(true),
    analytics: z.boolean().default(true)
  }).optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = provisionSchema.parse(body)

    // Get agency details
    const agency = await db.agency.findUnique({
      where: { id: validatedData.agencyId },
      include: {
        brandSettings: true,
        billing: true,
        users: {
          where: { role: 'AGENCY_ADMIN' }
        }
      }
    })

    if (!agency) {
      return NextResponse.json(
        { error: 'Agency not found' },
        { status: 404 }
      )
    }

    // Validate custom domain if provided
    if (validatedData.customDomain) {
      const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
      if (!domainRegex.test(validatedData.customDomain)) {
        return NextResponse.json(
          { error: 'Invalid custom domain format' },
          { status: 400 }
        )
      }

      // Check if custom domain is already taken
      const existingDomain = await db.agency.findFirst({
        where: { 
          customDomain: validatedData.customDomain,
          id: { not: validatedData.agencyId }
        }
      })

      if (existingDomain) {
        return NextResponse.json(
          { error: 'Custom domain is already taken' },
          { status: 400 }
        )
      }
    }

    // Update agency with custom domain if provided
    if (validatedData.customDomain) {
      await db.agency.update({
        where: { id: validatedData.agencyId },
        data: {
          customDomain: validatedData.customDomain,
          status: 'ACTIVE'
        }
      })
    } else {
      // Activate agency with subdomain
      await db.agency.update({
        where: { id: validatedData.agencyId },
        data: { status: 'ACTIVE' }
      })
    }

    // Create default university partnerships (sample data)
    const defaultUniversities = [
      {
        name: "Harvard University",
        country: "United States",
        city: "Cambridge",
        website: "https://harvard.edu",
        description: "World-renowned research university",
        worldRanking: 1,
        partnershipLevel: "BASIC"
      },
      {
        name: "University of Oxford",
        country: "United Kingdom",
        city: "Oxford",
        website: "https://ox.ac.uk",
        description: "Oldest university in the English-speaking world",
        worldRanking: 2,
        partnershipLevel: "BASIC"
      },
      {
        name: "Stanford University",
        country: "United States",
        city: "Stanford",
        website: "https://stanford.edu",
        description: "Leading research and teaching institution",
        worldRanking: 3,
        partnershipLevel: "BASIC"
      },
      {
        name: "MIT",
        country: "United States",
        city: "Cambridge",
        website: "https://mit.edu",
        description: "Premier institution for science and technology",
        worldRanking: 4,
        partnershipLevel: "BASIC"
      },
      {
        name: "University of Cambridge",
        country: "United Kingdom",
        city: "Cambridge",
        website: "https://cam.ac.uk",
        description: "One of the world's oldest universities",
        worldRanking: 5,
        partnershipLevel: "BASIC"
      }
    ]

    await Promise.all(
      defaultUniversities.map(uni =>
        db.university.create({
          data: {
            agencyId: validatedData.agencyId,
            ...uni
          }
        })
      )
    )

    // Create default roles and permissions
    const defaultRoles = [
      {
        name: "Senior Consultant",
        slug: "senior-consultant",
        description: "Experienced education consultant with full access",
        level: 2,
        permissions: ["students.read", "students.write", "applications.read", "applications.write", "universities.read"]
      },
      {
        name: "Junior Consultant", 
        slug: "junior-consultant",
        description: "Junior consultant with limited access",
        level: 1,
        permissions: ["students.read", "applications.read", "universities.read"]
      },
      {
        name: "Support Staff",
        slug: "support-staff", 
        description: "Support staff with basic access",
        level: 0,
        permissions: ["students.read"]
      }
    ]

    // Create permissions if they don't exist
    const permissionMap = new Map()
    const allPermissions = [
      "students.read", "students.write", "applications.read", "applications.write", "universities.read"
    ]

    for (const permissionName of allPermissions) {
      const [resource, action] = permissionName.split('.')
      let permission = await db.permission.findFirst({
        where: { 
          AND: [
            { resource },
            { action }
          ]
        }
      })

      if (!permission) {
        permission = await db.permission.create({
          data: {
            resource,
            action,
            name: `${resource.charAt(0).toUpperCase() + resource.slice(1)} ${action.charAt(0).toUpperCase() + action.slice(1)}`,
            description: `Permission to ${action} ${resource}`
          }
        })
      }
      permissionMap.set(permissionName, permission.id)
    }

    // Create roles with permissions
    for (const roleData of defaultRoles) {
      const role = await db.role.create({
        data: {
          agencyId: validatedData.agencyId,
          name: roleData.name,
          slug: roleData.slug,
          description: roleData.description,
          level: roleData.level,
          scope: 'AGENCY'
        }
      })

      // Assign permissions to role
      for (const permissionName of roleData.permissions) {
        const permissionId = permissionMap.get(permissionName)
        if (permissionId) {
          await db.rolePermission.create({
            data: {
              roleId: role.id,
              permissionId: permissionId,
              agencyId: validatedData.agencyId,
              accessLevel: 'FULL'
            }
          })
        }
      }
    }

    // Log provisioning activity
    await db.activityLog.create({
      data: {
        agencyId: validatedData.agencyId,
        userId: agency.users[0]?.id,
        action: 'TENANT_PROVISIONED',
        entityType: 'Agency',
        entityId: validatedData.agencyId,
        changes: JSON.stringify({
          customDomain: validatedData.customDomain,
          features: validatedData.enableFeatures,
          universitiesCreated: defaultUniversities.length,
          rolesCreated: defaultRoles.length,
          permissionsCreated: allPermissions.length
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Tenant provisioned successfully',
      tenant: {
        id: agency.id,
        name: agency.name,
        subdomain: agency.subdomain,
        customDomain: validatedData.customDomain,
        status: 'ACTIVE',
        accessUrl: validatedData.customDomain 
          ? `https://${validatedData.customDomain}`
          : `https://${agency.subdomain}.eduagency.com`
      },
      provisioning: {
        universitiesCreated: defaultUniversities.length,
        rolesCreated: defaultRoles.length,
        permissionsCreated: allPermissions.length,
        featuresEnabled: validatedData.enableFeatures || {
          crm: true,
          universityPartnerships: true,
          visaProcessing: true,
          billing: true,
          analytics: true
        }
      }
    })

  } catch (error) {
    console.error('Tenant provisioning error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}