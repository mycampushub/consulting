import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calculator, FileText, DollarSign, TrendingUp, Users, CheckCircle } from "lucide-react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import Link from "next/link"

export default function AccountingModulePage() {
  const features = [
    {
      icon: Calculator,
      title: "Invoice Management",
      description: "Create, send, and track invoices with automated reminders and payment processing"
    },
    {
      icon: FileText,
      title: "Financial Reports",
      description: "Comprehensive financial reporting with customizable dashboards and insights"
    },
    {
      icon: DollarSign,
      title: "Payment Processing",
      description: "Integrated payment processing with multiple gateways and automatic reconciliation"
    },
    {
      icon: TrendingUp,
      title: "Revenue Tracking",
      description: "Track revenue by service, consultant, branch, or time period with detailed analytics"
    },
    {
      icon: Users,
      title: "Commission Management",
      description: "Automated commission calculations and tracking for consultants and agents"
    },
    {
      icon: CheckCircle,
      title: "Multi-Currency Support",
      description: "Handle multiple currencies with automatic exchange rate updates"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Accounting Module
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            Complete Financial Management for Your Agency
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Streamline your financial operations with our comprehensive accounting module designed 
            specifically for education agencies. Track revenue, manage invoices, and automate commissions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/signup">Start Free Trial</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/contact">Schedule Demo</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Key Benefits */}
        <div className="bg-muted/50 rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Key Benefits</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">For Your Agency</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Automated financial processes save time</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Improved cash flow with faster payments</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Better financial visibility and control</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Accurate commission tracking and payouts</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">For Your Team</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Transparent commission calculations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Easy invoice creation and tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Real-time financial performance data</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Multi-branch financial consolidation</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Streamline Your Finances?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Take control of your agency's financial management with our comprehensive accounting tools
          </p>
          <Button size="lg" asChild>
            <Link href="/signup">Get Started Today</Link>
          </Button>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}