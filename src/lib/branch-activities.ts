import { db } from './db'
import { EnhancedRBACService, type EnhancedBranchContext } from './rbac-enhanced'

export interface BranchActivity {
  id: string
  userId: string
  agencyId: string
  branchId: string
  action: string
  resourceType: string
  resourceId?: string
  description: string
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}

export interface BranchActivityFilter {
  agencyId?: string
  branchId?: string
  userId?: string
  action?: string
  resourceType?: string
  resourceId?: string
  dateFrom?: Date
  dateTo?: Date
  limit?: number
  offset?: number
}

export interface BranchActivitySummary {
  totalActivities: number
  activitiesByAction: Record<string, number>
  activitiesByResource: Record<string, number>
  activitiesByUser: Record<string, number>
  activitiesByBranch: Record<string, number>
  topUsers: Array<{ userId: string; userName: string; activityCount: number }>
  topBranches: Array<{ branchId: string; branchName: string; activityCount: number }>
}

/**
 * Branch-based activity tracking service
 */
export class BranchActivityService {
  /**
   * Log a branch-based activity
   */
  static async logActivity(data: {
    userId: string
    agencyId: string
    branchId: string
    action: string
    resourceType: string
    resourceId?: string
    description: string
    metadata?: Record<string, any>
    ipAddress?: string
    userAgent?: string
  }): Promise<BranchActivity> {
    try {
      // Validate branch access
      const hasAccess = await this.validateBranchAccess(data.userId, data.branchId, data.agencyId)
      if (!hasAccess) {
        throw new Error('User does not have access to this branch')
      }

      const activity = await db.branchActivity.create({
        data: {
          userId: data.userId,
          agencyId: data.agencyId,
          branchId: data.branchId,
          action: data.action,
          resourceType: data.resourceType,
          resourceId: data.resourceId,
          description: data.description,
          metadata: data.metadata ? JSON.stringify(data.metadata) : null,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent
        }
      })

      return {
        ...activity,
        metadata: activity.metadata ? JSON.parse(activity.metadata) : undefined
      }
    } catch (error) {
      console.error('BranchActivityService logActivity error:', error)
      throw error
    }
  }

  /**
   * Get branch activities with filtering
   */
  static async getActivities(filter: BranchActivityFilter = {}): Promise<BranchActivity[]> {
    try {
      const whereClause: any = {}

      // Apply filters
      if (filter.agencyId) whereClause.agencyId = filter.agencyId
      if (filter.branchId) whereClause.branchId = filter.branchId
      if (filter.userId) whereClause.userId = filter.userId
      if (filter.action) whereClause.action = filter.action
      if (filter.resourceType) whereClause.resourceType = filter.resourceType
      if (filter.resourceId) whereClause.resourceId = filter.resourceId

      // Date range filtering
      if (filter.dateFrom || filter.dateTo) {
        whereClause.createdAt = {}
        if (filter.dateFrom) whereClause.createdAt.gte = filter.dateFrom
        if (filter.dateTo) whereClause.createdAt.lte = filter.dateTo
      }

      const activities = await db.branchActivity.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          branch: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          agency: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: filter.limit || 100,
        skip: filter.offset || 0
      })

