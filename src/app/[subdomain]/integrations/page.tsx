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
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Plus,
  Search,
  Filter,
  Plug,
  Settings,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ExternalLink,
  RefreshCw,
  Shield,
  Database,
  Mail,
  MessageSquare,
  Calendar,
  FileText,
  CreditCard,
  Users,
  BarChart3,
  Zap,
  Cloud,
  Github,
  Chrome,
  Slack,
  Zap as ZapIcon
} from "lucide-react"

interface Integration {
  id: string
  name: string
  description: string
  category: 'CRM' | 'COMMUNICATION' | 'PAYMENT' | 'ANALYTICS' | 'PRODUCTIVITY' | 'MARKETING' | 'STORAGE' | 'OTHER'
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'PENDING'
  isConnected: boolean
  config: Record<string, any>
  lastSyncAt?: string
  nextSyncAt?: string
  icon: string
  website?: string
  features: string[]
  pricing: 'FREE' | 'FREEMIUM' | 'PAID'
}

interface IntegrationStats {
  totalIntegrations: number
  connectedIntegrations: number
  activeSyncs: number
  failedSyncs: number
}

export default function IntegrationsPage() {
  const params = useParams()
  const subdomain = params.subdomain as string
  
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [stats, setStats] = useState<IntegrationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [isConfigureOpen, setIsConfigureOpen] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  useEffect(() => {
    fetchIntegrationsData()
  }, [subdomain])

  const fetchIntegrationsData = async () => {
    try {
      setLoading(true)
      
      // Mock integrations data - in real implementation, this would come from API
      const mockIntegrations: Integration[] = [
        {
          id: "1",
          name: "QuickBooks",
          description: "Accounting software for small businesses",
          category: "PAYMENT",
          status: "CONNECTED",
          isConnected: true,
          config: { apiKey: "****", companyId: "12345" },
          lastSyncAt: new Date().toISOString(),
          nextSyncAt: new Date(Date.now() + 3600000).toISOString(),
          icon: "quickbooks",
          website: "https://quickbooks.intuit.com",
          features: ["Invoice Sync", "Payment Tracking", "Financial Reports"],
          pricing: "PAID"
        },
        {
          id: "2",
          name: "Mailchimp",
          description: "Email marketing and automation platform",
          category: "MARKETING",
          status: "DISCONNECTED",
          isConnected: false,
          config: {},
          icon: "mailchimp",
          website: "https://mailchimp.com",
          features: ["Email Campaigns", "Automation", "Analytics"],
          pricing: "FREEMIUM"
        },
        {
          id: "3",
          name: "Google Analytics",
          description: "Web analytics service",
          category: "ANALYTICS",
          status: "CONNECTED",
          isConnected: true,
          config: { trackingId: "UA-123456789-1" },
          lastSyncAt: new Date().toISOString(),
          icon: "google",
          website: "https://analytics.google.com",
          features: ["Traffic Analysis", "User Behavior", "Conversion Tracking"],
          pricing: "FREE"
        },
        {
          id: "4",
          name: "Slack",
          description: "Team communication and collaboration",
          category: "COMMUNICATION",
          status: "PENDING",
          isConnected: false,
          config: {},
          icon: "slack",
          website: "https://slack.com",
          features: ["Team Notifications", "Channel Integration", "File Sharing"],
          pricing: "FREEMIUM"
        },
        {
          id: "5",
          name: "Stripe",
          description: "Payment processing platform",
          category: "PAYMENT",
          status: "DISCONNECTED",
          isConnected: false,
          config: {},
          icon: "stripe",
          website: "https://stripe.com",
          features: ["Payment Processing", "Subscription Management", "Invoicing"],
          pricing: "PAID"
        },
        {
          id: "6",
          name: "Dropbox",
          description: "Cloud storage and file sharing",
          category: "STORAGE",
          status: "CONNECTED",
          isConnected: true,
          config: { accessToken: "****", folder: "/agency-docs" },
          lastSyncAt: new Date().toISOString(),
          icon: "dropbox",
          website: "https://dropbox.com",
          features: ["File Storage", "Document Sync", "Team Collaboration"],
          pricing: "FREEMIUM"
        }
      ]

      setIntegrations(mockIntegrations)

      const integrationStats: IntegrationStats = {
        totalIntegrations: mockIntegrations.length,
        connectedIntegrations: mockIntegrations.filter(i => i.isConnected).length,
        activeSyncs: mockIntegrations.filter(i => i.status === 'CONNECTED').length,
        failedSyncs: mockIntegrations.filter(i => i.status === 'ERROR').length
      }
      
      setStats(integrationStats)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleConnectIntegration = async (integration: Integration) => {
    setSelectedIntegration(integration)
    setIsConfigureOpen(true)
  }

  const handleDisconnectIntegration = async (integrationId: string) => {
    if (!confirm('Are you sure you want to disconnect this integration?')) {
      return
    }

    try {
      // In real implementation, this would call the API
      setIntegrations(prev => 
        prev.map(int => 
          int.id === integrationId 
            ? { ...int, isConnected: false, status: 'DISCONNECTED' as const }
            : int
        )
      )
      
      // Update stats
      if (stats) {
        setStats({
          ...stats,
          connectedIntegrations: Math.max(0, stats.connectedIntegrations - 1),
          activeSyncs: Math.max(0, stats.activeSyncs - 1)
        })
      }
    } catch (err) {
      alert('Failed to disconnect integration')
    }
  }

  const handleSyncIntegration = async (integrationId: string) => {
    try {
      // In real implementation, this would call the sync API
      setIntegrations(prev => 
        prev.map(int => 
          int.id === integrationId 
            ? { 
                ...int, 
                status: 'PENDING' as const,
                lastSyncAt: new Date().toISOString(),
                nextSyncAt: new Date(Date.now() + 3600000).toISOString()
              }
            : int
        )
      )
      
      // Simulate sync completion
      setTimeout(() => {
        setIntegrations(prev => 
          prev.map(int => 
            int.id === integrationId 
              ? { ...int, status: 'CONNECTED' as const }
              : int
          )
        )
      }, 2000)
    } catch (err) {
      alert('Failed to sync integration')
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "CRM": return <Users className="h-5 w-5" />
      case "COMMUNICATION": return <MessageSquare className="h-5 w-5" />
      case "PAYMENT": return <CreditCard className="h-5 w-5" />
      case "ANALYTICS": return <BarChart3 className="h-5 w-5" />
      case "PRODUCTIVITY": return <Zap className="h-5 w-5" />
      case "MARKETING": return <Mail className="h-5 w-5" />
      case "STORAGE": return <Cloud className="h-5 w-5" />
      default: return <Plug className="h-5 w-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONNECTED": return "bg-green-100 text-green-800"
      case "DISCONNECTED": return "bg-gray-100 text-gray-800"
      case "ERROR": return "bg-red-100 text-red-800"
      case "PENDING": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPricingColor = (pricing: string) => {
    switch (pricing) {
      case "FREE": return "bg-green-100 text-green-800"
      case "FREEMIUM": return "bg-blue-100 text-blue-800"
      case "PAID": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || integration.category === categoryFilter
    return matchesSearch && matchesCategory
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
          <h1 className="text-3xl font-bold">Integrations</h1>
          <p className="text-muted-foreground">Connect and manage third-party services</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Browse Marketplace
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Plug className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalIntegrations}</div>
              <p className="text-xs text-muted-foreground">available integrations</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connected</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.connectedIntegrations}</div>
              <p className="text-xs text-muted-foreground">active connections</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Syncing</CardTitle>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSyncs}</div>
              <p className="text-xs text-muted-foreground">currently syncing</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Errors</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.failedSyncs}</div>
              <p className="text-xs text-muted-foreground">sync errors</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="integrations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="connections">Active Connections</TabsTrigger>
          <TabsTrigger value="logs">Sync Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search integrations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="CRM">CRM</SelectItem>
                  <SelectItem value="COMMUNICATION">Communication</SelectItem>
                  <SelectItem value="PAYMENT">Payment</SelectItem>
                  <SelectItem value="ANALYTICS">Analytics</SelectItem>
                  <SelectItem value="MARKETING">Marketing</SelectItem>
                  <SelectItem value="STORAGE">Storage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Integrations Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegrations.map((integration) => (
              <Card key={integration.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        {getCategoryIcon(integration.category)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getStatusColor(integration.status)}>
                            {integration.status}
                          </Badge>
                          <Badge className={getPricingColor(integration.pricing)}>
                            {integration.pricing}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardDescription>{integration.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {integration.features.slice(0, 3).map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {integration.features.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{integration.features.length - 3} more
                        </Badge>
                      )}
                    </div>
                    
                    {integration.lastSyncAt && (
                      <div className="text-xs text-muted-foreground">
                        Last sync: {new Date(integration.lastSyncAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {integration.isConnected ? (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleSyncIntegration(integration.id)}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Sync
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDisconnectIntegration(integration.id)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleConnectIntegration(integration)}
                      >
                        <Plug className="h-4 w-4 mr-2" />
                        Connect
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="connections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Connections</CardTitle>
              <CardDescription>Manage your active integration connections</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Integration</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Sync</TableHead>
                    <TableHead>Next Sync</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {integrations.filter(i => i.isConnected).map((integration) => (
                    <TableRow key={integration.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            {getCategoryIcon(integration.category)}
                          </div>
                          <div>
                            <p className="font-medium">{integration.name}</p>
                            <p className="text-sm text-muted-foreground">{integration.description}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{integration.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(integration.status)}>
                          {integration.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {integration.lastSyncAt ? (
                          <span className="text-sm">{new Date(integration.lastSyncAt).toLocaleString()}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {integration.nextSyncAt ? (
                          <span className="text-sm">{new Date(integration.nextSyncAt).toLocaleString()}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Not scheduled</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDisconnectIntegration(integration.id)}
                          >
                            <Plug className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sync Logs</CardTitle>
              <CardDescription>View integration synchronization logs and errors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Database className="h-16 w-16 mx-auto mb-4" />
                <p>Sync logs will be displayed here</p>
                <p className="text-sm">This would show detailed logs for all integration activities</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Configuration Dialog */}
      <Dialog open={isConfigureOpen} onOpenChange={setIsConfigureOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Configure Integration</DialogTitle>
            <DialogDescription>
              {selectedIntegration && `Connect ${selectedIntegration.name} to your agency`}
            </DialogDescription>
          </DialogHeader>
          {selectedIntegration && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    {getCategoryIcon(selectedIntegration.category)}
                  </div>
                  <div>
                    <p className="font-medium">{selectedIntegration.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedIntegration.description}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input 
                    id="apiKey" 
                    type="password"
                    placeholder="Enter your API key"
                  />
                </div>
                
                {selectedIntegration.category === 'PAYMENT' && (
                  <div>
                    <Label htmlFor="accountId">Account ID</Label>
                    <Input 
                      id="accountId" 
                      placeholder="Enter your account ID"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch id="auto-sync" />
                  <Label htmlFor="auto-sync">Enable automatic sync</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="webhooks" />
                  <Label htmlFor="webhooks">Enable webhooks</Label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    // Simulate connection
                    setIntegrations(prev => 
                      prev.map(int => 
                        int.id === selectedIntegration.id 
                          ? { ...int, isConnected: true, status: 'CONNECTED' as const }
                          : int
                      )
                    )
                    setIsConfigureOpen(false)
                  }}
                  className="flex-1"
                >
                  Connect Integration
                </Button>
                <Button variant="outline" onClick={() => setIsConfigureOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}