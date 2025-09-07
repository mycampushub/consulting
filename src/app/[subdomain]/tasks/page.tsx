"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
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
import { Progress } from "@/components/ui/progress"
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  Clock,
  User,
  CheckCircle,
  Circle,
  AlertTriangle,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Users,
  Target,
  RotateCcw,
  Settings,
  BarChart3,
  ListTodo,
  Timer,
  Paperclip,
  MessageSquare,
  Bell,
  ArrowUpDown
} from "lucide-react"

interface Task {
  id: string
  title: string
  description?: string
  type: string
  category: string
  status: string
  priority: string
  progress: number
  dueDate?: string
  dueTime?: string
  estimatedHours?: number
  actualHours?: number
  createdAt: string
  updatedAt: string
  assignee?: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  assigner?: {
    id: string
    name: string
    email: string
  }
  student?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  lead?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  application?: {
    id: string
    program: string
    status: string
  }
  university?: {
    id: string
    name: string
    country: string
  }
  taskComments: TaskComment[]
  taskTimeLogs: TaskTimeLog[]
  taskAttachments: TaskAttachment[]
  taskAssignments: TaskAssignment[]
  dependency?: {
    id: string
    title: string
    status: string
  }
  template?: {
    id: string
    name: string
  }
  assignmentRule?: {
    id: string
    name: string
    type: string
  }
}

interface TaskComment {
  id: string
  content: string
  type: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  createdAt: string
}

interface TaskTimeLog {
  id: string
  description?: string
  hours: number
  billable: boolean
  rate?: number
  startTime: string
  endTime: string
  user: {
    id: string
    name: string
    email: string
  }
  createdAt: string
}

interface TaskAttachment {
  id: string
  fileName: string
  fileSize: number
  fileType: string
  filePath: string
  uploadedBy: string
  createdAt: string
}

interface TaskAssignment {
  id: string
  userId: string
  user: {
    id: string
    name: string
    email: string
  }
  assigner: {
    id: string
    name: string
    email: string
  }
  assignmentType: string
  status: string
  roundRobinGroupId?: string
  roundRobinOrder?: number
  createdAt: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
  avatar?: string
}

interface RoundRobinGroup {
  id: string
  name: string
  description?: string
  strategy: string
  skipUnavailable: boolean
  resetDaily: boolean
  memberOrder: string[]
  currentPosition: number
  lastAssignedAt?: string
  isActive: boolean
  members: User[]
  memberCount: number
}

