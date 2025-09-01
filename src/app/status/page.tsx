import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle, XCircle, Clock, Activity } from "lucide-react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"

export default function StatusPage() {
  const services = [
    {
      name: "Website",
      status: "operational",
      description: "Main website and landing pages",
      lastChecked: "2 minutes ago"
    },
    {
      name: "Student CRM",
      status: "operational",
      description: "Student management and CRM features",
      lastChecked: "1 minute ago"
    },
    {
      name: "Marketing Automation",
      status: "operational",
      description: "Email campaigns and workflow automation",
      lastChecked: "3 minutes ago"
    },
    {
      name: "Landing Page Builder",
      status: "operational",
      description: "Page creation and hosting",
      lastChecked: "2 minutes ago"
    },
    {
      name: "Form Builder",
      status: "operational",
      description: "Form creation and submission processing",
      lastChecked: "1 minute ago"
    },
    {
      name: "Accounting Module",
      status: "operational",
      description: "Financial management and invoicing",
      lastChecked: "4 minutes ago"
    },
    {
      name: "API Services",
      status: "operational",
      description: "External API integrations",
      lastChecked: "2 minutes ago"
    },
    {
      name: "Database",
      status: "operational",
      description: "Data storage and retrieval",
      lastChecked: "1 minute ago"
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "degraded":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "outage":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "operational":
        return <Badge variant="default" className="bg-green-500">Operational</Badge>
      case "degraded":
        return <Badge variant="secondary" className="bg-yellow-500">Degraded</Badge>
      case "outage":
        return <Badge variant="destructive">Outage</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const incidents = [
    {
      date: "2024-01-15",
      time: "14:30 UTC",
      title: "Brief API Degradation",
      description: "Experienced elevated response times for API requests lasting approximately 15 minutes.",
      status: "resolved"
    },
    {
      date: "2024-01-10",
      time: "09:15 UTC",
      title: "Scheduled Maintenance",
      description: "Completed scheduled database maintenance with no service disruption.",
      status: "completed"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-4">
              System Status
            </Badge>
            <h1 className="text-4xl font-bold mb-4">
              System Status
            </h1>
            <p className="text-lg text-muted-foreground">
              Real-time status and performance metrics for all EduSaaS services
            </p>
          </div>

          {/* Overall Status */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Overall System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <h3 className="text-2xl font-semibold text-green-600">All Systems Operational</h3>
                  <p className="text-muted-foreground">All services are functioning normally</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Status */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Service Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(service.status)}
                      <div>
                        <h4 className="font-semibold">{service.name}</h4>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(service.status)}
                      <p className="text-xs text-muted-foreground mt-1">Checked {service.lastChecked}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Incidents */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Recent Incidents</CardTitle>
            </CardHeader>
            <CardContent>
              {incidents.length > 0 ? (
                <div className="space-y-4">
                  {incidents.map((incident, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{incident.title}</h4>
                        <Badge variant="outline">{incident.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{incident.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {incident.date} at {incident.time}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No incidents reported in the last 30 days</p>
              )}
            </CardContent>
          </Card>

          {/* Uptime Metrics */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Uptime Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <h4 className="text-2xl font-bold text-green-600">99.9%</h4>
                  <p className="text-sm text-muted-foreground">Last 24 Hours</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <h4 className="text-2xl font-bold text-green-600">99.8%</h4>
                  <p className="text-sm text-muted-foreground">Last 7 Days</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <h4 className="text-2xl font-bold text-green-600">99.7%</h4>
                  <p className="text-sm text-muted-foreground">Last 30 Days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscribe to Updates */}
          <Card>
            <CardHeader>
              <CardTitle>Subscribe to Status Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Get notified about service status changes and incidents.</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 border rounded-md"
                />
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                  Subscribe
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}