import { EnhancedRBAC, RBACMiddleware, ResourceType, PermissionAction, AccessLevel } from './rbac-enhanced'
import { ActivityLogger } from './activity-logger'
import { getUserContext, validatePermissions, getUserPermissionsSummary } from './rbac-utils'
import { db } from './db'

// ============================================================================
// RBAC System Test Suite
// ============================================================================

export class RBACTestSuite {
  /**
   * Run comprehensive RBAC system tests
   */
  static async runTests() {
    console.log('🚀 Starting RBAC System Tests...\n')
    
    const results = {
      passed: 0,
      failed: 0,
      tests: [] as Array<{ name: string; passed: boolean; error?: string }>
    }

    // Test 1: User Context Retrieval
    console.log('📋 Test 1: User Context Retrieval')
    try {
      const testUser = await this.getTestUser()
      if (testUser) {
        const userContext = await getUserContext(testUser.id)
        console.log(`✅ User context retrieved successfully`)
        console.log(`   - Access Level: ${userContext.accessLevel}`)
        console.log(`   - Accessible Branches: ${userContext.accessibleBranches.length}`)
        console.log(`   - Managed Branches: ${userContext.managedBranches.length}`)
        results.passed++
        results.tests.push({ name: 'User Context Retrieval', passed: true })
      } else {
        throw new Error('No test user found')
      }
    } catch (error) {
      console.log(`❌ User Context Retrieval failed: ${error.message}`)
      results.failed++
      results.tests.push({ name: 'User Context Retrieval', passed: false, error: error.message })
    }

    // Test 2: Permission Checking
    console.log('\n📋 Test 2: Permission Checking')
    try {
      const testUser = await this.getTestUser()
      if (testUser) {
        const permissionResult = await EnhancedRBAC.checkPermission(testUser.id, {
          resource: ResourceType.USERS,
          action: PermissionAction.READ
        })
        console.log(`✅ Permission check completed`)
        console.log(`   - Allowed: ${permissionResult.allowed}`)
        console.log(`   - Access Level: ${permissionResult.accessLevel}`)
        console.log(`   - Reason: ${permissionResult.reason || 'N/A'}`)
        results.passed++
        results.tests.push({ name: 'Permission Checking', passed: true })
      } else {
        throw new Error('No test user found')
      }
    } catch (error) {
      console.log(`❌ Permission Checking failed: ${error.message}`)
      results.failed++
      results.tests.push({ name: 'Permission Checking', passed: false, error: error.message })
    }

    // Test 3: Branch Filtering
    console.log('\n📋 Test 3: Branch Filtering')
    try {
      const testUser = await this.getTestUser()
      if (testUser) {
        const branchFilter = await EnhancedRBAC.applyBranchFilter(testUser.id, {}, {
          resource: ResourceType.USERS,
          action: PermissionAction.READ
        })
        console.log(`✅ Branch filtering applied successfully`)
        console.log(`   - Filter type: ${typeof branchFilter}`)
        console.log(`   - Has branch constraint: ${!!branchFilter.branchId || !!branchFilter.OR}`)
        results.passed++
        results.tests.push({ name: 'Branch Filtering', passed: true })
      } else {
        throw new Error('No test user found')
      }
    } catch (error) {
      console.log(`❌ Branch Filtering failed: ${error.message}`)
      results.failed++
      results.tests.push({ name: 'Branch Filtering', passed: false, error: error.message })
    }

    // Test 4: Activity Logging
    console.log('\n📋 Test 4: Activity Logging')
    try {
      const testUser = await this.getTestUser()
      if (testUser) {
        const logId = await ActivityLogger.logUserAction(testUser.id, 'TEST_ACTION', 'TestEntity', {
          entityId: 'test-123',
          changes: { test: 'data' }
        })
        console.log(`✅ Activity logged successfully`)
        console.log(`   - Log ID: ${logId || 'Async (no ID returned)'}`)
        results.passed++
        results.tests.push({ name: 'Activity Logging', passed: true })
      } else {
        throw new Error('No test user found')
      }
    } catch (error) {
      console.log(`❌ Activity Logging failed: ${error.message}`)
      results.failed++
      results.tests.push({ name: 'Activity Logging', passed: false, error: error.message })
    }

    // Test 5: Permission Validation
    console.log('\n📋 Test 5: Permission Validation')
    try {
      const testUser = await this.getTestUser()
      if (testUser) {
        const validation = await validatePermissions(testUser.id, [
          { resource: ResourceType.USERS, action: PermissionAction.READ },
          { resource: ResourceType.STUDENTS, action: PermissionAction.READ }
        ])
        console.log(`✅ Permission validation completed`)
        console.log(`   - Valid: ${validation.valid}`)
        console.log(`   - Errors: ${validation.errors.length}`)
        results.passed++
        results.tests.push({ name: 'Permission Validation', passed: true })
      } else {
        throw new Error('No test user found')
      }
    } catch (error) {
      console.log(`❌ Permission Validation failed: ${error.message}`)
      results.failed++
      results.tests.push({ name: 'Permission Validation', passed: false, error: error.message })
    }

    // Test 6: Access Level Hierarchy
    console.log('\n📋 Test 6: Access Level Hierarchy')
    try {
      const levels = [
        AccessLevel.OWN,
        AccessLevel.BRANCH,
        AccessLevel.AGENCY,
        AccessLevel.GLOBAL
      ]
      
      let hierarchyValid = true
      for (let i = 0; i < levels.length - 1; i++) {
        const current = levels[i]
        const higher = levels[i + 1]
        
        const currentCheck = this.checkAccessLevelValue(current)
        const higherCheck = this.checkAccessLevelValue(higher)
        
        if (currentCheck >= higherCheck) {
          hierarchyValid = false
          break
        }
      }
      
      if (hierarchyValid) {
        console.log(`✅ Access level hierarchy is valid`)
        results.passed++
        results.tests.push({ name: 'Access Level Hierarchy', passed: true })
      } else {
        throw new Error('Access level hierarchy is invalid')
      }
    } catch (error) {
      console.log(`❌ Access Level Hierarchy failed: ${error.message}`)
      results.failed++
      results.tests.push({ name: 'Access Level Hierarchy', passed: false, error: error.message })
    }

    // Test 7: User Permissions Summary
    console.log('\n📋 Test 7: User Permissions Summary')
    try {
      const testUser = await this.getTestUser()
      if (testUser) {
        const summary = await getUserPermissionsSummary(testUser.id)
        if (summary) {
          console.log(`✅ User permissions summary retrieved`)
          console.log(`   - Access Level: ${summary.accessLevel}`)
          console.log(`   - Can Manage Agency: ${summary.canManageAgency}`)
          console.log(`   - Can Manage Branches: ${summary.canManageBranches}`)
          results.passed++
          results.tests.push({ name: 'User Permissions Summary', passed: true })
        } else {
          throw new Error('No permissions summary returned')
        }
      } else {
        throw new Error('No test user found')
      }
    } catch (error) {
      console.log(`❌ User Permissions Summary failed: ${error.message}`)
      results.failed++
      results.tests.push({ name: 'User Permissions Summary', passed: false, error: error.message })
    }

    // Test 8: Cache Management
    console.log('\n📋 Test 8: Cache Management')
    try {
      const testUser = await this.getTestUser()
      if (testUser) {
        // Clear cache
        RBACMiddleware.clearUserCache(testUser.id)
        
        // Get context (should rebuild cache)
        const userContext = await getUserContext(testUser.id)
        
        // Clear cache again
        RBACMiddleware.clearAllCache()
        
        console.log(`✅ Cache management completed successfully`)
        console.log(`   - User cache cleared and rebuilt`)
        console.log(`   - All cache cleared`)
        results.passed++
        results.tests.push({ name: 'Cache Management', passed: true })
      } else {
        throw new Error('No test user found')
      }
    } catch (error) {
      console.log(`❌ Cache Management failed: ${error.message}`)
      results.failed++
      results.tests.push({ name: 'Cache Management', passed: false, error: error.message })
    }

    // Test Results Summary
    console.log('\n🎯 Test Results Summary')
    console.log('='.repeat(50))
    console.log(`Total Tests: ${results.passed + results.failed}`)
    console.log(`✅ Passed: ${results.passed}`)
    console.log(`❌ Failed: ${results.failed}`)
    console.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`)
    
    if (results.failed > 0) {
      console.log('\n❌ Failed Tests:')
      results.tests.filter(test => !test.passed).forEach(test => {
        console.log(`   - ${test.name}: ${test.error}`)
      })
    }

    return results
  }

  /**
   * Test RBAC middleware with different scenarios
   */
  static async testMiddlewareScenarios() {
    console.log('🚀 Starting RBAC Middleware Tests...\n')
    
    const scenarios = [
      {
        name: 'Agency Admin Access',
        userRole: 'AGENCY_ADMIN',
        expectedAccessLevel: AccessLevel.AGENCY
      },
      {
        name: 'Branch Manager Access',
        userRole: 'BRANCH_MANAGER',
        expectedAccessLevel: AccessLevel.BRANCH
      },
      {
        name: 'Regular User Access',
        userRole: 'CONSULTANT',
        expectedAccessLevel: AccessLevel.OWN
      }
    ]

    for (const scenario of scenarios) {
      console.log(`📋 Testing: ${scenario.name}`)
      
      try {
        const user = await db.user.findFirst({
          where: { role: scenario.userRole, status: 'ACTIVE' },
          include: { agency: true, branch: true }
        })

        if (!user) {
          console.log(`⚠️  No ${scenario.userRole} user found for testing`)
          continue
        }

        const userContext = await getUserContext(user.id)
        
        const accessLevelMatch = userContext.accessLevel === scenario.expectedAccessLevel
        const hasBranchAccess = userContext.accessibleBranches.length > 0
        
        console.log(`   - User: ${user.name} (${user.email})`)
        console.log(`   - Access Level: ${userContext.accessLevel} ${accessLevelMatch ? '✅' : '❌'}`)
        console.log(`   - Branch Access: ${userContext.accessibleBranches.length} branches ${hasBranchAccess ? '✅' : '❌'}`)
        console.log(`   - Managed Branches: ${userContext.managedBranches.length}`)
        
        if (accessLevelMatch && hasBranchAccess) {
          console.log(`   ✅ ${scenario.name} passed`)
        } else {
          console.log(`   ❌ ${scenario.name} failed`)
        }
      } catch (error) {
        console.log(`   ❌ ${scenario.name} failed: ${error.message}`)
      }
      
      console.log()
    }
  }

  /**
   * Test branch-based data filtering
   */
  static async testBranchFiltering() {
    console.log('🚀 Starting Branch Filtering Tests...\n')
    
    try {
      const testUser = await this.getTestUser()
      if (!testUser) {
        console.log('❌ No test user found')
        return
      }

      const userContext = await getUserContext(testUser.id)
      
      // Test different resource types
      const resourceTypes = [
        ResourceType.USERS,
        ResourceType.STUDENTS,
        ResourceType.APPLICATIONS,
        ResourceType.TASKS,
        ResourceType.DOCUMENTS
      ]

      for (const resourceType of resourceTypes) {
        console.log(`📋 Testing ${resourceType} filtering`)
        
        try {
          const filter = await EnhancedRBAC.applyBranchFilter(testUser.id, {}, {
            resource: resourceType,
            action: PermissionAction.READ,
            includeAssigned: true
          })
          
          console.log(`   - Filter generated successfully`)
          console.log(`   - Filter keys: ${Object.keys(filter).join(', ')}`)
          
          // Validate filter structure
          const hasBranchConstraint = filter.branchId || (filter.OR && filter.OR.some((o: any) => o.branchId))
          console.log(`   - Has branch constraint: ${hasBranchConstraint ? '✅' : '❌'}`)
          
        } catch (error) {
          console.log(`   ❌ ${resourceType} filtering failed: ${error.message}`)
        }
      }
      
    } catch (error) {
      console.log(`❌ Branch filtering tests failed: ${error.message}`)
    }
  }

  /**
   * Generate comprehensive RBAC test report
   */
  static async generateTestReport() {
    console.log('📊 Generating RBAC Test Report...\n')
    
    try {
      // Get system statistics
      const userCount = await db.user.count()
      const roleCount = await db.role.count()
      const branchCount = await db.branch.count()
      const permissionCount = await db.permission.count()
      
      console.log('📈 System Statistics:')
      console.log(`   - Total Users: ${userCount}`)
      console.log(`   - Total Roles: ${roleCount}`)
      console.log(`   - Total Branches: ${branchCount}`)
      console.log(`   - Total Permissions: ${permissionCount}`)
      
      // Get users by access level
      const usersByRole = await db.user.groupBy({
        by: ['role'],
        _count: { id: true }
      })
      
      console.log('\n👥 Users by Role:')
      usersByRole.forEach(group => {
        console.log(`   - ${group.role}: ${group._count.id}`)
      })
      
      // Get branches by type
      const branchesByType = await db.branch.groupBy({
        by: ['type'],
        _count: { id: true }
      })
      
      console.log('\n🏢 Branches by Type:')
      branchesByType.forEach(group => {
        console.log(`   - ${group.type}: ${group._count.id}`)
      })
      
      // Test cache performance
      console.log('\n⚡ Cache Performance Test:')
      const testUser = await this.getTestUser()
      if (testUser) {
        const start = Date.now()
        
        // First call (should build cache)
        await getUserContext(testUser.id)
        const firstCall = Date.now() - start
        
        // Second call (should use cache)
        const start2 = Date.now()
        await getUserContext(testUser.id)
        const secondCall = Date.now() - start2
        
        console.log(`   - First call: ${firstCall}ms`)
        console.log(`   - Second call: ${secondCall}ms`)
        console.log(`   - Cache improvement: ${firstCall > secondCall ? '✅' : '❌'}`)
      }
      
      console.log('\n✅ Test report generated successfully')
      
    } catch (error) {
      console.log(`❌ Test report generation failed: ${error.message}`)
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private static async getTestUser() {
    return await db.user.findFirst({
      where: { status: 'ACTIVE' },
      include: { agency: true, branch: true }
    })
  }

  private static checkAccessLevelValue(level: AccessLevel): number {
    const hierarchy = {
      [AccessLevel.GLOBAL]: 6,
      [AccessLevel.AGENCY]: 5,
      [AccessLevel.BRANCH_GROUP]: 4,
      [AccessLevel.BRANCH]: 3,
      [AccessLevel.TEAM]: 2,
      [AccessLevel.OWN]: 1
    }
    return hierarchy[level]
  }
}

// ============================================================================
// Test Runner
// ============================================================================

/**
 * Run all RBAC tests
 */
export async function runAllRBACTests() {
  console.log('🧪 Running Complete RBAC Test Suite\n')
  console.log('='.repeat(60))
  
  // Run core tests
  const coreResults = await RBACTestSuite.runTests()
  
  console.log('\n' + '='.repeat(60))
  
  // Run middleware scenario tests
  await RBACTestSuite.testMiddlewareScenarios()
  
  console.log('\n' + '='.repeat(60))
  
  // Run branch filtering tests
  await RBACTestSuite.testBranchFiltering()
  
  console.log('\n' + '='.repeat(60))
  
  // Generate test report
  await RBACTestSuite.generateTestReport()
  
  console.log('\n' + '='.repeat(60))
  console.log('🎉 RBAC Test Suite Complete!')
  
  return coreResults
}

// Export for direct usage
export { RBACTestSuite }