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
  MoreHorizontal,
  FileText,
  Receipt,
  Banknote,
  Building2,
  GraduationCap,
  Calendar,
  Percent,
  Download,
  Upload,
  RefreshCw,
  AlertCircle
} from "lucide-react"

interface UniversityCommission {
  id: string
  agencyId: string
  agency?: Agency
  universityId: string
  university?: University
  commissionType: 'PERCENTAGE' | 'FIXED' | 'TIERED' | 'HYBRID'
  commissionRate: number
  fixedAmount: number
  invoiceAmount: number
  commissionAmount: number
  currency: string
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'CANCELLED' | 'DISPUTED'
  paymentTerm: 'NET_7' | 'NET_15' | 'NET_30' | 'NET_60' | 'NET_90' | 'COD' | 'PREPAID'
  dueDate?: string
  paidDate?: string
  applicationId?: string
  application?: Application
  studentId?: string
  student?: Student
  notes?: string
  createdAt: string
  updatedAt: string
}

interface Invoice {
  id: string
  invoiceNumber: string
  invoiceType: 'STANDARD' | 'RECURRING' | 'CREDIT_NOTE' | 'DEBIT_NOTE' | 'PROFORMA' | 'ESTIMATE' | 'PURCHASE_ORDER'
  studentId?: string
  student?: Student
  universityId?: string
  university?: University
  subtotal: number
  taxRate: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  currency: string
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'REFUNDED'
  issueDate: string
  dueDate: string
  paidDate?: string
  items: InvoiceItem[]
  notes?: string
  createdAt: string
  updatedAt: string
}

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  discountRate: number
  discountAmount: number
  taxRate: number
  taxAmount: number
  totalAmount: number
  category?: string
  serviceType?: string
  notes?: string
}

interface Payment {
  id: string
  invoiceId?: string
  invoice?: Invoice
  amount: number
  currency: string
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL' | 'STRIPE' | 'CHECK' | 'WIRE_TRANSFER' | 'CRYPTOCURRENCY' | 'OTHER'
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED'
  paymentDate: string
  referenceNumber?: string
  description?: string
  notes?: string
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

interface University {
  id: string
  name: string
  country: string
  city: string
  worldRanking?: number
  partnershipLevel: 'NONE' | 'BASIC' | 'PREMIUM' | 'STRATEGIC'
  commissionRate?: number
}

interface Application {
  id: string
  program: string
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN'
  createdAt: string
}

interface Student {
  id: string
  firstName: string
  lastName: string
  email: string
  status: 'PROSPECT' | 'APPLIED' | 'ENROLLED' | 'GRADUATED' | 'WITHDRAWN'
}

interface FinancialReport {
  id: string
  reportType: 'PROFIT_LOSS' | 'BALANCE_SHEET' | 'CASH_FLOW' | 'TRIAL_BALANCE' | 'AGED_RECEIVABLES' | 'AGED_PAYABLES' | 'COMMISSION_REPORT' | 'CUSTOM'
  title: string
  reportPeriod: string
  currency: string
  status: 'DRAFT' | 'GENERATING' | 'COMPLETED' | 'FAILED' | 'ARCHIVED'
  generatedAt?: string
  createdAt: string
}

const mockCommissions: UniversityCommission[] = [
  {
    id: "1",
    agencyId: "1",
    universityId: "1",
    commissionType: "PERCENTAGE",
    commissionRate: 15,
    fixedAmount: 0,
    invoiceAmount: 5000,
    commissionAmount: 750,
    currency: "USD",
    status: "PENDING",
    paymentTerm: "NET_30",
    dueDate: "2024-02-15",
    applicationId: "1",
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z"
  },
  {
    id: "2",
    agencyId: "1",
    universityId: "2",
    commissionType: "FIXED",
    commissionRate: 0,
    fixedAmount: 1000,
    invoiceAmount: 8000,
    commissionAmount: 1000,
    currency: "USD",
    status: "APPROVED",
    paymentTerm: "NET_60",
    dueDate: "2024-03-15",
    applicationId: "2",
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-12T00:00:00Z"
  },
  {
    id: "3",
    agencyId: "2",
    universityId: "3",
    commissionType: "TIERED",
    commissionRate: 20,
    fixedAmount: 0,
    invoiceAmount: 12000,
    commissionAmount: 2400,
    currency: "USD",
    status: "PAID",
    paymentTerm: "NET_30",
    dueDate: "2024-01-20",
    paidDate: "2024-01-18T00:00:00Z",
    applicationId: "3",
    createdAt: "2024-01-05T00:00:00Z",
    updatedAt: "2024-01-18T00:00:00Z"
  }
]

const mockInvoices: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-2024-001",
    invoiceType: "STANDARD",
    studentId: "1",
    subtotal: 4500,
    taxRate: 10,
    taxAmount: 450,
    discountAmount: 0,
    totalAmount: 4950,
    currency: "USD",
    status: "PAID",
    issueDate: "2024-01-01",
    dueDate: "2024-01-15",
    paidDate: "2024-01-10",
    items: [],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-10T00:00:00Z"
  },
  {
    id: "2",
    invoiceNumber: "INV-2024-002",
    invoiceType: "STANDARD",
    studentId: "2",
    subtotal: 3200,
    taxRate: 10,
    taxAmount: 320,
    discountAmount: 200,
    totalAmount: 3320,
    currency: "USD",
    status: "OVERDUE",
    issueDate: "2024-01-05",
    dueDate: "2024-01-20",
    items: [],
    createdAt: "2024-01-05T00:00:00Z",
    updatedAt: "2024-01-05T00:00:00Z"
  },
  {
    id: "3",
    invoiceNumber: "INV-2024-003",
    invoiceType: "RECURRING",
    universityId: "1",
    subtotal: 10000,
    taxRate: 0,
    taxAmount: 0,
    discountAmount: 0,
    totalAmount: 10000,
    currency: "USD",
    status: "SENT",
    issueDate: "2024-01-10",
    dueDate: "2024-02-10",
    items: [],
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-10T00:00:00Z"
  }
]

