export interface TeamMember {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: 'AGENCY_ADMIN' | 'CONSULTANT' | 'SUPPORT' | 'MANAGER' | 'INTERN'
  department: string
  title: string
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED'
  avatar?: string
  joinDate: string
  lastLogin?: string
  permissions: string[]
  managedBy?: string
  teamSize?: number
  performance?: {
    rating: number
    reviews: number
    completedTasks: number
    totalTasks: number
  }
}

export interface Team {
  id: string
  name: string
  description: string
  leadId: string
  leadName: string
  memberCount: number
  department: string
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string
}

export interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  memberCount: number
  isSystemRole: boolean
}