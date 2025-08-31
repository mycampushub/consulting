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
  Play,
  Pause,
  Square,
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
  Copy,
  Workflow,
  Zap,
  GitBranch,
  Target,
  Clock,
  FileText,
  Mail,
  MessageSquare,
  Bell,
  Database,
  RefreshCw
} from "lucide-react"

interface Workflow {
  id: string
  name: string
  description?: string
  category: 'GENERAL' | 'LEAD_NURTURING' | 'STUDENT_ONBOARDING' | 'FOLLOW_UP' | 'NOTIFICATION' | 'INTEGRATION'
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED'
  triggers: any[]
  nodes: any[]
  edges: any[]
  isActive: boolean
  priority: number
  executionCount: number
  lastExecutedAt?: string
  createdAt: string
  updatedAt: string
  marketingCampaigns?: any[]
}

interface WorkflowStats {
  totalWorkflows: number
  activeWorkflows: number
  pausedWorkflows: number
  draftWorkflows: number
  totalExecutions: number
  successRate: number
  avgExecutionTime: number
}

interface WorkflowNode {
  id: string
  type: 'trigger' | 'action' | 'condition' | 'delay' | 'notification' | 'email' | 'api' | 'database'
  position: { x: number; y: number }
  data: {
    label: string
    config?: Record<string, any>
  }
}

interface WorkflowEdge {
  id: string
  source: string
  target: string
  label?: string
}

