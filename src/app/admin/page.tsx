"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
  
  // New Agency Form State
  const [isNewAgencyDialogOpen, setIsNewAgencyDialogOpen] = useState(false)
  const [newAgency, setNewAgency] = useState({
    name: '',
    subdomain: '',
    customDomain: '',
    plan: 'FREE' as 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE',
    adminEmail: '',
    adminName: '',
    adminPassword: ''
  })
  const [isCreatingAgency, setIsCreatingAgency] = useState(false)
  const [agencyFormError, setAgencyFormError] = useState('')
  
  // Agency Details State
  const [isAgencyDetailsOpen, setIsAgencyDetailsOpen] = useState(false)
  const [selectedAgencyDetails, setSelectedAgencyDetails] = useState<Agency | null>(null)
  
  // User Management State
  const [users, setUsers] = useState<any[]>([])
  const [isUsersDialogOpen, setIsUsersDialogOpen] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)
  
  // Export and Settings State
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false)

  // Security Management State
  const [apiKeys, setApiKeys] = useState<any[]>([])
  const [rateLimits, setRateLimits] = useState<any[]>([])
  const [ipRestrictions, setIpRestrictions] = useState<any[]>([])
  const [securityEvents, setSecurityEvents] = useState<any[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [complianceMetrics, setComplianceMetrics] = useState<any>(null)
  
  // Security Dialogs State
  const [isApiKeysDialogOpen, setIsApiKeysDialogOpen] = useState(false)
  const [isRateLimitingDialogOpen, setIsRateLimitingDialogOpen] = useState(false)
  const [isIpRestrictionsDialogOpen, setIsIpRestrictionsDialogOpen] = useState(false)
  const [isSecurityEventsDialogOpen, setIsSecurityEventsDialogOpen] = useState(false)
  const [isAuditLogsDialogOpen, setIsAuditLogsDialogOpen] = useState(false)
  const [isComplianceDialogOpen, setIsComplianceDialogOpen] = useState(false)
  
  // Security Loading States
  const [loadingApiKeys, setLoadingApiKeys] = useState(false)
  const [loadingRateLimits, setLoadingRateLimits] = useState(false)
  const [loadingIpRestrictions, setLoadingIpRestrictions] = useState(false)
  const [loadingSecurityEvents, setLoadingSecurityEvents] = useState(false)
  const [loadingAuditLogs, setLoadingAuditLogs] = useState(false)
  const [loadingCompliance, setLoadingCompliance] = useState(false)
  
  // Form States
  const [newApiKey, setNewApiKey] = useState({
    name: '',
    permissions: ['read'],
    allowedIPs: '',
    rateLimit: 1000,
    expiresAt: ''
  })
  const [newRateLimit, setNewRateLimit] = useState({
    endpoint: '/api/*',
    method: 'ALL',
    requestsPerMinute: 60,
    requestsPerHour: 1000,
    requestsPerDay: 10000,
    burstLimit: 10,
    enabled: true
  })
  const [newIpRestriction, setNewIpRestriction] = useState({
    ipAddress: '',
    type: 'ALLOW',
    description: '',
    enabled: true
  })

  // New User Form State
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'AGENCY_ADMIN' as 'AGENCY_ADMIN' | 'USER' | 'MANAGER' | 'ADMIN',
    agencyId: '',
    title: '',
    department: '',
    phone: ''
  })
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false)
  const [creatingUser, setCreatingUser] = useState(false)
  const [userFormError, setUserFormError] = useState('')

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

  // New Agency Form Handlers
  const handleNewAgencyChange = (field: string, value: string) => {
    setNewAgency(prev => ({ ...prev, [field]: value }))
    if (agencyFormError) setAgencyFormError('')
  }

  const validateNewAgencyForm = () => {
    if (!newAgency.name.trim()) return 'Agency name is required'
    if (!newAgency.subdomain.trim()) return 'Subdomain is required'
    if (!newAgency.adminEmail.trim()) return 'Admin email is required'
    if (!newAgency.adminName.trim()) return 'Admin name is required'
    if (!newAgency.adminPassword.trim()) return 'Admin password is required'
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newAgency.adminEmail)) return 'Invalid email format'
    
    // Validate subdomain format
    const subdomainRegex = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/
    if (!subdomainRegex.test(newAgency.subdomain)) return 'Subdomain can only contain lowercase letters, numbers, and hyphens'
    
    return null
  }

  const handleCreateAgency = async () => {
    const error = validateNewAgencyForm()
    if (error) {
      setAgencyFormError(error)
      return
    }

    setIsCreatingAgency(true)
    setAgencyFormError('')

    try {
      const response = await fetch('/api/admin/agencies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAgency),
      })

      const result = await response.json()

      if (response.ok) {
        // Refresh agencies list
        await fetchAgencies()
        
        // Reset form and close dialog
        setNewAgency({
          name: '',
          subdomain: '',
          customDomain: '',
          plan: 'FREE',
          adminEmail: '',
          adminName: '',
          adminPassword: ''
        })
        setIsNewAgencyDialogOpen(false)
        
        // Show success message (you could use a toast here)
        alert('Agency created successfully!')
      } else {
        setAgencyFormError(result.error || 'Failed to create agency')
      }
    } catch (error) {
      console.error('Error creating agency:', error)
      setAgencyFormError('Network error. Please try again.')
    } finally {
      setIsCreatingAgency(false)
    }
  }

  // Agency Details Handlers
  const handleViewAgency = (agency: Agency) => {
    setSelectedAgencyDetails(agency)
    setIsAgencyDetailsOpen(true)
  }

  // User Management Handlers
  const fetchUsers = async () => {
    setLoadingUsers(true)
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.data.users)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleViewUsers = () => {
    fetchUsers()
    setIsUsersDialogOpen(true)
  }

  // Export and Settings Handlers
  const handleExportData = () => {
    const exportData = {
      agencies: agencies,
      stats: stats,
      exportDate: new Date().toISOString(),
      summary: {
        totalAgencies: agencies.length,
        activeAgencies: agencies.filter(a => a.status === 'ACTIVE').length,
        totalUsers: agencies.reduce((sum, agency) => sum + agency.stats.userCount, 0),
        totalStudents: agencies.reduce((sum, agency) => sum + agency.stats.studentCount, 0),
        totalApplications: agencies.reduce((sum, agency) => sum + agency.stats.applicationCount, 0)
      }
    }
    
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `admin-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Security Management Handlers
  const fetchApiKeys = async () => {
    setLoadingApiKeys(true)
    try {
      const response = await fetch('/api/admin/security?type=api-keys')
      if (response.ok) {
        const data = await response.json()
        setApiKeys(data.data)
      }
    } catch (error) {
      console.error("Error fetching API keys:", error)
    } finally {
      setLoadingApiKeys(false)
    }
  }

  const fetchRateLimits = async () => {
    setLoadingRateLimits(true)
    try {
      const response = await fetch('/api/admin/security?type=rate-limits')
      if (response.ok) {
        const data = await response.json()
        setRateLimits(data.data)
      }
    } catch (error) {
      console.error("Error fetching rate limits:", error)
    } finally {
      setLoadingRateLimits(false)
    }
  }

  const fetchIpRestrictions = async () => {
    setLoadingIpRestrictions(true)
    try {
      const response = await fetch('/api/admin/security?type=ip-restrictions')
      if (response.ok) {
        const data = await response.json()
        setIpRestrictions(data.data)
      }
    } catch (error) {
      console.error("Error fetching IP restrictions:", error)
    } finally {
      setLoadingIpRestrictions(false)
    }
  }

  const fetchSecurityEvents = async () => {
    setLoadingSecurityEvents(true)
    try {
      const response = await fetch('/api/admin/security?type=security-events')
      if (response.ok) {
        const data = await response.json()
        setSecurityEvents(data.data)
      }
    } catch (error) {
      console.error("Error fetching security events:", error)
    } finally {
      setLoadingSecurityEvents(false)
    }
  }

  const fetchAuditLogs = async () => {
    setLoadingAuditLogs(true)
    try {
      const response = await fetch('/api/admin/audit')
      if (response.ok) {
        const data = await response.json()
        setAuditLogs(data.data.auditLogs)
        setComplianceMetrics(data.data.compliance)
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error)
    } finally {
      setLoadingAuditLogs(false)
    }
  }

  const fetchComplianceMetrics = async () => {
    setLoadingCompliance(true)
    try {
      const response = await fetch('/api/admin/audit')
      if (response.ok) {
        const data = await response.json()
        setComplianceMetrics(data.data.compliance)
      }
    } catch (error) {
      console.error("Error fetching compliance metrics:", error)
    } finally {
      setLoadingCompliance(false)
    }
  }

  // Security Dialog Handlers
  const handleManageApiKeys = () => {
    fetchApiKeys()
    setIsApiKeysDialogOpen(true)
  }

  const handleConfigureRateLimiting = () => {
    fetchRateLimits()
    setIsRateLimitingDialogOpen(true)
  }

  const handleManageIpRestrictions = () => {
    fetchIpRestrictions()
    setIsIpRestrictionsDialogOpen(true)
  }

  const handleViewSecurityEvents = () => {
    fetchSecurityEvents()
    setIsSecurityEventsDialogOpen(true)
  }

  const handleViewAuditLogs = () => {
    fetchAuditLogs()
    setIsAuditLogsDialogOpen(true)
  }

  const handleViewCompliance = () => {
    fetchComplianceMetrics()
    setIsComplianceDialogOpen(true)
  }

  // API Key Management Handlers
  const handleCreateApiKey = async () => {
    try {
      const response = await fetch('/api/admin/security', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'api-key',
          ...newApiKey,
          allowedIPs: newApiKey.allowedIPs.split(',').map(ip => ip.trim()).filter(ip => ip)
        }),
      })

      const result = await response.json()

      if (response.ok) {
        await fetchApiKeys()
        setNewApiKey({
          name: '',
          permissions: ['read'],
          allowedIPs: '',
          rateLimit: 1000,
          expiresAt: ''
        })
        alert('API key created successfully!')
      } else {
        alert(result.error || 'Failed to create API key')
      }
    } catch (error) {
      console.error('Error creating API key:', error)
      alert('Network error. Please try again.')
    }
  }

  const handleDeleteApiKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return

    try {
      const response = await fetch(`/api/admin/security?type=api-key&id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchApiKeys()
        alert('API key deleted successfully!')
      } else {
        alert('Failed to delete API key')
      }
    } catch (error) {
      console.error('Error deleting API key:', error)
      alert('Network error. Please try again.')
    }
  }

  // Rate Limit Management Handlers
  const handleCreateRateLimit = async () => {
    try {
      const response = await fetch('/api/admin/security', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'rate-limit',
          ...newRateLimit
        }),
      })

      const result = await response.json()

      if (response.ok) {
        await fetchRateLimits()
        setNewRateLimit({
          endpoint: '/api/*',
          method: 'ALL',
          requestsPerMinute: 60,
          requestsPerHour: 1000,
          requestsPerDay: 10000,
          burstLimit: 10,
          enabled: true
        })
        alert('Rate limit created successfully!')
      } else {
        alert(result.error || 'Failed to create rate limit')
      }
    } catch (error) {
      console.error('Error creating rate limit:', error)
      alert('Network error. Please try again.')
    }
  }

  const handleDeleteRateLimit = async (id: string) => {
    if (!confirm('Are you sure you want to delete this rate limit?')) return

    try {
      const response = await fetch(`/api/admin/security?type=rate-limit&id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchRateLimits()
        alert('Rate limit deleted successfully!')
      } else {
        alert('Failed to delete rate limit')
      }
    } catch (error) {
      console.error('Error deleting rate limit:', error)
      alert('Network error. Please try again.')
    }
  }

  // IP Restriction Management Handlers
  const handleCreateIpRestriction = async () => {
    try {
      const response = await fetch('/api/admin/security', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'ip-restriction',
          ...newIpRestriction
        }),
      })

      const result = await response.json()

      if (response.ok) {
        await fetchIpRestrictions()
        setNewIpRestriction({
          ipAddress: '',
          type: 'ALLOW',
          description: '',
          enabled: true
        })
        alert('IP restriction created successfully!')
      } else {
        alert(result.error || 'Failed to create IP restriction')
      }
    } catch (error) {
      console.error('Error creating IP restriction:', error)
      alert('Network error. Please try again.')
    }
  }

  const handleDeleteIpRestriction = async (id: string) => {
    if (!confirm('Are you sure you want to delete this IP restriction?')) return

    try {
      const response = await fetch(`/api/admin/security?type=ip-restriction&id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchIpRestrictions()
        alert('IP restriction deleted successfully!')
      } else {
        alert('Failed to delete IP restriction')
      }
    } catch (error) {
      console.error('Error deleting IP restriction:', error)
      alert('Network error. Please try again.')
    }
  }

  // User Management Handlers
  const handleCreateUserChange = (field: string, value: string) => {
    setNewUser(prev => ({ ...prev, [field]: value }))
    if (userFormError) setUserFormError('')
  }

  const validateNewUserForm = () => {
    if (!newUser.name.trim()) return 'User name is required'
    if (!newUser.email.trim()) return 'Email is required'
    if (!newUser.password.trim()) return 'Password is required'
    if (!newUser.agencyId) return 'Agency selection is required'
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newUser.email)) return 'Invalid email format'
    
    // Validate password strength
    if (newUser.password.length < 8) return 'Password must be at least 8 characters long'
    
    return null
  }

  const handleCreateUser = async () => {
    const error = validateNewUserForm()
    if (error) {
      setUserFormError(error)
      return
    }

    setCreatingUser(true)
    setUserFormError('')

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      })

      const result = await response.json()

      if (response.ok) {
        await fetchUsers()
        setNewUser({
          name: '',
          email: '',
          password: '',
          role: 'AGENCY_ADMIN',
          agencyId: '',
          title: '',
          department: '',
          phone: ''
        })
        setIsCreateUserDialogOpen(false)
        alert('User created successfully!')
      } else {
        setUserFormError(result.error || 'Failed to create user')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      setUserFormError('Network error. Please try again.')
    } finally {
      setCreatingUser(false)
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchUsers()
        alert('User deleted successfully!')
      } else {
        alert('Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Network error. Please try again.')
    }
  }

  const handleToggleUserStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        await fetchUsers()
        alert(`User ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully!`)
      } else {
        alert('Failed to update user status')
      }
    } catch (error) {
      console.error('Error updating user status:', error)
      alert('Network error. Please try again.')
    }
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
              
              <Button variant="outline" size="sm" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsSettingsDialogOpen(true)}>
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
              <Dialog open={isNewAgencyDialogOpen} onOpenChange={setIsNewAgencyDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    New Agency
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create New Agency</DialogTitle>
                    <DialogDescription>
                      Create a new agency with an admin user. The admin will receive login credentials via email.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {agencyFormError && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          {agencyFormError}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Agency Name
                      </Label>
                      <Input
                        id="name"
                        value={newAgency.name}
                        onChange={(e) => handleNewAgencyChange('name', e.target.value)}
                        className="col-span-3"
                        placeholder="Enter agency name"
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="subdomain" className="text-right">
                        Subdomain
                      </Label>
                      <Input
                        id="subdomain"
                        value={newAgency.subdomain}
                        onChange={(e) => handleNewAgencyChange('subdomain', e.target.value)}
                        className="col-span-3"
                        placeholder="myagency"
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="customDomain" className="text-right">
                        Custom Domain
                      </Label>
                      <Input
                        id="customDomain"
                        value={newAgency.customDomain}
                        onChange={(e) => handleNewAgencyChange('customDomain', e.target.value)}
                        className="col-span-3"
                        placeholder="agency.com (optional)"
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="plan" className="text-right">
                        Plan
                      </Label>
                      <Select value={newAgency.plan} onValueChange={(value) => handleNewAgencyChange('plan', value)}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select plan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FREE">Free</SelectItem>
                          <SelectItem value="STARTER">Starter</SelectItem>
                          <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                          <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="adminEmail" className="text-right">
                        Admin Email
                      </Label>
                      <Input
                        id="adminEmail"
                        type="email"
                        value={newAgency.adminEmail}
                        onChange={(e) => handleNewAgencyChange('adminEmail', e.target.value)}
                        className="col-span-3"
                        placeholder="admin@agency.com"
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="adminName" className="text-right">
                        Admin Name
                      </Label>
                      <Input
                        id="adminName"
                        value={newAgency.adminName}
                        onChange={(e) => handleNewAgencyChange('adminName', e.target.value)}
                        className="col-span-3"
                        placeholder="Admin Name"
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="adminPassword" className="text-right">
                        Admin Password
                      </Label>
                      <Input
                        id="adminPassword"
                        type="password"
                        value={newAgency.adminPassword}
                        onChange={(e) => handleNewAgencyChange('adminPassword', e.target.value)}
                        className="col-span-3"
                        placeholder="Enter password"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={handleCreateAgency} 
                      disabled={isCreatingAgency}
                    >
                      {isCreatingAgency ? 'Creating...' : 'Create Agency'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {filteredAgencies.map((agency) => (
                <Card key={agency.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
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
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewAgency(agency)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Agency Details Dialog */}
          <Dialog open={isAgencyDetailsOpen} onOpenChange={setIsAgencyDetailsOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Agency Details</DialogTitle>
                <DialogDescription>
                  Detailed information about the selected agency
                </DialogDescription>
              </DialogHeader>
              {selectedAgencyDetails && (
                <div className="grid gap-6 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Agency Name</h4>
                      <p className="text-sm font-medium">{selectedAgencyDetails.name}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Subdomain</h4>
                      <p className="text-sm font-medium">{selectedAgencyDetails.subdomain}</p>
                    </div>
                  </div>
                  
                  {selectedAgencyDetails.customDomain && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Custom Domain</h4>
                      <p className="text-sm font-medium">{selectedAgencyDetails.customDomain}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Status</h4>
                      <Badge className={getStatusColor(selectedAgencyDetails.status)}>
                        {selectedAgencyDetails.status}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Plan</h4>
                      <Badge className={getPlanColor(selectedAgencyDetails.plan)}>
                        {selectedAgencyDetails.plan}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Health Score</h4>
                      <div className="flex items-center gap-1">
                        {getHealthIcon(selectedAgencyDetails.health)}
                        <span className={`text-sm ${getHealthColor(selectedAgencyDetails.health)}`}>
                          {selectedAgencyDetails.health}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Billing Status</h4>
                      <Badge className={getBillingStatusColor(selectedAgencyDetails.billingStatus)}>
                        {selectedAgencyDetails.billingStatus}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Created</h4>
                      <p className="text-sm font-medium">
                        {new Date(selectedAgencyDetails.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Last Activity</h4>
                      <p className="text-sm font-medium">
                        {selectedAgencyDetails.lastActivity 
                          ? new Date(selectedAgencyDetails.lastActivity).toLocaleDateString()
                          : 'No activity'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-sm text-muted-foreground mb-3">Statistics</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 border rounded-lg">
                        <p className="text-lg font-bold">{selectedAgencyDetails.stats.userCount}</p>
                        <p className="text-xs text-muted-foreground">Users</p>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <p className="text-lg font-bold">{selectedAgencyDetails.stats.studentCount}</p>
                        <p className="text-xs text-muted-foreground">Students</p>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <p className="text-lg font-bold">{selectedAgencyDetails.stats.universityCount}</p>
                        <p className="text-xs text-muted-foreground">Universities</p>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <p className="text-lg font-bold">{selectedAgencyDetails.stats.applicationCount}</p>
                        <p className="text-xs text-muted-foreground">Applications</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-sm text-muted-foreground mb-3">Performance Metrics</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Response Time</p>
                        <p className="text-sm font-medium">{formatResponseTime(selectedAgencyDetails.performance.responseTime)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Uptime</p>
                        <p className="text-sm font-medium">{formatUptime(selectedAgencyDetails.performance.uptime)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Error Rate</p>
                        <p className="text-sm font-medium">{formatErrorRate(selectedAgencyDetails.performance.errorRate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Session Duration</p>
                        <p className="text-sm font-medium">{Math.round(selectedAgencyDetails.performance.avgSessionDuration)}s</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAgencyDetailsOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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
                  <Button onClick={handleViewUsers}>View All Users</Button>
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

          {/* Users Management Dialog */}
          <Dialog open={isUsersDialogOpen} onOpenChange={setIsUsersDialogOpen}>
            <DialogContent className="sm:max-w-[1000px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>User Management</DialogTitle>
                <DialogDescription>
                  View and manage users across all tenant agencies
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {loadingUsers ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading users...</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        Showing {users.length} users across all agencies
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => setIsCreateUserDialogOpen(true)}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add User
                        </Button>
                        <Button variant="outline" size="sm" onClick={fetchUsers}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Refresh
                        </Button>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg">
                      <div className="grid grid-cols-12 gap-4 p-4 border-b bg-muted/50 font-medium text-sm">
                        <div className="col-span-3">User</div>
                        <div className="col-span-2">Agency</div>
                        <div className="col-span-2">Role</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-2">Last Login</div>
                        <div className="col-span-1">Actions</div>
                      </div>
                      
                      <div className="divide-y">
                        {users.length === 0 ? (
                          <div className="p-8 text-center text-muted-foreground">
                            No users found
                          </div>
                        ) : (
                          users.map((user) => (
                            <div key={user.id} className="grid grid-cols-12 gap-4 p-4 items-center">
                              <div className="col-span-3">
                                <div className="flex items-center gap-3">
                                  {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                                  ) : (
                                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                      <span className="text-sm font-medium text-primary">
                                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                      </span>
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-medium text-sm">{user.name}</p>
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="col-span-2">
                                <div className="text-sm">
                                  <p className="font-medium">{user.agency?.name}</p>
                                  <p className="text-xs text-muted-foreground">{user.agency?.subdomain}</p>
                                </div>
                              </div>
                              
                              <div className="col-span-2">
                                <Badge variant="outline" className="text-xs">
                                  {user.role}
                                </Badge>
                              </div>
                              
                              <div className="col-span-2">
                                <Badge className={
                                  user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                  user.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                                  'bg-red-100 text-red-800'
                                }>
                                  {user.status}
                                </Badge>
                              </div>
                              
                              <div className="col-span-2">
                                <p className="text-sm text-muted-foreground">
                                  {user.lastLoginAt 
                                    ? new Date(user.lastLoginAt).toLocaleDateString()
                                    : 'Never'
                                  }
                                </p>
                              </div>
                              
                              <div className="col-span-1">
                                <div className="flex gap-1">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleToggleUserStatus(user.id, user.status)}
                                  >
                                    {user.status === 'ACTIVE' ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleDeleteUser(user.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUsersDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <span className="text-sm font-medium">Database</span>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-green-600">Healthy</span>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <span className="text-sm font-medium">API Gateway</span>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-green-600">Healthy</span>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <span className="text-sm font-medium">Cache</span>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-green-600">Healthy</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <span className="text-sm font-medium">Storage</span>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-green-600">Healthy</span>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <span className="text-sm font-medium">Email Service</span>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-green-600">Healthy</span>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <span className="text-sm font-medium">Queue Service</span>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-green-600">Healthy</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <span className="text-sm font-medium">Authentication</span>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-green-600">Healthy</span>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <span className="text-sm font-medium">Monitoring</span>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-green-600">Healthy</span>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
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
                        <Button variant="outline" size="sm" onClick={handleManageApiKeys}>Manage</Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Fingerprint className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium">Rate Limiting</p>
                            <p className="text-sm text-muted-foreground">Configure API rate limits</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleConfigureRateLimiting}>Configure</Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Lock className="h-5 w-5 text-purple-600" />
                          <div>
                            <p className="font-medium">IP Restrictions</p>
                            <p className="text-sm text-muted-foreground">Manage IP access rules</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleManageIpRestrictions}>Manage</Button>
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
                        <Button variant="outline" size="sm" onClick={handleViewSecurityEvents}>View Events</Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Activity className="h-5 w-5 text-orange-600" />
                          <div>
                            <p className="font-medium">Audit Logs</p>
                            <p className="text-sm text-muted-foreground">Access and change logs</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleViewAuditLogs}>View Logs</Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <BarChart3 className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium">Compliance</p>
                            <p className="text-sm text-muted-foreground">Compliance monitoring</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleViewCompliance}>Monitor</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Settings Dialog */}
      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Admin Settings</DialogTitle>
            <DialogDescription>
              Configure admin console settings and preferences
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Display Settings</h3>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="font-medium">Auto-refresh</p>
                    <p className="text-sm text-muted-foreground">Automatically refresh data every 30 seconds</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="font-medium">Compact view</p>
                    <p className="text-sm text-muted-foreground">Show more data in less space</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="font-medium">Show notifications</p>
                    <p className="text-sm text-muted-foreground">Display system notifications</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Data Settings</h3>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="font-medium">Data retention</p>
                    <p className="text-sm text-muted-foreground">Keep logs for 90 days</p>
                  </div>
                  <Select defaultValue="90">
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">180 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="font-medium">Export format</p>
                    <p className="text-sm text-muted-foreground">Default export format</p>
                  </div>
                  <Select defaultValue="json">
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="xlsx">Excel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">System Settings</h3>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="font-medium">Maintenance mode</p>
                    <p className="text-sm text-muted-foreground">Temporarily disable user access</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="font-medium">Debug mode</p>
                    <p className="text-sm text-muted-foreground">Enable debug logging</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsSettingsDialogOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={() => setIsSettingsDialogOpen(false)} className="w-full sm:w-auto">
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* API Keys Management Dialog */}
      <Dialog open={isApiKeysDialogOpen} onOpenChange={setIsApiKeysDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>API Keys Management</DialogTitle>
            <DialogDescription>
              Manage API access keys for your applications
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Create New API Key */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Create New API Key</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="apiKeyName">Key Name</Label>
                  <Input
                    id="apiKeyName"
                    value={newApiKey.name}
                    onChange={(e) => setNewApiKey(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter API key name"
                  />
                </div>
                <div>
                  <Label htmlFor="apiKeyRateLimit">Rate Limit</Label>
                  <Input
                    id="apiKeyRateLimit"
                    type="number"
                    value={newApiKey.rateLimit}
                    onChange={(e) => setNewApiKey(prev => ({ ...prev, rateLimit: parseInt(e.target.value) }))}
                    placeholder="Requests per hour"
                  />
                </div>
                <div>
                  <Label htmlFor="apiKeyAllowedIPs">Allowed IPs (comma-separated)</Label>
                  <Input
                    id="apiKeyAllowedIPs"
                    value={newApiKey.allowedIPs}
                    onChange={(e) => setNewApiKey(prev => ({ ...prev, allowedIPs: e.target.value }))}
                    placeholder="192.168.1.0/24, 10.0.0.1"
                  />
                </div>
                <div>
                  <Label htmlFor="apiKeyExpiry">Expiry Date</Label>
                  <Input
                    id="apiKeyExpiry"
                    type="date"
                    value={newApiKey.expiresAt}
                    onChange={(e) => setNewApiKey(prev => ({ ...prev, expiresAt: e.target.value }))}
                  />
                </div>
              </div>
              <Button onClick={handleCreateApiKey} className="mt-4">
                Create API Key
              </Button>
            </div>

            {/* Existing API Keys */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Existing API Keys</h3>
              {loadingApiKeys ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading API keys...</span>
                </div>
              ) : (
                <div className="border rounded-lg">
                  <div className="grid grid-cols-12 gap-4 p-4 border-b bg-muted/50 font-medium text-sm">
                    <div className="col-span-3">Name</div>
                    <div className="col-span-3">Key</div>
                    <div className="col-span-2">Rate Limit</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2">Actions</div>
                  </div>
                  <div className="divide-y">
                    {apiKeys.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        No API keys found
                      </div>
                    ) : (
                      apiKeys.map((key) => (
                        <div key={key.id} className="grid grid-cols-12 gap-4 p-4 items-center">
                          <div className="col-span-3">
                            <p className="font-medium">{key.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Created: {new Date(key.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="col-span-3">
                            <p className="font-mono text-sm">{key.key}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm">{key.rateLimit}/hr</p>
                          </div>
                          <div className="col-span-2">
                            <Badge className={key.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {key.enabled ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="col-span-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteApiKey(key.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rate Limiting Configuration Dialog */}
      <Dialog open={isRateLimitingDialogOpen} onOpenChange={setIsRateLimitingDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Rate Limiting Configuration</DialogTitle>
            <DialogDescription>
              Configure API rate limits for different endpoints
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Create New Rate Limit */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Create New Rate Limit</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rateLimitEndpoint">Endpoint Pattern</Label>
                  <Input
                    id="rateLimitEndpoint"
                    value={newRateLimit.endpoint}
                    onChange={(e) => setNewRateLimit(prev => ({ ...prev, endpoint: e.target.value }))}
                    placeholder="/api/*"
                  />
                </div>
                <div>
                  <Label htmlFor="rateLimitMethod">HTTP Method</Label>
                  <Select value={newRateLimit.method} onValueChange={(value) => setNewRateLimit(prev => ({ ...prev, method: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">ALL</SelectItem>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="rateLimitPerMinute">Requests per Minute</Label>
                  <Input
                    id="rateLimitPerMinute"
                    type="number"
                    value={newRateLimit.requestsPerMinute}
                    onChange={(e) => setNewRateLimit(prev => ({ ...prev, requestsPerMinute: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="rateLimitPerHour">Requests per Hour</Label>
                  <Input
                    id="rateLimitPerHour"
                    type="number"
                    value={newRateLimit.requestsPerHour}
                    onChange={(e) => setNewRateLimit(prev => ({ ...prev, requestsPerHour: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="rateLimitPerDay">Requests per Day</Label>
                  <Input
                    id="rateLimitPerDay"
                    type="number"
                    value={newRateLimit.requestsPerDay}
                    onChange={(e) => setNewRateLimit(prev => ({ ...prev, requestsPerDay: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="rateLimitBurst">Burst Limit</Label>
                  <Input
                    id="rateLimitBurst"
                    type="number"
                    value={newRateLimit.burstLimit}
                    onChange={(e) => setNewRateLimit(prev => ({ ...prev, burstLimit: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-4">
                <Switch
                  checked={newRateLimit.enabled}
                  onCheckedChange={(checked) => setNewRateLimit(prev => ({ ...prev, enabled: checked }))}
                />
                <Label>Enabled</Label>
              </div>
              <Button onClick={handleCreateRateLimit} className="mt-4">
                Create Rate Limit
              </Button>
            </div>

            {/* Existing Rate Limits */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Existing Rate Limits</h3>
              {loadingRateLimits ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading rate limits...</span>
                </div>
              ) : (
                <div className="border rounded-lg">
                  <div className="grid grid-cols-12 gap-4 p-4 border-b bg-muted/50 font-medium text-sm">
                    <div className="col-span-3">Endpoint</div>
                    <div className="col-span-2">Method</div>
                    <div className="col-span-2">Minute</div>
                    <div className="col-span-2">Hour</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-1">Actions</div>
                  </div>
                  <div className="divide-y">
                    {rateLimits.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        No rate limits found
                      </div>
                    ) : (
                      rateLimits.map((limit) => (
                        <div key={limit.id} className="grid grid-cols-12 gap-4 p-4 items-center">
                          <div className="col-span-3">
                            <p className="font-medium">{limit.endpoint}</p>
                          </div>
                          <div className="col-span-2">
                            <Badge variant="outline">{limit.method}</Badge>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm">{limit.requestsPerMinute}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm">{limit.requestsPerHour}</p>
                          </div>
                          <div className="col-span-2">
                            <Badge className={limit.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {limit.enabled ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="col-span-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteRateLimit(limit.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* IP Restrictions Management Dialog */}
      <Dialog open={isIpRestrictionsDialogOpen} onOpenChange={setIsIpRestrictionsDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>IP Restrictions Management</DialogTitle>
            <DialogDescription>
              Manage IP address access rules for your system
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Create New IP Restriction */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Create New IP Restriction</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ipRestrictionAddress">IP Address/CIDR</Label>
                  <Input
                    id="ipRestrictionAddress"
                    value={newIpRestriction.ipAddress}
                    onChange={(e) => setNewIpRestriction(prev => ({ ...prev, ipAddress: e.target.value }))}
                    placeholder="192.168.1.0/24"
                  />
                </div>
                <div>
                  <Label htmlFor="ipRestrictionType">Type</Label>
                  <Select value={newIpRestriction.type} onValueChange={(value) => setNewIpRestriction(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALLOW">ALLOW</SelectItem>
                      <SelectItem value="DENY">DENY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="ipRestrictionDescription">Description</Label>
                  <Input
                    id="ipRestrictionDescription"
                    value={newIpRestriction.description}
                    onChange={(e) => setNewIpRestriction(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter description"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-4">
                <Switch
                  checked={newIpRestriction.enabled}
                  onCheckedChange={(checked) => setNewIpRestriction(prev => ({ ...prev, enabled: checked }))}
                />
                <Label>Enabled</Label>
              </div>
              <Button onClick={handleCreateIpRestriction} className="mt-4">
                Create IP Restriction
              </Button>
            </div>

            {/* Existing IP Restrictions */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Existing IP Restrictions</h3>
              {loadingIpRestrictions ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading IP restrictions...</span>
                </div>
              ) : (
                <div className="border rounded-lg">
                  <div className="grid grid-cols-12 gap-4 p-4 border-b bg-muted/50 font-medium text-sm">
                    <div className="col-span-4">IP Address</div>
                    <div className="col-span-2">Type</div>
                    <div className="col-span-3">Description</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-1">Actions</div>
                  </div>
                  <div className="divide-y">
                    {ipRestrictions.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        No IP restrictions found
                      </div>
                    ) : (
                      ipRestrictions.map((restriction) => (
                        <div key={restriction.id} className="grid grid-cols-12 gap-4 p-4 items-center">
                          <div className="col-span-4">
                            <p className="font-medium">{restriction.ipAddress}</p>
                          </div>
                          <div className="col-span-2">
                            <Badge className={restriction.type === 'ALLOW' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {restriction.type}
                            </Badge>
                          </div>
                          <div className="col-span-3">
                            <p className="text-sm">{restriction.description}</p>
                          </div>
                          <div className="col-span-2">
                            <Badge className={restriction.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {restriction.enabled ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="col-span-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteIpRestriction(restriction.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Security Events Dialog */}
      <Dialog open={isSecurityEventsDialogOpen} onOpenChange={setIsSecurityEventsDialogOpen}>
        <DialogContent className="sm:max-w-[1000px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Security Events</DialogTitle>
            <DialogDescription>
              View recent security incidents and events
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {loadingSecurityEvents ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                <span>Loading security events...</span>
              </div>
            ) : (
              <div className="border rounded-lg">
                <div className="grid grid-cols-12 gap-4 p-4 border-b bg-muted/50 font-medium text-sm">
                  <div className="col-span-2">Time</div>
                  <div className="col-span-2">Type</div>
                  <div className="col-span-3">Title</div>
                  <div className="col-span-3">Description</div>
                  <div className="col-span-1">Severity</div>
                  <div className="col-span-1">Agency</div>
                </div>
                <div className="divide-y max-h-96 overflow-y-auto">
                  {securityEvents.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      No security events found
                    </div>
                  ) : (
                    securityEvents.map((event) => (
                      <div key={event.id} className="grid grid-cols-12 gap-4 p-4 items-center">
                        <div className="col-span-2">
                          <p className="text-sm">{new Date(event.timestamp).toLocaleString()}</p>
                        </div>
                        <div className="col-span-2">
                          <Badge variant="outline">{event.type}</Badge>
                        </div>
                        <div className="col-span-3">
                          <p className="font-medium">{event.title}</p>
                        </div>
                        <div className="col-span-3">
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                        </div>
                        <div className="col-span-1">
                          <Badge className={
                            event.severity === 'critical' ? 'bg-red-100 text-red-800' :
                            event.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                            event.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }>
                            {event.severity}
                          </Badge>
                        </div>
                        <div className="col-span-1">
                          <p className="text-sm">{event.agency?.name || 'System'}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Audit Logs Dialog */}
      <Dialog open={isAuditLogsDialogOpen} onOpenChange={setIsAuditLogsDialogOpen}>
        <DialogContent className="sm:max-w-[1200px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Audit Logs</DialogTitle>
            <DialogDescription>
              View system audit logs and compliance information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Compliance Metrics */}
            {complianceMetrics && (
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Compliance Status</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{complianceMetrics.totalLogs}</p>
                    <p className="text-sm text-muted-foreground">Total Logs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{complianceMetrics.securityEvents}</p>
                    <p className="text-sm text-muted-foreground">Security Events</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{complianceMetrics.failedLogins}</p>
                    <p className="text-sm text-muted-foreground">Failed Logins</p>
                  </div>
                  <div className="text-center">
                    <Badge className={
                      complianceMetrics.complianceStatus === 'COMPLIANT' ? 'bg-green-100 text-green-800' :
                      complianceMetrics.complianceStatus === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {complianceMetrics.complianceStatus}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">Compliance Status</p>
                  </div>
                </div>
              </div>
            )}

            {/* Audit Logs */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Recent Audit Logs</h3>
              {loadingAuditLogs ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading audit logs...</span>
                </div>
              ) : (
                <div className="border rounded-lg">
                  <div className="grid grid-cols-12 gap-4 p-4 border-b bg-muted/50 font-medium text-sm">
                    <div className="col-span-2">Time</div>
                    <div className="col-span-2">User</div>
                    <div className="col-span-2">Agency</div>
                    <div className="col-span-2">Action</div>
                    <div className="col-span-2">Entity</div>
                    <div className="col-span-1">IP Address</div>
                    <div className="col-span-1">Details</div>
                  </div>
                  <div className="divide-y max-h-96 overflow-y-auto">
                    {auditLogs.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        No audit logs found
                      </div>
                    ) : (
                      auditLogs.map((log) => (
                        <div key={log.id} className="grid grid-cols-12 gap-4 p-4 items-center">
                          <div className="col-span-2">
                            <p className="text-sm">{new Date(log.timestamp).toLocaleString()}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm">{log.user?.name || 'System'}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm">{log.agency?.name || 'N/A'}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="font-medium text-sm">{log.action}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm">{log.entityType}</p>
                          </div>
                          <div className="col-span-1">
                            <p className="text-sm">{log.ipAddress || 'N/A'}</p>
                          </div>
                          <div className="col-span-1">
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Compliance Monitoring Dialog */}
      <Dialog open={isComplianceDialogOpen} onOpenChange={setIsComplianceDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Compliance Monitoring</DialogTitle>
            <DialogDescription>
              Monitor compliance metrics and security posture
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {loadingCompliance ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                <span>Loading compliance metrics...</span>
              </div>
            ) : complianceMetrics ? (
              <>
                {/* Compliance Overview */}
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Compliance Overview</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Failed Login Rate:</span>
                        <span className={complianceMetrics.metrics.failedLoginRate > 5 ? 'text-red-600' : 'text-green-600'}>
                          {complianceMetrics.metrics.failedLoginRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Security Event Rate:</span>
                        <span className={complianceMetrics.metrics.securityEventRate > 2 ? 'text-red-600' : 'text-green-600'}>
                          {complianceMetrics.metrics.securityEventRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sensitive Action Rate:</span>
                        <span className={complianceMetrics.metrics.sensitiveActionRate > 20 ? 'text-yellow-600' : 'text-green-600'}>
                          {complianceMetrics.metrics.sensitiveActionRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Logs:</span>
                        <span>{complianceMetrics.totalLogs}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Security Events:</span>
                        <span>{complianceMetrics.securityEvents}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Data Access Logs:</span>
                        <span>{complianceMetrics.dataAccessLogs}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Compliance Status */}
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Compliance Status</h3>
                  <div className="text-center">
                    <Badge className={
                      complianceMetrics.complianceStatus === 'COMPLIANT' ? 'bg-green-100 text-green-800 text-lg px-4 py-2' :
                      complianceMetrics.complianceStatus === 'WARNING' ? 'bg-yellow-100 text-yellow-800 text-lg px-4 py-2' :
                      'bg-red-100 text-red-800 text-lg px-4 py-2'
                    }>
                      {complianceMetrics.complianceStatus}
                    </Badge>
                  </div>
                </div>

                {/* Recommendations */}
                {complianceMetrics.recommendations && complianceMetrics.recommendations.length > 0 && (
                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
                    <div className="space-y-3">
                      {complianceMetrics.recommendations.map((rec, index) => (
                        <Alert key={index} className={rec.priority === 'high' ? 'border-red-200' : 'border-yellow-200'}>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <div className="font-medium">{rec.title}</div>
                            <div className="text-sm mt-1">{rec.description}</div>
                            <div className="text-sm mt-1 font-medium">{rec.action}</div>
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No compliance data available
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the system
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {userFormError && (
              <Alert className="border-red-200">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{userFormError}</AlertDescription>
              </Alert>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="userName">Full Name</Label>
                <Input
                  id="userName"
                  value={newUser.name}
                  onChange={(e) => handleCreateUserChange('name', e.target.value)}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="userEmail">Email</Label>
                <Input
                  id="userEmail"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => handleCreateUserChange('email', e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="userPassword">Password</Label>
                <Input
                  id="userPassword"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => handleCreateUserChange('password', e.target.value)}
                  placeholder="Enter password"
                />
              </div>
              <div>
                <Label htmlFor="userRole">Role</Label>
                <Select value={newUser.role} onValueChange={(value) => handleCreateUserChange('role', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AGENCY_ADMIN">Agency Admin</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="ADMIN">System Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="userAgency">Agency</Label>
                <Select value={newUser.agencyId} onValueChange={(value) => handleCreateUserChange('agencyId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select agency" />
                  </SelectTrigger>
                  <SelectContent>
                    {agencies.map((agency) => (
                      <SelectItem key={agency.id} value={agency.id}>
                        {agency.name} ({agency.subdomain})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="userTitle">Title</Label>
                <Input
                  id="userTitle"
                  value={newUser.title}
                  onChange={(e) => handleCreateUserChange('title', e.target.value)}
                  placeholder="Job title"
                />
              </div>
              <div>
                <Label htmlFor="userDepartment">Department</Label>
                <Input
                  id="userDepartment"
                  value={newUser.department}
                  onChange={(e) => handleCreateUserChange('department', e.target.value)}
                  placeholder="Department"
                />
              </div>
              <div>
                <Label htmlFor="userPhone">Phone</Label>
                <Input
                  id="userPhone"
                  value={newUser.phone}
                  onChange={(e) => handleCreateUserChange('phone', e.target.value)}
                  placeholder="Phone number"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateUserDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateUser} disabled={creatingUser}>
              {creatingUser ? 'Creating...' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}