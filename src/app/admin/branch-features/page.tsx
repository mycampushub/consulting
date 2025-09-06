"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  Users, 
  CreditCard, 
  BarChart3, 
  Shield,
  Zap,
  Database,
  Globe,
  Activity,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  TrendingUp,
  Eye,
  MoreHorizontal,
  GitBranch,
  Building2,
  Key
} from "lucide-react"

interface BranchFeature {
  id: string
  agencyId: string
  agency?: Agency
  featureId: string
  feature?: SubscriptionFeature
  branchId?: string
  branch?: Branch
  isEnabled: boolean
  accessLevel: 'VIEW' | 'DOWNLOAD' | 'EDIT' | 'AGENCY' | 'ADMIN'
  config?: string
  limits?: string
  createdAt: string
  updatedAt: string
}

interface Agency {
  id: string
  name: string
  subdomain: string
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING'
  plan: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'
  userCount: number
  studentCount: number
  createdAt: string
}

interface SubscriptionFeature {
  id: string
  name: string
  description: string
  slug: string
  category: 'CORE' | 'CRM' | 'MARKETING' | 'ACCOUNTING' | 'COMMUNICATIONS' | 'ANALYTICS' | 'AUTOMATION' | 'INTEGRATIONS' | 'ENTERPRISE' | 'CUSTOM'
  type: 'BOOLEAN' | 'NUMBER' | 'STRING' | 'JSON' | 'TOGGLE' | 'LIMIT'
  isToggleable: boolean
  isVisible: boolean
  createdAt: string
  updatedAt: string
}

interface Branch {
  id: string
  name: string
  code: string
  type: 'BRANCH' | 'FRANCHISE' | 'PARTNER'
  status: 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  agencyId: string
  createdAt: string
}

const mockAgencies: Agency[] = [
  {
    id: "1",
    name: "Global Education Partners",
    subdomain: "global-education",
    status: "ACTIVE",
    plan: "ENTERPRISE",
    userCount: 12,
    studentCount: 250,
    createdAt: "2024-01-15"
  },
  {
    id: "2", 
    name: "Study Abroad Consultants",
    subdomain: "study-abroad",
    status: "ACTIVE",
    plan: "PROFESSIONAL",
    userCount: 5,
    studentCount: 80,
    createdAt: "2024-01-10"
  }
]

const mockBranches: Branch[] = [
  {
    id: "1",
    name: "Main Office",
    code: "HQ",
    type: "BRANCH",
    status: "ACTIVE",
    agencyId: "1",
    createdAt: "2024-01-15"
  },
  {
    id: "2",
    name: "Downtown Branch",
    code: "DT",
    type: "BRANCH",
    status: "ACTIVE",
    agencyId: "1",
    createdAt: "2024-01-20"
  },
  {
    id: "3",
    name: "North Campus",
    code: "NC",
    type: "BRANCH",
    status: "ACTIVE",
    agencyId: "2",
    createdAt: "2024-01-18"
  }
]

const mockFeatures: SubscriptionFeature[] = [
  {
    id: "1",
    name: "Student CRM",
    description: "Complete student lifecycle management",
    slug: "student-crm",
    category: "CORE",
    type: "BOOLEAN",
    isToggleable: true,
    isVisible: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "2",
    name: "University Partnerships",
    description: "Connect with universities worldwide",
    slug: "university-partnerships",
    category: "CORE",
    type: "BOOLEAN",
    isToggleable: true,
    isVisible: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "3",
    name: "Marketing Automation",
    description: "Automated marketing campaigns",
    slug: "marketing-automation",
    category: "MARKETING",
    type: "BOOLEAN",
    isToggleable: true,
    isVisible: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "4",
    name: "Advanced Analytics",
    description: "Detailed analytics and reporting",
    slug: "advanced-analytics",
    category: "ANALYTICS",
    type: "BOOLEAN",
    isToggleable: true,
    isVisible: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "5",
    name: "API Access",
    description: "Full API access for integrations",
    slug: "api-access",
    category: "INTEGRATIONS",
    type: "BOOLEAN",
    isToggleable: true,
    isVisible: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  }
]

const mockBranchFeatures: BranchFeature[] = [
  {
    id: "1",
    agencyId: "1",
    featureId: "1",
    branchId: "1",
    isEnabled: true,
    accessLevel: "ADMIN",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z"
  },
  {
    id: "2",
    agencyId: "1",
    featureId: "2",
    branchId: "1",
    isEnabled: true,
    accessLevel: "ADMIN",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z"
  },
  {
    id: "3",
    agencyId: "1",
    featureId: "3",
    branchId: "1",
    isEnabled: false,
    accessLevel: "ADMIN",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z"
  },
  {
    id: "4",
    agencyId: "1",
    featureId: "1",
    branchId: "2",
    isEnabled: true,
    accessLevel: "EDIT",
    createdAt: "2024-01-20T14:15:00Z",
    updatedAt: "2024-01-20T14:15:00Z"
  },
  {
    id: "5",
    agencyId: "2",
    featureId: "1",
    branchId: "3",
    isEnabled: true,
    accessLevel: "ADMIN",
    createdAt: "2024-01-18T09:45:00Z",
    updatedAt: "2024-01-18T09:45:00Z"
  }
]

