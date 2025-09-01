"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Calendar, 
  User, 
  Clock, 
  Tag, 
  Heart, 
  MessageCircle, 
  Share2,
  ArrowRight,
  Filter,
  TrendingUp,
  BookOpen,
  Lightbulb,
  Users,
  Globe,
  Zap,
  Award
} from "lucide-react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"

interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  author: {
    name: string
    avatar: string
    role: string
  }
  publishDate: string
  readTime: string
  category: string
  tags: string[]
  featured: boolean
  likes: number
  comments: number
  views: number
  image: string
}

interface Category {
  id: string
  name: string
  count: number
  color: string
}

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedTag, setSelectedTag] = useState("all")

  const categories: Category[] = [
    { id: "all", name: "All Posts", count: 24, color: "bg-blue-100 text-blue-800" },
    { id: "product-updates", name: "Product Updates", count: 8, color: "bg-green-100 text-green-800" },
    { id: "education-trends", name: "Education Trends", count: 6, color: "bg-purple-100 text-purple-800" },
    { id: "agency-tips", name: "Agency Tips", count: 5, color: "bg-orange-100 text-orange-800" },
    { id: "technology", name: "Technology", count: 3, color: "bg-red-100 text-red-800" },
    { id: "success-stories", name: "Success Stories", count: 2, color: "bg-yellow-100 text-yellow-800" }
  ]

  const allTags = [
    "CRM", "Marketing", "Automation", "Student Management", "Analytics", 
    "Integration", "Mobile App", "Security", "Compliance", "Growth",
    "Innovation", "Case Study", "Tutorial", "Best Practices"
  ]

  const blogPosts: BlogPost[] = [
    {
      id: "1",
      title: "The Future of Education Agencies: AI and Automation",
      excerpt: "Discover how artificial intelligence is revolutionizing education agency operations and student recruitment processes.",
      content: "Full content of the blog post...",
      author: {
        name: "Sarah Johnson",
        avatar: "/placeholder-avatar.jpg",
        role: "CEO & Founder"
      },
      publishDate: "2024-01-15",
      readTime: "8 min read",
      category: "education-trends",
      tags: ["AI", "Automation", "Future Trends"],
      featured: true,
      likes: 234,
      comments: 45,
      views: 1520,
      image: "/placeholder-blog-1.jpg"
    },
    {
      id: "2",
      title: "10 Ways to Improve Student Retention Rates",
      excerpt: "Proven strategies and techniques to keep students engaged and improve retention rates in your education agency.",
      content: "Full content of the blog post...",
      author: {
        name: "Michael Chen",
        avatar: "/placeholder-avatar.jpg",
        role: "Head of Customer Success"
      },
      publishDate: "2024-01-12",
      readTime: "6 min read",
      category: "agency-tips",
      tags: ["Student Management", "Retention", "Best Practices"],
      featured: true,
      likes: 189,
      comments: 32,
      views: 1240,
      image: "/placeholder-blog-2.jpg"
    },
    {
      id: "3",
      title: "New Feature Release: Advanced Analytics Dashboard",
      excerpt: "We're excited to announce our most powerful analytics dashboard yet, with real-time insights and custom reporting.",
      content: "Full content of the blog post...",
      author: {
        name: "Emma Rodriguez",
        avatar: "/placeholder-avatar.jpg",
        role: "Product Manager"
      },
      publishDate: "2024-01-10",
      readTime: "5 min read",
      category: "product-updates",
      tags: ["Product Updates", "Analytics", "New Features"],
      featured: false,
      likes: 156,
      comments: 28,
      views: 980,
      image: "/placeholder-blog-3.jpg"
    },
    {
      id: "4",
      title: "Building a Successful Education Agency in 2024",
      excerpt: "Essential strategies and tools needed to build and scale a successful education agency in today's competitive landscape.",
      content: "Full content of the blog post...",
      author: {
        name: "David Kim",
        avatar: "/placeholder-avatar.jpg",
        role: "VP of Sales"
      },
      publishDate: "2024-01-08",
      readTime: "10 min read",
      category: "agency-tips",
      tags: ["Growth", "Strategy", "Business Development"],
      featured: false,
      likes: 145,
      comments: 23,
      views: 890,
      image: "/placeholder-blog-4.jpg"
    },
    {
      id: "5",
      title: "How Global Education Agencies Are Adapting to Change",
      excerpt: "Insights from leading education agencies worldwide on how they're adapting to global changes and new challenges.",
      content: "Full content of the blog post...",
      author: {
        name: "Lisa Wang",
        avatar: "/placeholder-avatar.jpg",
        role: "Industry Analyst"
      },
      publishDate: "2024-01-05",
      readTime: "7 min read",
      category: "education-trends",
      tags: ["Global Trends", "Adaptation", "Industry Analysis"],
      featured: false,
      likes: 134,
      comments: 19,
      views: 760,
      image: "/placeholder-blog-5.jpg"
    },
    {
      id: "6",
      title: "Security First: Protecting Student Data in the Digital Age",
      excerpt: "Best practices for data security and compliance in education agencies, including GDPR and other regulations.",
      content: "Full content of the blog post...",
      author: {
        name: "Alex Thompson",
        avatar: "/placeholder-avatar.jpg",
        role: "Security Officer"
      },
      publishDate: "2024-01-03",
      readTime: "9 min read",
      category: "technology",
      tags: ["Security", "Compliance", "Data Protection"],
      featured: false,
      likes: 123,
      comments: 15,
      views: 680,
      image: "/placeholder-blog-6.jpg"
    }
  ]

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory
    const matchesTag = selectedTag === "all" || post.tags.includes(selectedTag)
    
    return matchesSearch && matchesCategory && matchesTag
  })

  const featuredPosts = blogPosts.filter(post => post.featured)
  const popularPosts = [...blogPosts].sort((a, b) => b.views - a.views).slice(0, 3)

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
              <BookOpen className="h-4 w-4 mr-2" />
              EduSaaS Blog
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Insights & Innovation in Education Technology
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto mb-8">
              Stay updated with the latest trends, best practices, and product updates from the world of education agencies
            </p>
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/20 border-background/30 text-white placeholder:text-white/70"
                />
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Featured Posts */}
              <section>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Award className="h-6 w-6 text-primary" />
                  Featured Articles
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {featuredPosts.map((post) => (
                    <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="h-48 bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-primary/50" />
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className={categories.find(c => c.id === post.category)?.color}>
                            {categories.find(c => c.id === post.category)?.name}
                          </Badge>
                          <Badge variant="outline">Featured</Badge>
                        </div>
                        <h3 className="text-xl font-semibold mb-3 line-clamp-2">{post.title}</h3>
                        <p className="text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(post.publishDate)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {post.readTime}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-primary">
                                {post.author.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-sm">{post.author.name}</p>
                              <p className="text-xs text-muted-foreground">{post.author.role}</p>
                            </div>
                          </div>
                          <Button size="sm">
                            Read More
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              {/* All Posts */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Latest Articles</h2>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-6">
                  {filteredPosts.map((post) => (
                    <Card key={post.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex gap-6">
                          <div className="w-32 h-24 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <BookOpen className="h-8 w-8 text-primary/50" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <Badge className={categories.find(c => c.id === post.category)?.color}>
                                {categories.find(c => c.id === post.category)?.name}
                              </Badge>
                              {post.featured && (
                                <Badge variant="outline">Featured</Badge>
                              )}
                            </div>
                            <h3 className="text-xl font-semibold mb-3 line-clamp-2">{post.title}</h3>
                            <p className="text-muted-foreground mb-4 line-clamp-2">{post.excerpt}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {formatDate(post.publishDate)}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {post.readTime}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  {post.views}
                                </div>
                              </div>
                              <Button size="sm" variant="outline">
                                Read More
                              </Button>
                            </div>
                            <div className="flex items-center gap-2 mt-3">
                              <div className="flex -space-x-2">
                                {post.tags.slice(0, 3).map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
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
              {/* Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5" />
                    Categories
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
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
                      <span>{category.name}</span>
                      <Badge variant="secondary">{category.count}</Badge>
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Popular Tags */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Popular Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTag === tag ? "default" : "secondary"}
                        className="cursor-pointer hover:bg-primary/80"
                        onClick={() => setSelectedTag(selectedTag === tag ? "all" : tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Popular Posts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Popular Posts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {popularPosts.map((post, index) => (
                    <div key={post.id} className="flex gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-primary">#{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm line-clamp-2 mb-1">{post.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Eye className="h-3 w-3" />
                          {post.views} views
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Newsletter */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Subscribe to Newsletter
                  </CardTitle>
                  <CardDescription>
                    Get the latest insights and updates delivered to your inbox
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input placeholder="Enter your email" />
                  <Button className="w-full">
                    Subscribe
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Join 10,000+ subscribers getting weekly insights
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Want to Contribute to Our Blog?
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Share your expertise and insights with the education agency community
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary">
                Submit Article
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                View Guidelines
                <FileText className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}