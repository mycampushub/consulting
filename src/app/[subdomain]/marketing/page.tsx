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
import { 
  Plus,
  Search,
  Filter,
  Play,
  Pause,
  Settings,
  Users,
  Mail,
  MessageSquare,
  Share2,
  Target,
  TrendingUp,
  Calendar,
  DollarSign,
  BarChart3,
  Zap,
  Workflow,
  FileText,
  Edit,
  Trash2,
  Copy,
  Eye,
  MoreHorizontal,
  CheckCircle,
  Loader2,
  AlertTriangle
} from "lucide-react"

interface Campaign {
  id: string
  name: string
  description?: string
  type: 'EMAIL' | 'SMS' | 'SOCIAL_MEDIA' | 'GOOGLE_ADS' | 'FACEBOOK_ADS' | 'CONTENT' | 'WEBINAR' | 'EVENT'
  status: 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
  sentCount: number
  deliveredCount: number
  openedCount: number
  clickedCount: number
  conversionCount: number
  budget?: number
  spent: number
  scheduledAt?: string
  startedAt?: string
  completedAt?: string
  workflow?: {
    id: string
    name: string
  }
  targetAudience?: any
  content?: any
}

interface Lead {
  id: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  source: string
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'NURTURING' | 'CONVERTED' | 'LOST'
  converted: boolean
  convertedAt?: string
  createdAt: string
  assignedTo?: string
  customFields?: any
  campaign?: {
    id: string
    name: string
  }
}

interface Workflow {
  id: string
  name: string
  description?: string
  category: 'GENERAL' | 'LEAD_NURTURING' | 'STUDENT_ONBOARDING' | 'FOLLOW_UP' | 'NOTIFICATION' | 'INTEGRATION'
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED'
  isActive: boolean
  executionCount: number
  lastExecutedAt?: string
  nodes: any[]
  edges: any[]
}

export default function MarketingPage() {
  const params = useParams()
  const subdomain = params.subdomain as string
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false)
  const [isCreateLeadOpen, setIsCreateLeadOpen] = useState(false)
  const [isCreateWorkflowOpen, setIsCreateWorkflowOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  // Form states
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    description: "",
    type: "EMAIL" as Campaign['type'],
    budget: "",
    targetAudience: [] as any[],
    content: {} as any,
    workflowId: "",
    scheduledAt: ""
  })

  const [newLead, setNewLead] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    source: "",
    status: "NEW" as Lead['status'],
    assignedTo: "",
    customFields: {} as any,
    campaignId: ""
  })

  const [newWorkflow, setNewWorkflow] = useState({
    name: "",
    description: "",
    category: "GENERAL" as Workflow['category'],
    triggers: [] as any[],
    nodes: [] as any[],
    edges: [] as any[],
    isActive: false
  })

  // Fetch data from API
  const fetchCampaigns = async () => {
    try {
      const params = new URLSearchParams({
        page: "1",
        limit: "50",
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(typeFilter !== "all" && { type: typeFilter })
      })
      
      const response = await fetch(`/api/${subdomain}/marketing/campaigns?${params}`)
      if (!response.ok) throw new Error('Failed to fetch campaigns')
      
      const data = await response.json()
      setCampaigns(data.campaigns || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const fetchLeads = async () => {
    try {
      const response = await fetch(`/api/${subdomain}/marketing/leads?limit=50`)
      if (!response.ok) throw new Error('Failed to fetch leads')
      
      const data = await response.json()
      setLeads(data.leads || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const fetchWorkflows = async () => {
    try {
      const response = await fetch(`/api/${subdomain}/workflows?limit=50`)
      if (!response.ok) throw new Error('Failed to fetch workflows')
      
      const data = await response.json()
      setWorkflows(data.workflows || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        await Promise.all([fetchCampaigns(), fetchLeads(), fetchWorkflows()])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [subdomain])

  useEffect(() => {
    fetchCampaigns()
  }, [statusFilter, typeFilter])

  const handleCreateCampaign = async () => {
    if (!newCampaign.name) {
      alert("Campaign name is required")
      return
    }

    setSubmitting(true)
    try {
      const campaignData = {
        name: newCampaign.name,
        description: newCampaign.description || undefined,
        type: newCampaign.type,
        budget: newCampaign.budget ? parseFloat(newCampaign.budget) : undefined,
        targetAudience: newCampaign.targetAudience.length > 0 ? newCampaign.targetAudience : undefined,
        content: Object.keys(newCampaign.content).length > 0 ? newCampaign.content : undefined,
        workflowId: newCampaign.workflowId || undefined,
        scheduledAt: newCampaign.scheduledAt || undefined
      }

      const response = await fetch(`/api/${subdomain}/marketing/campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaignData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create campaign')
      }

      await fetchCampaigns()
      setIsCreateCampaignOpen(false)
      // Reset form
      setNewCampaign({
        name: "",
        description: "",
        type: "EMAIL",
        budget: "",
        targetAudience: [],
        content: {},
        workflowId: "",
        scheduledAt: ""
      })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create campaign')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateLead = async () => {
    if (!newLead.email && !newLead.phone) {
      alert("Email or phone is required")
      return
    }

    setSubmitting(true)
    try {
      const leadData = {
        firstName: newLead.firstName || undefined,
        lastName: newLead.lastName || undefined,
        email: newLead.email || undefined,
        phone: newLead.phone || undefined,
        source: newLead.source || "Manual",
        status: newLead.status,
        assignedTo: newLead.assignedTo || undefined,
        customFields: Object.keys(newLead.customFields).length > 0 ? newLead.customFields : undefined,
        campaignId: newLead.campaignId || undefined
      }

      const response = await fetch(`/api/${subdomain}/marketing/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create lead')
      }

      await fetchLeads()
      setIsCreateLeadOpen(false)
      // Reset form
      setNewLead({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        source: "",
        status: "NEW",
        assignedTo: "",
        customFields: {},
        campaignId: ""
      })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create lead')
    } finally {
      setSubmitting(false)
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
        description: newWorkflow.description,
        category: newWorkflow.category,
        triggers: newWorkflow.triggers,
        nodes: newWorkflow.nodes,
        edges: newWorkflow.edges,
        isActive: newWorkflow.isActive
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

      await fetchWorkflows()
      setIsCreateWorkflowOpen(false)
      // Reset form
      setNewWorkflow({
        name: "",
        description: "",
        category: "GENERAL",
        triggers: [],
        nodes: [],
        edges: [],
        isActive: false
      })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create workflow')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) {
      return
    }

    try {
      const response = await fetch(`/api/${subdomain}/marketing/campaigns/${campaignId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete campaign')
      }

      await fetchCampaigns()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete campaign')
    }
  }

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) {
      return
    }

    try {
      const response = await fetch(`/api/${subdomain}/marketing/leads/${leadId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete lead')
      }

      await fetchLeads()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete lead')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-green-100 text-green-800"
      case "DRAFT": return "bg-gray-100 text-gray-800"
      case "SCHEDULED": return "bg-blue-100 text-blue-800"
      case "PAUSED": return "bg-yellow-100 text-yellow-800"
      case "COMPLETED": return "bg-purple-100 text-purple-800"
      case "CANCELLED": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getCampaignTypeIcon = (type: string) => {
    switch (type) {
      case "EMAIL": return <Mail className="h-4 w-4" />
      case "SMS": return <MessageSquare className="h-4 w-4" />
      case "SOCIAL_MEDIA": return <Share2 className="h-4 w-4" />
      case "GOOGLE_ADS": return <Target className="h-4 w-4" />
      case "FACEBOOK_ADS": return <Share2 className="h-4 w-4" />
      case "CONTENT": return <FileText className="h-4 w-4" />
      case "WEBINAR": return <Calendar className="h-4 w-4" />
      case "EVENT": return <Calendar className="h-4 w-4" />
      default: return <Target className="h-4 w-4" />
    }
  }

  const getLeadStatusColor = (status: string) => {
    switch (status) {
      case "NEW": return "bg-blue-100 text-blue-800"
      case "CONTACTED": return "bg-yellow-100 text-yellow-800"
      case "QUALIFIED": return "bg-green-100 text-green-800"
      case "NURTURING": return "bg-purple-100 text-purple-800"
      case "CONVERTED": return "bg-gray-100 text-gray-800"
      case "LOST": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter
    const matchesType = typeFilter === "all" || campaign.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const filteredLeads = leads.filter(lead => {
    return lead.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           lead.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           lead.email?.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const calculateCampaignMetrics = (campaign: Campaign) => {
    const openRate = campaign.deliveredCount > 0 ? (campaign.openedCount / campaign.deliveredCount) * 100 : 0
    const clickRate = campaign.openedCount > 0 ? (campaign.clickedCount / campaign.openedCount) * 100 : 0
    const conversionRate = campaign.clickedCount > 0 ? (campaign.conversionCount / campaign.clickedCount) * 100 : 0
    return { openRate, clickRate, conversionRate }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Marketing Automation</h2>
          <p className="text-muted-foreground">
            Manage campaigns, leads, and automation workflows
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isCreateLeadOpen} onOpenChange={setIsCreateLeadOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Add Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Lead</DialogTitle>
                <DialogDescription>Create a new lead in your marketing pipeline</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      placeholder="First name"
                      value={newLead.firstName}
                      onChange={(e) => setNewLead(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      placeholder="Last name"
                      value={newLead.lastName}
                      onChange={(e) => setNewLead(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input 
                    id="email" 
                    type="email"
                    placeholder="lead@email.com"
                    value={newLead.email}
                    onChange={(e) => setNewLead(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    placeholder="+1 (555) 123-4567"
                    value={newLead.phone}
                    onChange={(e) => setNewLead(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="source">Source</Label>
                  <Input 
                    id="source" 
                    placeholder="Website, Facebook, Google, etc."
                    value={newLead.source}
                    onChange={(e) => setNewLead(prev => ({ ...prev, source: e.target.value }))}
                  />
                </div>
                <Button 
                  onClick={handleCreateLead} 
                  disabled={submitting}
                  className="w-full"
                >
                  {submitting ? "Creating..." : "Create Lead"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isCreateCampaignOpen} onOpenChange={setIsCreateCampaignOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Campaign</DialogTitle>
                <DialogDescription>Set up a new marketing campaign</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="campaignName">Campaign Name *</Label>
                  <Input 
                    id="campaignName" 
                    placeholder="Spring Intake Campaign"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Campaign description..."
                    value={newCampaign.description}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="type">Campaign Type</Label>
                  <Select onValueChange={(value) => setNewCampaign(prev => ({ ...prev, type: value as Campaign['type'] }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select campaign type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EMAIL">Email</SelectItem>
                      <SelectItem value="SMS">SMS</SelectItem>
                      <SelectItem value="SOCIAL_MEDIA">Social Media</SelectItem>
                      <SelectItem value="GOOGLE_ADS">Google Ads</SelectItem>
                      <SelectItem value="FACEBOOK_ADS">Facebook Ads</SelectItem>
                      <SelectItem value="CONTENT">Content</SelectItem>
                      <SelectItem value="WEBINAR">Webinar</SelectItem>
                      <SelectItem value="EVENT">Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="budget">Budget ($)</Label>
                  <Input 
                    id="budget" 
                    type="number"
                    placeholder="1000"
                    value={newCampaign.budget}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, budget: e.target.value }))}
                  />
                </div>
                <Button 
                  onClick={handleCreateCampaign} 
                  disabled={submitting}
                  className="w-full"
                >
                  {submitting ? "Creating..." : "Create Campaign"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-[300px]"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="PAUSED">Paused</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="EMAIL">Email</SelectItem>
              <SelectItem value="SMS">SMS</SelectItem>
              <SelectItem value="SOCIAL_MEDIA">Social Media</SelectItem>
              <SelectItem value="GOOGLE_ADS">Google Ads</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns ({filteredCampaigns.length})</TabsTrigger>
          <TabsTrigger value="leads">Leads ({filteredLeads.length})</TabsTrigger>
          <TabsTrigger value="workflows">Workflows ({workflows.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          {filteredCampaigns.length > 0 ? (
            <div className="grid gap-4">
              {filteredCampaigns.map((campaign) => {
                const metrics = calculateCampaignMetrics(campaign)
                return (
                  <Card key={campaign.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getCampaignTypeIcon(campaign.type)}
                          <div>
                            <CardTitle className="text-lg">{campaign.name}</CardTitle>
                            <CardDescription>{campaign.description}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(campaign.status)}>
                            {campaign.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCampaign(campaign.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Sent</p>
                          <p className="font-medium">{campaign.sentCount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Opened</p>
                          <p className="font-medium">{campaign.openedCount.toLocaleString()} ({metrics.openRate.toFixed(1)}%)</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Clicked</p>
                          <p className="font-medium">{campaign.clickedCount.toLocaleString()} ({metrics.clickRate.toFixed(1)}%)</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Converted</p>
                          <p className="font-medium">{campaign.conversionCount.toLocaleString()} ({metrics.conversionRate.toFixed(1)}%)</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Spent</p>
                          <p className="font-medium">${campaign.spent.toLocaleString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No campaigns found</h3>
                <p className="text-muted-foreground mb-4">Create your first campaign to get started</p>
                <Button onClick={() => setIsCreateCampaignOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Campaign
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="leads" className="space-y-4">
          {filteredLeads.length > 0 ? (
            <div className="grid gap-4">
              {filteredLeads.map((lead) => (
                <Card key={lead.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {lead.firstName} {lead.lastName}
                        </CardTitle>
                        <CardDescription>{lead.email} • {lead.phone}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getLeadStatusColor(lead.status)}>
                          {lead.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteLead(lead.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Source</p>
                        <p className="font-medium">{lead.source}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <p className="font-medium">{lead.status}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Converted</p>
                        <p className="font-medium">{lead.converted ? "Yes" : "No"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Created</p>
                        <p className="font-medium">{new Date(lead.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No leads found</h3>
                <p className="text-muted-foreground mb-4">Create your first lead to get started</p>
                <Button onClick={() => setIsCreateLeadOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Lead
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          {workflows.length > 0 ? (
            <div className="grid gap-4">
              {workflows.map((workflow) => (
                <Card key={workflow.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Workflow className="h-5 w-5" />
                        <div>
                          <CardTitle className="text-lg">{workflow.name}</CardTitle>
                          <CardDescription>{workflow.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(workflow.status)}>
                          {workflow.status}
                        </Badge>
                        {workflow.isActive && (
                          <Badge className="bg-green-100 text-green-800">
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Category</p>
                        <p className="font-medium">{workflow.category}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Executions</p>
                        <p className="font-medium">{workflow.executionCount}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Last Executed</p>
                        <p className="font-medium">
                          {workflow.lastExecutedAt 
                            ? new Date(workflow.lastExecutedAt).toLocaleDateString()
                            : "Never"
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Workflow className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No workflows found</h3>
                <p className="text-muted-foreground mb-4">Create your first workflow to automate your processes</p>
                <Button onClick={() => setIsCreateWorkflowOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Workflow
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Workflow Dialog */}
      <Dialog open={isCreateWorkflowOpen} onOpenChange={setIsCreateWorkflowOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Workflow</DialogTitle>
            <DialogDescription>Set up an automation workflow</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="workflowName">Workflow Name *</Label>
              <Input 
                id="workflowName" 
                placeholder="Lead Nurturing Workflow"
                value={newWorkflow.name}
                onChange={(e) => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="workflowDescription">Description</Label>
              <Textarea 
                id="workflowDescription" 
                placeholder="Workflow description..."
                value={newWorkflow.description}
                onChange={(e) => setNewWorkflow(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select onValueChange={(value) => setNewWorkflow(prev => ({ ...prev, category: value as Workflow['category'] }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select workflow category" />
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
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={newWorkflow.isActive}
                onChange={(e) => setNewWorkflow(prev => ({ ...prev, isActive: e.target.checked }))}
              />
              <Label htmlFor="isActive">Activate workflow immediately</Label>
            </div>
            <Button 
              onClick={handleCreateWorkflow} 
              disabled={submitting}
              className="w-full"
            >
              {submitting ? "Creating..." : "Create Workflow"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}