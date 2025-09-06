import { db } from './db'
import { EnhancedRBACServiceV2, EnhancedRBACContext } from './rbac-enhanced-v2'

// ============================================================================
// Activity Logging Types
// ============================================================================

export interface ActivityLogData {
  userId?: string
  agencyId: string
  branchId?: string
  action: string
  entityType: string
  entityId?: string
  changes?: Record<string, any>
  metadata?: {
    ip?: string
    userAgent?: string
    timestamp?: Date
    requestId?: string
    sessionId?: string
    source?: string
    version?: string
  }
  severity?: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'
  category?: 'USER_ACTION' | 'SYSTEM_EVENT' | 'SECURITY' | 'COMPLIANCE' | 'PERFORMANCE'
}

export interface ActivityLogOptions {
  includeUserContext?: boolean
  includeBranchHierarchy?: boolean
  includeResourceDetails?: boolean
  sanitizeData?: boolean
  async?: boolean
}

// ============================================================================
// Enhanced Activity Logger
// ============================================================================

export class ActivityLogger {
  /**
   * Log an activity with enhanced branch-based context
   */
  static async log(
    data: ActivityLogData,
    options: ActivityLogOptions = {}
  ): Promise<void> {
    try {
      const {
        includeUserContext = true,
        includeBranchHierarchy = false,
        includeResourceDetails = false,
        sanitizeData = true,
        async = false
      } = options

      // Enhance the log data with additional context
      const enhancedData = await this.enhanceLogData(data, {
        includeUserContext,
        includeBranchHierarchy,
        includeResourceDetails,
        sanitizeData
      })

      if (async) {
        // Log asynchronously for performance
        this.logToDatabase(enhancedData).catch(error => {
          console.error('Async activity log failed:', error)
        })
      } else {
        // Log synchronously
        await this.logToDatabase(enhancedData)
      }
    } catch (error) {
      console.error('Activity logging error:', error)
      // Don't throw errors for logging failures
    }
  }