export default function TasksPage() {
  const params = useParams()
  const router = useRouter()
  const subdomain = params.subdomain as string
  
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [roundRobinGroups, setRoundRobinGroups] = useState<RoundRobinGroup[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [assignedToFilter, setAssignedToFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [isRoundRobinOpen, setIsRoundRobinOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("list")

  // Form states
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    type: 'GENERAL',
    category: 'GENERAL',
    assignedTo: '',
    studentId: '',
    leadId: '',
    applicationId: '',
    universityId: '',
    dueDate: '',
    dueTime: '',
    estimatedHours: '',
    priority: 'MEDIUM',
    status: 'PENDING',
    dependsOn: '',
    tags: '',
    metadata: ''
  })

  // Fetch tasks
  const fetchTasks = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '50'
      })
      
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (priorityFilter !== 'all') params.append('priority', priorityFilter)
      if (assignedToFilter !== 'all') params.append('assignedTo', assignedToFilter)
      if (categoryFilter !== 'all') params.append('category', categoryFilter)
      if (typeFilter !== 'all') params.append('type', typeFilter)
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`/api/${subdomain}/tasks?${params}`)
      if (!response.ok) throw new Error('Failed to fetch tasks')
      
      const data = await response.json()
      setTasks(data.tasks || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch users
  const fetchUsers = async () => {
    try {
      const response = await fetch(`/api/${subdomain}/users`)
      if (!response.ok) throw new Error('Failed to fetch users')
      
      const data = await response.json()
      setUsers(data.users || data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      // Set some fallback users for testing
      setUsers([
        { id: '1', name: 'Demo Admin', email: 'admin@demo.com', role: 'AGENCY_ADMIN', status: 'ACTIVE' },
        { id: '2', name: 'Sarah Johnson', email: 'consultant1@demo.com', role: 'CONSULTANT', status: 'ACTIVE' },
        { id: '3', name: 'Michael Chen', email: 'consultant2@demo.com', role: 'CONSULTANT', status: 'ACTIVE' },
        { id: '4', name: 'Emily Davis', email: 'support1@demo.com', role: 'SUPPORT', status: 'ACTIVE' }
      ])
    }
  }

  // Fetch round robin groups
  const fetchRoundRobinGroups = async () => {
    try {
      const response = await fetch(`/api/${subdomain}/tasks/assign-round-robin`)
      if (!response.ok) throw new Error('Failed to fetch round robin groups')
      
      const data = await response.json()
      setRoundRobinGroups(data || [])
    } catch (error) {
      console.error('Error fetching round robin groups:', error)
    }
  }

  useEffect(() => {
    fetchTasks()
    fetchUsers()
    fetchRoundRobinGroups()
  }, [statusFilter, priorityFilter, assignedToFilter, categoryFilter, typeFilter, searchTerm])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-gray-100 text-gray-800"
      case "IN_PROGRESS": return "bg-blue-100 text-blue-800"
      case "COMPLETED": return "bg-green-100 text-green-800"
      case "CANCELLED": return "bg-red-100 text-red-800"
      case "DEFERRED": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "LOW": return "bg-green-100 text-green-800"
      case "MEDIUM": return "bg-yellow-100 text-yellow-800"
      case "HIGH": return "bg-orange-100 text-orange-800"
      case "URGENT": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING": return <Circle className="h-4 w-4 text-gray-500" />
      case "IN_PROGRESS": return <Clock className="h-4 w-4 text-blue-500" />
      case "COMPLETED": return <CheckCircle className="h-4 w-4 text-green-500" />
      case "CANCELLED": return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "DEFERRED": return <Clock className="h-4 w-4 text-yellow-500" />
      default: return <Circle className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "FOLLOW_UP": return <Bell className="h-4 w-4" />
      case "DOCUMENT_REVIEW": return <Paperclip className="h-4 w-4" />
      case "APPLICATION_REVIEW": return <Target className="h-4 w-4" />
      case "CALL": return <MessageSquare className="h-4 w-4" />
      case "EMAIL": return <MessageSquare className="h-4 w-4" />
      case "MEETING": return <Users className="h-4 w-4" />
      case "REMINDER": return <Bell className="h-4 w-4" />
      default: return <ListTodo className="h-4 w-4" />
    }
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesSearch
  })

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'PENDING').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    completed: tasks.filter(t => t.status === 'COMPLETED').length,
    overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED').length
  }

  // Handle Create Task
  const handleCreateTask = async () => {
    if (!newTask.title) {
      alert('Please enter a task title')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/${subdomain}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newTask,
          estimatedHours: newTask.estimatedHours ? parseFloat(newTask.estimatedHours) : undefined,
          dueDate: newTask.dueDate || undefined,
          tags: newTask.tags ? newTask.tags.split(',').map(tag => tag.trim()) : undefined,
          metadata: newTask.metadata ? JSON.parse(newTask.metadata) : undefined
        }),
      })

      if (!response.ok) throw new Error('Failed to create task')

      // Reset form and close dialog
      setNewTask({
        title: '',
        description: '',
        type: 'GENERAL',
        category: 'GENERAL',
        assignedTo: '',
        studentId: '',
        leadId: '',
        applicationId: '',
        universityId: '',
        dueDate: '',
        dueTime: '',
        estimatedHours: '',
        priority: 'MEDIUM',
        status: 'PENDING',
        dependsOn: '',
        tags: '',
        metadata: ''
      })
      setIsCreateTaskOpen(false)
      
      // Refresh tasks
      await fetchTasks()
      
      // Show success message
      alert('Task created successfully!')
    } catch (error) {
      alert('Failed to create task. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Round Robin Assignment
  const handleRoundRobinAssignment = async (taskId: string, groupId: string) => {
    try {
      const response = await fetch(`/api/${subdomain}/tasks/assign-round-robin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId,
          roundRobinGroupId: groupId
        }),
      })

      if (!response.ok) throw new Error('Failed to assign task via round robin')

      // Refresh tasks
      await fetchTasks()
      
      // Show success message
      alert('Task assigned successfully via round robin!')
    } catch (error) {
      alert('Failed to assign task. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Task Management</h1>
          <p className="text-muted-foreground">Manage tasks, assignments, and team workload</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isRoundRobinOpen} onOpenChange={setIsRoundRobinOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Round Robin
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Round Robin Assignment</DialogTitle>
                <DialogDescription>Configure automatic task assignment using round robin groups</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid gap-4">
                  {roundRobinGroups.map(group => (
                    <Card key={group.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-sm">{group.name}</CardTitle>
                          <Badge variant={group.isActive ? "default" : "secondary"}>
                            {group.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <CardDescription className="text-xs">
                          {group.strategy} • {group.members.length} members
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex -space-x-2">
                            {group.members.slice(0, 3).map((member, index) => (
                              <Avatar key={member.id} className="h-6 w-6 border-2 border-background">
                                <AvatarFallback className="text-xs">
                                  {member.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                            {group.members.length > 3 && (
                              <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                                <span className="text-xs">+{group.members.length - 3}</span>
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Next: {group.members[group.currentPosition]?.name}
                          </span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            const unassignedTask = tasks.find(t => !t.assignee)
                            if (unassignedTask) {
                              handleRoundRobinAssignment(unassignedTask.id, group.id)
                            } else {
                              alert('No unassigned tasks available')
                            }
                          }}
                        >
                          Assign Next Task
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {roundRobinGroups.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No round robin groups configured</p>
                    <p className="text-sm">Create groups to enable automatic task assignment</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsRoundRobinOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => router.push(`/${subdomain}/settings/round-robin`)}>
                  Manage Groups
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>Create a new task and assign it to team members</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Task Title *</Label>
                    <Input 
                      id="title" 
                      value={newTask.title}
                      onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                      placeholder="Enter task title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={newTask.priority} onValueChange={(value) => setNewTask({...newTask, priority: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    placeholder="Enter task description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={newTask.type} onValueChange={(value) => setNewTask({...newTask, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GENERAL">General</SelectItem>
                        <SelectItem value="FOLLOW_UP">Follow Up</SelectItem>
                        <SelectItem value="DOCUMENT_REVIEW">Document Review</SelectItem>
                        <SelectItem value="APPLICATION_REVIEW">Application Review</SelectItem>
                        <SelectItem value="CALL">Call</SelectItem>
                        <SelectItem value="EMAIL">Email</SelectItem>
                        <SelectItem value="MEETING">Meeting</SelectItem>
                        <SelectItem value="REMINDER">Reminder</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={newTask.category} onValueChange={(value) => setNewTask({...newTask, category: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GENERAL">General</SelectItem>
                        <SelectItem value="LEAD">Lead</SelectItem>
                        <SelectItem value="STUDENT">Student</SelectItem>
                        <SelectItem value="APPLICATION">Application</SelectItem>
                        <SelectItem value="DOCUMENT">Document</SelectItem>
                        <SelectItem value="COMMUNICATION">Communication</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="assignedTo">Assign To</Label>
                    <Select value={newTask.assignedTo} onValueChange={(value) => setNewTask({...newTask, assignedTo: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={newTask.status} onValueChange={(value) => setNewTask({...newTask, status: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        <SelectItem value="DEFERRED">Deferred</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input 
                      id="dueDate" 
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="estimatedHours">Estimated Hours</Label>
                    <Input 
                      id="estimatedHours" 
                      type="number"
                      step="0.5"
                      value={newTask.estimatedHours}
                      onChange={(e) => setNewTask({...newTask, estimatedHours: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input 
                    id="tags" 
                    value={newTask.tags}
                    onChange={(e) => setNewTask({...newTask, tags: e.target.value})}
                    placeholder="urgent, follow-up, review"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateTaskOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTask} disabled={loading}>
                  {loading ? 'Creating...' : 'Create Task'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Circle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{taskStats.overdue}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Task List</TabsTrigger>
          <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-4 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="DEFERRED">Deferred</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
              <Select value={assignedToFilter} onValueChange={setAssignedToFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assignees</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Task Table */}
          <Card>
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
              <CardDescription>Manage and track all your tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => (
                    <TableRow key={task.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(task.type)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{task.title}</div>
                          {task.description && (
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {task.description}
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {task.category}
                            </Badge>
                            {task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED' && (
                              <Badge variant="destructive" className="text-xs">
                                Overdue
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {task.assignee ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {task.assignee.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{task.assignee.name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(task.status)}
                          <Badge variant="outline" className={getStatusColor(task.status)}>
                            {task.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {task.dueDate ? (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No due date</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={task.progress} className="flex-1 h-2" />
                          <span className="text-xs text-muted-foreground">{task.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {!task.assignee && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (roundRobinGroups.length > 0) {
                                  handleRoundRobinAssignment(task.id, roundRobinGroups[0].id)
                                } else {
                                  alert('No round robin groups available')
                                }
                              }}
                              title="Assign via Round Robin"
                            >
                              <RotateCcw className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/${subdomain}/tasks/${task.id}`)
                            }}
                            title="View Task"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredTasks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <ListTodo className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No tasks found</p>
                  <p className="text-sm">Create a new task to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kanban" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Kanban Board</CardTitle>
              <CardDescription>Drag and drop tasks between columns to update status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* To Do Column */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-700">To Do</h3>
                    <Badge variant="secondary">
                      {tasks.filter(t => t.status === 'PENDING').length}
                    </Badge>
                  </div>
                  <div className="space-y-3 min-h-[400px]">
                    {tasks.filter(t => t.status === 'PENDING').map(task => (
                      <Card key={task.id} className="bg-white shadow-sm border border-gray-200 cursor-move hover:shadow-md transition-shadow">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-sm line-clamp-2">{task.title}</h4>
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                          </div>
                          {task.description && (
                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {task.assignee && (
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    {task.assignee.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              {task.dueDate && (
                                <span className="text-xs text-gray-500">
                                  {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            {getTypeIcon(task.type)}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {tasks.filter(t => t.status === 'PENDING').length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <p className="text-sm">No tasks in this column</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* In Progress Column */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-blue-700">In Progress</h3>
                    <Badge variant="secondary">
                      {tasks.filter(t => t.status === 'IN_PROGRESS').length}
                    </Badge>
                  </div>
                  <div className="space-y-3 min-h-[400px]">
                    {tasks.filter(t => t.status === 'IN_PROGRESS').map(task => (
                      <Card key={task.id} className="bg-white shadow-sm border border-blue-200 cursor-move hover:shadow-md transition-shadow">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-sm line-clamp-2">{task.title}</h4>
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                          </div>
                          {task.description && (
                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {task.assignee && (
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    {task.assignee.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              {task.dueDate && (
                                <span className="text-xs text-gray-500">
                                  {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            {getTypeIcon(task.type)}
                          </div>
                          {task.progress > 0 && (
                            <div className="mt-2">
                              <Progress value={task.progress} className="h-1" />
                              <span className="text-xs text-gray-500">{task.progress}% complete</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                    {tasks.filter(t => t.status === 'IN_PROGRESS').length === 0 && (
                      <div className="text-center py-8 text-blue-400">
                        <p className="text-sm">No tasks in progress</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Review Column */}
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-yellow-700">Review</h3>
                    <Badge variant="secondary">
                      {tasks.filter(t => t.status === 'DEFERRED').length}
                    </Badge>
                  </div>
                  <div className="space-y-3 min-h-[400px]">
                    {tasks.filter(t => t.status === 'DEFERRED').map(task => (
                      <Card key={task.id} className="bg-white shadow-sm border border-yellow-200 cursor-move hover:shadow-md transition-shadow">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-sm line-clamp-2">{task.title}</h4>
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                          </div>
                          {task.description && (
                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {task.assignee && (
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    {task.assignee.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              {task.dueDate && (
                                <span className="text-xs text-gray-500">
                                  {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            {getTypeIcon(task.type)}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {tasks.filter(t => t.status === 'DEFERRED').length === 0 && (
                      <div className="text-center py-8 text-yellow-400">
                        <p className="text-sm">No tasks in review</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Completed Column */}
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-green-700">Completed</h3>
                    <Badge variant="secondary">
                      {tasks.filter(t => t.status === 'COMPLETED').length}
                    </Badge>
                  </div>
                  <div className="space-y-3 min-h-[400px]">
                    {tasks.filter(t => t.status === 'COMPLETED').map(task => (
                      <Card key={task.id} className="bg-white shadow-sm border border-green-200 cursor-move hover:shadow-md transition-shadow">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-sm line-clamp-2">{task.title}</h4>
                            <Badge className="bg-green-100 text-green-800">
                              Completed
                            </Badge>
                          </div>
                          {task.description && (
                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {task.assignee && (
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    {task.assignee.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              {task.completedAt && (
                                <span className="text-xs text-gray-500">
                                  {new Date(task.completedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {tasks.filter(t => t.status === 'COMPLETED').length === 0 && (
                      <div className="text-center py-8 text-green-400">
                        <p className="text-sm">No completed tasks</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
              <CardDescription>View tasks by due date</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Calendar view coming soon</p>
                <p className="text-sm">This feature is under development</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Task Analytics</CardTitle>
              <CardDescription>Insights and metrics about your tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Analytics dashboard coming soon</p>
                <p className="text-sm">This feature is under development</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}