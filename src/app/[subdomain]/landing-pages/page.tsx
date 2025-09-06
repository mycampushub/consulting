"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Plus,
  Search,
  Filter,
  ExternalLink,
  Edit,
  Trash2,
  Copy,
  Eye,
  Settings,
  Play,
  Pause,
  BarChart3,
  Layout,
  Type,
  Image,
  Video,
  Square,
  FileText,
  MapPin,
  Mail,
  Phone,
  Users,
  Star,
  ChevronRight,
  Grid,
  List,
  MousePointer2,
  Move,
  Save,
  X,
  GripVertical,
  Loader2,
  Minus
} from "lucide-react"
import { useRouter } from "next/navigation"

interface LandingPage {
  id: string
  name: string
  slug: string
  title?: string
  description?: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  viewCount: number
  conversionCount: number
  publishedAt?: string
  form?: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

interface Form {
  id: string
  name: string
  submissionCount: number
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
}

export default function LandingPagesPage() {
  const params = useParams()
  const router = useRouter()
  const subdomain = params.subdomain as string
  
  const [landingPages, setLandingPages] = useState<LandingPage[]>([])
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreatePageOpen, setIsCreatePageOpen] = useState(false)
  const [selectedPage, setSelectedPage] = useState<LandingPage | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Form state for creating/editing pages
  const [newPage, setNewPage] = useState({
    name: "",
    slug: "",
    title: "",
    description: "",
    formId: ""
  })

  // Mock data for demonstration
  const mockLandingPages: LandingPage[] = [
    {
      id: "1",
      name: "Spring Intake 2024",
      slug: "spring-intake-2024",
      title: "Apply for Spring Intake 2024",
      description: "Join thousands of students starting their journey this spring",
      status: "PUBLISHED",
      viewCount: 2540,
      conversionCount: 156,
      publishedAt: "2024-01-15",
      form: {
        id: "1",
        name: "Spring Intake Application"
      },
      createdAt: "2024-01-10",
      updatedAt: "2024-01-20"
    },
    {
      id: "2",
      name: "Scholarship Guide",
      slug: "scholarship-guide",
      title: "Complete Scholarship Guide 2024",
      description: "Discover scholarships that match your profile",
      status: "PUBLISHED",
      viewCount: 1890,
      conversionCount: 89,
      publishedAt: "2024-01-12",
      form: {
        id: "2",
        name: "Scholarship Inquiry"
      },
      createdAt: "2024-01-08",
      updatedAt: "2024-01-18"
    },
    {
      id: "3",
      name: "University Partners",
      slug: "university-partners",
      title: "Our University Partners",
      description: "Learn about our partner universities worldwide",
      status: "DRAFT",
      viewCount: 0,
      conversionCount: 0,
      createdAt: "2024-01-20",
      updatedAt: "2024-01-20"
    }
  ]

  const mockForms: Form[] = [
    {
      id: "1",
      name: "Spring Intake Application",
      submissionCount: 156,
      status: "ACTIVE"
    },
    {
      id: "2",
      name: "Scholarship Inquiry",
      submissionCount: 89,
      status: "ACTIVE"
    },
    {
      id: "3",
      name: "General Inquiry",
      submissionCount: 45,
      status: "ACTIVE"
    }
  ]

