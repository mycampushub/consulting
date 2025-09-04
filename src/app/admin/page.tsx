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
  Signal,
  Key,
  Fingerprint,
  Lock
} from "lucide-react"

interface Agency {
  id: string
  name: string
  subdomain: string
  customDomain?: string
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING'
  plan: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'
  createdAt: string
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
  stats: {
    userCount: number
    studentCount: number
    universityCount: number
    applicationCount: number
    invoiceCount: number
  }
}

interface SystemStats {
  totalAgencies: number
  activeAgencies: number
  totalUsers: number
  activeUsers: number
  totalStudents: number
  totalApplications: number
  agencyHealth: {
    healthy: number
    warning: number
    critical: number
  }
  systemHealth: {
    overall: string
    agencies: {
      total: number
      active: number
      suspended: number
      healthPercentage: number
    }
    system: {
      uptime: number
      responseTime: number
      errorRate: number
      lastCheck: string
    }
  }
  recentAlerts: Array<{
    id: string
    type: string
    title: string
    message: string
    agency?: string
    timestamp: string
    severity: string
  }>
  performanceMetrics: {
    requests: {
      total: number
      perSecond: number
    }
    response: {
      average: number
      p95: number
      p99: number
    }
    system: {
      databaseConnections: number
      memoryUsage: number
      cpuUsage: number
      diskUsage: number
    }
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

export default function AdminConsole() {
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  // Fetch data on component mount
  useEffect(() => {
    fetchData()
    const interval = setInterval(() => {
      setLastUpdate(new Date())
      fetchRealTimeData()
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchAgencies(),
        fetchSystemStats(),
        fetchNotifications()
      ])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAgencies = async () => {
    try {
      const response = await fetch('/api/admin/agencies')
      if (response.ok) {
        const data = await response.json()
        setAgencies(data.data.agencies)
      }
    } catch (error) {
      console.error("Error fetching agencies:", error)
    }
  }

  const fetchSystemStats = async () => {
    try {
      const response = await fetch('/api/admin/monitoring?type=overview')
      if (response.ok) {
        const data = await response.json()
        setStats(data.data)
      }
    } catch (error) {
      console.error("Error fetching system stats:", error)
    }
  }

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/admin/monitoring?type=alerts')
      if (response.ok) {
        const data = await response.json()
        const formattedNotifications = data.data.alerts.map((alert: any) => ({
          id: alert.id,
          type: alert.type === 'ERROR' ? 'ERROR' : alert.type === 'WARNING' ? 'WARNING' : 'INFO',
          title: alert.title,
          message: alert.message,
          timestamp: new Date(alert.timestamp).toLocaleString(),
          read: false
        }))
        setNotifications(formattedNotifications)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  const fetchRealTimeData = async () => {
    try {
      // Fetch real-time metrics
      const [healthResponse, monitoringResponse] = await Promise.all([
        fetch('/api/admin/health'),
        fetch('/api/admin/monitoring?type=overview')
      ])

      if (healthResponse.ok && monitoringResponse.ok) {
        const healthData = await healthResponse.json()
        const monitoringData = await monitoringResponse.json()
        
        // Update stats with real-time data
        if (stats) {
          setStats({
            ...stats,
            systemHealth: monitoringData.data.systemHealth,
            recentAlerts: monitoringData.data.recentAlerts
          })
        }
      }
    } catch (error) {
      console.error("Error fetching real-time data:", error)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchData()
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading admin console...</p>
        </div>
      </div>
    )
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
              {stats && (
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${stats.systemHealth.overall === 'HEALTHY' ? 'bg-green-500' : stats.systemHealth.overall === 'WARNING' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                  <span className="text-muted-foreground">
                    {stats.systemHealth.overall === 'HEALTHY' ? 'All Systems Operational' : stats.systemHealth.overall === 'WARNING' ? 'Some Issues Detected' : 'Critical Issues'}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    Updated {lastUpdate.toLocaleTimeString()}
                  </span>
                </div>
              )}
              
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

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="agencies">Agencies</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {stats && (
              <>
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Agencies</CardTitle>
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.systemHealth.agencies.total}</div>
                      <p className="text-xs text-muted-foreground">
                        {stats.systemHealth.agencies.active} active
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.systemHealth.agencies.active}</div>
                      <p className="text-xs text-muted-foreground">
                        {stats.systemHealth.agencies.healthPercentage.toFixed(1)}% health
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatUptime(stats.systemHealth.system.uptime)}</div>
                      <p className="text-xs text-muted-foreground">
                        {formatResponseTime(stats.systemHealth.system.responseTime)} avg response
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatErrorRate(stats.systemHealth.system.errorRate)}</div>
                      <p className="text-xs text-muted-foreground">
                        Last 24 hours
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Alerts */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent System Alerts</CardTitle>
                    <CardDescription>Latest system notifications and alerts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats.recentAlerts.slice(0, 5).map((alert) => (
                        <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`p-1 rounded-full ${
                              alert.severity === 'critical' ? 'bg-red-100' :
                              alert.severity === 'high' ? 'bg-orange-100' :
                              alert.severity === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                            }`}>
                              {alert.severity === 'critical' && <X className="h-3 w-3 text-red-600" />}
                              {alert.severity === 'high' && <AlertTriangle className="h-3 w-3 text-orange-600" />}
                              {alert.severity === 'medium' && <AlertTriangle className="h-3 w-3 text-yellow-600" />}
                              {alert.severity === 'low' && <Bell className="h-3 w-3 text-blue-600" />}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{alert.title}</p>
                              <p className="text-xs text-muted-foreground">{alert.message}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                              {new Date(alert.timestamp).toLocaleString()}
                            </p>
                            {alert.agency && (
                              <p className="text-xs text-muted-foreground">{alert.agency}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Agencies Tab */}
          <TabsContent value="agencies" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search agencies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="SUSPENDED">Suspended</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                New Agency
              </Button>
            </div>

            <div className="grid gap-4">
              {filteredAgencies.map((agency) => (
                <Card key={agency.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{agency.name}</h3>
                          <p className="text-sm text-muted-foreground">{agency.subdomain}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-sm font-medium">{agency.stats.userCount}</p>
                          <p className="text-xs text-muted-foreground">Users</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">{agency.stats.studentCount}</p>
                          <p className="text-xs text-muted-foreground">Students</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">{agency.stats.applicationCount}</p>
                          <p className="text-xs text-muted-foreground">Applications</p>
                        </div>
                        
                        <Badge className={getStatusColor(agency.status)}>
                          {agency.status}
                        </Badge>
                        
                        <Badge className={getPlanColor(agency.plan)}>
                          {agency.plan}
                        </Badge>
                        
                        <div className="flex items-center gap-1">
                          {getHealthIcon(agency.health)}
                          <span className={`text-sm ${getHealthColor(agency.health)}`}>
                            {agency.health}
                          </span>
                        </div>
                        
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage users across all tenant agencies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">User Management</h3>
                  <p className="text-muted-foreground mb-4">
                    View and manage users across all tenant agencies
                  </p>
                  <Button>View All Users</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing & Subscriptions</CardTitle>
                <CardDescription>Manage billing and subscriptions across all agencies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Billing Management</h3>
                  <p className="text-muted-foreground mb-4">
                    View billing analytics and manage subscriptions
                  </p>
                  <Button>View Billing Dashboard</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            {stats && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Requests/sec</CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.performanceMetrics.requests.perSecond.toFixed(1)}</div>
                      <p className="text-xs text-muted-foreground">
                        {stats.performanceMetrics.requests.total} total
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatResponseTime(stats.performanceMetrics.response.average)}</div>
                      <p className="text-xs text-muted-foreground">
                        P95: {formatResponseTime(stats.performanceMetrics.response.p95)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                      <MemoryStick className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.performanceMetrics.system.memoryUsage.toFixed(1)}%</div>
                      <p className="text-xs text-muted-foreground">
        CPU: {stats.performanceMetrics.system.cpuUsage.toFixed(1)}%
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Database</CardTitle>
                      <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.performanceMetrics.system.databaseConnections}</div>
                      <p className="text-xs text-muted-foreground">
                        Active connections
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>System Health</CardTitle>
                    <CardDescription>Real-time system health monitoring</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Database</span>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-green-600">Healthy</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">API Gateway</span>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-green-600">Healthy</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Cache</span>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-green-600">Healthy</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Storage</span>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-green-600">Healthy</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Email Service</span>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-green-600">Healthy</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Queue Service</span>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-green-600">Healthy</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Authentication</span>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-green-600">Healthy</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Monitoring</span>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-green-600">Healthy</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Backup Service</span>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span className="text-sm text-yellow-600">Warning</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Management</CardTitle>
                <CardDescription>Manage security settings, API keys, and access controls</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">API Security</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Key className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium">API Keys</p>
                            <p className="text-sm text-muted-foreground">Manage API access keys</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Manage</Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Fingerprint className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium">Rate Limiting</p>
                            <p className="text-sm text-muted-foreground">Configure API rate limits</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Lock className="h-5 w-5 text-purple-600" />
                          <div>
                            <p className="font-medium">IP Restrictions</p>
                            <p className="text-sm text-muted-foreground">Manage IP access rules</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Manage</Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Security Monitoring</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Shield className="h-5 w-5 text-red-600" />
                          <div>
                            <p className="font-medium">Security Events</p>
                            <p className="text-sm text-muted-foreground">View security incidents</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">View Events</Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Activity className="h-5 w-5 text-orange-600" />
                          <div>
                            <p className="font-medium">Audit Logs</p>
                            <p className="text-sm text-muted-foreground">Access and change logs</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">View Logs</Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <BarChart3 className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium">Compliance</p>
                            <p className="text-sm text-muted-foreground">Compliance monitoring</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Monitor</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}