export default function WorkflowsPage() {
  const params = useParams()
  const subdomain = params.subdomain as string
  
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [stats, setStats] = useState<WorkflowStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [isCreateWorkflowOpen, setIsCreateWorkflowOpen] = useState(false)
  const [isEditWorkflowOpen, setIsEditWorkflowOpen] = useState(false)
  const [isBuilderOpen, setIsBuilderOpen] = useState(false)
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  // Form state
  const [newWorkflow, setNewWorkflow] = useState({
    name: "",
    description: "",
    category: "GENERAL" as Workflow['category'],
    triggers: [] as any[],
    nodes: [] as WorkflowNode[],
    edges: [] as WorkflowEdge[],
    isActive: false,
    priority: 0
  })

  // Workflow builder state
  const [builderNodes, setBuilderNodes] = useState<WorkflowNode[]>([])
  const [builderEdges, setBuilderEdges] = useState<WorkflowEdge[]>([])
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null)

  useEffect(() => {
    fetchWorkflowsData()
  }, [subdomain])

  const fetchWorkflowsData = async () => {
    try {
      setLoading(true)
      
      const response = await fetch(`/api/${subdomain}/workflows?limit=50`)
      if (!response.ok) throw new Error('Failed to fetch workflows')
      
      const data = await response.json()
      setWorkflows(data.workflows || [])

      // Calculate stats
      const workflowStats: WorkflowStats = {
        totalWorkflows: data.workflows?.length || 0,
        activeWorkflows: (data.workflows || []).filter((w: Workflow) => w.status === 'ACTIVE').length,
        pausedWorkflows: (data.workflows || []).filter((w: Workflow) => w.status === 'PAUSED').length,
        draftWorkflows: (data.workflows || []).filter((w: Workflow) => w.status === 'DRAFT').length,
        totalExecutions: (data.workflows || []).reduce((sum: number, w: Workflow) => sum + w.executionCount, 0),
        successRate: 85, // Mock data
        avgExecutionTime: 2.5 // Mock data in seconds
      }
      
      setStats(workflowStats)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateWorkflow = async () => {
    if (!newWorkflow.name) {
      alert("Workflow name is required")
      return
    }

    setSubmitting(true)
    try {
      const workflowData = {
        name: newWorkflow.name,
        description: newWorkflow.description || undefined,
        category: newWorkflow.category,
        triggers: newWorkflow.triggers,
        nodes: newWorkflow.nodes,
        edges: newWorkflow.edges,
        isActive: newWorkflow.isActive,
        priority: newWorkflow.priority
      }

      const response = await fetch(`/api/${subdomain}/workflows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workflowData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create workflow')
      }

      await fetchWorkflowsData()
      setIsCreateWorkflowOpen(false)
      // Reset form
      setNewWorkflow({
        name: "",
        description: "",
        category: "GENERAL",
        triggers: [],
        nodes: [],
        edges: [],
        isActive: false,
        priority: 0
      })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create workflow')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditWorkflow = (workflow: Workflow) => {
    setSelectedWorkflow(workflow)
    setNewWorkflow({
      name: workflow.name,
      description: workflow.description || "",
      category: workflow.category,
      triggers: workflow.triggers,
      nodes: workflow.nodes,
      edges: workflow.edges,
      isActive: workflow.isActive,
      priority: workflow.priority
    })
    setIsEditWorkflowOpen(true)
  }

  const handleUpdateWorkflow = async () => {
    if (!selectedWorkflow || !newWorkflow.name) {
      alert("Workflow name is required")
      return
    }

    setSubmitting(true)
    try {
      const workflowData = {
        name: newWorkflow.name,
        description: newWorkflow.description || undefined,
        category: newWorkflow.category,
        triggers: newWorkflow.triggers,
        nodes: newWorkflow.nodes,
        edges: newWorkflow.edges,
        isActive: newWorkflow.isActive,
        priority: newWorkflow.priority
      }

      const response = await fetch(`/api/${subdomain}/workflows/${selectedWorkflow.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workflowData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update workflow')
      }

      await fetchWorkflowsData()
      setIsEditWorkflowOpen(false)
      setSelectedWorkflow(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update workflow')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteWorkflow = async (workflowId: string) => {
    if (!confirm('Are you sure you want to delete this workflow? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/${subdomain}/workflows/${workflowId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete workflow')
      }

      await fetchWorkflowsData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete workflow')
    }
  }

  const handleToggleWorkflow = async (workflowId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/${subdomain}/workflows/${workflowId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to toggle workflow')
      }

      await fetchWorkflowsData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to toggle workflow')
    }
  }

  const openWorkflowBuilder = (workflow?: Workflow) => {
    if (workflow) {
      setSelectedWorkflow(workflow)
      setBuilderNodes(workflow.nodes)
      setBuilderEdges(workflow.edges)
    } else {
      setSelectedWorkflow(null)
      setBuilderNodes([])
      setBuilderEdges([])
    }
    setIsBuilderOpen(true)
  }

  const addNodeToBuilder = (type: WorkflowNode['type'], x: number = 100, y: number = 100) => {
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type,
      position: { x, y },
      data: {
        label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
        config: {}
      }
    }
    setBuilderNodes([...builderNodes, newNode])
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "GENERAL": return <Workflow className="h-4 w-4" />
      case "LEAD_NURTURING": return <Target className="h-4 w-4" />
      case "STUDENT_ONBOARDING": return <User className="h-4 w-4" />
      case "FOLLOW_UP": return <Mail className="h-4 w-4" />
      case "NOTIFICATION": return <Bell className="h-4 w-4" />
      case "INTEGRATION": return <Database className="h-4 w-4" />
      default: return <Workflow className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-green-100 text-green-800"
      case "PAUSED": return "bg-yellow-100 text-yellow-800"
      case "DRAFT": return "bg-gray-100 text-gray-800"
      case "ARCHIVED": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "GENERAL": return "bg-blue-100 text-blue-800"
      case "LEAD_NURTURING": return "bg-purple-100 text-purple-800"
      case "STUDENT_ONBOARDING": return "bg-green-100 text-green-800"
      case "FOLLOW_UP": return "bg-orange-100 text-orange-800"
      case "NOTIFICATION": return "bg-yellow-100 text-yellow-800"
      case "INTEGRATION": return "bg-indigo-100 text-indigo-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || workflow.status === statusFilter
    const matchesCategory = categoryFilter === "all" || workflow.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
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
          <h1 className="text-3xl font-bold">Workflows Automation</h1>
          <p className="text-muted-foreground">Create and manage automated workflows</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateWorkflowOpen} onOpenChange={setIsCreateWorkflowOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Workflow
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Workflow</DialogTitle>
                <DialogDescription>Design an automated workflow for your processes</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Workflow Name *</Label>
                  <Input 
                    id="name" 
                    placeholder="Student Onboarding Workflow"
                    value={newWorkflow.name}
                    onChange={(e) => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Automate the student onboarding process..."
                    value={newWorkflow.description}
                    onChange={(e) => setNewWorkflow(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select onValueChange={(value) => setNewWorkflow(prev => ({ ...prev, category: value as Workflow['category'] }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GENERAL">General</SelectItem>
                      <SelectItem value="LEAD_NURTURING">Lead Nurturing</SelectItem>
                      <SelectItem value="STUDENT_ONBOARDING">Student Onboarding</SelectItem>
                      <SelectItem value="FOLLOW_UP">Follow Up</SelectItem>
                      <SelectItem value="NOTIFICATION">Notification</SelectItem>
                      <SelectItem value="INTEGRATION">Integration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Active Status</Label>
                    <p className="text-sm text-muted-foreground">Enable this workflow to run automatically</p>
                  </div>
                  <Switch 
                    checked={newWorkflow.isActive}
                    onCheckedChange={(checked) => setNewWorkflow(prev => ({ ...prev, isActive: checked }))}
                  />
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select onValueChange={(value) => setNewWorkflow(prev => ({ ...prev, priority: parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Low</SelectItem>
                      <SelectItem value="1">Medium</SelectItem>
                      <SelectItem value="2">High</SelectItem>
                      <SelectItem value="3">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsCreateWorkflowOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateWorkflow} disabled={submitting}>
                    {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                    Create Workflow
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={() => openWorkflowBuilder()}>
            <GitBranch className="h-4 w-4 mr-2" />
            Workflow Builder
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
              <Workflow className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalWorkflows}</div>
              <p className="text-xs text-muted-foreground">automated processes</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeWorkflows}</div>
              <p className="text-xs text-muted-foreground">currently running</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalExecutions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">workflow runs</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.successRate}%</div>
              <p className="text-xs text-muted-foreground">avg. success rate</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="workflows" className="space-y-6">
        <TabsList>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="executions">Executions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search workflows..."
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
                  <SelectItem value="PAUSED">Paused</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="GENERAL">General</SelectItem>
                  <SelectItem value="LEAD_NURTURING">Lead Nurturing</SelectItem>
                  <SelectItem value="STUDENT_ONBOARDING">Student Onboarding</SelectItem>
                  <SelectItem value="FOLLOW_UP">Follow Up</SelectItem>
                  <SelectItem value="NOTIFICATION">Notification</SelectItem>
                  <SelectItem value="INTEGRATION">Integration</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Workflows Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Workflow</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Executions</TableHead>
                  <TableHead>Last Run</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkflows.map((workflow) => (
                  <TableRow key={workflow.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{workflow.name}</div>
                        {workflow.description && (
                          <div className="text-sm text-muted-foreground">{workflow.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(workflow.category)}>
                        {getCategoryIcon(workflow.category)}
                        <span className="ml-1">{workflow.category.replace('_', ' ')}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(workflow.status)}>
                        {workflow.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{workflow.executionCount.toLocaleString()}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {workflow.lastExecutedAt 
                          ? new Date(workflow.lastExecutedAt).toLocaleDateString()
                          : 'Never'
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={workflow.priority > 2 ? "destructive" : workflow.priority > 1 ? "default" : "secondary"}>
                        {workflow.priority === 0 ? 'Low' : 
                         workflow.priority === 1 ? 'Medium' : 
                         workflow.priority === 2 ? 'High' : 'Critical'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleToggleWorkflow(workflow.id, !workflow.isActive)}
                        >
                          {workflow.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openWorkflowBuilder(workflow)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteWorkflow(workflow.id)}>
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

        <TabsContent value="templates" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
              setNewWorkflow({
                name: "Student Onboarding",
                description: "Automated student onboarding process with welcome emails and document collection",
                category: "STUDENT_ONBOARDING",
                triggers: [],
                nodes: [],
                edges: [],
                isActive: false,
                priority: 1
              })
              setIsCreateWorkflowOpen(true)
            }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Student Onboarding
                </CardTitle>
                <CardDescription>
                  Automated student onboarding with welcome emails and document collection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Popular</Badge>
                  <Button variant="outline" size="sm">Use Template</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
              setNewWorkflow({
                name: "Lead Nurturing Campaign",
                description: "Automated lead nurturing with personalized email sequences",
                category: "LEAD_NURTURING",
                triggers: [],
                nodes: [],
                edges: [],
                isActive: false,
                priority: 1
              })
              setIsCreateWorkflowOpen(true)
            }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Lead Nurturing
                </CardTitle>
                <CardDescription>
                  Automated lead nurturing with personalized email sequences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Recommended</Badge>
                  <Button variant="outline" size="sm">Use Template</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
              setNewWorkflow({
                name: "Application Follow-up",
                description: "Automated follow-up emails for pending applications",
                category: "FOLLOW_UP",
                triggers: [],
                nodes: [],
                edges: [],
                isActive: false,
                priority: 2
              })
              setIsCreateWorkflowOpen(true)
            }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Application Follow-up
                </CardTitle>
                <CardDescription>
                  Automated follow-up emails for pending applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Essential</Badge>
                  <Button variant="outline" size="sm">Use Template</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="executions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Executions</CardTitle>
              <CardDescription>Latest workflow runs and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflows.slice(0, 5).map((workflow) => (
                  <div key={workflow.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${
                        workflow.isActive ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                      <div>
                        <div className="font-medium">{workflow.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {workflow.lastExecutedAt 
                            ? `Last run: ${new Date(workflow.lastExecutedAt).toLocaleString()}`
                            : 'Never executed'
                          }
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={workflow.isActive ? "default" : "secondary"}>
                        {workflow.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">
                        {workflow.executionCount} runs
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Settings</CardTitle>
              <CardDescription>Configure workflow automation settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable workflow execution</Label>
                    <p className="text-sm text-muted-foreground">Allow workflows to run automatically</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Execution logging</Label>
                    <p className="text-sm text-muted-foreground">Log all workflow executions for debugging</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Error notifications</Label>
                    <p className="text-sm text-muted-foreground">Send notifications when workflows fail</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Performance monitoring</Label>
                    <p className="text-sm text-muted-foreground">Monitor workflow performance metrics</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Workflow Builder Dialog */}
      <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Workflow Builder</DialogTitle>
            <DialogDescription>Design your workflow by dragging and connecting nodes</DialogDescription>
          </DialogHeader>
          <div className="flex h-[70vh] gap-4">
            {/* Node Palette */}
            <div className="w-64 border-r p-4 space-y-4">
              <h3 className="font-medium">Node Types</h3>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => addNodeToBuilder('trigger')}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Trigger
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => addNodeToBuilder('action')}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Action
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => addNodeToBuilder('condition')}
                >
                  <GitBranch className="h-4 w-4 mr-2" />
                  Condition
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => addNodeToBuilder('delay')}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Delay
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => addNodeToBuilder('email')}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => addNodeToBuilder('notification')}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notification
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => addNodeToBuilder('api')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  API Call
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => addNodeToBuilder('database')}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Database
                </Button>
              </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 bg-gray-50 rounded-lg relative overflow-hidden">
              <div className="absolute inset-0">
                {builderNodes.map((node) => (
                  <div
                    key={node.id}
                    className={`absolute p-3 bg-white border-2 rounded-lg shadow-sm cursor-move ${
                      selectedNode?.id === node.id ? 'border-blue-500' : 'border-gray-300'
                    }`}
                    style={{ left: node.position.x, top: node.position.y }}
                    onClick={() => setSelectedNode(node)}
                  >
                    <div className="flex items-center gap-2">
                      {node.type === 'trigger' && <Play className="h-4 w-4" />}
                      {node.type === 'action' && <Zap className="h-4 w-4" />}
                      {node.type === 'condition' && <GitBranch className="h-4 w-4" />}
                      {node.type === 'delay' && <Clock className="h-4 w-4" />}
                      {node.type === 'email' && <Mail className="h-4 w-4" />}
                      {node.type === 'notification' && <Bell className="h-4 w-4" />}
                      {node.type === 'api' && <ExternalLink className="h-4 w-4" />}
                      {node.type === 'database' && <Database className="h-4 w-4" />}
                      <span className="text-sm font-medium">{node.data.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Properties Panel */}
            <div className="w-64 border-l p-4">
              <h3 className="font-medium mb-4">Properties</h3>
              {selectedNode ? (
                <div className="space-y-4">
                  <div>
                    <Label>Node Type</Label>
                    <div className="text-sm text-muted-foreground">{selectedNode.type}</div>
                  </div>
                  <div>
                    <Label htmlFor="node-label">Label</Label>
                    <Input 
                      id="node-label"
                      value={selectedNode.data.label}
                      onChange={(e) => {
                        const updatedNodes = builderNodes.map(node => 
                          node.id === selectedNode.id 
                            ? { ...node, data: { ...node.data, label: e.target.value } }
                            : node
                        )
                        setBuilderNodes(updatedNodes)
                      }}
                    />
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Configure Node
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      setBuilderNodes(builderNodes.filter(node => node.id !== selectedNode.id))
                      setSelectedNode(null)
                    }}
                  >
                    Delete Node
                  </Button>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Select a node to view its properties
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsBuilderOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              if (selectedWorkflow) {
                handleUpdateWorkflow()
              } else {
                handleCreateWorkflow()
              }
              setIsBuilderOpen(false)
            }}>
              Save Workflow
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Workflow Dialog */}
      <Dialog open={isEditWorkflowOpen} onOpenChange={setIsEditWorkflowOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Workflow</DialogTitle>
            <DialogDescription>Update workflow configuration</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Workflow Name *</Label>
              <Input 
                id="edit-name" 
                value={newWorkflow.name}
                onChange={(e) => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea 
                id="edit-description" 
                value={newWorkflow.description}
                onChange={(e) => setNewWorkflow(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsEditWorkflowOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateWorkflow} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Edit className="h-4 w-4 mr-2" />}
                Update Workflow
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}