const mockPayments: Payment[] = [
  {
    id: "1",
    invoiceId: "1",
    amount: 4950,
    currency: "USD",
    paymentMethod: "BANK_TRANSFER",
    status: "COMPLETED",
    paymentDate: "2024-01-10",
    referenceNumber: "TRX-001",
    description: "Payment for invoice INV-2024-001",
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-10T00:00:00Z"
  },
  {
    id: "2",
    amount: 1500,
    currency: "USD",
    paymentMethod: "CREDIT_CARD",
    status: "COMPLETED",
    paymentDate: "2024-01-12",
    referenceNumber: "TRX-002",
    description: "Partial payment for services",
    createdAt: "2024-01-12T00:00:00Z",
    updatedAt: "2024-01-12T00:00:00Z"
  },
  {
    id: "3",
    invoiceId: "2",
    amount: 1000,
    currency: "USD",
    paymentMethod: "PAYPAL",
    status: "PROCESSING",
    paymentDate: "2024-01-15",
    description: "Partial payment for invoice INV-2024-002",
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z"
  }
]

const mockReports: FinancialReport[] = [
  {
    id: "1",
    reportType: "PROFIT_LOSS",
    title: "Monthly Profit & Loss - January 2024",
    reportPeriod: "2024-01-01 to 2024-01-31",
    currency: "USD",
    status: "COMPLETED",
    generatedAt: "2024-02-01T00:00:00Z",
    createdAt: "2024-02-01T00:00:00Z"
  },
  {
    id: "2",
    reportType: "COMMISSION_REPORT",
    title: "University Commissions - Q1 2024",
    reportPeriod: "2024-01-01 to 2024-03-31",
    currency: "USD",
    status: "GENERATING",
    createdAt: "2024-01-20T00:00:00Z"
  },
  {
    id: "3",
    reportType: "AGED_RECEIVABLES",
    title: "Aged Receivables Report - January 2024",
    reportPeriod: "2024-01-01 to 2024-01-31",
    currency: "USD",
    status: "COMPLETED",
    generatedAt: "2024-02-01T00:00:00Z",
    createdAt: "2024-02-01T00:00:00Z"
  }
]

