"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  HelpCircle, 
  MessageCircle, 
  BookOpen, 
  Video, 
  Phone, 
  Mail, 
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  FileText,
  ExternalLink,
  Download,
  Star,
  Users,
  Headphones,
  Shield,
  Zap,
  Database,
  Settings,
  User,
  CreditCard,
  Globe,
  FileSignature,
  Calendar,
  Bell,
  MessageSquare,
  Send,
  Plus
} from "lucide-react"

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  helpful: number
}

interface Ticket {
  id: string
  subject: string
  description: string
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  category: string
  createdAt: string
  updatedAt: string
  responses?: Array<{
    id: string
    message: string
    author: string
    createdAt: string
    isSupport: boolean
  }>
}

interface Guide {
  id: string
  title: string
  description: string
  category: string
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  readTime: number
  views: number
  rating: number
  tags: string[]
}

const mockFAQs: FAQ[] = [
  {
    id: "1",
    question: "How do I create my first workflow?",
    answer: "To create your first workflow, navigate to the Workflows page and click 'Create Workflow'. You can then drag and drop nodes to build your automation flow.",
    category: "Workflows",
    helpful: 45
  },
  {
    id: "2", 
    question: "How do I add team members to my agency?",
    answer: "Go to Settings > Team Management and click 'Invite Team Member'. Enter their email address and select their role.",
    category: "Team",
    helpful: 32
  },
  {
    id: "3",
    question: "How do I integrate with external services?",
    answer: "Navigate to Settings > Integrations to connect with third-party services like CRM, email providers, and payment gateways.",
    category: "Integrations",
    helpful: 28
  },
  {
    id: "4",
    question: "How do I customize my agency's branding?",
    answer: "Go to Settings > General and upload your logo, set your brand colors, and configure your agency information.",
    category: "Settings",
    helpful: 25
  }
]

const mockGuides: Guide[] = [
  {
    id: "1",
    title: "Getting Started with Student Management",
    description: "Learn how to effectively manage student applications and track their progress.",
    category: "Student Management",
    difficulty: "BEGINNER",
    readTime: 5,
    views: 1250,
    rating: 4.8,
    tags: ["students", "applications", "onboarding"]
  },
  {
    id: "2",
    title: "Advanced Workflow Automation",
    description: "Master the workflow builder to create complex automation sequences.",
    category: "Workflows",
    difficulty: "ADVANCED",
    readTime: 15,
    views: 890,
    rating: 4.9,
    tags: ["workflows", "automation", "advanced"]
  },
  {
    id: "3",
    title: "Marketing Campaign Setup",
    description: "Create effective marketing campaigns to attract new students.",
    category: "Marketing",
    difficulty: "INTERMEDIATE",
    readTime: 10,
    views: 654,
    rating: 4.6,
    tags: ["marketing", "campaigns", "leads"]
  }
]

const mockTickets: Ticket[] = [
  {
    id: "1",
    subject: "Workflow not triggering automatically",
    description: "My workflow for new student onboarding is not triggering when new students are added.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    category: "Workflows",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T14:20:00Z",
    responses: [
      {
        id: "1",
        message: "We're looking into this issue. Can you provide more details about your workflow configuration?",
        author: "Support Team",
        createdAt: "2024-01-15T11:00:00Z",
        isSupport: true
      }
    ]
  },
  {
    id: "2",
    subject: "Billing inquiry",
    description: "Question about my upcoming invoice and payment methods.",
    status: "RESOLVED",
    priority: "MEDIUM",
    category: "Billing",
    createdAt: "2024-01-14T09:15:00Z",
    updatedAt: "2024-01-14T16:30:00Z"
  }
]

