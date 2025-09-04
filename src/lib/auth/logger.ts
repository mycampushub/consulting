import { db } from "@/lib/db"

export interface AuthLogData {
  agencyId: string
  studentId?: string
  userId?: string
  action: string
  entityType: string
  entityId?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  sessionId?: string
  success: boolean
  errorMessage?: string
}

export class AuthLogger {
  static async log(data: AuthLogData) {
    try {
      await db.activityLog.create({
        data: {
          agencyId: data.agencyId,
          userId: data.userId,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          changes: JSON.stringify({
            ...data.details,
            timestamp: new Date().toISOString(),
            success: data.success,
            sessionId: data.sessionId,
            errorMessage: data.errorMessage
          }),
          ipAddress: data.ipAddress || 'unknown',
          userAgent: data.userAgent || 'unknown'
        }
      })
    } catch (error) {
      console.error("Failed to log authentication event:", error)
      // Don't throw the error to avoid disrupting the main flow
    }
  }

  static async logLoginAttempt(
    agencyId: string,
    studentId: string,
    email: string,
    success: boolean,
    method: 'password' | 'fingerprint' | 'face' | '2fa',
    ipAddress?: string,
    userAgent?: string,
    sessionId?: string,
    errorMessage?: string
  ) {
    await this.log({
      agencyId,
      studentId,
      action: success ? "STUDENT_LOGIN_SUCCESS" : "STUDENT_LOGIN_FAILURE",
      entityType: "Student",
      entityId: studentId,
      details: {
        email,
        method,
        loginType: method
      },
      ipAddress,
      userAgent,
      sessionId,
      success,
      errorMessage
    })
  }

  static async logLogout(
    agencyId: string,
    studentId: string,
    sessionId?: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await this.log({
      agencyId,
      studentId,
      action: "STUDENT_LOGOUT",
      entityType: "Student",
      entityId: studentId,
      details: {
        logoutType: "manual",
        sessionId
      },
      ipAddress,
      userAgent,
      sessionId,
      success: true
    })
  }

  static async log2FAAttempt(
    agencyId: string,
    studentId: string,
    method: 'EMAIL' | 'SMS' | 'AUTHENTICATOR',
    success: boolean,
    ipAddress?: string,
    userAgent?: string,
    sessionId?: string,
    errorMessage?: string
  ) {
    await this.log({
      agencyId,
      studentId,
      action: success ? "2FA_VERIFICATION_SUCCESS" : "2FA_VERIFICATION_FAILURE",
      entityType: "Student",
      entityId: studentId,
      details: {
        method,
        verificationType: "two_factor"
      },
      ipAddress,
      userAgent,
      sessionId,
      success,
      errorMessage
    })
  }

  static async logBiometricAttempt(
    agencyId: string,
    studentId: string,
    method: 'fingerprint' | 'face',
    success: boolean,
    ipAddress?: string,
    userAgent?: string,
    sessionId?: string,
    errorMessage?: string
  ) {
    await this.log({
      agencyId,
      studentId,
      action: success ? "BIOMETRIC_VERIFICATION_SUCCESS" : "BIOMETRIC_VERIFICATION_FAILURE",
      entityType: "Student",
      entityId: studentId,
      details: {
        method,
        verificationType: "biometric"
      },
      ipAddress,
      userAgent,
      sessionId,
      success,
      errorMessage
    })
  }

  static async logSecurityEvent(
    agencyId: string,
    event: string,
    details: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
    studentId?: string
  ) {
    await this.log({
      agencyId,
      studentId,
      action: event,
      entityType: "Security",
      details,
      ipAddress,
      userAgent,
      success: true
    })
  }

  static async logAccountLock(
    agencyId: string,
    studentId: string,
    reason: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await this.log({
      agencyId,
      studentId,
      action: "ACCOUNT_LOCKED",
      entityType: "Student",
      entityId: studentId,
      details: {
        reason,
        lockType: "automatic"
      },
      ipAddress,
      userAgent,
      success: false,
      errorMessage: reason
    })
  }

  static async logAccountUnlock(
    agencyId: string,
    studentId: string,
    reason: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await this.log({
      agencyId,
      studentId,
      action: "ACCOUNT_UNLOCKED",
      entityType: "Student",
      entityId: studentId,
      details: {
        reason,
        unlockType: "automatic"
      },
      ipAddress,
      userAgent,
      success: true
    })
  }

  static async logPasswordChange(
    agencyId: string,
    studentId: string,
    success: boolean,
    ipAddress?: string,
    userAgent?: string,
    errorMessage?: string
  ) {
    await this.log({
      agencyId,
      studentId,
      action: success ? "PASSWORD_CHANGE_SUCCESS" : "PASSWORD_CHANGE_FAILURE",
      entityType: "Student",
      entityId: studentId,
      details: {
        changeType: "password_update"
      },
      ipAddress,
      userAgent,
      success,
      errorMessage
    })
  }

  static async log2FASetup(
    agencyId: string,
    studentId: string,
    method: 'EMAIL' | 'SMS' | 'AUTHENTICATOR',
    success: boolean,
    ipAddress?: string,
    userAgent?: string,
    errorMessage?: string
  ) {
    await this.log({
      agencyId,
      studentId,
      action: success ? "2FA_SETUP_SUCCESS" : "2FA_SETUP_FAILURE",
      entityType: "Student",
      entityId: studentId,
      details: {
        method,
        setupType: "two_factor"
      },
      ipAddress,
      userAgent,
      success,
      errorMessage
    })
  }

