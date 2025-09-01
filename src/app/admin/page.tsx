"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Building2, 
  Users, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle,
  Search,
  Filter,
  Download,
  Settings,
  Shield,
  BarChart3,
  Activity,
  Globe,
  CreditCard,
  Database,
  Calendar,
  Clock,
  Mail,
  Phone,
  MapPin,
  Percent,
  Receipt,
  Star,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  GraduationCap,
  Zap,
  GitBranch,
  Bell,
  RefreshCw,
  UserPlus,
  Pause,
  Play,
  Ban,
  Check,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Wifi,
  WifiOff,
  Server,
  HardDrive,
  MemoryStick,
  Cpu,
  Thermometer,
  Battery,
  Signal
} from "lucide-react"

interface Agency {
  id: string
  name: string
  subdomain: string
  customDomain?: string
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING'
  plan: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'
  createdAt: string
  userCount: number
  studentCount: number
  universityCount: number
  applicationCount: number
  lastActivity?: string
  billingStatus: 'ACTIVE' | 'PAST_DUE' | 'CANCELLED'
  health: 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL'
  performance: {
    responseTime: number
    uptime: number
    errorRate: number
  }
  metrics: {
    monthlyActiveUsers: number
    sessionDuration: number
    bounceRate: number
  }
  support: {
    ticketsOpen: number
    ticketsResolved: number
    avgResponseTime: number
  }
}

interface SystemStats {
  totalAgencies: number
  activeAgencies: number
  totalUsers: number
  totalStudents: number
  totalApplications: number
  totalRevenue: number
  monthlyGrowth: number
  systemHealth: 'HEALTHY' | 'WARNING' | 'CRITICAL'
  realTimeMetrics: {
    activeUsers: number
    requestsPerSecond: number
    averageResponseTime: number
    errorRate: number
    databaseConnections: number
    memoryUsage: number
    cpuUsage: number
    diskUsage: number
  }
  alerts: {
    critical: number
    warning: number
    info: number
  }
}

interface Notification {
  id: string
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS'
  title: string
  message: string
  timestamp: string
  read: boolean
  action?: {
    label: string
    callback: () => void
  }
}

const mockAgencies: Agency[] = [
  {
    id: "1",
    name: "Global Education Partners",
    subdomain: "global-education",
    customDomain: "globaledu.com",
    status: "ACTIVE",
    plan: "ENTERPRISE",
    createdAt: "2024-01-15",
    userCount: 12,
    studentCount: 250,
    universityCount: 150,
    applicationCount: 180,
    lastActivity: "2024-01-20T10:30:00Z",
    billingStatus: "ACTIVE",
    health: "EXCELLENT",
    performance: {
      responseTime: 120,
      uptime: 99.9,
      errorRate: 0.1
    },
    metrics: {
      monthlyActiveUsers: 45,
      sessionDuration: 1250,
      bounceRate: 12.5
    },
    support: {
      ticketsOpen: 3,
      ticketsResolved: 28,
      avgResponseTime: 2.5
    }
  },
  {
    id: "2", 
    name: "Study Abroad Consultants",
    subdomain: "study-abroad",
    status: "ACTIVE",
    plan: "PROFESSIONAL",
    createdAt: "2024-01-10",
    userCount: 5,
    studentCount: 80,
    universityCount: 75,
    applicationCount: 95,
    lastActivity: "2024-01-20T09:15:00Z",
    billingStatus: "ACTIVE",
    health: "GOOD",
    performance: {
      responseTime: 180,
      uptime: 99.5,
      errorRate: 0.3
    },
    metrics: {
      monthlyActiveUsers: 22,
      sessionDuration: 980,
      bounceRate: 18.2
    },
    support: {
      ticketsOpen: 1,
      ticketsResolved: 15,
      avgResponseTime: 4.2
    }
  },
  {
    id: "3",
    name: "EduPath International",
    subdomain: "edupath",
    status: "PENDING",
    plan: "STARTER",
    createdAt: "2024-01-18",
    userCount: 2,
    studentCount: 0,
    universityCount: 0,
    applicationCount: 0,
    billingStatus: "PAST_DUE",
    health: "WARNING",
    performance: {
      responseTime: 350,
      uptime: 97.2,
      errorRate: 1.2
    },
    metrics: {
      monthlyActiveUsers: 2,
      sessionDuration: 320,
      bounceRate: 45.8
    },
    support: {
      ticketsOpen: 2,
      ticketsResolved: 0,
      avgResponseTime: 8.5
    }
  },
  {
    id: "4",
    name: "Future Ready Education",
    subdomain: "future-ready",
    status: "ACTIVE",
    plan: "FREE",
    createdAt: "2024-01-12",
    userCount: 3,
    studentCount: 25,
    universityCount: 40,
    applicationCount: 30,
    lastActivity: "2024-01-19T16:45:00Z",
    billingStatus: "ACTIVE",
    health: "GOOD",
    performance: {
      responseTime: 200,
      uptime: 98.8,
      errorRate: 0.5
    },
    metrics: {
      monthlyActiveUsers: 8,
      sessionDuration: 720,
      bounceRate: 22.1
    },
    support: {
      ticketsOpen: 0,
      ticketsResolved: 5,
      avgResponseTime: 6.1
    }
  },
  {
    id: "5",
    name: "Academic Bridge",
    subdomain: "academic-bridge",
    status: "SUSPENDED",
    plan: "PROFESSIONAL",
    createdAt: "2023-12-01",
    userCount: 8,
    studentCount: 120,
    universityCount: 90,
    applicationCount: 85,
    lastActivity: "2024-01-15T14:20:00Z",
    billingStatus: "CANCELLED",
    health: "CRITICAL",
    performance: {
      responseTime: 520,
      uptime: 94.1,
      errorRate: 3.8
    },
    metrics: {
      monthlyActiveUsers: 15,
      sessionDuration: 450,
      bounceRate: 38.9
    },
    support: {
      ticketsOpen: 5,
      ticketsResolved: 12,
      avgResponseTime: 12.3
    }
  }
]

const mockStats: SystemStats = {
  totalAgencies: 156,
  activeAgencies: 142,
  totalUsers: 1240,
  totalStudents: 8930,
  totalApplications: 6750,
  totalRevenue: 284500,
  monthlyGrowth: 12.5,
  systemHealth: "HEALTHY",
  realTimeMetrics: {
    activeUsers: 342,
    requestsPerSecond: 45.2,
    averageResponseTime: 145,
    errorRate: 0.8,
    databaseConnections: 23,
    memoryUsage: 68.5,
    cpuUsage: 42.3,
    diskUsage: 55.8
  },
  alerts: {
    critical: 2,
    warning: 5,
    info: 12
  }
}

const recentActivities = [
  {
    id: "1",
    agency: "Global Education Partners",
    action: "New student enrolled",
    user: "Sarah Johnson",
    timestamp: "2 minutes ago",
    type: "student"
  },
  {
    id: "2",
    agency: "Study Abroad Consultants", 
    action: "Application submitted to Oxford",
    user: "Michael Chen",
    timestamp: "15 minutes ago",
    type: "application"
  },
  {
    id: "3",
    agency: "EduPath International",
    action: "Agency created",
    user: "System",
    timestamp: "1 hour ago",
    type: "agency"
  },
  {
    id: "4",
    agency: "Future Ready Education",
    action: "University partnership added",
    user: "Emma Rodriguez",
    timestamp: "2 hours ago",
    type: "university"
  },
  {
    id: "5",
    agency: "Academic Bridge",
    action: "Billing payment failed",
    user: "System",
    timestamp: "3 hours ago",
    type: "billing"
  }
]

export default function AdminConsole() {
  const [agencies] = useState<Agency[]>(mockAgencies)
  const [stats] = useState<SystemStats>(mockStats)
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "WARNING",
      title: "High Memory Usage",
      message: "Server memory usage is at 85%, consider scaling up.",
      timestamp: "2 minutes ago",
      read: false
    },
    {
      id: "2",
      type: "ERROR",
      title: "Database Connection Failed",
      message: "Failed to connect to database server. Retrying...",
      timestamp: "5 minutes ago",
      read: false,
      action: {
        label: "View Logs",
        callback: () => console.log("View logs clicked")
      }
    },
    {
      id: "3",
      type: "SUCCESS",
      title: "Backup Completed",
      message: "Daily backup completed successfully.",
      timestamp: "1 hour ago",
      read: true
    }
  ])
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date())
      
      // Simulate random metric updates
      if (Math.random() > 0.7) {
        setNotifications(prev => {
          const newNotification: Notification = {
            id: Date.now().toString(),
            type: Math.random() > 0.8 ? "ERROR" : Math.random() > 0.5 ? "WARNING" : "INFO",
            title: "System Update",
            message: "Real-time metrics updated",
            timestamp: "Just now",
            read: false
          }
          return [newNotification, ...prev.slice(0, 9)]
        })
      }
    }, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLastUpdate(new Date())
    setIsRefreshing(false)
  }

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  const unreadNotifications = notifications.filter(n => !n.read).length

  const filteredAgencies = agencies.filter(agency => {
    const matchesSearch = agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agency.subdomain.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || agency.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-green-100 text-green-800"
      case "PENDING": return "bg-yellow-100 text-yellow-800"
      case "SUSPENDED": return "bg-red-100 text-red-800"
      case "INACTIVE": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case "EXCELLENT": return "text-green-600"
      case "GOOD": return "text-blue-600"
      case "WARNING": return "text-yellow-600"
      case "CRITICAL": return "text-red-600"
      default: return "text-gray-600"
    }
  }

  const getHealthIcon = (health: string) => {
    switch (health) {
      case "EXCELLENT": return <CheckCircle className="h-4 w-4" />
      case "GOOD": return <CheckCircle className="h-4 w-4" />
      case "WARNING": return <AlertTriangle className="h-4 w-4" />
      case "CRITICAL": return <X className="h-4 w-4" />
      default: return <Minus className="h-4 w-4" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "ERROR": return "bg-red-50 border-red-200 text-red-800"
      case "WARNING": return "bg-yellow-50 border-yellow-200 text-yellow-800"
      case "SUCCESS": return "bg-green-50 border-green-200 text-green-800"
      case "INFO": return "bg-blue-50 border-blue-200 text-blue-800"
      default: return "bg-gray-50 border-gray-200 text-gray-800"
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "ERROR": return <X className="h-4 w-4" />
      case "WARNING": return <AlertTriangle className="h-4 w-4" />
      case "SUCCESS": return <CheckCircle className="h-4 w-4" />
      case "INFO": return <Bell className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const formatUptime = (uptime: number) => {
    return `${uptime}%`
  }

  const formatResponseTime = (time: number) => {
    return `${time}ms`
  }

  const formatErrorRate = (rate: number) => {
    return `${rate}%`
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "ENTERPRISE": return "bg-purple-100 text-purple-800"
      case "PROFESSIONAL": return "bg-blue-100 text-blue-800"
      case "STARTER": return "bg-green-100 text-green-800"
      case "FREE": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getBillingStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-green-100 text-green-800"
      case "PAST_DUE": return "bg-yellow-100 text-yellow-800"
      case "CANCELLED": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getSystemHealthColor = (health: string) => {
    switch (health) {
      case "HEALTHY": return "text-green-600"
      case "WARNING": return "text-yellow-600"
      case "CRITICAL": return "text-red-600"
      default: return "text-gray-600"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">SaaS Admin Console</h1>
                <p className="text-sm text-muted-foreground">Platform Administration & Tenant Management</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Real-time Status Indicator */}
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${stats.systemHealth === 'HEALTHY' ? 'bg-green-500' : stats.systemHealth === 'WARNING' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                <span className="text-muted-foreground">
                  {stats.systemHealth === 'HEALTHY' ? 'All Systems Operational' : stats.systemHealth === 'WARNING' ? 'Some Issues Detected' : 'Critical Issues'}
                </span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">
                  Updated {lastUpdate.toLocaleTimeString()}
                </span>
              </div>
              
              {/* Notifications */}
              <div className="relative">
                <Button variant="outline" size="sm">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                  {unreadNotifications > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                      {unreadNotifications}
                    </Badge>
                  )}
                </Button>
              </div>
              
              {/* Refresh Button */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Data
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
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="agencies">Agencies</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* System Health Alert */}
            <Alert className={`border-l-4 ${
              stats.systemHealth === 'HEALTHY' ? 'border-green-500 bg-green-50' :
              stats.systemHealth === 'WARNING' ? 'border-yellow-500 bg-yellow-50' :
              'border-red-500 bg-red-50'
            }`}>
              <div className="flex items-center gap-2">
                {stats.systemHealth === 'HEALTHY' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : stats.systemHealth === 'WARNING' ? (
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={
                  stats.systemHealth === 'HEALTHY' ? 'text-green-800' :
                  stats.systemHealth === 'WARNING' ? 'text-yellow-800' :
                  'text-red-800'
                }>
                  <strong>System Status:</strong> {stats.systemHealth} - All systems operational
                </AlertDescription>
              </div>
            </Alert>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Agencies</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalAgencies}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.activeAgencies} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Across all agencies
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalStudents.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalApplications} applications
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${(stats.totalRevenue / 1000).toFixed(1)}K</div>
                  <p className="text-xs text-muted-foreground">
                    +{stats.monthlyGrowth}% from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Latest system-wide activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          {activity.type === 'student' && <Users className="h-4 w-4 text-primary" />}
                          {activity.type === 'application' && <BarChart3 className="h-4 w-4 text-primary" />}
                          {activity.type === 'agency' && <Building2 className="h-4 w-4 text-primary" />}
                          {activity.type === 'university' && <Globe className="h-4 w-4 text-primary" />}
                          {activity.type === 'billing' && <CreditCard className="h-4 w-4 text-primary" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">{activity.agency} • {activity.user}</p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {activity.timestamp}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Create New Agency
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Database className="h-4 w-4 mr-2" />
                    Database Backup
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="h-4 w-4 mr-2" />
                    Send System Announcement
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    System Configuration
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Reports
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="agencies" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Agency Management</CardTitle>
                <CardDescription>Manage all tenant agencies on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search agencies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-input rounded-md text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="ACTIVE">Active</option>
                      <option value="PENDING">Pending</option>
                      <option value="SUSPENDED">Suspended</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>

                {/* Agencies Table */}
                <div className="rounded-md border">
                  <div className="grid grid-cols-12 gap-4 p-4 bg-muted font-medium text-sm">
                    <div className="col-span-3">Agency</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2">Plan</div>
                    <div className="col-span-2">Users/Students</div>
                    <div className="col-span-2">Billing</div>
                    <div className="col-span-1">Actions</div>
                  </div>
                  <div className="divide-y">
                    {filteredAgencies.map((agency) => (
                      <div key={agency.id} className="grid grid-cols-12 gap-4 p-4 items-center">
                        <div className="col-span-3">
                          <div>
                            <p className="font-medium">{agency.name}</p>
                            <p className="text-sm text-muted-foreground">{agency.subdomain}.eduagency.com</p>
                            {agency.customDomain && (
                              <p className="text-xs text-muted-foreground">{agency.customDomain}</p>
                            )}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <Badge className={getStatusColor(agency.status)}>
                            {agency.status}
                          </Badge>
                        </div>
                        <div className="col-span-2">
                          <Badge className={getPlanColor(agency.plan)}>
                            {agency.plan}
                          </Badge>
                        </div>
                        <div className="col-span-2">
                          <div className="text-sm">
                            <p>{agency.userCount} users</p>
                            <p className="text-muted-foreground">{agency.studentCount} students</p>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <Badge className={getBillingStatusColor(agency.billingStatus)}>
                            {agency.billingStatus}
                          </Badge>
                        </div>
                        <div className="col-span-1">
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Subscription Management
                  </CardTitle>
                  <CardDescription>Manage subscription plans, features, and billing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">4</div>
                      <div className="text-sm text-muted-foreground">Active Plans</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">12</div>
                      <div className="text-sm text-muted-foreground">Total Features</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/admin/subscriptions'}>
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Subscription Plans
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/admin/subscriptions'}>
                      <Zap className="h-4 w-4 mr-2" />
                      Configure Features
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/admin/subscriptions'}>
                      <Users className="h-4 w-4 mr-2" />
                      View Agency Subscriptions
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/admin/subscriptions'}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Subscription Analytics
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/admin/branch-features'}>
                      <GitBranch className="h-4 w-4 mr-2" />
                      Branch Features
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Revenue Overview
                  </CardTitle>
                  <CardDescription>Monthly recurring revenue and growth</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-700">$12.4K</div>
                      <div className="text-sm text-green-600">MRR</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-700">142</div>
                      <div className="text-sm text-blue-600">Active Subs</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Conversion Rate</span>
                      <span className="font-medium">3.2%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Churn Rate</span>
                      <span className="font-medium">2.1%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>ARPA</span>
                      <span className="font-medium">$87.32</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => window.location.href = '/admin/subscriptions'}>
                    View Detailed Analytics
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Agency Growth</CardTitle>
                  <CardDescription>New agencies created over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-muted rounded">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Growth chart would be displayed here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Analytics</CardTitle>
                  <CardDescription>Monthly revenue breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-muted rounded">
                    <div className="text-center">
                      <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Revenue chart would be displayed here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Platform Usage Statistics</CardTitle>
                <CardDescription>Detailed usage metrics across all agencies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{stats.totalApplications}</div>
                    <p className="text-sm text-muted-foreground">Total Applications</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{stats.totalStudents}</div>
                    <p className="text-sm text-muted-foreground">Total Students</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{stats.totalUsers}</div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">{stats.activeAgencies}</div>
                    <p className="text-sm text-muted-foreground">Active Agencies</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Compliance
                  </CardTitle>
                  <CardDescription>System security and compliance status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-green-800">SOC 2 Type II</p>
                      <p className="text-sm text-green-600">Certified and compliant</p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-green-800">GDPR Compliance</p>
                      <p className="text-sm text-green-600">All requirements met</p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="font-medium text-yellow-800">Data Encryption</p>
                      <p className="text-sm text-yellow-600">Review in progress</p>
                    </div>
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Data Management
                  </CardTitle>
                  <CardDescription>Data retention and backup status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Last Backup</p>
                      <p className="text-sm text-muted-foreground">2 hours ago</p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Data Retention</p>
                      <p className="text-sm text-muted-foreground">7 years (compliant)</p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Audit Logs</p>
                      <p className="text-sm text-muted-foreground">Enabled and active</p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Reports</CardTitle>
                <CardDescription>Generate and download compliance documentation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex-col">
                    <Shield className="h-6 w-6 mb-2" />
                    SOC 2 Report
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Database className="h-6 w-6 mb-2" />
                    Data Processing Agreement
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <BarChart3 className="h-6 w-6 mb-2" />
                    Audit Trail
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}