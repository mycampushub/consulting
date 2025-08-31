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
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { 
  Plus,
  Search,
  Filter,
  MapPin,
  Users,
  Phone,
  Mail,
  Building,
  Globe,
  Clock,
  Edit,
  Trash2,
  MoreHorizontal,
  Settings,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ExternalLink,
  User,
  Calendar,
  Star,
  Activity,
  BarChart3,
  TrendingUp,
  Eye,
  Copy
} from "lucide-react"

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
  features?: string[]
  settings?: Record<string, any>
  businessHours?: Record<string, any>
  studentCount: number
  userCount: number
  applicationCount: number
  documentCount: number
  createdAt: string
  updatedAt: string
}

interface BranchStats {
  totalBranches: number
  activeBranches: number
  inactiveBranches: number
  pendingBranches: number
  totalStudents: number
  totalStaff: number
  totalApplications: number
}

export default function BranchesPage() {
  const params = useParams()
  const subdomain = params.subdomain as string
  
  const [branches, setBranches] = useState<Branch[]>([])
  const [stats, setStats] = useState<BranchStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [isCreateBranchOpen, setIsCreateBranchOpen] = useState(false)
  const [isEditBranchOpen, setIsEditBranchOpen] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  // Form state
  const [newBranch, setNewBranch] = useState({
    name: "",
    code: "",
    type: "BRANCH" as Branch['type'],
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
    settings: {},
    businessHours: {}
  })

  useEffect(() => {
    fetchBranchesData()
  }, [subdomain])

  const fetchBranchesData = async () => {
    try {
      setLoading(true)
      
      const response = await fetch(`/api/${subdomain}/branches?limit=50`)
      if (!response.ok) throw new Error('Failed to fetch branches')
      
      const data = await response.json()
      setBranches(data.branches || [])

      // Calculate stats
      const branchStats: BranchStats = {
        totalBranches: data.branches?.length || 0,
        activeBranches: (data.branches || []).filter((b: Branch) => b.status === 'ACTIVE').length,
        inactiveBranches: (data.branches || []).filter((b: Branch) => b.status === 'INACTIVE').length,
        pendingBranches: (data.branches || []).filter((b: Branch) => b.status === 'PENDING').length,
        totalStudents: (data.branches || []).reduce((sum: number, b: Branch) => sum + b.studentCount, 0),
        totalStaff: (data.branches || []).reduce((sum: number, b: Branch) => sum + b.userCount, 0),
        totalApplications: (data.branches || []).reduce((sum: number, b: Branch) => sum + b.applicationCount, 0)
      }
      
      setStats(branchStats)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBranch = async () => {
    if (!newBranch.name || !newBranch.code) {
      alert("Branch name and code are required")
      return
    }

    setSubmitting(true)
    try {
      const branchData = {
        name: newBranch.name,
        code: newBranch.code,
        type: newBranch.type,
        email: newBranch.email || undefined,
        phone: newBranch.phone || undefined,
        address: newBranch.address || undefined,
        city: newBranch.city || undefined,
        state: newBranch.state || undefined,
        country: newBranch.country || undefined,
        postalCode: newBranch.postalCode || undefined,
        managerId: newBranch.managerId || undefined,
        maxStudents: newBranch.maxStudents ? parseInt(newBranch.maxStudents) : undefined,
        maxStaff: newBranch.maxStaff ? parseInt(newBranch.maxStaff) : undefined,
        description: newBranch.description || undefined,
        features: newBranch.features.length > 0 ? newBranch.features : undefined,
        settings: Object.keys(newBranch.settings).length > 0 ? newBranch.settings : undefined,
        businessHours: Object.keys(newBranch.businessHours).length > 0 ? newBranch.businessHours : undefined
      }

      const response = await fetch(`/api/${subdomain}/branches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(branchData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create branch')
      }

      await fetchBranchesData()
      setIsCreateBranchOpen(false)
      // Reset form
      setNewBranch({
        name: "",
        code: "",
        type: "BRANCH",
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
        settings: {},
        businessHours: {}
      })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create branch')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditBranch = (branch: Branch) => {
    setSelectedBranch(branch)
    setNewBranch({
      name: branch.name,
      code: branch.code,
      type: branch.type,
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
      features: branch.features || [],
      settings: branch.settings || {},
      businessHours: branch.businessHours || {}
    })
    setIsEditBranchOpen(true)
  }

  const handleUpdateBranch = async () => {
    if (!selectedBranch || !newBranch.name || !newBranch.code) {
      alert("Branch name and code are required")
      return
    }

    setSubmitting(true)
    try {
      const branchData = {
        name: newBranch.name,
        code: newBranch.code,
        type: newBranch.type,
        email: newBranch.email || undefined,
        phone: newBranch.phone || undefined,
        address: newBranch.address || undefined,
        city: newBranch.city || undefined,
        state: newBranch.state || undefined,
        country: newBranch.country || undefined,
        postalCode: newBranch.postalCode || undefined,
        managerId: newBranch.managerId || undefined,
        maxStudents: newBranch.maxStudents ? parseInt(newBranch.maxStudents) : undefined,
        maxStaff: newBranch.maxStaff ? parseInt(newBranch.maxStaff) : undefined,
        description: newBranch.description || undefined,
        features: newBranch.features.length > 0 ? newBranch.features : undefined,
        settings: Object.keys(newBranch.settings).length > 0 ? newBranch.settings : undefined,
        businessHours: Object.keys(newBranch.businessHours).length > 0 ? newBranch.businessHours : undefined
      }

      const response = await fetch(`/api/${subdomain}/branches/${selectedBranch.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(branchData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update branch')
      }

      await fetchBranchesData()
      setIsEditBranchOpen(false)
      setSelectedBranch(null)
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

      await fetchBranchesData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete branch')
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "MAIN": return <Building className="h-4 w-4" />
      case "BRANCH": return <MapPin className="h-4 w-4" />
      case "FRANCHISE": return <Star className="h-4 w-4" />
      case "PARTNER": return <Globe className="h-4 w-4" />
      default: return <Building className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-green-100 text-green-800"
      case "INACTIVE": return "bg-red-100 text-red-800"
      case "PENDING": return "bg-yellow-100 text-yellow-800"
      case "CLOSED": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "MAIN": return "bg-purple-100 text-purple-800"
      case "BRANCH": return "bg-blue-100 text-blue-800"
      case "FRANCHISE": return "bg-orange-100 text-orange-800"
      case "PARTNER": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const filteredBranches = branches.filter(branch => {
    const matchesSearch = branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         branch.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         branch.city?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || branch.status === statusFilter
    const matchesType = typeFilter === "all" || branch.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
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
          <h1 className="text-3xl font-bold">Branches Management</h1>
          <p className="text-muted-foreground">Manage multi-location operations and branches</p>
        </div>
        <Dialog open={isCreateBranchOpen} onOpenChange={setIsCreateBranchOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Branch
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Branch</DialogTitle>
              <DialogDescription>Add a new branch to your agency network</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Branch Name *</Label>
                  <Input 
                    id="name" 
                    placeholder="Downtown Office"
                    value={newBranch.name}
                    onChange={(e) => setNewBranch(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="code">Branch Code *</Label>
                  <Input 
                    id="code" 
                    placeholder="DT001"
                    value={newBranch.code}
                    onChange={(e) => setNewBranch(prev => ({ ...prev, code: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Branch Type</Label>
                  <Select onValueChange={(value) => setNewBranch(prev => ({ ...prev, type: value as Branch['type'] }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MAIN">Main Office</SelectItem>
                      <SelectItem value="BRANCH">Branch</SelectItem>
                      <SelectItem value="FRANCHISE">Franchise</SelectItem>
                      <SelectItem value="PARTNER">Partner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    placeholder="branch@agency.com"
                    value={newBranch.email}
                    onChange={(e) => setNewBranch(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    placeholder="+1 (555) 123-4567"
                    value={newBranch.phone}
                    onChange={(e) => setNewBranch(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input 
                    id="city" 
                    placeholder="New York"
                    value={newBranch.city}
                    onChange={(e) => setNewBranch(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input 
                    id="state" 
                    placeholder="NY"
                    value={newBranch.state}
                    onChange={(e) => setNewBranch(prev => ({ ...prev, state: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input 
                    id="country" 
                    placeholder="United States"
                    value={newBranch.country}
                    onChange={(e) => setNewBranch(prev => ({ ...prev, country: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea 
                  id="address" 
                  placeholder="123 Main Street, Suite 100"
                  value={newBranch.address}
                  onChange={(e) => setNewBranch(prev => ({ ...prev, address: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxStudents">Max Students</Label>
                  <Input 
                    id="maxStudents" 
                    type="number"
                    placeholder="100"
                    value={newBranch.maxStudents}
                    onChange={(e) => setNewBranch(prev => ({ ...prev, maxStudents: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="maxStaff">Max Staff</Label>
                  <Input 
                    id="maxStaff" 
                    type="number"
                    placeholder="10"
                    value={newBranch.maxStaff}
                    onChange={(e) => setNewBranch(prev => ({ ...prev, maxStaff: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Main downtown branch serving the metropolitan area..."
                  value={newBranch.description}
                  onChange={(e) => setNewBranch(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsCreateBranchOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateBranch} disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                  Create Branch
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Branches</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBranches}</div>
              <p className="text-xs text-muted-foreground">across all locations</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Branches</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeBranches}</div>
              <p className="text-xs text-muted-foreground">currently operating</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">across all branches</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStaff}</div>
              <p className="text-xs text-muted-foreground">team members</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="branches" className="space-y-6">
        <TabsList>
          <TabsTrigger value="branches">Branches</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="branches" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search branches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
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
            </div>
          </div>

          {/* Branches Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Branch</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBranches.map((branch) => (
                  <TableRow key={branch.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{branch.name}</div>
                        <div className="text-sm text-muted-foreground">{branch.code}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(branch.type)}>
                        {getTypeIcon(branch.type)}
                        <span className="ml-1">{branch.type}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(branch.status)}>
                        {branch.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {branch.city}, {branch.state}
                        {branch.country && `, ${branch.country}`}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {branch.manager?.name || 'Unassigned'}
                        {branch.manager?.email && (
                          <div className="text-xs text-muted-foreground">{branch.manager.email}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{branch.studentCount}</div>
                      {branch.maxStudents && (
                        <div className="text-xs text-muted-foreground">
                          of {branch.maxStudents}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{branch.userCount}</div>
                      {branch.maxStaff && (
                        <div className="text-xs text-muted-foreground">
                          of {branch.maxStaff}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditBranch(branch)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteBranch(branch.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Branch Distribution</CardTitle>
                <CardDescription>Overview of branch types and locations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(
                    branches.reduce((acc, branch) => {
                      acc[branch.type] = (acc[branch.type] || 0) + 1
                      return acc
                    }, {} as Record<string, number>)
                  ).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(type)}
                        <span className="capitalize">{type.toLowerCase()}</span>
                      </div>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest branch updates and changes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {branches.slice(0, 5).map((branch) => (
                    <div key={branch.id} className="flex items-center gap-3 text-sm">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="font-medium">{branch.name}</span>
                        <span className="text-muted-foreground"> updated </span>
                        <span className="text-muted-foreground">
                          {new Date(branch.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Branches</CardTitle>
                <CardDescription>By student enrollment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {branches
                    .sort((a, b) => b.studentCount - a.studentCount)
                    .slice(0, 5)
                    .map((branch) => (
                      <div key={branch.id} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{branch.name}</span>
                        <Badge variant="secondary">{branch.studentCount} students</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Capacity Utilization</CardTitle>
                <CardDescription>Student capacity across branches</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {branches
                    .filter(b => b.maxStudents)
                    .map((branch) => {
                      const utilization = (branch.studentCount / (branch.maxStudents || 1)) * 100
                      return (
                        <div key={branch.id} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{branch.name}</span>
                            <span>{Math.round(utilization)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${Math.min(utilization, 100)}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>Branches by location</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(
                    branches.reduce((acc, branch) => {
                      const location = `${branch.city}, ${branch.country}`
                      acc[location] = (acc[location] || 0) + 1
                      return acc
                    }, {} as Record<string, number>)
                  ).map(([location, count]) => (
                    <div key={location} className="flex justify-between items-center">
                      <span className="text-sm">{location}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Branch Settings</CardTitle>
              <CardDescription>Configure branch management settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-assign new students</Label>
                    <p className="text-sm text-muted-foreground">Automatically assign new students to branches</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Branch capacity alerts</Label>
                    <p className="text-sm text-muted-foreground">Send alerts when branches reach capacity</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Multi-location reporting</Label>
                    <p className="text-sm text-muted-foreground">Enable consolidated reporting across branches</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Branch Dialog */}
      <Dialog open={isEditBranchOpen} onOpenChange={setIsEditBranchOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Branch</DialogTitle>
            <DialogDescription>Update branch information and settings</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Branch Name *</Label>
                <Input 
                  id="edit-name" 
                  value={newBranch.name}
                  onChange={(e) => setNewBranch(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-code">Branch Code *</Label>
                <Input 
                  id="edit-code" 
                  value={newBranch.code}
                  onChange={(e) => setNewBranch(prev => ({ ...prev, code: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-type">Branch Type</Label>
                <Select value={newBranch.type} onValueChange={(value) => setNewBranch(prev => ({ ...prev, type: value as Branch['type'] }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MAIN">Main Office</SelectItem>
                    <SelectItem value="BRANCH">Branch</SelectItem>
                    <SelectItem value="FRANCHISE">Franchise</SelectItem>
                    <SelectItem value="PARTNER">Partner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input 
                  id="edit-email" 
                  type="email"
                  value={newBranch.email}
                  onChange={(e) => setNewBranch(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsEditBranchOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateBranch} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Edit className="h-4 w-4 mr-2" />}
                Update Branch
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}