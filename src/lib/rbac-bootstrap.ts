import { RBACInitializer } from './rbac-init'
import { CompleteRBAC } from './rbac-complete'

export class RBACBootstrap {
  private static initialized = false

  /**
   * Bootstrap the entire RBAC system
   */
  static async bootstrap() {
    if (this.initialized) {
      console.log('RBAC system already initialized')
      return
    }

    try {
      console.log('🚀 Bootstrapping RBAC system...')

      // Step 1: Initialize Complete RBAC
      await CompleteRBAC.initialize()
      console.log('✅ Complete RBAC initialized')

      // Step 2: Initialize RBAC with default permissions and roles
      await RBACInitializer.initialize()
      console.log('✅ Default permissions and roles created')

      // Step 3: Verify initialization
      const isInitialized = await RBACInitializer.isInitialized()
      if (!isInitialized) {
        throw new Error('RBAC system initialization verification failed')
      }

      console.log('✅ RBAC system initialization verified')
      
      this.initialized = true
      console.log('🎉 RBAC system bootstrap completed successfully')

    } catch (error) {
      console.error('❌ RBAC system bootstrap failed:', error)
      throw error
    }
  }

  /**
   * Check if RBAC system is initialized
   */
  static async isInitialized(): Promise<boolean> {
    if (!this.initialized) {
      return false
    }

    try {
      return await RBACInitializer.isInitialized()
    } catch (error) {
      console.error('Error checking RBAC initialization status:', error)
      return false
    }
  }

  /**
   * Get system status
   */
  static async getStatus(): Promise<{
    initialized: boolean
    permissionsCount: number
    rolesCount: number
    lastInitialized?: Date
  }> {
    try {
      const { db } = await import('./db')
      
      const [permissionsCount, rolesCount] = await Promise.all([
        db.permission.count(),
        db.role.count()
      ])

      return {
        initialized: await this.isInitialized(),
        permissionsCount,
        rolesCount,
        lastInitialized: this.initialized ? new Date() : undefined
      }
    } catch (error) {
      console.error('Error getting RBAC status:', error)
      return {
        initialized: false,
        permissionsCount: 0,
        rolesCount: 0
      }
    }
  }

  /**
   * Reset and reinitialize RBAC system (use with caution)
   */
  static async reset() {
    try {
      console.log('🔄 Resetting RBAC system...')
      
      // This would typically involve clearing existing permissions and roles
      // For now, we'll just reinitialize
      this.initialized = false
      await this.bootstrap()
      
      console.log('✅ RBAC system reset completed')
    } catch (error) {
      console.error('❌ RBAC system reset failed:', error)
      throw error
    }
  }

  /**
   * Ensure RBAC is initialized (useful for startup scripts)
   */
  static async ensureInitialized(): Promise<void> {
    if (!await this.isInitialized()) {
      await this.bootstrap()
    }
  }
}

/**
 * Auto-initialize RBAC system on module import
 * This ensures RBAC is ready when the application starts
 */
if (process.env.NODE_ENV !== 'test') {
  RBACBootstrap.ensureInitialized().catch(error => {
    console.error('Failed to auto-initialize RBAC system:', error)
    // Don't throw to prevent application crash
  })
}