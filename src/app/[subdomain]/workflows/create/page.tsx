"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ArrowLeft,
  Save,
  X,
  Plus,
  Search,
  Filter,
  Play,
  Pause,
  Square,
  Edit,
  Trash2,
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
  Move,
  GripVertical,
  Users,
  Phone,
  MessageCircle,
  Send,
  MapPin,
  CreditCard,
  FileSignature,
  CalendarCheck,
  CheckSquare,
  AlertCircle,
  Info,
  HelpCircle,
  Video,
  Image,
  Link,
  Share2,
  Download,
  Upload,
  Code,
  Database as DatabaseIcon,
  Server,
  Cloud,
  Lock,
  Unlock,
  Key,
  Shield,
  Wifi,
  Bluetooth,
  Smartphone,
  Tablet,
  Monitor,
  Printer,
  Camera,
  Mic,
  Music,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  CloudRain,
  CloudSnow,
  Wind,
  Thermometer,
  Droplets,
  Zap as ZapIcon,
  Battery,
  Plug,
  Radio,
  Tv,
  Gamepad2,
  Headphones,
  Watch,
  Car,
  Plane,
  Train,
  Ship,
  Bike,
  Home,
  Building,
  Store,
  Utensils,
  Coffee,
  Pizza,
  Heart,
  Smile,
  Frown,
  Meh,
  Angry,
  Laugh,
  Kiss,
  Star as StarIcon,
  Award,
  Trophy,
  Medal,
  Crown,
  Gem,
  Diamond,
  Circle,
  Square,
  Triangle,
  Hexagon,
  Pentagon,
  Octagon,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ArrowUpRight,
  ArrowUpLeft,
  ArrowDownRight,
  ArrowDownLeft,
  Minus,
  Plus as PlusIcon,
  Divide,
  Multiply,
  Equal,
  NotEqual,
  GreaterThan,
  LessThan,
  GreaterThanOrEqual,
  LessThanOrEqual,
  Parentheses,
  Bracket,
  Brace,
  AngleBracket,
  Quote,
  DoubleQuote,
  Apostrophe,
  Hyphen,
  Underscore,
  Dot,
  Comma,
  Semicolon,
  Colon,
  Exclamation,
  Question,
  Hash,
  Dollar,
  Percent,
  Ampersand,
  Asterisk,
  Slash,
  Backslash,
  Pipe,
  Tilde,
  Grave,
  Circumflex,
  Degree,
  PlusMinus,
  Infinity,
  Pi,
  Sigma,
  Omega,
  Alpha,
  Beta,
  Gamma,
  Delta,
  Epsilon,
  Zeta,
  Eta,
  Theta,
  Iota,
  Kappa,
  Lambda,
  Mu,
  Nu,
  Xi,
  Omicron,
  Rho,
  Sigma as SigmaIcon,
  Tau,
  Upsilon,
  Phi,
  Chi,
  Psi,
  Omega as OmegaIcon,
  Brain,
  Repeat,
  Globe
} from "lucide-react"

import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  NodeTypes,
  EdgeTypes,
  MiniMap,
  Panel,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow'
import 'reactflow/dist/style.css'

interface WorkflowNode {
  id: string
  type: 'trigger' | 'action' | 'condition' | 'delay' | 'notification' | 'email' | 'api' | 'database' | 'webhook' | 'transform' | 'filter' | 'loop' | 'parallel' | 'http' | 'ai' | 'integration'
  position: { x: number; y: number }
  data: {
    label: string
    config?: Record<string, any>
    description?: string
    icon?: any
    category?: string
    inputs?: string[]
    outputs?: string[]
  }
}

interface WorkflowEdge {
  id: string
  source: string
  target: string
  label?: string
  type?: string
  animated?: boolean
  style?: any
}

