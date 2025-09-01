"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  FileText, 
  Target, 
  BarChart3, 
  MessageSquare, 
  Calendar,
  Workflow,
  Globe,
  CreditCard,
  Building2,
  Phone,
  Mail,
  Zap,
  Shield,
  Database,
  FileSignature,
  Settings,
  Bell,
  Search,
  Filter,
  CheckCircle,
  Star,
  ArrowRight,
  Play,
  Eye,
  Download,
  ExternalLink
} from "lucide-react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"

export default function FeaturesPage() {
  const [activeCategory, setActiveCategory] = useState("all")

  const categories = [
    { id: "all", name: "All Features", count: 24 },
    { id: "student-management", name: "Student Management", count: 4 },
    { id: "marketing", name: "Marketing", count: 4 },
    { id: "automation", name: "Automation", count: 3 },
    { id: "communication", name: "Communication", count: 3 },
    { id: "analytics", name: "Analytics", count: 3 },
    { id: "operations", name: "Operations", count: 4 },
    { id: "security", name: "Security", count: 3 }
  ]

  const features = [
    {
      id: 1,
      title: "Student CRM",
      description: "Complete student lifecycle management from prospect to enrollment",
      icon: Users,
      category: "student-management",
      benefits: ["360° student profiles", "Application tracking", "Document management", "Progress monitoring"],
      popular: true
    },
    {
      id: 2,
      title: "Smart Application Processing",
      description: "Streamlined application workflow with automated document verification",
      icon: FileText,
      category: "student-management",
      benefits: ["Auto-document verification", "Status tracking", "Deadline reminders", "Bulk processing"],
      popular: true
    },
    {
      id: 3,
      title: "University Partnership Portal",
      description: "Connect and manage relationships with 1000+ universities worldwide",
      icon: Globe,
      category: "student-management",
      benefits: ["Direct university connections", "Commission tracking", "Application status sync", "Partnership levels"]
    },
    {
      id: 4,
      title: "Student Communication Hub",
      description: "Centralized communication with students across multiple channels",
      icon: MessageSquare,
      category: "communication",
      benefits: ["Multi-channel messaging", "Email templates", "SMS integration", "Chat support"]
    },
    {
      id: 5,
      title: "Marketing Automation",
      description: "Advanced marketing campaigns with lead nurturing and segmentation",
      icon: Target,
      category: "marketing",
      benefits: ["Lead scoring", "Email campaigns", "Landing pages", "ROI tracking"],
      popular: true
    },
    {
      id: 6,
      title: "Form & Landing Page Builder",
      description: "Drag-and-drop builder for high-converting landing pages and forms",
      icon: FileSignature,
      category: "marketing",
      benefits: ["No-code builder", "A/B testing", "Integration ready", "Mobile responsive"]
    },
    {
      id: 7,
      title: "Workflow Automation",
      description: "Visual workflow builder for automating agency processes",
      icon: Workflow,
      category: "automation",
      benefits: ["Drag-and-drop interface", "Trigger-based actions", "Conditional logic", "Real-time monitoring"],
      popular: true
    },
    {
      id: 8,
      title: "AI-Powered Lead Scoring",
      description: "Machine learning algorithms to score and prioritize leads",
      icon: BarChart3,
      category: "automation",
      benefits: ["Predictive scoring", "Custom criteria", "Automatic routing", "Performance insights"]
    },
    {
      id: 9,
      title: "Advanced Analytics",
      description: "Comprehensive reporting and business intelligence dashboard",
      icon: BarChart3,
      category: "analytics",
      benefits: ["Real-time dashboards", "Custom reports", "Data export", "KPI tracking"],
      popular: true
    },
    {
      id: 10,
      title: "Revenue Analytics",
      description: "Track revenue, commissions, and financial performance",
      icon: CreditCard,
      category: "analytics",
      benefits: ["Revenue tracking", "Commission management", "Financial forecasting", "Performance metrics"]
    },
    {
      id: 11,
      title: "Accounting Integration",
      description: "Seamless integration with popular accounting software",
      icon: Database,
      category: "operations",
      benefits: ["QuickBooks sync", "Invoice generation", "Payment processing", "Financial reporting"]
    },
    {
      id: 12,
      title: "Branch Management",
      description: "Multi-branch support with centralized control and local autonomy",
      icon: Building2,
      category: "operations",
      benefits: ["Branch hierarchy", "Role-based access", "Performance tracking", "Resource allocation"]
    }
  ]

  const filteredFeatures = activeCategory === "all" 
    ? features 
    : features.filter(feature => feature.category === activeCategory)

  const useCases = [
    {
      title: "Education Consulting Agencies",
      description: "Streamline student recruitment and application management",
      features: ["Student CRM", "Application Processing", "University Portal"],
      icon: Users
    },
    {
      title: "Language Schools",
      description: "Manage enrollments, schedules, and student progress",
      features: ["Student Management", "Communication Hub", "Analytics"],
      icon: FileText
    },
    {
      title: "University Recruitment Partners",
      description: "Coordinate with multiple agencies and track application pipelines",
      features: ["Partnership Portal", "Analytics", "Workflow Automation"],
      icon: Globe
    },
    {
      title: "Corporate Training Providers",
      description: "Manage corporate clients and training programs",
      features: ["CRM", "Automation", "Reporting"],
      icon: Building2
    }
  ]

  const integrations = [
    { name: "QuickBooks", category: "Accounting", icon: Database },
    { name: "Salesforce", category: "CRM", icon: Users },
    { name: "Mailchimp", category: "Email", icon: Mail },
    { name: "Stripe", category: "Payments", icon: CreditCard },
    { name: "Google Analytics", category: "Analytics", icon: BarChart3 },
    { name: "Slack", category: "Communication", icon: MessageSquare },
    { name: "Calendly", category: "Scheduling", icon: Calendar },
    { name: "Zapier", category: "Automation", icon: Workflow }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="bg-gradient-to-b from-background to-muted">
        {/* Hero Section */}
        <div className="bg-primary text-primary-foreground py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">Powerful Features for Modern Education Agencies</h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Everything you need to manage students, automate workflows, and grow your education agency
            </p>
          </div>
        </div>

      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* Category Filter */}
        <div>
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                onClick={() => setActiveCategory(category.id)}
                className="flex items-center gap-2"
              >
                {category.name}
                <Badge variant="secondary" className="text-xs">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeatures.map((feature) => (
            <Card key={feature.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
              {feature.popular && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-yellow-500 text-yellow-900">Popular</Badge>
                </div>
              )}
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Key Benefits:</h4>
                  <ul className="space-y-1">
                    {feature.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-4">
                    Learn More
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Use Cases */}
        <div>
          <h2 className="text-3xl font-bold text-center mb-12">Built for Your Use Case</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <useCase.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{useCase.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{useCase.description}</p>
                  <div className="space-y-1">
                    {useCase.features.map((feature, idx) => (
                      <div key={idx} className="text-xs text-muted-foreground">
                        • {feature}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Integration Partners */}
        <div>
          <h2 className="text-3xl font-bold text-center mb-12">Seamless Integrations</h2>
          <div className="bg-muted/50 rounded-lg p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
              {integrations.map((integration, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-background rounded-lg flex items-center justify-center mb-2">
                    <integration.icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{integration.name}</span>
                  <span className="text-xs text-muted-foreground">{integration.category}</span>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button variant="outline" size="lg">
                View All Integrations
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Feature Comparison */}
        <div>
          <h2 className="text-3xl font-bold text-center mb-12">Compare Plans</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Starter",
                price: "$99",
                description: "Perfect for small agencies just getting started",
                features: ["Up to 100 students", "Basic CRM", "Email support", "Standard analytics", "5GB storage"],
                popular: false
              },
              {
                name: "Professional",
                price: "$299",
                description: "For growing agencies with advanced needs",
                features: ["Up to 500 students", "Advanced CRM", "Priority support", "Advanced analytics", "50GB storage", "Marketing automation", "Workflow builder"],
                popular: true
              },
              {
                name: "Enterprise",
                price: "Custom",
                description: "For large agencies with custom requirements",
                features: ["Unlimited students", "Full feature set", "24/7 dedicated support", "Custom analytics", "Unlimited storage", "White-label options", "API access", "Custom integrations"],
                popular: false
              }
            ].map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "default" : "outline"}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary text-primary-foreground rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of education agencies already using EduSaaS to transform their operations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Start Free Trial
              <Play className="h-4 w-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
              Schedule a Demo
              <Calendar className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}