# RBAC System Improvement Design

## Current System Analysis

### Strengths:
1. **Comprehensive Schema**: Well-defined RBAC models with Role, Permission, User, and Branch relationships
2. **Hierarchical Roles**: Support for role inheritance with parent-child relationships
3. **Branch Scoping**: Roles can be scoped to different levels (GLOBAL, AGENCY, BRANCH, etc.)
4. **Unified RBAC Service**: Centralized permission checking with caching
5. **Middleware Integration**: Auth middleware for route protection

### Areas for Improvement:
1. **Branch Access Calculation**: Current branch access logic is complex and could be optimized
2. **Permission Inheritance**: Role inheritance could be more robust
3. **Data Filtering**: Automatic branch-based data filtering needs enhancement
4. **Performance**: Multiple database queries for permission checks
5. **Audit Trail**: Limited audit logging for permission changes
6. **Branch Hierarchy**: No support for branch hierarchies (parent-child branches)
7. **Dynamic Permissions**: Limited support for conditional permissions

## Improved RBAC System Design

### 1. Enhanced Branch Hierarchy

```typescript
// Add branch hierarchy support
model Branch {
  // ... existing fields ...
  
  // Hierarchy Support
  parentId        String?
  parent          Branch?   @relation("branch_hierarchy", fields: [parentId], references: [id])
  children        Branch[]   @relation("branch_hierarchy")
  
  // Access Control
  accessLevel     BranchAccessLevel @default(BRANCH)
  inheritedRoles  String?  // JSON array of inherited role IDs
  
  // ... existing relations ...
}
```

### 2. Improved Permission System

#### Permission Categories with Granular Control:
- **Core Permissions**: System-level operations
- **Resource Permissions**: Entity-specific operations
- **Field Permissions**: Field-level access control
- **Conditional Permissions**: Dynamic permission evaluation

#### Enhanced Access Levels:
```typescript
enum EnhancedRBACAccessLevel {
  NONE,           // No access
  VIEW,           // Read-only access
  EDIT,           // Edit access (create, update)
  DELETE,         // Delete access
  FULL,           // Full access (create, read, update, delete)
  MANAGE,         // Management access (includes permissions management)
  CUSTOM,         // Custom access level with specific conditions
  DELEGATE        // Can delegate permissions to others
}
```

### 3. Branch-Based Access Control Improvements

#### Access Level Hierarchy:
```typescript
enum BranchAccessLevel {
  GLOBAL = 'global',      // Super Admin: All agencies and branches
  AGENCY = 'agency',      // Agency Admin: All branches in agency
  REGION = 'region',      // Regional Manager: Multiple branches
  BRANCH = 'branch',      // Branch Manager: Specific branch + children
  ASSIGNED = 'assigned',  // Consultant: Assigned resources + own branch  
  OWN = 'own'            // Standard User: Only own branch and resources
}
```

#### Branch Access Calculation Algorithm:
1. **Direct Access**: User's assigned branch
2. **Managed Access**: Branches user manages
3. **Role-based Access**: Branches accessible through roles
4. **Inherited Access**: Parent/child branch relationships
5. **Hierarchical Access**: Regional/branch hierarchy access

### 4. Performance Optimizations

#### Multi-level Caching:
- **Permission Cache**: User permission decisions
- **Branch Access Cache**: User branch access information
- **Role Hierarchy Cache**: Role inheritance trees
- **Resource Access Cache**: Resource-specific access patterns

#### Batch Operations:
- **Bulk Permission Checks**: Check multiple permissions at once
- **Batch Branch Access**: Calculate access for multiple users
- **Pre-computed Access**: Store commonly used access patterns

### 5. Enhanced Audit Trail

#### Comprehensive Logging:
- **Permission Changes**: Track all permission modifications
- **Access Attempts**: Log successful and failed access attempts
- **Role Assignments**: Track role assignments and removals
- **Branch Access Changes**: Log branch access modifications

#### Audit Events:
```typescript
enum AuditEventType {
  PERMISSION_GRANTED,
  PERMISSION_REVOKED,
  ROLE_ASSIGNED,
  ROLE_REMOVED,
  BRANCH_ACCESS_GRANTED,
  BRANCH_ACCESS_REVOKED,
  ACCESS_DENIED,
  ACCESS_GRANTED,
  PERMISSION_MODIFIED,
  ROLE_MODIFIED
}
```

