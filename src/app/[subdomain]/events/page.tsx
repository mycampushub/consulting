"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar as CalendarIcon, 
  MapPin, 
  Users, 
  Clock,
  Edit,
  Trash2,
  Eye,
  Download,
  Bell,
  Video,
  Building,
  GraduationCap,
  Briefcase,
  Heart,
  Settings,
  Mail,
  Phone,
  Link,
  Image,
  FileText,
  DollarSign,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserPlus,
  QrCode,
  Share2,
  MessageSquare,
  Camera,
  Mic,
  ExternalLink,
  Map,
  Car,
  Coffee,
  Wifi,
  Gift,
  Award,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Loader2,
  Copy
} from "lucide-react"
import { format } from "date-fns"

// Enhanced Event Interface
interface Event {
  id: string
  title: string
  description: string
  type: 'WEBINAR' | 'WORKSHOP' | 'SEMINAR' | 'FAIR' | 'MEETING' | 'TRAINING' | 'NETWORKING' | 'CONFERENCE' | 'EXPO' | 'OTHER'
  status: 'DRAFT' | 'PUBLISHED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED'
  startDate: string
  endDate: string
  timezone: string
  location?: {
    venue: string
    address: string
    city: string
    state: string
    country: string
    postalCode: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  isVirtual: boolean
  virtualSettings?: {
    platform: 'ZOOM' | 'TEAMS' | 'GOOGLE_MEET' | 'WEBEX' | 'CUSTOM'
    meetingUrl?: string
    meetingId?: string
    password?: string
    dialInInfo?: string
    recordingEnabled: boolean
    waitingRoom: boolean
    breakoutRooms: boolean
  }
  maxAttendees?: number
  registeredAttendees: number
  waitlistEnabled: boolean
  waitlistCount: number
  organizer: {
    id: string
    name: string
    email: string
    phone: string
  }
  coOrganizers: Array<{
    id: string
    name: string
    email: string
    role: string
  }>
  speakers: Array<{
    id: string
    name: string
    title: string
    organization: string
    bio: string
    photo?: string
    isKeynote: boolean
  }>
  sponsors: Array<{
    id: string
    name: string
    logo?: string
    website?: string
    sponsorshipLevel: 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE' | 'IN_KIND'
  }>
  pricing: {
    isFree: boolean
    currency: string
    regularPrice?: number
    earlyBirdPrice?: number
    earlyBirdDeadline?: string
    groupDiscount?: {
      enabled: boolean
      minPeople: number
      discountPercentage: number
    }
    discountCodes?: Array<{
      code: string
      discountPercentage: number
      maxUses?: number
      validUntil?: string
    }>
  }
  agenda: Array<{
    id: string
    title: string
    description?: string
    startTime: string
    endTime: string
    speakerId?: string
    location?: string
    type: 'SESSION' | 'BREAK' | 'NETWORKING' | 'MEAL' | 'WORKSHOP'
  }>
  resources: Array<{
    id: string
    name: string
    type: 'DOCUMENT' | 'IMAGE' | 'VIDEO' | 'LINK' | 'PRESENTATION'
    url: string
    description?: string
    isPublic: boolean
  }>
  tags: string[]
  category: string
  visibility: 'PUBLIC' | 'PRIVATE' | 'INVITE_ONLY'
  requiresApproval: boolean
  allowCancellations: boolean
  cancellationPolicy?: string
  certificateEnabled: boolean
  feedbackEnabled: boolean
  surveyEnabled: boolean
  networkingEnabled: boolean
  customFields: Record<string, any>
  seo: {
    metaTitle?: string
    metaDescription?: string
    keywords?: string[]
    featuredImage?: string
  }
  socialMedia: {
    facebookUrl?: string
    twitterUrl?: string
    linkedinUrl?: string
    instagramUrl?: string
    hashtag?: string
  }
  analytics: {
    views: number
    registrations: number
    attendanceRate: number
    satisfactionScore?: number
    topReferrers: string[]
  }
  createdAt: string
  updatedAt: string
  createdBy: string
}

// Enhanced Registration Interface
interface EventRegistration {
  id: string
  eventId: string
  studentId: string
  studentName: string
  studentEmail: string
  studentPhone?: string
  registrationDate: string
  status: 'REGISTERED' | 'CONFIRMED' | 'CHECKED_IN' | 'ATTENDED' | 'CANCELLED' | 'NO_SHOW' | 'WAITLISTED'
  ticketType?: string
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED'
  paymentAmount?: number
  paymentMethod?: string
  transactionId?: string
  checkInTime?: string
  checkInMethod?: 'QR_CODE' | 'MANUAL' | 'APP' | 'EMAIL'
  dietaryRestrictions?: string
  accessibilityRequirements?: string
  specialRequests?: string
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  answers: Record<string, any>
  certificateIssued: boolean
  certificateUrl?: string
  feedbackSubmitted: boolean
  feedbackRating?: number
  feedbackComments?: string
  networkingOptIn: boolean
  marketingOptIn: boolean
  notes?: string
  referredBy?: string
  discountCode?: string
  groupRegistrationId?: string
  isGroupLeader: boolean
  groupMembers?: string[]
}

interface EventTemplate {
  id: string
  name: string
  description: string
  eventType: Event['type']
  category: string
  defaultSettings: Partial<Event>
  isPublic: boolean
  usageCount: number
  createdAt: string
  updatedAt: string
}

const mockEvents: Event[] = [
  {
    id: "1",
    title: "Study Abroad Information Session Spring 2024",
    description: "Comprehensive information session about studying abroad opportunities in the USA, UK, Canada, and Australia. Learn about application processes, scholarships, visa requirements, and student life.",
    type: "WEBINAR",
    status: "PUBLISHED",
    startDate: "2024-02-15T14:00:00Z",
    endDate: "2024-02-15T16:00:00Z",
    timezone: "America/New_York",
    isVirtual: true,
    virtualSettings: {
      platform: "ZOOM",
      meetingUrl: "https://zoom.us/j/123456789",
      meetingId: "123456789",
      password: "study2024",
      recordingEnabled: true,
      waitingRoom: true,
      breakoutRooms: false
    },
    maxAttendees: 100,
    registeredAttendees: 45,
    waitlistEnabled: true,
    waitlistCount: 12,
    organizer: {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah.johnson@agency.com",
      phone: "+1 (555) 123-4567"
    },
    coOrganizers: [
      {
        id: "2",
        name: "Michael Chen",
        email: "michael.chen@agency.com",
        role: "Co-host"
      }
    ],
    speakers: [
      {
        id: "3",
        name: "Dr. Emily Rodriguez",
        title: "International Education Expert",
        organization: "Global Education Consultants",
        bio: "15+ years of experience in international education",
        isKeynote: true
      }
    ],
    sponsors: [
      {
        id: "1",
        name: "Global Bank",
        sponsorshipLevel: "GOLD"
      }
    ],
    pricing: {
      isFree: true,
      currency: "USD"
    },
    agenda: [
      {
        id: "1",
        title: "Welcome & Introduction",
        startTime: "2024-02-15T14:00:00Z",
        endTime: "2024-02-15T14:15:00Z",
        type: "SESSION"
      },
      {
        id: "2",
        title: "Study Destinations Overview",
        startTime: "2024-02-15T14:15:00Z",
        endTime: "2024-02-15T15:00:00Z",
        speakerId: "3",
        type: "SESSION"
      },
      {
        id: "3",
        title: "Q&A Session",
        startTime: "2024-02-15T15:00:00Z",
        endTime: "2024-02-15T16:00:00Z",
        type: "SESSION"
      }
    ],
    resources: [
      {
        id: "1",
        name: "Study Abroad Guide 2024",
        type: "DOCUMENT",
        url: "/resources/study-abroad-guide.pdf",
        description: "Comprehensive guide for international students",
        isPublic: true
      }
    ],
    tags: ["study abroad", "webinar", "information", "2024"],
    category: "Information Session",
    visibility: "PUBLIC",
    requiresApproval: false,
    allowCancellations: true,
    cancellationPolicy: "Free cancellation up to 24 hours before the event",
    certificateEnabled: false,
    feedbackEnabled: true,
    surveyEnabled: true,
    networkingEnabled: true,
    customFields: {},
    seo: {
      metaTitle: "Study Abroad Information Session Spring 2024",
      metaDescription: "Join our free webinar to learn about study opportunities in USA, UK, Canada, and Australia",
      keywords: ["study abroad", "international education", "webinar"],
      featuredImage: "/images/study-abroad-webinar.jpg"
    },
    socialMedia: {
      hashtag: "#StudyAbroad2024"
    },
    analytics: {
      views: 1250,
      registrations: 45,
      attendanceRate: 78,
      satisfactionScore: 4.5,
      topReferrers: ["Facebook", "Google", "Direct"]
    },
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z",
    createdBy: "1"
  },
  {
    id: "2",
    title: "International University Fair Spring 2024",
    description: "Meet representatives from top universities around the world. Network with admissions officers, learn about programs, and get your questions answered.",
    type: "FAIR",
    status: "PUBLISHED",
    startDate: "2024-03-10T10:00:00Z",
    endDate: "2024-03-10T16:00:00Z",
    timezone: "America/New_York",
    location: {
      venue: "Grand Convention Center",
      address: "123 Main Street",
      city: "New York",
      state: "NY",
      country: "USA",
      postalCode: "10001",
      coordinates: {
        lat: 40.7589,
        lng: -73.9851
      }
    },
    isVirtual: false,
    maxAttendees: 500,
    registeredAttendees: 234,
    waitlistEnabled: true,
    waitlistCount: 45,
    organizer: {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah.johnson@agency.com",
      phone: "+1 (555) 123-4567"
    },
    speakers: [
      {
        id: "4",
        name: "Prof. David Wilson",
        title: "Dean of Admissions",
        organization: "MIT",
        bio: "Leading expert in university admissions",
        isKeynote: true
      }
    ],
    sponsors: [
      {
        id: "2",
        name: "Tech University",
        sponsorshipLevel: "PLATINUM"
      },
      {
        id: "3",
        name: "Business College",
        sponsorshipLevel: "GOLD"
      }
    ],
    pricing: {
      isFree: true,
      currency: "USD"
    },
    agenda: [
      {
        id: "1",
        title: "Registration & Welcome Coffee",
        startTime: "2024-03-10T10:00:00Z",
        endTime: "2024-03-10T10:30:00Z",
        type: "NETWORKING"
      },
      {
        id: "2",
        title: "Keynote: Future of International Education",
        startTime: "2024-03-10T10:30:00Z",
        endTime: "2024-03-10T11:00:00Z",
        speakerId: "4",
        type: "SESSION"
      },
      {
        id: "3",
        title: "University Booth Sessions",
        startTime: "2024-03-10T11:00:00Z",
        endTime: "2024-03-10T15:00:00Z",
        type: "SESSION"
      },
      {
        id: "4",
        title: "Networking Lunch",
        startTime: "2024-03-10T12:00:00Z",
        endTime: "2024-03-10T13:00:00Z",
        type: "MEAL"
      }
    ],
    tags: ["university fair", "networking", "recruitment", "2024"],
    category: "Education Fair",
    visibility: "PUBLIC",
    requiresApproval: false,
    allowCancellations: true,
    cancellationPolicy: "Free cancellation up to 48 hours before the event",
    certificateEnabled: false,
    feedbackEnabled: true,
    surveyEnabled: true,
    networkingEnabled: true,
    customFields: {},
    seo: {
      metaTitle: "International University Fair Spring 2024",
      metaDescription: "Meet representatives from top universities around the world at our annual education fair",
      keywords: ["university fair", "education", "recruitment"],
      featuredImage: "/images/university-fair.jpg"
    },
    socialMedia: {
      hashtag: "#UniFair2024"
    },
    analytics: {
      views: 3200,
      registrations: 234,
      attendanceRate: 85,
      satisfactionScore: 4.7,
      topReferrers: ["LinkedIn", "Facebook", "Email"]
    },
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-18T00:00:00Z",
    createdBy: "1"
  }
]

const mockRegistrations: EventRegistration[] = [
  {
    id: "1",
    eventId: "1",
    studentId: "1",
    studentName: "Alex Thompson",
    studentEmail: "alex.thompson@email.com",
    studentPhone: "+1 (555) 123-4567",
    registrationDate: "2024-01-20T00:00:00Z",
    status: "CONFIRMED",
    paymentStatus: "PAID",
    dietaryRestrictions: "Vegetarian",
    accessibilityRequirements: "Wheelchair access",
    emergencyContact: {
      name: "Jane Thompson",
      phone: "+1 (555) 987-6543",
      relationship: "Parent"
    },
    networkingOptIn: true,
    marketingOptIn: true,
    feedbackSubmitted: false
  },
  {
    id: "2",
    eventId: "2",
    studentId: "2",
    studentName: "Maria Garcia",
    studentEmail: "maria.garcia@email.com",
    registrationDate: "2024-01-15T00:00:00Z",
    status: "REGISTERED",
    paymentStatus: "PAID",
    dietaryRestrictions: "Gluten-free",
    networkingOptIn: true,
    marketingOptIn: false,
    feedbackSubmitted: false
  },
  {
    id: "3",
    eventId: "1",
    studentId: "3",
    studentName: "James Wilson",
    studentEmail: "james.wilson@email.com",
    registrationDate: "2024-01-25T00:00:00Z",
    status: "ATTENDED",
    paymentStatus: "PAID",
    checkInTime: "2024-02-15T13:55:00Z",
    checkInMethod: "QR_CODE",
    feedbackSubmitted: true,
    feedbackRating: 5,
    feedbackComments: "Excellent session, very informative!",
    networkingOptIn: true,
    marketingOptIn: true
  }
]

const eventTemplates: EventTemplate[] = [
  {
    id: "1",
    name: "Information Webinar",
    description: "Template for educational information webinars",
    eventType: "WEBINAR",
    category: "Information Session",
    defaultSettings: {
      isVirtual: true,
      virtualSettings: {
        platform: "ZOOM",
        recordingEnabled: true,
        waitingRoom: true,
        breakoutRooms: false
      },
      pricing: {
        isFree: true,
        currency: "USD"
      },
      requiresApproval: false,
      certificateEnabled: false,
      feedbackEnabled: true,
      surveyEnabled: true
    },
    isPublic: true,
    usageCount: 15,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  }
]

export default function EventsPage() {
  const params = useParams()
  const subdomain = params.subdomain as string
  
  const [events, setEvents] = useState<Event[]>(mockEvents)
  const [registrations, setRegistrations] = useState<EventRegistration[]>(mockRegistrations)
  const [templates] = useState<EventTemplate[]>(eventTemplates)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false)
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isViewEventOpen, setIsViewEventOpen] = useState(false)
  const [isEditEventOpen, setIsEditEventOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("events")
  const [viewMode, setViewMode] = useState<"list" | "grid" | "calendar">("list")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  // Form states
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    type: "WEBINAR",
    status: "DRAFT",
    timezone: "America/New_York",
    isVirtual: true,
    waitlistEnabled: true,
    visibility: "PUBLIC",
    requiresApproval: false,
    allowCancellations: true,
    certificateEnabled: false,
    feedbackEnabled: true,
    surveyEnabled: true,
    networkingEnabled: true,
    pricing: {
      isFree: true,
      currency: "USD"
    },
    virtualSettings: {
      platform: "ZOOM",
      recordingEnabled: true,
      waitingRoom: true,
      breakoutRooms: false
    }
  })

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === "all" || event.status === statusFilter
    const matchesType = typeFilter === "all" || event.type === typeFilter
    const matchesCategory = categoryFilter === "all" || event.category === categoryFilter
    
    let matchesDate = true
    if (dateFilter !== "all") {
      const now = new Date()
      const eventDate = new Date(event.startDate)
      
      switch (dateFilter) {
        case "today":
          matchesDate = eventDate.toDateString() === now.toDateString()
          break
        case "week":
          const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
          matchesDate = eventDate >= now && eventDate <= weekFromNow
          break
        case "month":
          const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
          matchesDate = eventDate >= now && eventDate <= monthFromNow
          break
        case "upcoming":
          matchesDate = eventDate > now
          break
        case "past":
          matchesDate = eventDate < now
          break
      }
    }
    
    return matchesSearch && matchesStatus && matchesType && matchesCategory && matchesDate
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED": return "bg-green-100 text-green-800"
      case "ONGOING": return "bg-blue-100 text-blue-800"
      case "COMPLETED": return "bg-gray-100 text-gray-800"
      case "CANCELLED": return "bg-red-100 text-red-800"
      case "POSTPONED": return "bg-yellow-100 text-yellow-800"
      case "DRAFT": return "bg-gray-100 text-gray-800"
      case "REGISTERED": case "CONFIRMED": return "bg-blue-100 text-blue-800"
      case "CHECKED_IN": case "ATTENDED": return "bg-green-100 text-green-800"
      case "CANCELLED": return "bg-red-100 text-red-800"
      case "NO_SHOW": return "bg-orange-100 text-orange-800"
      case "WAITLISTED": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "WEBINAR": return "bg-purple-100 text-purple-800"
      case "WORKSHOP": return "bg-blue-100 text-blue-800"
      case "SEMINAR": return "bg-green-100 text-green-800"
      case "FAIR": return "bg-orange-100 text-orange-800"
      case "MEETING": return "bg-gray-100 text-gray-800"
      case "TRAINING": return "bg-indigo-100 text-indigo-800"
      case "NETWORKING": return "bg-pink-100 text-pink-800"
      case "CONFERENCE": return "bg-red-100 text-red-800"
      case "EXPO": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "WEBINAR": return <Video className="h-4 w-4" />
      case "WORKSHOP": return <Briefcase className="h-4 w-4" />
      case "SEMINAR": return <GraduationCap className="h-4 w-4" />
      case "FAIR": return <Building className="h-4 w-4" />
      case "MEETING": return <Users className="h-4 w-4" />
      case "TRAINING": return <Settings className="h-4 w-4" />
      case "NETWORKING": return <Heart className="h-4 w-4" />
      case "CONFERENCE": return <Star className="h-4 w-4" />
      case "EXPO": return <MapPin className="h-4 w-4" />
      default: return <CalendarIcon className="h-4 w-4" />
    }
  }

  const upcomingEvents = events.filter(event => 
    new Date(event.startDate) > new Date() && event.status === 'PUBLISHED'
  )

  const totalRegistrations = events.reduce((sum, event) => sum + event.registeredAttendees, 0)
  const totalRevenue = events.reduce((sum, event) => {
    if (event.pricing.isFree) return sum
    const avgPrice = (event.pricing.regularPrice || 0 + event.pricing.earlyBirdPrice || 0) / 2
    return sum + (event.registeredAttendees * avgPrice)
  }, 0)

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const createEventFromTemplate = (template: EventTemplate) => {
    setNewEvent({
      ...template.defaultSettings,
      type: template.eventType,
      category: template.category,
      status: "DRAFT"
    })
    setIsTemplateDialogOpen(false)
    setIsCreateEventOpen(true)
  }

  const handleCreateEvent = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const event: Event = {
        id: Date.now().toString(),
        title: newEvent.title || "",
        description: newEvent.description || "",
        type: newEvent.type || "WEBINAR",
        status: newEvent.status || "DRAFT",
        startDate: newEvent.startDate || "",
        endDate: newEvent.endDate || "",
        timezone: newEvent.timezone || "America/New_York",
        location: newEvent.location,
        isVirtual: newEvent.isVirtual || false,
        virtualSettings: newEvent.virtualSettings,
        maxAttendees: newEvent.maxAttendees,
        registeredAttendees: 0,
        waitlistEnabled: newEvent.waitlistEnabled || false,
        waitlistCount: 0,
        organizer: newEvent.organizer || {
          id: "1",
          name: "Current User",
          email: "user@agency.com",
          phone: "+1 (555) 000-0000"
        },
        coOrganizers: newEvent.coOrganizers || [],
        speakers: newEvent.speakers || [],
        sponsors: newEvent.sponsors || [],
        pricing: newEvent.pricing || {
          isFree: true,
          currency: "USD"
        },
        agenda: newEvent.agenda || [],
        resources: newEvent.resources || [],
        tags: newEvent.tags || [],
        category: newEvent.category || "",
        visibility: newEvent.visibility || "PUBLIC",
        requiresApproval: newEvent.requiresApproval || false,
        allowCancellations: newEvent.allowCancellations || true,
        cancellationPolicy: newEvent.cancellationPolicy,
        certificateEnabled: newEvent.certificateEnabled || false,
        feedbackEnabled: newEvent.feedbackEnabled || true,
        surveyEnabled: newEvent.surveyEnabled || true,
        networkingEnabled: newEvent.networkingEnabled || true,
        customFields: newEvent.customFields || {},
        seo: newEvent.seo || {},
        socialMedia: newEvent.socialMedia || {},
        analytics: {
          views: 0,
          registrations: 0,
          attendanceRate: 0,
          topReferrers: []
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: "1"
      }
      
      setEvents([event, ...events])
      setIsCreateEventOpen(false)
      setNewEvent({
        type: "WEBINAR",
        status: "DRAFT",
        timezone: "America/New_York",
        isVirtual: true,
        waitlistEnabled: true,
        visibility: "PUBLIC",
        requiresApproval: false,
        allowCancellations: true,
        certificateEnabled: false,
        feedbackEnabled: true,
        surveyEnabled: true,
        networkingEnabled: true,
        pricing: {
          isFree: true,
          currency: "USD"
        },
        virtualSettings: {
          platform: "ZOOM",
          recordingEnabled: true,
          waitingRoom: true,
          breakoutRooms: false
        }
      })
    } catch (error) {
      console.error('Error creating event:', error)
    } finally {
      setLoading(false)
    }
  }

  const duplicateEvent = (event: Event) => {
    setNewEvent({
      ...event,
      title: `${event.title} (Copy)`,
      status: "DRAFT",
      registeredAttendees: 0,
      waitlistCount: 0,
      analytics: {
        views: 0,
        registrations: 0,
        attendanceRate: 0,
        topReferrers: []
      }
    })
    setIsCreateEventOpen(true)
  }

  const exportEvents = () => {
    const csvContent = [
      ["Title", "Type", "Status", "Start Date", "End Date", "Location", "Registered", "Max Capacity"],
      ...events.map(event => [
        event.title,
        event.type,
        event.status,
        event.startDate,
        event.endDate,
        event.isVirtual ? "Virtual" : event.location?.venue || "",
        event.registeredAttendees,
        event.maxAttendees || "Unlimited"
      ])
    ].map(row => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `events-export-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const getRegistrationStatusColor = (status: string) => {
    switch (status) {
      case "REGISTERED": return "bg-blue-100 text-blue-800"
      case "CONFIRMED": return "bg-green-100 text-green-800"
      case "CHECKED_IN": return "bg-purple-100 text-purple-800"
      case "ATTENDED": return "bg-emerald-100 text-emerald-800"
      case "CANCELLED": return "bg-red-100 text-red-800"
      case "NO_SHOW": return "bg-orange-100 text-orange-800"
      case "WAITLISTED": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Events Management</h1>
          <p className="text-muted-foreground">Organize and manage events, webinars, workshops, and conferences</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Use Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Choose Event Template</DialogTitle>
                <DialogDescription>Start with a pre-configured event template</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                {templates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:bg-muted/50" onClick={() => createEventFromTemplate(template)}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <CardDescription>{template.description}</CardDescription>
                        </div>
                        <Badge>{template.eventType}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>Category: {template.category}</span>
                        <span>Used {template.usageCount} times</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isCreateEventOpen} onOpenChange={setIsCreateEventOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
                <DialogDescription>Set up a new event with comprehensive settings</DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  <TabsTrigger value="seo">SEO & Social</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Event Title *</Label>
                      <Input 
                        id="title" 
                        placeholder="Enter event title"
                        value={newEvent.title || ""}
                        onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Event Type *</Label>
                      <Select value={newEvent.type} onValueChange={(value) => setNewEvent({...newEvent, type: value as Event['type']})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="WEBINAR">Webinar</SelectItem>
                          <SelectItem value="WORKSHOP">Workshop</SelectItem>
                          <SelectItem value="SEMINAR">Seminar</SelectItem>
                          <SelectItem value="FAIR">Fair</SelectItem>
                          <SelectItem value="MEETING">Meeting</SelectItem>
                          <SelectItem value="TRAINING">Training</SelectItem>
                          <SelectItem value="NETWORKING">Networking</SelectItem>
                          <SelectItem value="CONFERENCE">Conference</SelectItem>
                          <SelectItem value="EXPO">Expo</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Describe your event"
                      value={newEvent.description || ""}
                      onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                      rows={4}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Start Date & Time *</Label>
                      <Input 
                        id="startDate" 
                        type="datetime-local"
                        value={newEvent.startDate || ""}
                        onChange={(e) => setNewEvent({...newEvent, startDate: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date & Time *</Label>
                      <Input 
                        id="endDate" 
                        type="datetime-local"
                        value={newEvent.endDate || ""}
                        onChange={(e) => setNewEvent({...newEvent, endDate: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={newEvent.timezone} onValueChange={(value) => setNewEvent({...newEvent, timezone: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                        <SelectItem value="Europe/London">London (GMT)</SelectItem>
                        <SelectItem value="Europe/Paris">Central European Time</SelectItem>
                        <SelectItem value="Asia/Tokyo">Japan Standard Time</SelectItem>
                        <SelectItem value="Australia/Sydney">Australian Eastern Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
                
                <TabsContent value="details" className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="isVirtual"
                      checked={newEvent.isVirtual}
                      onCheckedChange={(checked) => setNewEvent({...newEvent, isVirtual: checked})}
                    />
                    <Label htmlFor="isVirtual">This is a virtual event</Label>
                  </div>
                  
                  {newEvent.isVirtual ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="platform">Virtual Platform</Label>
                        <Select value={newEvent.virtualSettings?.platform} onValueChange={(value) => setNewEvent({
                          ...newEvent, 
                          virtualSettings: {
                            ...newEvent.virtualSettings,
                            platform: value as Event['virtualSettings']['platform']
                          }
                        })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select platform" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ZOOM">Zoom</SelectItem>
                            <SelectItem value="TEAMS">Microsoft Teams</SelectItem>
                            <SelectItem value="GOOGLE_MEET">Google Meet</SelectItem>
                            <SelectItem value="WEBEX">Webex</SelectItem>
                            <SelectItem value="CUSTOM">Custom Platform</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="meetingUrl">Meeting URL</Label>
                        <Input 
                          id="meetingUrl" 
                          placeholder="https://zoom.us/j/..."
                          value={newEvent.virtualSettings?.meetingUrl || ""}
                          onChange={(e) => setNewEvent({
                            ...newEvent, 
                            virtualSettings: {
                              ...newEvent.virtualSettings,
                              meetingUrl: e.target.value
                            }
                          })}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="meetingId">Meeting ID</Label>
                          <Input 
                            id="meetingId" 
                            placeholder="123-456-789"
                            value={newEvent.virtualSettings?.meetingId || ""}
                            onChange={(e) => setNewEvent({
                              ...newEvent, 
                              virtualSettings: {
                                ...newEvent.virtualSettings,
                                meetingId: e.target.value
                              }
                            })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="password">Password</Label>
                          <Input 
                            id="password" 
                            type="password"
                            placeholder="Meeting password"
                            value={newEvent.virtualSettings?.password || ""}
                            onChange={(e) => setNewEvent({
                              ...newEvent, 
                              virtualSettings: {
                                ...newEvent.virtualSettings,
                                password: e.target.value
                              }
                            })}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id="recording"
                            checked={newEvent.virtualSettings?.recordingEnabled}
                            onCheckedChange={(checked) => setNewEvent({
                              ...newEvent, 
                              virtualSettings: {
                                ...newEvent.virtualSettings,
                                recordingEnabled: checked
                              }
                            })}
                          />
                          <Label htmlFor="recording">Enable Recording</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id="waitingRoom"
                            checked={newEvent.virtualSettings?.waitingRoom}
                            onCheckedChange={(checked) => setNewEvent({
                              ...newEvent, 
                              virtualSettings: {
                                ...newEvent.virtualSettings,
                                waitingRoom: checked
                              }
                            })}
                          />
                          <Label htmlFor="waitingRoom">Enable Waiting Room</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id="breakoutRooms"
                            checked={newEvent.virtualSettings?.breakoutRooms}
                            onCheckedChange={(checked) => setNewEvent({
                              ...newEvent, 
                              virtualSettings: {
                                ...newEvent.virtualSettings,
                                breakoutRooms: checked
                              }
                            })}
                          />
                          <Label htmlFor="breakoutRooms">Enable Breakout Rooms</Label>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="venue">Venue</Label>
                          <Input 
                            id="venue" 
                            placeholder="Venue name"
                            value={newEvent.location?.venue || ""}
                            onChange={(e) => setNewEvent({
                              ...newEvent, 
                              location: {
                                ...newEvent.location,
                                venue: e.target.value
                              }
                            })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="address">Address</Label>
                          <Input 
                            id="address" 
                            placeholder="Street address"
                            value={newEvent.location?.address || ""}
                            onChange={(e) => setNewEvent({
                              ...newEvent, 
                              location: {
                                ...newEvent.location,
                                address: e.target.value
                              }
                            })}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input 
                            id="city" 
                            placeholder="City"
                            value={newEvent.location?.city || ""}
                            onChange={(e) => setNewEvent({
                              ...newEvent, 
                              location: {
                                ...newEvent.location,
                                city: e.target.value
                              }
                            })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State/Province</Label>
                          <Input 
                            id="state" 
                            placeholder="State or province"
                            value={newEvent.location?.state || ""}
                            onChange={(e) => setNewEvent({
                              ...newEvent, 
                              location: {
                                ...newEvent.location,
                                state: e.target.value
                              }
                            })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="country">Country</Label>
                          <Input 
                            id="country" 
                            placeholder="Country"
                            value={newEvent.location?.country || ""}
                            onChange={(e) => setNewEvent({
                              ...newEvent, 
                              location: {
                                ...newEvent.location,
                                country: e.target.value
                              }
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="maxAttendees">Maximum Attendees</Label>
                      <Input 
                        id="maxAttendees" 
                        type="number"
                        placeholder="Leave empty for unlimited"
                        value={newEvent.maxAttendees || ""}
                        onChange={(e) => setNewEvent({...newEvent, maxAttendees: e.target.value ? parseInt(e.target.value) : undefined})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Input 
                        id="category" 
                        placeholder="e.g., Information Session, Workshop"
                        value={newEvent.category || ""}
                        onChange={(e) => setNewEvent({...newEvent, category: e.target.value})}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="settings" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="visibility">Visibility</Label>
                      <Select value={newEvent.visibility} onValueChange={(value) => setNewEvent({...newEvent, visibility: value as Event['visibility']})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PUBLIC">Public</SelectItem>
                          <SelectItem value="PRIVATE">Private</SelectItem>
                          <SelectItem value="INVITE_ONLY">Invite Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={newEvent.status} onValueChange={(value) => setNewEvent({...newEvent, status: value as Event['status']})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DRAFT">Draft</SelectItem>
                          <SelectItem value="PUBLISHED">Published</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="waitlist"
                          checked={newEvent.waitlistEnabled}
                          onCheckedChange={(checked) => setNewEvent({...newEvent, waitlistEnabled: checked})}
                        />
                        <Label htmlFor="waitlist">Enable Waitlist</Label>
                      </div>
                      <span className="text-sm text-muted-foreground">Allow waitlisting when event is full</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="approval"
                          checked={newEvent.requiresApproval}
                          onCheckedChange={(checked) => setNewEvent({...newEvent, requiresApproval: checked})}
                        />
                        <Label htmlFor="approval">Require Approval</Label>
                      </div>
                      <span className="text-sm text-muted-foreground">Manual approval for registrations</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="cancellations"
                          checked={newEvent.allowCancellations}
                          onCheckedChange={(checked) => setNewEvent({...newEvent, allowCancellations: checked})}
                        />
                        <Label htmlFor="cancellations">Allow Cancellations</Label>
                      </div>
                      <span className="text-sm text-muted-foreground">Let attendees cancel their registration</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="certificate"
                          checked={newEvent.certificateEnabled}
                          onCheckedChange={(checked) => setNewEvent({...newEvent, certificateEnabled: checked})}
                        />
                        <Label htmlFor="certificate">Enable Certificates</Label>
                      </div>
                      <span className="text-sm text-muted-foreground">Issue certificates for attendance</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="feedback"
                          checked={newEvent.feedbackEnabled}
                          onCheckedChange={(checked) => setNewEvent({...newEvent, feedbackEnabled: checked})}
                        />
                        <Label htmlFor="feedback">Enable Feedback</Label>
                      </div>
                      <span className="text-sm text-muted-foreground">Collect feedback after event</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="survey"
                          checked={newEvent.surveyEnabled}
                          onCheckedChange={(checked) => setNewEvent({...newEvent, surveyEnabled: checked})}
                        />
                        <Label htmlFor="survey">Enable Survey</Label>
                      </div>
                      <span className="text-sm text-muted-foreground">Send post-event survey</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="networking"
                          checked={newEvent.networkingEnabled}
                          onCheckedChange={(checked) => setNewEvent({...newEvent, networkingEnabled: checked})}
                        />
                        <Label htmlFor="networking">Enable Networking</Label>
                      </div>
                      <span className="text-sm text-muted-foreground">Allow attendee networking</span>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="advanced" className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="isFree"
                      checked={newEvent.pricing?.isFree}
                      onCheckedChange={(checked) => setNewEvent({
                        ...newEvent, 
                        pricing: {
                          ...newEvent.pricing,
                          isFree: checked
                        }
                      })}
                    />
                    <Label htmlFor="isFree">Free Event</Label>
                  </div>
                  
                  {!newEvent.pricing?.isFree && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="currency">Currency</Label>
                          <Select value={newEvent.pricing?.currency} onValueChange={(value) => setNewEvent({
                            ...newEvent, 
                            pricing: {
                              ...newEvent.pricing,
                              currency: value
                            }
                          })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USD">USD ($)</SelectItem>
                              <SelectItem value="EUR">EUR (€)</SelectItem>
                              <SelectItem value="GBP">GBP (£)</SelectItem>
                              <SelectItem value="CAD">CAD (C$)</SelectItem>
                              <SelectItem value="AUD">AUD (A$)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="regularPrice">Regular Price</Label>
                          <Input 
                            id="regularPrice" 
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={newEvent.pricing?.regularPrice || ""}
                            onChange={(e) => setNewEvent({
                              ...newEvent, 
                              pricing: {
                                ...newEvent.pricing,
                                regularPrice: e.target.value ? parseFloat(e.target.value) : undefined
                              }
                            })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="earlyBirdPrice">Early Bird Price</Label>
                          <Input 
                            id="earlyBirdPrice" 
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={newEvent.pricing?.earlyBirdPrice || ""}
                            onChange={(e) => setNewEvent({
                              ...newEvent, 
                              pricing: {
                                ...newEvent.pricing,
                                earlyBirdPrice: e.target.value ? parseFloat(e.target.value) : undefined
                              }
                            })}
                          />
                        </div>
                      </div>
                      
                      {newEvent.pricing?.earlyBirdPrice && (
                        <div>
                          <Label htmlFor="earlyBirdDeadline">Early Bird Deadline</Label>
                          <Input 
                            id="earlyBirdDeadline" 
                            type="datetime-local"
                            value={newEvent.pricing?.earlyBirdDeadline || ""}
                            onChange={(e) => setNewEvent({
                              ...newEvent, 
                              pricing: {
                                ...newEvent.pricing,
                                earlyBirdDeadline: e.target.value
                              }
                            })}
                          />
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input 
                      id="tags" 
                      placeholder="e.g., webinar, education, study abroad"
                      value={newEvent.tags?.join(", ") || ""}
                      onChange={(e) => setNewEvent({...newEvent, tags: e.target.value.split(",").map(tag => tag.trim()).filter(tag => tag)})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
                    <Textarea 
                      id="cancellationPolicy" 
                      placeholder="Describe your cancellation policy"
                      value={newEvent.cancellationPolicy || ""}
                      onChange={(e) => setNewEvent({...newEvent, cancellationPolicy: e.target.value})}
                      rows={3}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="seo" className="space-y-4">
                  <div>
                    <Label htmlFor="metaTitle">SEO Title</Label>
                    <Input 
                      id="metaTitle" 
                      placeholder="SEO optimized title"
                      value={newEvent.seo?.metaTitle || ""}
                      onChange={(e) => setNewEvent({
                        ...newEvent, 
                        seo: {
                          ...newEvent.seo,
                          metaTitle: e.target.value
                        }
                      })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="metaDescription">Meta Description</Label>
                    <Textarea 
                      id="metaDescription" 
                      placeholder="SEO description for search engines"
                      value={newEvent.seo?.metaDescription || ""}
                      onChange={(e) => setNewEvent({
                        ...newEvent, 
                        seo: {
                          ...newEvent.seo,
                          metaDescription: e.target.value
                        }
                      })}
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                    <Input 
                      id="keywords" 
                      placeholder="e.g., study abroad, education, webinar"
                      value={newEvent.seo?.keywords?.join(", ") || ""}
                      onChange={(e) => setNewEvent({
                        ...newEvent, 
                        seo: {
                          ...newEvent.seo,
                          keywords: e.target.value.split(",").map(keyword => keyword.trim()).filter(keyword => keyword)
                        }
                      })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="hashtag">Social Media Hashtag</Label>
                    <Input 
                      id="hashtag" 
                      placeholder="e.g., #StudyAbroad2024"
                      value={newEvent.socialMedia?.hashtag || ""}
                      onChange={(e) => setNewEvent({
                        ...newEvent, 
                        socialMedia: {
                          ...newEvent.socialMedia,
                          hashtag: e.target.value
                        }
                      })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="facebookUrl">Facebook URL</Label>
                      <Input 
                        id="facebookUrl" 
                        placeholder="https://facebook.com/..."
                        value={newEvent.socialMedia?.facebookUrl || ""}
                        onChange={(e) => setNewEvent({
                          ...newEvent, 
                          socialMedia: {
                            ...newEvent.socialMedia,
                            facebookUrl: e.target.value
                          }
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="twitterUrl">Twitter URL</Label>
                      <Input 
                        id="twitterUrl" 
                        placeholder="https://twitter.com/..."
                        value={newEvent.socialMedia?.twitterUrl || ""}
                        onChange={(e) => setNewEvent({
                          ...newEvent, 
                          socialMedia: {
                            ...newEvent.socialMedia,
                            twitterUrl: e.target.value
                          }
                        })}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateEventOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateEvent} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Create Event
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 lg:grid-cols-6 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground">
              {upcomingEvents.length} upcoming
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRegistrations}</div>
            <p className="text-xs text-muted-foreground">
              Across all events
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingEvents.length}</div>
            <p className="text-xs text-muted-foreground">
              Next 30 days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Virtual Events</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.filter(e => e.isVirtual).length}</div>
            <p className="text-xs text-muted-foreground">
              Online events
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total revenue
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Attendance</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {events.length > 0 ? Math.round(events.reduce((sum, event) => sum + (event.analytics.attendanceRate || 0), 0) / events.length) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Attendance rate
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="events" className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="registrations">Registrations</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <div className="flex rounded-md shadow-sm">
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-r-none"
              >
                List
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-none"
              >
                Grid
              </Button>
              <Button
                variant={viewMode === "calendar" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("calendar")}
                className="rounded-l-none"
              >
                Calendar
              </Button>
            </div>
          </div>
        </div>

        <TabsContent value="events" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="ONGOING">Ongoing</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="POSTPONED">Postponed</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="WEBINAR">Webinar</SelectItem>
                  <SelectItem value="WORKSHOP">Workshop</SelectItem>
                  <SelectItem value="SEMINAR">Seminar</SelectItem>
                  <SelectItem value="FAIR">Fair</SelectItem>
                  <SelectItem value="MEETING">Meeting</SelectItem>
                  <SelectItem value="TRAINING">Training</SelectItem>
                  <SelectItem value="NETWORKING">Networking</SelectItem>
                  <SelectItem value="CONFERENCE">Conference</SelectItem>
                  <SelectItem value="EXPO">Expo</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Information Session">Information Session</SelectItem>
                  <SelectItem value="Education Fair">Education Fair</SelectItem>
                  <SelectItem value="Workshop">Workshop</SelectItem>
                  <SelectItem value="Networking">Networking</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="past">Past</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button variant="outline" onClick={exportEvents}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Events Display */}
          {viewMode === "list" && (
            <Card>
              <CardHeader>
                <CardTitle>Events</CardTitle>
                <CardDescription>Manage your events and track registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Registrations</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{event.title}</div>
                            <div className="text-sm text-muted-foreground">{event.category}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(event.type)}
                            <Badge className={getTypeColor(event.type)}>
                              {event.type}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(event.status)}>
                            {event.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm">{format(new Date(event.startDate), "MMM d, yyyy")}</div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(event.startDate), "h:mm a")} - {format(new Date(event.endDate), "h:mm a")}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {event.isVirtual ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                            <span className="text-sm">
                              {event.isVirtual ? "Virtual" : event.location?.city}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {event.registeredAttendees}{event.maxAttendees && `/${event.maxAttendees}`}
                            {event.waitlistCount > 0 && (
                              <div className="text-xs text-orange-600">
                                {event.waitlistCount} waitlisted
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedEvent(event)
                                setIsViewEventOpen(true)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedEvent(event)
                                setIsEditEventOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => duplicateEvent(event)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {viewMode === "grid" && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(event.type)}
                        <Badge className={getTypeColor(event.type)}>
                          {event.type}
                        </Badge>
                      </div>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <CardDescription>{event.description.substring(0, 100)}...</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{format(new Date(event.startDate), "MMM d, yyyy h:mm a")}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        {event.isVirtual ? (
                          <>
                            <Video className="h-4 w-4" />
                            <span>Virtual Event</span>
                          </>
                        ) : (
                          <>
                            <MapPin className="h-4 w-4" />
                            <span>{event.location?.city}, {event.location?.country}</span>
                          </>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4" />
                        <span>{event.registeredAttendees} registered</span>
                        {event.maxAttendees && (
                          <span className="text-muted-foreground">/ {event.maxAttendees}</span>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center pt-2">
                        <div className="flex gap-1">
                          {event.tags.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedEvent(event)
                              setIsViewEventOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedEvent(event)
                              setIsEditEventOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {viewMode === "calendar" && (
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Calendar View</CardTitle>
                  <CardDescription>Click on a date to see events</CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>
                    Events for {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Selected Date"}
                  </CardTitle>
                  <CardDescription>
                    {selectedDate ? getEventsForDate(selectedDate).length : 0} events scheduled
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedDate && getEventsForDate(selectedDate).map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(event.type)}
                          <div>
                            <div className="font-medium">{event.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(event.startDate), "h:mm a")} - {format(new Date(event.endDate), "h:mm a")}
                            </div>
                          </div>
                        </div>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status}
                        </Badge>
                      </div>
                    ))}
                    {selectedDate && getEventsForDate(selectedDate).length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No events scheduled for this date
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="registrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Registrations</CardTitle>
              <CardDescription>Manage attendee registrations across all events</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Attendee</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.map((registration) => {
                    const event = events.find(e => e.id === registration.eventId)
                    return (
                      <TableRow key={registration.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{registration.studentName}</div>
                            <div className="text-sm text-muted-foreground">{registration.studentEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{event?.title}</div>
                          <div className="text-sm text-muted-foreground">{event?.type}</div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(registration.registrationDate), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <Badge className={getRegistrationStatusColor(registration.status)}>
                            {registration.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            registration.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                            registration.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            registration.paymentStatus === 'REFUNDED' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {registration.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {registration.checkInTime ? (
                            <div className="text-sm">
                              <div>{format(new Date(registration.checkInTime), "MMM d, h:mm a")}</div>
                              <div className="text-xs text-muted-foreground">{registration.checkInMethod}</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Calendar</CardTitle>
                <CardDescription>Full calendar view of all events</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Next 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {events
                    .filter(event => new Date(event.startDate) > new Date())
                    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                    .slice(0, 7)
                    .map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(event.type)}
                          <div>
                            <div className="font-medium">{event.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(event.startDate), "MMM d, h:mm a")}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(event.status)}>
                            {event.status}
                          </Badge>
                          <div className="text-sm text-muted-foreground mt-1">
                            {event.registeredAttendees} registered
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {events.reduce((sum, event) => sum + event.analytics.views, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Page views</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {events.length > 0 ? 
                    Math.round((events.reduce((sum, event) => sum + event.analytics.registrations, 0) / 
                    events.reduce((sum, event) => sum + event.analytics.views, 0)) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">Views to registrations</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Avg. Satisfaction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {events.length > 0 ? 
                    (events.reduce((sum, event) => sum + (event.analytics.satisfactionScore || 0), 0) / events.length).toFixed(1) : 
                    '0.0'}
                </div>
                <p className="text-xs text-muted-foreground">Out of 5.0</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Top Referrer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {events.length > 0 && events[0].analytics.topReferrers[0] ? 
                    events[0].analytics.topReferrers[0] : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">Traffic source</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Performance</CardTitle>
                <CardDescription>Registration and attendance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events.slice(0, 5).map((event) => (
                    <div key={event.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{event.title}</span>
                        <span className="text-sm text-muted-foreground">
                          {event.analytics.attendanceRate}% attendance
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <div className="text-xs text-muted-foreground mb-1">Registrations</div>
                          <Progress value={(event.analytics.registrations / (event.maxAttendees || 100)) * 100} className="h-2" />
                          <div className="text-xs text-muted-foreground mt-1">
                            {event.analytics.registrations}/{event.maxAttendees || '∞'}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-muted-foreground mb-1">Attendance Rate</div>
                          <Progress value={event.analytics.attendanceRate} className="h-2" />
                          <div className="text-xs text-muted-foreground mt-1">
                            {event.analytics.attendanceRate}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Event Type</CardTitle>
                <CardDescription>Breakdown of revenue generation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['WEBINAR', 'WORKSHOP', 'FAIR', 'CONFERENCE'].map((type) => {
                    const typeEvents = events.filter(e => e.type === type && !e.pricing.isFree)
                    const revenue = typeEvents.reduce((sum, event) => {
                      const avgPrice = (event.pricing.regularPrice || 0 + event.pricing.earlyBirdPrice || 0) / 2
                      return sum + (event.registeredAttendees * avgPrice)
                    }, 0)
                    
                    return (
                      <div key={type} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(type)}
                          <span className="text-sm">{type}</span>
                        </div>
                        <span className="font-medium">${revenue.toLocaleString()}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Templates</CardTitle>
              <CardDescription>Save time by using pre-configured event templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <CardDescription>{template.description}</CardDescription>
                        </div>
                        <Badge>{template.eventType}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span>Category:</span>
                          <span className="font-medium">{template.category}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span>Usage:</span>
                          <span className="font-medium">{template.usageCount} times</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span>Visibility:</span>
                          <Badge variant={template.isPublic ? "default" : "secondary"}>
                            {template.isPublic ? "Public" : "Private"}
                          </Badge>
                        </div>
                        <Button 
                          className="w-full mt-4" 
                          onClick={() => createEventFromTemplate(template)}
                        >
                          Use Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Plus className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Create Template</h3>
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      Save your event configurations as reusable templates
                    </p>
                    <Button variant="outline">
                      Create Template
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Event Dialog */}
      <Dialog open={isViewEventOpen} onOpenChange={setIsViewEventOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
            <DialogDescription>Event details and management</DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <Badge className={getTypeColor(selectedEvent.type)}>
                        {selectedEvent.type}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge className={getStatusColor(selectedEvent.status)}>
                        {selectedEvent.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category:</span>
                      <span>{selectedEvent.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Visibility:</span>
                      <span>{selectedEvent.visibility}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Date & Time</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Start:</span>
                      <span>{format(new Date(selectedEvent.startDate), "MMM d, yyyy h:mm a")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">End:</span>
                      <span>{format(new Date(selectedEvent.endDate), "MMM d, yyyy h:mm a")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Timezone:</span>
                      <span>{selectedEvent.timezone}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Location */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Location</h3>
                {selectedEvent.isVirtual ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      <span>Virtual Event</span>
                    </div>
                    {selectedEvent.virtualSettings?.meetingUrl && (
                      <div className="flex items-center gap-2">
                        <Link className="h-4 w-4" />
                        <a href={selectedEvent.virtualSettings.meetingUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          Join Meeting
                        </a>
                      </div>
                    )}
                    {selectedEvent.virtualSettings?.platform && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Platform:</span>
                        <span>{selectedEvent.virtualSettings.platform}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedEvent.location?.venue}</span>
                    </div>
                    <div>{selectedEvent.location?.address}</div>
                    <div>{selectedEvent.location?.city}, {selectedEvent.location?.state} {selectedEvent.location?.postalCode}</div>
                    <div>{selectedEvent.location?.country}</div>
                  </div>
                )}
              </div>
              
              {/* Registration Info */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Registration Information</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{selectedEvent.registeredAttendees}</div>
                    <div className="text-sm text-muted-foreground">Registered</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{selectedEvent.maxAttendees || '∞'}</div>
                    <div className="text-sm text-muted-foreground">Capacity</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">
                      {selectedEvent.maxAttendees ? 
                        Math.round((selectedEvent.registeredAttendees / selectedEvent.maxAttendees) * 100) : 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Filled</div>
                  </div>
                </div>
              </div>
              
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <p className="text-muted-foreground">{selectedEvent.description}</p>
              </div>
              
              {/* Tags */}
              {selectedEvent.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewEventOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsViewEventOpen(false)
              setIsEditEventOpen(true)
            }}>
              Edit Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}