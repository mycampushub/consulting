"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Newspaper, 
  Calendar, 
  Download, 
  ExternalLink, 
  Award, 
  TrendingUp,
  Users,
  Building2,
  Globe,
  Mail,
  Phone,
  FileText,
  Image as ImageIcon,
  Play,
  Filter,
  CheckCircle,
  ArrowRight,
  Star,
  BarChart3,
  Target,
  Zap,
  Shield,
  Heart,
  Lightbulb
} from "lucide-react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"

interface PressRelease {
  id: string
  title: string
  excerpt: string
  date: string
  category: string
  tags: string[]
  featured: boolean
  downloadUrl: string
  readMoreUrl: string
  image: string
}

interface MediaCoverage {
  id: string
  title: string
  source: string
  author: string
  date: string
  excerpt: string
  category: string
  url: string
  logo: string
  featured: boolean
}

interface MediaAsset {
  id: string
  title: string
  type: "logo" | "image" | "video" | "document"
  description: string
  fileSize: string
  format: string
  downloadUrl: string
  previewUrl: string
}

interface Award {
  id: string
  title: string
  organization: string
  date: string
  description: string
  category: string
  logo: string
}

interface PressContact {
  name: string
  role: string
  email: string
  phone: string
  image: string
}

export default function PressPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedYear, setSelectedYear] = useState("all")

  const pressReleases: PressRelease[] = [
    {
      id: "1",
      title: "EduSaaS Raises $50M Series C to Transform Global Education",
      excerpt: "Leading education technology platform secures major funding to expand globally and enhance AI capabilities.",
      date: "2024-01-15",
      category: "funding",
      tags: ["funding", "series-c", "expansion"],
      featured: true,
      downloadUrl: "/press/series-c-announcement.pdf",
      readMoreUrl: "/press/series-c-announcement",
      image: "/placeholder-press-1.jpg"
    },
    {
      id: "2",
      title: "EduSaaS Launches Revolutionary AI-Powered Student Matching Platform",
      excerpt: "New artificial intelligence platform helps students find perfect educational matches with 95% accuracy.",
      date: "2024-01-10",
      category: "product",
      tags: ["ai", "product-launch", "innovation"],
      featured: true,
      downloadUrl: "/press/ai-platform-launch.pdf",
      readMoreUrl: "/press/ai-platform-launch",
      image: "/placeholder-press-2.jpg"
    },
    {
      id: "3",
      title: "EduSaaS Named to Forbes Cloud 100 for Third Consecutive Year",
      excerpt: "Recognized as one of the world's top private cloud companies, highlighting continued innovation and growth.",
      date: "2023-12-20",
      category: "awards",
      tags: ["forbes", "recognition", "cloud-100"],
      featured: false,
      downloadUrl: "/press/forbes-cloud-100.pdf",
      readMoreUrl: "/press/forbes-cloud-100",
      image: "/placeholder-press-3.jpg"
    },
    {
      id: "4",
      title: "Partnership with Harvard University to Streamline International Admissions",
      excerpt: "Strategic collaboration aims to simplify and enhance the international student application process.",
      date: "2023-12-15",
      category: "partnerships",
      tags: ["harvard", "partnership", "education"],
      featured: false,
      downloadUrl: "/press/harvard-partnership.pdf",
      readMoreUrl: "/press/harvard-partnership",
      image: "/placeholder-press-4.jpg"
    },
    {
      id: "5",
      title: "EduSaaS Reports 200% Year-over-Year Growth in Student Placements",
      excerpt: "Platform facilitates over 50,000 student placements globally, demonstrating significant market traction.",
      date: "2023-12-01",
      category: "growth",
      tags: ["growth", "metrics", "achievements"],
      featured: false,
      downloadUrl: "/press/growth-report.pdf",
      readMoreUrl: "/press/growth-report",
      image: "/placeholder-press-5.jpg"
    }
  ]

  const mediaCoverage: MediaCoverage[] = [
    {
      id: "1",
      title: "How EduSaaS is Revolutionizing the Education Agency Industry",
      source: "TechCrunch",
      author: "Sarah Johnson",
      date: "2024-01-12",
      excerpt: "An in-depth look at how EduSaaS's platform is transforming education agencies worldwide with innovative technology.",
      category: "technology",
      url: "https://techcrunch.com/edusaas-revolution",
      logo: "/placeholder-logo-tc.jpg",
      featured: true
    },
    {
      id: "2",
      title: "The Future of Student Recruitment: AI and Automation",
      source: "Forbes",
      author: "Michael Chen",
      date: "2024-01-08",
      excerpt: "Exploring how artificial intelligence is reshaping student recruitment and education agency operations.",
      category: "business",
      url: "https://forbes.com/future-student-recruitment",
      logo: "/placeholder-logo-forbes.jpg",
      featured: true
    },
    {
      id: "3",
      title: "EduSaaS's $50M Round Signals Confidence in EdTech",
      source: "VentureBeat",
      author: "Emma Rodriguez",
      date: "2024-01-16",
      excerpt: "Analysis of the recent funding round and what it means for the future of education technology.",
      category: "funding",
      url: "https://venturebeat.com/edusaas-funding",
      logo: "/placeholder-logo-vb.jpg",
      featured: false
    },
    {
      id: "4",
      title: "Education Technology Startup Achieves Unicorn Status",
      source: "Wall Street Journal",
      author: "David Kim",
      date: "2024-01-14",
      excerpt: "EduSaaS reaches $1 billion valuation following successful Series C funding round.",
      category: "business",
      url: "https://wsj.com/edusaas-unicorn",
      logo: "/placeholder-logo-wsj.jpg",
      featured: false
    },
    {
      id: "5",
      title: "Inside EduSaaS's Mission to Democratize Education Access",
      source: "Fast Company",
      author: "Lisa Wang",
      date: "2024-01-05",
      excerpt: "A deep dive into EduSaaS's mission and how the company is making education more accessible globally.",
      category: "culture",
      url: "https://fastcompany.com/edusaas-mission",
      logo: "/placeholder-logo-fc.jpg",
      featured: false
    }
  ]

  const mediaAssets: MediaAsset[] = [
    {
      id: "1",
      title: "EduSaaS Primary Logo",
      type: "logo",
      description: "Official EduSaaS logo in PNG and SVG formats",
      fileSize: "2.5 MB",
      format: "PNG, SVG",
      downloadUrl: "/assets/logo.zip",
      previewUrl: "/assets/logo-preview.png"
    },
    {
      id: "2",
      title: "Executive Team Photo",
      type: "image",
      description: "High-resolution photo of the EduSaaS executive team",
      fileSize: "8.2 MB",
      format: "JPG",
      downloadUrl: "/assets/executive-team.jpg",
      previewUrl: "/assets/executive-team-preview.jpg"
    },
    {
      id: "3",
      title: "Product Demo Video",
      type: "video",
      description: "Comprehensive product demonstration and features overview",
      fileSize: "125 MB",
      format: "MP4",
      downloadUrl: "/assets/product-demo.mp4",
      previewUrl: "/assets/product-demo-preview.jpg"
    },
    {
      id: "4",
      title: "Company Fact Sheet",
      type: "document",
      description: "Comprehensive company overview and key statistics",
      fileSize: "1.2 MB",
      format: "PDF",
      downloadUrl: "/assets/fact-sheet.pdf",
      previewUrl: "/assets/fact-sheet-preview.jpg"
    },
    {
      id: "5",
      title: "Office Environment Photos",
      type: "image",
      description: "Collection of office environment and workplace photos",
      fileSize: "15.6 MB",
      format: "JPG",
      downloadUrl: "/assets/office-photos.zip",
      previewUrl: "/assets/office-preview.jpg"
    }
  ]

  const awards: Award[] = [
    {
      id: "1",
      title: "Forbes Cloud 100",
      organization: "Forbes",
      date: "2023",
      description: "Recognized as one of the world's top 100 private cloud companies",
      category: "recognition",
      logo: "/placeholder-logo-forbes.jpg"
    },
    {
      id: "2",
      title: "EdTech Breakthrough Award",
      organization: "EdTech Breakthrough",
      date: "2023",
      description: "Best Student Information System Solution",
      category: "product",
      logo: "/placeholder-logo-edtech.jpg"
    },
    {
      id: "3",
      title: "Fast Company Most Innovative Companies",
      organization: "Fast Company",
      date: "2023",
      description: "Ranked among the world's most innovative companies in education",
      category: "innovation",
      logo: "/placeholder-logo-fc.jpg"
    },
    {
      id: "4",
      title: "Gartner Cool Vendor",
      organization: "Gartner",
      date: "2022",
      description: "Cool Vendor in Education Technology",
      category: "analyst",
      logo: "/placeholder-logo-gartner.jpg"
    }
  ]

  const pressContacts: PressContact[] = [
    {
      name: "Sarah Johnson",
      role: "Head of Communications",
      email: "press@edusaas.com",
      phone: "+1 (415) 555-0123",
      image: "/placeholder-avatar.jpg"
    },
    {
      name: "Michael Chen",
      role: "PR Manager",
      email: "media@edusaas.com",
      phone: "+1 (415) 555-0456",
      image: "/placeholder-avatar.jpg"
    }
  ]

  const filteredReleases = pressReleases.filter(release => {
    const matchesSearch = release.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         release.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === "all" || release.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "funding": return "bg-green-100 text-green-800"
      case "product": return "bg-blue-100 text-blue-800"
      case "awards": return "bg-yellow-100 text-yellow-800"
      case "partnerships": return "bg-purple-100 text-purple-800"
      case "growth": return "bg-orange-100 text-orange-800"
      case "technology": return "bg-red-100 text-red-800"
      case "business": return "bg-indigo-100 text-indigo-800"
      case "culture": return "bg-pink-100 text-pink-800"
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
              <Newspaper className="h-4 w-4 mr-2" />
              Press Center
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              EduSaaS in the News
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto mb-8">
              Stay updated with the latest news, press releases, and media coverage about EduSaaS's 
              mission to transform education technology worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary">
                Download Press Kit
                <Download className="h-4 w-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                Contact Press Team
                <Mail className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: "Press Releases", value: "50+", icon: FileText },
                { label: "Media Mentions", value: "200+", icon: Newspaper },
                { label: "Awards Won", value: "15+", icon: Award },
                { label: "Countries Covered", value: "30+", icon: Globe }
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

        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Featured Press Releases */}
              <section>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Star className="h-6 w-6 text-yellow-500" />
                  Featured Press Releases
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {pressReleases.filter(r => r.featured).map((release) => (
                    <Card key={release.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                      <div className="h-48 bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center">
                        <Newspaper className="h-16 w-16 text-primary/50" />
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className={getCategoryColor(release.category)}>
                            {release.category.charAt(0).toUpperCase() + release.category.slice(1)}
                          </Badge>
                          <Badge variant="outline">Featured</Badge>
                        </div>
                        <h3 className="text-lg font-semibold mb-3 line-clamp-2">{release.title}</h3>
                        <p className="text-muted-foreground mb-4 line-clamp-3">{release.excerpt}</p>
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(release.date)}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1">
                            Read More
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              {/* All Press Releases */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">All Press Releases</h2>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search press releases..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="funding">Funding</SelectItem>
                        <SelectItem value="product">Product</SelectItem>
                        <SelectItem value="awards">Awards</SelectItem>
                        <SelectItem value="partnerships">Partnerships</SelectItem>
                        <SelectItem value="growth">Growth</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredReleases.map((release) => (
                    <Card key={release.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <Badge className={getCategoryColor(release.category)}>
                                {release.category.charAt(0).toUpperCase() + release.category.slice(1)}
                              </Badge>
                              {release.featured && (
                                <Badge className="bg-yellow-500 text-yellow-900">Featured</Badge>
                              )}
                            </div>
                            <h3 className="text-lg font-semibold mb-3 line-clamp-2">{release.title}</h3>
                            <p className="text-muted-foreground mb-4 line-clamp-2">{release.excerpt}</p>
                            <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(release.date)}
                              </div>
                              <div className="flex gap-2">
                                {release.tags.slice(0, 2).map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button size="sm">
                              Read More
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

              {/* Media Coverage */}
              <section>
                <h2 className="text-2xl font-bold mb-6">Media Coverage</h2>
                <div className="space-y-4">
                  {mediaCoverage.map((coverage) => (
                    <Card key={coverage.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                            <Newspaper className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{coverage.title}</h3>
                              {coverage.featured && (
                                <Badge className="bg-yellow-500 text-yellow-900">Featured</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                              <span className="font-medium">{coverage.source}</span>
                              <span>•</span>
                              <span>{coverage.author}</span>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(coverage.date)}
                              </div>
                            </div>
                            <p className="text-muted-foreground mb-3 line-clamp-2">{coverage.excerpt}</p>
                            <Button size="sm" variant="outline" asChild>
                              <a href={coverage.url} target="_blank" rel="noopener noreferrer">
                                Read Article
                                <ExternalLink className="h-4 w-4 ml-2" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Press Kit */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Press Kit
                  </CardTitle>
                  <CardDescription>
                    Download our complete press kit with logos, images, and company information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Complete Press Kit
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Includes logos, executive photos, product screenshots, and company fact sheet
                  </div>
                </CardContent>
              </Card>

              {/* Media Assets */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Media Assets
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mediaAssets.slice(0, 3).map((asset) => (
                    <div key={asset.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center">
                          {asset.type === 'logo' && <ImageIcon className="h-5 w-5 text-primary" />}
                          {asset.type === 'image' && <ImageIcon className="h-5 w-5 text-primary" />}
                          {asset.type === 'video' && <Play className="h-5 w-5 text-primary" />}
                          {asset.type === 'document' && <FileText className="h-5 w-5 text-primary" />}
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{asset.title}</h4>
                          <p className="text-xs text-muted-foreground">{asset.fileSize}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full">
                    View All Assets
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Awards */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Recent Awards
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {awards.slice(0, 3).map((award) => (
                    <div key={award.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded flex items-center justify-center">
                        <Award className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{award.title}</h4>
                        <p className="text-xs text-muted-foreground">{award.organization} • {award.date}</p>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full">
                    View All Awards
                  </Button>
                </CardContent>
              </Card>

              {/* Press Contacts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Press Contacts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pressContacts.map((contact) => (
                    <div key={contact.name} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">
                          {contact.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{contact.name}</h4>
                        <p className="text-xs text-muted-foreground">{contact.role}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <a href={`mailto:${contact.email}`} className="text-xs text-primary hover:underline">
                            {contact.email}
                          </a>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{contact.phone}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Interested in Covering EduSaaS?
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              We'd love to work with you to share our story of transforming education technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary">
                Schedule an Interview
                <Calendar className="h-4 w-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                Request Press Kit
                <Download className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}