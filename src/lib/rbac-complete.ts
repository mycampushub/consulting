import { db } from './db'
import { RBACService, type RBACContext, type PermissionCheck, type AccessDecision } from './rbac'
import { EnhancedRBAC, type EnhancedRBACContext } from './enhanced-rbac'

export interface CompletePermissionCheck extends PermissionCheck {
  resourceType?: string
  scope?: 'GLOBAL' | 'AGENCY' | 'BRANCH' | 'OWN' | 'ASSIGNED'
  conditions?: Record<string, any>
}

export interface CompleteAccessDecision extends AccessDecision {
  accessibleBranches?: string[]
  branchScope?: 'GLOBAL' | 'AGENCY' | 'BRANCH' | 'OWN' | 'ASSIGNED'
  appliedRules?: string[]
  dataFilters?: Record<string, any>
  fieldPermissions?: Record<string, string[]>
  auditLevel?: 'BASIC' | 'DETAILED' | 'COMPREHENSIVE'
}

export interface CompleteRBACContext extends EnhancedRBACContext {
  resourceType?: string
  scope?: 'GLOBAL' | 'AGENCY' | 'BRANCH' | 'OWN' | 'ASSIGNED'
  auditLevel?: 'BASIC' | 'DETAILED' | 'COMPREHENSIVE'
  enableDataFiltering?: boolean
  validateResourceAccess?: boolean
}

/**
 * Complete RBAC system that unifies basic and enhanced RBAC functionality
 */
export class CompleteRBAC {
  private static initialized = false
  private static defaultPermissions: any[] = []
  private static defaultRoles: any[] = []

  /**
   * Initialize the RBAC system with default permissions and roles
   */
  static async initialize(): Promise<void> {
    if (this.initialized) {
      return
    }

    try {
      // Load default permissions and roles
      await this.loadDefaults()
      this.initialized = true
      console.log('Complete RBAC system initialized successfully')
    } catch (error) {
      console.error('Error initializing Complete RBAC system:', error)
      throw error
    }
  }

