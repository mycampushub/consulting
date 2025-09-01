"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Plus, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  Settings,
  Shield,
  Users,
  Briefcase,
  Building,
  Clock,
  Star,
  MoreHorizontal,
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle
} from "lucide-react"

interface TeamMember {
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
  lastLogin?: string
  joinDate: string
  permissions: string[]
  managedBy?: string
  teamMembers?: number
  projects?: number
  performance?: number
}

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  isSystemRole: boolean
  userCount: number
}

interface Department {
  id: string
  name: string
  description?: string
  headId?: string
  memberCount: number
  budget?: number
}

const mockTeamMembers: TeamMember[] = [
  {
    id: "1",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@agency.com",
    phone: "+1 (555) 123-4567",
    role: "AGENCY_ADMIN",
    department: "Executive",
    title: "CEO",
    status: "ACTIVE",
    lastLogin: "2024-01-20T10:30:00Z",
    joinDate: "2023-01-15T00:00:00Z",
    permissions: ["all"],
    teamMembers: 4,
    projects: 12,
    performance: 95
  },
  {
    id: "2",
    firstName: "Michael",
    lastName: "Chen",
    email: "michael.chen@agency.com",
    phone: "+1 (555) 234-5678",
    role: "CONSULTANT",
    department: "Consulting",
    title: "Senior Education Consultant",
    status: "ACTIVE",
    lastLogin: "2024-01-20T09:15:00Z",
    joinDate: "2023-02-10T00:00:00Z",
    permissions: ["students.read", "students.write", "applications.read", "applications.write"],
    teamMembers: 0,
    projects: 8,
    performance: 88
  },
  {
    id: "3",
    firstName: "Emma",
    lastName: "Rodriguez",
    email: "emma.rodriguez@agency.com",
    phone: "+1 (555) 345-6789",
    role: "CONSULTANT",
    department: "Consulting",
    title: "Education Consultant",
    status: "ACTIVE",
    lastLogin: "2024-01-19T16:45:00Z",
    joinDate: "2023-03-05T00:00:00Z",
    permissions: ["students.read", "students.write", "applications.read"],
    teamMembers: 0,
    projects: 6,
    performance: 82
  },
  {
    id: "4",
    firstName: "David",
    lastName: "Kim",
    email: "david.kim@agency.com",
    phone: "+1 (555) 456-7890",
    role: "SUPPORT",
    department: "Operations",
    title: "Support Specialist",
    status: "ACTIVE",
    lastLogin: "2024-01-20T11:20:00Z",
    joinDate: "2023-04-20T00:00:00Z",
    permissions: ["students.read", "documents.read", "communications.read"],
    teamMembers: 0,
    projects: 4,
    performance: 90
  }
]

const mockRoles: Role[] = [
  {
    id: "1",
    name: "Agency Admin",
    description: "Full access to all agency features",
    permissions: ["all"],
    isSystemRole: true,
    userCount: 1
  },
  {
    id: "2",
    name: "Senior Consultant",
    description: "Can manage students and applications",
    permissions: ["students.read", "students.write", "applications.read", "applications.write", "universities.read"],
    isSystemRole: false,
    userCount: 1
  },
  {
    id: "3",
    name: "Consultant",
    description: "Can view and manage assigned students",
    permissions: ["students.read", "students.write", "applications.read"],
    isSystemRole: false,
    userCount: 1
  },
  {
    id: "4",
    name: "Support Staff",
    description: "Limited access for support tasks",
    permissions: ["students.read", "documents.read", "communications.read"],
    isSystemRole: false,
    userCount: 1
  }
]

const mockDepartments: Department[] = [
  {
    id: "1",
    name: "Executive",
    description: "Leadership and strategic management",
    headId: "1",
    memberCount: 1,
    budget: 500000
  },
  {
    id: "2",
    name: "Consulting",
    description: "Student consulting and application services",
    headId: "2",
    memberCount: 2,
    budget: 750000
  },
  {
    id: "3",
    name: "Operations",
    description: "Support and operational management",
    headId: "4",
    memberCount: 1,
    budget: 300000
  }
]

