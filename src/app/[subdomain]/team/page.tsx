"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Plus,
  Search,
  Filter,
  Users,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Star,
  Edit,
  Trash2,
  MoreHorizontal,
  Settings,
  Shield,
  Activity,
  CheckCircle,
  AlertTriangle,
  Loader2
} from "lucide-react"

interface TeamMember {
  id: string
  name: string
  email: string
  role: 'AGENCY_ADMIN' | 'CONSULTANT' | 'SUPPORT' | 'STUDENT'
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING'
  title?: string
  department?: string
  phone?: string
  lastLoginAt?: string
  avatar?: string
  createdAt: string
  assignedStudents: number
  assignedApplications: number
}

interface TeamStats {
  totalMembers: number
  activeMembers: number
  pendingInvitations: number
  departments: { name: string; count: number }[]
}

interface Branch {
  id: string
  name: string
  code: string
  type: 'MAIN' | 'BRANCH' | 'FRANCHISE' | 'PARTNER'
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'CLOSED'
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  manager?: {
    id: string
    name: string
    email: string
    role: string
  }
  maxStudents?: number
  maxStaff?: number
  description?: string
  features: string[]
  settings: Record<string, any>
  studentCount: number
  userCount: number
  createdAt: string
  updatedAt: string
}

export default function TeamPage() {
  const params = useParams()
  const subdomain = params.subdomain as string
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [stats, setStats] = useState<TeamStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [branchSearchTerm, setBranchSearchTerm] = useState("")
  const [branchTypeFilter, setBranchTypeFilter] = useState("all")
  const [branchStatusFilter, setBranchStatusFilter] = useState("all")

  // Form state
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    role: "CONSULTANT" as TeamMember['role'],
    title: "",
    department: "",
    phone: ""
  })

  // Branch form state
  const [branchForm, setBranchForm] = useState({
    name: "",
    code: "",
    type: "BRANCH" as Branch['type'],
    status: "PENDING" as Branch['status'],
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    managerId: "",
    maxStudents: "",
    maxStaff: "",
    description: "",
    features: [] as string[],
    settings: {}
  })

  useEffect(() => {
    fetchTeamData()
  }, [subdomain])

  const fetchTeamData = async () => {
    try {
      setLoading(true)
      
      // Fetch team members
      const membersResponse = await fetch(`/api/${subdomain}/users?limit=50`)
      if (!membersResponse.ok) throw new Error('Failed to fetch team members')
      const membersData = await membersResponse.json()
      setTeamMembers(membersData.users || [])

      // Fetch branches
      const branchesResponse = await fetch(`/api/${subdomain}/branches?limit=50`)
      if (!branchesResponse.ok) throw new Error('Failed to fetch branches')
      const branchesData = await branchesResponse.json()
      setBranches(branchesData.branches || [])

      // Calculate stats
      const teamStats: TeamStats = {
        totalMembers: membersData.users?.length || 0,
        activeMembers: (membersData.users || []).filter((u: TeamMember) => u.status === 'ACTIVE').length,
        pendingInvitations: 0, // This would come from invitations API
        departments: [
          { name: "Executive", count: 1 },
          { name: "Consulting", count: 2 },
          { name: "Operations", count: 1 }
        ]
      }
      setStats(teamStats)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleInviteMember = async () => {
    if (!newMember.name || !newMember.email) {
      alert("Name and email are required")
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/${subdomain}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMember),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to invite team member')
      }

      await fetchTeamData()
      setIsInviteOpen(false)
      // Reset form
      setNewMember({
        name: "",
        email: "",
        role: "CONSULTANT",
        title: "",
        department: "",
        phone: ""
      })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to invite team member')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) {
      return
    }

    try {
      const response = await fetch(`/api/${subdomain}/users/${memberId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to remove team member')
      }

      await fetchTeamData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove team member')
    }
  }

  // Branch management functions
  const handleCreateBranch = async () => {
    if (!branchForm.name || !branchForm.code) {
      alert("Branch name and code are required")
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/${subdomain}/branches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...branchForm,
          maxStudents: branchForm.maxStudents ? parseInt(branchForm.maxStudents) : undefined,
          maxStaff: branchForm.maxStaff ? parseInt(branchForm.maxStaff) : undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create branch')
      }

      await fetchTeamData()
      setIsBranchModalOpen(false)
      resetBranchForm()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create branch')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateBranch = async () => {
    if (!editingBranch || !branchForm.name || !branchForm.code) {
      alert("Branch name and code are required")
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/${subdomain}/branches/${editingBranch.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...branchForm,
          maxStudents: branchForm.maxStudents ? parseInt(branchForm.maxStudents) : undefined,
          maxStaff: branchForm.maxStaff ? parseInt(branchForm.maxStaff) : undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update branch')
      }

      await fetchTeamData()
      setIsBranchModalOpen(false)
      setEditingBranch(null)
      resetBranchForm()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update branch')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteBranch = async (branchId: string) => {
    if (!confirm('Are you sure you want to delete this branch? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/${subdomain}/branches/${branchId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete branch')
      }

      await fetchTeamData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete branch')
    }
  }

  const openEditBranchModal = (branch: Branch) => {
    setEditingBranch(branch)
    setBranchForm({
      name: branch.name,
      code: branch.code,
      type: branch.type,
      status: branch.status,
      email: branch.email || "",
      phone: branch.phone || "",
      address: branch.address || "",
      city: branch.city || "",
      state: branch.state || "",
      country: branch.country || "",
      postalCode: branch.postalCode || "",
      managerId: branch.manager?.id || "",
      maxStudents: branch.maxStudents?.toString() || "",
      maxStaff: branch.maxStaff?.toString() || "",
      description: branch.description || "",
      features: branch.features,
      settings: branch.settings
    })
    setIsBranchModalOpen(true)
  }

  const resetBranchForm = () => {
    setBranchForm({
      name: "",
      code: "",
      type: "BRANCH",
      status: "PENDING",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      managerId: "",
      maxStudents: "",
      maxStaff: "",
      description: "",
      features: [],
      settings: {}
    })
    setEditingBranch(null)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "AGENCY_ADMIN": return "bg-purple-100 text-purple-800"
      case "CONSULTANT": return "bg-blue-100 text-blue-800"
      case "SUPPORT": return "bg-green-100 text-green-800"
      case "STUDENT": return "bg-orange-100 text-orange-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-green-100 text-green-800"
      case "PENDING": return "bg-yellow-100 text-yellow-800"
      case "INACTIVE": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getBranchTypeColor = (type: string) => {
    switch (type) {
      case "MAIN": return "bg-purple-100 text-purple-800"
      case "BRANCH": return "bg-blue-100 text-blue-800"
      case "FRANCHISE": return "bg-green-100 text-green-800"
      case "PARTNER": return "bg-orange-100 text-orange-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getBranchStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-green-100 text-green-800"
      case "PENDING": return "bg-yellow-100 text-yellow-800"
      case "INACTIVE": return "bg-red-100 text-red-800"
      case "CLOSED": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.title?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || member.role === roleFilter
    const matchesStatus = statusFilter === "all" || member.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  const filteredBranches = branches.filter(branch => {
    const matchesSearch = branch.name.toLowerCase().includes(branchSearchTerm.toLowerCase()) ||
                         branch.code.toLowerCase().includes(branchSearchTerm.toLowerCase()) ||
                         branch.city?.toLowerCase().includes(branchSearchTerm.toLowerCase())
    const matchesType = branchTypeFilter === "all" || branch.type === branchTypeFilter
    const matchesStatus = branchStatusFilter === "all" || branch.status === branchStatusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="max-w-md">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">Manage your agency team members and roles</p>
        </div>
        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>Send an invitation to join your agency team</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input 
                  id="name" 
                  placeholder="John Doe"
                  value={newMember.name}
                  onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input 
                  id="email" 
                  type="email"
                  placeholder="john@agency.com"
                  value={newMember.email}
                  onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select onValueChange={(value) => setNewMember(prev => ({ ...prev, role: value as TeamMember['role'] }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AGENCY_ADMIN">Agency Admin</SelectItem>
                    <SelectItem value="CONSULTANT">Consultant</SelectItem>
                    <SelectItem value="SUPPORT">Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="title">Job Title</Label>
                <Input 
                  id="title" 
                  placeholder="Senior Education Consultant"
                  value={newMember.title}
                  onChange={(e) => setNewMember(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Input 
                  id="department" 
                  placeholder="Consulting"
                  value={newMember.department}
                  onChange={(e) => setNewMember(prev => ({ ...prev, department: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  placeholder="+1 (555) 123-4567"
                  value={newMember.phone}
                  onChange={(e) => setNewMember(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <Button 
                onClick={handleInviteMember} 
                disabled={submitting}
                className="w-full"
              >
                {submitting ? "Sending Invitation..." : "Send Invitation"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Team</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMembers}</div>
              <p className="text-xs text-muted-foreground">team members</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeMembers}</div>
              <p className="text-xs text-muted-foreground">currently active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingInvitations}</div>
              <p className="text-xs text-muted-foreground">invitations pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.departments.length}</div>
              <p className="text-xs text-muted-foreground">active departments</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="members" className="space-y-6">
        <TabsList>
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="branches">Branches</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search team members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="AGENCY_ADMIN">Admin</SelectItem>
                  <SelectItem value="CONSULTANT">Consultant</SelectItem>
                  <SelectItem value="SUPPORT">Support</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Team Members Table */}
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage your agency team members and their permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-primary-foreground text-sm font-medium">
                              {member.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(member.role)}>
                          {member.role.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{member.department || '-'}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(member.status)}>
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{member.assignedStudents} students</div>
                          <div className="text-muted-foreground">{member.assignedApplications} applications</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {member.lastLoginAt ? (
                          <span className="text-sm">{new Date(member.lastLoginAt).toLocaleDateString()}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteMember(member.id)}
                          >
                            <Trash2 className="h-4 w-4" />
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

        <TabsContent value="branches" className="space-y-6">
          {/* Branch Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Branch Management</h2>
              <p className="text-muted-foreground">Manage your agency branches and locations</p>
            </div>
            <Dialog open={isBranchModalOpen} onOpenChange={(open) => {
              setIsBranchModalOpen(open)
              if (!open) resetBranchForm()
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Branch
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingBranch ? 'Edit Branch' : 'Create New Branch'}</DialogTitle>
                  <DialogDescription>
                    {editingBranch ? 'Update branch information and settings' : 'Add a new branch to your agency'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Branch Name *</Label>
                      <Input 
                        id="name" 
                        placeholder="Main Branch"
                        value={branchForm.name}
                        onChange={(e) => setBranchForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="code">Branch Code *</Label>
                      <Input 
                        id="code" 
                        placeholder="MAIN"
                        value={branchForm.code}
                        onChange={(e) => setBranchForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Branch Type</Label>
                      <Select onValueChange={(value) => setBranchForm(prev => ({ ...prev, type: value as Branch['type'] }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MAIN">Main Branch</SelectItem>
                          <SelectItem value="BRANCH">Branch</SelectItem>
                          <SelectItem value="FRANCHISE">Franchise</SelectItem>
                          <SelectItem value="PARTNER">Partner</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select onValueChange={(value) => setBranchForm(prev => ({ ...prev, status: value as Branch['status'] }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="INACTIVE">Inactive</SelectItem>
                          <SelectItem value="CLOSED">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email"
                        placeholder="branch@agency.com"
                        value={branchForm.email}
                        onChange={(e) => setBranchForm(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input 
                        id="phone" 
                        placeholder="+1 (555) 123-4567"
                        value={branchForm.phone}
                        onChange={(e) => setBranchForm(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input 
                      id="address" 
                      placeholder="123 Main Street"
                      value={branchForm.address}
                      onChange={(e) => setBranchForm(prev => ({ ...prev, address: e.target.value }))}
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input 
                        id="city" 
                        placeholder="New York"
                        value={branchForm.city}
                        onChange={(e) => setBranchForm(prev => ({ ...prev, city: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input 
                        id="state" 
                        placeholder="NY"
                        value={branchForm.state}
                        onChange={(e) => setBranchForm(prev => ({ ...prev, state: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input 
                        id="postalCode" 
                        placeholder="10001"
                        value={branchForm.postalCode}
                        onChange={(e) => setBranchForm(prev => ({ ...prev, postalCode: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input 
                      id="country" 
                      placeholder="USA"
                      value={branchForm.country}
                      onChange={(e) => setBranchForm(prev => ({ ...prev, country: e.target.value }))}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="maxStudents">Max Students</Label>
                      <Input 
                        id="maxStudents" 
                        type="number"
                        placeholder="1000"
                        value={branchForm.maxStudents}
                        onChange={(e) => setBranchForm(prev => ({ ...prev, maxStudents: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxStaff">Max Staff</Label>
                      <Input 
                        id="maxStaff" 
                        type="number"
                        placeholder="50"
                        value={branchForm.maxStaff}
                        onChange={(e) => setBranchForm(prev => ({ ...prev, maxStaff: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <textarea 
                      id="description" 
                      className="w-full p-2 border rounded-md"
                      rows={3}
                      placeholder="Branch description and additional information..."
                      value={branchForm.description}
                      onChange={(e) => setBranchForm(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <Button 
                    onClick={editingBranch ? handleUpdateBranch : handleCreateBranch} 
                    disabled={submitting}
                    className="w-full"
                  >
                    {submitting ? "Saving..." : (editingBranch ? "Update Branch" : "Create Branch")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Branch Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search branches..."
                  value={branchSearchTerm}
                  onChange={(e) => setBranchSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={branchTypeFilter} onValueChange={setBranchTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="MAIN">Main</SelectItem>
                  <SelectItem value="BRANCH">Branch</SelectItem>
                  <SelectItem value="FRANCHISE">Franchise</SelectItem>
                  <SelectItem value="PARTNER">Partner</SelectItem>
                </SelectContent>
              </Select>
              <Select value={branchStatusFilter} onValueChange={setBranchStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Branches Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBranches.map((branch) => (
              <Card key={branch.id} className="relative">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{branch.name}</CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        Code: {branch.code}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Badge className={getBranchTypeColor(branch.type)}>
                        {branch.type}
                      </Badge>
                      <Badge className={getBranchStatusColor(branch.status)}>
                        {branch.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {branch.city && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{branch.city}, {branch.state} {branch.country}</span>
                      </div>
                    )}
                    
                    {branch.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{branch.email}</span>
                      </div>
                    )}
                    
                    {branch.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{branch.phone}</span>
                      </div>
                    )}

                    {branch.manager && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>Manager: {branch.manager.name}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                      <div className="text-center">
                        <div className="text-lg font-semibold">{branch.studentCount}</div>
                        <div className="text-xs text-muted-foreground">Students</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{branch.userCount}</div>
                        <div className="text-xs text-muted-foreground">Staff</div>
                      </div>
                    </div>

                    {branch.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {branch.description}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => openEditBranchModal(branch)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteBranch(branch.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredBranches.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No branches found. Create your first branch to get started.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats?.departments.map((dept) => (
              <Card key={dept.name}>
                <CardHeader>
                  <CardTitle className="text-lg">{dept.name}</CardTitle>
                  <CardDescription>Department team members</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Members:</span>
                      <span className="font-medium">{dept.count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Head:</span>
                      <span className="font-medium">-</span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-4">
                      View Department
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Role Permissions</CardTitle>
              <CardDescription>Configure access permissions for each role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { role: "AGENCY_ADMIN", description: "Full access to all features and settings" },
                  { role: "CONSULTANT", description: "Manage students and applications" },
                  { role: "SUPPORT", description: "Customer support and basic operations" }
                ].map((item) => (
                  <div key={item.role} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span className="font-medium">{item.role.replace('_', ' ')}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}