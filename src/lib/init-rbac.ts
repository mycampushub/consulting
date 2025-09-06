import { RBACInitializer } from './rbac-init'

/**
 * Initialize RBAC system for the application
 * This should be called when the application starts
 */
export async function initializeRBAC(): Promise<void> {
  try {
    console.log('Starting RBAC initialization...')
    
    // Initialize the RBAC system
    await RBACInitializer.initialize()
    
    console.log('RBAC initialization completed successfully')
  } catch (error) {
    console.error('Failed to initialize RBAC system:', error)
    throw error
  }
}

/**
 * Setup RBAC for an existing agency (useful for migrations)
 */
export async function setupAgencyRBAC(agencyId: string): Promise<void> {
  try {
    console.log(`Setting up RBAC for agency ${agencyId}...`)
    
    await RBACInitializer.setupExistingAgency(agencyId)
    
    console.log(`RBAC setup completed for agency ${agencyId}`)
  } catch (error) {
    console.error(`Failed to setup RBAC for agency ${agencyId}:`, error)
    throw error
  }
}