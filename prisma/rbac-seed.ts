import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding RBAC data...')

  // Create default permissions
  const permissions = await Promise.all([
    // Core permissions
    prisma.permission.create({
      data: {
        name: 'View Users',
        slug: 'users:view',
        description: 'View user list and details',
        category: 'CORE',
        resource: 'users',
        action: 'read',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Create Users',
        slug: 'users:create',
        description: 'Create new users',
        category: 'CORE',
        resource: 'users',
        action: 'create',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Update Users',
        slug: 'users:update',
        description: 'Update user information',
        category: 'CORE',
        resource: 'users',
        action: 'update',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Delete Users',
        slug: 'users:delete',
        description: 'Delete users',
        category: 'CORE',
        resource: 'users',
        action: 'delete',
        isSystemPermission: true
      }
    }),

    // Student permissions
    prisma.permission.create({
      data: {
        name: 'View Students',
        slug: 'students:view',
        description: 'View student list and details',
        category: 'CRM',
        resource: 'students',
        action: 'read',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Create Students',
        slug: 'students:create',
        description: 'Create new student records',
        category: 'CRM',
        resource: 'students',
        action: 'create',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Update Students',
        slug: 'students:update',
        description: 'Update student information',
        category: 'CRM',
        resource: 'students',
        action: 'update',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Delete Students',
        slug: 'students:delete',
        description: 'Delete student records',
        category: 'CRM',
        resource: 'students',
        action: 'delete',
        isSystemPermission: true
      }
    }),

    // Application permissions
    prisma.permission.create({
      data: {
        name: 'View Applications',
        slug: 'applications:view',
        description: 'View application list and details',
        category: 'CRM',
        resource: 'applications',
        action: 'read',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Create Applications',
        slug: 'applications:create',
        description: 'Create new applications',
        category: 'CRM',
        resource: 'applications',
        action: 'create',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Update Applications',
        slug: 'applications:update',
        description: 'Update application information',
        category: 'CRM',
        resource: 'applications',
        action: 'update',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Delete Applications',
        slug: 'applications:delete',
        description: 'Delete applications',
        category: 'CRM',
        resource: 'applications',
        action: 'delete',
        isSystemPermission: true
      }
    }),

    // University permissions
    prisma.permission.create({
      data: {
        name: 'View Universities',
        slug: 'universities:view',
        description: 'View university list and details',
        category: 'CRM',
        resource: 'universities',
        action: 'read',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Create Universities',
        slug: 'universities:create',
        description: 'Create new university records',
        category: 'CRM',
        resource: 'universities',
        action: 'create',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Update Universities',
        slug: 'universities:update',
        description: 'Update university information',
        category: 'CRM',
        resource: 'universities',
        action: 'update',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Delete Universities',
        slug: 'universities:delete',
        description: 'Delete university records',
        category: 'CRM',
        resource: 'universities',
        action: 'delete',
        isSystemPermission: true
      }
    }),

    // RBAC Management permissions
    prisma.permission.create({
      data: {
        name: 'Manage Roles',
        slug: 'roles:manage',
        description: 'Create, update, and delete roles',
        category: 'ADMIN',
        resource: 'roles',
        action: 'manage',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Manage Permissions',
        slug: 'permissions:manage',
        description: 'Create, update, and delete permissions',
        category: 'ADMIN',
        resource: 'permissions',
        action: 'manage',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Assign Roles',
        slug: 'roles:assign',
        description: 'Assign roles to users',
        category: 'ADMIN',
        resource: 'user_roles',
        action: 'create',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'View Access Logs',
        slug: 'access_logs:view',
        description: 'View access audit logs',
        category: 'SECURITY',
        resource: 'access_audit_logs',
        action: 'read',
        isSystemPermission: true
      }
    }),

    // Agency Management permissions
    prisma.permission.create({
      data: {
        name: 'Manage Agency Settings',
        slug: 'agency:manage',
        description: 'Manage agency settings and configuration',
        category: 'ADMIN',
        resource: 'agencies',
        action: 'update',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Manage Branches',
        slug: 'branches:manage',
        description: 'Create, update, and delete branches',
        category: 'ADMIN',
        resource: 'branches',
        action: 'manage',
        isSystemPermission: true
      }
    }),

    // Billing permissions
    prisma.permission.create({
      data: {
        name: 'View Billing',
        slug: 'billing:view',
        description: 'View billing information and invoices',
        category: 'ACCOUNTING',
        resource: 'billing',
        action: 'read',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Manage Billing',
        slug: 'billing:manage',
        description: 'Manage billing and payments',
        category: 'ACCOUNTING',
        resource: 'billing',
        action: 'manage',
        isSystemPermission: true
      }
    }),

    // Analytics permissions
    prisma.permission.create({
      data: {
        name: 'View Analytics',
        slug: 'analytics:view',
        description: 'View agency analytics and reports',
        category: 'ANALYTICS',
        resource: 'analytics',
        action: 'read',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Export Reports',
        slug: 'reports:export',
        description: 'Export reports and data',
        category: 'ANALYTICS',
        resource: 'reports',
        action: 'export',
        isSystemPermission: true
      }
    })
  ])

  console.log(`Created ${permissions.length} permissions`)

  // Create default permission templates
  const templates = await Promise.all([
    prisma.permissionTemplate.create({
      data: {
        name: 'Agency Admin Template',
        description: 'Full access template for agency administrators',
        category: 'SYSTEM',
        isSystem: true
      }
    }),
    prisma.permissionTemplate.create({
      data: {
        name: 'Branch Manager Template',
        description: 'Template for branch managers with limited access',
        category: 'SYSTEM',
        isSystem: true
      }
    }),
    prisma.permissionTemplate.create({
      data: {
        name: 'Consultant Template',
        description: 'Template for consultants with basic CRM access',
        category: 'SYSTEM',
        isSystem: true
      }
    })
  ])

  console.log(`Created ${templates.length} permission templates`)

  console.log('RBAC seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })