"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Users, 
  User,
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Plus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Star,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  UserPlus,
  Settings,
  BarChart3,
  GraduationCap,
  Globe,
  FileText,
  MessageSquare,
  Bell,
  Activity,
  Target,
  Award,
  BookOpen,
  CreditCard,
  Database,
  Folder,
  File,
  Download,
  Unlock,
  Lock,
  Workflow,
  Layout,
  MousePointer2,
  Grid,
  Facebook,
  Chrome,
  Video,
  RefreshCw,
  Plug,
  Building,
  Play,
  Loader2,
  ListTodo,
  Circle,
  RotateCcw
} from "lucide-react"

interface UserData {
  id: string
  name: string
  email: string
  role: 'AGENCY_ADMIN' | 'CONSULTANT' | 'SUPPORT' | 'STUDENT'
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING'
  title?: string
  department?: string
  lastLogin?: string
  avatar?: string
}

interface Student {
  id: string
  firstName: string
  lastName: string
  email: string
  status: 'PROSPECT' | 'APPLIED' | 'ACCEPTED' | 'ENROLLED' | 'GRADUATED' | 'WITHDRAWN'
  stage: 'INQUIRY' | 'CONSULTATION' | 'APPLICATION' | 'DOCUMENTATION' | 'VISA_PROCESSING' | 'PRE_DEPARTURE' | 'POST_ARRIVAL'
  nationality?: string
  assignedTo?: string
  createdAt: string
  lastActivity?: string
}

interface University {
  id: string
  name: string
  country: string
  city: string
  partnershipLevel: 'NONE' | 'BASIC' | 'PREMIUM' | 'STRATEGIC'
  isPartner: boolean
  worldRanking?: number
  website?: string
}

interface DashboardStats {
  totalStudents: number
  activeApplications: number
  totalUniversities: number
  partnerUniversities: number
  monthlyRevenue: number
  teamMembers: number
  conversionRate: number
  avgProcessingTime: number
  totalTasks: number
  pendingTasks: number
  overdueTasks: number
  completedTasksThisWeek: number
}

const mockUsers: UserData[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah@agency.com",
    role: "AGENCY_ADMIN",
    status: "ACTIVE",
    title: "CEO",
    department: "Executive",
    lastLogin: "2024-01-20T10:30:00Z"
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "michael@agency.com",
    role: "CONSULTANT",
    status: "ACTIVE",
    title: "Senior Education Consultant",
    department: "Consulting",
    lastLogin: "2024-01-20T09:15:00Z"
  },
  {
    id: "3",
    name: "Emma Rodriguez",
    email: "emma@agency.com",
    role: "CONSULTANT",
    status: "ACTIVE",
    title: "Education Consultant",
    department: "Consulting",
    lastLogin: "2024-01-19T16:45:00Z"
  },
  {
    id: "4",
    name: "David Kim",
    email: "david@agency.com",
    role: "SUPPORT",
    status: "ACTIVE",
    title: "Support Specialist",
    department: "Operations",
    lastLogin: "2024-01-20T11:20:00Z"
  }
]

const mockStudents: Student[] = [
  {
    id: "1",
    firstName: "Alex",
    lastName: "Thompson",
    email: "alex.thompson@email.com",
    status: "PROSPECT",
    stage: "CONSULTATION",
    nationality: "Canadian",
    assignedTo: "2",
    createdAt: "2024-01-15",
    lastActivity: "2024-01-20T10:30:00Z"
  },
  {
    id: "2",
    lastName: "Garcia",
    firstName: "Maria",
    email: "maria.garcia@email.com",
    status: "APPLIED",
    stage: "APPLICATION",
    nationality: "Spanish",
    assignedTo: "3",
    createdAt: "2024-01-10",
    lastActivity: "2024-01-20T09:15:00Z"
  },
  {
    id: "3",
    firstName: "James",
    lastName: "Wilson",
    email: "james.wilson@email.com",
    status: "ACCEPTED",
    stage: "DOCUMENTATION",
    nationality: "British",
    assignedTo: "2",
    createdAt: "2024-01-08",
    lastActivity: "2024-01-19T16:45:00Z"
  },
  {
    id: "4",
    firstName: "Priya",
    lastName: "Patel",
    email: "priya.patel@email.com",
    status: "PROSPECT",
    stage: "INQUIRY",
    nationality: "Indian",
    assignedTo: "3",
    createdAt: "2024-01-18",
    lastActivity: "2024-01-20T11:20:00Z"
  },
  {
    id: "5",
    firstName: "Liu",
    lastName: "Wei",
    email: "liu.wei@email.com",
    status: "ENROLLED",
    stage: "PRE_DEPARTURE",
    nationality: "Chinese",
    assignedTo: "2",
    createdAt: "2023-12-15",
    lastActivity: "2024-01-19T14:30:00Z"
  }
]

const mockUniversities: University[] = [
  {
    id: "1",
    name: "Harvard University",
    country: "United States",
    city: "Cambridge",
    partnershipLevel: "STRATEGIC",
    isPartner: true,
    worldRanking: 1,
    website: "https://harvard.edu"
  },
  {
    id: "2",
    name: "University of Oxford",
    country: "United Kingdom",
    city: "Oxford",
    partnershipLevel: "PREMIUM",
    isPartner: true,
    worldRanking: 2,
    website: "https://ox.ac.uk"
  },
  {
    id: "3",
    name: "Stanford University",
    country: "United States",
    city: "Stanford",
    partnershipLevel: "STRATEGIC",
    isPartner: true,
    worldRanking: 3,
    website: "https://stanford.edu"
  },
  {
    id: "4",
    name: "MIT",
    country: "United States",
    city: "Cambridge",
    partnershipLevel: "PREMIUM",
    isPartner: true,
    worldRanking: 4,
    website: "https://mit.edu"
  },
  {
    id: "5",
    name: "University of Toronto",
    country: "Canada",
    city: "Toronto",
    partnershipLevel: "BASIC",
    isPartner: true,
    worldRanking: 25,
    website: "https://utoronto.ca"
  }
]

const mockStats: DashboardStats = {
  totalStudents: 45,
  activeApplications: 28,
  totalUniversities: 150,
  partnerUniversities: 85,
  monthlyRevenue: 12500,
  teamMembers: 4,
  conversionRate: 68,
  avgProcessingTime: 14,
  totalTasks: 67,
  pendingTasks: 23,
  overdueTasks: 5,
  completedTasksThisWeek: 18
}

