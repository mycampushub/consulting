"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { 
  Search, 
  HelpCircle, 
  BookOpen, 
  Video, 
  MessageCircle, 
  Phone, 
  Mail,
  Clock,
  CheckCircle,
  Star,
  TrendingUp,
  Users,
  Lightbulb,
  Shield,
  Zap,
  Database,
  Globe,
  FileText,
  ArrowRight,
  ExternalLink,
  Download,
  Play,
  Headphones
} from "lucide-react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"

interface HelpArticle {
  id: string
  title: string
  excerpt: string
  category: string
  tags: string[]
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  readTime: string
  views: number
  helpful: number
  featured: boolean
  lastUpdated: string
}

interface HelpCategory {
  id: string
  name: string
  description: string
  icon: any
  color: string
  articleCount: number
}

interface QuickAction {
  title: string
  description: string
  icon: any
  action: string
  color: string
}

interface FAQ {
  question: string
  answer: string
  category: string
  popular: boolean
}

export default function HelpCenterPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const categories: HelpCategory[] = [
    {
      id: "getting-started",
      name: "Getting Started",
      description: "Learn the basics and set up your account",
      icon: BookOpen,
      color: "text-blue-600",
      articleCount: 12
    },
    {
      id: "student-management",
      name: "Student Management",
      description: "Manage students and applications",
      icon: Users,
      color: "text-green-600",
      articleCount: 18
    },
    {
      id: "marketing",
      name: "Marketing & Sales",
      description: "Tools for marketing and lead generation",
      icon: TrendingUp,
      color: "text-purple-600",
      articleCount: 15
    },
    {
      id: "automation",
      name: "Automation",
      description: "Streamline workflows with automation",
      icon: Zap,
      color: "text-orange-600",
      articleCount: 10
    },
    {
      id: "integrations",
      name: "Integrations",
      description: "Connect with other tools and services",
      icon: Globe,
      color: "text-red-600",
      articleCount: 8
    },
    {
      id: "billing",
      name: "Billing & Account",
      description: "Manage subscriptions and payments",
      icon: Database,
      color: "text-yellow-600",
      articleCount: 6
    }
  ]

  const quickActions: QuickAction[] = [
    {
      title: "Contact Support",
      description: "Get help from our support team",
      icon: MessageCircle,
      action: "contact",
      color: "bg-blue-100 text-blue-800"
    },
    {
      title: "Schedule Training",
      description: "Book a training session with experts",
      icon: Video,
      action: "training",
      color: "bg-green-100 text-green-800"
    },
    {
      title: "Live Chat",
      description: "Chat with us in real-time",
      icon: MessageCircle,
      action: "chat",
      color: "bg-purple-100 text-purple-800"
    },
    {
      title: "Request Feature",
      description: "Suggest new features or improvements",
      icon: Lightbulb,
      action: "feature",
      color: "bg-orange-100 text-orange-800"
    }
  ]

  const faqs: FAQ[] = [
    {
      question: "How do I get started with EduSaaS?",
      answer: "Getting started is easy! Simply sign up for an account, complete the onboarding wizard, and you'll have your agency up and running in minutes.",
      category: "getting-started",
      popular: true
    },
    {
      question: "Can I import my existing student data?",
      answer: "Yes, we support CSV imports for student data. You can also use our API for more complex data migrations.",
      category: "student-management",
      popular: true
    },
    {
      question: "How secure is my data?",
      answer: "We take security seriously with SOC 2 Type II certification, GDPR compliance, and enterprise-grade encryption.",
      category: "security",
      popular: false
    },
    {
      question: "What integrations do you support?",
      answer: "We integrate with popular CRM systems, email providers, payment gateways, and marketing tools.",
      category: "integrations",
      popular: true
    },
    {
      question: "How do I cancel my subscription?",
      answer: "You can cancel anytime from your account settings. You'll retain access until the end of your billing period.",
      category: "billing",
      popular: false
    },
    {
      question: "Do you offer training and onboarding?",
      answer: "Yes, we offer comprehensive onboarding, training sessions, and extensive documentation.",
      category: "getting-started",
      popular: true
    }
  ]

  const helpArticles: HelpArticle[] = [
    {
      id: "1",
      title: "Complete Guide to Setting Up Your Agency",
      excerpt: "Learn how to set up your education agency from scratch, including branding, users, and initial configuration.",
      category: "getting-started",
      tags: ["setup", "onboarding", "configuration"],
      difficulty: "Beginner",
      readTime: "10 min",
      views: 2540,
      helpful: 89,
      featured: true,
      lastUpdated: "2024-01-15"
    },
    {
      id: "2",
      title: "Managing Student Applications",
      excerpt: "A comprehensive guide to managing student applications, tracking progress, and communicating with students.",
      category: "student-management",
      tags: ["applications", "students", "tracking"],
      difficulty: "Intermediate",
      readTime: "15 min",
      views: 1890,
      helpful: 94,
      featured: true,
      lastUpdated: "2024-01-12"
    },
    {
      id: "3",
      title: "Creating Effective Marketing Campaigns",
      excerpt: "Learn how to create and manage marketing campaigns that attract and convert more students.",
      category: "marketing",
      tags: ["marketing", "campaigns", "leads"],
      difficulty: "Intermediate",
      readTime: "12 min",
      views: 1650,
      helpful: 87,
      featured: false,
      lastUpdated: "2024-01-10"
    },
    {
      id: "4",
      title: "Setting Up Automation Workflows",
      excerpt: "Automate repetitive tasks and streamline your agency operations with our visual workflow builder.",
      category: "automation",
      tags: ["automation", "workflows", "efficiency"],
      difficulty: "Advanced",
      readTime: "18 min",
      views: 1420,
      helpful: 91,
      featured: false,
      lastUpdated: "2024-01-08"
    },
    {
      id: "5",
      title: "Understanding Analytics and Reports",
      excerpt: "Learn how to use our analytics dashboard to track performance and make data-driven decisions.",
      category: "student-management",
      tags: ["analytics", "reports", "data"],
      difficulty: "Intermediate",
      readTime: "14 min",
      views: 1280,
      helpful: 85,
      featured: false,
      lastUpdated: "2024-01-05"
    },
    {
      id: "6",
      title: "Integrating with Third-Party Tools",
      excerpt: "Connect EduSaaS with your favorite tools and services to create a seamless workflow.",
      category: "integrations",
      tags: ["integrations", "api", "tools"],
      difficulty: "Advanced",
      readTime: "20 min",
      views: 980,
      helpful: 88,
      featured: false,
      lastUpdated: "2024-01-03"
    }
  ]

  const filteredArticles = helpArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const popularArticles = [...helpArticles].sort((a, b) => b.views - a.views).slice(0, 5)
  const featuredArticles = helpArticles.filter(article => article.featured)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground py-20">
          <div className="container mx-auto px-4 text-center">
            <Badge variant="secondary" className="mb-4">
              <HelpCircle className="h-4 w-4 mr-2" />
              Help Center
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              How Can We Help You Today?
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto mb-8">
              Find answers, get support, and learn how to make the most of EduSaaS with our comprehensive help resources.
            </p>
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for help articles, guides, and FAQs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/20 border-background/30 text-white placeholder:text-white/70 h-12"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Quick Actions</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Get immediate help with these common requests
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 ${action.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <action.icon className="h-8 w-8" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{action.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{action.description}</p>
                    <Button size="sm" className="w-full">
                      Get Started
                    </Button>
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
              {/* Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Categories
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
                    <span>All Articles</span>
                    <Badge variant="secondary">{helpArticles.length}</Badge>
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                        selectedCategory === category.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <category.icon className={`h-4 w-4 ${category.color}`} />
                        <span>{category.name}</span>
                      </div>
                      <Badge variant="secondary">{category.articleCount}</Badge>
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Popular Articles */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Popular Articles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {popularArticles.map((article, index) => (
                    <div key={article.id} className="flex gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">#{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm line-clamp-2 mb-1">{article.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Star className="h-3 w-3" />
                          {article.helpful}% helpful
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Contact Support */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Headphones className="h-5 w-5" />
                    Still Need Help?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" variant="outline">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Live Chat
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Support
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Us
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Featured Articles */}
              <section>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Star className="h-6 w-6 text-yellow-500" />
                  Featured Articles
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {featuredArticles.map((article) => (
                    <Card key={article.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className={categories.find(c => c.id === article.category)?.color.replace('text-', 'bg-').replace('-600', '-100')}>
                            {categories.find(c => c.id === article.category)?.name}
                          </Badge>
                          <Badge variant="outline">Featured</Badge>
                        </div>
                        <h3 className="text-lg font-semibold mb-3 line-clamp-2">{article.title}</h3>
                        <p className="text-muted-foreground mb-4 line-clamp-3">{article.excerpt}</p>
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {article.readTime}
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4" />
                              {article.helpful}% helpful
                            </div>
                          </div>
                        </div>
                        <Button size="sm" className="w-full">
                          Read Article
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              {/* All Articles */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Help Articles</h2>
                  <p className="text-muted-foreground">
                    {filteredArticles.length} articles found
                  </p>
                </div>

                <div className="space-y-4">
                  {filteredArticles.map((article) => (
                    <Card key={article.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <Badge className={categories.find(c => c.id === article.category)?.color.replace('text-', 'bg-').replace('-600', '-100')}>
                                {categories.find(c => c.id === article.category)?.name}
                              </Badge>
                              <Badge variant="outline">{article.difficulty}</Badge>
                              {article.featured && (
                                <Badge className="bg-yellow-500 text-yellow-900">Featured</Badge>
                              )}
                            </div>
                            <h3 className="text-lg font-semibold mb-3 line-clamp-2">{article.title}</h3>
                            <p className="text-muted-foreground mb-4 line-clamp-2">{article.excerpt}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {article.readTime}
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                {article.views} views
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4" />
                                {article.helpful}% helpful
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Updated {formatDate(article.lastUpdated)}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {article.tags.slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            Read
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              {/* FAQ Section */}
              <section>
                <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
                <Card>
                  <CardContent className="p-6">
                    <Accordion type="single" collapsible className="w-full">
                      {faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                          <AccordionTrigger className="text-left">
                            <div className="flex items-center gap-2">
                              {faq.popular && (
                                <Badge className="bg-yellow-500 text-yellow-900 text-xs">Popular</Badge>
                              )}
                              {faq.question}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </section>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Still Have Questions?
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Our support team is here to help you 24/7. Get in touch with us and we'll be happy to assist you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary">
                Contact Support
                <MessageCircle className="h-4 w-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                Schedule a Call
                <Phone className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}