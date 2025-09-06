import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding RBAC data...')

  // Create comprehensive permissions for all modules
  const permissions = await Promise.all([
    // Core System Permissions
    prisma.permission.create({
      data: {
        name: 'View System',
        slug: 'system:view',
        description: 'View system information and status',
        category: 'CORE',
        resource: 'system',
        action: 'read',
        isSystemPermission: true
      }
    }),

    // User Management Permissions
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
    prisma.permission.create({
      data: {
        name: 'Manage User Roles',
        slug: 'users:manage_roles',
        description: 'Assign and manage user roles',
        category: 'CORE',
        resource: 'users',
        action: 'manage',
        isSystemPermission: true
      }
    }),

    // Student Management Permissions
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
    prisma.permission.create({
      data: {
        name: 'Assign Students',
        slug: 'students:assign',
        description: 'Assign students to consultants',
        category: 'CRM',
        resource: 'students',
        action: 'assign',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Export Student Data',
        slug: 'students:export',
        description: 'Export student data and reports',
        category: 'CRM',
        resource: 'students',
        action: 'export',
        isSystemPermission: true
      }
    }),

    // Application Management Permissions
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
    prisma.permission.create({
      data: {
        name: 'Submit Applications',
        slug: 'applications:submit',
        description: 'Submit applications to universities',
        category: 'CRM',
        resource: 'applications',
        action: 'submit',
        isSystemPermission: true
      }
    }),

    // University Management Permissions
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
    prisma.permission.create({
      data: {
        name: 'Manage Partnerships',
        slug: 'universities:manage_partnerships',
        description: 'Manage university partnerships and commissions',
        category: 'CRM',
        resource: 'universities',
        action: 'manage',
        isSystemPermission: true
      }
    }),

    // Branch Management Permissions
    prisma.permission.create({
      data: {
        name: 'View Branches',
        slug: 'branches:view',
        description: 'View branch list and details',
        category: 'ADMIN',
        resource: 'branches',
        action: 'read',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Create Branches',
        slug: 'branches:create',
        description: 'Create new branches',
        category: 'ADMIN',
        resource: 'branches',
        action: 'create',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Update Branches',
        slug: 'branches:update',
        description: 'Update branch information',
        category: 'ADMIN',
        resource: 'branches',
        action: 'update',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Delete Branches',
        slug: 'branches:delete',
        description: 'Delete branches',
        category: 'ADMIN',
        resource: 'branches',
        action: 'delete',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Manage Branch Staff',
        slug: 'branches:manage_staff',
        description: 'Manage branch staff and assignments',
        category: 'ADMIN',
        resource: 'branches',
        action: 'manage',
        isSystemPermission: true
      }
    }),

    // RBAC Management Permissions
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

    // Agency Management Permissions
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
        name: 'View Agency Analytics',
        slug: 'agency:analytics',
        description: 'View agency-wide analytics and reports',
        category: 'ANALYTICS',
        resource: 'agencies',
        action: 'read',
        isSystemPermission: true
      }
    }),

    // Billing and Accounting Permissions
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
    prisma.permission.create({
      data: {
        name: 'Create Invoices',
        slug: 'invoices:create',
        description: 'Create new invoices',
        category: 'ACCOUNTING',
        resource: 'invoices',
        action: 'create',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'View Invoices',
        slug: 'invoices:view',
        description: 'View invoices and payment history',
        category: 'ACCOUNTING',
        resource: 'invoices',
        action: 'read',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Manage Invoices',
        slug: 'invoices:manage',
        description: 'Manage invoices and payments',
        category: 'ACCOUNTING',
        resource: 'invoices',
        action: 'manage',
        isSystemPermission: true
      }
    }),

    // Task Management Permissions
    prisma.permission.create({
      data: {
        name: 'View Tasks',
        slug: 'tasks:view',
        description: 'View task list and details',
        category: 'CRM',
        resource: 'tasks',
        action: 'read',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Create Tasks',
        slug: 'tasks:create',
        description: 'Create new tasks',
        category: 'CRM',
        resource: 'tasks',
        action: 'create',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Update Tasks',
        slug: 'tasks:update',
        description: 'Update task information',
        category: 'CRM',
        resource: 'tasks',
        action: 'update',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Delete Tasks',
        slug: 'tasks:delete',
        description: 'Delete tasks',
        category: 'CRM',
        resource: 'tasks',
        action: 'delete',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Assign Tasks',
        slug: 'tasks:assign',
        description: 'Assign tasks to users',
        category: 'CRM',
        resource: 'tasks',
        action: 'assign',
        isSystemPermission: true
      }
    }),

    // Document Management Permissions
    prisma.permission.create({
      data: {
        name: 'View Documents',
        slug: 'documents:view',
        description: 'View document list and details',
        category: 'CRM',
        resource: 'documents',
        action: 'read',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Upload Documents',
        slug: 'documents:upload',
        description: 'Upload new documents',
        category: 'CRM',
        resource: 'documents',
        action: 'create',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Update Documents',
        slug: 'documents:update',
        description: 'Update document information',
        category: 'CRM',
        resource: 'documents',
        action: 'update',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Delete Documents',
        slug: 'documents:delete',
        description: 'Delete documents',
        category: 'CRM',
        resource: 'documents',
        action: 'delete',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Share Documents',
        slug: 'documents:share',
        description: 'Share documents with users/students',
        category: 'CRM',
        resource: 'documents',
        action: 'share',
        isSystemPermission: true
      }
    }),

    // Communications Permissions
    prisma.permission.create({
      data: {
        name: 'View Communications',
        slug: 'communications:view',
        description: 'View communication history',
        category: 'COMMUNICATIONS',
        resource: 'communications',
        action: 'read',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Send Emails',
        slug: 'communications:send_email',
        description: 'Send email communications',
        category: 'COMMUNICATIONS',
        resource: 'communications',
        action: 'create',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Send SMS',
        slug: 'communications:send_sms',
        description: 'Send SMS communications',
        category: 'COMMUNICATIONS',
        resource: 'communications',
        action: 'create',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Manage Templates',
        slug: 'communications:manage_templates',
        description: 'Manage email and SMS templates',
        category: 'COMMUNICATIONS',
        resource: 'communications',
        action: 'manage',
        isSystemPermission: true
      }
    }),

    // Marketing Permissions
    prisma.permission.create({
      data: {
        name: 'View Marketing',
        slug: 'marketing:view',
        description: 'View marketing campaigns and analytics',
        category: 'MARKETING',
        resource: 'marketing',
        action: 'read',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Manage Campaigns',
        slug: 'marketing:manage_campaigns',
        description: 'Create and manage marketing campaigns',
        category: 'MARKETING',
        resource: 'marketing',
        action: 'manage',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Manage Leads',
        slug: 'marketing:manage_leads',
        description: 'Manage marketing leads',
        category: 'MARKETING',
        resource: 'leads',
        action: 'manage',
        isSystemPermission: true
      }
    }),

    // Analytics and Reporting Permissions
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
    }),
    prisma.permission.create({
      data: {
        name: 'Create Reports',
        slug: 'reports:create',
        description: 'Create custom reports',
        category: 'ANALYTICS',
        resource: 'reports',
        action: 'create',
        isSystemPermission: true
      }
    }),

    // Workflow Permissions
    prisma.permission.create({
      data: {
        name: 'View Workflows',
        slug: 'workflows:view',
        description: 'View workflow definitions and executions',
        category: 'AUTOMATION',
        resource: 'workflows',
        action: 'read',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Create Workflows',
        slug: 'workflows:create',
        description: 'Create new workflows',
        category: 'AUTOMATION',
        resource: 'workflows',
        action: 'create',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Update Workflows',
        slug: 'workflows:update',
        description: 'Update workflow definitions',
        category: 'AUTOMATION',
        resource: 'workflows',
        action: 'update',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Execute Workflows',
        slug: 'workflows:execute',
        description: 'Execute workflow instances',
        category: 'AUTOMATION',
        resource: 'workflows',
        action: 'execute',
        isSystemPermission: true
      }
    }),

    // Integration Permissions
    prisma.permission.create({
      data: {
        name: 'View Integrations',
        slug: 'integrations:view',
        description: 'View third-party integrations',
        category: 'INTEGRATIONS',
        resource: 'integrations',
        action: 'read',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Manage Integrations',
        slug: 'integrations:manage',
        description: 'Configure and manage integrations',
        category: 'INTEGRATIONS',
        resource: 'integrations',
        action: 'manage',
        isSystemPermission: true
      }
    }),

    // Event Management Permissions
    prisma.permission.create({
      data: {
        name: 'View Events',
        slug: 'events:view',
        description: 'View events and registrations',
        category: 'CRM',
        resource: 'events',
        action: 'read',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Create Events',
        slug: 'events:create',
        description: 'Create new events',
        category: 'CRM',
        resource: 'events',
        action: 'create',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Update Events',
        slug: 'events:update',
        description: 'Update event information',
        category: 'CRM',
        resource: 'events',
        action: 'update',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Delete Events',
        slug: 'events:delete',
        description: 'Delete events',
        category: 'CRM',
        resource: 'events',
        action: 'delete',
        isSystemPermission: true
      }
    }),

    // Form Management Permissions
    prisma.permission.create({
      data: {
        name: 'View Forms',
        slug: 'forms:view',
        description: 'View forms and submissions',
        category: 'CRM',
        resource: 'forms',
        action: 'read',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Create Forms',
        slug: 'forms:create',
        description: 'Create new forms',
        category: 'CRM',
        resource: 'forms',
        action: 'create',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Update Forms',
        slug: 'forms:update',
        description: 'Update form definitions',
        category: 'CRM',
        resource: 'forms',
        action: 'update',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Delete Forms',
        slug: 'forms:delete',
        description: 'Delete forms',
        category: 'CRM',
        resource: 'forms',
        action: 'delete',
        isSystemPermission: true
      }
    }),

    // Knowledge Base Permissions
    prisma.permission.create({
      data: {
        name: 'View Knowledge Base',
        slug: 'knowledge:view',
        description: 'View knowledge base articles',
        category: 'CRM',
        resource: 'knowledge',
        action: 'read',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Create Articles',
        slug: 'knowledge:create',
        description: 'Create knowledge base articles',
        category: 'CRM',
        resource: 'knowledge',
        action: 'create',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Update Articles',
        slug: 'knowledge:update',
        description: 'Update knowledge base articles',
        category: 'CRM',
        resource: 'knowledge',
        action: 'update',
        isSystemPermission: true
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Delete Articles',
        slug: 'knowledge:delete',
        description: 'Delete knowledge base articles',
        category: 'CRM',
        resource: 'knowledge',
        action: 'delete',
        isSystemPermission: true
      }
    })
  ])

  console.log(`Created ${permissions.length} permissions`)

  // Create comprehensive permission templates
  const templates = await Promise.all([
    prisma.permissionTemplate.create({
      data: {
        name: 'Super Admin Template',
        description: 'Full access template for super administrators',
        category: 'SYSTEM',
        isSystem: true
      }
    }),
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
        description: 'Template for branch managers with branch-level access',
        category: 'SYSTEM',
        isSystem: true
      }
    }),
    prisma.permissionTemplate.create({
      data: {
        name: 'Senior Consultant Template',
        description: 'Template for senior consultants with advanced CRM access',
        category: 'ROLE_SPECIFIC',
        isSystem: true
      }
    }),
    prisma.permissionTemplate.create({
      data: {
        name: 'Consultant Template',
        description: 'Template for consultants with basic CRM access',
        category: 'ROLE_SPECIFIC',
        isSystem: true
      }
    }),
    prisma.permissionTemplate.create({
      data: {
        name: 'Support Staff Template',
        description: 'Template for support staff with limited access',
        category: 'ROLE_SPECIFIC',
        isSystem: true
      }
    }),
    prisma.permissionTemplate.create({
      data: {
        name: 'Read Only Template',
        description: 'Template for users with read-only access',
        category: 'CUSTOM',
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