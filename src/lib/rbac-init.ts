import { db } from './db'
import { CompleteRBAC } from './rbac-complete'

/**
 * RBAC Initializer - Handles setup of default roles, permissions, and RBAC configuration
 */
export class RBACInitializer {
  private static initialized = false

  /**
   * Initialize the RBAC system for the entire application
   */
  static async initialize(): Promise<void> {
    if (this.initialized) {
      return
    }

    try {
      console.log('Initializing RBAC system...')
      
      // Initialize Complete RBAC
      await CompleteRBAC.initialize()
      
      // Create system-level permissions if they don't exist
      await this.createSystemPermissions()
      
      // Create system-level roles if they don't exist
      await this.createSystemRoles()
      
      this.initialized = true
      console.log('RBAC system initialized successfully')
    } catch (error) {
      console.error('Error initializing RBAC system:', error)
      throw error
    }
  }

  /**
   * Create system-level permissions that apply globally
   */
  private static async createSystemPermissions(): Promise<void> {
    const systemPermissions = [
      // System administration permissions
      {
        slug: 'system.admin',
        name: 'System Administration',
        description: 'Full system administration access',
        resource: 'system',
        action: 'admin',
        category: 'ADMIN' as const,
        isSystemPermission: true
      },
      {
        slug: 'system.monitoring',
        name: 'System Monitoring',
        description: 'Access to system monitoring and logs',
        resource: 'system',
        action: 'monitor',
        category: 'ADMIN' as const,
        isSystemPermission: true
      },
      {
        slug: 'system.audit',
        name: 'System Audit',
        description: 'Access to system audit trails',
        resource: 'system',
        action: 'audit',
        category: 'ADMIN' as const,
        isSystemPermission: true
      },

      // Agency management permissions
      {
        slug: 'agencies.read',
        name: 'Read Agencies',
        description: 'View agency information',
        resource: 'agencies',
        action: 'read',
        category: 'ADMIN' as const,
        isSystemPermission: true
      },
      {
        slug: 'agencies.create',
        name: 'Create Agencies',
        description: 'Create new agencies',
        resource: 'agencies',
        action: 'create',
        category: 'ADMIN' as const,
        isSystemPermission: true
      },
      {
        slug: 'agencies.update',
        name: 'Update Agencies',
        description: 'Update agency information',
        resource: 'agencies',
        action: 'update',
        category: 'ADMIN' as const,
        isSystemPermission: true
      },
      {
        slug: 'agencies.delete',
        name: 'Delete Agencies',
        description: 'Delete agencies',
        resource: 'agencies',
        action: 'delete',
        category: 'ADMIN' as const,
        isSystemPermission: true
      },
      {
        slug: 'agencies.manage',
        name: 'Manage Agencies',
        description: 'Full agency management access',
        resource: 'agencies',
        action: 'manage',
        category: 'ADMIN' as const,
        isSystemPermission: true
      },

      // Billing and subscription permissions
      {
        slug: 'billing.read',
        name: 'Read Billing Information',
        description: 'View billing and subscription information',
        resource: 'billing',
        action: 'read',
        category: 'ADMIN' as const,
        isSystemPermission: true
      },
      {
        slug: 'billing.manage',
        name: 'Manage Billing',
        description: 'Manage billing and subscriptions',
        resource: 'billing',
        action: 'manage',
        category: 'ADMIN' as const,
        isSystemPermission: true
      },

      // Security permissions
      {
        slug: 'security.read',
        name: 'Read Security Settings',
        description: 'View security settings and logs',
        resource: 'security',
        action: 'read',
        category: 'SECURITY' as const,
        isSystemPermission: true
      },
      {
        slug: 'security.manage',
        name: 'Manage Security',
        description: 'Manage security settings and policies',
        resource: 'security',
        action: 'manage',
        category: 'SECURITY' as const,
        isSystemPermission: true
      }
    ]

    for (const permData of systemPermissions) {
      await db.permission.upsert({
        where: { slug: permData.slug },
        update: {
          name: permData.name,
          description: permData.description,
          isActive: true
        },
        create: {
          name: permData.name,
          slug: permData.slug,
          description: permData.description,
          resource: permData.resource,
          action: permData.action,
          category: permData.category,
          isSystemPermission: permData.isSystemPermission,
          isActive: true
        }
      })
    }
  }

