"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  BookOpen, 
  Code, 
  Database, 
  Globe, 
  Shield, 
  Zap,
  FileText,
  Download,
  ExternalLink,
  Play,
  CheckCircle,
  Clock,
  Users,
  ArrowRight,
  Github,
  Api,
  Terminal,
  Settings,
  Smartphone,
  Cloud,
  Lock,
  BarChart3,
  MessageSquare,
  Calendar,
  Filter
} from "lucide-react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"

interface DocSection {
  id: string
  title: string
  description: string
  icon: any
  color: string
  docCount: number
}

interface Documentation {
  id: string
  title: string
  description: string
  category: string
  type: "guide" | "api" | "tutorial" | "reference"
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  readTime: string
  lastUpdated: string
  tags: string[]
  popular: boolean
  featured: boolean
}

interface ApiEndpoint {
  method: string
  endpoint: string
  description: string
  category: string
}

interface QuickStart {
  title: string
  description: string
  time: string
  icon: any
  color: string
}

export default function DocumentationPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedType, setSelectedType] = useState("all")

  const sections: DocSection[] = [
    {
      id: "getting-started",
      title: "Getting Started",
      description: "Quick start guides and basic concepts",
      icon: BookOpen,
      color: "text-blue-600",
      docCount: 8
    },
    {
      id: "api-reference",
      title: "API Reference",
      description: "Complete API documentation and endpoints",
      icon: Code,
      color: "text-green-600",
      docCount: 45
    },
    {
      id: "guides",
      title: "Guides",
      description: "In-depth guides and best practices",
      icon: FileText,
      color: "text-purple-600",
      docCount: 12
    },
    {
      id: "tutorials",
      title: "Tutorials",
      description: "Step-by-step tutorials and examples",
      icon: Play,
      color: "text-orange-600",
      docCount: 15
    },
    {
      id: "sdk",
      title: "SDKs & Libraries",
      description: "Official SDKs and third-party libraries",
      icon: Database,
      color: "text-red-600",
      docCount: 6
    },
    {
      id: "deployment",
      title: "Deployment",
      description: "Deployment and configuration guides",
      icon: Cloud,
      color: "text-yellow-600",
      docCount: 8
    }
  ]

  const quickStarts: QuickStart[] = [
    {
      title: "Setup Your Account",
      description: "Create and configure your EduSaaS account",
      time: "5 min",
      icon: Users,
      color: "bg-blue-100 text-blue-800"
    },
    {
      title: "First Integration",
      description: "Connect your first external service",
      time: "10 min",
      icon: Api,
      color: "bg-green-100 text-green-800"
    },
    {
      title: "Create a Workflow",
      description: "Build your first automation workflow",
      time: "15 min",
      icon: Zap,
      color: "bg-purple-100 text-purple-800"
    },
    {
      title: "API Authentication",
      description: "Set up API keys and authentication",
      time: "8 min",
      icon: Lock,
      color: "bg-orange-100 text-orange-800"
    }
  ]

  const apiEndpoints: ApiEndpoint[] = [
    {
      method: "GET",
      endpoint: "/api/v1/students",
      description: "Retrieve a list of students",
      category: "Students"
    },
    {
      method: "POST",
      endpoint: "/api/v1/students",
      description: "Create a new student record",
      category: "Students"
    },
    {
      method: "GET",
      endpoint: "/api/v1/applications",
      description: "Get student applications",
      category: "Applications"
    },
    {
      method: "PUT",
      endpoint: "/api/v1/applications/{id}",
      description: "Update application status",
      category: "Applications"
    },
    {
      method: "GET",
      endpoint: "/api/v1/analytics",
      description: "Retrieve analytics data",
      category: "Analytics"
    }
  ]

  const documentations: Documentation[] = [
    {
      id: "1",
      title: "Authentication & Authorization",
      description: "Learn how to authenticate users and manage permissions in your applications",
      category: "getting-started",
      type: "guide",
      difficulty: "Beginner",
      readTime: "15 min",
      lastUpdated: "2024-01-15",
      tags: ["auth", "security", "permissions"],
      popular: true,
      featured: true
    },
    {
      id: "2",
      title: "REST API Overview",
      description: "Complete reference for the EduSaaS REST API including all endpoints and data models",
      category: "api-reference",
      type: "api",
      difficulty: "Intermediate",
      readTime: "30 min",
      lastUpdated: "2024-01-14",
      tags: ["api", "rest", "endpoints"],
      popular: true,
      featured: true
    },
    {
      id: "3",
      title: "Building Your First Workflow",
      description: "Step-by-step tutorial for creating your first automation workflow",
      category: "tutorials",
      type: "tutorial",
      difficulty: "Beginner",
      readTime: "20 min",
      lastUpdated: "2024-01-12",
      tags: ["workflow", "automation", "tutorial"],
      popular: false,
      featured: false
    },
    {
      id: "4",
      title: "Webhooks Integration Guide",
      description: "Learn how to set up and handle webhooks for real-time notifications",
      category: "guides",
      type: "guide",
      difficulty: "Intermediate",
      readTime: "25 min",
      lastUpdated: "2024-01-10",
      tags: ["webhooks", "integration", "real-time"],
      popular: true,
      featured: false
    },
    {
      id: "5",
      title: "JavaScript SDK Reference",
      description: "Complete documentation for the official JavaScript SDK",
      category: "sdk",
      type: "reference",
      difficulty: "Intermediate",
      readTime: "40 min",
      lastUpdated: "2024-01-08",
      tags: ["javascript", "sdk", "reference"],
      popular: false,
      featured: false
    },
    {
      id: "6",
      title: "Advanced Data Modeling",
      description: "Best practices for structuring and managing complex data relationships",
      category: "guides",
      type: "guide",
      difficulty: "Advanced",
      readTime: "35 min",
      lastUpdated: "2024-01-05",
      tags: ["data", "modeling", "advanced"],
      popular: false,
      featured: true
    }
  ]

  const filteredDocs = documentations.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory
    const matchesType = selectedType === "all" || doc.type === selectedType
    
    return matchesSearch && matchesCategory && matchesType
  })

  const popularDocs = [...documentations].sort((a, b) => {
    if (a.popular && !b.popular) return -1
    if (!a.popular && b.popular) return 1
    return 0
  }).slice(0, 5)

  const featuredDocs = documentations.filter(doc => doc.featured)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET": return "bg-green-100 text-green-800"
      case "POST": return "bg-blue-100 text-blue-800"
      case "PUT": return "bg-yellow-100 text-yellow-800"
      case "DELETE": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground py-20">
          <div className="container mx-auto px-4 text-center">
            <Badge variant="secondary" className="mb-4">
              <BookOpen className="h-4 w-4 mr-2" />
              Documentation
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Everything You Need to Build with EduSaaS
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto mb-8">
              Comprehensive documentation, API references, and guides to help you integrate and build with our platform.
            </p>
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search documentation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/20 border-background/30 text-white placeholder:text-white/70 h-12"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Quick Start Section */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Quick Start Guide</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Get up and running in minutes with these essential guides
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickStarts.map((guide, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 ${guide.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <guide.icon className="h-8 w-8" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{guide.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{guide.description}</p>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {guide.time}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Documentation Sections */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Documentation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                      selectedCategory === "all"
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <span>All Docs</span>
                    <Badge variant="secondary">{documentations.length}</Badge>
                  </button>
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setSelectedCategory(section.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                        selectedCategory === section.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <section.icon className={`h-4 w-4 ${section.color}`} />
                        <span>{section.title}</span>
                      </div>
                      <Badge variant="secondary">{section.docCount}</Badge>
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Document Types */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Document Type
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { id: "all", name: "All Types", count: documentations.length },
                    { id: "guide", name: "Guides", count: documentations.filter(d => d.type === "guide").length },
                    { id: "api", name: "API Reference", count: documentations.filter(d => d.type === "api").length },
                    { id: "tutorial", name: "Tutorials", count: documentations.filter(d => d.type === "tutorial").length },
                    { id: "reference", name: "Reference", count: documentations.filter(d => d.type === "reference").length }
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                        selectedType === type.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      <span>{type.name}</span>
                      <Badge variant="secondary">{type.count}</Badge>
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Popular API Endpoints */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Api className="h-5 w-5" />
                    Popular Endpoints
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {apiEndpoints.map((endpoint, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className={getMethodColor(endpoint.method)}>
                          {endpoint.method}
                        </Badge>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {endpoint.endpoint}
                        </code>
                      </div>
                      <p className="text-xs text-muted-foreground">{endpoint.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* GitHub Link */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Github className="h-5 w-5" />
                    Open Source
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    <Github className="h-4 w-4 mr-2" />
                    View on GitHub
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Featured Documentation */}
              <section>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Star className="h-6 w-6 text-yellow-500" />
                  Featured Documentation
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {featuredDocs.map((doc) => (
                    <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className={sections.find(s => s.id === doc.category)?.color.replace('text-', 'bg-').replace('-600', '-100')}>
                            {sections.find(s => s.id === doc.category)?.title}
                          </Badge>
                          <Badge variant="outline">{doc.type}</Badge>
                          {doc.featured && (
                            <Badge className="bg-yellow-500 text-yellow-900">Featured</Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold mb-3 line-clamp-2">{doc.title}</h3>
                        <p className="text-muted-foreground mb-4 line-clamp-3">{doc.description}</p>
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {doc.readTime}
                            </div>
                            <div className="flex items-center gap-1">
                              <BarChart3 className="h-4 w-4" />
                              {doc.difficulty}
                            </div>
                          </div>
                        </div>
                        <Button size="sm" className="w-full">
                          Read Documentation
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              {/* All Documentation */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">All Documentation</h2>
                  <p className="text-muted-foreground">
                    {filteredDocs.length} documents found
                  </p>
                </div>

                <div className="space-y-4">
                  {filteredDocs.map((doc) => (
                    <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <Badge className={sections.find(s => s.id === doc.category)?.color.replace('text-', 'bg-').replace('-600', '-100')}>
                                {sections.find(s => s.id === doc.category)?.title}
                              </Badge>
                              <Badge variant="outline">{doc.type}</Badge>
                              <Badge variant="secondary">{doc.difficulty}</Badge>
                              {doc.featured && (
                                <Badge className="bg-yellow-500 text-yellow-900">Featured</Badge>
                              )}
                              {doc.popular && (
                                <Badge className="bg-purple-500 text-purple-900">Popular</Badge>
                              )}
                            </div>
                            <h3 className="text-lg font-semibold mb-3 line-clamp-2">{doc.title}</h3>
                            <p className="text-muted-foreground mb-4 line-clamp-2">{doc.description}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {doc.readTime}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Updated {formatDate(doc.lastUpdated)}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {doc.tags.slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button size="sm">
                              Read
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Need More Help?
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Can't find what you're looking for? Our community and support team are here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary">
                Join Community
                <Users className="h-4 w-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                Contact Support
                <MessageSquare className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}