  static async logBiometricSetup(
    agencyId: string,
    studentId: string,
    method: 'fingerprint' | 'face',
    success: boolean,
    ipAddress?: string,
    userAgent?: string,
    errorMessage?: string
  ) {
    await this.log({
      agencyId,
      studentId,
      action: success ? "BIOMETRIC_SETUP_SUCCESS" : "BIOMETRIC_SETUP_FAILURE",
      entityType: "Student",
      entityId: studentId,
      details: {
        method,
        setupType: "biometric"
      },
      ipAddress,
      userAgent,
      success,
      errorMessage
    })
  }

  static async logSessionTermination(
    agencyId: string,
    studentId: string,
    sessionId: string,
    reason: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await this.log({
      agencyId,
      studentId,
      action: "SESSION_TERMINATED",
      entityType: "Student",
      entityId: studentId,
      details: {
        sessionId,
        reason,
        terminationType: "manual"
      },
      ipAddress,
      userAgent,
      sessionId,
      success: true
    })
  }

  static async logSuspiciousActivity(
    agencyId: string,
    activity: string,
    details: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
    studentId?: string
  ) {
    await this.log({
      agencyId,
      studentId,
      action: "SUSPICIOUS_ACTIVITY",
      entityType: "Security",
      details: {
        activity,
        ...details
      },
      ipAddress,
      userAgent,
      success: false,
      errorMessage: activity
    })
  }

  static async getAuthLogs(
    agencyId: string,
    studentId?: string,
    limit: number = 50,
    offset: number = 0
  ) {
    try {
      const where: any = {
        agencyId,
        action: {
          in: [
            "STUDENT_LOGIN_SUCCESS",
            "STUDENT_LOGIN_FAILURE",
            "STUDENT_LOGOUT",
            "2FA_VERIFICATION_SUCCESS",
            "2FA_VERIFICATION_FAILURE",
            "BIOMETRIC_VERIFICATION_SUCCESS",
            "BIOMETRIC_VERIFICATION_FAILURE",
            "ACCOUNT_LOCKED",
            "ACCOUNT_UNLOCKED",
            "PASSWORD_CHANGE_SUCCESS",
            "PASSWORD_CHANGE_FAILURE",
            "2FA_SETUP_SUCCESS",
            "2FA_SETUP_FAILURE",
            "BIOMETRIC_SETUP_SUCCESS",
            "BIOMETRIC_SETUP_FAILURE",
            "SESSION_TERMINATED",
            "SUSPICIOUS_ACTIVITY"
          ]
        }
      }

      if (studentId) {
        where.entityId = studentId
      }

      const logs = await db.activityLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        select: {
          id: true,
          action: true,
          entityType: true,
          entityId: true,
          changes: true,
          ipAddress: true,
          userAgent: true,
          createdAt: true
        }
      })

      return logs.map(log => ({
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        details: log.changes ? JSON.parse(log.changes) : null,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        timestamp: log.createdAt
      }))
    } catch (error) {
      console.error("Failed to fetch authentication logs:", error)
      return []
    }
  }

  static async getSecurityStats(agencyId: string, studentId?: string) {
    try {
      const where: any = {
        agencyId,
        action: {
          in: [
            "STUDENT_LOGIN_SUCCESS",
            "STUDENT_LOGIN_FAILURE",
            "2FA_VERIFICATION_FAILURE",
            "BIOMETRIC_VERIFICATION_FAILURE",
            "ACCOUNT_LOCKED",
            "SUSPICIOUS_ACTIVITY"
          ]
        }
      }

      if (studentId) {
        where.entityId = studentId
      }

      const logs = await db.activityLog.findMany({
        where,
        select: {
          action: true,
          createdAt: true
        }
      })

      const now = new Date()
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const stats = {
        totalLoginAttempts: logs.filter(log => log.action.includes("LOGIN")).length,
        failedLoginAttempts: logs.filter(log => log.action.includes("LOGIN_FAILURE")).length,
        failed2FAAttempts: logs.filter(log => log.action.includes("2FA_VERIFICATION_FAILURE")).length,
        failedBiometricAttempts: logs.filter(log => log.action.includes("BIOMETRIC_VERIFICATION_FAILURE")).length,
        accountLocks: logs.filter(log => log.action === "ACCOUNT_LOCKED").length,
        suspiciousActivities: logs.filter(log => log.action === "SUSPICIOUS_ACTIVITY").length,
        last24Hours: {
          loginAttempts: logs.filter(log => log.action.includes("LOGIN") && log.createdAt >= last24Hours).length,
          failedAttempts: logs.filter(log => 
            (log.action.includes("FAILURE") || log.action === "ACCOUNT_LOCKED") && 
            log.createdAt >= last24Hours
          ).length
        },
        last7Days: {
          loginAttempts: logs.filter(log => log.action.includes("LOGIN") && log.createdAt >= last7Days).length,
          failedAttempts: logs.filter(log => 
            (log.action.includes("FAILURE") || log.action === "ACCOUNT_LOCKED") && 
            log.createdAt >= last7Days
          ).length
        },
        last30Days: {
          loginAttempts: logs.filter(log => log.action.includes("LOGIN") && log.createdAt >= last30Days).length,
          failedAttempts: logs.filter(log => 
            (log.action.includes("FAILURE") || log.action === "ACCOUNT_LOCKED") && 
            log.createdAt >= last30Days
          ).length
        }
      }

      return stats
    } catch (error) {
      console.error("Failed to fetch security stats:", error)
      return null
    }
  }
}