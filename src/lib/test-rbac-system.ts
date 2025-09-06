import { UnifiedRBAC, type BranchAccessLevel } from './rbac-unified'
import { UnifiedAuth } from './auth-unified'
import { ActivityLogger } from './activity-logger'
import { db } from './db'

// ============================================================================
// RBAC System Test Suite
// ============================================================================

export class RBACTestSuite {
  private static testResults: Array<{
    testName: string
    passed: boolean
    message: string
    duration: number
  }> = []

  /**
   * Run all RBAC system tests
   */
  static async runAllTests(): Promise<{
    passed: number
    failed: number
    total: number
    results: typeof RBACTestSuite.testResults
  }> {
    console.log('🧪 Starting RBAC System Test Suite...')
    console.log('=====================================')

    const tests = [
      this.testBasicPermissionCheck,
      this.testBranchAccessCalculation,
      this.testBranchFiltering,
      this.testActivityLogging,
      this.testMiddlewareIntegration,
      this.testCacheFunctionality,
      this.testRoleHierarchy,
      this.testResourceAccess
    ]

    for (const test of tests) {
      const startTime = Date.now()
      try {
        await test()
        const duration = Date.now() - startTime
        this.testResults.push({
          testName: test.name.replace('bound ', ''),
          passed: true,
          message: '✅ Passed',
          duration
        })
        console.log(`✅ ${test.name.replace('bound ', '')} - Passed (${duration}ms)`)
      } catch (error) {
        const duration = Date.now() - startTime
        this.testResults.push({
          testName: test.name.replace('bound ', ''),
          passed: false,
          message: `❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          duration
        })
        console.log(`❌ ${test.name.replace('bound ', '')} - Failed: ${error instanceof Error ? error.message : 'Unknown error'} (${duration}ms)`)
      }
    }

    console.log('=====================================')
    const passed = this.testResults.filter(r => r.passed).length
    const failed = this.testResults.filter(r => !r.passed).length
    const total = this.testResults.length

    console.log(`📊 Test Results: ${passed}/${total} passed, ${failed} failed`)

    return { passed, failed, total, results: this.testResults }
  }

  /**
   * Test 1: Basic Permission Check
   */
  private static async testBasicPermissionCheck(): Promise<void> {
    console.log('  Testing basic permission checks...')

    // Create a test user
    const testUser = await db.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        role: 'AGENCY_ADMIN',
        status: 'ACTIVE',
        agencyId: 'test-agency-id'
      }
    })

    try {
      // Test basic permission check
      const decision = await UnifiedRBAC.checkPermission(testUser.id, {
        resource: 'students',
        action: 'read'
      })

      if (!decision.allowed) {
        throw new Error('Basic permission check failed')
      }

      // Test non-existent permission
      const deniedDecision = await UnifiedRBAC.checkPermission(testUser.id, {
        resource: 'nonexistent',
        action: 'read'
      })

      if (deniedDecision.allowed) {
        throw new Error('Should deny access to non-existent resource')
      }

      console.log('    ✅ Basic permission checks work correctly')
    } finally {
      // Cleanup
      await db.user.delete({ where: { id: testUser.id } })
    }
  }

  /**
   * Test 2: Branch Access Calculation
   */
  private static async testBranchAccessCalculation(): Promise<void> {
    console.log('  Testing branch access calculation...')

    // Create test agency
    const testAgency = await db.agency.create({
      data: {
        name: 'Test Agency',
        subdomain: 'test-agency',
        status: 'ACTIVE'
      }
    })

    // Create test branches
    const mainBranch = await db.branch.create({
      data: {
        agencyId: testAgency.id,
        name: 'Main Branch',
        code: 'MAIN',
        type: 'MAIN',
        status: 'ACTIVE'
      }
    })

    const subBranch = await db.branch.create({
      data: {
        agencyId: testAgency.id,
        name: 'Sub Branch',
        code: 'SUB',
        type: 'BRANCH',
        status: 'ACTIVE'
      }
    })

    try {
      // Test agency admin access
      const agencyAdmin = await db.user.create({
        data: {
          email: 'admin@test.com',
          name: 'Agency Admin',
          role: 'AGENCY_ADMIN',
          status: 'ACTIVE',
          agencyId: testAgency.id
        }
      })

      const adminAccess = await UnifiedRBAC.getBranchAccess(agencyAdmin.id)
      
      if (adminAccess.level !== BranchAccessLevel.AGENCY) {
        throw new Error('Agency admin should have AGENCY access level')
      }

      if (adminAccess.accessibleBranches.length !== 2) {
        throw new Error('Agency admin should access all branches')
      }

      // Test regular user access
      const regularUser = await db.user.create({
        data: {
          email: 'user@test.com',
          name: 'Regular User',
          role: 'CONSULTANT',
          status: 'ACTIVE',
          agencyId: testAgency.id,
          branchId: mainBranch.id
        }
      })

      const userAccess = await UnifiedRBAC.getBranchAccess(regularUser.id)
      
      if (userAccess.level !== BranchAccessLevel.OWN) {
        throw new Error('Regular user should have OWN access level')
      }

      if (!userAccess.accessibleBranches.includes(mainBranch.id)) {
        throw new Error('User should access their own branch')
      }

      console.log('    ✅ Branch access calculation works correctly')
    } finally {
      // Cleanup
      await db.user.deleteMany({ where: { agencyId: testAgency.id } })
      await db.branch.deleteMany({ where: { agencyId: testAgency.id } })
      await db.agency.delete({ where: { id: testAgency.id } })
    }
  }

  /**
   * Test 3: Branch Filtering
   */
  private static async testBranchFiltering(): Promise<void> {
    console.log('  Testing branch filtering...')

    // Create test agency and branches
    const testAgency = await db.agency.create({
      data: {
        name: 'Test Agency',
        subdomain: 'test-agency-2',
        status: 'ACTIVE'
      }
    })

    const branch1 = await db.branch.create({
      data: {
        agencyId: testAgency.id,
        name: 'Branch 1',
        code: 'B1',
        status: 'ACTIVE'
      }
    })

    const branch2 = await db.branch.create({
      data: {
        agencyId: testAgency.id,
        name: 'Branch 2',
        code: 'B2',
        status: 'ACTIVE'
      }
    })

    try {
      // Create test users
      const adminUser = await db.user.create({
        data: {
          email: 'admin2@test.com',
          name: 'Admin User',
          role: 'AGENCY_ADMIN',
          status: 'ACTIVE',
          agencyId: testAgency.id
        }
      })

      const branchUser = await db.user.create({
        data: {
          email: 'branch@test.com',
          name: 'Branch User',
          role: 'CONSULTANT',
          status: 'ACTIVE',
          agencyId: testAgency.id,
          branchId: branch1.id
        }
      })

      // Create test students
      await db.student.create({
        data: {
          agencyId: testAgency.id,
          branchId: branch1.id,
          firstName: 'Student 1',
          lastName: 'Test',
          email: 'student1@test.com',
          status: 'PROSPECT'
        }
      })

      await db.student.create({
        data: {
          agencyId: testAgency.id,
          branchId: branch2.id,
          firstName: 'Student 2',
          lastName: 'Test',
          email: 'student2@test.com',
          status: 'PROSPECT'
        }
      })

      // Test admin filtering (should see all branches)
      const adminFilter = await UnifiedRBAC.applyBranchFilter(adminUser.id, {
        agencyId: testAgency.id
      }, {
        resourceType: 'students'
      })

      const adminStudents = await db.student.findMany({ where: adminFilter })
      
      if (adminStudents.length !== 2) {
        throw new Error('Admin should see all students')
      }

      // Test branch user filtering (should see only their branch)
      const branchFilter = await UnifiedRBAC.applyBranchFilter(branchUser.id, {
        agencyId: testAgency.id
      }, {
        resourceType: 'students'
      })

      const branchStudents = await db.student.findMany({ where: branchFilter })
      
      if (branchStudents.length !== 1) {
        throw new Error('Branch user should see only their branch students')
      }

      if (branchStudents[0].branchId !== branch1.id) {
        throw new Error('Branch user should see only their branch')
      }

      console.log('    ✅ Branch filtering works correctly')
    } finally {
      // Cleanup
      await db.student.deleteMany({ where: { agencyId: testAgency.id } })
      await db.user.deleteMany({ where: { agencyId: testAgency.id } })
      await db.branch.deleteMany({ where: { agencyId: testAgency.id } })
      await db.agency.delete({ where: { id: testAgency.id } })
    }
  }

  /**
   * Test 4: Activity Logging
   */
  private static async testActivityLogging(): Promise<void> {
    console.log('  Testing activity logging...')

    const testAgency = await db.agency.create({
      data: {
        name: 'Test Agency',
        subdomain: 'test-agency-3',
        status: 'ACTIVE'
      }
    })

    const testBranch = await db.branch.create({
      data: {
        agencyId: testAgency.id,
        name: 'Test Branch',
        code: 'TEST',
        status: 'ACTIVE'
      }
    })

    try {
      const testUser = await db.user.create({
        data: {
          email: 'logger@test.com',
          name: 'Logger User',
          role: 'AGENCY_ADMIN',
          status: 'ACTIVE',
          agencyId: testAgency.id,
          branchId: testBranch.id
        }
      })

      // Test basic activity logging
      await ActivityLogger.log({
        userId: testUser.id,
        agencyId: testAgency.id,
        branchId: testBranch.id,
        action: 'TEST_ACTION',
        entityType: 'TestEntity',
        changes: { test: 'data' }
      })

      const activities = await ActivityLogger.getActivities({
        userId: testUser.id,
        limit: 1
      })

      if (activities.activities.length !== 1) {
        throw new Error('Activity should be logged')
      }

      if (activities.activities[0].action !== 'TEST_ACTION') {
        throw new Error('Activity action should match')
      }

      // Test creation logging
      await ActivityLogger.logCreation({
        userId: testUser.id,
        agencyId: testAgency.id,
        branchId: testBranch.id,
        entityType: 'Student',
        resourceType: 'students',
        resourceName: 'Test Student',
        newValues: { name: 'Test Student' }
      })

      const creationActivities = await ActivityLogger.getActivities({
        userId: testUser.id,
        action: 'STUDENT_CREATED'
      })

      if (creationActivities.activities.length !== 1) {
        throw new Error('Creation activity should be logged')
      }

      console.log('    ✅ Activity logging works correctly')
    } finally {
      // Cleanup
      await db.activityLog.deleteMany({ where: { agencyId: testAgency.id } })
      await db.user.deleteMany({ where: { agencyId: testAgency.id } })
      await db.branch.deleteMany({ where: { agencyId: testAgency.id } })
      await db.agency.delete({ where: { id: testAgency.id } })
    }
  }

  /**
   * Test 5: Middleware Integration
   */
  private static async testMiddlewareIntegration(): Promise<void> {
    console.log('  Testing middleware integration...')

    // This test validates that the middleware can be imported and configured
    // without throwing errors
    
    try {
      // Test middleware import
      const { requirePermissions } = await import('./auth-middleware')
      
      if (typeof requirePermissions !== 'function') {
        throw new Error('requirePermissions should be a function')
      }

      // Test middleware configuration
      const middleware = requirePermissions([
        { resource: 'test', action: 'read' }
      ], {
        resourceType: 'test',
        auditLevel: 'BASIC'
      })

      if (typeof middleware !== 'function') {
        throw new Error('Middleware should return a function')
      }

      console.log('    ✅ Middleware integration works correctly')
    } catch (error) {
      throw new Error(`Middleware integration failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Test 6: Cache Functionality
   */
  private static async testCacheFunctionality(): Promise<void> {
    console.log('  Testing cache functionality...')

    const testAgency = await db.agency.create({
      data: {
        name: 'Test Agency',
        subdomain: 'test-agency-4',
        status: 'ACTIVE'
      }
    })

    try {
      const testUser = await db.user.create({
        data: {
          email: 'cache@test.com',
          name: 'Cache User',
          role: 'AGENCY_ADMIN',
          status: 'ACTIVE',
          agencyId: testAgency.id
        }
      })

      // Clear cache to ensure clean test
      UnifiedRBAC.clearUserCache(testUser.id)

      // First call should not be cached
      const decision1 = await UnifiedRBAC.checkPermission(testUser.id, {
        resource: 'students',
        action: 'read'
      })

      // Second call should be cached
      const decision2 = await UnifiedRBAC.checkPermission(testUser.id, {
        resource: 'students',
        action: 'read'
      })

      if (decision1.allowed !== decision2.allowed) {
        throw new Error('Cached decision should match original decision')
      }

      // Clear cache and test again
      UnifiedRBAC.clearUserCache(testUser.id)
      
      const decision3 = await UnifiedRBAC.checkPermission(testUser.id, {
        resource: 'students',
        action: 'read'
      })

      if (decision1.allowed !== decision3.allowed) {
        throw new Error('Decision should be consistent after cache clear')
      }

      console.log('    ✅ Cache functionality works correctly')
    } finally {
      // Cleanup
      await db.user.deleteMany({ where: { agencyId: testAgency.id } })
      await db.agency.delete({ where: { id: testAgency.id } })
      UnifiedRBAC.clearAllCache()
    }
  }

  /**
   * Test 7: Role Hierarchy
   */
  private static async testRoleHierarchy(): Promise<void> {
    console.log('  Testing role hierarchy...')

    const testAgency = await db.agency.create({
      data: {
        name: 'Test Agency',
        subdomain: 'test-agency-5',
        status: 'ACTIVE'
      }
    })

    try {
      // Create roles with hierarchy
      const parentRole = await db.role.create({
        data: {
          agencyId: testAgency.id,
          name: 'Parent Role',
          slug: 'parent-role',
          level: 100,
          isActive: true
        }
      })

      const childRole = await db.role.create({
        data: {
          agencyId: testAgency.id,
          name: 'Child Role',
          slug: 'child-role',
          level: 50,
          parentId: parentRole.id,
          isActive: true
        }
      })

      // Create permissions
      const permission = await db.permission.create({
        data: {
          name: 'Test Permission',
          slug: 'test_permission',
          resource: 'test',
          action: 'read',
          isActive: true
        }
      })

      // Assign permission to parent role
      await db.rolePermission.create({
        data: {
          roleId: parentRole.id,
          permissionId: permission.id,
          agencyId: testAgency.id,
          accessLevel: 'FULL'
        }
      })

      const testUser = await db.user.create({
        data: {
          email: 'hierarchy@test.com',
          name: 'Hierarchy User',
          role: 'AGENCY_ADMIN',
          status: 'ACTIVE',
          agencyId: testAgency.id
        }
      })

      // Assign child role to user
      await db.userRoleAssignment.create({
        data: {
          userId: testUser.id,
          roleId: childRole.id,
          agencyId: testAgency.id,
          isActive: true
        }
      })

      // User should inherit permission from parent role
      const decision = await UnifiedRBAC.checkPermission(testUser.id, {
        resource: 'test',
        action: 'read'
      })

      if (!decision.allowed) {
        throw new Error('User should inherit permission from parent role')
      }

      console.log('    ✅ Role hierarchy works correctly')
    } finally {
      // Cleanup
      await db.userRoleAssignment.deleteMany({ where: { agencyId: testAgency.id } })
      await db.rolePermission.deleteMany({ where: { agencyId: testAgency.id } })
      await db.user.deleteMany({ where: { agencyId: testAgency.id } })
      await db.role.deleteMany({ where: { agencyId: testAgency.id } })
      await db.permission.deleteMany({ where: { slug: 'test_permission' } })
      await db.agency.delete({ where: { id: testAgency.id } })
    }
  }

  /**
   * Test 8: Resource Access
   */
  private static async testResourceAccess(): Promise<void> {
    console.log('  Testing resource access...')

    const testAgency = await db.agency.create({
      data: {
        name: 'Test Agency',
        subdomain: 'test-agency-6',
        status: 'ACTIVE'
      }
    })

    const testBranch = await db.branch.create({
      data: {
        agencyId: testAgency.id,
        name: 'Test Branch',
        code: 'TEST-RESOURCE',
        status: 'ACTIVE'
      }
    })

    try {
      const testUser = await db.user.create({
        data: {
          email: 'resource@test.com',
          name: 'Resource User',
          role: 'AGENCY_ADMIN',
          status: 'ACTIVE',
          agencyId: testAgency.id,
          branchId: testBranch.id
        }
      })

      // Create test student
      const testStudent = await db.student.create({
        data: {
          agencyId: testAgency.id,
          branchId: testBranch.id,
          firstName: 'Resource',
          lastName: 'Student',
          email: 'resource@student.com',
          status: 'PROSPECT'
        }
      })

      // Test resource access
      const access = await UnifiedRBAC.canAccessResource(
        testUser.id,
        'student',
        testStudent.id,
        'read'
      )

      if (!access.allowed) {
        throw new Error('User should be able to access student in their branch')
      }

      // Test access to non-existent resource
      const noAccess = await UnifiedRBAC.canAccessResource(
        testUser.id,
        'student',
        'non-existent-id',
        'read'
      )

      if (noAccess.allowed) {
        throw new Error('User should not be able to access non-existent resource')
      }

      console.log('    ✅ Resource access works correctly')
    } finally {
      // Cleanup
      await db.student.deleteMany({ where: { agencyId: testAgency.id } })
      await db.user.deleteMany({ where: { agencyId: testAgency.id } })
      await db.branch.deleteMany({ where: { agencyId: testAgency.id } })
      await db.agency.delete({ where: { id: testAgency.id } })
    }
  }

  /**
   * Generate test report
   */
  static generateTestReport(): string {
    const passed = this.testResults.filter(r => r.passed).length
    const failed = this.testResults.filter(r => !r.passed).length
    const total = this.testResults.length

    let report = `\n🧪 RBAC System Test Report\n`
    report += `=====================================\n`
    report += `Summary: ${passed}/${total} tests passed, ${failed} failed\n\n`

    report += `Detailed Results:\n`
    this.testResults.forEach(result => {
      report += `${result.passed ? '✅' : '❌'} ${result.testName} - ${result.message} (${result.duration}ms)\n`
    })

    if (failed > 0) {
      report += `\n❌ ${failed} test(s) failed. Please review the implementation.\n`
    } else {
      report += `\n🎉 All tests passed! The RBAC system is working correctly.\n`
    }

    return report
  }
}

// ============================================================================
// Test Runner
// ============================================================================

/**
 * Run RBAC system tests and generate report
 */
export async function testRBACSystem() {
  const results = await RBACTestSuite.runAllTests()
  const report = RBACTestSuite.generateTestReport()
  
  console.log(report)
  
  return {
    ...results,
    report,
    success: results.failed === 0
  }
}

// Export for direct usage
export { RBACTestSuite }