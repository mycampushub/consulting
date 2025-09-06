"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  FileText, 
  Target,
  Calendar,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from "lucide-react"

interface AnalyticsData {
  students: {
    total: number
    byStatus: Record<string, number>
    byStage: Record<string, number>
    thisMonth: number
    lastMonth: number
  }
  applications: {
    total: number
    byStatus: Record<string, number>
    thisMonth: number
    lastMonth: number
  }
  universities: {
    total: number
    partners: number
    byPartnershipLevel: Record<string, number>
    avgRanking: number
  }
  users: {
    total: number
    byRole: Record<string, number>
    byStatus: Record<string, number>
    activeThisMonth: number
  }
  tasks: {
    total: number
    byStatus: Record<string, number>
    byPriority: Record<string, number>
    overdue: number
    completedThisWeek: number
  }
  revenue: {
    totalRevenue: number
    thisMonthRevenue: number
    lastMonthRevenue: number
    byStatus: Record<string, number>
  }
  performance: {
    conversionRate: number
    applicationSuccessRate: number
    avgProcessingTime: number
    studentGrowthRate: number
    revenueGrowthRate: number
  }
  realTimeMetrics: {
    activeUsers: number
    activeApplications: number
    todayActivities: number
    systemHealth: string
  }
  recentActivities: Array<{
    id: string
    type: string
    action: string
    user: string
    timestamp: Date
    details: any
  }>
  summary: {
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
}

export default function AnalyticsPage() {
  const params = useParams()
  const subdomain = params.subdomain as string
  
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState("30d")
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchAnalytics()
  }, [subdomain, timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/${subdomain}/analytics?timeRange=${timeRange}`)
      if (!response.ok) throw new Error('Failed to fetch analytics')
      
      const data = await response.json()
      setAnalytics(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchAnalytics()
    setTimeout(() => setRefreshing(false), 1000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchAnalytics} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive insights and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleRefresh} variant="outline" disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.students.total}</div>
                <p className="text-xs text-muted-foreground">
                  +{analytics.students.thisMonth} this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Applications</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.applications.total}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.performance.applicationSuccessRate}% success rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(analytics.revenue.totalRevenue / 1000).toFixed(1)}K
                </div>
                <p className="text-xs text-muted-foreground">
                  ${analytics.revenue.thisMonthRevenue.toLocaleString()} this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.performance.conversionRate}%</div>
                <p className="text-xs text-muted-foreground">
                  Student conversion
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <div className="text-2xl font-bold">{analytics.realTimeMetrics.activeUsers}</div>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Application Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <div className="text-2xl font-bold">{analytics.performance.avgProcessingTime} days</div>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Team Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <div className="text-2xl font-bold">{analytics.performance.studentGrowthRate}%</div>
                  </div>
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Revenue Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <div className="text-2xl font-bold">{analytics.performance.revenueGrowthRate}%</div>
                  </div>
                  <BarChart3 className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Students by Status</CardTitle>
                <CardDescription>Distribution of students across different statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.students.byStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                        <span className="capitalize">{status.replace('_', ' ')}</span>
                      </div>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Students by Application Stage</CardTitle>
                <CardDescription>Current stage of each student in the application process</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.students.byStage).map(([stage, count]) => (
                    <div key={stage} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="capitalize">{stage.replace('_', ' ')}</span>
                      </div>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Status</CardTitle>
                <CardDescription>Current status of all applications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.applications.byStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="capitalize">{status.replace('_', ' ')}</span>
                      </div>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Application Overview</CardTitle>
                <CardDescription>Application processing metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>This Month</span>
                  <Badge>{analytics.applications.thisMonth}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Last Month</span>
                  <Badge>{analytics.applications.lastMonth}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Success Rate</span>
                  <Badge>{analytics.performance.applicationSuccessRate}%</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Avg Processing Time</span>
                  <Badge>{analytics.performance.avgProcessingTime} days</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="marketing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Financial performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Revenue</span>
                  <Badge>${analytics.revenue.totalRevenue.toLocaleString()}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>This Month</span>
                  <Badge>${analytics.revenue.thisMonthRevenue.toLocaleString()}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Last Month</span>
                  <Badge>${analytics.revenue.lastMonthRevenue.toLocaleString()}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Growth Rate</span>
                  <Badge className={analytics.performance.revenueGrowthRate >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {analytics.performance.revenueGrowthRate >= 0 ? '+' : ''}{analytics.performance.revenueGrowthRate}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Status</CardTitle>
                <CardDescription>Breakdown of revenue by invoice status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(analytics.revenue.byStatus).map(([status, amount]) => (
                  <div key={status} className="flex justify-between">
                    <span className="capitalize">{status.replace('_', ' ')}</span>
                    <Badge variant="secondary">${amount.toLocaleString()}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
                <CardDescription>Revenue and transaction metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Revenue</span>
                  <Badge>${analytics.revenue.totalRevenue.toLocaleString()}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>This Month</span>
                  <Badge>${analytics.revenue.thisMonthRevenue.toLocaleString()}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Last Month</span>
                  <Badge>${analytics.revenue.lastMonthRevenue.toLocaleString()}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Growth Rate</span>
                  <Badge className={analytics.performance.revenueGrowthRate >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {analytics.performance.revenueGrowthRate >= 0 ? '+' : ''}{analytics.performance.revenueGrowthRate}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Status</CardTitle>
                <CardDescription>Invoice status breakdown</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(analytics.revenue.byStatus).map(([status, amount]) => (
                  <div key={status} className="flex justify-between">
                    <span className="capitalize">{status.replace('_', ' ')}</span>
                    <Badge variant="secondary">${amount.toLocaleString()}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span>Conversion Rate</span>
                    <Badge>{analytics.performance.conversionRate}%</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${Math.min(analytics.performance.conversionRate, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span>Application Success Rate</span>
                    <Badge>{analytics.performance.applicationSuccessRate}%</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${Math.min(analytics.performance.applicationSuccessRate, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span>Student Growth</span>
                    <Badge>{analytics.performance.studentGrowthRate}%</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full" 
                      style={{ width: `${Math.min(Math.max(analytics.performance.studentGrowthRate + 50, 0), 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span>Revenue Growth</span>
                    <Badge>{analytics.performance.revenueGrowthRate}%</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full" 
                      style={{ width: `${Math.min(Math.max(analytics.performance.revenueGrowthRate + 50, 0), 100)}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Real-time Metrics</CardTitle>
                <CardDescription>Current system status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Active Users</span>
                  <Badge>{analytics.realTimeMetrics.activeUsers}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Active Applications</span>
                  <Badge>{analytics.realTimeMetrics.activeApplications}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Today's Activities</span>
                  <Badge>{analytics.realTimeMetrics.todayActivities}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>System Health</span>
                  <Badge className={analytics.realTimeMetrics.systemHealth === 'HEALTHY' ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {analytics.realTimeMetrics.systemHealth}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}