  /**
   * Log user authentication activity
   */
  static async logAuthActivity(
    userId: string,
    action: 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED' | 'PASSWORD_RESET' | 'ACCOUNT_LOCKED',
    metadata: {
      ip?: string
      userAgent?: string
      success?: boolean
      reason?: string
      method?: string
      mfaUsed?: boolean
      sessionId?: string
    } = {}
  ): Promise<void> {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { agencyId: true, branchId: true, email: true }
    })

    if (!user) return

    await this.log({
      userId,
      agencyId: user.agencyId!,
      branchId: user.branchId,
      action: `AUTH_${action}`,
      entityType: 'User',
      entityId: userId,
      changes: {
        email: user.email,
        ...metadata
      },
      metadata: {
        ip: metadata.ip,
        userAgent: metadata.userAgent,
        category: 'SECURITY',
        severity: action.includes('FAILED') || action === 'ACCOUNT_LOCKED' ? 'WARNING' : 'INFO'
      },
      category: 'SECURITY'
    })
  }

  /**
   * Log RBAC/permission activity
   */
  static async logPermissionActivity(
    userId: string,
    action: 'PERMISSION_GRANTED' | 'PERMISSION_DENIED' | 'PERMISSION_REVOKED' | 'ROLE_ASSIGNED' | 'ROLE_REMOVED',
    resource: string,
    details: {
      targetUserId?: string
      roleId?: string
      permission?: string
      reason?: string
      context?: EnhancedRBACContext
    } = {}
  ): Promise<void> {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { agencyId: true, branchId: true }
    })

    if (!user) return

    await this.log({
      userId,
      agencyId: user.agencyId!,
      branchId: user.branchId,
      action,
      entityType: 'Permission',
      changes: {
        resource,
        ...details,
        context: details.context ? {
          accessLevel: details.context.accessLevel,
          accessibleBranches: details.context.accessibleBranches,
          effectiveRole: details.context.effectiveRole
        } : undefined
      },
      metadata: {
        category: 'SECURITY',
        severity: action.includes('DENIED') ? 'WARNING' : 'INFO'
      },
      category: 'SECURITY'
    })
  }

  /**
   * Log branch-related activity
   */
  static async logBranchActivity(
    userId: string,
    action: 'BRANCH_CREATED' | 'BRANCH_UPDATED' | 'BRANCH_DELETED' | 'BRANCH_ACCESS_GRANTED' | 'BRANCH_ACCESS_REVOKED',
    branchId: string,
    details: {
      branchName?: string
      targetUserId?: string
      reason?: string
      changes?: Record<string, any>
    } = {}
  ): Promise<void> {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { agencyId: true, branchId: true }
    })

    if (!user) return

    await this.log({
      userId,
      agencyId: user.agencyId!,
      branchId: user.branchId,
      action,
      entityType: 'Branch',
      entityId: branchId,
      changes: {
        branchId,
        ...details
      },
      metadata: {
        category: 'USER_ACTION',
        severity: action.includes('DELETED') ? 'WARNING' : 'INFO'
      },
      category: 'USER_ACTION'
    })
  }

  /**
   * Log data access activity
   */
  static async logDataAccess(
    userId: string,
    action: 'DATA_VIEWED' | 'DATA_EXPORTED' | 'DATA_MODIFIED' | 'DATA_DELETED',
    resourceType: string,
    resourceId: string,
    details: {
      filter?: any
      count?: number
      format?: string
      reason?: string
    } = {}
  ): Promise<void> {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { agencyId: true, branchId: true }
    })

    if (!user) return

    await this.log({
      userId,
      agencyId: user.agencyId!,
      branchId: user.branchId,
      action,
      entityType: resourceType,
      entityId: resourceId,
      changes: {
        resourceType,
        resourceId,
        ...details
      },
      metadata: {
        category: action === 'DATA_EXPORTED' ? 'COMPLIANCE' : 'USER_ACTION',
        severity: action === 'DATA_DELETED' ? 'WARNING' : 'INFO'
      },
      category: action === 'DATA_EXPORTED' ? 'COMPLIANCE' : 'USER_ACTION'
    })
  }

  /**
   * Log system events
   */
  static async logSystemEvent(
    action: string,
    agencyId: string,
    details: {
      component?: string
      error?: string
      performance?: {
        duration?: number
        memory?: number
        cpu?: number
      }
      config?: Record<string, any>
    } = {}
  ): Promise<void> {
    await this.log({
      agencyId,
      action,
      entityType: 'System',
      changes: details,
      metadata: {
        category: 'SYSTEM_EVENT',
        severity: details.error ? 'ERROR' : 'INFO'
      },
      category: 'SYSTEM_EVENT'
    })
  }

  /**
   * Log compliance-related activities
   */
  static async logComplianceActivity(
    userId: string,
    action: 'GDPR_REQUEST' | 'DATA_RETENTION' | 'AUDIT_TRAIL' | 'COMPLIANCE_CHECK',
    details: {
      requestType?: string
      dataSubject?: string
      retentionPeriod?: string
      auditResult?: string
      regulations?: string[]
    } = {}
  ): Promise<void> {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { agencyId: true, branchId: true }
    })

    if (!user) return

    await this.log({
      userId,
      agencyId: user.agencyId!,
      branchId: user.branchId,
      action,
      entityType: 'Compliance',
      changes: details,
      metadata: {
        category: 'COMPLIANCE',
        severity: 'INFO'
      },
      category: 'COMPLIANCE'
    })
  }

  /**
   * Get activity logs with branch-based filtering
   */
  static async getActivityLogs(
    userId: string,
    filters: {
      agencyId?: string
      branchId?: string
      action?: string
      entityType?: string
      entityId?: string
      startDate?: Date
      endDate?: Date
      severity?: string
      category?: string
      limit?: number
      offset?: number
    } = {}
  ): Promise<{
    logs: any[]
    total: number
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }> {
    try {
      const userContext = await EnhancedRBACServiceV2.getUserContext(userId)

      // Build where clause with branch-based filtering
      const where: any = {
        agencyId: filters.agencyId || userContext.agencyId,
        ...(filters.branchId && { branchId: filters.branchId }),
        ...(filters.action && { action: filters.action }),
        ...(filters.entityType && { entityType: filters.entityType }),
        ...(filters.entityId && { entityId: filters.entityId }),
        ...(filters.severity && { 
          metadata: {
            path: '$.severity',
            equals: filters.severity
          }
        }),
        ...(filters.category && { 
          metadata: {
            path: '$.category',
            equals: filters.category
          }
        }),
        ...(filters.startDate && { createdAt: { gte: filters.startDate } }),
        ...(filters.endDate && { createdAt: { lte: filters.endDate } })
      }

      // Apply branch-based filtering
      if (userContext.accessLevel !== 'GLOBAL' && userContext.accessLevel !== 'AGENCY') {
        where.branchId = { in: userContext.accessibleBranches }
      }

      const limit = filters.limit || 50
      const offset = filters.offset || 0
      const page = Math.floor(offset / limit) + 1

      const [logs, total] = await Promise.all([
        db.activityLog.findMany({
          where,
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
            }
          },
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: limit
        }),
        db.activityLog.count({ where })
      ])

      return {
        logs: logs.map(log => ({
          ...log,
          changes: log.changes ? JSON.parse(log.changes) : null,
          metadata: log.metadata ? JSON.parse(log.metadata) : null
        })),
        total,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    } catch (error) {
      console.error('Error getting activity logs:', error)
      return {
        logs: [],
        total: 0,
        pagination: {
          page: 1,
          limit: filters.limit || 50,
          total: 0,
          pages: 0
        }
      }
    }
  }

  // ============================================================================
  // Private Implementation Methods
  // ============================================================================

  /**
   * Enhance log data with additional context
   */
  private static async enhanceLogData(
    data: ActivityLogData,
    options: {
      includeUserContext: boolean
      includeBranchHierarchy: boolean
      includeResourceDetails: boolean
      sanitizeData: boolean
    }
  ): Promise<ActivityLogData> {
    const enhanced = { ...data }

    // Add timestamp if not provided
    if (!enhanced.metadata?.timestamp) {
      enhanced.metadata = enhanced.metadata || {}
      enhanced.metadata.timestamp = new Date()
    }

    // Add user context if requested
    if (options.includeUserContext && data.userId) {
      try {
        const userContext = await EnhancedRBACServiceV2.getUserContext(data.userId)
        enhanced.changes = enhanced.changes || {}
        enhanced.changes.userContext = {
          accessLevel: userContext.accessLevel,
          accessibleBranches: userContext.accessibleBranches,
          managedBranches: userContext.managedBranches,
          effectiveRole: userContext.effectiveRole
        }
      } catch (error) {
        console.error('Error getting user context for activity log:', error)
      }
    }

    // Add branch hierarchy if requested
    if (options.includeBranchHierarchy && data.branchId) {
      try {
        const branchHierarchy = await EnhancedRBACServiceV2.getBranchHierarchy(data.agencyId)
        const branchPath = this.findBranchPath(branchHierarchy, data.branchId)
        enhanced.changes = enhanced.changes || {}
        enhanced.changes.branchHierarchy = {
          path: branchPath,
          level: branchPath.length
        }
      } catch (error) {
        console.error('Error getting branch hierarchy for activity log:', error)
      }
    }

    // Add resource details if requested
    if (options.includeResourceDetails && data.entityId && data.entityType) {
      try {
        const resourceDetails = await this.getResourceDetails(data.entityType, data.entityId)
        enhanced.changes = enhanced.changes || {}
        enhanced.changes.resourceDetails = resourceDetails
      } catch (error) {
        console.error('Error getting resource details for activity log:', error)
      }
    }

    // Sanitize data if requested
    if (options.sanitizeData) {
      enhanced.changes = this.sanitizeData(enhanced.changes)
    }

    return enhanced
  }

  /**
   * Find branch path in hierarchy
   */
  private static findBranchPath(hierarchy: any[], branchId: string, path: any[] = []): any[] {
    for (const branch of hierarchy) {
      if (branch.id === branchId) {
        return [...path, branch]
      }
      
      if (branch.children && branch.children.length > 0) {
        const found = this.findBranchPath(branch.children, branchId, [...path, branch])
        if (found.length > 0) {
          return found
        }
      }
    }
    return []
  }

  /**
   * Get resource details for logging
   */
  private static async getResourceDetails(entityType: string, entityId: string): Promise<any> {
    switch (entityType) {
      case 'User':
        const user = await db.user.findUnique({
          where: { id: entityId },
          select: { id: true, name: true, email: true, role: true, branchId: true }
        })
        return user

      case 'Student':
        const student = await db.student.findUnique({
          where: { id: entityId },
          select: { id: true, firstName: true, lastName: true, email: true, branchId: true }
        })
        return student

      case 'Application':
        const application = await db.application.findUnique({
          where: { id: entityId },
          select: { id: true, program: true, status: true, studentId: true, branchId: true }
        })
        return application

      case 'Branch':
        const branch = await db.branch.findUnique({
          where: { id: entityId },
          select: { id: true, name: true, code: true, type: true, status: true }
        })
        return branch

      case 'Role':
        const role = await db.role.findUnique({
          where: { id: entityId },
          select: { id: true, name: true, slug: true, scope: true, branchId: true }
        })
        return role

      default:
        return { id: entityId, type: entityType }
    }
  }

  /**
   * Sanitize sensitive data for logging
   */
  private static sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data
    }

    const sensitiveFields = [
      'password', 'token', 'secret', 'key', 'authorization',
      'creditCard', 'ssn', 'socialSecurity', 'passport'
    ]

    const sanitized = { ...data }

    for (const key in sanitized) {
      if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeData(sanitized[key])
      } else if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        sanitized[key] = '[REDACTED]'
      }
    }

    return sanitized
  }

  /**
   * Log to database
   */
  private static async logToDatabase(data: ActivityLogData): Promise<void> {
    await db.activityLog.create({
      data: {
        agencyId: data.agencyId,
        userId: data.userId,
        branchId: data.branchId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        changes: data.changes ? JSON.stringify(data.changes) : null,
        ipAddress: data.metadata?.ip,
        userAgent: data.metadata?.userAgent,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null
      }
    })
  }
}

// ============================================================================
// Convenience Export Functions
// ============================================================================

export const logActivity = ActivityLogger.log
export const logAuthActivity = ActivityLogger.logAuthActivity
export const logPermissionActivity = ActivityLogger.logPermissionActivity
export const logBranchActivity = ActivityLogger.logBranchActivity
export const logDataAccess = ActivityLogger.logDataAccess
export const logSystemEvent = ActivityLogger.logSystemEvent
export const logComplianceActivity = ActivityLogger.logComplianceActivity
export const getActivityLogs = ActivityLogger.getActivityLogs