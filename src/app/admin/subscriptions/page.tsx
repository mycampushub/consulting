"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  Users, 
  CreditCard, 
  BarChart3, 
  Shield,
  Zap,
  Database,
  Globe,
  Activity,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  TrendingUp,
  Eye,
  MoreHorizontal
} from "lucide-react"

interface SubscriptionPlan {
  id: string
  name: string
  description: string
  slug: string
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
  basePrice: number
  currency: string
  billingCycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'LIFETIME'
  trialDays: number
  maxUsers: number
  maxStudents: number
  maxStorage: number
  maxBranches: number
  isPopular: boolean
  isVisible: boolean
  features: PlanFeature[]
  subscriptions: AgencySubscription[]
  createdAt: string
  updatedAt: string
}

interface SubscriptionFeature {
  id: string
  name: string
  description: string
  slug: string
  category: 'CORE' | 'CRM' | 'MARKETING' | 'ACCOUNTING' | 'COMMUNICATIONS' | 'ANALYTICS' | 'AUTOMATION' | 'INTEGRATIONS' | 'ENTERPRISE' | 'CUSTOM'
  type: 'BOOLEAN' | 'NUMBER' | 'STRING' | 'JSON' | 'TOGGLE' | 'LIMIT'
  isToggleable: boolean
  isVisible: boolean
  planFeatures: PlanFeature[]
  featureAccess: FeatureAccess[]
  usage: SubscriptionUsage[]
  createdAt: string
  updatedAt: string
}

interface PlanFeature {
  id: string
  planId: string
  featureId: string
  isEnabled: boolean
  config?: string
  limits?: string
  plan?: SubscriptionPlan
  feature?: SubscriptionFeature
}

interface AgencySubscription {
  id: string
  agencyId: string
  agency?: Agency
  planId: string
  plan?: SubscriptionPlan
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PENDING' | 'TRIAL' | 'SUSPENDED'
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  currentPeriodStart?: string
  currentPeriodEnd?: string
  trialStart?: string
  trialEnd?: string
  usage: SubscriptionUsage[]
  billing: SubscriptionBilling[]
  history: SubscriptionHistory[]
  createdAt: string
  updatedAt: string
}

interface Agency {
  id: string
  name: string
  subdomain: string
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING'
  plan: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'
  userCount: number
  studentCount: number
  createdAt: string
}

interface SubscriptionUsage {
  id: string
  subscriptionId: string
  featureId: string
  currentUsage: number
  limit?: number
  resetPeriod: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'NEVER'
  lastResetAt?: string
  subscription?: AgencySubscription
  feature?: SubscriptionFeature
  createdAt: string
  updatedAt: string
}

interface FeatureAccess {
  id: string
  agencyId: string
  agency?: Agency
  featureId: string
  feature?: SubscriptionFeature
  branchId?: string
  branch?: Branch
  isEnabled: boolean
  accessLevel: 'VIEW' | 'DOWNLOAD' | 'EDIT' | 'AGENCY' | 'ADMIN'
  config?: string
  limits?: string
  createdAt: string
  updatedAt: string
}

interface Branch {
  id: string
  name: string
  code: string
  type: 'BRANCH' | 'FRANCHISE' | 'PARTNER'
  status: 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  agencyId: string
  createdAt: string
}

interface SubscriptionBilling {
  id: string
  subscriptionId: string
  invoiceId?: string
  amount: number
  currency: string
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELLED'
  periodStart: string
  periodEnd: string
  paymentMethod?: string
  transactionId?: string
  paidAt?: string
  createdAt: string
  updatedAt: string
}

interface SubscriptionHistory {
  id: string
  subscriptionId: string
  changeType: 'PLAN_CHANGE' | 'STATUS_CHANGE' | 'UPGRADE' | 'DOWNGRADE' | 'CANCELLATION' | 'REACTIVATION' | 'TRIAL_START' | 'TRIAL_END'
  fromPlanId?: string
  toPlanId?: string
  fromStatus?: string
  toStatus?: string
  reason?: string
  changedBy?: string
  changedByType: 'SYSTEM' | 'ADMIN' | 'USER' | 'AUTOMATED'
  createdAt: string
}

const mockSubscriptionPlans: SubscriptionPlan[] = [
  {
    id: "1",
    name: "Free Plan",
    description: "Perfect for getting started",
    slug: "free",
    status: "ACTIVE",
    basePrice: 0,
    currency: "USD",
    billingCycle: "MONTHLY",
    trialDays: 0,
    maxUsers: 1,
    maxStudents: 10,
    maxStorage: 1000,
    maxBranches: 1,
    isPopular: false,
    isVisible: true,
    features: [],
    subscriptions: [],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "2",
    name: "Starter Plan",
    description: "Great for small agencies",
    slug: "starter",
    status: "ACTIVE",
    basePrice: 29,
    currency: "USD",
    billingCycle: "MONTHLY",
    trialDays: 14,
    maxUsers: 3,
    maxStudents: 50,
    maxStorage: 5000,
    maxBranches: 1,
    isPopular: false,
    isVisible: true,
    features: [],
    subscriptions: [],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "3",
    name: "Professional Plan",
    description: "For growing agencies",
    slug: "professional",
    status: "ACTIVE",
    basePrice: 99,
    currency: "USD",
    billingCycle: "MONTHLY",
    trialDays: 14,
    maxUsers: 10,
    maxStudents: 200,
    maxStorage: 20000,
    maxBranches: 3,
    isPopular: true,
    isVisible: true,
    features: [],
    subscriptions: [],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "4",
    name: "Enterprise Plan",
    description: "For large agencies",
    slug: "enterprise",
    status: "ACTIVE",
    basePrice: 299,
    currency: "USD",
    billingCycle: "MONTHLY",
    trialDays: 30,
    maxUsers: 50,
    maxStudents: 1000,
    maxStorage: 100000,
    maxBranches: 10,
    isPopular: false,
    isVisible: true,
    features: [],
    subscriptions: [],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  }
]

const mockFeatures: SubscriptionFeature[] = [
  {
    id: "1",
    name: "Student CRM",
    description: "Complete student lifecycle management",
    slug: "student-crm",
    category: "CORE",
    type: "BOOLEAN",
    isToggleable: true,
    isVisible: true,
    planFeatures: [],
    featureAccess: [],
    usage: [],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "2",
    name: "University Partnerships",
    description: "Connect with universities worldwide",
    slug: "university-partnerships",
    category: "CORE",
    type: "BOOLEAN",
    isToggleable: true,
    isVisible: true,
    planFeatures: [],
    featureAccess: [],
    usage: [],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "3",
    name: "Marketing Automation",
    description: "Automated marketing campaigns",
    slug: "marketing-automation",
    category: "MARKETING",
    type: "BOOLEAN",
    isToggleable: true,
    isVisible: true,
    planFeatures: [],
    featureAccess: [],
    usage: [],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "4",
    name: "Advanced Analytics",
    description: "Detailed analytics and reporting",
    slug: "advanced-analytics",
    category: "ANALYTICS",
    type: "BOOLEAN",
    isToggleable: true,
    isVisible: true,
    planFeatures: [],
    featureAccess: [],
    usage: [],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "5",
    name: "API Access",
    description: "Full API access for integrations",
    slug: "api-access",
    category: "INTEGRATIONS",
    type: "BOOLEAN",
    isToggleable: true,
    isVisible: true,
    planFeatures: [],
    featureAccess: [],
    usage: [],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  }
]

const mockSubscriptions: AgencySubscription[] = [
  {
    id: "1",
    agencyId: "1",
    planId: "3",
    status: "ACTIVE",
    currentPeriodStart: "2024-01-01T00:00:00Z",
    currentPeriodEnd: "2024-02-01T00:00:00Z",
    usage: [],
    billing: [],
    history: [],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "2",
    agencyId: "2",
    planId: "2",
    status: "ACTIVE",
    currentPeriodStart: "2024-01-01T00:00:00Z",
    currentPeriodEnd: "2024-02-01T00:00:00Z",
    usage: [],
    billing: [],
    history: [],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "3",
    agencyId: "3",
    planId: "1",
    status: "TRIAL",
    trialStart: "2024-01-15T00:00:00Z",
    trialEnd: "2024-01-29T00:00:00Z",
    usage: [],
    billing: [],
    history: [],
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z"
  }
]