  /**
   * Create system-level roles
   */
  private static async createSystemRoles(): Promise<void> {
    const systemRoles = [
      {
        slug: 'super_admin',
        name: 'Super Administrator',
        description: 'Super administrator with full system access',
        level: 100,
        scope: 'GLOBAL' as const,
        permissions: [
          'system.admin',
          'system.monitoring',
          'system.audit',
          'agencies.read',
          'agencies.create',
          'agencies.update',
          'agencies.delete',
          'agencies.manage',
          'billing.read',
          'billing.manage',
          'security.read',
          'security.manage'
        ]
      },
      {
        slug: 'system_admin',
        name: 'System Administrator',
        description: 'System administrator with limited system access',
        level: 90,
        scope: 'GLOBAL' as const,
        permissions: [
          'system.monitoring',
          'system.audit',
          'agencies.read',
          'agencies.update',
          'billing.read',
          'security.read'
        ]
      },
      {
        slug: 'support_admin',
        name: 'Support Administrator',
        description: 'Support administrator with monitoring access',
        level: 80,
        scope: 'GLOBAL' as const,
        permissions: [
          'system.monitoring',
          'agencies.read',
          'billing.read'
        ]
      }
    ]

    for (const roleData of systemRoles) {
      // Check if role already exists
      const existingRole = await db.role.findFirst({
        where: {
          slug: roleData.slug,
          agencyId: null // System roles have no agency
        }
      })

      if (!existingRole) {
        // Create the role
        const role = await db.role.create({
          data: {
            name: roleData.name,
            description: roleData.description,
            slug: roleData.slug,
            level: roleData.level,
            scope: roleData.scope,
            isSystemRole: true,
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
                accessLevel: 'FULL',
                isActive: true
              }
            })
          }
        }
      }
    }
  }

  /**
   * Create default roles and permissions for a new agency
   */
  static async createAgencyRoles(agencyId: string): Promise<void> {
    try {
      console.log(`Creating default roles and permissions for agency ${agencyId}...`)
      
      // Use Complete RBAC to create agency defaults
      await CompleteRBAC.createAgencyDefaults(agencyId)
      
      console.log(`Default roles and permissions created for agency ${agencyId}`)
    } catch (error) {
      console.error('Error creating agency roles:', error)
      throw error
    }
  }

  /**
   * Setup RBAC for an existing agency (useful for migrations)
   */
  static async setupExistingAgency(agencyId: string): Promise<void> {
    try {
      console.log(`Setting up RBAC for existing agency ${agencyId}...`)
      
      // Create agency-specific roles and permissions
      await this.createAgencyRoles(agencyId)
      
      // Assign existing users to appropriate roles
      await this.assignExistingUsersToRoles(agencyId)
      
      console.log(`RBAC setup completed for existing agency ${agencyId}`)
    } catch (error) {
      console.error('Error setting up existing agency:', error)
      throw error
    }
  }

  /**
   * Assign existing users to appropriate roles based on their current user.role field
   */
  private static async assignExistingUsersToRoles(agencyId: string): Promise<void> {
    try {
      // Get all users for the agency
      const users = await db.user.findMany({
        where: { agencyId },
        include: {
          userRoles: {
            include: {
              role: true
            }
          }
        }
      })

      for (const user of users) {
        // Skip users who already have roles assigned
        if (user.userRoles.length > 0) {
          continue
        }

        // Map user.role to role slug
        let roleSlug: string
        switch (user.role) {
          case 'SUPER_ADMIN':
            roleSlug = 'super_admin'
            break
          case 'AGENCY_ADMIN':
            roleSlug = 'agency_admin'
            break
          case 'CONSULTANT':
            roleSlug = 'consultant'
            break
          case 'SUPPORT':
            roleSlug = 'support_staff'
            break
          default:
            roleSlug = 'consultant' // Default role
            break
        }

        // Find the role for this agency
        const role = await db.role.findFirst({
          where: {
            agencyId,
            slug: roleSlug,
            isActive: true
          }
        })

        if (role) {
          // Assign the role to the user
          await db.userRoleAssignment.create({
            data: {
              userId: user.id,
              roleId: role.id,
              agencyId,
              branchId: user.branchId,
              isActive: true
            }
          })
          
          console.log(`Assigned role ${roleSlug} to user ${user.email}`)
        }
      }
    } catch (error) {
      console.error('Error assigning existing users to roles:', error)
      throw error
    }
  }

  /**
   * Create custom role for an agency
   */
  static async createCustomRole(agencyId: string, roleData: {
    name: string
    description?: string
    slug: string
    level?: number
    scope?: 'AGENCY' | 'BRANCH' | 'DEPARTMENT' | 'TEAM'
    branchId?: string
    permissions?: string[]
  }): Promise<any> {
    try {
      // Check if role slug already exists for this agency
      const existingRole = await db.role.findFirst({
        where: {
          agencyId,
          slug: roleData.slug
        }
      })

      if (existingRole) {
        throw new Error(`Role with slug '${roleData.slug}' already exists for this agency`)
      }

      // Create the role
      const role = await db.role.create({
        data: {
          agencyId,
          name: roleData.name,
          description: roleData.description,
          slug: roleData.slug,
          level: roleData.level || 50,
          scope: roleData.scope || 'AGENCY',
          branchId: roleData.branchId,
          isActive: true
        }
      })

      // Assign permissions if provided
      if (roleData.permissions && roleData.permissions.length > 0) {
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
                branchId: roleData.branchId,
                accessLevel: 'FULL',
                isActive: true
              }
            })
          }
        }
      }

      return role
    } catch (error) {
      console.error('Error creating custom role:', error)
      throw error
    }
  }

  /**
   * Create permission template for easy role creation
   */
  static async createPermissionTemplate(agencyId: string, templateData: {
    name: string
    description?: string
    category: 'SYSTEM' | 'INDUSTRY_SPECIFIC' | 'ROLE_SPECIFIC' | 'DEPARTMENT_SPECIFIC' | 'CUSTOM'
    permissions: Array<{
      slug: string
      accessLevel?: 'NONE' | 'VIEW' | 'EDIT' | 'DELETE' | 'FULL' | 'CUSTOM'
      conditions?: Record<string, any>
    }>
    roles?: Array<{
      name: string
      description?: string
      slug: string
      level?: number
      scope?: 'AGENCY' | 'BRANCH' | 'DEPARTMENT' | 'TEAM'
      branchId?: string
    }>
  }): Promise<any> {
    try {
      // Create the template
      const template = await db.permissionTemplate.create({
        data: {
          agencyId,
          name: templateData.name,
          description: templateData.description,
          category: templateData.category,
          isActive: true
        }
      })

      // Add template permissions
      for (const templatePerm of templateData.permissions) {
        const permission = await db.permission.findUnique({
          where: { slug: templatePerm.slug }
        })

        if (permission) {
          await db.permissionTemplatePermission.create({
            data: {
              templateId: template.id,
              permissionId: permission.id,
              accessLevel: templatePerm.accessLevel || 'FULL',
              conditions: templatePerm.conditions ? JSON.stringify(templatePerm.conditions) : null,
              isActive: true
            }
          })
        }
      }

      // Add template roles if provided
      if (templateData.roles) {
        for (const roleData of templateData.roles) {
          const roleTemplate = await db.roleTemplate.create({
            data: {
              templateId: template.id,
              name: roleData.name,
              description: roleData.description,
              slug: roleData.slug,
              level: roleData.level || 50,
              isActive: true
            }
          })

          // Assign template permissions to role template
          for (const templatePerm of templateData.permissions) {
            const permission = await db.permission.findUnique({
              where: { slug: templatePerm.slug }
            })

            if (permission) {
              await db.roleTemplatePermission.create({
                data: {
                  roleTemplateId: roleTemplate.id,
                  permissionId: permission.id,
                  accessLevel: templatePerm.accessLevel || 'FULL',
                  conditions: templatePerm.conditions ? JSON.stringify(templatePerm.conditions) : null,
                  isActive: true
                }
              })
            }
          }
        }
      }

      return template
    } catch (error) {
      console.error('Error creating permission template:', error)
      throw error
    }
  }

  /**
   * Apply permission template to an agency
   */
  static async applyPermissionTemplate(agencyId: string, templateId: string): Promise<void> {
    try {
      const template = await db.permissionTemplate.findUnique({
        where: { id: templateId },
        include: {
          permissions: {
            include: {
              permission: true
            }
          },
          roles: {
            include: {
              permissions: {
                include: {
                  permission: true
                }
              }
            }
          }
        }
      })

      if (!template) {
        throw new Error('Template not found')
      }

      // Create template permissions for the agency if they don't exist
      for (const templatePerm of template.permissions) {
        const permission = templatePerm.permission
        
        // Ensure permission exists (it should be system-wide)
        await db.permission.upsert({
          where: { slug: permission.slug },
          update: {},
          create: {
            name: permission.name,
            slug: permission.slug,
            description: permission.description,
            resource: permission.resource,
            action: permission.action,
            category: permission.category,
            isSystemPermission: permission.isSystemPermission,
            isActive: true
          }
        })
      }

      // Create template roles for the agency
      for (const roleTemplate of template.roles) {
        // Check if role already exists
        let role = await db.role.findFirst({
          where: {
            agencyId,
            slug: roleTemplate.slug
          }
        })

        if (!role) {
          // Create the role
          role = await db.role.create({
            data: {
              agencyId,
              name: roleTemplate.name,
              description: roleTemplate.description,
              slug: roleTemplate.slug,
              level: roleTemplate.level,
              scope: 'AGENCY',
              isActive: true
            }
          })
        }

        // Assign permissions to the role
        for (const rolePerm of roleTemplate.permissions) {
          const permission = rolePerm.permission
          
          await db.rolePermission.upsert({
            where: {
              roleId_permissionId: {
                roleId: role.id,
                permissionId: permission.id
              }
            },
            update: {
              accessLevel: rolePerm.accessLevel,
              conditions: rolePerm.conditions,
              isActive: true
            },
            create: {
              roleId: role.id,
              permissionId: permission.id,
              agencyId,
              accessLevel: rolePerm.accessLevel,
              conditions: rolePerm.conditions ? JSON.stringify(rolePerm.conditions) : null,
              isActive: true
            }
          })
        }
      }

      console.log(`Permission template '${template.name}' applied to agency ${agencyId}`)
    } catch (error) {
      console.error('Error applying permission template:', error)
      throw error
    }
  }

  /**
   * Get RBAC system status
   */
  static async getSystemStatus(): Promise<{
    initialized: boolean
    permissionsCount: number
    rolesCount: number
    agenciesCount: number
    lastInitialized?: Date
  }> {
    try {
      const [permissionsCount, rolesCount, agenciesCount] = await Promise.all([
        db.permission.count(),
        db.role.count(),
        db.agency.count()
      ])

      return {
        initialized: this.initialized,
        permissionsCount,
        rolesCount,
        agenciesCount,
        lastInitialized: this.initialized ? new Date() : undefined
      }
    } catch (error) {
      console.error('Error getting RBAC system status:', error)
      return {
        initialized: false,
        permissionsCount: 0,
        rolesCount: 0,
        agenciesCount: 0
      }
    }
  }
}