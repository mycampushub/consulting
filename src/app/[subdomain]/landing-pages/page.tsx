"use client"

import { useState, useEffect, useRef } from "react"
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
  Loader2
} from "lucide-react"

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

interface PageElement {
  id: string
  type: 'header' | 'text' | 'image' | 'video' | 'button' | 'form' | 'testimonial' | 'features' | 'cta' | 'divider' | 'spacer'
  content: any
  styles: any
  position: { x: number; y: number }
  size: { width: number; height: number }
}

export default function LandingPagesPage() {
  const params = useParams()
  const subdomain = params.subdomain as string
  
  const [landingPages, setLandingPages] = useState<LandingPage[]>([])
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreatePageOpen, setIsCreatePageOpen] = useState(false)
  const [isBuilderOpen, setIsBuilderOpen] = useState(false)
  const [selectedPage, setSelectedPage] = useState<LandingPage | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Builder state
  const [builderElements, setBuilderElements] = useState<PageElement[]>([])
  const [selectedElement, setSelectedElement] = useState<PageElement | null>(null)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [draggingElement, setDraggingElement] = useState<string | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

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
      case "spacer": return <Spacer className="h-4 w-4" />
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
    setSelectedPage(page || null)
    setBuilderElements(page ? getMockElements(page) : [])
    setIsBuilderOpen(true)
  }

  const getMockElements = (page: LandingPage): PageElement[] => {
    // Return different mock elements based on page type
    if (page.name.includes("Spring")) {
      return [
        {
          id: "1",
          type: "header",
          content: { text: "Spring Intake 2024", level: 1 },
          styles: { fontSize: 48, fontWeight: "bold", textAlign: "center", color: "#1F2937" },
          position: { x: 50, y: 50 },
          size: { width: 700, height: 80 }
        },
        {
          id: "2",
          type: "text",
          content: { text: "Start your educational journey this spring semester" },
          styles: { fontSize: 18, textAlign: "center", color: "#6B7280" },
          position: { x: 50, y: 150 },
          size: { width: 700, height: 40 }
        },
        {
          id: "3",
          type: "button",
          content: { text: "Apply Now", action: "submit" },
          styles: { backgroundColor: "#3B82F6", color: "white", padding: "12px 24px", borderRadius: "8px" },
          position: { x: 300, y: 220 },
          size: { width: 200, height: 50 }
        }
      ]
    }
    return [
      {
        id: "1",
        type: "header",
        content: { text: page.title || page.name, level: 1 },
        styles: { fontSize: 48, fontWeight: "bold", textAlign: "center" },
        position: { x: 50, y: 50 },
        size: { width: 600, height: 80 }
      },
      {
        id: "2",
        type: "text",
        content: { text: page.description || "Welcome to our page" },
        styles: { fontSize: 18, textAlign: "center" },
        position: { x: 50, y: 150 },
        size: { width: 600, height: 40 }
      }
    ]
  }

  const addElement = (type: PageElement['type']) => {
    const newElement: PageElement = {
      id: Date.now().toString(),
      type,
      content: getDefaultContent(type),
      styles: getDefaultStyles(type),
      position: { x: 50, y: 50 + builderElements.length * 80 },
      size: getDefaultSize(type)
    }
    setBuilderElements([...builderElements, newElement])
  }

  const getDefaultContent = (type: PageElement['type']) => {
    switch (type) {
      case "header": return { text: "New Header", level: 2 }
      case "text": return { text: "Your text here..." }
      case "button": return { text: "Click Me", action: "link" }
      case "testimonial": return { text: "Great service!", author: "Happy Client" }
      case "features": return { items: ["Feature 1", "Feature 2", "Feature 3"] }
      case "cta": return { title: "Call to Action", description: "Take action now!" }
      case "divider": return { style: "solid" }
      case "spacer": return { height: 50 }
      default: return {}
    }
  }

  const getDefaultStyles = (type: PageElement['type']) => {
    switch (type) {
      case "header": return { fontSize: 32, fontWeight: "bold", color: "#1F2937" }
      case "text": return { fontSize: 16, color: "#4B5563" }
      case "button": return { backgroundColor: "#3B82F6", color: "white", padding: "10px 20px", borderRadius: "6px" }
      case "divider": return { borderColor: "#E5E7EB", borderWidth: "1px" }
      default: return {}
    }
  }

  const getDefaultSize = (type: PageElement['type']) => {
    switch (type) {
      case "header": return { width: 400, height: 60 }
      case "text": return { width: 400, height: 40 }
      case "button": return { width: 150, height: 45 }
      case "image": return { width: 300, height: 200 }
      case "video": return { width: 400, height: 225 }
      case "form": return { width: 400, height: 300 }
      case "divider": return { width: 400, height: 2 }
      case "spacer": return { width: 400, height: 50 }
      default: return { width: 400, height: 100 }
    }
  }

  const saveLandingPage = async () => {
    if (!selectedPage || !selectedPage.name.trim()) {
      alert('Page name is required')
      return
    }

    try {
      const pageData = {
        name: selectedPage.name,
        slug: selectedPage.slug,
        title: selectedPage.title,
        description: selectedPage.description,
        content: builderElements,
        formId: selectedPage.form?.id,
        status: 'DRAFT'
      }

      let response
      if (selectedPage.id) {
        // Update existing page
        response = await fetch(`/api/${subdomain}/landing-pages`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: selectedPage.id,
            ...pageData
          }),
        })
      } else {
        // Create new page
        response = await fetch(`/api/${subdomain}/landing-pages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(pageData),
        })
      }

      if (!response.ok) {
        throw new Error('Failed to save landing page')
      }

      const savedPage = await response.json()
      
      // Refresh landing pages list
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

      // Update selected page with saved data
      setSelectedPage({
        ...savedPage,
        form: savedPage.form
      })

      alert('Landing page saved successfully!')
    } catch (error) {
      console.error('Error saving landing page:', error)
      alert('Failed to save landing page. Please try again.')
    }
  }

  const publishLandingPage = async () => {
    if (!selectedPage) {
      alert('Please save the page first')
      return
    }

    try {
      const response = await fetch(`/api/${subdomain}/landing-pages`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedPage.id,
          status: 'PUBLISHED'
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to publish landing page')
      }

      alert('Landing page published successfully!')
      
      // Refresh landing pages list
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
    } catch (error) {
      console.error('Error publishing landing page:', error)
      alert('Failed to publish landing page. Please try again.')
    }
  }

  const deleteLandingPage = async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this landing page? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/${subdomain}/landing-pages?id=${pageId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete landing page')
      }

      // Remove page from state
      setLandingPages(landingPages.filter(page => page.id !== pageId))
      alert('Landing page deleted successfully!')
    } catch (error) {
      console.error('Error deleting landing page:', error)
      alert('Failed to delete landing page. Please try again.')
    }
  }

  const handleElementMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault()
    setDraggingElement(elementId)
  }

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!draggingElement || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(e.clientX - rect.left - 60, rect.width - 200))
    const y = Math.max(0, Math.min(e.clientY - rect.top - 30, rect.height - 100))

    setBuilderElements(elements => 
      elements.map(element => 
        element.id === draggingElement 
          ? { ...element, position: { x, y } }
          : element
      )
    )
  }

  const handleCanvasMouseUp = () => {
    setDraggingElement(null)
  }

  const handleElementClick = (element: PageElement) => {
    if (!isPreviewMode) {
      setSelectedElement(element)
    }
  }

  const deleteElement = (elementId: string) => {
    setBuilderElements(elements => elements.filter(element => element.id !== elementId))
    if (selectedElement?.id === elementId) {
      setSelectedElement(null)
    }
  }

  const renderElement = (element: PageElement) => {
    const isSelected = selectedElement?.id === element.id
    const elementStyle = {
      ...element.styles,
      position: 'absolute' as const,
      left: `${element.position.x}px`,
      top: `${element.position.y}px`,
      width: `${element.size.width}px`,
      height: `${element.size.height}px`,
      border: isSelected && !isPreviewMode ? '2px solid #3B82F6' : isPreviewMode ? 'none' : '1px dashed #ccc',
      cursor: isPreviewMode ? 'default' : 'move',
      zIndex: isSelected ? 10 : 1
    }

    switch (element.type) {
      case "header":
        const HeaderTag = `h${element.content.level || 2}` as keyof JSX.IntrinsicElements
        return (
          <HeaderTag 
            style={elementStyle}
            onClick={() => handleElementClick(element)}
            className="select-none"
          >
            {element.content.text}
          </HeaderTag>
        )
      case "text":
        return (
          <p 
            style={elementStyle}
            onClick={() => handleElementClick(element)}
            className="select-none"
          >
            {element.content.text}
          </p>
        )
      case "button":
        return (
          <button 
            style={elementStyle}
            onClick={() => handleElementClick(element)}
            className="select-none"
          >
            {element.content.text}
          </button>
        )
      case "image":
        return (
          <div 
            style={elementStyle}
            onClick={() => handleElementClick(element)}
            className="bg-gray-200 flex items-center justify-center select-none"
          >
            <Image className="h-8 w-8 text-gray-400" alt="" />
            <span className="ml-2 text-sm text-gray-500">Image</span>
          </div>
        )
      case "video":
        return (
          <div 
            style={elementStyle}
            onClick={() => handleElementClick(element)}
            className="bg-gray-200 flex items-center justify-center select-none"
          >
            <Video className="h-8 w-8 text-gray-400" />
            <span className="ml-2 text-sm text-gray-500">Video</span>
          </div>
        )
      case "form":
        return (
          <div 
            style={elementStyle}
            onClick={() => handleElementClick(element)}
            className="bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center select-none"
          >
            <FileText className="h-8 w-8 text-gray-400" />
            <span className="ml-2 text-sm text-gray-500">Form</span>
          </div>
        )
      case "testimonial":
        return (
          <div 
            style={elementStyle}
            onClick={() => handleElementClick(element)}
            className="bg-yellow-50 border border-yellow-200 p-3 rounded select-none"
          >
            <Star className="h-4 w-4 text-yellow-500 mb-1" />
            <p className="text-sm italic">"{element.content.text}"</p>
            <p className="text-xs text-gray-600 mt-1">- {element.content.author}</p>
          </div>
        )
      case "features":
        return (
          <div 
            style={elementStyle}
            onClick={() => handleElementClick(element)}
            className="select-none"
          >
            <h4 className="font-medium mb-2">Features:</h4>
            <ul className="text-sm space-y-1">
              {element.content.items?.map((item: string, index: number) => (
                <li key={index} className="flex items-center">
                  <Star className="h-3 w-3 text-blue-500 mr-1" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )
      case "cta":
        return (
          <div 
            style={elementStyle}
            onClick={() => handleElementClick(element)}
            className="bg-blue-50 border border-blue-200 p-4 rounded text-center select-none"
          >
            <h3 className="font-medium text-blue-900">{element.content.title}</h3>
            <p className="text-sm text-blue-700 mt-1">{element.content.description}</p>
          </div>
        )
      case "divider":
        return (
          <hr 
            style={elementStyle}
            onClick={() => handleElementClick(element)}
            className="select-none"
          />
        )
      case "spacer":
        return (
          <div 
            style={elementStyle}
            onClick={() => handleElementClick(element)}
            className="select-none"
          />
        )
      default:
        return (
          <div 
            style={elementStyle}
            onClick={() => handleElementClick(element)}
            className="bg-gray-100 flex items-center justify-center select-none"
          >
            <Layout className="h-8 w-8 text-gray-400" />
            <span className="ml-2 text-sm text-gray-500">Element</span>
          </div>
        )
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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Landing Pages</h1>
          <p className="text-muted-foreground">Create and manage custom landing pages</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreatePageOpen} onOpenChange={setIsCreatePageOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Page
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Landing Page</DialogTitle>
                <DialogDescription>Set up a new landing page for your campaigns</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Page Name *</Label>
                  <Input 
                    id="name" 
                    placeholder="Spring Intake 2024"
                    value={newPage.name}
                    onChange={(e) => setNewPage(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input 
                    id="slug" 
                    placeholder="spring-intake-2024"
                    value={newPage.slug}
                    onChange={(e) => setNewPage(prev => ({ ...prev, slug: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="title">Page Title</Label>
                  <Input 
                    id="title" 
                    placeholder="Apply for Spring Intake 2024"
                    value={newPage.title}
                    onChange={(e) => setNewPage(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Page description..."
                    value={newPage.description}
                    onChange={(e) => setNewPage(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="form">Associated Form</Label>
                  <Select onValueChange={(value) => setNewPage(prev => ({ ...prev, formId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a form" />
                    </SelectTrigger>
                    <SelectContent>
                      {forms.map((form) => (
                        <SelectItem key={form.id} value={form.id}>
                          {form.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
            </DialogContent>
          </Dialog>
        </div>
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
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
        </CardContent>
      </Card>

      {/* Landing Pages Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredLandingPages.map((page) => (
            <Card key={page.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{page.name}</CardTitle>
                    <CardDescription className="text-sm">/{page.slug}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(page.status)}>
                    {page.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {page.title && (
                    <p className="text-sm font-medium">{page.title}</p>
                  )}
                  {page.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{page.description}</p>
                  )}
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{page.viewCount} views</span>
                    <span>{page.conversionCount} conversions</span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openBuilder(page)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`/${page.slug}`, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteLandingPage(page.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
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
                    <th className="text-left p-4">Name</th>
                    <th className="text-left p-4">Slug</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Views</th>
                    <th className="text-left p-4">Conversions</th>
                    <th className="text-right p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLandingPages.map((page) => (
                    <tr key={page.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{page.name}</p>
                          {page.title && (
                            <p className="text-sm text-muted-foreground">{page.title}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <code className="text-sm bg-muted px-2 py-1 rounded">/{page.slug}</code>
                      </td>
                      <td className="p-4">
                        <Badge className={getStatusColor(page.status)}>
                          {page.status}
                        </Badge>
                      </td>
                      <td className="p-4">{page.viewCount.toLocaleString()}</td>
                      <td className="p-4">{page.conversionCount.toLocaleString()}</td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openBuilder(page)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`/${page.slug}`, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteLandingPage(page.id)}
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

      {/* Page Builder Dialog */}
      <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Page Builder</DialogTitle>
            <DialogDescription>
              Design your landing page by dragging and dropping elements
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex h-[70vh]">
            {/* Sidebar */}
            <div className="w-64 border-r p-4 space-y-4 overflow-y-auto">
              <div>
                <h3 className="font-medium mb-2">Elements</h3>
                <div className="space-y-2">
                  {(['header', 'text', 'button', 'image', 'video', 'form', 'testimonial', 'features', 'cta', 'divider', 'spacer'] as const).map((type) => (
                    <Button
                      key={type}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => addElement(type)}
                    >
                      {getElementIcon(type)}
                      <span className="ml-2 capitalize">{type}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Actions</h3>
                <div className="space-y-2">
                  <Button
                    variant={isPreviewMode ? "default" : "outline"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {isPreviewMode ? 'Edit Mode' : 'Preview'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      setBuilderElements([])
                      setSelectedElement(null)
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                </div>
              </div>

              {selectedElement && !isPreviewMode && (
                <div>
                  <h3 className="font-medium mb-2">Selected Element</h3>
                  <div className="p-3 border rounded bg-muted/50">
                    <p className="font-medium text-sm capitalize">{selectedElement.type}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => deleteElement(selectedElement.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Canvas */}
            <div className="flex-1 relative bg-white">
              <div
                ref={canvasRef}
                className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 relative overflow-auto"
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
              >
                {/* Render elements */}
                {builderElements.map((element) => (
                  <div
                    key={element.id}
                    onMouseDown={(e) => !isPreviewMode && handleElementMouseDown(e, element.id)}
                  >
                    {renderElement(element)}
                  </div>
                ))}

                {/* Empty state */}
                {builderElements.length === 0 && (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <Layout className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Drag elements from the sidebar to start building</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {isPreviewMode ? 'Preview mode - Click elements to select them in edit mode' : 
               draggingElement ? 'Dragging element...' : 
               `${builderElements.length} elements on page`}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsBuilderOpen(false)}>
                Close
              </Button>
              <Button onClick={saveLandingPage}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              {selectedPage?.id && (
                <Button onClick={publishLandingPage}>
                  <Play className="h-4 w-4 mr-2" />
                  Publish
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Helper component for spacer
function Spacer(props: any) {
  return <div {...props} />
}

// Helper component for divider
function Minus(props: any) {
  return <div {...props} />
}