  /**
   * Load default permissions and roles
   */
  private static async loadDefaults(): Promise<void> {
    // Define default permissions
    this.defaultPermissions = [
      // Core permissions
      { slug: 'users.read', name: 'Read Users', resource: 'users', action: 'read', category: 'CORE' },
      { slug: 'users.create', name: 'Create Users', resource: 'users', action: 'create', category: 'CORE' },
      { slug: 'users.update', name: 'Update Users', resource: 'users', action: 'update', category: 'CORE' },
      { slug: 'users.delete', name: 'Delete Users', resource: 'users', action: 'delete', category: 'CORE' },
      { slug: 'users.manage', name: 'Manage Users', resource: 'users', action: 'manage', category: 'CORE' },

      // Student permissions
      { slug: 'students.read', name: 'Read Students', resource: 'students', action: 'read', category: 'CRM' },
      { slug: 'students.create', name: 'Create Students', resource: 'students', action: 'create', category: 'CRM' },
      { slug: 'students.update', name: 'Update Students', resource: 'students', action: 'update', category: 'CRM' },
      { slug: 'students.delete', name: 'Delete Students', resource: 'students', action: 'delete', category: 'CRM' },
      { slug: 'students.manage', name: 'Manage Students', resource: 'students', action: 'manage', category: 'CRM' },

      // Branch permissions
      { slug: 'branches.read', name: 'Read Branches', resource: 'branches', action: 'read', category: 'CORE' },
      { slug: 'branches.create', name: 'Create Branches', resource: 'branches', action: 'create', category: 'CORE' },
      { slug: 'branches.update', name: 'Update Branches', resource: 'branches', action: 'update', category: 'CORE' },
      { slug: 'branches.delete', name: 'Delete Branches', resource: 'branches', action: 'delete', category: 'CORE' },
      { slug: 'branches.manage', name: 'Manage Branches', resource: 'branches', action: 'manage', category: 'CORE' },

      // Application permissions
      { slug: 'applications.read', name: 'Read Applications', resource: 'applications', action: 'read', category: 'CRM' },
      { slug: 'applications.create', name: 'Create Applications', resource: 'applications', action: 'create', category: 'CRM' },
      { slug: 'applications.update', name: 'Update Applications', resource: 'applications', action: 'update', category: 'CRM' },
      { slug: 'applications.delete', name: 'Delete Applications', resource: 'applications', action: 'delete', category: 'CRM' },
      { slug: 'applications.manage', name: 'Manage Applications', resource: 'applications', action: 'manage', category: 'CRM' },

      // Financial permissions
      { slug: 'invoices.read', name: 'Read Invoices', resource: 'invoices', action: 'read', category: 'ACCOUNTING' },
      { slug: 'invoices.create', name: 'Create Invoices', resource: 'invoices', action: 'create', category: 'ACCOUNTING' },
      { slug: 'invoices.update', name: 'Update Invoices', resource: 'invoices', action: 'update', category: 'ACCOUNTING' },
      { slug: 'invoices.delete', name: 'Delete Invoices', resource: 'invoices', action: 'delete', category: 'ACCOUNTING' },
      { slug: 'invoices.manage', name: 'Manage Invoices', resource: 'invoices', action: 'manage', category: 'ACCOUNTING' },

      { slug: 'transactions.read', name: 'Read Transactions', resource: 'transactions', action: 'read', category: 'ACCOUNTING' },
      { slug: 'transactions.create', name: 'Create Transactions', resource: 'transactions', action: 'create', category: 'ACCOUNTING' },
      { slug: 'transactions.update', name: 'Update Transactions', resource: 'transactions', action: 'update', category: 'ACCOUNTING' },
      { slug: 'transactions.delete', name: 'Delete Transactions', resource: 'transactions', action: 'delete', category: 'ACCOUNTING' },
      { slug: 'transactions.manage', name: 'Manage Transactions', resource: 'transactions', action: 'manage', category: 'ACCOUNTING' },

      // Task permissions
      { slug: 'tasks.read', name: 'Read Tasks', resource: 'tasks', action: 'read', category: 'CRM' },
      { slug: 'tasks.create', name: 'Create Tasks', resource: 'tasks', action: 'create', category: 'CRM' },
      { slug: 'tasks.update', name: 'Update Tasks', resource: 'tasks', action: 'update', category: 'CRM' },
      { slug: 'tasks.delete', name: 'Delete Tasks', resource: 'tasks', action: 'delete', category: 'CRM' },
      { slug: 'tasks.manage', name: 'Manage Tasks', resource: 'tasks', action: 'manage', category: 'CRM' },

      // Document permissions
      { slug: 'documents.read', name: 'Read Documents', resource: 'documents', action: 'read', category: 'CRM' },
      { slug: 'documents.create', name: 'Create Documents', resource: 'documents', action: 'create', category: 'CRM' },
      { slug: 'documents.update', name: 'Update Documents', resource: 'documents', action: 'update', category: 'CRM' },
      { slug: 'documents.delete', name: 'Delete Documents', resource: 'documents', action: 'delete', category: 'CRM' },
      { slug: 'documents.manage', name: 'Manage Documents', resource: 'documents', action: 'manage', category: 'CRM' },

      // Communication permissions
      { slug: 'communications.read', name: 'Read Communications', resource: 'communications', action: 'read', category: 'COMMUNICATIONS' },
      { slug: 'communications.create', name: 'Create Communications', resource: 'communications', action: 'create', category: 'COMMUNICATIONS' },
      { slug: 'communications.update', name: 'Update Communications', resource: 'communications', action: 'update', category: 'COMMUNICATIONS' },
      { slug: 'communications.delete', name: 'Delete Communications', resource: 'communications', action: 'delete', category: 'COMMUNICATIONS' },
      { slug: 'communications.manage', name: 'Manage Communications', resource: 'communications', action: 'manage', category: 'COMMUNICATIONS' },

      // Event permissions
      { slug: 'events.read', name: 'Read Events', resource: 'events', action: 'read', category: 'CRM' },
      { slug: 'events.create', name: 'Create Events', resource: 'events', action: 'create', category: 'CRM' },
      { slug: 'events.update', name: 'Update Events', resource: 'events', action: 'update', category: 'CRM' },
      { slug: 'events.delete', name: 'Delete Events', resource: 'events', action: 'delete', category: 'CRM' },
      { slug: 'events.manage', name: 'Manage Events', resource: 'events', action: 'manage', category: 'CRM' },

      // Analytics permissions
      { slug: 'analytics.read', name: 'Read Analytics', resource: 'analytics', action: 'read', category: 'ANALYTICS' },
      { slug: 'analytics.manage', name: 'Manage Analytics', resource: 'analytics', action: 'manage', category: 'ANALYTICS' },

      // Admin permissions
      { slug: 'settings.read', name: 'Read Settings', resource: 'settings', action: 'read', category: 'ADMIN' },
      { slug: 'settings.update', name: 'Update Settings', resource: 'settings', action: 'update', category: 'ADMIN' },
      { slug: 'settings.manage', name: 'Manage Settings', resource: 'settings', action: 'manage', category: 'ADMIN' },

      // Role management permissions
      { slug: 'roles.read', name: 'Read Roles', resource: 'roles', action: 'read', category: 'ADMIN' },
      { slug: 'roles.create', name: 'Create Roles', resource: 'roles', action: 'create', category: 'ADMIN' },
      { slug: 'roles.update', name: 'Update Roles', resource: 'roles', action: 'update', category: 'ADMIN' },
      { slug: 'roles.delete', name: 'Delete Roles', resource: 'roles', action: 'delete', category: 'ADMIN' },
      { slug: 'roles.manage', name: 'Manage Roles', resource: 'roles', action: 'manage', category: 'ADMIN' }
    ]

    // Define default roles
    this.defaultRoles = [
      {
        slug: 'super_admin',
        name: 'Super Admin',
        description: 'Super administrator with full access',
        level: 100,
        scope: 'GLOBAL',
        permissions: this.defaultPermissions.map(p => p.slug)
      },
      {
        slug: 'agency_admin',
        name: 'Agency Admin',
        description: 'Agency administrator with full agency access',
        level: 90,
        scope: 'AGENCY',
        permissions: this.defaultPermissions
          .filter(p => !p.slug.includes('super') && !p.slug.startsWith('roles.'))
          .map(p => p.slug)
      },
      {
        slug: 'branch_manager',
        name: 'Branch Manager',
        description: 'Branch manager with branch-level access',
        level: 80,
        scope: 'BRANCH',
        permissions: this.defaultPermissions
          .filter(p => [
            'users.read', 'users.create', 'users.update',
            'students.read', 'students.create', 'students.update', 'students.manage',
            'applications.read', 'applications.create', 'applications.update', 'applications.manage',
            'invoices.read', 'invoices.create', 'invoices.update',
            'transactions.read', 'transactions.create', 'transactions.update',
            'tasks.read', 'tasks.create', 'tasks.update', 'tasks.manage',
            'documents.read', 'documents.create', 'documents.update', 'documents.manage',
            'communications.read', 'communications.create', 'communications.update', 'communications.manage',
            'events.read', 'events.create', 'events.update', 'events.manage',
            'analytics.read',
            'settings.read'
          ].includes(p.slug))
          .map(p => p.slug)
      },
      {
        slug: 'senior_consultant',
        name: 'Senior Consultant',
        description: 'Senior consultant with advanced access',
        level: 70,
        scope: 'BRANCH',
        permissions: this.defaultPermissions
          .filter(p => [
            'users.read',
            'students.read', 'students.create', 'students.update', 'students.manage',
            'applications.read', 'applications.create', 'applications.update', 'applications.manage',
            'invoices.read', 'invoices.create', 'invoices.update',
            'transactions.read', 'transactions.create', 'transactions.update',
            'tasks.read', 'tasks.create', 'tasks.update', 'tasks.manage',
            'documents.read', 'documents.create', 'documents.update', 'documents.manage',
            'communications.read', 'communications.create', 'communications.update', 'communications.manage',
            'events.read', 'events.create', 'events.update',
            'analytics.read'
          ].includes(p.slug))
          .map(p => p.slug)
      },
      {
        slug: 'consultant',
        name: 'Consultant',
        description: 'Consultant with standard access',
        level: 60,
        scope: 'BRANCH',
        permissions: this.defaultPermissions
          .filter(p => [
            'users.read',
            'students.read', 'students.create', 'students.update',
            'applications.read', 'applications.create', 'applications.update',
            'invoices.read', 'invoices.create',
            'transactions.read', 'transactions.create',
            'tasks.read', 'tasks.create', 'tasks.update',
            'documents.read', 'documents.create', 'documents.update',
            'communications.read', 'communications.create', 'communications.update',
            'events.read', 'events.create'
          ].includes(p.slug))
          .map(p => p.slug)
      },
      {
        slug: 'support_staff',
        name: 'Support Staff',
        description: 'Support staff with limited access',
        level: 50,
        scope: 'BRANCH',
        permissions: this.defaultPermissions
          .filter(p => [
            'users.read',
            'students.read', 'students.update',
            'applications.read', 'applications.update',
            'tasks.read', 'tasks.update',
            'documents.read', 'documents.update',
            'communications.read', 'communications.create', 'communications.update'
          ].includes(p.slug))
          .map(p => p.slug)
      }
    ]
  }