export default function TeamPage() {
  const params = useParams()
  const subdomain = params.subdomain as string
  
  const [teamMembers] = useState<TeamMember[]>(mockTeamMembers)
  const [roles] = useState<Role[]>(mockRoles)
  const [departments] = useState<Department[]>(mockDepartments)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isInviteOpen, setIsInviteOpen] = useState(false)

  const filteredTeamMembers = teamMembers.filter(member => {
    const matchesSearch = member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || member.role === roleFilter
    const matchesDepartment = departmentFilter === "all" || member.department === departmentFilter
    const matchesStatus = statusFilter === "all" || member.status === statusFilter
    return matchesSearch && matchesRole && matchesDepartment && matchesStatus
  })

  const getRoleColor = (role: string) => {
    switch (role) {
      case "AGENCY_ADMIN": return "bg-purple-100 text-purple-800"
      case "MANAGER": return "bg-blue-100 text-blue-800"
      case "CONSULTANT": return "bg-green-100 text-green-800"
      case "SUPPORT": return "bg-yellow-100 text-yellow-800"
      case "INTERN": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-green-100 text-green-800"
      case "PENDING": return "bg-yellow-100 text-yellow-800"
      case "INACTIVE": return "bg-gray-100 text-gray-800"
      case "SUSPENDED": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE": return <CheckCircle className="h-4 w-4 text-green-500" />
      case "PENDING": return <Clock className="h-4 w-4 text-yellow-500" />
      case "INACTIVE": return <XCircle className="h-4 w-4 text-gray-500" />
      case "SUSPENDED": return <AlertTriangle className="h-4 w-4 text-red-500" />
      default: return <XCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return "text-green-600"
    if (performance >= 80) return "text-blue-600"
    if (performance >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const activeMembers = teamMembers.filter(m => m.status === "ACTIVE")
  const avgPerformance = teamMembers.reduce((sum, m) => sum + (m.performance || 0), 0) / teamMembers.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">Manage your team members, roles, and permissions</p>
        </div>
        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>Send an invitation to join your team</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="colleague@company.com" />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AGENCY_ADMIN">Agency Admin</SelectItem>
                    <SelectItem value="CONSULTANT">Consultant</SelectItem>
                    <SelectItem value="SUPPORT">Support</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Executive">Executive</SelectItem>
                    <SelectItem value="Consulting">Consulting</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="title">Job Title</Label>
                <Input id="title" placeholder="e.g., Senior Consultant" />
              </div>
              <div>
                <Label htmlFor="message">Personal Message (Optional)</Label>
                <Textarea id="message" placeholder="Add a personal note to the invitation" />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsInviteOpen(false)}>
                  Send Invitation
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Team</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeMembers.length} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
            <p className="text-xs text-muted-foreground">
              Active departments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPerformanceColor(avgPerformance)}`}>
              {avgPerformance.toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Team average
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invites</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Awaiting response
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="members" className="space-y-6">
        <TabsList>
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-4 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search team members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="AGENCY_ADMIN">Admin</SelectItem>
                  <SelectItem value="CONSULTANT">Consultant</SelectItem>
                  <SelectItem value="SUPPORT">Support</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                </SelectContent>
              </Select>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Executive">Executive</SelectItem>
                  <SelectItem value="Consulting">Consulting</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Team Members Table */}
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage your team members and their information</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>
                              {member.firstName[0]}{member.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{member.firstName} {member.lastName}</div>
                            <div className="text-sm text-muted-foreground">{member.email}</div>
                            <div className="text-xs text-muted-foreground">{member.title}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(member.role)}>
                          {member.role.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{member.department}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(member.status)}
                          <Badge className={getStatusColor(member.status)}>
                            {member.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {member.lastLogin ? (
                          new Date(member.lastLogin).toLocaleDateString()
                        ) : (
                          <span className="text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {member.performance && (
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  member.performance >= 90 ? 'bg-green-500' :
                                  member.performance >= 80 ? 'bg-blue-500' :
                                  member.performance >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${member.performance}%` }}
                              />
                            </div>
                            <span className={`text-sm font-medium ${getPerformanceColor(member.performance)}`}>
                              {member.performance}%
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Roles & Permissions</CardTitle>
              <CardDescription>Manage custom roles and their permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roles.map((role) => (
                  <div key={role.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{role.name}</h3>
                        {role.isSystemRole && (
                          <Badge variant="outline" className="text-xs">System Role</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {role.permissions.slice(0, 3).map((permission) => (
                          <span key={permission} className="text-xs bg-gray-100 px-1 rounded">
                            {permission}
                          </span>
                        ))}
                        {role.permissions.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{role.permissions.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{role.userCount} users</div>
                      <div className="flex gap-2 mt-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                        {!role.isSystemRole && (
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <Card key={dept.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    {dept.name}
                  </CardTitle>
                  <CardDescription>{dept.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Members:</span>
                      <span className="text-sm font-medium">{dept.memberCount}</span>
                    </div>
                    {dept.budget && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Budget:</span>
                        <span className="text-sm font-medium">${dept.budget.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Head:</span>
                      <span className="text-sm font-medium">
                        {teamMembers.find(m => m.id === dept.headId)?.firstName || 'Unassigned'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      View
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Activity</CardTitle>
              <CardDescription>Recent team activities and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Activity feed will be implemented here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}