export default function AccountingManagement() {
  const [commissions] = useState<UniversityCommission[]>(mockCommissions)
  const [invoices] = useState<Invoice[]>(mockInvoices)
  const [payments] = useState<Payment[]>(mockPayments)
  const [reports] = useState<FinancialReport[]>(mockReports)
  const [selectedCommission, setSelectedCommission] = useState<UniversityCommission | null>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isCreatingCommission, setIsCreatingCommission] = useState(false)
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false)

  const filteredCommissions = commissions.filter(commission => {
    const matchesSearch = commission.university?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         commission.student?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         commission.student?.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || commission.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID": return "bg-green-100 text-green-800"
      case "APPROVED": return "bg-blue-100 text-blue-800"
      case "PENDING": return "bg-yellow-100 text-yellow-800"
      case "OVERDUE": return "bg-red-100 text-red-800"
      case "CANCELLED": return "bg-gray-100 text-gray-800"
      case "DISPUTED": return "bg-red-100 text-red-800"
      case "SENT": return "bg-blue-100 text-blue-800"
      case "COMPLETED": return "bg-green-100 text-green-800"
      case "FAILED": return "bg-red-100 text-red-800"
      case "PROCESSING": return "bg-yellow-100 text-yellow-800"
      case "GENERATING": return "bg-yellow-100 text-yellow-800"
      case "DRAFT": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getCommissionTypeColor = (type: string) => {
    switch (type) {
      case "PERCENTAGE": return "bg-blue-100 text-blue-800"
      case "FIXED": return "bg-green-100 text-green-800"
      case "TIERED": return "bg-purple-100 text-purple-800"
      case "HYBRID": return "bg-orange-100 text-orange-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case "PROFIT_LOSS": return <BarChart3 className="h-5 w-5" />
      case "BALANCE_SHEET": return <Database className="h-5 w-5" />
      case "CASH_FLOW": return <Activity className="h-5 w-5" />
      case "COMMISSION_REPORT": return <Percent className="h-5 w-5" />
      case "AGED_RECEIVABLES": return <Clock className="h-5 w-5" />
      default: return <FileText className="h-5 w-5" />
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
                <CreditCard className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Accounting Management</h1>
                <p className="text-sm text-muted-foreground">Advanced accounting, commissions, and financial reporting</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
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
        {/* Financial Overview Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,231</div>
              <p className="text-xs text-muted-foreground">
                +12.5% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Commissions</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$3,750</div>
              <p className="text-xs text-muted-foreground">
                2 commissions pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Invoices</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$8,320</div>
              <p className="text-xs text-muted-foreground">
                3 invoices overdue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tax Collected</CardTitle>
              <Banknote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$4,520</div>
              <p className="text-xs text-muted-foreground">
                Q1 2024
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="commissions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="commissions">University Commissions</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="reports">Financial Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="commissions" className="space-y-6">
            {/* Commissions Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">University Commissions</h2>
                <p className="text-muted-foreground">Track and manage university partnership commissions</p>
              </div>
              <Button onClick={() => setIsCreatingCommission(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Commission
              </Button>
            </div>

            {/* Commission Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search commissions..."
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
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="APPROVED">Approved</SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      <SelectItem value="DISPUTED">Disputed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Commissions Table */}
            <Card>
              <CardHeader>
                <CardTitle>Commission Overview</CardTitle>
                <CardDescription>All university commissions and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredCommissions.map((commission) => (
                    <div key={commission.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">
                            {commission.university?.name || 'Unknown University'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {commission.student?.firstName} {commission.student?.lastName} • {commission.commissionType}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(commission.commissionAmount, commission.currency)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {commission.commissionType === 'PERCENTAGE' ? `${commission.commissionRate}% of ${formatCurrency(commission.invoiceAmount, commission.currency)}` : 'Fixed amount'}
                          </p>
                        </div>
                        <Badge className={getStatusColor(commission.status)}>
                          {commission.status}
                        </Badge>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {commission.dueDate && new Date(commission.dueDate).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {commission.paymentTerm}
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

          <TabsContent value="invoices" className="space-y-6">
            {/* Invoices Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Invoices</h2>
                <p className="text-muted-foreground">Manage student and university invoices</p>
              </div>
              <Button onClick={() => setIsCreatingInvoice(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </div>

            {/* Invoices Table */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Management</CardTitle>
                <CardDescription>All invoices and their payment status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Receipt className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{invoice.invoiceNumber}</h3>
                          <p className="text-sm text-muted-foreground">
                            {invoice.studentId ? 'Student Invoice' : 'University Invoice'} • {invoice.invoiceType}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(invoice.totalAmount, invoice.currency)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Due: {new Date(invoice.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {new Date(invoice.issueDate).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {invoice.paidDate ? `Paid: ${new Date(invoice.paidDate).toLocaleDateString()}` : 'Unpaid'}
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

          <TabsContent value="payments" className="space-y-6">
            {/* Payments Header */}
            <div>
              <h2 className="text-2xl font-bold">Payments</h2>
              <p className="text-muted-foreground">Track and manage all payment transactions</p>
            </div>

            {/* Payments Table */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Transactions</CardTitle>
                <CardDescription>All payment records and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">
                            {payment.referenceNumber || `Payment #${payment.id}`}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {payment.paymentMethod} • {payment.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(payment.amount, payment.currency)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(payment.paymentDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
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

          <TabsContent value="reports" className="space-y-6">
            {/* Reports Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Financial Reports</h2>
                <p className="text-muted-foreground">Generate and manage financial reports</p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>

            {/* Reports Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((report) => (
                <Card key={report.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getReportTypeIcon(report.reportType)}
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                      </div>
                      <Badge className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                    </div>
                    <CardDescription>{report.reportPeriod}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Currency:</span>
                        <span className="font-medium">{report.currency}</span>
                      </div>
                      {report.generatedAt && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Generated:</span>
                          <span className="font-medium">
                            {new Date(report.generatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex gap-2 pt-4">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Report Generation */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Report Generation</CardTitle>
                <CardDescription>Generate common financial reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex-col">
                    <BarChart3 className="h-6 w-6 mb-2" />
                    Profit & Loss
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Database className="h-6 w-6 mb-2" />
                    Balance Sheet
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Percent className="h-6 w-6 mb-2" />
                    Commission Report
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Clock className="h-6 w-6 mb-2" />
                    Aged Receivables
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