  /**
   * Complete permission check with branch-based scoping and enhanced features
   */
  static async checkPermissionComplete(
    userId: string,
    permission: CompletePermissionCheck,
    context?: Partial<CompleteRBACContext>
  ): Promise<CompleteAccessDecision> {
    try {
      // Ensure RBAC is initialized
      if (!this.initialized) {
        await this.initialize()
      }

      // Use enhanced RBAC for comprehensive checking
      const enhancedContext: EnhancedRBACContext = {
        userId,
        agencyId: context?.agencyId,
        branchId: context?.branchId,
        userRole: context?.userRole,
        userBranchId: context?.userBranchId,
        userAgencyId: context?.userAgencyId,
        resource: permission.resource,
        action: permission.action,
        resourceId: permission.resourceId,
        resourceType: permission.resourceType || permission.resource,
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
        additionalConditions: permission.conditions
      }

      const decision = await EnhancedRBAC.checkPermissionWithBranch(userId, permission, enhancedContext)

      // Apply additional data filtering if enabled
      let dataFilters: Record<string, any> = {}
      if (context?.enableDataFiltering) {
        dataFilters = await this.generateDataFilters(userId, permission, enhancedContext)
      }

      // Apply field-level permissions
      let fieldPermissions: Record<string, string[]> = {}
      if (permission.resource) {
        fieldPermissions = await this.getFieldLevelPermissions(userId, permission.resource, permission.action)
      }

      return {
        ...decision,
        dataFilters: Object.keys(dataFilters).length > 0 ? dataFilters : undefined,
        fieldPermissions: Object.keys(fieldPermissions).length > 0 ? fieldPermissions : undefined,
        auditLevel: context?.auditLevel || 'DETAILED'
      }
    } catch (error) {
      console.error('Complete RBAC checkPermissionComplete error:', error)
      return { allowed: false, reason: 'Internal server error' }
    }
  }

