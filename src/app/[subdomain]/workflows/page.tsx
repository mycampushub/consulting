"use client"

import { useState, useEffect, useRef } from "react"
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
  RefreshCw,
  Save,
  X,
  Move,
  GripVertical
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
  const [draggingNode, setDraggingNode] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStart, setConnectionStart] = useState<string | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

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

  const saveWorkflowBuilder = async () => {
    if (!selectedWorkflow) {
      alert("Please save the workflow first")
      return
    }

    try {
      const response = await fetch(`/api/${subdomain}/workflows/${selectedWorkflow.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nodes: builderNodes,
          edges: builderEdges
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save workflow')
      }

      alert('Workflow saved successfully!')
      await fetchWorkflowsData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save workflow')
    }
  }

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.preventDefault()
    setDraggingNode(nodeId)
  }

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!draggingNode || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setBuilderNodes(nodes => 
      nodes.map(node => 
        node.id === draggingNode 
          ? { ...node, position: { x, y } }
          : node
      )
    )
  }

  const handleCanvasMouseUp = () => {
    setDraggingNode(null)
  }

  const handleNodeClick = (node: WorkflowNode) => {
    if (isConnecting) {
      if (connectionStart && connectionStart !== node.id) {
        // Create edge
        const newEdge: WorkflowEdge = {
          id: `edge-${connectionStart}-${node.id}`,
          source: connectionStart,
          target: node.id
        }
        setBuilderEdges([...builderEdges, newEdge])
        setIsConnecting(false)
        setConnectionStart(null)
      }
    } else {
      setSelectedNode(node)
    }
  }

  const startConnection = (nodeId: string) => {
    setIsConnecting(true)
    setConnectionStart(nodeId)
  }

  const deleteNode = (nodeId: string) => {
    setBuilderNodes(nodes => nodes.filter(node => node.id !== nodeId))
    setBuilderEdges(edges => edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId))
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null)
    }
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

  const getNodeColor = (type: string) => {
    switch (type) {
      case "trigger": return "bg-green-100 border-green-300 text-green-800"
      case "action": return "bg-blue-100 border-blue-300 text-blue-800"
      case "condition": return "bg-yellow-100 border-yellow-300 text-yellow-800"
      case "delay": return "bg-orange-100 border-orange-300 text-orange-800"
      case "notification": return "bg-purple-100 border-purple-300 text-purple-800"
      case "email": return "bg-indigo-100 border-indigo-300 text-indigo-800"
      case "api": return "bg-pink-100 border-pink-300 text-pink-800"
      case "database": return "bg-gray-100 border-gray-300 text-gray-800"
      default: return "bg-gray-100 border-gray-300 text-gray-800"
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
    <div className="container mx-auto p-6 space-y-6">
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
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateWorkflowOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateWorkflow} disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create Workflow
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
              <Workflow className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalWorkflows}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeWorkflows} active
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalExecutions}</div>
              <p className="text-xs text-muted-foreground">
                Across all workflows
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.successRate}%</div>
              <p className="text-xs text-muted-foreground">
                Average success rate
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Execution Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgExecutionTime}s</div>
              <p className="text-xs text-muted-foreground">
                Per workflow
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="PAUSED">Paused</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by category" />
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
        </CardContent>
      </Card>

      {/* Workflow List */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow List</CardTitle>
          <CardDescription>
            Manage your automated workflows and processes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Executions</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Last Executed</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkflows.map((workflow) => (
                  <TableRow key={workflow.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{workflow.name}</p>
                        {workflow.description && (
                          <p className="text-sm text-muted-foreground">{workflow.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(workflow.category)}
                        <Badge className={getCategoryColor(workflow.category)}>
                          {workflow.category.replace('_', ' ')}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(workflow.status)}>
                        {workflow.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{workflow.executionCount}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {workflow.priority === 0 ? 'Low' : workflow.priority === 1 ? 'Medium' : 'High'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {workflow.lastExecutedAt 
                        ? new Date(workflow.lastExecutedAt).toLocaleDateString()
                        : 'Never'
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openWorkflowBuilder(workflow)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleWorkflow(workflow.id, !workflow.isActive)}
                        >
                          {workflow.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteWorkflow(workflow.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Builder Dialog */}
      <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Workflow Builder</DialogTitle>
            <DialogDescription>
              Design your workflow by dragging and connecting nodes
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex h-[70vh]">
            {/* Sidebar */}
            <div className="w-64 border-r p-4 space-y-4">
              <div>
                <h3 className="font-medium mb-2">Node Types</h3>
                <div className="space-y-2">
                  {(['trigger', 'action', 'condition', 'delay', 'notification', 'email', 'api', 'database'] as const).map((type) => (
                    <Button
                      key={type}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => addNodeToBuilder(type, 50, 50 + Math.random() * 300)}
                    >
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        type === 'trigger' ? 'bg-green-500' :
                        type === 'action' ? 'bg-blue-500' :
                        type === 'condition' ? 'bg-yellow-500' :
                        type === 'delay' ? 'bg-orange-500' :
                        type === 'notification' ? 'bg-purple-500' :
                        type === 'email' ? 'bg-indigo-500' :
                        type === 'api' ? 'bg-pink-500' : 'bg-gray-500'
                      }`} />
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Tools</h3>
                <div className="space-y-2">
                  <Button
                    variant={isConnecting ? "default" : "outline"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setIsConnecting(!isConnecting)}
                  >
                    <GitBranch className="h-4 w-4 mr-2" />
                    {isConnecting ? 'Connecting...' : 'Connect Nodes'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      setBuilderNodes([])
                      setBuilderEdges([])
                      setSelectedNode(null)
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                </div>
              </div>

              {selectedNode && (
                <div>
                  <h3 className="font-medium mb-2">Selected Node</h3>
                  <div className="p-3 border rounded bg-muted/50">
                    <p className="font-medium text-sm">{selectedNode.data.label}</p>
                    <p className="text-xs text-muted-foreground">Type: {selectedNode.type}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => deleteNode(selectedNode.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Node
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Canvas */}
            <div className="flex-1 relative">
              <div
                ref={canvasRef}
                className="w-full h-full bg-gray-50 border-2 border-dashed border-gray-300 relative overflow-hidden"
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
              >
                {/* Render edges */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {builderEdges.map((edge) => {
                    const sourceNode = builderNodes.find(n => n.id === edge.source)
                    const targetNode = builderNodes.find(n => n.id === edge.target)
                    if (!sourceNode || !targetNode) return null

                    return (
                      <line
                        key={edge.id}
                        x1={sourceNode.position.x + 60}
                        y1={sourceNode.position.y + 30}
                        x2={targetNode.position.x + 60}
                        y2={targetNode.position.y + 30}
                        stroke="#6B7280"
                        strokeWidth="2"
                        markerEnd="url(#arrowhead)"
                      />
                    )
                  })}
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon
                        points="0 0, 10 3.5, 0 7"
                        fill="#6B7280"
                      />
                    </marker>
                  </defs>
                </svg>

                {/* Render nodes */}
                {builderNodes.map((node) => (
                  <div
                    key={node.id}
                    className={`absolute border-2 rounded-lg p-3 cursor-move select-none ${getNodeColor(node.type)} ${
                      selectedNode?.id === node.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    style={{
                      left: node.position.x,
                      top: node.position.y,
                      width: 120,
                      height: 60
                    }}
                    onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                    onClick={() => handleNodeClick(node)}
                  >
                    <div className="flex items-center justify-between h-full">
                      <div className="flex-1">
                        <p className="text-xs font-medium truncate">{node.data.label}</p>
                        <p className="text-xs opacity-75">{node.type}</p>
                      </div>
                      <GripVertical className="h-4 w-4 opacity-50" />
                    </div>
                    
                    {/* Connection handle */}
                    <div
                      className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full cursor-crosshair"
                      onClick={(e) => {
                        e.stopPropagation()
                        startConnection(node.id)
                      }}
                    />
                  </div>
                ))}

                {/* Empty state */}
                {builderNodes.length === 0 && (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <Workflow className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Drag nodes from the sidebar to start building</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {isConnecting && 'Click on nodes to connect them'}
              {draggingNode && 'Dragging node...'}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsBuilderOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveWorkflowBuilder}>
                <Save className="h-4 w-4 mr-2" />
                Save Workflow
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}