### 6. Advanced Features

#### Dynamic Permissions:
- **Time-based Permissions**: Permissions that expire or activate at specific times
- **Location-based Permissions**: Access based on user location
- **Conditional Permissions**: Permissions based on data conditions
- **Delegation Support**: Users can delegate permissions temporarily

#### Field-level Security:
- **Field Permissions**: Control access to specific fields
- **Data Masking**: Mask sensitive data based on permissions
- **Field Validation**: Validate field access based on permissions

### 7. API Design Improvements

#### Enhanced Permission Service:
```typescript
class EnhancedRBACService {
  // Core permission checking
  async checkPermission(userId: string, permission: PermissionCheck): Promise<AccessDecision>
  
  // Batch permission checking
  async checkPermissions(userId: string, permissions: PermissionCheck[]): Promise<AccessDecision[]>
  
  // Branch access with hierarchy support
  async getBranchAccessWithHierarchy(userId: string): Promise<EnhancedBranchAccessInfo>
  
  // Resource filtering with branch awareness
  async applyBranchFilter(userId: string, resourceType: string, baseWhere: any): Promise<any>
  
  // Permission management
  async grantPermission(userId: string, permission: PermissionGrant): Promise<void>
  async revokePermission(userId: string, permission: PermissionRevoke): Promise<void>
  
  // Audit trail
  async getPermissionHistory(userId: string, options: AuditOptions): Promise<AuditLog[]>
}
```

#### Enhanced Middleware:
```typescript
// Enhanced middleware with branch hierarchy support
function requireBranchWithHierarchy(
  handler: Handler, 
  options: {
    scope: BranchAccessLevel
    includeChildren?: boolean
    requireExact?: boolean
  }
)

// Resource-specific middleware with field-level control
function requireResourceAccess(
  resourceType: string,
  action: string,
  options: {
    fieldLevel?: boolean
    includeRelations?: string[]
    cascadeToChildren?: boolean
  }
)
```

### 8. Implementation Plan

#### Phase 1: Core Improvements
1. **Update Branch Model**: Add hierarchy support
2. **Enhance RBAC Service**: Improve permission checking logic
3. **Optimize Caching**: Implement multi-level caching
4. **Add Audit Trail**: Comprehensive logging system

#### Phase 2: Advanced Features
1. **Dynamic Permissions**: Time/location-based permissions
2. **Field-level Security**: Granular field access control
3. **Branch Hierarchy**: Parent-child branch relationships
4. **Performance Optimizations**: Batch operations and pre-computation

#### Phase 3: Integration & Testing
1. **Update Middleware**: Enhanced middleware with new features
2. **Data Migration**: Migrate existing data to new schema
3. **Integration Testing**: Comprehensive test coverage
4. **Performance Testing**: Load and stress testing

### 9. Migration Strategy

#### Schema Changes:
1. **Add Branch Hierarchy**: Update Branch model with parent-child relationships
2. **Enhanced Enums**: Update access level enums
3. **Audit Tables**: Add comprehensive audit logging tables
4. **Cache Tables**: Add caching support tables

#### Data Migration:
1. **Existing Data**: Preserve existing RBAC relationships
2. **Branch Hierarchy**: Establish parent-child relationships
3. **Permission Migration**: Migrate to enhanced permission system
4. **Audit Migration**: Initialize audit trail with existing data

### 10. Testing Strategy

#### Unit Tests:
- **Permission Checking**: Test all permission scenarios
- **Branch Access**: Test branch hierarchy and access calculation
- **Role Inheritance**: Test role inheritance and delegation
- **Cache Management**: Test caching and invalidation

#### Integration Tests:
- **Middleware Integration**: Test middleware with new features
- **Data Filtering**: Test branch-based data filtering
- **Audit Trail**: Test audit logging and reporting
- **Performance**: Test performance under load

#### Security Tests:
- **Permission Bypass**: Test for permission bypass vulnerabilities
- **Branch Escalation**: Test for branch access escalation
- **Data Leakage**: Test for unauthorized data access
- **Audit Integrity**: Test audit trail tampering protection

This design provides a comprehensive improvement to the existing RBAC system while maintaining backward compatibility and adding powerful new features for branch-based access control.