export default function AgencyDashboard() {
  const params = useParams()
  const router = useRouter()
  const subdomain = params.subdomain as string
  
  const [users, setUsers] = useState<UserData[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [universities, setUniversities] = useState<University[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [recentTasks, setRecentTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false)
  const [isAddUniversityOpen, setIsAddUniversityOpen] = useState(false)
  const [isInviteMemberOpen, setIsInviteMemberOpen] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'info', title: 'New student inquiry', message: 'Alex Thompson submitted an inquiry', time: '2 hours ago', read: false },
    { id: 2, type: 'success', title: 'Application approved', message: 'Maria Garcia accepted to Oxford', time: '4 hours ago', read: false },
    { id: 3, type: 'warning', title: 'Document pending', message: 'James Wilson needs to upload passport', time: '1 day ago', read: true },
  ])

  // Form states
  const [newStudent, setNewStudent] = useState({
    firstName: '',
    lastName: '',
    email: '',
    nationality: '',
    assignedTo: ''
  })

  const [newUniversity, setNewUniversity] = useState({
    name: '',
    country: '',
    city: '',
    website: '',
    partnershipLevel: 'NONE' as 'NONE' | 'BASIC' | 'PREMIUM' | 'STRATEGIC'
  })

  const [newMember, setNewMember] = useState({
    email: '',
    role: 'CONSULTANT' as 'AGENCY_ADMIN' | 'CONSULTANT' | 'SUPPORT',
    title: '',
    department: ''
  })

  const [submitting, setSubmitting] = useState(false)

  // Simulate real-time updates
  const [liveStats, setLiveStats] = useState({
    onlineUsers: Math.floor(Math.random() * 10) + 5,
    activeApplications: Math.floor(Math.random() * 5) + 25,
    todayActivities: Math.floor(Math.random() * 20) + 10,
  })

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/${subdomain}/analytics`)
      if (!response.ok) throw new Error('Failed to fetch analytics')
      
      const data = await response.json()
      if (data.success) {
        setAnalytics(data.data)
        setStats(data.data.summary)
      }
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  // Fetch users data
  const fetchUsers = async () => {
    try {
      const response = await fetch(`/api/${subdomain}/users`)
      if (!response.ok) throw new Error('Failed to fetch users')
      
      const data = await response.json()
      if (data.users) {
        setUsers(data.users.map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          title: user.title,
          department: user.department,
          lastLogin: user.lastLoginAt
        })))
      }
    } catch (err) {
      console.error('Error fetching users:', err)
    }
  }

  // Fetch students data
  const fetchStudents = async () => {
    try {
      const response = await fetch(`/api/${subdomain}/students?limit=10`)
      if (!response.ok) throw new Error('Failed to fetch students')
      
      const data = await response.json()
      if (data.students) {
        setStudents(data.students.map((student: any) => ({
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          status: student.status,
          stage: student.stage,
          nationality: student.nationality,
          assignedTo: student.assignedTo,
          createdAt: student.createdAt,
          lastActivity: student.updatedAt
        })))
      }
    } catch (err) {
      console.error('Error fetching students:', err)
    }
  }

  // Fetch universities data
  const fetchUniversities = async () => {
    try {
      const response = await fetch(`/api/${subdomain}/universities?limit=10`)
      if (!response.ok) throw new Error('Failed to fetch universities')
      
      const data = await response.json()
      if (data.universities) {
        setUniversities(data.universities.map((university: any) => ({
          id: university.id,
          name: university.name,
          country: university.country,
          city: university.city,
          partnershipLevel: university.partnershipLevel,
          isPartner: university.isPartner,
          worldRanking: university.worldRanking,
          website: university.website
        })))
      }
    } catch (err) {
      console.error('Error fetching universities:', err)
    }
  }

  // Fetch recent tasks data
  const fetchRecentTasks = async () => {
    try {
      const response = await fetch(`/api/${subdomain}/tasks?limit=5`)
      if (!response.ok) throw new Error('Failed to fetch recent tasks')
      
      const data = await response.json()
      if (data.tasks) {
        setRecentTasks(data.tasks.map((task: any) => ({
          id: task.id,
          title: task.title,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate,
          student: task.student?.name || 'Unassigned',
          assignee: task.assignee?.name || 'Unassigned'
        })))
      }
    } catch (err) {
      console.error('Error fetching recent tasks:', err)
      // Set some mock data for demo purposes
      setRecentTasks([
        {
          id: 1,
          title: 'Review application documents',
          status: 'PENDING',
          priority: 'HIGH',
          dueDate: new Date().toISOString(),
          student: 'Alex Thompson',
          assignee: 'John Doe'
        },
        {
          id: 2,
          title: 'Schedule university interview',
          status: 'IN_PROGRESS',
          priority: 'MEDIUM',
          dueDate: new Date(Date.now() + 86400000).toISOString(),
          student: 'Maria Garcia',
          assignee: 'Jane Smith'
        }
      ])
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        await Promise.all([
          fetchAnalytics(),
          fetchUsers(),
          fetchStudents(),
          fetchUniversities(),
          fetchRecentTasks()
        ])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [subdomain])

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats({
        onlineUsers: Math.floor(Math.random() * 10) + 5,
        activeApplications: Math.floor(Math.random() * 5) + 25,
        todayActivities: Math.floor(Math.random() * 20) + 10,
      })
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

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

  const getStudentStatusColor = (status: string) => {
    switch (status) {
      case "PROSPECT": return "bg-blue-100 text-blue-800"
      case "APPLIED": return "bg-yellow-100 text-yellow-800"
      case "ACCEPTED": return "bg-green-100 text-green-800"
      case "ENROLLED": return "bg-purple-100 text-purple-800"
      case "GRADUATED": return "bg-gray-100 text-gray-800"
      case "WITHDRAWN": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPartnershipColor = (level: string) => {
    switch (level) {
      case "STRATEGIC": return "bg-purple-100 text-purple-800"
      case "PREMIUM": return "bg-blue-100 text-blue-800"
      case "BASIC": return "bg-green-100 text-green-800"
      case "NONE": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-gray-100 text-gray-800"
      case "IN_PROGRESS": return "bg-blue-100 text-blue-800"
      case "COMPLETED": return "bg-green-100 text-green-800"
      case "OVERDUE": return "bg-red-100 text-red-800"
      case "CANCELLED": return "bg-red-100 text-red-800"
      case "DEFERRED": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getTaskPriorityColor = (priority: string) => {
    switch (priority) {
      case "LOW": return "bg-green-100 text-green-800"
      case "MEDIUM": return "bg-yellow-100 text-yellow-800"
      case "HIGH": return "bg-orange-100 text-orange-800"
      case "URGENT": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING": return <Circle className="h-3 w-3 text-gray-500" />
      case "IN_PROGRESS": return <Clock className="h-3 w-3 text-blue-500" />
      case "COMPLETED": return <CheckCircle className="h-3 w-3 text-green-500" />
      case "OVERDUE": return <AlertTriangle className="h-3 w-3 text-red-500" />
      case "CANCELLED": return <XCircle className="h-3 w-3 text-red-500" />
      case "DEFERRED": return <Clock className="h-3 w-3 text-yellow-500" />
      default: return <Circle className="h-3 w-3 text-gray-500" />
    }
  }

  // Handle Add Student
  const handleAddStudent = async () => {
    if (!newStudent.firstName || !newStudent.lastName || !newStudent.email) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/${subdomain}/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newStudent),
      })

      if (!response.ok) throw new Error('Failed to add student')

      // Reset form and close dialog
      setNewStudent({ firstName: '', lastName: '', email: '', nationality: '', assignedTo: '' })
      setIsAddStudentOpen(false)
      
      // Show success message
      alert('Student added successfully!')
    } catch (error) {
      alert('Failed to add student. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Add University
  const handleAddUniversity = async () => {
    if (!newUniversity.name || !newUniversity.country) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/${subdomain}/universities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUniversity),
      })

      if (!response.ok) throw new Error('Failed to add university')

      // Reset form and close dialog
      setNewUniversity({ name: '', country: '', city: '', website: '', partnershipLevel: 'NONE' })
      setIsAddUniversityOpen(false)
      
      // Show success message
      alert('University added successfully!')
    } catch (error) {
      alert('Failed to add university. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Invite Member
  const handleInviteMember = async () => {
    if (!newMember.email || !newMember.role) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/${subdomain}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMember),
      })

      if (!response.ok) throw new Error('Failed to invite member')

      // Reset form and close dialog
      setNewMember({ email: '', role: 'CONSULTANT', title: '', department: '' })
      setIsInviteMemberOpen(false)
      
      // Show success message
      alert('Invitation sent successfully!')
    } catch (error) {
      alert('Failed to send invitation. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Create Application
  const handleCreateApplication = () => {
    router.push(`/${subdomain}/applications`)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">EA</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Agency Dashboard</h1>
            <p className="text-muted-foreground">{subdomain}.eduagency.com</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="relative">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Notifications</DialogTitle>
                <DialogDescription>Recent updates and alerts</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div key={notification.id} className={`p-3 rounded-lg border ${
                    notification.read ? 'bg-muted/30' : 'bg-primary/5 border-primary/20'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        notification.type === 'info' ? 'bg-blue-500' :
                        notification.type === 'success' ? 'bg-green-500' :
                        notification.type === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" onClick={() => router.push(`/${subdomain}/team`)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Team
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/${subdomain}/settings`)}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeApplications || 0}</div>
            <p className="text-xs text-muted-foreground">
              +4 from this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalTasks || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.completedTasksThisWeek || 0} completed this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingTasks || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.overdueTasks || 0} overdue
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats?.monthlyRevenue || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="universities">Universities</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Students */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Students</CardTitle>
                <CardDescription>
                  Latest student registrations and activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {students.slice(0, 5).map((student) => (
                    <div key={student.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                      <Badge className={getStudentStatusColor(student.status)}>
                        {student.status}
                      </Badge>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => router.push(`/${subdomain}/students`)}
                >
                  View All Students
                </Button>
              </CardContent>
            </Card>

            {/* Live Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Live Statistics</CardTitle>
                <CardDescription>
                  Real-time agency metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm">Online Users</span>
                    </div>
                    <span className="font-medium">{liveStats.onlineUsers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-sm">Active Applications</span>
                    </div>
                    <span className="font-medium">{liveStats.activeApplications}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                      <span className="text-sm">Today's Activities</span>
                    </div>
                    <span className="font-medium">{liveStats.todayActivities}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Student
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Student</DialogTitle>
                      <DialogDescription>
                        Register a new student in the system
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="firstName" className="text-right">
                          First Name
                        </Label>
                        <Input
                          id="firstName"
                          value={newStudent.firstName}
                          onChange={(e) => setNewStudent({...newStudent, firstName: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="lastName" className="text-right">
                          Last Name
                        </Label>
                        <Input
                          id="lastName"
                          value={newStudent.lastName}
                          onChange={(e) => setNewStudent({...newStudent, lastName: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={newStudent.email}
                          onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddStudent} disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Add Student
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button onClick={handleCreateApplication} className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Create Application
                </Button>

                <Dialog open={isAddUniversityOpen} onOpenChange={setIsAddUniversityOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Add University
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New University</DialogTitle>
                      <DialogDescription>
                        Add a new university partnership
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Name
                        </Label>
                        <Input
                          id="name"
                          value={newUniversity.name}
                          onChange={(e) => setNewUniversity({...newUniversity, name: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="country" className="text-right">
                          Country
                        </Label>
                        <Input
                          id="country"
                          value={newUniversity.country}
                          onChange={(e) => setNewUniversity({...newUniversity, country: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddUniversity} disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Add University
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Management</CardTitle>
              <CardDescription>
                View and manage all students in your agency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">{student.firstName} {student.lastName}</h3>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                        <p className="text-xs text-muted-foreground">{student.nationality}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStudentStatusColor(student.status)}>
                        {student.status}
                      </Badge>
                      <Badge variant="outline">{student.stage}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="universities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>University Partnerships</CardTitle>
              <CardDescription>
                Manage university partnerships and relationships
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {universities.map((university) => (
                  <div key={university.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">{university.name}</h3>
                        <p className="text-sm text-muted-foreground">{university.city}, {university.country}</p>
                        {university.worldRanking && (
                          <p className="text-xs text-muted-foreground">Rank: #{university.worldRanking}</p>
                        )}
                      </div>
                    </div>
                    <Badge className={getPartnershipColor(university.partnershipLevel)}>
                      {university.partnershipLevel}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Recent Tasks</CardTitle>
                  <CardDescription>
                    Latest tasks and their current status
                  </CardDescription>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => router.push(`/${subdomain}/tasks`)}
                >
                  View All Tasks
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getTaskStatusIcon(task.status)}
                        <div>
                          <h3 className="font-medium">{task.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {task.student} • Due: {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getTaskPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Badge className={getTaskStatusColor(task.status)}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{task.assignee}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Task Status Breakdown</CardTitle>
                <CardDescription>
                  Current status distribution of all tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Circle className="h-3 w-3 text-gray-500" />
                      <span className="text-sm">Pending</span>
                    </div>
                    <span className="text-sm font-medium">{stats?.pendingTasks || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-3 w-3 text-blue-500" />
                      <span className="text-sm">In Progress</span>
                    </div>
                    <span className="text-sm font-medium">{(stats?.totalTasks || 0) - (stats?.pendingTasks || 0) - (stats?.completedTasksThisWeek || 0) - (stats?.overdueTasks || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span className="text-sm">Completed This Week</span>
                    </div>
                    <span className="text-sm font-medium">{stats?.completedTasksThisWeek || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-3 w-3 text-red-500" />
                      <span className="text-sm">Overdue</span>
                    </div>
                    <span className="text-sm font-medium text-red-600">{stats?.overdueTasks || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common task-related actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => router.push(`/${subdomain}/tasks`)}
                  >
                    <ListTodo className="h-4 w-4 mr-2" />
                    View All Tasks
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => router.push(`/${subdomain}/settings/round-robin`)}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Manage Round Robin Groups
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setIsCreateTaskOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Task
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest activities and updates across your agency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.recentActivities?.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                      {activity.type === 'student' && <User className="h-4 w-4" />}
                      {activity.type === 'application' && <FileText className="h-4 w-4" />}
                      {activity.type === 'task' && <ListTodo className="h-4 w-4" />}
                      {activity.type === 'university' && <GraduationCap className="h-4 w-4" />}
                      {activity.type === 'user' && <Users className="h-4 w-4" />}
                      {!['student', 'application', 'task', 'university', 'user'].includes(activity.type) && <Activity className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.user} • {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )) || (
                  <p className="text-center text-muted-foreground py-8">
                    No recent activities found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}