export default function SubscriptionManagement() {
  const [plans] = useState<SubscriptionPlan[]>(mockSubscriptionPlans)
  const [features] = useState<SubscriptionFeature[]>(mockFeatures)
  const [subscriptions] = useState<AgencySubscription[]>(mockSubscriptions)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [selectedFeature, setSelectedFeature] = useState<SubscriptionFeature | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isCreatingPlan, setIsCreatingPlan] = useState(false)
  const [isCreatingFeature, setIsCreatingFeature] = useState(false)

  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || plan.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-green-100 text-green-800"
      case "INACTIVE": return "bg-gray-100 text-gray-800"
      case "ARCHIVED": return "bg-red-100 text-red-800"
      case "TRIAL": return "bg-yellow-100 text-yellow-800"
      case "CANCELLED": return "bg-red-100 text-red-800"
      case "EXPIRED": return "bg-red-100 text-red-800"
      case "PENDING": return "bg-yellow-100 text-yellow-800"
      case "SUSPENDED": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "CORE": return "bg-blue-100 text-blue-800"
      case "CRM": return "bg-green-100 text-green-800"
      case "MARKETING": return "bg-purple-100 text-purple-800"
      case "ACCOUNTING": return "bg-yellow-100 text-yellow-800"
      case "COMMUNICATIONS": return "bg-pink-100 text-pink-800"
      case "ANALYTICS": return "bg-indigo-100 text-indigo-800"
      case "AUTOMATION": return "bg-orange-100 text-orange-800"
      case "INTEGRATIONS": return "bg-teal-100 text-teal-800"
      case "ENTERPRISE": return "bg-red-100 text-red-800"
      case "CUSTOM": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Subscription Management</h1>
                <p className="text-sm text-muted-foreground">Manage plans, features, and subscriptions</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
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
        <Tabs defaultValue="plans" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="subscriptions">Agency Subscriptions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="space-y-6">
            {/* Plans Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Subscription Plans</h2>
                <p className="text-muted-foreground">Manage subscription plans and pricing</p>
              </div>
              <Button onClick={() => setIsCreatingPlan(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Plan
              </Button>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search plans..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Plans Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlans.map((plan) => (
                <Card key={plan.id} className="relative">
                  {plan.isPopular && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-orange-500 text-white">
                        Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(plan.status)}>
                        {plan.status}
                      </Badge>
                    </div>
                    <div className="mt-4">
                      <span className="text-3xl font-bold">
                        {formatCurrency(plan.basePrice, plan.currency)}
                      </span>
                      <span className="text-muted-foreground">/{plan.billingCycle.toLowerCase()}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Users:</span>
                          <span className="ml-1 font-medium">{plan.maxUsers}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Students:</span>
                          <span className="ml-1 font-medium">{plan.maxStudents}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Storage:</span>
                          <span className="ml-1 font-medium">{plan.maxStorage}MB</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Branches:</span>
                          <span className="ml-1 font-medium">{plan.maxBranches}</span>
                        </div>
                      </div>
                      
                      {plan.trialDays > 0 && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <Clock className="h-4 w-4" />
                          {plan.trialDays} days trial
                        </div>
                      )}
                      
                      <div className="flex gap-2 pt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => setSelectedPlan(plan)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedPlan(plan)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            {/* Features Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Features</h2>
                <p className="text-muted-foreground">Manage platform features and capabilities</p>
              </div>
              <Button onClick={() => setIsCreatingFeature(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Feature
              </Button>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <Card key={feature.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{feature.name}</CardTitle>
                        <CardDescription>{feature.description}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getCategoryColor(feature.category)}>
                          {feature.category}
                        </Badge>
                        <Badge variant="outline">
                          {feature.type}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Toggleable:</span>
                        <Switch checked={feature.isToggleable} />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Visible:</span>
                        <Switch checked={feature.isVisible} />
                      </div>
                      
                      <div className="flex gap-2 pt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => setSelectedFeature(feature)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedFeature(feature)}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-6">
            {/* Subscriptions Header */}
            <div>
              <h2 className="text-2xl font-bold">Agency Subscriptions</h2>
              <p className="text-muted-foreground">Manage agency subscriptions and billing</p>
            </div>

            {/* Subscriptions Table */}
            <Card>
              <CardHeader>
                <CardTitle>Active Subscriptions</CardTitle>
                <CardDescription>Current agency subscriptions and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subscriptions.map((subscription) => (
                    <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Agency #{subscription.agencyId}</h3>
                          <p className="text-sm text-muted-foreground">
                            {subscription.planId} • {subscription.status}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={getStatusColor(subscription.status)}>
                          {subscription.status}
                        </Badge>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {subscription.currentPeriodStart && new Date(subscription.currentPeriodStart).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            to {subscription.currentPeriodEnd && new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Analytics Header */}
            <div>
              <h2 className="text-2xl font-bold">Subscription Analytics</h2>
              <p className="text-muted-foreground">Track subscription metrics and revenue</p>
            </div>

            {/* Analytics Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$12,450</div>
                  <p className="text-xs text-muted-foreground">
                    +20.1% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">142</div>
                  <p className="text-xs text-muted-foreground">
                    +12 from last week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3.2%</div>
                  <p className="text-xs text-muted-foreground">
                    +0.3% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2.1%</div>
                  <p className="text-xs text-muted-foreground">
                    -0.5% from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Monthly revenue trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <BarChart3 className="h-8 w-8 mr-2" />
                  Revenue chart will be displayed here
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}