export default function SupportPage() {
  const params = useParams()
  const subdomain = params.subdomain as string
  
  const [activeTab, setActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [newTicket, setNewTicket] = useState({
    subject: "",
    description: "",
    priority: "MEDIUM",
    category: "general"
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredFAQs = mockFAQs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || faq.category.toLowerCase() === selectedCategory.toLowerCase()
    return matchesSearch && matchesCategory
  })

  const filteredGuides = mockGuides.filter(guide => {
    const matchesSearch = guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         guide.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         guide.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === "all" || guide.category.toLowerCase() === selectedCategory.toLowerCase()
    return matchesSearch && matchesCategory
  })

  const handleSubmitTicket = async () => {
    if (!newTicket.subject || !newTicket.description) return
    
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setNewTicket({
        subject: "",
        description: "",
        priority: "MEDIUM",
        category: "general"
      })
      setActiveTab("tickets")
    }, 1000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN": return "bg-red-100 text-red-800"
      case "IN_PROGRESS": return "bg-yellow-100 text-yellow-800"
      case "RESOLVED": return "bg-green-100 text-green-800"
      case "CLOSED": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "LOW": return "bg-blue-100 text-blue-800"
      case "MEDIUM": return "bg-yellow-100 text-yellow-800"
      case "HIGH": return "bg-orange-100 text-orange-800"
      case "URGENT": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Help & Support</h1>
          <p className="text-muted-foreground">Get help and find answers to your questions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <MessageCircle className="w-4 h-4 mr-2" />
            Live Chat
          </Button>
          <Button size="sm">
            <Phone className="w-4 h-4 mr-2" />
            Call Support
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Tickets</p>
                <p className="text-2xl font-bold">2</p>
              </div>
              <HelpCircle className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-bold">2h</p>
              </div>
              <Clock className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Knowledge Base</p>
                <p className="text-2xl font-bold">150+</p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Satisfaction Rate</p>
                <p className="text-2xl font-bold">98%</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search for help articles, FAQs, and guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="workflows">Workflows</SelectItem>
                <SelectItem value="team">Team</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
                <SelectItem value="integrations">Integrations</SelectItem>
                <SelectItem value="settings">Settings</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tickets">My Tickets</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Help */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("tickets")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Submit a Ticket
                </CardTitle>
                <CardDescription>
                  Can't find what you're looking for? Our support team is here to help.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("knowledge")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Knowledge Base
                </CardTitle>
                <CardDescription>
                  Browse our comprehensive library of guides and tutorials.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("contact")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Contact Support
                </CardTitle>
                <CardDescription>
                  Get direct help via phone, email, or live chat.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Popular FAQs */}
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Quick answers to common questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredFAQs.slice(0, 5).map((faq) => (
                <div key={faq.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-medium mb-2">{faq.question}</h3>
                      <p className="text-sm text-muted-foreground">{faq.answer}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{faq.category}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {faq.helpful} people found this helpful
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Popular Guides */}
          <Card>
            <CardHeader>
              <CardTitle>Popular Guides</CardTitle>
              <CardDescription>Step-by-step tutorials and walkthroughs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {filteredGuides.slice(0, 3).map((guide) => (
                  <div key={guide.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{guide.title}</h3>
                        <Badge variant="outline">{guide.difficulty}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{guide.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{guide.readTime} min read</span>
                        <span>{guide.views} views</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {guide.rating}
                        </div>
                      </div>
                      <div className="flex gap-1 mt-2">
                        {guide.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Support Tickets</h2>
            <Button onClick={() => {
              setActiveTab("contact")
              document.getElementById("new-ticket-form")?.scrollIntoView({ behavior: "smooth" })
            }}>
              <Plus className="w-4 h-4 mr-2" />
              New Ticket
            </Button>
          </div>

          {/* Tickets List */}
          <div className="space-y-4">
            {mockTickets.map((ticket) => (
              <Card key={ticket.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{ticket.subject}</h3>
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                        <Badge variant="outline">{ticket.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{ticket.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                        <span>Updated: {new Date(ticket.updatedAt).toLocaleDateString()}</span>
                        {ticket.responses && ticket.responses.length > 0 && (
                          <span>{ticket.responses.length} responses</span>
                        )}
                      </div>
                      {ticket.responses && ticket.responses.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {ticket.responses.map((response) => (
                            <div key={response.id} className={`p-2 rounded text-sm ${response.isSupport ? 'bg-blue-50' : 'bg-gray-50'}`}>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{response.author}</span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(response.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p>{response.message}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Knowledge Base</h2>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Guides
            </Button>
          </div>

          {/* Categories */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Getting Started", icon: Users, count: 25 },
              { name: "Student Management", icon: User, count: 18 },
              { name: "Workflows", icon: Zap, count: 32 },
              { name: "Marketing", icon: MessageSquare, count: 15 },
              { name: "Billing", icon: CreditCard, count: 12 },
              { name: "Integrations", icon: Globe, count: 20 },
              { name: "Settings", icon: Settings, count: 16 },
              { name: "Advanced", icon: Database, count: 12 }
            ].map((category) => (
              <Card key={category.name} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <category.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-medium">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.count} articles</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Guides List */}
          <div className="space-y-4">
            {filteredGuides.map((guide) => (
              <Card key={guide.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{guide.title}</h3>
                        <Badge variant="outline">{guide.difficulty}</Badge>
                        <Badge variant="secondary">{guide.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{guide.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{guide.readTime} min read</span>
                        <span>{guide.views} views</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {guide.rating}
                        </div>
                      </div>
                      <div className="flex gap-1 mt-2">
                        {guide.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <FileText className="w-4 h-4 mr-2" />
                        Read
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <h2 className="text-xl font-semibold">Contact Support</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Methods */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Live Chat
                  </CardTitle>
                  <CardDescription>
                    Chat with our support team in real-time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Available now</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Average response time: 2 minutes</p>
                    <Button className="w-full">Start Chat</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Phone Support
                  </CardTitle>
                  <CardDescription>
                    Call us for immediate assistance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium">+1 (555) 123-4567</p>
                    <p className="text-sm text-muted-foreground">Mon-Fri, 9 AM - 6 PM EST</p>
                    <Button variant="outline" className="w-full">Call Now</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Email Support
                  </CardTitle>
                  <CardDescription>
                    Send us a detailed message
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium">support@eduagency.com</p>
                    <p className="text-sm text-muted-foreground">Response within 24 hours</p>
                    <Button variant="outline" className="w-full">Send Email</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* New Ticket Form */}
            <Card id="new-ticket-form">
              <CardHeader>
                <CardTitle>Create Support Ticket</CardTitle>
                <CardDescription>
                  Submit a detailed ticket for complex issues
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Brief description of your issue"
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={newTicket.category} onValueChange={(value) => setNewTicket({...newTicket, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="workflows">Workflows</SelectItem>
                      <SelectItem value="team">Team</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="integrations">Integrations</SelectItem>
                      <SelectItem value="settings">Settings</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newTicket.priority} onValueChange={(value) => setNewTicket({...newTicket, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Please provide detailed information about your issue..."
                    rows={4}
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                  />
                </div>

                <Button 
                  onClick={handleSubmitTicket} 
                  disabled={isSubmitting || !newTicket.subject || !newTicket.description}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Ticket
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}