  useEffect(() => {
    const fetchLandingPages = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/${subdomain}/landing-pages?limit=50`)
        if (!response.ok) throw new Error('Failed to fetch landing pages')
        
        const data = await response.json()
        const processedPages = data.landingPages.map((page: any) => ({
          id: page.id,
          name: page.name,
          slug: page.slug,
          title: page.title,
          description: page.description,
          status: page.status,
          viewCount: page.viewCount,
          conversionCount: page.conversionCount,
          publishedAt: page.publishedAt,
          form: page.form ? {
            id: page.form.id,
            name: page.form.name
          } : undefined,
          createdAt: page.createdAt,
          updatedAt: page.updatedAt
        }))
        setLandingPages(processedPages)
      } catch (err) {
        console.error('Error fetching landing pages:', err)
        setLandingPages(mockLandingPages) // Fallback to mock data
      } finally {
        setLoading(false)
      }
    }

    const fetchForms = async () => {
      try {
        const response = await fetch(`/api/${subdomain}/forms?limit=50`)
        if (!response.ok) throw new Error('Failed to fetch forms')
        
        const data = await response.json()
        const processedForms = data.forms.map((form: any) => ({
          id: form.id,
          name: form.name,
          submissionCount: form.submissions?.length || 0,
          status: form.status || 'ACTIVE'
        }))
        setForms(processedForms)
      } catch (err) {
        console.error('Error fetching forms:', err)
        setForms(mockForms) // Fallback to mock data
      }
    }

    fetchLandingPages()
    fetchForms()
  }, [subdomain])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED": return "bg-green-100 text-green-800"
      case "DRAFT": return "bg-yellow-100 text-yellow-800"
      case "ARCHIVED": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getElementIcon = (type: string) => {
    switch (type) {
      case "header": return <Type className="h-4 w-4" />
      case "text": return <FileText className="h-4 w-4" />
      case "image": return <Image className="h-4 w-4" alt="" />
      case "video": return <Video className="h-4 w-4" />
      case "button": return <Square className="h-4 w-4" />
      case "form": return <FileText className="h-4 w-4" />
      case "testimonial": return <Star className="h-4 w-4" />
      case "features": return <Grid className="h-4 w-4" />
      case "cta": return <BarChart3 className="h-4 w-4" />
      case "divider": return <Minus className="h-4 w-4" />
      case "spacer": return <div className="h-4 w-4 border-2 border-dashed border-gray-300" />
      default: return <Layout className="h-4 w-4" />
    }
  }

  const filteredLandingPages = landingPages.filter(page => {
    const matchesSearch = page.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         page.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         page.slug.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || page.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const openBuilder = (page?: LandingPage) => {
    if (page) {
      router.push(`/${subdomain}/landing-pages/builder/${page.id}`)
    } else {
      router.push(`/${subdomain}/landing-pages/builder/new`)
    }
  }

  const duplicatePage = async (page: LandingPage) => {
    try {
      const response = await fetch(`/api/${subdomain}/landing-pages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${page.name} (Copy)`,
          slug: `${page.slug}-copy`,
          title: page.title ? `${page.title} (Copy)` : undefined,
          description: page.description,
          formId: page.form?.id,
          status: 'DRAFT'
        }),
      })

      if (!response.ok) throw new Error('Failed to duplicate page')

      // Refresh the list
      const fetchResponse = await fetch(`/api/${subdomain}/landing-pages?limit=50`)
      if (fetchResponse.ok) {
        const data = await fetchResponse.json()
        const processedPages = data.landingPages.map((page: any) => ({
          id: page.id,
          name: page.name,
          slug: page.slug,
          title: page.title,
          description: page.description,
          status: page.status,
          viewCount: page.viewCount,
          conversionCount: page.conversionCount,
          publishedAt: page.publishedAt,
          form: page.form ? {
            id: page.form.id,
            name: page.form.name
          } : undefined,
          createdAt: page.createdAt,
          updatedAt: page.updatedAt
        }))
        setLandingPages(processedPages)
      }

      alert('Page duplicated successfully!')
    } catch (error) {
      console.error('Error duplicating page:', error)
      alert('Failed to duplicate page')
    }
  }

  const deletePage = async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this landing page? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/${subdomain}/landing-pages/${pageId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete page')

      setLandingPages(landingPages.filter(page => page.id !== pageId))
      alert('Page deleted successfully!')
    } catch (error) {
      console.error('Error deleting page:', error)
      alert('Failed to delete page')
    }
  }

  const publishPage = async (pageId: string) => {
    try {
      const response = await fetch(`/api/${subdomain}/landing-pages/${pageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'PUBLISHED'
        }),
      })

      if (!response.ok) throw new Error('Failed to publish page')

      setLandingPages(landingPages.map(page => 
        page.id === pageId ? { ...page, status: 'PUBLISHED' as const } : page
      ))
      alert('Page published successfully!')
    } catch (error) {
      console.error('Error publishing page:', error)
      alert('Failed to publish page')
    }
  }

  const unpublishPage = async (pageId: string) => {
    try {
      const response = await fetch(`/api/${subdomain}/landing-pages/${pageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'DRAFT'
        }),
      })

      if (!response.ok) throw new Error('Failed to unpublish page')

      setLandingPages(landingPages.map(page => 
        page.id === pageId ? { ...page, status: 'DRAFT' as const } : page
      ))
      alert('Page unpublished successfully!')
    } catch (error) {
      console.error('Error unpublishing page:', error)
      alert('Failed to unpublish page')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Landing Pages</h1>
          <p className="text-muted-foreground">Create and manage your landing pages</p>
        </div>
        <Dialog open={isCreatePageOpen} onOpenChange={setIsCreatePageOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Landing Page
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Landing Page</DialogTitle>
              <DialogDescription>Set up a new landing page for your campaigns</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Page Name</Label>
                <Input
                  id="name"
                  placeholder="Spring Intake 2024"
                  value={newPage.name}
                  onChange={(e) => setNewPage({ ...newPage, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  placeholder="spring-intake-2024"
                  value={newPage.slug}
                  onChange={(e) => setNewPage({ ...newPage, slug: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="title">Page Title</Label>
                <Input
                  id="title"
                  placeholder="Apply for Spring Intake 2024"
                  value={newPage.title}
                  onChange={(e) => setNewPage({ ...newPage, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Join thousands of students starting their journey this spring"
                  value={newPage.description}
                  onChange={(e) => setNewPage({ ...newPage, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="form">Associated Form (Optional)</Label>
                <Select value={newPage.formId} onValueChange={(value) => setNewPage({ ...newPage, formId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a form" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No form</SelectItem>
                    {forms.map((form) => (
                      <SelectItem key={form.id} value={form.id}>
                        {form.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreatePageOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  setSelectedPage({
                    id: "",
                    name: newPage.name,
                    slug: newPage.slug,
                    title: newPage.title,
                    description: newPage.description,
                    status: "DRAFT",
                    viewCount: 0,
                    conversionCount: 0,
                    form: forms.find(f => f.id === newPage.formId),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  })
                  setIsCreatePageOpen(false)
                  openBuilder()
                  setNewPage({ name: "", slug: "", title: "", description: "", formId: "" })
                }}>
                  Create & Build
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
            <Layout className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{landingPages.length}</div>
            <p className="text-xs text-muted-foreground">
              landing pages created
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {landingPages.filter(p => p.status === 'PUBLISHED').length}
            </div>
            <p className="text-xs text-muted-foreground">
              live pages
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {landingPages.reduce((sum, page) => sum + page.viewCount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              page views
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {landingPages.reduce((sum, page) => sum + page.conversionCount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              total conversions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search landing pages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Landing Pages Grid */}
      {viewMode === "grid" ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLandingPages.map((page) => (
            <Card key={page.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-1">{page.name}</CardTitle>
                    <CardDescription className="text-sm">
                      /{page.slug}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(page.status)}>
                    {page.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {page.title && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {page.title}
                  </p>
                )}
                
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{page.viewCount.toLocaleString()} views</span>
                  <span>{page.conversionCount.toLocaleString()} conversions</span>
                </div>

                {page.form && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4" />
                    <span>{page.form.name}</span>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openBuilder(page)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`/${subdomain}/${page.slug}`, '_blank')}
                    disabled={page.status !== 'PUBLISHED'}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => duplicatePage(page)}
                    className="flex-1"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Duplicate
                  </Button>
                  {page.status === 'PUBLISHED' ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => unpublishPage(page.id)}
                    >
                      <Pause className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => publishPage(page.id)}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deletePage(page.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Page Name</th>
                    <th className="text-left p-4">Slug</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Views</th>
                    <th className="text-left p-4">Conversions</th>
                    <th className="text-left p-4">Form</th>
                    <th className="text-left p-4">Created</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLandingPages.map((page) => (
                    <tr key={page.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{page.name}</div>
                          {page.title && (
                            <div className="text-sm text-muted-foreground">{page.title}</div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          /{page.slug}
                        </code>
                      </td>
                      <td className="p-4">
                        <Badge className={getStatusColor(page.status)}>
                          {page.status}
                        </Badge>
                      </td>
                      <td className="p-4">{page.viewCount.toLocaleString()}</td>
                      <td className="p-4">{page.conversionCount.toLocaleString()}</td>
                      <td className="p-4">
                        {page.form ? (
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm">{page.form.name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">None</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground">
                          {new Date(page.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openBuilder(page)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(`/${subdomain}/${page.slug}`, '_blank')}
                            disabled={page.status !== 'PUBLISHED'}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deletePage(page.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}