"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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

import {
  ReactFlow,
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
  MarkerType,
  Position,
  Handle,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { workflowTemplates } from '@/templates/workflow-templates'

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
  sourceHandle?: string
  targetHandle?: string
  label?: string
  type?: 'smoothstep' | 'bezier' | 'straight' | 'step'
  animated?: boolean
  style?: any
  markerEnd?: any
  data?: {
    condition?: string
    validation?: boolean
    errorHandling?: string
    priority?: number
    description?: string
  }
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

  const getStatusIndicator = () => {
    if (data.status === 'error') return 'bg-red-500'
    if (data.status === 'success') return 'bg-green-500'
    if (data.status === 'running') return 'bg-yellow-500'
    return 'bg-gray-400'
  }

  return (
    <div className={`relative group ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}>
      {/* Status indicator */}
      <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getStatusIndicator()} border-2 border-white`}></div>
      
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
        
        {/* Enhanced Connection Handles */}
        {data.inputs && data.inputs.map((input: string, index: number) => (
          <Handle
            key={`input-${index}`}
            type="target"
            position={Position.Left}
            id={`input-${index}`}
            className="w-4 h-4 bg-white border-2 border-current cursor-crosshair hover:scale-110 transition-transform"
          />
        ))}
        
        {data.outputs && data.outputs.map((output: string, index: number) => (
          <Handle
            key={`output-${index}`}
            type="source"
            position={Position.Right}
            id={`output-${index}`}
            className="w-4 h-4 bg-white border-2 border-current cursor-crosshair hover:scale-110 transition-transform"
          />
        ))}
      </div>
      
      {/* Node validation indicator */}
      {data.validationError && (
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {data.validationError}
        </div>
      )}
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
  
  // State management
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
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
    label: edge.label,
    type: edge.type || 'smoothstep',
    animated: edge.animated || false,
    style: edge.style || { stroke: '#3b82f6', strokeWidth: 2 },
    markerEnd: edge.markerEnd || { type: MarkerType.ArrowClosed },
    data: edge.data
  })))
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null)
  const [history, setHistory] = useState<{ nodes: Node[]; edges: Edge[] }[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [edgeType, setEdgeType] = useState<'smoothstep' | 'bezier' | 'straight' | 'step'>('smoothstep')
  const [isNodeConfigOpen, setIsNodeConfigOpen] = useState(false)
  const [isEdgeConfigOpen, setIsEdgeConfigOpen] = useState(false)
  const [isNodeLibraryOpen, setIsNodeLibraryOpen] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  
  const reactFlowInstance = useReactFlow()

  // Save current state to history
  const saveToHistory = useCallback(() => {
    const currentState = { nodes: [...nodes], edges: [...edges] }
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(currentState)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [nodes, edges, history, historyIndex])

  // Undo functionality
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1]
      setNodes(previousState.nodes)
      setEdges(previousState.edges)
      setHistoryIndex(historyIndex - 1)
    }
  }, [history, historyIndex])

  // Redo functionality
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1]
      setNodes(nextState.nodes)
      setEdges(nextState.edges)
      setHistoryIndex(historyIndex + 1)
    }
  }, [history, historyIndex])

  // Initialize history on mount
  useEffect(() => {
    saveToHistory()
  }, [])

  // Validate workflow
  const validateWorkflow = useCallback(() => {
    const errors: string[] = []
    
    // Check for orphaned nodes
    const connectedNodeIds = new Set()
    edges.forEach(edge => {
      connectedNodeIds.add(edge.source)
      connectedNodeIds.add(edge.target)
    })
    
    nodes.forEach(node => {
      if (node.data.type === 'trigger' && !edges.some(edge => edge.source === node.id)) {
        errors.push(`Trigger node "${node.data.label}" has no outgoing connections`)
      }
      if (node.data.type !== 'trigger' && !edges.some(edge => edge.target === node.id)) {
        errors.push(`Node "${node.data.label}" has no incoming connections`)
      }
    })

    // Check for circular connections
    const visited = new Set()
    const recursionStack = new Set()
    
    const hasCycle = (nodeId: string): boolean => {
      if (recursionStack.has(nodeId)) return true
      if (visited.has(nodeId)) return false
      
      visited.add(nodeId)
      recursionStack.add(nodeId)
      
      const outgoingEdges = edges.filter(edge => edge.source === nodeId)
      for (const edge of outgoingEdges) {
        if (hasCycle(edge.target)) return true
      }
      
      recursionStack.delete(nodeId)
      return false
    }
    
    nodes.forEach(node => {
      if (hasCycle(node.id)) {
        errors.push(`Circular dependency detected involving node "${node.data.label}"`)
      }
    })

    setValidationErrors(errors)
    return errors.length === 0
  }, [nodes, edges])

  // Auto-validate on changes
  useEffect(() => {
    validateWorkflow()
  }, [nodes, edges, validateWorkflow])

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds))
      saveToHistory()
    },
    [saveToHistory]
  )
  
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds))
      saveToHistory()
    },
    [saveToHistory]
  )

  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        const sourceNode = nodes.find(n => n.id === connection.source)
        const targetNode = nodes.find(n => n.id === connection.target)
        
        if (sourceNode && targetNode) {
          // Validate connection
          const sourceOutputs = sourceNode.data.outputs || []
          const targetInputs = targetNode.data.inputs || []
          
          if (sourceOutputs.length === 0) {
            alert('Source node has no outputs')
            return
          }
          
          if (targetInputs.length === 0) {
            alert('Target node has no inputs')
            return
          }
          
          const newEdge: Edge = {
            id: `edge-${connection.source}-${connection.target}-${Date.now()}`,
            source: connection.source,
            target: connection.target,
            sourceHandle: connection.sourceHandle,
            targetHandle: connection.targetHandle,
            type: edgeType,
            animated: true,
            style: { stroke: '#3b82f6', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed },
            data: {
              condition: '',
              validation: true,
              errorHandling: 'stop',
              priority: 1,
              description: ''
            }
          }
          
          setEdges((eds) => addEdge(newEdge, eds))
          saveToHistory()
        }
      }
    },
    [nodes, edgeType, saveToHistory]
  )

  const addNode = (type: WorkflowNode['type'], config: any = {}) => {
    const nodeConfigs: Record<string, any> = {
      trigger: {
        label: 'Trigger',
        description: 'Start the workflow',
        icon: Zap,
        category: 'Triggers',
        inputs: [],
        outputs: ['trigger'],
        config: {
          triggerType: 'manual',
          schedule: '',
          webhookUrl: ''
        }
      },
      action: {
        label: 'Action',
        description: 'Perform an action',
        icon: Play,
        category: 'Actions',
        inputs: ['input'],
        outputs: ['success', 'error'],
        config: {
          actionType: 'custom',
          parameters: {}
        }
      },
      condition: {
        label: 'Condition',
        description: 'Conditional logic',
        icon: GitBranch,
        category: 'Logic',
        inputs: ['input'],
        outputs: ['true', 'false'],
        config: {
          condition: '',
          truePath: '',
          falsePath: ''
        }
      },
      delay: {
        label: 'Delay',
        description: 'Wait for specified time',
        icon: Clock,
        category: 'Timing',
        inputs: ['input'],
        outputs: ['output'],
        config: {
          duration: 0,
          unit: 'seconds'
        }
      },
      notification: {
        label: 'Notification',
        description: 'Send notification',
        icon: Bell,
        category: 'Communication',
        inputs: ['input'],
        outputs: ['success', 'error'],
        config: {
          type: 'in-app',
          message: '',
          recipients: []
        }
      },
      email: {
        label: 'Email',
        description: 'Send email',
        icon: Mail,
        category: 'Communication',
        inputs: ['input'],
        outputs: ['success', 'error'],
        config: {
          to: '',
          subject: '',
          body: '',
          template: ''
        }
      },
      api: {
        label: 'API Call',
        description: 'Call external API',
        icon: Code,
        category: 'Integration',
        inputs: ['input'],
        outputs: ['success', 'error'],
        config: {
          url: '',
          method: 'POST',
          headers: {},
          body: {}
        }
      },
      database: {
        label: 'Database',
        description: 'Database operation',
        icon: DatabaseIcon,
        category: 'Data',
        inputs: ['input'],
        outputs: ['success', 'error'],
        config: {
          operation: 'select',
          table: '',
          query: ''
        }
      },
      webhook: {
        label: 'Webhook',
        description: 'Receive webhook',
        icon: Radio,
        category: 'Triggers',
        inputs: [],
        outputs: ['data'],
        config: {
          endpoint: '',
          secret: ''
        }
      },
      transform: {
        label: 'Transform',
        description: 'Transform data',
        icon: RefreshCw,
        category: 'Data',
        inputs: ['input'],
        outputs: ['output'],
        config: {
          transformation: '',
          mapping: {}
        }
      },
      filter: {
        label: 'Filter',
        description: 'Filter data',
        icon: Filter,
        category: 'Data',
        inputs: ['input'],
        outputs: ['matched', 'unmatched'],
        config: {
          criteria: '',
          condition: ''
        }
      },
      loop: {
        label: 'Loop',
        description: 'Loop through items',
        icon: Repeat,
        category: 'Logic',
        inputs: ['input'],
        outputs: ['each', 'complete'],
        config: {
          collection: '',
          variable: '',
          maxIterations: 100
        }
      },
      parallel: {
        label: 'Parallel',
        description: 'Execute in parallel',
        icon: GitBranch,
        category: 'Logic',
        inputs: ['input'],
        outputs: ['output1', 'output2', 'output3'],
        config: {
          branches: 3,
          waitForAll: true
        }
      },
      http: {
        label: 'HTTP Request',
        description: 'Make HTTP request',
        icon: Globe,
        category: 'Integration',
        inputs: ['input'],
        outputs: ['success', 'error'],
        config: {
          url: '',
          method: 'GET',
          headers: {},
          body: {}
        }
      },
      ai: {
        label: 'AI Processing',
        description: 'AI-powered processing',
        icon: Brain,
        category: 'AI',
        inputs: ['input'],
        outputs: ['result', 'error'],
        config: {
          model: 'gpt-4',
          prompt: '',
          temperature: 0.7
        }
      },
      integration: {
        label: 'Integration',
        description: 'Third-party integration',
        icon: Plug,
        category: 'Integration',
        inputs: ['input'],
        outputs: ['success', 'error'],
        config: {
          service: '',
          action: '',
          credentials: {}
        }
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
        type,
        status: 'idle',
        validationError: null
      }
    }

    setNodes((nds) => [...nds, newNode])
    saveToHistory()
  }

  // Load template to canvas
  const loadTemplate = (templateId: string) => {
    const template = workflowTemplates.find(t => t.id === templateId)
    if (!template) {
      alert('Template not found')
      return
    }

    // Convert template nodes to ReactFlow nodes
    const templateNodes = template.nodes.map(node => ({
      id: node.id,
      type: 'custom',
      position: node.position,
      data: {
        ...node.data,
        status: 'idle',
        validationError: null
      }
    }))

    // Convert template edges to ReactFlow edges
    const templateEdges = template.edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      label: edge.label,
      type: edge.type || 'smoothstep',
      animated: edge.animated || false,
      style: { stroke: '#3b82f6', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed },
      data: edge.data
    }))

    // Clear existing nodes and edges, then load template
    setNodes(templateNodes)
    setEdges(templateEdges)
    saveToHistory()
    
    // Show success message
    alert(`Template "${template.name}" loaded successfully!`)
  }

  const saveWorkflow = () => {
    if (!validateWorkflow()) {
      alert('Please fix validation errors before saving')
      return
    }

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
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      label: edge.label,
      type: edge.type,
      animated: edge.animated,
      style: edge.style,
      markerEnd: edge.markerEnd,
      data: edge.data
    }))
    onSave(workflowNodes, workflowEdges)
  }

  const clearCanvas = () => {
    setNodes([])
    setEdges([])
    setSelectedNode(null)
    setSelectedEdge(null)
    setValidationErrors([])
    saveToHistory()
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
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        label: edge.label,
        type: edge.type,
        animated: edge.animated,
        style: edge.style,
        markerEnd: edge.markerEnd,
        data: edge.data
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

  const importWorkflow = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const workflowData = JSON.parse(e.target?.result as string)
        
        if (workflowData.nodes && Array.isArray(workflowData.nodes)) {
          const importedNodes = workflowData.nodes.map((node: any) => ({
            id: node.id,
            type: 'custom',
            position: node.position,
            data: node.data
          }))
          
          const importedEdges = (workflowData.edges || []).map((edge: any) => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            sourceHandle: edge.sourceHandle,
            targetHandle: edge.targetHandle,
            label: edge.label,
            type: edge.type || 'smoothstep',
            animated: edge.animated || false,
            style: edge.style || { stroke: '#3b82f6', strokeWidth: 2 },
            markerEnd: edge.markerEnd || { type: MarkerType.ArrowClosed },
            data: edge.data
          }))
          
          setNodes(importedNodes)
          setEdges(importedEdges)
          saveToHistory()
        }
      } catch (error) {
        alert('Invalid workflow file')
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  const simulateWorkflow = () => {
    if (!validateWorkflow()) {
      alert('Please fix validation errors before simulation')
      return
    }

    // Simulate workflow execution
    const updatedNodes = nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        status: 'running'
      }
    }))
    
    setNodes(updatedNodes)
    
    // Simulate execution steps
    setTimeout(() => {
      const finalNodes = updatedNodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          status: Math.random() > 0.2 ? 'success' : 'error'
        }
      }))
      setNodes(finalNodes)
    }, 2000)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-background p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Workflow Builder</h2>
            <Badge variant="outline">{nodes.length} nodes, {edges.length} connections</Badge>
            {validationErrors.length > 0 && (
              <Badge variant="destructive">{validationErrors.length} errors</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={undo} disabled={historyIndex <= 0}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Undo
            </Button>
            <Button variant="outline" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1}>
              <ArrowRight className="w-4 h-4 mr-2" />
              Redo
            </Button>
            <Button variant="outline" size="sm" onClick={simulateWorkflow}>
              <Play className="w-4 h-4 mr-2" />
              Simulate
            </Button>
            <Button variant="outline" size="sm" onClick={exportWorkflow}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <label className="cursor-pointer">
              <Button variant="outline" size="sm" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </span>
              </Button>
              <input type="file" accept=".json" onChange={importWorkflow} className="hidden" />
            </label>
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

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="border-b bg-destructive/10 p-4">
          <div className="max-w-4xl">
            <h4 className="font-medium text-sm text-destructive mb-2">Validation Errors:</h4>
            <ul className="text-xs text-destructive space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Node Library - Collapsible Panel */}
        <div className={`lg:w-80 border-r bg-muted/30 p-4 overflow-y-auto transition-all duration-300 ${isNodeLibraryOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Node Library</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsNodeLibraryOpen(!isNodeLibraryOpen)}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Templates Section */}
          <div className="mb-6">
            <h4 className="font-medium text-sm mb-3">Ready-to-use Templates</h4>
            <div className="space-y-2">
              {workflowTemplates.map((template) => {
                // Get the icon component from lucide-react
                const IconComponent = (() => {
                  switch (template.icon) {
                    case 'Users': return Users
                    case 'Target': return Target
                    case 'MessageSquare': return MessageSquare
                    case 'Bell': return Bell
                    case 'FileText': return FileText
                    default: return Zap
                  }
                })()
                
                return (
                  <Card 
                    key={template.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => loadTemplate(template.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4 text-primary" />
                        <div className="flex-1">
                          <h5 className="font-medium text-xs">{template.name}</h5>
                          <p className="text-xs text-muted-foreground">{template.description}</p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {template.category}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

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

          {/* Edge Type Selector */}
          <div className="mt-6">
            <h3 className="font-medium mb-3">Connection Style</h3>
            <Select value={edgeType} onValueChange={(value: any) => setEdgeType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="smoothstep">Smooth Step</SelectItem>
                <SelectItem value="bezier">Bezier</SelectItem>
                <SelectItem value="straight">Straight</SelectItem>
                <SelectItem value="step">Step</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 relative">
          {/* Mobile Node Library Toggle */}
          {!isNodeLibraryOpen && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsNodeLibraryOpen(true)}
              className="absolute top-4 left-4 z-10 lg:hidden"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nodes
            </Button>
          )}

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => {
              setSelectedNode(node)
              setSelectedEdge(null)
              setIsNodeConfigOpen(true)
            }}
            onEdgeClick={(_, edge) => {
              setSelectedEdge(edge)
              setSelectedNode(null)
              setIsEdgeConfigOpen(true)
            }}
            onPaneClick={() => {
              setSelectedNode(null)
              setSelectedEdge(null)
              setIsNodeConfigOpen(false)
              setIsEdgeConfigOpen(false)
            }}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
            connectionMode="loose"
          >
            <Controls />
            <MiniMap />
            <Background variant="dots" gap={12} size={1} />
            <Panel position="top-right">
              <div className="bg-background/95 backdrop-blur border rounded-lg p-2 space-y-1">
                <div className="text-xs text-muted-foreground">
                  Drag nodes to connect them
                </div>
                <div className="text-xs text-muted-foreground">
                  Click nodes/edges to configure
                </div>
                {validationErrors.length > 0 && (
                  <div className="text-xs text-destructive">
                    {validationErrors.length} validation errors
                  </div>
                )}
              </div>
            </Panel>
          </ReactFlow>
        </div>
      </div>

      {/* Node Configuration Dialog */}
      <Dialog open={isNodeConfigOpen} onOpenChange={setIsNodeConfigOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Node Configuration</DialogTitle>
            <DialogDescription>
              Configure the selected workflow node
            </DialogDescription>
          </DialogHeader>
          {selectedNode && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {selectedNode.data.icon && <selectedNode.data.icon className="w-5 h-5" />}
                <span className="font-medium">{selectedNode.data.label}</span>
              </div>
              
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
                      saveToHistory()
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
                      saveToHistory()
                    }}
                    rows={2}
                    className="text-xs"
                  />
                </div>

                {selectedNode.data.config && (
                  <div>
                    <Label className="text-xs">Configuration</Label>
                    <Textarea 
                      value={JSON.stringify(selectedNode.data.config, null, 2)} 
                      onChange={(e) => {
                        try {
                          const config = JSON.parse(e.target.value)
                          setNodes(nodes.map(node => 
                            node.id === selectedNode.id 
                              ? { ...node, data: { ...node.data, config } }
                              : node
                          ))
                          saveToHistory()
                        } catch {
                          // Invalid JSON, ignore
                        }
                      }}
                      rows={4}
                      className="text-xs font-mono"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNodeConfigOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                if (selectedNode) {
                  setNodes(nodes.filter(node => node.id !== selectedNode.id))
                  setEdges(edges.filter(edge => edge.source !== selectedNode.id && edge.target !== selectedNode.id))
                  setSelectedNode(null)
                  setIsNodeConfigOpen(false)
                  saveToHistory()
                }
              }}
            >
              Delete Node
            </Button>
            <Button onClick={() => setIsNodeConfigOpen(false)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edge Configuration Dialog */}
      <Dialog open={isEdgeConfigOpen} onOpenChange={setIsEdgeConfigOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Connection Configuration</DialogTitle>
            <DialogDescription>
              Configure the selected workflow connection
            </DialogDescription>
          </DialogHeader>
          {selectedEdge && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div>
                  <Label className="text-xs">Label</Label>
                  <Input 
                    value={selectedEdge.label || ''} 
                    onChange={(e) => {
                      setEdges(edges.map(edge => 
                        edge.id === selectedEdge.id 
                          ? { ...edge, label: e.target.value }
                          : edge
                      ))
                      saveToHistory()
                    }}
                    className="h-8 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs">Condition (for conditional edges)</Label>
                  <Input 
                    value={selectedEdge.data?.condition || ''} 
                    onChange={(e) => {
                      setEdges(edges.map(edge => 
                        edge.id === selectedEdge.id 
                          ? { 
                              ...edge, 
                              data: { 
                                ...edge.data, 
                                condition: e.target.value 
                              } 
                            }
                          : edge
                      ))
                      saveToHistory()
                    }}
                    className="h-8 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs">Priority</Label>
                  <Input 
                    type="number"
                    value={selectedEdge.data?.priority || 1} 
                    onChange={(e) => {
                      setEdges(edges.map(edge => 
                        edge.id === selectedEdge.id 
                          ? { 
                              ...edge, 
                              data: { 
                                ...edge.data, 
                                priority: parseInt(e.target.value) || 1 
                              } 
                            }
                          : edge
                      ))
                      saveToHistory()
                    }}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEdgeConfigOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                if (selectedEdge) {
                  setEdges(edges.filter(edge => edge.id !== selectedEdge.id))
                  setSelectedEdge(null)
                  setIsEdgeConfigOpen(false)
                  saveToHistory()
                }
              }}
            >
              Delete Connection
            </Button>
            <Button onClick={() => setIsEdgeConfigOpen(false)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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