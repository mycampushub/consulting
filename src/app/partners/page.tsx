"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Users, 
  Globe, 
  Handshake, 
  Award, 
  TrendingUp, 
  Star,
  Building2,
  University,
  Briefcase,
  Zap,
  CheckCircle,
  ArrowRight,
  Mail,
  Phone,
  Calendar,
  MapPin,
  ExternalLink,
  Filter,
  Target,
  Shield,
  Heart,
  Lightbulb,
  BarChart3,
  MessageSquare
} from "lucide-react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"

interface Partner {
  id: string
  name: string
  type: "university" | "technology" | "agency" | "service"
  logo: string
  description: string
  website: string
  location: string
  partnershipLevel: "strategic" | "premium" | "certified" | "standard"
  benefits: string[]
  establishedDate: string
  featured: boolean
  caseStudy?: string
}

interface PartnershipProgram {
  id: string
  title: string
  description: string
  type: string
  benefits: string[]
  requirements: string[]
  icon: any
  color: string
  cta: string
}

interface SuccessStory {
  id: string
  title: string
  partner: string
  description: string
  results: string[]
  metrics: {
    label: string
    value: string
    improvement: string
  }[]
  date: string
  category: string
}

export default function PartnersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedLevel, setSelectedLevel] = useState("all")

  const partnershipPrograms: PartnershipProgram[] = [
    {
      id: "university",
      title: "University Partnership Program",
      description: "Partner with universities worldwide to expand educational opportunities and streamline student recruitment.",
      type: "Educational Institutions",
      benefits: [
        "Access to global student network",
        "Streamlined application processing",
        "Marketing and promotion support",
        "Analytics and reporting tools",
        "Dedicated relationship manager"
      ],
      requirements: [
        "Accredited educational institution",
        "Minimum 500 students enrolled",
        "International student programs",
        "Commitment to partnership"
      ],
      icon: University,
      color: "text-blue-600",
      cta: "Become a University Partner"
    },
    {
      id: "technology",
      title: "Technology Partner Program",
      description: "Integrate your technology with EduSaaS to create comprehensive solutions for education agencies.",
      type: "Technology Companies",
      benefits: [
        "API access and documentation",
        "Co-marketing opportunities",
        "Joint development projects",
        "Technical support and training",
        "Revenue sharing opportunities"
      ],
      requirements: [
        "Complementary technology solution",
        "Technical integration capabilities",
        "Market presence in education",
        "Commitment to mutual growth"
      ],
      icon: Zap,
      color: "text-green-600",
      cta: "Become a Technology Partner"
    },
    {
      id: "agency",
      title: "Agency Network Program",
      description: "Join our global network of education agencies and collaborate on student placement opportunities.",
      type: "Education Agencies",
      benefits: [
        "Access to university partnerships",
        "Shared resources and best practices",
        "Collaborative marketing initiatives",
        "Training and certification programs",
        "Network events and conferences"
      ],
      requirements: [
        "Licensed education agency",
        "Minimum 2 years in operation",
        "Proven track record",
        "Quality standards compliance"
      ],
      icon: Briefcase,
      color: "text-purple-600",
      cta: "Join Agency Network"
    },
    {
      id: "service",
      title: "Service Partner Program",
      description: "Offer your services to our growing community of education agencies and institutions.",
      type: "Service Providers",
      benefits: [
        "Listing in partner directory",
        "Lead generation opportunities",
        "Co-branding possibilities",
        "Training and certification",
        "Customer success support"
      ],
      requirements: [
        "Relevant service offering",
        "Industry experience",
        "Quality service delivery",
        "Customer references"
      ],
      icon: Users,
      color: "text-orange-600",
      cta: "Become a Service Partner"
    }
  ]

  const partners: Partner[] = [
    {
      id: "1",
      name: "Stanford University",
      type: "university",
      logo: "/placeholder-logo.jpg",
      description: "World-renowned university offering undergraduate and graduate programs across multiple disciplines.",
      website: "https://stanford.edu",
      location: "Stanford, CA",
      partnershipLevel: "strategic",
      benefits: [
        "Direct student applications",
        "Streamlined admission process",
        "Joint marketing initiatives",
        "Data analytics and reporting"
      ],
      establishedDate: "2021-03-15",
      featured: true,
      caseStudy: "Increased international student enrollment by 35%"
    },
    {
      id: "2",
      name: "Salesforce",
      type: "technology",
      logo: "/placeholder-logo.jpg",
      description: "Leading CRM platform providing customer relationship management solutions for businesses worldwide.",
      website: "https://salesforce.com",
      location: "San Francisco, CA",
      partnershipLevel: "strategic",
      benefits: [
        "Seamless CRM integration",
        "Advanced analytics capabilities",
        "Custom workflow automation",
        "Enterprise-grade security"
      ],
      establishedDate: "2020-09-20",
      featured: true,
      caseStudy: "Improved agency productivity by 45%"
    },
    {
      id: "3",
      name: "Global Education Partners",
      type: "agency",
      logo: "/placeholder-logo.jpg",
      description: "International education agency with offices in 15 countries, specializing in student placement services.",
      website: "https://globaleducation.com",
      location: "London, UK",
      partnershipLevel: "premium",
      benefits: [
        "Shared university partnerships",
        "Collaborative marketing",
        "Best practice sharing",
        "Joint training programs"
      ],
      establishedDate: "2021-06-10",
      featured: true
    },
    {
      id: "4",
      name: "Harvard University",
      type: "university",
      logo: "/placeholder-logo.jpg",
      description: "Ivy League university known for excellence in teaching, learning, and research.",
      website: "https://harvard.edu",
      location: "Cambridge, MA",
      partnershipLevel: "strategic",
      benefits: [
        "Premium student placement",
        "Custom application workflows",
        "Dedicated support team",
        "Advanced analytics"
      ],
      establishedDate: "2020-12-01",
      featured: false
    },
    {
      id: "5",
      name: "Stripe",
      type: "technology",
      logo: "/placeholder-logo.jpg",
      description: "Financial infrastructure platform for businesses, providing payment processing and financial services.",
      website: "https://stripe.com",
      location: "San Francisco, CA",
      partnershipLevel: "premium",
      benefits: [
        "Integrated payment processing",
        "Multi-currency support",
        "Advanced fraud detection",
        "Automated billing"
      ],
      establishedDate: "2021-01-15",
      featured: false
    },
    {
      id: "6",
      name: "EduVisa Services",
      type: "service",
      logo: "/placeholder-logo.jpg",
      description: "Specialized visa consulting and immigration services for international students.",
      website: "https://eduvisa.com",
      location: "Toronto, Canada",
      partnershipLevel: "certified",
      benefits: [
        "Integrated visa processing",
        "Expert consultation services",
        "Compliance management",
        "Student support services"
      ],
      establishedDate: "2021-08-20",
      featured: false
    }
  ]

  const successStories: SuccessStory[] = [
    {
      id: "1",
      title: "Transforming International Student Recruitment",
      partner: "Stanford University",
      description: "How Stanford University partnered with EduSaaS to streamline their international student recruitment process and achieve record-breaking enrollment numbers.",
      results: [
        "35% increase in international applications",
        "50% reduction in processing time",
        "Improved student experience and satisfaction",
        "Enhanced data-driven decision making"
      ],
      metrics: [
        { label: "Applications Processed", value: "2,500", improvement: "+35%" },
        { label: "Processing Time", value: "3 days", improvement: "-50%" },
        { label: "Student Satisfaction", value: "94%", improvement: "+15%" },
        { label: "Staff Efficiency", value: "60%", improvement: "+25%" }
      ],
      date: "2024-01-15",
      category: "university"
    },
    {
      id: "2",
      title: "Powering Agency Growth with Integrated Technology",
      partner: "Global Education Partners",
      description: "How Global Education Partners leveraged EduSaaS's platform and partner network to expand their operations across 5 new countries.",
      results: [
        "Expanded to 5 new countries in 12 months",
        "Increased student placements by 200%",
        "Improved operational efficiency by 40%",
        "Enhanced partner collaboration"
      ],
      metrics: [
        { label: "New Countries", value: "5", improvement: "+100%" },
        { label: "Student Placements", value: "1,200", improvement: "+200%" },
        { label: "Operational Efficiency", value: "85%", improvement: "+40%" },
        { label: "Partner Satisfaction", value: "96%", improvement: "+20%" }
      ],
      date: "2024-01-10",
      category: "agency"
    },
    {
      id: "3",
      title: "Revolutionizing Payment Processing for Education",
      partner: "Stripe",
      description: "How the integration between EduSaaS and Stripe transformed payment processing for education agencies worldwide.",
      results: [
        "99.9% payment success rate",
        "Support for 50+ currencies",
        "Reduced payment processing costs by 30%",
        "Enhanced security and compliance"
      ],
      metrics: [
        { label: "Payment Success Rate", value: "99.9%", improvement: "+5%" },
        { label: "Processing Cost", value: "1.2%", improvement: "-30%" },
        { label: "Currencies Supported", value: "50+", improvement: "+150%" },
        { label: "Fraud Detection", value: "99.8%", improvement: "+10%" }
      ],
      date: "2024-01-05",
      category: "technology"
    }
  ]

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = selectedType === "all" || partner.type === selectedType
    const matchesLevel = selectedLevel === "all" || partner.partnershipLevel === selectedLevel
    
    return matchesSearch && matchesType && matchesLevel
  })

  const getLevelColor = (level: string) => {
    switch (level) {
      case "strategic": return "bg-purple-100 text-purple-800"
      case "premium": return "bg-blue-100 text-blue-800"
      case "certified": return "bg-green-100 text-green-800"
      case "standard": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "university": return University
      case "technology": return Zap
      case "agency": return Briefcase
      case "service": return Users
      default: return Building2
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "university": return "text-blue-600"
      case "technology": return "text-green-600"
      case "agency": return "text-purple-600"
      case "service": return "text-orange-600"
      default: return "text-gray-600"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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
              <Handshake className="h-4 w-4 mr-2" />
              Partner Program
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Build the Future of Education Together
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto mb-8">
              Join our growing ecosystem of universities, technology companies, and service providers 
              committed to transforming education worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary">
                Become a Partner
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                View Partner Directory
                <Users className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: "Partners Worldwide", value: "150+", icon: Globe },
                { label: "Countries", value: "25+", icon: MapPin },
                { label: "Students Placed", value: "50K+", icon: Users },
                { label: "Success Rate", value: "98%", icon: TrendingUp }
              ].map((stat, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <stat.icon className="h-8 w-8 text-primary mx-auto mb-4" />
                    <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Partnership Programs */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Partnership Programs</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Choose the partnership program that aligns with your organization's goals and expertise
              </p>
            </div>

            <Tabs defaultValue="university" className="max-w-6xl mx-auto">
              <TabsList className="grid w-full grid-cols-4">
                {partnershipPrograms.map((program) => (
                  <TabsTrigger key={program.id} value={program.id}>
                    <program.icon className="h-4 w-4 mr-2" />
                    {program.type.split(' ')[0]}
                  </TabsTrigger>
                ))}
              </TabsList>

              {partnershipPrograms.map((program) => (
                <TabsContent key={program.id} value={program.id} className="mt-8">
                  <Card>
                    <CardContent className="p-8">
                      <div className="grid lg:grid-cols-2 gap-8">
                        <div>
                          <div className="flex items-center gap-3 mb-4">
                            <program.icon className={`h-8 w-8 ${program.color}`} />
                            <h3 className="text-2xl font-bold">{program.title}</h3>
                          </div>
                          <p className="text-muted-foreground mb-6">{program.description}</p>
                          
                          <div className="space-y-4 mb-6">
                            <div>
                              <h4 className="font-semibold mb-2">Key Benefits:</h4>
                              <ul className="space-y-2">
                                {program.benefits.map((benefit, index) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="text-sm">{benefit}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold mb-2">Requirements:</h4>
                              <ul className="space-y-2">
                                {program.requirements.map((requirement, index) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-blue-500" />
                                    <span className="text-sm">{requirement}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          
                          <Button size="lg">
                            {program.cta}
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                        
                        <div className="bg-muted/50 rounded-lg p-6">
                          <h4 className="font-semibold mb-4">Why Partner With Us?</h4>
                          <div className="space-y-4">
                            {[
                              {
                                icon: TrendingUp,
                                title: "Growth Opportunities",
                                description: "Access to our growing network of education agencies and institutions"
                              },
                              {
                                icon: Shield,
                                title: "Trusted Platform",
                                description: "Join a platform trusted by hundreds of education agencies worldwide"
                              },
                              {
                                icon: Heart,
                                title: "Shared Mission",
                                description: "Work together to improve access to quality education globally"
                              },
                              {
                                icon: BarChart3,
                                title: "Data-Driven Insights",
                                description: "Leverage analytics and insights to drive better outcomes"
                              }
                            ].map((item, index) => (
                              <div key={index} className="flex items-start gap-3">
                                <item.icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                <div>
                                  <h5 className="font-medium text-sm">{item.title}</h5>
                                  <p className="text-xs text-muted-foreground">{item.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>

        {/* Partner Directory */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Our Partners</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Discover the organizations that are part of our growing ecosystem
              </p>
            </div>

            {/* Filters */}
            <div className="bg-background border rounded-lg p-6 mb-8">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Search Partners</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Partner name or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Partner Type</Label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="university">Universities</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="agency">Agencies</SelectItem>
                      <SelectItem value="service">Service Providers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">Partnership Level</Label>
                  <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="strategic">Strategic</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="certified">Certified</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Partners Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPartners.map((partner) => (
                  <Card key={partner.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-primary" />
                        </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{partner.name}</h3>
                        <div className="flex items-center gap-2">
                          <Badge className={getLevelColor(partner.partnershipLevel)}>
                            {partner.partnershipLevel.charAt(0).toUpperCase() + partner.partnershipLevel.slice(1)}
                          </Badge>
                          {partner.featured && (
                            <Badge className="bg-yellow-500 text-yellow-900">Featured</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {partner.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {partner.location}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Partner since {formatDate(partner.establishedDate)}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-medium text-sm mb-2">Key Benefits:</h4>
                      <div className="flex flex-wrap gap-1">
                        {partner.benefits.slice(0, 2).map((benefit, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {benefit}
                          </Badge>
                        ))}
                        {partner.benefits.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{partner.benefits.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        View Profile
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <a href={partner.website} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Success Stories */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Success Stories</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Real examples of how our partnerships are transforming education
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {successStories.map((story) => (
                <Card key={story.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className={story.category === 'university' ? 'bg-blue-100 text-blue-800' : story.category === 'agency' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}>
                        {story.category.charAt(0).toUpperCase() + story.category.slice(1)}
                      </Badge>
                      <Badge variant="outline">Case Study</Badge>
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-2">{story.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">Partner: {story.partner}</p>
                    
                    <p className="text-sm text-muted-foreground mb-6 line-clamp-3">
                      {story.description}
                    </p>
                    
                    <div className="space-y-3 mb-6">
                      <h4 className="font-medium text-sm">Key Results:</h4>
                      <ul className="space-y-1">
                        {story.results.slice(0, 3).map((result, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {result}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {story.metrics.slice(0, 4).map((metric, index) => (
                        <div key={index} className="bg-muted/50 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-primary">{metric.value}</div>
                          <div className="text-xs text-muted-foreground">{metric.label}</div>
                          <div className="text-xs font-medium text-green-600">{metric.improvement}</div>
                        </div>
                      ))}
                    </div>
                    
                    <Button size="sm" className="w-full">
                      Read Full Case Study
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to Partner With Us?
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Join our ecosystem of innovative organizations and help shape the future of education
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary">
                Apply Now
                <ArrowRight className="h-4 w-4 ml-2" />
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