"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
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
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { 
  CreditCard, 
  Download, 
  Upload, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Settings,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Receipt,
  Calendar,
  Mail,
  Phone,
  MapPin,
  User,
  Users,
  Building,
  Star,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Plus,
  BarChart3,
  Activity,
  Zap,
  Shield,
  Database,
  Globe
} from "lucide-react"

interface Subscription {
  id: string
  plan: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PENDING'
  currentPeriodStart: string
  currentPeriodEnd: string
  trialEnd?: string
  cancelAtPeriodEnd: boolean
  features: string[]
  price: {
    monthly: number
    yearly: number
  }
  usage: {
    students: number
    users: number
    storage: number
    bandwidth: number
  }
  limits: {
    students: number
    users: number
    storage: number // in GB
    bandwidth: number // in GB
  }
}

interface Invoice {
  id: string
  invoiceNumber: string
  amount: number
  currency: string
  status: 'DRAFT' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'REFUNDED'
  issueDate: string
  dueDate: string
  paidDate?: string
  description: string
  items: InvoiceItem[]
}

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

interface PaymentMethod {
  id: string
  type: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL' | 'BANK_TRANSFER' | 'OTHER'
  last4?: string
  brand?: string
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
  status: 'ACTIVE' | 'EXPIRED' | 'FAILED'
}

interface UsageRecord {
  id: string
  period: string
  students: {
    current: number
    limit: number
  }
  users: {
    current: number
    limit: number
  }
  storage: {
    current: number // in MB
    limit: number // in GB
  }
  apiCalls: {
    current: number
    limit: number
  }
  generatedAt: string
}

const mockSubscription: Subscription = {
  id: "1",
  plan: "PROFESSIONAL",
  status: "ACTIVE",
  currentPeriodStart: "2024-01-01T00:00:00Z",
  currentPeriodEnd: "2024-02-01T00:00:00Z",
  cancelAtPeriodEnd: false,
  features: [
    "Unlimited Students",
    "Up to 10 Team Members",
    "50GB Storage",
    "Priority Support",
    "Custom Domain",
    "Advanced Analytics",
    "API Access"
  ],
  price: {
    monthly: 99,
    yearly: 990
  },
  usage: {
    students: 45,
    users: 4,
    storage: 15360, // 15GB in MB
    bandwidth: 25
  },
  limits: {
    students: 100,
    users: 10,
    storage: 50, // 50GB
    bandwidth: 100
  }
}

const mockInvoices: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-2024-001",
    amount: 99,
    currency: "USD",
    status: "PAID",
    issueDate: "2024-01-01",
    dueDate: "2024-01-15",
    paidDate: "2024-01-10",
    description: "Professional Plan - Monthly Subscription",
    items: [
      {
        id: "1",
        description: "Professional Plan (Monthly)",
        quantity: 1,
        unitPrice: 99,
        amount: 99
      }
    ]
  },
  {
    id: "2",
    invoiceNumber: "INV-2023-012",
    amount: 99,
    currency: "USD",
    status: "PAID",
    issueDate: "2023-12-01",
    dueDate: "2023-12-15",
    paidDate: "2023-12-08",
    description: "Professional Plan - Monthly Subscription",
    items: [
      {
        id: "1",
        description: "Professional Plan (Monthly)",
        quantity: 1,
        unitPrice: 99,
        amount: 99
      }
    ]
  }
]

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: "1",
    type: "CREDIT_CARD",
    last4: "4242",
    brand: "visa",
    expiryMonth: 12,
    expiryYear: 2025,
    isDefault: true,
    status: "ACTIVE"
  }
]

const mockUsage: UsageRecord = {
  id: "1",
  period: "2024-01",
  students: {
    current: 45,
    limit: 100
  },
  users: {
    current: 4,
    limit: 10
  },
  storage: {
    current: 15360, // 15GB in MB
    limit: 50 // 50GB
  },
  apiCalls: {
    current: 15420,
    limit: 50000
  },
  generatedAt: "2024-01-20T00:00:00Z"
}

export default function BillingPage() {
  const params = useParams()
  const subdomain = params.subdomain as string
  
  const [subscription] = useState<Subscription>(mockSubscription)
  const [invoices] = useState<Invoice[]>(mockInvoices)
  const [paymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods)
  const [usage] = useState<UsageRecord>(mockUsage)
  const [loading, setLoading] = useState(false)
  const [isAddPaymentMethodOpen, setIsAddPaymentMethodOpen] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": case "PAID": return "bg-green-100 text-green-800"
      case "PENDING": return "bg-yellow-100 text-yellow-800"
      case "OVERDUE": return "bg-red-100 text-red-800"
      case "CANCELLED": case "EXPIRED": return "bg-gray-100 text-gray-800"
      case "REFUNDED": return "bg-blue-100 text-blue-800"
      case "FAILED": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "FREE": return "bg-gray-100 text-gray-800"
      case "STARTER": return "bg-blue-100 text-blue-800"
      case "PROFESSIONAL": return "bg-purple-100 text-purple-800"
      case "ENTERPRISE": return "bg-orange-100 text-orange-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case "CREDIT_CARD":
      case "DEBIT_CARD":
        return <CreditCard className="h-4 w-4" />
      case "PAYPAL":
        return <Globe className="h-4 w-4" />
      case "BANK_TRANSFER":
        return <Building className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100)
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600"
    if (percentage >= 75) return "text-yellow-600"
    return "text-green-600"
  }

  const daysUntilRenewal = Math.ceil((new Date(subscription.currentPeriodEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Billing & Subscription</h1>
          <p className="text-muted-foreground">Manage your subscription, payments, and usage</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Subscription Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Current Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getPlanColor(subscription.plan)}>
                  {subscription.plan}
                </Badge>
                <Badge className={getStatusColor(subscription.status)}>
                  {subscription.status}
                </Badge>
              </div>
              <div className="text-2xl font-bold">${subscription.price.monthly}/mo</div>
              <div className="text-sm text-muted-foreground">
                ${subscription.price.yearly}/year (save 17%)
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Next Billing Date</div>
              <div className="font-medium">{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</div>
              <div className="text-sm text-muted-foreground">
                {daysUntilRenewal} days remaining
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Students</div>
              <div className="font-medium">{subscription.usage.students} / {subscription.limits.students}</div>
              <Progress 
                value={getUsagePercentage(subscription.usage.students, subscription.limits.students)} 
                className="h-2 mt-1"
              />
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Team Members</div>
              <div className="font-medium">{subscription.usage.users} / {subscription.limits.users}</div>
              <Progress 
                value={getUsagePercentage(subscription.usage.users, subscription.limits.users)} 
                className="h-2 mt-1"
              />
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="font-medium mb-3">Plan Features</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
              {subscription.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Change Plan
            </Button>
            {subscription.cancelAtPeriodEnd && (
              <Badge className="bg-yellow-100 text-yellow-800">
                Cancels at period end
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="usage" className="space-y-6">
        <TabsList>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="billing-info">Billing Information</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Students</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getUsageColor(getUsagePercentage(usage.students.current, usage.students.limit))}`}>
                  {usage.students.current}
                </div>
                <p className="text-xs text-muted-foreground">
                  of {usage.students.limit} limit
                </p>
                <Progress 
                  value={getUsagePercentage(usage.students.current, usage.students.limit)} 
                  className="h-2 mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getUsageColor(getUsagePercentage(usage.users.current, usage.users.limit))}`}>
                  {usage.users.current}
                </div>
                <p className="text-xs text-muted-foreground">
                  of {usage.users.limit} limit
                </p>
                <Progress 
                  value={getUsagePercentage(usage.users.current, usage.users.limit)} 
                  className="h-2 mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Storage</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getUsageColor(getUsagePercentage(usage.storage.current / 1024, usage.storage.limit))}`}>
                  {(usage.storage.current / 1024).toFixed(1)}GB
                </div>
                <p className="text-xs text-muted-foreground">
                  of {usage.storage.limit}GB limit
                </p>
                <Progress 
                  value={getUsagePercentage(usage.storage.current / 1024, usage.storage.limit)} 
                  className="h-2 mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API Calls</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getUsageColor(getUsagePercentage(usage.apiCalls.current, usage.apiCalls.limit))}`}>
                  {usage.apiCalls.current.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  of {usage.apiCalls.limit.toLocaleString()} limit
                </p>
                <Progress 
                  value={getUsagePercentage(usage.apiCalls.current, usage.apiCalls.limit)} 
                  className="h-2 mt-2"
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Usage History</CardTitle>
              <CardDescription>Track your resource usage over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Usage charts will be implemented here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>View and download your billing invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{new Date(invoice.issueDate).toLocaleDateString()}</TableCell>
                      <TableCell>{invoice.description}</TableCell>
                      <TableCell>${invoice.amount} {invoice.currency}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
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

        <TabsContent value="payment-methods" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Payment Methods</h3>
              <p className="text-muted-foreground">Manage your payment methods</p>
            </div>
            <Dialog open={isAddPaymentMethodOpen} onOpenChange={setIsAddPaymentMethodOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Payment Method</DialogTitle>
                  <DialogDescription>Add a new payment method for your subscription</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input id="expiry" placeholder="MM/YY" />
                    </div>
                    <div>
                      <Label htmlFor="cvc">CVC</Label>
                      <Input id="cvc" placeholder="123" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="name">Cardholder Name</Label>
                    <Input id="name" placeholder="John Doe" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="default" />
                    <Label htmlFor="default">Set as default payment method</Label>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddPaymentMethodOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setIsAddPaymentMethodOpen(false)}>
                      Add Payment Method
                    </Button>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {paymentMethods.map((method) => (
              <Card key={method.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {getPaymentMethodIcon(method.type)}
                      <span className="font-medium">
                        {method.brand?.toUpperCase()} {method.type.replace('_', ' ')}
                      </span>
                      {method.isDefault && (
                        <Badge className="bg-blue-100 text-blue-800">Default</Badge>
                      )}
                    </div>
                    <Badge className={getStatusColor(method.status)}>
                      {method.status}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {method.last4 && (
                      <div>•••• •••• •••• {method.last4}</div>
                    )}
                    {method.expiryMonth && method.expiryYear && (
                      <div>Expires {method.expiryMonth}/{method.expiryYear}</div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      Edit
                    </Button>
                    {!method.isDefault && (
                      <Button variant="outline" size="sm">
                        Remove
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="billing-info" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>Manage your billing address and contact information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company">Company Name</Label>
                    <Input id="company" defaultValue="Education Agency Inc." />
                  </div>
                  <div>
                    <Label htmlFor="email">Billing Email</Label>
                    <Input id="email" defaultValue="billing@agency.com" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" defaultValue="+1 (555) 123-4567" />
                  </div>
                  <div>
                    <Label htmlFor="taxId">Tax ID (Optional)</Label>
                    <Input id="taxId" placeholder="Tax identification number" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" defaultValue="123 Business Street" />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" defaultValue="New York" />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input id="state" defaultValue="NY" />
                  </div>
                  <div>
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input id="zip" defaultValue="10001" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select defaultValue="US">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="UK">United Kingdom</SelectItem>
                      <SelectItem value="AU">Australia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}