  /**
   * Generate data filters based on user permissions and context
   */
  private static async generateDataFilters(
    userId: string,
    permission: CompletePermissionCheck,
    context: EnhancedRBACContext
  ): Promise<Record<string, any>> {
    const filters: Record<string, any> = {}

    // Get user information
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        agency: true,
        branch: true,
        userRoles: {
          include: {
            role: true
          }
        }
      }
    })

    if (!user) return filters

    // Apply role-based data filtering
    const userRole = user.role || user.userRoles[0]?.role?.name || 'CONSULTANT'

    switch (userRole) {
      case 'AGENCY_ADMIN':
      case 'SUPER_ADMIN':
        // Admins can see all data - no additional filtering
        break

      case 'BRANCH_MANAGER':
      case 'SENIOR_CONSULTANT':
        // Can see data from their branch and assigned resources
        if (user.branchId) {
          filters.branchId = user.branchId
        }
        // For certain resources, also show assigned items
        if (['students', 'applications', 'tasks'].includes(permission.resource)) {
          filters.OR = [
            { branchId: user.branchId },
            { assignedTo: userId }
          ]
        }
        break

      case 'CONSULTANT':
        // Can see assigned resources and resources from their branch
        if (user.branchId) {
          filters.OR = [
            { branchId: user.branchId },
            { assignedTo: userId }
          ]
        }
        break

      case 'SUPPORT_STAFF':
        // Limited to assigned resources only
        filters.assignedTo = userId
        break

      default:
        // Default to own branch only
        if (user.branchId) {
          filters.branchId = user.branchId
        }
        break
    }

    return filters
  }

  /**
   * Get field-level permissions for a resource type
   */
  private static async getFieldLevelPermissions(
    userId: string,
    resource: string,
    action: string
  ): Promise<Record<string, string[]>> {
    const fieldPermissions: Record<string, string[]> = {}

    // Get user's role to determine field-level access
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    })

    if (!user) return fieldPermissions

    const userRole = user.role || user.userRoles[0]?.role?.name || 'CONSULTANT'

    // Define field permissions based on role and resource type
    switch (resource) {
      case 'students':
        switch (userRole) {
          case 'AGENCY_ADMIN':
          case 'SUPER_ADMIN':
          case 'BRANCH_MANAGER':
            fieldPermissions.students = ['personal', 'academic', 'financial', 'contact']
            break
          case 'SENIOR_CONSULTANT':
            fieldPermissions.students = ['personal', 'academic', 'contact']
            break
          case 'CONSULTANT':
            fieldPermissions.students = ['personal', 'academic']
            break
          case 'SUPPORT_STAFF':
            fieldPermissions.students = ['personal', 'contact']
            break
          default:
            fieldPermissions.students = ['personal']
            break
        }
        break

      case 'users':
        switch (userRole) {
          case 'AGENCY_ADMIN':
          case 'SUPER_ADMIN':
            fieldPermissions.users = ['basic', 'personal', 'sensitive', 'roles']
            break
          case 'BRANCH_MANAGER':
            fieldPermissions.users = ['basic', 'personal']
            break
          default:
            fieldPermissions.users = ['basic']
            break
        }
        break

      case 'applications':
        switch (userRole) {
          case 'AGENCY_ADMIN':
          case 'SUPER_ADMIN':
          case 'BRANCH_MANAGER':
            fieldPermissions.applications = ['basic', 'detailed', 'financial', 'documents']
            break
          case 'SENIOR_CONSULTANT':
          case 'CONSULTANT':
            fieldPermissions.applications = ['basic', 'detailed', 'documents']
            break
          case 'SUPPORT_STAFF':
            fieldPermissions.applications = ['basic']
            break
          default:
            fieldPermissions.applications = ['basic']
            break
        }
        break

      default:
        // For other resources, provide basic access
        fieldPermissions[resource] = ['basic']
        break
    }

    return fieldPermissions
  }

  /**
   * Get user's accessible branches for a specific resource type
   */
  static async getAccessibleBranches(userId: string, resourceType: string): Promise<string[]> {
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        include: {
          agency: true,
          branch: true,
          managedBranches: true,
          userRoles: {
            include: {
              role: true
            }
          }
        }
      })

      if (!user) return []

      // Super admins and agency admins can access all branches in their agency
      if (user.role === 'SUPER_ADMIN' || user.role === 'AGENCY_ADMIN') {
        const agencyBranches = await db.branch.findMany({
          where: { agencyId: user.agencyId },
          select: { id: true }
        })
        return agencyBranches.map(b => b.id)
      }

      // Branch managers can access their managed branches
      if (user.role === 'BRANCH_MANAGER' || user.managedBranches.length > 0) {
        const managedBranchIds = user.managedBranches.map(b => b.id)
        const userBranchId = user.branchId ? [user.branchId] : []
        return [...new Set([...managedBranchIds, ...userBranchId])]
      }

      // Other users can only access their own branch
      return user.branchId ? [user.branchId] : []
    } catch (error) {
      console.error('Error getting accessible branches:', error)
      return []
    }
  }

  /**
   * Check if user can access a specific resource
   */
  static async canAccessResource(
    userId: string,
    resourceType: string,
    resourceId: string,
    action: string = 'read'
  ): Promise<CompleteAccessDecision> {
    try {
      // Get the resource and its branch information
      let resourceBranchId: string | null = null
      let resourceAgencyId: string | null = null

      switch (resourceType) {
        case 'student':
          const student = await db.student.findUnique({
            where: { id: resourceId },
            select: { branchId: true, agencyId: true }
          })
          resourceBranchId = student?.branchId || null
          resourceAgencyId = student?.agencyId || null
          break

        case 'user':
          const userResource = await db.user.findUnique({
            where: { id: resourceId },
            select: { branchId: true, agencyId: true }
          })
          resourceBranchId = userResource?.branchId || null
          resourceAgencyId = userResource?.agencyId || null
          break

        case 'branch':
          const branch = await db.branch.findUnique({
            where: { id: resourceId },
            select: { agencyId: true }
          })
          resourceAgencyId = branch?.agencyId || null
          resourceBranchId = resourceId // For branches, the resource ID is the branch ID
          break

        case 'application':
          const application = await db.application.findUnique({
            where: { id: resourceId },
            select: { branchId: true, agencyId: true }
          })
          resourceBranchId = application?.branchId || null
          resourceAgencyId = application?.agencyId || null
          break

        default:
          return { allowed: false, reason: 'Unknown resource type' }
      }

      if (!resourceAgencyId) {
        return { allowed: false, reason: 'Resource not found' }
      }

      // Check basic permission
      const permissionCheck = await this.checkPermissionComplete(userId, {
        resource: resourceType,
        action,
        resourceType,
        resourceId
      })

      if (!permissionCheck.allowed) {
        return permissionCheck
      }

      // Check if user can access the specific branch
      if (resourceBranchId && permissionCheck.accessibleBranches) {
        if (!permissionCheck.accessibleBranches.includes(resourceBranchId)) {
          return {
            allowed: false,
            reason: 'Resource is not in an accessible branch',
            accessibleBranches: permissionCheck.accessibleBranches
          }
        }
      }

      return {
        allowed: true,
        reason: 'Resource access granted',
        accessibleBranches: permissionCheck.accessibleBranches,
        branchScope: permissionCheck.branchScope
      }
    } catch (error) {
      console.error('Error checking resource access:', error)
      return { allowed: false, reason: 'Internal server error' }
    }
  }

  /**
   * Create default permissions and roles for a new agency
   */
  static async createAgencyDefaults(agencyId: string): Promise<void> {
    try {
      // Create default permissions for the agency
      for (const permData of this.defaultPermissions) {
        await db.permission.upsert({
          where: { slug: permData.slug },
          update: {},
          create: {
            name: permData.name,
            slug: permData.slug,
            description: `${permData.name} permission`,
            resource: permData.resource,
            action: permData.action,
            category: permData.category,
            isSystemPermission: false,
            isActive: true
          }
        })
      }

      // Create default roles for the agency
      for (const roleData of this.defaultRoles) {
        if (roleData.slug === 'super_admin') continue // Skip super admin for agency-specific roles

        const role = await db.role.create({
          data: {
            agencyId,
            name: roleData.name,
            description: roleData.description,
            slug: roleData.slug,
            level: roleData.level,
            scope: roleData.scope,
            isActive: true
          }
        })

        // Assign permissions to the role
        for (const permSlug of roleData.permissions) {
          const permission = await db.permission.findUnique({
            where: { slug: permSlug }
          })

          if (permission) {
            await db.rolePermission.create({
              data: {
                roleId: role.id,
                permissionId: permission.id,
                agencyId,
                accessLevel: 'FULL',
                isActive: true
              }
            })
          }
        }
      }

      console.log(`Default RBAC setup completed for agency ${agencyId}`)
    } catch (error) {
      console.error('Error creating agency defaults:', error)
      throw error
    }
  }

  /**
   * Get user's comprehensive access information
   */
  static async getUserAccessInfo(userId: string): Promise<{
    user: any
    accessibleBranches: string[]
    permissions: string[]
    roles: string[]
    branchScope: 'GLOBAL' | 'AGENCY' | 'BRANCH' | 'OWN'
    fieldPermissions: Record<string, string[]>
    dataFilters: Record<string, any>
  }> {
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        include: {
          agency: true,
          branch: true,
          managedBranches: true,
          userRoles: {
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: {
                      permission: true
                    }
                  }
                }
              }
            },
            where: { isActive: true }
          },
          userPermissions: {
            include: {
              permission: true
            },
            where: { isActive: true }
          }
        }
      })

      if (!user) {
        throw new Error('User not found')
      }

      const accessibleBranches = await this.getAccessibleBranches(userId, 'general')
      const permissions = await RBACService.getUserPermissions(userId)
      const roles = user.userRoles.map(ur => ur.role.slug)

      // Determine user's branch scope
      let branchScope: 'GLOBAL' | 'AGENCY' | 'BRANCH' | 'OWN' = 'OWN'
      if (user.role === 'SUPER_ADMIN') {
        branchScope = 'GLOBAL'
      } else if (user.role === 'AGENCY_ADMIN') {
        branchScope = 'AGENCY'
      } else if (accessibleBranches.length > 1) {
        branchScope = 'BRANCH'
      }

      // Get field permissions for common resource types
      const fieldPermissions: Record<string, string[]> = {}
      const resourceTypes = ['students', 'users', 'applications']
      for (const resourceType of resourceTypes) {
        fieldPermissions[resourceType] = await this.getFieldLevelPermissions(userId, resourceType, 'read')
      }

      // Get data filters
      const dataFilters = await this.generateDataFilters(userId, {
        resource: 'general',
        action: 'read'
      }, {
        userId,
        agencyId: user.agencyId,
        branchId: user.branchId,
        userRole: user.role
      })

      return {
        user,
        accessibleBranches,
        permissions: permissions.map(p => p.slug),
        roles,
        branchScope,
        fieldPermissions,
        dataFilters
      }
    } catch (error) {
      console.error('Error getting user access info:', error)
      throw error
    }
  }
}