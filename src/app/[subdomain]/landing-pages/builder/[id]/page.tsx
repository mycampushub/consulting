"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { 
  Save,
  Eye,
  Settings,
  Plus,
  Trash2,
  Move,
  Type,
  Image,
  Video,
  Square,
  FileText,
  Star,
  Grid,
  BarChart3,
  Layout,
  Palette,
  Smartphone,
  Globe,
  Zap,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Loader2,
  ExternalLink,
  Copy,
  Download,
  Monitor,
  Tablet
} from "lucide-react"

interface LandingPage {
  id: string
  name: string
  slug: string
  title?: string
  description?: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  content?: any
  seo?: {
    title?: string
    description?: string
    keywords?: string
  }
  settings?: {
    customCss?: string
    customJs?: string
    tracking?: {
      googleAnalytics?: string
      facebookPixel?: string
    }
  }
  viewCount: number
  conversionCount: number
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

interface PageElement {
  id: string
  type: 'header' | 'text' | 'image' | 'video' | 'button' | 'form' | 'testimonial' | 'features' | 'cta' | 'divider' | 'spacer' | 'hero' | 'footer' | 'navbar'
  content: any
  styles: any
  position: { x: number; y: number }
  size: { width: number; height: number }
}

interface Template {
  id: string
  name: string
  category: string
  preview: string
  elements: PageElement[]
}

const templates: Template[] = [
  {
    id: "1",
    name: "Education Hero",
    category: "Education",
    preview: "hero",
    elements: [
      {
        id: "hero-1",
        type: "hero",
        content: {
          title: "Transform Your Future",
          subtitle: "Start your educational journey with our expert guidance",
          backgroundImage: "",
          primaryButton: { text: "Apply Now", action: "#apply" },
          secondaryButton: { text: "Learn More", action: "#about" }
        },
        styles: { 
          backgroundColor: "#f8fafc", 
          padding: "80px 20px", 
          textAlign: "center",
          minHeight: "600px"
        },
        position: { x: 0, y: 0 },
        size: { width: 1200, height: 600 }
      }
    ]
  },
  {
    id: "2",
    name: "Lead Capture",
    category: "Marketing",
    preview: "lead",
    elements: [
      {
        id: "lead-1",
        type: "header",
        content: { text: "Get Your Free Consultation", level: 1 },
        styles: { fontSize: 48, fontWeight: "bold", textAlign: "center", color: "#1F2937" },
        position: { x: 50, y: 50 },
        size: { width: 700, height: 80 }
      },
      {
        id: "lead-2",
        type: "form",
        content: { 
          fields: [
            { name: "name", label: "Full Name", type: "text", required: true },
            { name: "email", label: "Email", type: "email", required: true },
            { name: "phone", label: "Phone", type: "tel", required: false },
            { name: "message", label: "Message", type: "textarea", required: false }
          ],
          submitText: "Get Free Consultation"
        },
        styles: { backgroundColor: "white", padding: "40px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" },
        position: { x: 50, y: 200 },
        size: { width: 500, height: 400 }
      }
    ]
  },
  {
    id: "3",
    name: "Course Showcase",
    category: "Education",
    preview: "course",
    elements: [
      {
        id: "course-1",
        type: "features",
        content: {
          title: "Popular Programs",
          subtitle: "Discover our most sought-after courses",
          features: [
            { title: "Business Administration", description: "Comprehensive business education", icon: "📊" },
            { title: "Computer Science", description: "Cutting-edge technology programs", icon: "💻" },
            { title: "Engineering", description: "Innovative engineering solutions", icon: "⚙️" }
          ]
        },
        styles: { padding: "60px 20px", backgroundColor: "#ffffff" },
        position: { x: 0, y: 0 },
        size: { width: 1200, height: 500 }
      }
    ]
  }
]

export default function LandingPageBuilder() {
  const params = useParams()
  const router = useRouter()
  const subdomain = params.subdomain as string
  const pageId = params.id as string
  
  const [landingPage, setLandingPage] = useState<LandingPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [selectedElement, setSelectedElement] = useState<PageElement | null>(null)
  const [elements, setElements] = useState<PageElement[]>([])
  const [activeTab, setActiveTab] = useState("elements")
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">("desktop")
  
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (pageId !== "new") {
      fetchLandingPage()
    } else {
      setLoading(false)
      // Initialize with empty page for new creation
      setLandingPage({
        id: "new",
        name: "New Landing Page",
        slug: "new-page",
        title: "New Landing Page",
        description: "",
        status: "DRAFT",
        viewCount: 0,
        conversionCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }
  }, [pageId, subdomain])

  const fetchLandingPage = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/${subdomain}/landing-pages/${pageId}`)
      if (!response.ok) throw new Error('Failed to fetch landing page')
      
      const data = await response.json()
      setLandingPage(data)
      setElements(data.content || [])
    } catch (error) {
      console.error('Error fetching landing page:', error)
      // Initialize with empty page
      setLandingPage({
        id: pageId,
        name: "Landing Page",
        slug: "landing-page",
        title: "Landing Page",
        description: "",
        status: "DRAFT",
        viewCount: 0,
        conversionCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }

  const saveLandingPage = async () => {
    if (!landingPage) return

    setSaving(true)
    try {
      const pageData = {
        ...landingPage,
        content: elements
      }

      const response = await fetch(`/api/${subdomain}/landing-pages${pageId === "new" ? "" : `/${pageId}`}`, {
        method: pageId === "new" ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pageData),
      })

      if (!response.ok) throw new Error("Failed to save landing page")

      const savedPage = await response.json()
      setLandingPage(savedPage)
      
      if (pageId === "new") {
        router.push(`/${subdomain}/landing-pages/builder/${savedPage.id}`)
      }
      
      alert("Landing page saved successfully!")
    } catch (error) {
      console.error("Error saving landing page:", error)
      alert("Failed to save landing page")
    } finally {
      setSaving(false)
    }
  }

  const publishLandingPage = async () => {
    if (!landingPage) return

    try {
      const response = await fetch(`/api/${subdomain}/landing-pages/${landingPage.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...landingPage,
          status: "PUBLISHED",
          content: elements
        }),
      })

      if (!response.ok) throw new Error("Failed to publish landing page")

      setLandingPage(prev => prev ? { ...prev, status: "PUBLISHED" } : null)
      alert("Landing page published successfully!")
    } catch (error) {
      console.error("Error publishing landing page:", error)
      alert("Failed to publish landing page")
    }
  }

  const addElement = (type: PageElement["type"]) => {
    const newElement: PageElement = {
      id: Date.now().toString(),
      type,
      content: getDefaultContent(type),
      styles: getDefaultStyles(type),
      position: { x: 50, y: 50 + elements.length * 80 },
      size: getDefaultSize(type)
    }
    setElements([...elements, newElement])
  }

  const updateElement = (elementId: string, updates: Partial<PageElement>) => {
    setElements(elements.map(el => 
      el.id === elementId ? { ...el, ...updates } : el
    ))
  }

  const deleteElement = (elementId: string) => {
    setElements(elements.filter(el => el.id !== elementId))
    if (selectedElement?.id === elementId) {
      setSelectedElement(null)
    }
  }

  const loadTemplate = (template: Template) => {
    setElements(template.elements)
    if (landingPage) {
      setLandingPage({
        ...landingPage,
        name: template.name,
        title: template.name
      })
    }
  }

  const getDefaultContent = (type: PageElement["type"]) => {
    switch (type) {
      case "header": return { text: "New Header", level: 2 }
      case "text": return { text: "Your text here..." }
      case "button": return { text: "Click Me", action: "#", style: "primary" }
      case "hero": return { 
        title: "Welcome to Our Page", 
        subtitle: "Discover amazing opportunities",
        backgroundImage: "",
        primaryButton: { text: "Get Started", action: "#" },
        secondaryButton: { text: "Learn More", action: "#" }
      }
      case "features": return { 
        title: "Our Features", 
        subtitle: "What we offer",
        features: [
          { title: "Feature 1", description: "Description 1", icon: "⭐" },
          { title: "Feature 2", description: "Description 2", icon: "🚀" },
          { title: "Feature 3", description: "Description 3", icon: "💎" }
        ]
      }
      case "testimonial": return { 
        text: "This is amazing!", 
        author: "Happy Client", 
        role: "Student",
        avatar: ""
      }
      case "cta": return { 
        title: "Ready to Get Started?", 
        description: "Join thousands of satisfied students",
        buttonText: "Get Started Now",
        buttonAction: "#"
      }
      case "form": return { 
        title: "Contact Us",
        fields: [
          { name: "name", label: "Name", type: "text", required: true },
          { name: "email", label: "Email", type: "email", required: true },
          { name: "message", label: "Message", type: "textarea", required: false }
        ],
        submitText: "Submit"
      }
      case "divider": return { style: "solid", color: "#e5e7eb" }
      case "spacer": return { height: 50 }
      case "navbar": return { 
        logo: "",
        links: [
          { text: "Home", url: "#" },
          { text: "About", url: "#" },
          { text: "Services", url: "#" },
          { text: "Contact", url: "#" }
        ]
      }
      case "footer": return { 
        text: "© 2024 Your Agency. All rights reserved.",
        links: [
          { text: "Privacy Policy", url: "#" },
          { text: "Terms of Service", url: "#" }
        ]
      }
      default: return {}
    }
  }

  const getDefaultStyles = (type: PageElement["type"]) => {
    switch (type) {
      case "header": return { fontSize: 32, fontWeight: "bold", color: "#1F2937", textAlign: "center" }
      case "text": return { fontSize: 16, color: "#4B5563", lineHeight: 1.6 }
      case "button": return { 
        backgroundColor: "#3B82F6", 
        color: "white", 
        padding: "12px 24px", 
        borderRadius: "6px",
        border: "none",
        cursor: "pointer",
        fontSize: 16,
        fontWeight: "500"
      }
      case "hero": return { 
        backgroundColor: "#f8fafc", 
        padding: "100px 20px", 
        textAlign: "center",
        minHeight: "600px",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }
      case "features": return { padding: "80px 20px", backgroundColor: "#ffffff" }
      case "testimonial": return { 
        backgroundColor: "#f9fafb", 
        padding: "40px", 
        borderRadius: "12px",
        textAlign: "center"
      }
      case "cta": return { 
        backgroundColor: "#3B82F6", 
        color: "white", 
        padding: "80px 20px", 
        textAlign: "center",
        borderRadius: "12px"
      }
      case "form": return { 
        backgroundColor: "white", 
        padding: "40px", 
        borderRadius: "12px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
      }
      case "divider": return { 
        borderColor: "#e5e7eb", 
        borderWidth: "1px", 
        borderStyle: "solid",
        margin: "40px 0"
      }
      case "spacer": return { height: "50px" }
      case "navbar": return { 
        backgroundColor: "white", 
        padding: "20px 40px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }
      case "footer": return { 
        backgroundColor: "#1F2937", 
        color: "white", 
        padding: "40px 20px", 
        textAlign: "center"
      }
      default: return {}
    }
  }

  const getDefaultSize = (type: PageElement["type"]) => {
    switch (type) {
      case "header": return { width: 800, height: 80 }
      case "text": return { width: 600, height: 100 }
      case "button": return { width: 200, height: 50 }
      case "hero": return { width: 1200, height: 600 }
      case "features": return { width: 1200, height: 400 }
      case "testimonial": return { width: 400, height: 200 }
      case "cta": return { width: 800, height: 300 }
      case "form": return { width: 500, height: 400 }
      case "divider": return { width: 800, height: 2 }
      case "spacer": return { width: 400, height: 50 }
      case "navbar": return { width: 1200, height: 80 }
      case "footer": return { width: 1200, height: 100 }
      default: return { width: 400, height: 100 }
    }
  }

  const getElementIcon = (type: string) => {
    switch (type) {
      case "header": return <Type className="h-4 w-4" />
      case "text": return <FileText className="h-4 w-4" />
      case "image": return <Image className="h-4 w-4" />
      case "video": return <Video className="h-4 w-4" />
      case "button": return <Square className="h-4 w-4" />
      case "form": return <FileText className="h-4 w-4" />
      case "testimonial": return <Star className="h-4 w-4" />
      case "features": return <Grid className="h-4 w-4" />
      case "cta": return <BarChart3 className="h-4 w-4" />
      case "hero": return <Layout className="h-4 w-4" />
      case "navbar": return <Layout className="h-4 w-4" />
      case "footer": return <Layout className="h-4 w-4" />
      case "divider": return <Separator className="h-4 w-4" />
      case "spacer": return <div className="h-4 w-4 border-2 border-dashed border-gray-300" />
      default: return <Layout className="h-4 w-4" />
    }
  }

  const renderElement = (element: PageElement, isPreview = false) => {
    const isSelected = selectedElement?.id === element.id
    const elementStyle = {
      ...element.styles,
      position: isPreview ? "relative" : "absolute",
      left: isPreview ? "auto" : `${element.position.x}px`,
      top: isPreview ? "auto" : `${element.position.y}px`,
      width: isPreview ? "100%" : `${element.size.width}px`,
      height: isPreview ? "auto" : `${element.size.height}px`,
      border: isSelected && !isPreview ? "2px solid #3B82F6" : "none",
      cursor: isPreview ? "default" : "pointer"
    }

    const handleClick = (e: React.MouseEvent) => {
      if (!isPreview) {
        e.stopPropagation()
        setSelectedElement(element)
      }
    }

    switch (element.type) {
      case "header":
        const level = element.content.level || 2
        const HeaderTag = `h${level}` as keyof JSX.IntrinsicElements
        return (
          <div
            style={elementStyle}
            onClick={handleClick}
            className={!isPreview ? "hover:border-blue-400" : ""}
          >
            <HeaderTag style={element.styles}>
              {element.content.text}
            </HeaderTag>
          </div>
        )

      case "text":
        return (
          <div
            style={elementStyle}
            onClick={handleClick}
            className={!isPreview ? "hover:border-blue-400" : ""}
          >
            <p style={element.styles}>{element.content.text}</p>
          </div>
        )

      case "button":
        return (
          <div
            style={elementStyle}
            onClick={handleClick}
            className={!isPreview ? "hover:border-blue-400" : ""}
          >
            <button style={element.styles} className="hover:opacity-90">
              {element.content.text}
            </button>
          </div>
        )

      case "hero":
        return (
          <div
            style={{
              ...elementStyle,
              backgroundImage: element.content.backgroundImage 
                ? `url(${element.content.backgroundImage})` 
                : undefined,
            }}
            onClick={handleClick}
            className={!isPreview ? "hover:border-blue-400" : ""}
          >
            <h1 style={{ fontSize: "48px", fontWeight: "bold", marginBottom: "16px", color: element.styles.color || "#1F2937" }}>
              {element.content.title}
            </h1>
            <p style={{ fontSize: "24px", marginBottom: "32px", color: element.styles.color || "#6B7280" }}>
              {element.content.subtitle}
            </p>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
              <button style={{
                backgroundColor: "#3B82F6",
                color: "white",
                padding: "12px 24px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                fontSize: "16px"
              }}>
                {element.content.primaryButton?.text}
              </button>
              <button style={{
                backgroundColor: "transparent",
                color: "#3B82F6",
                padding: "12px 24px",
                borderRadius: "6px",
                border: "2px solid #3B82F6",
                cursor: "pointer",
                fontSize: "16px"
              }}>
                {element.content.secondaryButton?.text}
              </button>
            </div>
          </div>
        )

      case "features":
        return (
          <div
            style={elementStyle}
            onClick={handleClick}
            className={!isPreview ? "hover:border-blue-400" : ""}
          >
            <h2 style={{ fontSize: "36px", fontWeight: "bold", textAlign: "center", marginBottom: "16px", color: "#1F2937" }}>
              {element.content.title}
            </h2>
            <p style={{ fontSize: "18px", textAlign: "center", marginBottom: "48px", color: "#6B7280" }}>
              {element.content.subtitle}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "32px" }}>
              {element.content.features?.map((feature: any, index: number) => (
                <div key={index} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>{feature.icon}</div>
                  <h3 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "8px", color: "#1F2937" }}>
                    {feature.title}
                  </h3>
                  <p style={{ color: "#6B7280" }}>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        )

      case "testimonial":
        return (
          <div
            style={elementStyle}
            onClick={handleClick}
            className={!isPreview ? "hover:border-blue-400" : ""}
          >
            <p style={{ fontSize: "18px", fontStyle: "italic", marginBottom: "16px", color: "#4B5563" }}>
              "{element.content.text}"
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {element.content.avatar ? (
                  <img src={element.content.avatar} alt={element.content.author} style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
                ) : (
                  <span style={{ fontSize: "20px" }}>👤</span>
                )}
              </div>
              <div>
                <p style={{ fontWeight: "bold", color: "#1F2937" }}>{element.content.author}</p>
                <p style={{ color: "#6B7280", fontSize: "14px" }}>{element.content.role}</p>
              </div>
            </div>
          </div>
        )

      case "cta":
        return (
          <div
            style={elementStyle}
            onClick={handleClick}
            className={!isPreview ? "hover:border-blue-400" : ""}
          >
            <h2 style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "16px" }}>
              {element.content.title}
            </h2>
            <p style={{ fontSize: "18px", marginBottom: "32px" }}>
              {element.content.description}
            </p>
            <button style={{
              backgroundColor: "white",
              color: element.styles.backgroundColor || "#3B82F6",
              padding: "12px 24px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold"
            }}>
              {element.content.buttonText}
            </button>
          </div>
        )

      case "form":
        return (
          <div
            style={elementStyle}
            onClick={handleClick}
            className={!isPreview ? "hover:border-blue-400" : ""}
          >
            <h3 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "24px", textAlign: "center" }}>
              {element.content.title}
            </h3>
            <form style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {element.content.fields?.map((field: any, index: number) => (
                <div key={index}>
                  <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", color: "#374151" }}>
                    {field.label} {field.required && "*"}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "1px solid #D1D5DB",
                        borderRadius: "4px",
                        fontSize: "14px"
                      }}
                      rows={3}
                      placeholder={field.label}
                    />
                  ) : (
                    <input
                      type={field.type}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "1px solid #D1D5DB",
                        borderRadius: "4px",
                        fontSize: "14px"
                      }}
                      placeholder={field.label}
                      required={field.required}
                    />
                  )}
                </div>
              ))}
              <button
                type="submit"
                style={{
                  backgroundColor: "#3B82F6",
                  color: "white",
                  padding: "12px 24px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "500"
                }}
              >
                {element.content.submitText}
              </button>
            </form>
          </div>
        )

      case "divider":
        return (
          <div
            style={elementStyle}
            onClick={handleClick}
            className={!isPreview ? "hover:border-blue-400" : ""}
          >
            <hr style={{
              border: "none",
              borderTop: `${element.styles.borderWidth || "1px"} ${element.styles.borderStyle || "solid"} ${element.styles.color || "#e5e7eb"}`,
              margin: element.styles.margin || "40px 0"
            }} />
          </div>
        )

      case "spacer":
        return (
          <div
            style={{
              ...elementStyle,
              height: `${element.content.height || 50}px`,
              backgroundColor: "transparent"
            }}
            onClick={handleClick}
            className={!isPreview ? "hover:border-blue-400 border-dashed" : ""}
          >
            <div style={{ 
              width: "100%", 
              height: "100%", 
              border: "2px dashed #D1D5DB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#9CA3AF",
              fontSize: "12px"
            }}>
              Spacer
            </div>
          </div>
        )

      case "navbar":
        return (
          <div
            style={elementStyle}
            onClick={handleClick}
            className={!isPreview ? "hover:border-blue-400" : ""}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {element.content.logo && (
                <img src={element.content.logo} alt="Logo" style={{ height: "40px" }} />
              )}
              <div style={{ display: "flex", gap: "32px" }}>
                {element.content.links?.map((link: any, index: number) => (
                  <a
                    key={index}
                    href={link.url}
                    style={{
                      color: "#374151",
                      textDecoration: "none",
                      fontWeight: "500",
                      fontSize: "16px"
                    }}
                  >
                    {link.text}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )

      case "footer":
        return (
          <div
            style={elementStyle}
            onClick={handleClick}
            className={!isPreview ? "hover:border-blue-400" : ""}
          >
            <p style={{ marginBottom: "16px" }}>{element.content.text}</p>
            <div style={{ display: "flex", gap: "32px", justifyContent: "center" }}>
              {element.content.links?.map((link: any, index: number) => (
                <a
                  key={index}
                  href={link.url}
                  style={{
                    color: element.styles.color || "#9CA3AF",
                    textDecoration: "none",
                    fontSize: "14px"
                  }}
                >
                  {link.text}
                </a>
              ))}
            </div>
          </div>
        )

      default:
        return (
          <div
            style={elementStyle}
            onClick={handleClick}
            className={!isPreview ? "hover:border-blue-400" : ""}
          >
            <p>Unknown element type: {element.type}</p>
          </div>
        )
    }
  }

  const renderElementSettings = () => {
    if (!selectedElement) return null

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getElementIcon(selectedElement.type)}
            Element Settings
          </CardTitle>
          <CardDescription>Configure the selected element</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Content Settings */}
          <div>
            <Label>Content</Label>
            {selectedElement.type === "header" && (
              <>
                <Input
                  placeholder="Header text"
                  value={selectedElement.content.text || ""}
                  onChange={(e) => updateElement(selectedElement.id, {
                    content: { ...selectedElement.content, text: e.target.value }
                  })}
                  className="mb-2"
                />
                <Select
                  value={selectedElement.content.level?.toString() || "2"}
                  onValueChange={(value) => updateElement(selectedElement.id, {
                    content: { ...selectedElement.content, level: parseInt(value) }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">H1</SelectItem>
                    <SelectItem value="2">H2</SelectItem>
                    <SelectItem value="3">H3</SelectItem>
                    <SelectItem value="4">H4</SelectItem>
                    <SelectItem value="5">H5</SelectItem>
                    <SelectItem value="6">H6</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
            
            {selectedElement.type === "text" && (
              <Textarea
                placeholder="Text content"
                value={selectedElement.content.text || ""}
                onChange={(e) => updateElement(selectedElement.id, {
                  content: { ...selectedElement.content, text: e.target.value }
                })}
                rows={4}
              />
            )}

            {selectedElement.type === "button" && (
              <>
                <Input
                  placeholder="Button text"
                  value={selectedElement.content.text || ""}
                  onChange={(e) => updateElement(selectedElement.id, {
                    content: { ...selectedElement.content, text: e.target.value }
                  })}
                  className="mb-2"
                />
                <Input
                  placeholder="Button link (e.g., #section or https://...)"
                  value={selectedElement.content.action || ""}
                  onChange={(e) => updateElement(selectedElement.id, {
                    content: { ...selectedElement.content, action: e.target.value }
                  })}
                />
              </>
            )}

            {selectedElement.type === "hero" && (
              <>
                <Input
                  placeholder="Hero title"
                  value={selectedElement.content.title || ""}
                  onChange={(e) => updateElement(selectedElement.id, {
                    content: { ...selectedElement.content, title: e.target.value }
                  })}
                  className="mb-2"
                />
                <Textarea
                  placeholder="Hero subtitle"
                  value={selectedElement.content.subtitle || ""}
                  onChange={(e) => updateElement(selectedElement.id, {
                    content: { ...selectedElement.content, subtitle: e.target.value }
                  })}
                  className="mb-2"
                  rows={2}
                />
                <Input
                  placeholder="Background image URL (optional)"
                  value={selectedElement.content.backgroundImage || ""}
                  onChange={(e) => updateElement(selectedElement.id, {
                    content: { ...selectedElement.content, backgroundImage: e.target.value }
                  })}
                  className="mb-2"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Primary button text"
                    value={selectedElement.content.primaryButton?.text || ""}
                    onChange={(e) => updateElement(selectedElement.id, {
                      content: {
                        ...selectedElement.content,
                        primaryButton: { ...selectedElement.content.primaryButton, text: e.target.value }
                      }
                    })}
                  />
                  <Input
                    placeholder="Secondary button text"
                    value={selectedElement.content.secondaryButton?.text || ""}
                    onChange={(e) => updateElement(selectedElement.id, {
                      content: {
                        ...selectedElement.content,
                        secondaryButton: { ...selectedElement.content.secondaryButton, text: e.target.value }
                      }
                    })}
                  />
                </div>
              </>
            )}
          </div>

          {/* Style Settings */}
          <div>
            <Label>Styles</Label>
            {selectedElement.type === "header" && (
              <>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <Input
                    type="number"
                    placeholder="Font size"
                    value={selectedElement.styles.fontSize || ""}
                    onChange={(e) => updateElement(selectedElement.id, {
                      styles: { ...selectedElement.styles, fontSize: parseInt(e.target.value) || 32 }
                    })}
                  />
                  <Select
                    value={selectedElement.styles.textAlign || "left"}
                    onValueChange={(value) => updateElement(selectedElement.id, {
                      styles: { ...selectedElement.styles, textAlign: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  type="color"
                  value={selectedElement.styles.color || "#000000"
                  onChange={(e) => updateElement(selectedElement.id, {
                    styles: { ...selectedElement.styles, color: e.target.value }
                  })}
                />
              </>
            )}

            {selectedElement.type === "button" && (
              <div className="space-y-2">
                <Input
                  type="color"
                  placeholder="Background color"
                  value={selectedElement.styles.backgroundColor || "#3B82F6"
                  onChange={(e) => updateElement(selectedElement.id, {
                    styles: { ...selectedElement.styles, backgroundColor: e.target.value }
                  })}
                />
                <Input
                  type="color"
                  placeholder="Text color"
                  value={selectedElement.styles.color || "#ffffff"
                  onChange={(e) => updateElement(selectedElement.id, {
                    styles: { ...selectedElement.styles, color: e.target.value }
                  })}
                />
              </div>
            )}

            {selectedElement.type === "spacer" && (
              <Input
                type="number"
                placeholder="Spacer height (px)"
                value={selectedElement.content.height || 50}
                onChange={(e) => updateElement(selectedElement.id, {
                  content: { ...selectedElement.content, height: parseInt(e.target.value) || 50 }
                })}
              />
            )}
          </div>

          {/* Position and Size */}
          {!isPreviewMode && (
            <div>
              <Label>Position & Size</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="X position"
                  value={selectedElement.position.x}
                  onChange={(e) => updateElement(selectedElement.id, {
                    position: { ...selectedElement.position, x: parseInt(e.target.value) || 0 }
                  })}
                />
                <Input
                  type="number"
                  placeholder="Y position"
                  value={selectedElement.position.y}
                  onChange={(e) => updateElement(selectedElement.id, {
                    position: { ...selectedElement.position, y: parseInt(e.target.value) || 0 }
                  })}
                />
                <Input
                  type="number"
                  placeholder="Width"
                  value={selectedElement.size.width}
                  onChange={(e) => updateElement(selectedElement.id, {
                    size: { ...selectedElement.size, width: parseInt(e.target.value) || 400 }
                  })}
                />
                <Input
                  type="number"
                  placeholder="Height"
                  value={selectedElement.size.height}
                  onChange={(e) => updateElement(selectedElement.id, {
                    size: { ...selectedElement.size, height: parseInt(e.target.value) || 100 }
                  })}
                />
              </div>
            </div>
          )}

          <Button
            variant="destructive"
            size="sm"
            onClick={() => deleteElement(selectedElement.id)}
            className="w-full"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Element
          </Button>
        </CardContent>
      </Card>
    )
  }

  const renderPageSettings = () => {
    if (!landingPage) return null

    return (
      <Card>
        <CardHeader>
          <CardTitle>Page Settings</CardTitle>
          <CardDescription>Configure your landing page</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="pageName">Page Name</Label>
            <Input
              id="pageName"
              value={landingPage.name}
              onChange={(e) => setLandingPage({ ...landingPage, name: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="pageSlug">URL Slug</Label>
            <Input
              id="pageSlug"
              value={landingPage.slug}
              onChange={(e) => setLandingPage({ ...landingPage, slug: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="pageTitle">Page Title</Label>
            <Input
              id="pageTitle"
              value={landingPage.title || ""}
              onChange={(e) => setLandingPage({ ...landingPage, title: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="pageDescription">Description</Label>
            <Textarea
              id="pageDescription"
              value={landingPage.description || ""}
              onChange={(e) => setLandingPage({ ...landingPage, description: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <Label>SEO Settings</Label>
            <div className="space-y-2 mt-2">
              <Input
                placeholder="SEO Title"
                value={landingPage.seo?.title || ""}
                onChange={(e) => setLandingPage({
                  ...landingPage,
                  seo: { ...landingPage.seo, title: e.target.value }
                })}
              />
              <Textarea
                placeholder="SEO Description"
                value={landingPage.seo?.description || ""}
                onChange={(e) => setLandingPage({
                  ...landingPage,
                  seo: { ...landingPage.seo, description: e.target.value }
                })}
                rows={2}
              />
              <Input
                placeholder="SEO Keywords (comma separated)"
                value={landingPage.seo?.keywords || ""}
                onChange={(e) => setLandingPage({
                  ...landingPage,
                  seo: { ...landingPage.seo, keywords: e.target.value }
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Landing Page Builder</h2>
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={saveLandingPage}
              disabled={saving}
              className="flex-1"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>

          {landingPage && landingPage.status === "DRAFT" && (
            <Button
              size="sm"
              variant="default"
              onClick={publishLandingPage}
              className="w-full mt-2"
            >
              Publish
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 m-2">
            <TabsTrigger value="elements">Elements</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="elements" className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Basic Elements</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addElement("header")}
                    className="justify-start"
                  >
                    <Type className="h-4 w-4 mr-2" />
                    Header
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addElement("text")}
                    className="justify-start"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Text
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addElement("button")}
                    className="justify-start"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Button
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addElement("image")}
                    className="justify-start"
                  >
                    <Image className="h-4 w-4 mr-2" />
                    Image
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Layout Elements</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addElement("hero")}
                    className="justify-start"
                  >
                    <Layout className="h-4 w-4 mr-2" />
                    Hero
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addElement("features")}
                    className="justify-start"
                  >
                    <Grid className="h-4 w-4 mr-2" />
                    Features
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addElement("testimonial")}
                    className="justify-start"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Testimonial
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addElement("cta")}
                    className="justify-start"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    CTA
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Form Elements</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addElement("form")}
                    className="justify-start"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Form
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Navigation</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addElement("navbar")}
                    className="justify-start"
                  >
                    <Layout className="h-4 w-4 mr-2" />
                    Navbar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addElement("footer")}
                    className="justify-start"
                  >
                    <Layout className="h-4 w-4 mr-2" />
                    Footer
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Spacing</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addElement("divider")}
                    className="justify-start"
                  >
                    <Separator className="h-4 w-4 mr-2" />
                    Divider
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addElement("spacer")}
                    className="justify-start"
                  >
                    <div className="h-4 w-4 border-2 border-dashed border-gray-300 mr-2" />
                    Spacer
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              <h3 className="font-medium">Choose a Template</h3>
              {templates.map((template) => (
                <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{template.name}</CardTitle>
                    <CardDescription className="text-xs">{template.category}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => loadTemplate(template)}
                      className="w-full"
                    >
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="flex-1 overflow-y-auto p-4">
            {renderPageSettings()}
          </TabsContent>
        </Tabs>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">
                {landingPage?.name || "New Landing Page"}
              </h1>
              <Badge variant={landingPage?.status === "PUBLISHED" ? "default" : "secondary"}>
                {landingPage?.status || "DRAFT"}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Button
                  variant={viewMode === "desktop" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("desktop")}
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "tablet" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("tablet")}
                >
                  <Tablet className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "mobile" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("mobile")}
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const url = `${window.location.origin}/${subdomain}/${landingPage?.slug}`
                  window.open(url, "_blank")
                }}
                disabled={!landingPage || landingPage.status !== "PUBLISHED"}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Live
              </Button>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex">
          {/* Canvas */}
          <div className="flex-1 overflow-auto bg-gray-100 p-8">
            <div
              ref={canvasRef}
              className={`bg-white mx-auto shadow-lg relative ${
                viewMode === "mobile" ? "w-[375px]" : 
                viewMode === "tablet" ? "w-[768px]" : 
                "w-[1200px]"
              }`}
              style={{ minHeight: "1000px" }}
              onClick={() => setSelectedElement(null)}
            >
              {elements.map((element) => renderElement(element, isPreviewMode))}
              
              {elements.length === 0 && (
                <div className="flex items-center justify-center h-96 text-gray-500">
                  <div className="text-center">
                    <Layout className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium mb-2">Start building your page</p>
                    <p className="text-sm">Add elements from the sidebar to begin</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Settings Panel */}
          {selectedElement && !isPreviewMode && (
            <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
              <div className="p-4">
                {renderElementSettings()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}