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
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Plus,
  Search,
  Filter,
  Download,
  FileText,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  RefreshCw,
  Calculator,
  Users,
  Database,
  Settings
} from "lucide-react"

interface AccountingData {
  id: string
  currency: string
  timezone: string
  totalRevenue: number
  monthlyRevenue: number
  totalExpenses: number
  monthlyExpenses: number
  netProfit: number
  profitMargin: number
}

interface Invoice {
  id: string
  invoiceNumber: string
  student?: {
    firstName: string
    lastName: string
    email: string
  }
  amount: number
  currency: string
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'REFUNDED'
  issueDate: string
  dueDate: string
  paidDate?: string
  paymentMethod?: string
}

interface Transaction {
  id: string
  type: 'INCOME' | 'EXPENSE' | 'REFUND' | 'TRANSFER'
  amount: number
  currency: string
  description?: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  paymentMethod?: string
  createdAt: string
  invoice?: {
    invoiceNumber: string
  }
  student?: {
    firstName: string
    lastName: string
  }
}

export default function AccountingPage() {
  const params = useParams()
  const subdomain = params.subdomain as string
  
  const [accounting, setAccounting] = useState<AccountingData | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Mock data for demonstration
  const mockAccounting: AccountingData = {
    id: "1",
    currency: "USD",
    timezone: "UTC",
    totalRevenue: 125000,
    monthlyRevenue: 12500,
    totalExpenses: 85000,
    monthlyExpenses: 8500,
    netProfit: 40000,
    profitMargin: 32
  }

  const mockInvoices: Invoice[] = [
    {
      id: "1",
      invoiceNumber: "INV-000001",
      student: {
        firstName: "Alex",
        lastName: "Thompson",
        email: "alex.thompson@email.com"
      },
      amount: 2500,
      currency: "USD",
      status: "PAID",
      issueDate: "2024-01-15",
      dueDate: "2024-01-30",
      paidDate: "2024-01-28",
      paymentMethod: "Credit Card"
    },
    {
      id: "2",
      invoiceNumber: "INV-000002",
      student: {
        firstName: "Maria",
        lastName: "Garcia",
        email: "maria.garcia@email.com"
      },
      amount: 3200,
      currency: "USD",
      status: "SENT",
      issueDate: "2024-01-18",
      dueDate: "2024-02-02"
    },
    {
      id: "3",
      invoiceNumber: "INV-000003",
      student: {
        firstName: "James",
        lastName: "Wilson",
        email: "james.wilson@email.com"
      },
      amount: 2800,
      currency: "USD",
      status: "OVERDUE",
      issueDate: "2024-01-10",
      dueDate: "2024-01-25"
    }
  ]

  const mockTransactions: Transaction[] = [
    {
      id: "1",
      type: "INCOME",
      amount: 2500,
      currency: "USD",
      description: "Application fee - Alex Thompson",
      status: "COMPLETED",
      paymentMethod: "Credit Card",
      createdAt: "2024-01-28",
      invoice: {
        invoiceNumber: "INV-000001"
      },
      student: {
        firstName: "Alex",
        lastName: "Thompson"
      }
    },
    {
      id: "2",
      type: "EXPENSE",
      amount: 500,
      currency: "USD",
      description: "Marketing expenses",
      status: "COMPLETED",
      paymentMethod: "Bank Transfer",
      createdAt: "2024-01-25"
    },
    {
      id: "3",
      type: "INCOME",
      amount: 1500,
      currency: "USD",
      description: "Consultation fee - Maria Garcia",
      status: "PENDING",
      paymentMethod: "Bank Transfer",
      createdAt: "2024-01-20"
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAccounting(mockAccounting)
      setInvoices(mockInvoices)
      setTransactions(mockTransactions)
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID": case "COMPLETED": return "bg-green-100 text-green-800"
      case "SENT": case "PENDING": return "bg-yellow-100 text-yellow-800"
      case "OVERDUE": return "bg-red-100 text-red-800"
      case "CANCELLED": case "FAILED": return "bg-gray-100 text-gray-800"
      case "REFUNDED": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case "INCOME": return "text-green-600"
      case "EXPENSE": return "text-red-600"
      case "REFUND": return "text-blue-600"
      case "TRANSFER": return "text-gray-600"
      default: return "text-gray-600"
    }
  }

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.student?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.student?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredTransactions = transactions.filter(transaction => {
    return transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           transaction.invoice?.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading accounting data...</p>
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
                <span className="text-primary-foreground font-bold text-sm">EA</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Accounting</h1>
                <p className="text-sm text-muted-foreground">{subdomain}.eduagency.com</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Dialog open={isCreateInvoiceOpen} onOpenChange={setIsCreateInvoiceOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Invoice
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Invoice</DialogTitle>
                    <DialogDescription>Generate a new invoice for a student</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="student">Student</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select student" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Alex Thompson</SelectItem>
                          <SelectItem value="2">Maria Garcia</SelectItem>
                          <SelectItem value="3">James Wilson</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="amount">Amount</Label>
                      <Input id="amount" type="number" placeholder="0.00" />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" placeholder="Invoice description" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="issueDate">Issue Date</Label>
                        <Input id="issueDate" type="date" />
                      </div>
                      <div>
                        <Label htmlFor="dueDate">Due Date</Label>
                        <Input id="dueDate" type="date" />
                      </div>
                    </div>
                    <Button className="w-full">Create Invoice</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Financial Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${accounting?.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                ${accounting?.monthlyRevenue.toLocaleString()} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${accounting?.totalExpenses.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                ${accounting?.monthlyExpenses.toLocaleString()} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${accounting?.netProfit.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {accounting?.profitMargin}% profit margin
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${invoices.filter(i => i.status === 'SENT' || i.status === 'OVERDUE').reduce((sum, i) => sum + i.amount, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {invoices.filter(i => i.status === 'OVERDUE').length} overdue invoices
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="invoices" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="commissions">University Commissions</TabsTrigger>
            <TabsTrigger value="student">Student Accounting</TabsTrigger>
            <TabsTrigger value="reports">Financial Reports</TabsTrigger>
            <TabsTrigger value="tax">Tax Management</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices" className="space-y-6">
            {/* Invoice Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex gap-4 items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="SENT">Sent</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="OVERDUE">Overdue</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>

            {/* Invoices Table */}
            <Card>
              <CardHeader>
                <CardTitle>Invoices</CardTitle>
                <CardDescription>Manage and track all your invoices</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{invoice.student?.firstName} {invoice.student?.lastName}</div>
                            <div className="text-sm text-muted-foreground">{invoice.student?.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>${invoice.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(invoice.status)}>
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(invoice.issueDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <CreditCard className="h-4 w-4" />
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

          <TabsContent value="transactions" className="space-y-6">
            {/* Transaction Filters */}
            <div className="flex gap-4 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>

            {/* Transactions Table */}
            <Card>
              <CardHeader>
                <CardTitle>Transactions</CardTitle>
                <CardDescription>All income and expense transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Invoice</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                          <span className={`font-medium ${getTransactionTypeColor(transaction.type)}`}>
                            {transaction.type}
                          </span>
                        </TableCell>
                        <TableCell className={getTransactionTypeColor(transaction.type)}>
                          {transaction.type === 'INCOME' ? '+' : '-'}${transaction.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{transaction.paymentMethod}</TableCell>
                        <TableCell>{transaction.invoice?.invoiceNumber}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commissions" className="space-y-6">
            {/* University Commissions Overview */}
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$12,450</div>
                  <p className="text-xs text-muted-foreground">
                    +8.2% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Commissions</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$3,750</div>
                  <p className="text-xs text-muted-foreground">
                    5 awaiting approval
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">University Partners</CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">
                    Active commission agreements
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* University Commissions Table */}
            <Card>
              <CardHeader>
                <CardTitle>University Commissions</CardTitle>
                <CardDescription>Track commissions from university partnerships</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>University</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Commission Type</TableHead>
                      <TableHead>Invoice Amount</TableHead>
                      <TableHead>Commission Rate</TableHead>
                      <TableHead>Commission Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Harvard University</TableCell>
                      <TableCell>Alex Thompson</TableCell>
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-800">PERCENTAGE</Badge>
                      </TableCell>
                      <TableCell>$5,000</TableCell>
                      <TableCell>15%</TableCell>
                      <TableCell>$750</TableCell>
                      <TableCell>
                        <Badge className="bg-yellow-100 text-yellow-800">PENDING</Badge>
                      </TableCell>
                      <TableCell>2024-02-15</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>University of Oxford</TableCell>
                      <TableCell>Maria Garcia</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">FIXED</Badge>
                      </TableCell>
                      <TableCell>$8,000</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>$1,000</TableCell>
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-800">APPROVED</Badge>
                      </TableCell>
                      <TableCell>2024-03-15</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Stanford University</TableCell>
                      <TableCell>James Wilson</TableCell>
                      <TableCell>
                        <Badge className="bg-purple-100 text-purple-800">TIERED</Badge>
                      </TableCell>
                      <TableCell>$12,000</TableCell>
                      <TableCell>20%</TableCell>
                      <TableCell>$2,400</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">PAID</Badge>
                      </TableCell>
                      <TableCell>2024-01-20</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="student" className="space-y-6">
            {/* Student Accounting Overview */}
            <div className="grid md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Student Receivables</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$18,500</div>
                  <p className="text-xs text-muted-foreground">
                    Total outstanding
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overdue Payments</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$4,200</div>
                  <p className="text-xs text-muted-foreground">
                    3 students overdue
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Payment Plans</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">
                    Active payment plans
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Refund Requests</CardTitle>
                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2</div>
                  <p className="text-xs text-muted-foreground">
                    Pending review
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Student Accounting Table */}
            <Card>
              <CardHeader>
                <CardTitle>Student Accounting</CardTitle>
                <CardDescription>Manage student billing and payments</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Total Billed</TableHead>
                      <TableHead>Amount Paid</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Payment Status</TableHead>
                      <TableHead>Payment Plan</TableHead>
                      <TableHead>Last Payment</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <div>
                          <div className="font-medium">Alex Thompson</div>
                          <div className="text-sm text-muted-foreground">alex.thompson@email.com</div>
                        </div>
                      </TableCell>
                      <TableCell>$5,000</TableCell>
                      <TableCell>$2,500</TableCell>
                      <TableCell className="text-red-600">$2,500</TableCell>
                      <TableCell>
                        <Badge className="bg-yellow-100 text-yellow-800">PARTIAL</Badge>
                      </TableCell>
                      <TableCell>Yes</TableCell>
                      <TableCell>2024-01-15</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <CreditCard className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <div>
                          <div className="font-medium">Maria Garcia</div>
                          <div className="text-sm text-muted-foreground">maria.garcia@email.com</div>
                        </div>
                      </TableCell>
                      <TableCell>$3,200</TableCell>
                      <TableCell>$3,200</TableCell>
                      <TableCell className="text-green-600">$0</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">PAID</Badge>
                      </TableCell>
                      <TableCell>No</TableCell>
                      <TableCell>2024-01-10</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <CreditCard className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <div>
                          <div className="font-medium">James Wilson</div>
                          <div className="text-sm text-muted-foreground">james.wilson@email.com</div>
                        </div>
                      </TableCell>
                      <TableCell>$2,800</TableCell>
                      <TableCell>$0</TableCell>
                      <TableCell className="text-red-600">$2,800</TableCell>
                      <TableCell>
                        <Badge className="bg-red-100 text-red-800">OVERDUE</Badge>
                      </TableCell>
                      <TableCell>Yes</TableCell>
                      <TableCell>Never</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <CreditCard className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Reports</CardTitle>
                  <CardDescription>Generate detailed financial reports</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Profit & Loss Statement
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Balance Sheet
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Cash Flow Statement
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Accounts Receivable Aging
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tax Reports</CardTitle>
                  <CardDescription>Tax-related reports and documents</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Sales Tax Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Income Statement
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Expense Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                        1099 Forms
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tax" className="space-y-6">
            {/* Tax Management Overview */}
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tax Collected</CardTitle>
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$4,520</div>
                  <p className="text-xs text-muted-foreground">
                    Q1 2024
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tax Due</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$1,250</div>
                  <p className="text-xs text-muted-foreground">
                    Due next month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tax Forms</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">
                    Ready to file
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Tax Management Table */}
            <Card>
              <CardHeader>
                <CardTitle>Tax Management</CardTitle>
                <CardDescription>Manage tax calculations and filings</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tax Type</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Taxable Amount</TableHead>
                      <TableHead>Tax Rate</TableHead>
                      <TableHead>Tax Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Sales Tax</TableCell>
                      <TableCell>Q1 2024</TableCell>
                      <TableCell>$45,200</TableCell>
                      <TableCell>10%</TableCell>
                      <TableCell>$4,520</TableCell>
                      <TableCell>
                        <Badge className="bg-yellow-100 text-yellow-800">PENDING</Badge>
                      </TableCell>
                      <TableCell>2024-04-15</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Calculator className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Income Tax</TableCell>
                      <TableCell>Q1 2024</TableCell>
                      <TableCell>$125,000</TableCell>
                      <TableCell>21%</TableCell>
                      <TableCell>$26,250</TableCell>
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-800">CALCULATED</Badge>
                      </TableCell>
                      <TableCell>2024-04-15</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Calculator className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Service Tax</TableCell>
                      <TableCell>Q1 2024</TableCell>
                      <TableCell>$85,000</TableCell>
                      <TableCell>15%</TableCell>
                      <TableCell>$12,750</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">FILED</Badge>
                      </TableCell>
                      <TableCell>2024-03-31</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Calculator className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            {/* Accounting Settings */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>Basic accounting configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Default Currency</Label>
                    <Select defaultValue="USD">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                        <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select defaultValue="UTC">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="EST">EST - Eastern Time</SelectItem>
                        <SelectItem value="PST">PST - Pacific Time</SelectItem>
                        <SelectItem value="GMT">GMT - Greenwich Mean Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fiscalYear">Fiscal Year Start</Label>
                    <Select defaultValue="January">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="January">January</SelectItem>
                        <SelectItem value="April">April</SelectItem>
                        <SelectItem value="July">July</SelectItem>
                        <SelectItem value="October">October</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Invoice Settings</CardTitle>
                  <CardDescription>Configure invoice preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-generate Invoices</Label>
                      <p className="text-sm text-muted-foreground">Automatically create invoices for services</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Send Reminders</Label>
                      <p className="text-sm text-muted-foreground">Automated payment reminders</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentTerms">Default Payment Terms</Label>
                    <Select defaultValue="NET_30">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NET_7">Net 7</SelectItem>
                        <SelectItem value="NET_15">Net 15</SelectItem>
                        <SelectItem value="NET_30">Net 30</SelectItem>
                        <SelectItem value="NET_60">Net 60</SelectItem>
                        <SelectItem value="NET_90">Net 90</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Default Tax Rate (%)</Label>
                    <Input id="taxRate" type="number" defaultValue="10" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Integration Settings</CardTitle>
                <CardDescription>Connect with external accounting systems</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Database className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="font-medium">QuickBooks</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">Connect to QuickBooks Online</p>
                    <Button variant="outline" size="sm" className="w-full">Connect</Button>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Database className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="font-medium">Xero</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">Connect to Xero Accounting</p>
                    <Button variant="outline" size="sm" className="w-full">Connect</Button>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Database className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="font-medium">Stripe</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">Connect to Stripe Payments</p>
                    <Button variant="outline" size="sm" className="w-full">Connect</Button>
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