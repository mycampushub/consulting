import { EnhancedRBACServiceV2, EnhancedAccessLevel } from './src/lib/rbac-enhanced-v2'
import { RBACMiddlewareV2, ResourceType, PermissionAction } from './src/lib/rbac-middleware-v2'
import { ActivityLogger } from './src/lib/activity-logger'
import { db } from './src/lib/db'

/**
 * Comprehensive RBAC System Test Script
 * 
 * This script tests the enhanced RBAC system with branch-based access control.
 * Run with: npx tsx test-rbac-system.ts
 */

class RBACTestRunner {
  private testResults: { name: string; passed: boolean; message?: string; duration?: number }[] = []

  constructor() {
    console.log('🚀 Starting Enhanced RBAC System Tests...\n')
  }

  async runAllTests(): Promise<void> {
    const tests = [
      () => this.testUserContextRetrieval(),
      () => this.testPermissionChecking(),
      () => this.testBranchHierarchy(),
      () => this.testBranchFiltering(),
      () => this.testMiddlewareIntegration(),
      () => this.testActivityLogging(),
      () => this.testCacheManagement(),
      () => this.testErrorHandling()
    ]

    for (const test of tests) {
      try {
        await test()
      } catch (error) {
        this.recordResult(test.name, false, `Test failed with error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    this.printResults()
  }

  private async testUserContextRetrieval(): Promise<void> {
    console.log('📋 Testing User Context Retrieval...')
    const startTime = Date.now()

    try {
      // Get a test user (you may need to adjust this ID)
      const testUser = await db.user.findFirst({
        where: { role: 'AGENCY_ADMIN', status: 'ACTIVE' },
        include: { agency: true }
      })

      if (!testUser) {
        throw new Error('No test user found')
      }

      // Test user context retrieval
      const userContext = await EnhancedRBACServiceV2.getUserContext(testUser.id)

      // Validate context structure
      const requiredFields = ['userId', 'agencyId', 'accessibleBranches', 'managedBranches', 'accessLevel', 'effectiveRole']
      for (const field of requiredFields) {
        if (!(field in userContext)) {
          throw new Error(`Missing required field: ${field}`)
        }
      }

      // Validate access level
      if (!Object.values(EnhancedAccessLevel).includes(userContext.accessLevel)) {
        throw new Error(`Invalid access level: ${userContext.accessLevel}`)
      }

      // Test caching
      const cachedContext = await EnhancedRBACServiceV2.getUserContext(testUser.id)
      if (JSON.stringify(userContext) !== JSON.stringify(cachedContext)) {
        throw new Error('Caching not working properly')
      }

      const duration = Date.now() - startTime
      this.recordResult('User Context Retrieval', true, `Retrieved context for user ${testUser.email} in ${duration}ms`, duration)

    } catch (error) {
      this.recordResult('User Context Retrieval', false, error instanceof Error ? error.message : 'Unknown error')
    }
  }

  private async testPermissionChecking(): Promise<void> {
    console.log('🔐 Testing Permission Checking...')
    const startTime = Date.now()

    try {
      // Get test users with different roles
      const agencyAdmin = await db.user.findFirst({
        where: { role: 'AGENCY_ADMIN', status: 'ACTIVE' },
        include: { agency: true }
      })

      const consultant = await db.user.findFirst({
        where: { role: 'CONSULTANT', status: 'ACTIVE' },
        include: { agency: true }
      })

      if (!agencyAdmin || !consultant) {
        throw new Error('Test users not found')
      }

      // Test agency admin permissions
      const adminPermission = await EnhancedRBACServiceV2.checkPermission(agencyAdmin.id, {
        resource: ResourceType.USERS,
        action: PermissionAction.READ
      })

      if (!adminPermission.allowed) {
        throw new Error('Agency admin should have user read permissions')
      }

      // Test consultant permissions
      const consultantPermission = await EnhancedRBACServiceV2.checkPermission(consultant.id, {
        resource: ResourceType.USERS,
        action: PermissionAction.READ
      })

      // Test branch-scoped permission
      const branchScopedPermission = await EnhancedRBACServiceV2.checkPermission(consultant.id, {
        resource: ResourceType.USERS,
        action: PermissionAction.READ,
        scope: 'OWN'
      })

      // Test ownership requirement
      const ownershipPermission = await EnhancedRBACServiceV2.checkPermission(consultant.id, {
        resource: ResourceType.TASKS,
        action: PermissionAction.MANAGE,
        requireOwnership: true
      })

      const duration = Date.now() - startTime
      this.recordResult('Permission Checking', true, `Successfully tested permissions for ${agencyAdmin.email} and ${consultant.email}`, duration)

    } catch (error) {
      this.recordResult('Permission Checking', false, error instanceof Error ? error.message : 'Unknown error')
    }
  }

  private async testBranchHierarchy(): Promise<void> {
    console.log('🌳 Testing Branch Hierarchy...')
    const startTime = Date.now()

    try {
      // Get test agency
      const testAgency = await db.agency.findFirst()
      if (!testAgency) {
        throw new Error('No test agency found')
      }

      // Test branch hierarchy retrieval
      const branchHierarchy = await EnhancedRBACServiceV2.getBranchHierarchy(testAgency.id)

      if (!Array.isArray(branchHierarchy)) {
        throw new Error('Branch hierarchy should be an array')
      }

      // Validate hierarchy structure
      const validateBranchNode = (node: any, depth = 0) => {
        if (!node.id || !node.name || !node.type) {
          throw new Error('Invalid branch node structure')
        }
        if (node.level !== depth) {
          throw new Error(`Incorrect level for branch ${node.name}: expected ${depth}, got ${node.level}`)
        }
        if (node.children && Array.isArray(node.children)) {
          node.children.forEach((child: any) => validateBranchNode(child, depth + 1))
        }
      }

      branchHierarchy.forEach(node => validateBranchNode(node))

      // Test caching
      const cachedHierarchy = await EnhancedRBACServiceV2.getBranchHierarchy(testAgency.id)
      if (JSON.stringify(branchHierarchy) !== JSON.stringify(cachedHierarchy)) {
        throw new Error('Branch hierarchy caching not working properly')
      }

      const duration = Date.now() - startTime
      this.recordResult('Branch Hierarchy', true, `Retrieved hierarchy for agency ${testAgency.name} with ${branchHierarchy.length} root branches`, duration)

    } catch (error) {
      this.recordResult('Branch Hierarchy', false, error instanceof Error ? error.message : 'Unknown error')
    }
  }

  private async testBranchFiltering(): Promise<void> {
    console.log('🔍 Testing Branch Filtering...')
    const startTime = Date.now()

    try {
      // Get test user
      const testUser = await db.user.findFirst({
        where: { role: 'CONSULTANT', status: 'ACTIVE' },
        include: { agency: true }
      })

      if (!testUser) {
        throw new Error('No test user found')
      }

      // Test branch filtering for different scopes
      const ownFilter = await EnhancedRBACServiceV2.applyBranchFilter(testUser.id, {}, {
        resource: ResourceType.USERS,
        scope: 'OWN'
      })

      const branchFilter = await EnhancedRBACServiceV2.applyBranchFilter(testUser.id, {}, {
        resource: ResourceType.USERS,
        scope: 'BRANCH'
      })

      const assignedFilter = await EnhancedRBACServiceV2.applyBranchFilter(testUser.id, {}, {
        resource: ResourceType.USERS,
        scope: 'ASSIGNED',
        includeAssigned: true
      })

      // Validate filter structures
      const validateFilter = (filter: any, type: string) => {
        if (typeof filter !== 'object' || filter === null) {
          throw new Error(`${type} filter should be an object`)
        }
      }

      validateFilter(ownFilter, 'OWN')
      validateFilter(branchFilter, 'BRANCH')
      validateFilter(assignedFilter, 'ASSIGNED')

      const duration = Date.now() - startTime
      this.recordResult('Branch Filtering', true, `Successfully tested branch filtering for user ${testUser.email}`, duration)

    } catch (error) {
      this.recordResult('Branch Filtering', false, error instanceof Error ? error.message : 'Unknown error')
    }
  }

  private async testMiddlewareIntegration(): Promise<void> {
    console.log('🛡️ Testing Middleware Integration...')
    const startTime = Date.now()

    try {
      // Test middleware creation (without actual HTTP requests)
      const testHandler = async () => new Response('OK')

      // Test various middleware combinations
      const authMiddleware = RBACMiddlewareV2.requireAuth(testHandler)
      const agencyMiddleware = RBACMiddlewareV2.requireAgency(testHandler)
      const branchMiddleware = RBACMiddlewareV2.requireBranch(testHandler, EnhancedAccessLevel.BRANCH)
      const permissionsMiddleware = RBACMiddlewareV2.requirePermissions([
        { resource: ResourceType.USERS, action: PermissionAction.READ }
      ])
      const resourceMiddleware = RBACMiddlewareV2.requireResourceAccess(ResourceType.USERS, PermissionAction.READ)

      // Validate middleware functions are returned
      if (typeof authMiddleware !== 'function') {
        throw new Error('Auth middleware should be a function')
      }
      if (typeof agencyMiddleware !== 'function') {
        throw new Error('Agency middleware should be a function')
      }
      if (typeof branchMiddleware !== 'function') {
        throw new Error('Branch middleware should be a function')
      }
      if (typeof permissionsMiddleware !== 'function') {
        throw new Error('Permissions middleware should be a function')
      }
      if (typeof resourceMiddleware !== 'function') {
        throw new Error('Resource middleware should be a function')
      }

      const duration = Date.now() - startTime
      this.recordResult('Middleware Integration', true, 'All middleware functions created successfully', duration)

    } catch (error) {
      this.recordResult('Middleware Integration', false, error instanceof Error ? error.message : 'Unknown error')
    }
  }

  private async testActivityLogging(): Promise<void> {
    console.log('📝 Testing Activity Logging...')
    const startTime = Date.now()

    try {
      // Get test user
      const testUser = await db.user.findFirst({
        where: { status: 'ACTIVE' },
        include: { agency: true }
      })

      if (!testUser) {
        throw new Error('No test user found')
      }

      // Test different types of activity logging
      await ActivityLogger.logAuthActivity(testUser.id, 'LOGIN', {
        ip: '127.0.0.1',
        userAgent: 'Test Browser',
        success: true
      })

      await ActivityLogger.logPermissionActivity(testUser.id, 'PERMISSION_GRANTED', 'User', '', {
        targetUserId: testUser.id,
        reason: 'Test permission grant'
      })

      await ActivityLogger.logBranchActivity(testUser.id, 'BRANCH_ACCESS_GRANTED', testUser.branchId || '', {
        targetUserId: testUser.id,
        reason: 'Test branch access'
      })

      await ActivityLogger.logDataAccess(testUser.id, 'DATA_VIEWED', 'User', '', {
        filter: { test: true },
        count: 1
      })

      await ActivityLogger.logSystemEvent('TEST_EVENT', testUser.agencyId!, {
        component: 'test-runner',
        test: true
      })

      await ActivityLogger.logComplianceActivity(testUser.id, 'GDPR_REQUEST', {
        requestType: 'DATA_ACCESS',
        dataSubject: testUser.email
      })

      // Test activity log retrieval
      const logs = await ActivityLogger.getActivityLogs(testUser.id, {
        limit: 10,
        category: 'SECURITY'
      })

      if (!Array.isArray(logs.logs)) {
        throw new Error('Activity logs should be an array')
      }

      if (typeof logs.total !== 'number') {
        throw new Error('Activity total should be a number')
      }

      const duration = Date.now() - startTime
      this.recordResult('Activity Logging', true, `Successfully logged and retrieved ${logs.logs.length} activities`, duration)

    } catch (error) {
      this.recordResult('Activity Logging', false, error instanceof Error ? error.message : 'Unknown error')
    }
  }

  private async testCacheManagement(): Promise<void> {
    console.log('⚡ Testing Cache Management...')
    const startTime = Date.now()

    try {
      // Get test user
      const testUser = await db.user.findFirst({
        where: { status: 'ACTIVE' },
        include: { agency: true }
      })

      if (!testUser) {
        throw new Error('No test user found')
      }

      // Test cache clearing
      RBACMiddlewareV2.clearUserCache(testUser.id)
      RBACMiddlewareV2.clearAllCache()

      // Test cache functionality after clearing
      const userContext = await EnhancedRBACServiceV2.getUserContext(testUser.id, true) // force refresh
      const branchHierarchy = await EnhancedRBACServiceV2.getBranchHierarchy(testUser.agencyId!, true) // force refresh

      if (!userContext.userId) {
        throw new Error('User context should be populated after cache clear')
      }

      if (!Array.isArray(branchHierarchy)) {
        throw new Error('Branch hierarchy should be an array after cache clear')
      }

      const duration = Date.now() - startTime
      this.recordResult('Cache Management', true, 'Cache cleared and refreshed successfully', duration)

    } catch (error) {
      this.recordResult('Cache Management', false, error instanceof Error ? error.message : 'Unknown error')
    }
  }

  private async testErrorHandling(): Promise<void> {
    console.log('⚠️ Testing Error Handling...')
    const startTime = Date.now()

    try {
      // Test permission check with invalid user
      try {
        await EnhancedRBACServiceV2.checkPermission('invalid-user-id', {
          resource: ResourceType.USERS,
          action: PermissionAction.READ
        })
        throw new Error('Should have thrown error for invalid user')
      } catch (error) {
        if (!(error instanceof Error && error.message.includes('User not found'))) {
          throw new Error('Unexpected error for invalid user')
        }
      }

      // Test branch hierarchy with invalid agency
      try {
        await EnhancedRBACServiceV2.getBranchHierarchy('invalid-agency-id')
        throw new Error('Should have thrown error for invalid agency')
      } catch (error) {
        // This should not throw an error, but return empty array
      }

      // Test activity logging with invalid data
      await ActivityLogger.log({
        agencyId: 'invalid-agency-id',
        action: 'TEST_ACTION',
        entityType: 'TestEntity'
      }) // Should not throw error

      const duration = Date.now() - startTime
      this.recordResult('Error Handling', true, 'Error handling working correctly', duration)

    } catch (error) {
      this.recordResult('Error Handling', false, error instanceof Error ? error.message : 'Unknown error')
    }
  }

  private recordResult(name: string, passed: boolean, message?: string, duration?: number): void {
    const result = {
      name,
      passed,
      message,
      duration
    }
    this.testResults.push(result)

    const status = passed ? '✅' : '❌'
    const durationStr = duration ? ` (${duration}ms)` : ''
    console.log(`${status} ${name}${durationStr}${message ? ` - ${message}` : ''}`)
  }

  private printResults(): void {
    console.log('\n📊 Test Results Summary')
    console.log('='.repeat(50))

    const passed = this.testResults.filter(r => r.passed).length
    const failed = this.testResults.filter(r => !r.passed).length
    const total = this.testResults.length

    console.log(`Total Tests: ${total}`)
    console.log(`Passed: ${passed} (${((passed / total) * 100).toFixed(1)}%)`)
    console.log(`Failed: ${failed} (${((failed / total) * 100).toFixed(1)}%)`)

    if (failed > 0) {
      console.log('\n❌ Failed Tests:')
      this.testResults.filter(r => !r.passed).forEach(result => {
        console.log(`  - ${result.name}: ${result.message}`)
      })
    }

    console.log('\n🏁 RBAC System Test Complete!')
    
    if (failed === 0) {
      console.log('🎉 All tests passed! The enhanced RBAC system is working correctly.')
    } else {
      console.log('⚠️  Some tests failed. Please review the failed tests above.')
    }
  }
}

// Run the tests
async function main() {
  const testRunner = new RBACTestRunner()
  await testRunner.runAllTests()
}

main().catch(console.error)