// Custom Node Component
const CustomNode = ({ data, selected }: { data: any; selected: boolean }) => {
  const getNodeStyle = (type: string) => {
    switch (type) {
      case 'trigger': return 'bg-gradient-to-r from-green-400 to-green-600 border-green-700'
      case 'action': return 'bg-gradient-to-r from-blue-400 to-blue-600 border-blue-700'
      case 'condition': return 'bg-gradient-to-r from-yellow-400 to-yellow-600 border-yellow-700'
      case 'delay': return 'bg-gradient-to-r from-orange-400 to-orange-600 border-orange-700'
      case 'notification': return 'bg-gradient-to-r from-purple-400 to-purple-600 border-purple-700'
      case 'email': return 'bg-gradient-to-r from-indigo-400 to-indigo-600 border-indigo-700'
      case 'api': return 'bg-gradient-to-r from-pink-400 to-pink-600 border-pink-700'
      case 'database': return 'bg-gradient-to-r from-gray-400 to-gray-600 border-gray-700'
      case 'webhook': return 'bg-gradient-to-r from-red-400 to-red-600 border-red-700'
      case 'transform': return 'bg-gradient-to-r from-teal-400 to-teal-600 border-teal-700'
      case 'filter': return 'bg-gradient-to-r from-cyan-400 to-cyan-600 border-cyan-700'
      case 'loop': return 'bg-gradient-to-r from-amber-400 to-amber-600 border-amber-700'
      case 'parallel': return 'bg-gradient-to-r from-lime-400 to-lime-600 border-lime-700'
      case 'http': return 'bg-gradient-to-r from-rose-400 to-rose-600 border-rose-700'
      case 'ai': return 'bg-gradient-to-r from-violet-400 to-violet-600 border-violet-700'
      case 'integration': return 'bg-gradient-to-r from-emerald-400 to-emerald-600 border-emerald-700'
      default: return 'bg-gradient-to-r from-gray-400 to-gray-600 border-gray-700'
    }
  }

  return (
    <div className={`relative group ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}>
      <div className={`${getNodeStyle(data.type)} text-white border-2 rounded-lg p-4 min-w-[200px] shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {data.icon && <data.icon className="w-5 h-5" />}
            <h3 className="font-semibold text-sm">{data.label}</h3>
          </div>
          <div className="flex gap-1">
            {data.inputs && data.inputs.length > 0 && (
              <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
            )}
            {data.outputs && data.outputs.length > 0 && (
              <div className="w-2 h-2 bg-green-300 rounded-full"></div>
            )}
          </div>
        </div>
        {data.description && (
          <p className="text-xs opacity-90 mb-2">{data.description}</p>
        )}
        {data.category && (
          <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
            {data.category}
          </Badge>
        )}
        
        {/* Connection handles */}
        <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-current cursor-crosshair"></div>
        <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-current cursor-crosshair"></div>
      </div>
    </div>
  )
}

// Node types
const nodeTypes: NodeTypes = {
  custom: CustomNode,
}

// Workflow Builder Component
const WorkflowBuilder = ({ 
  initialNodes, 
  initialEdges, 
  onSave,
  onClose 
}: { 
  initialNodes: WorkflowNode[]; 
  initialEdges: WorkflowEdge[]; 
  onSave: (nodes: WorkflowNode[], edges: WorkflowEdge[]) => void;
  onClose: () => void;
}) => {
  // Ensure initialNodes and initialEdges are arrays
  const safeInitialNodes = Array.isArray(initialNodes) ? initialNodes : []
  const safeInitialEdges = Array.isArray(initialEdges) ? initialEdges : []
  
  const [nodes, setNodes] = useState<Node[]>(safeInitialNodes.map(node => ({
    id: node.id,
    type: 'custom',
    position: node.position,
    data: node.data
  })))
  const [edges, setEdges] = useState<Edge[]>(safeInitialEdges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    type: edge.type || 'smoothstep',
    animated: edge.animated || false,
    style: edge.style
  })))
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const reactFlowInstance = useReactFlow()

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  )
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  )
  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        const newEdge = {
          id: `edge-${connection.source}-${connection.target}`,
          source: connection.source,
          target: connection.target,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#3b82f6', strokeWidth: 2 }
        }
        setEdges((eds) => addEdge(newEdge, eds))
      }
    },
    []
  )

  const addNode = (type: WorkflowNode['type'], config: any = {}) => {
    const nodeConfigs: Record<string, any> = {
      trigger: {
        label: 'Trigger',
        description: 'Start the workflow',
        icon: Zap,
        category: 'Triggers',
        inputs: [],
        outputs: ['trigger']
      },
      action: {
        label: 'Action',
        description: 'Perform an action',
        icon: Play,
        category: 'Actions',
        inputs: ['input'],
        outputs: ['success', 'error']
      },
      condition: {
        label: 'Condition',
        description: 'Conditional logic',
        icon: GitBranch,
        category: 'Logic',
        inputs: ['input'],
        outputs: ['true', 'false']
      },
      delay: {
        label: 'Delay',
        description: 'Wait for specified time',
        icon: Clock,
        category: 'Timing',
        inputs: ['input'],
        outputs: ['output']
      },
      notification: {
        label: 'Notification',
        description: 'Send notification',
        icon: Bell,
        category: 'Communication',
        inputs: ['input'],
        outputs: ['success', 'error']
      },
      email: {
        label: 'Email',
        description: 'Send email',
        icon: Mail,
        category: 'Communication',
        inputs: ['input'],
        outputs: ['success', 'error']
      },
      api: {
        label: 'API Call',
        description: 'Call external API',
        icon: Code,
        category: 'Integration',
        inputs: ['input'],
        outputs: ['success', 'error']
      },
      database: {
        label: 'Database',
        description: 'Database operation',
        icon: DatabaseIcon,
        category: 'Data',
        inputs: ['input'],
        outputs: ['success', 'error']
      },
      webhook: {
        label: 'Webhook',
        description: 'Receive webhook',
        icon: Radio,
        category: 'Triggers',
        inputs: [],
        outputs: ['data']
      },
      transform: {
        label: 'Transform',
        description: 'Transform data',
        icon: RefreshCw,
        category: 'Data',
        inputs: ['input'],
        outputs: ['output']
      },
      filter: {
        label: 'Filter',
        description: 'Filter data',
        icon: Filter,
        category: 'Data',
        inputs: ['input'],
        outputs: ['matched', 'unmatched']
      },
      loop: {
        label: 'Loop',
        description: 'Loop through items',
        icon: Repeat,
        category: 'Logic',
        inputs: ['input'],
        outputs: ['each', 'complete']
      },
      parallel: {
        label: 'Parallel',
        description: 'Execute in parallel',
        icon: GitBranch,
        category: 'Logic',
        inputs: ['input'],
        outputs: ['output1', 'output2', 'output3']
      },
      http: {
        label: 'HTTP Request',
        description: 'Make HTTP request',
        icon: Globe,
        category: 'Integration',
        inputs: ['input'],
        outputs: ['success', 'error']
      },
      ai: {
        label: 'AI Processing',
        description: 'AI-powered processing',
        icon: Brain,
        category: 'AI',
        inputs: ['input'],
        outputs: ['result', 'error']
      },
      integration: {
        label: 'Integration',
        description: 'Third-party integration',
        icon: Plug,
        category: 'Integration',
        inputs: ['input'],
        outputs: ['success', 'error']
      }
    }

    const nodeConfig = nodeConfigs[type] || nodeConfigs.action
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type: 'custom',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        ...nodeConfig,
        ...config,
        type
      }
    }

    setNodes((nds) => [...nds, newNode])
  }

  const saveWorkflow = () => {
    const workflowNodes: WorkflowNode[] = nodes.map(node => ({
      id: node.id,
      type: node.data.type,
      position: node.position,
      data: node.data
    }))
    const workflowEdges: WorkflowEdge[] = edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      type: edge.type,
      animated: edge.animated,
      style: edge.style
    }))
    onSave(workflowNodes, workflowEdges)
  }

  const clearCanvas = () => {
    setNodes([])
    setEdges([])
    setSelectedNode(null)
  }

  const exportWorkflow = () => {
    const workflowData = {
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.data.type,
        position: node.position,
        data: node.data
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        type: edge.type,
        animated: edge.animated,
        style: edge.style
      }))
    }
    
    const blob = new Blob([JSON.stringify(workflowData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'workflow.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-background p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Workflow Builder</h2>
            <Badge variant="outline">{nodes.length} nodes, {edges.length} connections</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportWorkflow}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={clearCanvas}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
            <Button onClick={saveWorkflow}>
              <Save className="w-4 h-4 mr-2" />
              Save Workflow
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Node Palette */}
        <div className="w-80 border-r bg-muted/30 p-4 overflow-y-auto">
          <h3 className="font-medium mb-4">Node Library</h3>
          <div className="space-y-4">
            {[
              { name: 'Triggers', nodes: ['trigger', 'webhook'], icon: Zap },
              { name: 'Actions', nodes: ['action', 'email', 'notification'], icon: Play },
              { name: 'Logic', nodes: ['condition', 'loop', 'parallel'], icon: GitBranch },
              { name: 'Data', nodes: ['transform', 'filter', 'database'], icon: DatabaseIcon },
              { name: 'Integration', nodes: ['api', 'http', 'webhook', 'integration'], icon: Plug },
              { name: 'AI', nodes: ['ai'], icon: Brain },
              { name: 'Timing', nodes: ['delay'], icon: Clock },
              { name: 'Communication', nodes: ['email', 'notification'], icon: MessageSquare }
            ].map((category, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <category.icon className="w-4 h-4" />
                  <h4 className="font-medium text-sm">{category.name}</h4>
                </div>
                <div className="space-y-1">
                  {category.nodes.map((nodeType) => (
                    <Button
                      key={nodeType}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs"
                      onClick={() => addNode(nodeType as WorkflowNode['type'])}
                    >
                      {nodeType.charAt(0).toUpperCase() + nodeType.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Selected Node Configuration */}
          {selectedNode && (
            <div className="mt-6">
              <h3 className="font-medium mb-3">Node Configuration</h3>
              <div className="border rounded-lg p-3 bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  {selectedNode.data.icon && <selectedNode.data.icon className="w-4 h-4" />}
                  <span className="font-medium text-sm">{selectedNode.data.label}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{selectedNode.data.description}</p>
                
                <div className="space-y-2">
                  <div>
                    <Label className="text-xs">Label</Label>
                    <Input 
                      value={selectedNode.data.label} 
                      onChange={(e) => {
                        setNodes(nodes.map(node => 
                          node.id === selectedNode.id 
                            ? { ...node, data: { ...node.data, label: e.target.value } }
                            : node
                        ))
                      }}
                      className="h-8 text-xs"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-xs">Description</Label>
                    <Textarea 
                      value={selectedNode.data.description || ''} 
                      onChange={(e) => {
                        setNodes(nodes.map(node => 
                          node.id === selectedNode.id 
                            ? { ...node, data: { ...node.data, description: e.target.value } }
                            : node
                        ))
                      }}
                      rows={2}
                      className="text-xs"
                    />
                  </div>

                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setNodes(nodes.filter(node => node.id !== selectedNode.id))
                      setEdges(edges.filter(edge => edge.source !== selectedNode.id && edge.target !== selectedNode.id))
                      setSelectedNode(null)
                    }}
                  >
                    <Trash2 className="w-3 h-3 mr-2" />
                    Delete Node
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => setSelectedNode(node)}
            onPaneClick={() => setSelectedNode(null)}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
          >
            <Controls />
            <MiniMap />
            <Background variant="dots" gap={12} size={1} />
            <Panel position="top-right">
              <div className="bg-background/95 backdrop-blur border rounded-lg p-2">
                <div className="text-xs text-muted-foreground">
                  Drag nodes to connect them
                </div>
              </div>
            </Panel>
          </ReactFlow>
        </div>
      </div>
    </div>
  )
}

export default function CreateWorkflowPage() {
  const params = useParams()
  const router = useRouter()
  const subdomain = params.subdomain as string
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  
  // Form state
  const [workflowData, setWorkflowData] = useState({
    name: "",
    description: "",
    category: "GENERAL" as 'GENERAL' | 'LEAD_NURTURING' | 'STUDENT_ONBOARDING' | 'FOLLOW_UP' | 'NOTIFICATION' | 'INTEGRATION' | 'MARKETING' | 'SALES' | 'SUPPORT',
    triggers: [] as any[],
    nodes: [] as WorkflowNode[],
    edges: [] as WorkflowEdge[],
    isActive: false,
    priority: 0
  })

  const handleSaveWorkflow = async (nodes: WorkflowNode[], edges: WorkflowEdge[]) => {
    if (!workflowData.name) {
      alert("Workflow name is required")
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/${subdomain}/workflows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: workflowData.name,
          description: workflowData.description || undefined,
          category: workflowData.category,
          triggers: workflowData.triggers,
          nodes: JSON.stringify(nodes),
          edges: JSON.stringify(edges),
          isActive: workflowData.isActive,
          priority: workflowData.priority
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        if (response.status === 404) {
          throw new Error(`Agency "${subdomain}" not found. Please check the URL or contact support.`)
        } else {
          throw new Error(errorData.error || `Failed to create workflow (Status: ${response.status})`)
        }
      }

      // Redirect to workflows page
      router.push(`/${subdomain}/workflows`)
      
    } catch (err) {
      console.error('Error creating workflow:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/${subdomain}/workflows`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Workflows
          </Button>
          <div className="flex-1">
            <h1 className="font-semibold">Create Workflow</h1>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="border-b bg-background p-4">
        <div className="container max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="name">Workflow Name *</Label>
              <Input
                id="name"
                value={workflowData.name}
                onChange={(e) => setWorkflowData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter workflow name"
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={workflowData.category} onValueChange={(value) => setWorkflowData(prev => ({ ...prev, category: value as any }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GENERAL">General</SelectItem>
                  <SelectItem value="LEAD_NURTURING">Lead Nurturing</SelectItem>
                  <SelectItem value="STUDENT_ONBOARDING">Student Onboarding</SelectItem>
                  <SelectItem value="FOLLOW_UP">Follow Up</SelectItem>
                  <SelectItem value="NOTIFICATION">Notification</SelectItem>
                  <SelectItem value="INTEGRATION">Integration</SelectItem>
                  <SelectItem value="MARKETING">Marketing</SelectItem>
                  <SelectItem value="SALES">Sales</SelectItem>
                  <SelectItem value="SUPPORT">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={workflowData.description}
                onChange={(e) => setWorkflowData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter workflow description"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="border-b bg-destructive/10 p-4">
          <div className="container max-w-4xl">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        </div>
      )}

      {/* Workflow Builder */}
      <div className="flex-1">
        <ReactFlowProvider>
          <WorkflowBuilder
            initialNodes={workflowData.nodes}
            initialEdges={workflowData.edges}
            onSave={handleSaveWorkflow}
            onClose={() => router.push(`/${subdomain}/workflows`)}
          />
        </ReactFlowProvider>
      </div>
    </div>
  )
}