      return activities.map(activity => ({
        ...activity,
        metadata: activity.metadata ? JSON.parse(activity.metadata) : undefined
      }))
    } catch (error) {
      console.error('BranchActivityService getActivities error:', error)
      throw error
    }
  }

  /**
   * Get branch activity summary
   */
  static async getActivitySummary(filter: BranchActivityFilter = {}): Promise<BranchActivitySummary> {
    try {
      const whereClause: any = {}

      // Apply filters
      if (filter.agencyId) whereClause.agencyId = filter.agencyId
      if (filter.branchId) whereClause.branchId = filter.branchId
      if (filter.userId) whereClause.userId = filter.userId
      if (filter.action) whereClause.action = filter.action
      if (filter.resourceType) whereClause.resourceType = filter.resourceType

      // Date range filtering
      if (filter.dateFrom || filter.dateTo) {
        whereClause.createdAt = {}
        if (filter.dateFrom) whereClause.createdAt.gte = filter.dateFrom
        if (filter.dateTo) whereClause.createdAt.lte = filter.dateTo
      }

      // Get total activities
      const totalActivities = await db.branchActivity.count({ where: whereClause })

      // Get activities by action
      const activitiesByActionRaw = await db.branchActivity.groupBy({
        by: ['action'],
        where: whereClause,
        _count: { action: true }
      })
      const activitiesByAction = activitiesByActionRaw.reduce((acc, item) => {
        acc[item.action] = item._count.action
        return acc
      }, {} as Record<string, number>)

      // Get activities by resource type
      const activitiesByResourceRaw = await db.branchActivity.groupBy({
        by: ['resourceType'],
        where: whereClause,
        _count: { resourceType: true }
      })
      const activitiesByResource = activitiesByResourceRaw.reduce((acc, item) => {
        acc[item.resourceType] = item._count.resourceType
        return acc
      }, {} as Record<string, number>)

      // Get activities by user
      const activitiesByUserRaw = await db.branchActivity.groupBy({
        by: ['userId'],
        where: whereClause,
        _count: { userId: true }
      })
      const activitiesByUser = activitiesByUserRaw.reduce((acc, item) => {
        acc[item.userId] = item._count.userId
        return acc
      }, {} as Record<string, number>)

      // Get activities by branch
      const activitiesByBranchRaw = await db.branchActivity.groupBy({
        by: ['branchId'],
        where: whereClause,
        _count: { branchId: true }
      })
      const activitiesByBranch = activitiesByBranchRaw.reduce((acc, item) => {
        acc[item.branchId] = item._count.branchId
        return acc
      }, {} as Record<string, number>)

      // Get top users
      const topUsersRaw = await db.branchActivity.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        groupBy: ['userId'],
        orderBy: {
          _count: {
            userId: 'desc'
          }
        },
        take: 10
      })

      const topUsers = await Promise.all(topUsersRaw.map(async (item) => {
        const userActivities = await db.branchActivity.count({
          where: {
            ...whereClause,
            userId: item.userId
          }
        })
        return {
          userId: item.userId,
          userName: item.user.name,
          activityCount: userActivities
        }
      }))

      // Get top branches
      const topBranchesRaw = await db.branchActivity.findMany({
        where: whereClause,
        include: {
          branch: {
            select: {
              id: true,
              name: true,
              code: true
            }
          }
        },
        groupBy: ['branchId'],
        orderBy: {
          _count: {
            branchId: 'desc'
          }
        },
        take: 10
      })

      const topBranches = await Promise.all(topBranchesRaw.map(async (item) => {
        const branchActivities = await db.branchActivity.count({
          where: {
            ...whereClause,
            branchId: item.branchId
          }
        })
        return {
          branchId: item.branchId,
          branchName: item.branch.name,
          activityCount: branchActivities
        }
      }))

      return {
        totalActivities,
        activitiesByAction,
        activitiesByResource,
        activitiesByUser,
        activitiesByBranch,
        topUsers,
        topBranches
      }
    } catch (error) {
      console.error('BranchActivityService getActivitySummary error:', error)
      throw error
    }
  }

  /**
   * Get user activities within their accessible branches
   */
  static async getUserActivities(userId: string, filter: Omit<BranchActivityFilter, 'userId'> = {}): Promise<BranchActivity[]> {
    try {
      // Get user's accessible branches
      const accessibleBranches = await this.getUserAccessibleBranches(userId)
      
      if (accessibleBranches.length === 0) {
        return []
      }

      // Get user with agency info
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { agencyId: true }
      })

      if (!user) {
        return []
      }

      // Apply branch filtering
      const activities = await this.getActivities({
        ...filter,
        agencyId: user.agencyId,
        branchId: { in: accessibleBranches }
      })

      return activities
    } catch (error) {
      console.error('BranchActivityService getUserActivities error:', error)
      throw error
    }
  }

  /**
   * Get branch activities with inheritance (includes child branches)
   */
  static async getBranchActivitiesWithInheritance(
    branchId: string,
    filter: Omit<BranchActivityFilter, 'branchId'> = {},
    includeChildren: boolean = true
  ): Promise<BranchActivity[]> {
    try {
      const branchIds = [branchId]

      if (includeChildren) {
        // Get child branches
        const childBranches = await db.branch.findMany({
          where: { parentBranchId: branchId },
          select: { id: true }
        })
        branchIds.push(...childBranches.map(b => b.id))
      }

      const activities = await this.getActivities({
        ...filter,
        branchId: { in: branchIds }
      })

      return activities
    } catch (error) {
      console.error('BranchActivityService getBranchActivitiesWithInheritance error:', error)
      throw error
    }
  }

  /**
   * Validate user's access to a branch
   */
  private static async validateBranchAccess(userId: string, branchId: string, agencyId: string): Promise<boolean> {
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        include: {
          agency: true,
          branch: true,
          managedBranches: true
        }
      })

      if (!user || user.agencyId !== agencyId) {
        return false
      }

      // Super admins have access to all branches
      if (user.role === 'SUPER_ADMIN') {
        return true
      }

      // Agency admins have access to all branches in their agency
      if (user.role === 'AGENCY_ADMIN') {
        return true
      }

      // Check if user is assigned to this branch
      if (user.branchId === branchId) {
        return true
      }

      // Check if user manages this branch
      if (user.managedBranches.some(mb => mb.id === branchId)) {
        return true
      }

      // Check if user has branch-specific roles that grant access
      const userRoles = await db.userRoleAssignment.findMany({
        where: {
          userId,
          isActive: true,
          role: {
            scope: 'AGENCY'
          }
        }
      })

      if (userRoles.length > 0) {
        return true
      }

      return false
    } catch (error) {
      console.error('BranchActivityService validateBranchAccess error:', error)
      return false
    }
  }

  /**
   * Get user's accessible branches
   */
  private static async getUserAccessibleBranches(userId: string): Promise<string[]> {
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

      const accessibleBranches: string[] = []

      // Super admins have access to all branches in the system
      if (user.role === 'SUPER_ADMIN') {
        const allBranches = await db.branch.findMany({
          select: { id: true }
        })
        return allBranches.map(b => b.id)
      }

      // Agency admins have access to all branches in their agency
      if (user.role === 'AGENCY_ADMIN') {
        const agencyBranches = await db.branch.findMany({
          where: { agencyId: user.agencyId },
          select: { id: true }
        })
        return agencyBranches.map(b => b.id)
      }

      // Branch managers have access to their branch and children
      if (user.role === 'BRANCH_MANAGER') {
        if (user.branchId) {
          accessibleBranches.push(user.branchId)
          
          // Get child branches
          const childBranches = await db.branch.findMany({
            where: { parentBranchId: user.branchId },
            select: { id: true }
          })
          accessibleBranches.push(...childBranches.map(b => b.id))
        }
        
        // Also include managed branches
        if (user.managedBranches.length > 0) {
          accessibleBranches.push(...user.managedBranches.map(mb => mb.id))
        }
        
        return [...new Set(accessibleBranches)]
      }

      // Other roles have access to their assigned branch
      if (user.branchId) {
        accessibleBranches.push(user.branchId)
      }

      // Check for additional branch access through roles
      for (const userRole of user.userRoles) {
        if (userRole.role.scope === 'AGENCY') {
          const agencyBranches = await db.branch.findMany({
            where: { agencyId: user.agencyId },
            select: { id: true }
          })
          accessibleBranches.push(...agencyBranches.map(b => b.id))
        }
      }

      return [...new Set(accessibleBranches)]
    } catch (error) {
      console.error('BranchActivityService getUserAccessibleBranches error:', error)
      return []
    }
  }

  /**
   * Create activity log middleware for automatic logging
   */
  static createActivityLogger(options: {
    action: string
    resourceType: string
    getDescription?: (data: any) => string
    getResourceId?: (data: any) => string
    getMetadata?: (data: any) => Record<string, any>
  }) {
    return async (userId: string, data: any, context?: {
      agencyId: string
      branchId: string
      ipAddress?: string
      userAgent?: string
    }) => {
      try {
        if (!context) {
          throw new Error('Context is required for activity logging')
        }

        const description = options.getDescription ? options.getDescription(data) : `${options.action} ${options.resourceType}`
        const resourceId = options.getResourceId ? options.getResourceId(data) : undefined
        const metadata = options.getMetadata ? options.getMetadata(data) : undefined

        await this.logActivity({
          userId,
          agencyId: context.agencyId,
          branchId: context.branchId,
          action: options.action,
          resourceType: options.resourceType,
          resourceId,
          description,
          metadata,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent
        })
      } catch (error) {
        console.error('Error logging activity:', error)
        // Don't throw error to avoid breaking the main operation
      }
    }
  }

  /**
   * Predefined activity loggers for common operations
   */
  static activityLoggers = {
    // Student activities
    studentCreated: this.createActivityLogger({
      action: 'CREATE',
      resourceType: 'STUDENT',
      getDescription: (data) => `Created student: ${data.firstName} ${data.lastName}`,
      getResourceId: (data) => data.id,
      getMetadata: (data) => ({ studentEmail: data.email, studentType: data.type })
    }),

    studentUpdated: this.createActivityLogger({
      action: 'UPDATE',
      resourceType: 'STUDENT',
      getDescription: (data) => `Updated student: ${data.firstName} ${data.lastName}`,
      getResourceId: (data) => data.id,
      getMetadata: (data) => ({ updatedFields: Object.keys(data.changes || {}) })
    }),

    studentDeleted: this.createActivityLogger({
      action: 'DELETE',
      resourceType: 'STUDENT',
      getDescription: (data) => `Deleted student: ${data.firstName} ${data.lastName}`,
      getResourceId: (data) => data.id
    }),

    // Application activities
    applicationCreated: this.createActivityLogger({
      action: 'CREATE',
      resourceType: 'APPLICATION',
      getDescription: (data) => `Created application for ${data.program}`,
      getResourceId: (data) => data.id,
      getMetadata: (data) => ({ university: data.university, studentId: data.studentId })
    }),

    applicationUpdated: this.createActivityLogger({
      action: 'UPDATE',
      resourceType: 'APPLICATION',
      getDescription: (data) => `Updated application status to ${data.status}`,
      getResourceId: (data) => data.id,
      getMetadata: (data) => ({ status: data.status, previousStatus: data.previousStatus })
    }),

    // Document activities
    documentUploaded: this.createActivityLogger({
      action: 'CREATE',
      resourceType: 'DOCUMENT',
      getDescription: (data) => `Uploaded document: ${data.filename}`,
      getResourceId: (data) => data.id,
      getMetadata: (data) => ({ fileSize: data.size, documentType: data.type })
    }),

    documentAccessed: this.createActivityLogger({
      action: 'READ',
      resourceType: 'DOCUMENT',
      getDescription: (data) => `Accessed document: ${data.filename}`,
      getResourceId: (data) => data.id
    }),

    // Task activities
    taskCreated: this.createActivityLogger({
      action: 'CREATE',
      resourceType: 'TASK',
      getDescription: (data) => `Created task: ${data.title}`,
      getResourceId: (data) => data.id,
      getMetadata: (data) => ({ priority: data.priority, dueDate: data.dueDate })
    }),

    taskCompleted: this.createActivityLogger({
      action: 'UPDATE',
      resourceType: 'TASK',
      getDescription: (data) => `Completed task: ${data.title}`,
      getResourceId: (data) => data.id
    }),

    // Branch activities
    branchCreated: this.createActivityLogger({
      action: 'CREATE',
      resourceType: 'BRANCH',
      getDescription: (data) => `Created branch: ${data.name}`,
      getResourceId: (data) => data.id,
      getMetadata: (data) => ({ branchCode: data.code, branchType: data.type })
    }),

    branchUpdated: this.createActivityLogger({
      action: 'UPDATE',
      resourceType: 'BRANCH',
      getDescription: (data) => `Updated branch: ${data.name}`,
      getResourceId: (data) => data.id
    }),

    // User activities
    userCreated: this.createActivityLogger({
      action: 'CREATE',
      resourceType: 'USER',
      getDescription: (data) => `Created user: ${data.name}`,
      getResourceId: (data) => data.id,
      getMetadata: (data) => ({ userEmail: data.email, userRole: data.role })
    }),

    userRoleChanged: this.createActivityLogger({
      action: 'UPDATE',
      resourceType: 'USER',
      getDescription: (data) => `Changed role for user: ${data.userName}`,
      getResourceId: (data) => data.userId,
      getMetadata: (data) => ({ oldRole: data.oldRole, newRole: data.newRole })
    })
  }
}