export default function BranchFeaturesManagement() {
  const [agencies] = useState<Agency[]>(mockAgencies)
  const [branches] = useState<Branch[]>(mockBranches)
  const [features] = useState<SubscriptionFeature[]>(mockFeatures)
  const [branchFeatures] = useState<BranchFeature[]>(mockBranchFeatures)
  const [selectedAgency, setSelectedAgency] = useState<string>("")
  const [selectedBranch, setSelectedBranch] = useState<string>("")
  const [selectedFeature, setSelectedFeature] = useState<BranchFeature | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [isCreating, setIsCreating] = useState(false)

  const filteredBranchFeatures = branchFeatures.filter(feature => {
    const matchesSearch = feature.feature?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feature.branch?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feature.agency?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || 
                          (statusFilter === "enabled" && feature.isEnabled) ||
                          (statusFilter === "disabled" && !feature.isEnabled)
    const matchesAgency = !selectedAgency || feature.agencyId === selectedAgency
    const matchesBranch = !selectedBranch || feature.branchId === selectedBranch
    const matchesCategory = categoryFilter === "all" || feature.feature?.category === categoryFilter
    
    return matchesSearch && matchesStatus && matchesAgency && matchesBranch && matchesCategory
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-green-100 text-green-800"
      case "INACTIVE": return "bg-gray-100 text-gray-800"
      case "SUSPENDED": return "bg-red-100 text-red-800"
      case "PENDING": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "CORE": return "bg-blue-100 text-blue-800"
      case "CRM": return "bg-green-100 text-green-800"
      case "MARKETING": return "bg-purple-100 text-purple-800"
      case "ACCOUNTING": return "bg-yellow-100 text-yellow-800"
      case "COMMUNICATIONS": return "bg-pink-100 text-pink-800"
      case "ANALYTICS": return "bg-indigo-100 text-indigo-800"
      case "AUTOMATION": return "bg-orange-100 text-orange-800"
      case "INTEGRATIONS": return "bg-teal-100 text-teal-800"
      case "ENTERPRISE": return "bg-red-100 text-red-800"
      case "CUSTOM": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case "VIEW": return "bg-gray-100 text-gray-800"
      case "DOWNLOAD": return "bg-blue-100 text-blue-800"
      case "EDIT": return "bg-yellow-100 text-yellow-800"
      case "AGENCY": return "bg-purple-100 text-purple-800"
      case "ADMIN": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const filteredBranches = branches.filter(branch => 
    !selectedAgency || branch.agencyId === selectedAgency
  )

  const availableFeatures = features.filter(feature => {
    const existingFeature = branchFeatures.find(bf => 
      bf.featureId === feature.id && 
      bf.agencyId === selectedAgency && 
      bf.branchId === selectedBranch
    )
    return !existingFeature
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <GitBranch className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Branch Features Management</h1>
                <p className="text-sm text-muted-foreground">Control feature access at branch level</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="agency">Agency</Label>
                <Select value={selectedAgency} onValueChange={setSelectedAgency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select agency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Agencies</SelectItem>
                    {agencies.map((agency) => (
                      <SelectItem key={agency.id} value={agency.id}>
                        {agency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="branch">Branch</Label>
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    {filteredBranches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="CORE">Core</SelectItem>
                    <SelectItem value="CRM">CRM</SelectItem>
                    <SelectItem value="MARKETING">Marketing</SelectItem>
                    <SelectItem value="ACCOUNTING">Accounting</SelectItem>
                    <SelectItem value="COMMUNICATIONS">Communications</SelectItem>
                    <SelectItem value="ANALYTICS">Analytics</SelectItem>
                    <SelectItem value="AUTOMATION">Automation</SelectItem>
                    <SelectItem value="INTEGRATIONS">Integrations</SelectItem>
                    <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="enabled">Enabled</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search features, branches, or agencies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Features</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredBranchFeatures.length}</div>
              <p className="text-xs text-muted-foreground">
                Across {filteredBranches.length} branches
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enabled Features</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredBranchFeatures.filter(f => f.isEnabled).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agencies</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {selectedAgency ? 1 : agencies.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedAgency ? 'Selected' : 'Total'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Branches</CardTitle>
              <GitBranch className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredBranches.length}</div>
              <p className="text-xs text-muted-foreground">
                Configured branches
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Add Feature Button */}
        {selectedAgency && selectedBranch && (
          <div className="mb-6">
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Feature to Branch
            </Button>
          </div>
        )}

        {/* Branch Features Table */}
        <Card>
          <CardHeader>
            <CardTitle>Branch Feature Access</CardTitle>
            <CardDescription>
              Manage which features are available for each branch
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredBranchFeatures.map((branchFeature) => (
                <div key={branchFeature.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Key className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{branchFeature.feature?.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {branchFeature.agency?.name} • {branchFeature.branch?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch checked={branchFeature.isEnabled} />
                      <span className="text-sm">{branchFeature.isEnabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <Badge className={getAccessLevelColor(branchFeature.accessLevel)}>
                      {branchFeature.accessLevel}
                    </Badge>
                    <Badge className={getCategoryColor(branchFeature.feature?.category || '')}>
                      {branchFeature.feature?.category}
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedFeature(branchFeature)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
              
              {filteredBranchFeatures.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No branch features found matching your filters.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Available Features Section */}
        {selectedAgency && selectedBranch && availableFeatures.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Available Features</CardTitle>
              <CardDescription>
                Features that can be added to this branch
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableFeatures.map((feature) => (
                  <Card key={feature.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{feature.name}</h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                      <Badge className={getCategoryColor(feature.category)}>
                        {feature.category}
                      </Badge>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={() => {
                        // This would open a modal to configure the feature
                        console.log('Add feature:', feature.id)
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Branch
                    </Button>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}