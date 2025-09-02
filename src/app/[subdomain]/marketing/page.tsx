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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Plus,
  Search,
  Filter,
  Play,
  Pause,
  Settings,
  Users,
  Mail,
  MessageSquare,
  Share2,
  Target,
  TrendingUp,
  Calendar,
  BarChart3,
  Zap,
  Workflow,
  FileText,
  Edit,
  Trash2,
  Copy,
  Eye,
  MoreHorizontal,
  CheckCircle,
  Loader2,
  AlertTriangle,
  Phone,
  MessageCircle,
  Send,
  Smartphone,
  Wifi,
  Megaphone,
  Users2,
  Fingerprint,
  Hash,
  Link2,
  Globe,
  Image,
  Video,
  File,
  Music,
  Volume2,
  Bell,
  Clock,
  MapPin,
  Gift,
  Star,
  Award,
  Trophy,
  Medal,
  Crown,
  Gem,
  Diamond,
  Circle,
  Square,
  Triangle,
  Hexagon,
  Pentagon,
  Octagon,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ArrowUpRight,
  ArrowUpLeft,
  ArrowDownRight,
  ArrowDownLeft,
  Minus,
  Plus as PlusIcon,
  Divide,
  Multiply,
  Equal,
  NotEqual,
  GreaterThan,
  LessThan,
  GreaterThanOrEqual,
  LessThanOrEqual,
  Parentheses,
  Bracket,
  Brace,
  AngleBracket,
  Quote,
  DoubleQuote,
  Apostrophe,
  Hyphen,
  Underscore,
  Dot,
  Comma,
  Semicolon,
  Colon,
  Exclamation,
  Question,
  Hash,
  Dollar,
  Percent,
  Ampersand,
  Asterisk,
  Slash,
  Backslash,
  Pipe,
  Tilde,
  Grave,
  Circumflex,
  Degree,
  PlusMinus,
  Infinity,
  Pi,
  Sigma,
  Omega,
  Alpha,
  Beta,
  Gamma,
  Delta,
  Epsilon,
  Zeta,
  Eta,
  Theta,
  Iota,
  Kappa,
  Lambda,
  Mu,
  Nu,
  Xi,
  Omicron,
  Rho,
  Sigma as SigmaIcon,
  Tau,
  Upsilon,
  Phi,
  Chi,
  Psi,
  Omega as OmegaIcon,
  Brain,
  Repeat,
  Globe as WorldIcon,
  Chrome,
  Firefox,
  Safari,
  Edge,
  Android,
  Apple,
  Windows,
  Linux,
  Code,
  Database,
  Server,
  Cloud,
  Lock,
  Unlock,
  Key,
  Shield,
  Bluetooth,
  Radio,
  Tv,
  Gamepad2,
  Headphones,
  Watch,
  Car,
  Plane,
  Train,
  Ship,
  Bike,
  Home,
  Building,
  Store,
  Utensils,
  Coffee,
  Pizza,
  Heart,
  Smile,
  Frown,
  Meh,
  Angry,
  Laugh,
  Kiss,
  Star as StarIcon,
  Sun,
  Moon,
  CloudRain,
  CloudSnow,
  Wind,
  Thermometer,
  Droplets,
  Zap as ZapIcon,
  Battery,
  Plug,
  Printer,
  Camera,
  Mic,
  VolumeX,
  Mail as EmailIcon,
  MessageSquare as SmsIcon,
  MessageCircle as WhatsAppIcon,
  Share2 as SocialIcon,
  BarChart3 as AnalyticsIcon,
  Workflow as AutomationIcon,
  Image as DesignIcon,
  Users as CrmIcon
} from "lucide-react"

interface Campaign {
  id: string
  name: string
  description?: string
  type: 'EMAIL' | 'SMS' | 'WHATSAPP' | 'SOCIAL_MEDIA' | 'CONTENT' | 'WEBINAR' | 'EVENT'
  status: 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
  sentCount: number
  deliveredCount: number
  openedCount: number
  clickedCount: number
  conversionCount: number
  scheduledAt?: string
  startedAt?: string
  completedAt?: string
  workflow?: {
    id: string
    name: string
  }
  targetAudience?: any
  content?: any
  channel: 'EMAIL' | 'SMS' | 'WHATSAPP' | 'SOCIAL_MEDIA' | 'SEARCH' | 'DISPLAY' | 'VIDEO' | 'CONTENT'
  tools: string[]
  tags: string[]
}

interface Lead {
  id: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  source: string
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'NURTURING' | 'CONVERTED' | 'LOST'
  converted: boolean
  convertedAt?: string
  createdAt: string
  assignedTo?: string
  customFields?: any
  campaign?: {
    id: string
    name: string
  }
  preferredChannels: string[]
  engagementScore: number
  lastContacted?: string
}

interface Workflow {
  id: string
  name: string
  description?: string
  category: 'GENERAL' | 'LEAD_NURTURING' | 'STUDENT_ONBOARDING' | 'FOLLOW_UP' | 'NOTIFICATION' | 'INTEGRATION' | 'EMAIL_MARKETING' | 'SMS_MARKETING' | 'WHATSAPP_MARKETING'
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED'
  isActive: boolean
  executionCount: number
  lastExecutedAt?: string
  nodes: any[]
  edges: any[]
}

interface MarketingTool {
  id: string
  name: string
  description: string
  category: 'EMAIL' | 'SMS' | 'WHATSAPP' | 'SOCIAL_MEDIA' | 'ANALYTICS' | 'AUTOMATION' | 'DESIGN' | 'CRM'
  type: 'NATIVE' | 'INTEGRATION' | 'THIRD_PARTY'
  status: 'ACTIVE' | 'INACTIVE' | 'BETA'
  icon: any
  features: string[]
  pricing?: string
  website?: string
  isConnected: boolean
  lastSynced?: string
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  category: string
  isDefault: boolean
  usageCount: number
  createdAt: string
  updatedAt: string
}

interface SmsTemplate {
  id: string
  name: string
  content: string
  category: string
  isDefault: boolean
  usageCount: number
  createdAt: string
  updatedAt: string
}

interface WhatsAppTemplate {
  id: string
  name: string
  content: string
  category: string
  isDefault: boolean
  usageCount: number
  createdAt: string
  updatedAt: string
}

interface EmailCampaign {
  id: string
  name: string
  description?: string
  subject: string
  previewText?: string
  fromName: string
  fromEmail: string
  status: 'DRAFT' | 'SCHEDULED' | 'SENT' | 'FAILED'
  sentAt?: string
  scheduledAt?: string
  targetAudience: string
  templateId?: string
  analytics: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    bounced: number
    unsubscribed: number
  }
}

interface SmsCampaign {
  id: string
  name: string
  description?: string
  message: string
  status: 'DRAFT' | 'SCHEDULED' | 'SENT' | 'FAILED'
  sentAt?: string
  scheduledAt?: string
  targetAudience: string
  templateId?: string
  analytics: {
    sent: number
    delivered: number
    failed: number
    optOut: number
  }
}

interface WhatsAppCampaign {
  id: string
  name: string
  description?: string
  message: string
  mediaUrl?: string
  status: 'DRAFT' | 'SCHEDULED' | 'SENT' | 'FAILED'
  sentAt?: string
  scheduledAt?: string
  targetAudience: string
  templateId?: string
  analytics: {
    sent: number
    delivered: number
    read: number
    replied: number
    failed: number
  }
}

export default function MarketingPage() {
  const params = useParams()
  const subdomain = params.subdomain as string
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [tools, setTools] = useState<MarketingTool[]>([])
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([])
  const [smsTemplates, setSmsTemplates] = useState<SmsTemplate[]>([])
  const [whatsappTemplates, setWhatsappTemplates] = useState<WhatsAppTemplate[]>([])
  const [emailCampaigns, setEmailCampaigns] = useState<EmailCampaign[]>([])
  const [smsCampaigns, setSmsCampaigns] = useState<SmsCampaign[]>([])
  const [whatsappCampaigns, setWhatsappCampaigns] = useState<WhatsAppCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false)
  const [isCreateLeadOpen, setIsCreateLeadOpen] = useState(false)
  const [isCreateWorkflowOpen, setIsCreateWorkflowOpen] = useState(false)
  const [isCreateEmailCampaignOpen, setIsCreateEmailCampaignOpen] = useState(false)
  const [isCreateSmsCampaignOpen, setIsCreateSmsCampaignOpen] = useState(false)
  const [isCreateWhatsappCampaignOpen, setIsCreateWhatsappCampaignOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [channelFilter, setChannelFilter] = useState("all")

  // Form states
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    description: "",
    type: "EMAIL" as Campaign['type'],
    channel: "EMAIL" as Campaign['channel'],
    targetAudience: [] as any[],
    content: {} as any,
    workflowId: "",
    scheduledAt: "",
    tools: [] as string[],
    tags: [] as string[]
  })

  const [newLead, setNewLead] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    source: "",
    status: "NEW" as Lead['status'],
    assignedTo: "",
    customFields: {} as any,
    campaignId: "",
    preferredChannels: [] as string[]
  })

  const [newWorkflow, setNewWorkflow] = useState({
    name: "",
    description: "",
    category: "EMAIL_MARKETING" as Workflow['category'],
    triggers: [] as any[],
    nodes: [] as any[],
    edges: [] as any[],
    isActive: false
  })

  const [newEmailCampaign, setNewEmailCampaign] = useState({
    name: "",
    description: "",
    subject: "",
    previewText: "",
    fromName: "",
    fromEmail: "",
    targetAudience: "",
    templateId: "",
    scheduledAt: ""
  })

  const [newSmsCampaign, setNewSmsCampaign] = useState({
    name: "",
    description: "",
    message: "",
    targetAudience: "",
    templateId: "",
    scheduledAt: ""
  })

  const [newWhatsappCampaign, setNewWhatsappCampaign] = useState({
    name: "",
    description: "",
    message: "",
    mediaUrl: "",
    targetAudience: "",
    templateId: "",
    scheduledAt: ""
  })

  // Enhanced marketing tools data
  const marketingTools: MarketingTool[] = [
    {
      id: "email-studio",
      name: "Email Studio Pro",
      description: "Advanced email marketing automation with drag-and-drop editor, A/B testing, and personalization",
      category: "EMAIL",
      type: "NATIVE",
      status: "ACTIVE",
      icon: EmailIcon,
      features: ["Drag & Drop Editor", "A/B Testing", "Advanced Analytics", "Autoresponders", "Segmentation", "Personalization", "Template Library", "Spam Testing"],
      isConnected: true,
      lastSynced: new Date().toISOString()
    },
    {
      id: "sms-pro",
      name: "SMS Pro",
      description: "Professional SMS marketing with delivery tracking, scheduling, and automation",
      category: "SMS",
      type: "NATIVE",
      status: "ACTIVE",
      icon: SmsIcon,
      features: ["Bulk SMS", "Delivery Reports", "Scheduling", "Templates", "Analytics", "Auto-responders", "Segmentation", "Opt-out Management"],
      isConnected: true,
      lastSynced: new Date().toISOString()
    },
    {
      id: "whatsapp-business",
      name: "WhatsApp Business Platform",
      description: "Official WhatsApp Business API integration with template management and chatbots",
      category: "WHATSAPP",
      type: "INTEGRATION",
      status: "ACTIVE",
      icon: WhatsAppIcon,
      features: ["Business API", "Template Messages", "Media Support", "Analytics", "Chatbots", "Broadcast Lists", "Quick Replies", "Location Sharing"],
      isConnected: false
    },
    {
      id: "social-hub",
      name: "Social Hub Pro",
      description: "Comprehensive social media management, scheduling, and analytics across all platforms",
      category: "SOCIAL_MEDIA",
      type: "THIRD_PARTY",
      status: "ACTIVE",
      icon: SocialIcon,
      features: ["Multi-platform Support", "Content Scheduling", "Advanced Analytics", "Content Calendar", "Team Collaboration", "Social Listening", "Competitor Analysis", "ROI Tracking"],
      isConnected: true,
      lastSynced: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: "analytics-pro",
      name: "Marketing Analytics Pro",
      description: "Advanced marketing analytics with real-time reporting, funnel analysis, and ROI tracking",
      category: "ANALYTICS",
      type: "NATIVE",
      status: "ACTIVE",
      icon: AnalyticsIcon,
      features: ["Real-time Analytics", "Custom Reports", "ROI Tracking", "Funnel Analysis", "Dashboards", "Cohort Analysis", "Attribution Modeling", "Predictive Analytics"],
      isConnected: true,
      lastSynced: new Date().toISOString()
    },
    {
      id: "marketing-automation",
      name: "Marketing Automation Studio",
      description: "Visual workflow builder for marketing automation with advanced triggers and actions",
      category: "AUTOMATION",
      type: "NATIVE",
      status: "ACTIVE",
      icon: AutomationIcon,
      features: ["Visual Workflow Builder", "Advanced Triggers", "Multi-channel Actions", "Conditions", "Analytics", "Lead Scoring", "Drip Campaigns", "Behavioral Targeting"],
      isConnected: true,
      lastSynced: new Date().toISOString()
    },
    {
      id: "design-studio",
      name: "Design Studio Pro",
      description: "Professional design tools for creating marketing materials, social media graphics, and email templates",
      category: "DESIGN",
      type: "THIRD_PARTY",
      status: "BETA",
      icon: DesignIcon,
      features: ["Template Library", "Advanced Image Editor", "Brand Kit Management", "Team Collaboration", "Export Options", "AI Design Assistant", "Stock Photos", "Font Management"],
      isConnected: false
    },
    {
      id: "crm-pro",
      name: "CRM Pro Integration",
      description: "Comprehensive CRM integration for contact management, lead scoring, and pipeline tracking",
      category: "CRM",
      type: "INTEGRATION",
      status: "ACTIVE",
      icon: CrmIcon,
      features: ["Contact Management", "Lead Scoring", "Pipeline Management", "Advanced Reporting", "Multi-channel Integration", "Automation Rules", "Custom Fields", "Team Management"],
      isConnected: true,
      lastSynced: new Date(Date.now() - 7200000).toISOString()
    }
  ]

  // Enhanced templates data
  const mockEmailTemplates: EmailTemplate[] = [
    {
      id: "welcome-email",
      name: "Welcome Email Series",
      subject: "Welcome to {{agency_name}} - Your Educational Journey Begins! 🎓",
      content: `<html>
        <body>
          <h2>Welcome to {{agency_name}}, {{name}}! 👋</h2>
          <p>We're thrilled to welcome you to our educational community. Your journey towards academic excellence starts now!</p>
          <h3>What's Next?</h3>
          <ul>
            <li>✨ Personalized consultation within 24 hours</li>
            <li>📚 Access to exclusive resources</li>
            <li>🎯 Customized educational pathway</li>
          </ul>
          <p>Get started by exploring our <a href="{{programs_link}}">featured programs</a>.</p>
          <p>Best regards,<br/>The {{agency_name}} Team</p>
        </body>
      </html>`,
      category: "Welcome",
      isDefault: true,
      usageCount: 150,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "follow-up-email",
      name: "Intelligent Follow-up",
      subject: "Following up on your {{program_type}} inquiry 📧",
      content: `<html>
        <body>
          <h2>Hi {{name}},</h2>
          <p>Hope you're doing well! I wanted to follow up on your recent inquiry about {{program_type}} programs.</p>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3>🎯 Quick Reminder:</h3>
            <p>Program: {{program_name}}</p>
            <p>Deadline: {{application_deadline}}</p>
            <p>Special offer: {{special_offer}}</p>
          </div>
          <p>Would you like to schedule a quick call to discuss your options?</p>
          <p><a href="{{schedule_link}}" style="background: #007cba; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Schedule a Call</a></p>
          <p>Best regards,<br/>{{consultant_name}}<br/>{{agency_name}}</p>
        </body>
      </html>`,
      category: "Follow Up",
      isDefault: false,
      usageCount: 89,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "newsletter-email",
      name: "Monthly Newsletter",
      subject: "{{agency_name}} Monthly Update - {{month}} {{year}} 📰",
      content: `<html>
        <body>
          <h2>{{agency_name}} Monthly Newsletter</h2>
          <p>Hello {{name}},</p>
          <p>Here's what's new this month at {{agency_name}}:</p>
          
          <h3>🎓 New Programs Added</h3>
          <ul>
            {{new_programs_list}}
          </ul>
          
          <h3>🏆 Success Stories</h3>
          <p>{{success_story}}</p>
          
          <h3>📅 Upcoming Events</h3>
          <ul>
            {{upcoming_events_list}}
          </ul>
          
          <h3>💡 Tips & Resources</h3>
          <p>{{monthly_tips}}</p>
          
          <p>Stay connected with us!</p>
          <p>Best regards,<br/>The {{agency_name}} Team</p>
        </body>
      </html>`,
      category: "Newsletter",
      isDefault: false,
      usageCount: 234,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]

  const mockSmsTemplates: SmsTemplate[] = [
    {
      id: "welcome-sms",
      name: "Welcome SMS",
      content: "Welcome to {{agency_name}}! 🎓 We're excited to help you with your educational journey. Your consultant {{consultant_name}} will contact you soon. Reply STOP to unsubscribe.",
      category: "Welcome",
      isDefault: true,
      usageCount: 200,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "appointment-reminder",
      name: "Appointment Reminder",
      content: "Hi {{name}}, reminder about your appointment on {{date}} at {{time}} with {{consultant_name}}. Location: {{location}}. Reply C to confirm, R to reschedule.",
      category: "Reminder",
      isDefault: false,
      usageCount: 120,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "application-update",
      name: "Application Status Update",
      content: "Hi {{name}}, your {{program}} application status has been updated to: {{status}}. Login to your portal for details: {{portal_link}}. Questions? Call {{support_number}}.",
      category: "Update",
      isDefault: false,
      usageCount: 95,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]

  const mockWhatsappTemplates: WhatsAppTemplate[] = [
    {
      id: "welcome-whatsapp",
      name: "Welcome Message",
      content: "Hello {{name}}! 👋 Welcome to {{agency_name}}! We're excited to help you with your educational journey. Your personal consultant {{consultant_name}} will contact you within 24 hours. How can we assist you today?",
      category: "Welcome",
      isDefault: true,
      usageCount: 75,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "document-request",
      name: "Document Request",
      content: "Hi {{name}}! 📄 To proceed with your {{program}} application, we need the following documents:\n1. {{document_1}}\n2. {{document_2}}\n3. {{document_3}}\nPlease upload them to your portal or reply to this message.",
      category: "Document Request",
      isDefault: false,
      usageCount: 45,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "interview-schedule",
      name: "Interview Scheduling",
      content: "Hi {{name}}! 🎯 Your interview for {{program}} has been scheduled!\n📅 Date: {{date}}\n⏰ Time: {{time}}\n👥 Interviewer: {{interviewer_name}}\n📱 Mode: {{interview_mode}}\nPlease confirm your attendance.",
      category: "Scheduling",
      isDefault: false,
      usageCount: 32,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]

  // Enhanced campaigns data
  const mockEmailCampaigns: EmailCampaign[] = [
    {
      id: "spring-newsletter",
      name: "Spring Education Opportunities",
      description: "Comprehensive newsletter featuring spring programs, scholarships, and success stories",
      subject: "🌸 Spring Education Opportunities - Exclusive Programs & Scholarships Inside!",
      previewText: "Discover new programs and scholarships for this spring semester...",
      fromName: "{{agency_name}} Team",
      fromEmail: "newsletter@{{agency_name}}.com",
      status: "SENT",
      sentAt: new Date(Date.now() - 86400000).toISOString(),
      targetAudience: "All subscribers (2,500)",
      templateId: "newsletter-email",
      analytics: {
        sent: 2500,
        delivered: 2450,
        opened: 1850,
        clicked: 520,
        bounced: 50,
        unsubscribed: 25
      }
    },
    {
      id: "follow-up-campaign",
      name: "Lead Nurturing Follow-up",
      description: "Automated follow-up campaign for qualified leads",
      subject: "Following up on your educational goals - {{agency_name}}",
      previewText: "Personalized recommendations based on your interests...",
      fromName: "{{consultant_name}} from {{agency_name}}",
      fromEmail: "{{consultant_email}}",
      status: "ACTIVE",
      scheduledAt: new Date(Date.now() + 3600000).toISOString(),
      targetAudience: "Qualified leads (150)",
      templateId: "follow-up-email",
      analytics: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        unsubscribed: 0
      }
    }
  ]

  const mockSmsCampaigns: SmsCampaign[] = [
    {
      id: "exam-reminders",
      name: "Exam Reminder Campaign",
      description: "Automated SMS reminders for upcoming exams",
      message: "Hi {{name}}, reminder: Your {{exam_name}} is on {{date}} at {{time}}. Location: {{venue}}. Good luck! 📚",
      status: "ACTIVE",
      scheduledAt: new Date(Date.now() + 7200000).toISOString(),
      targetAudience: "Students with upcoming exams (200)",
      templateId: "appointment-reminder",
      analytics: {
        sent: 180,
        delivered: 175,
        failed: 5,
        optOut: 2
      }
    },
    {
      id: "welcome-sms-campaign",
      name: "New Student Welcome",
      description: "Welcome message series for new student inquiries",
      message: "Welcome to {{agency_name}}! 🎓 We're excited to help you achieve your educational goals. Reply START to begin your journey.",
      status: "COMPLETED",
      sentAt: new Date(Date.now() - 172800000).toISOString(),
      targetAudience: "New inquiries (300)",
      templateId: "welcome-sms",
      analytics: {
        sent: 300,
        delivered: 295,
        failed: 5,
        optOut: 8
      }
    }
  ]

  const mockWhatsappCampaigns: WhatsAppCampaign[] = [
    {
      id: "document-collection",
      name: "Document Collection Campaign",
      description: "Automated document requests for application processing",
      message: "Hi {{name}}! 📄 To complete your application, we need: {{required_documents}}. Please upload them to your portal or reply to this message.",
      status: "ACTIVE",
      scheduledAt: new Date(Date.now() + 1800000).toISOString(),
      targetAudience: "Applicants missing documents (75)",
      templateId: "document-request",
      analytics: {
        sent: 45,
        delivered: 43,
        read: 38,
        replied: 22,
        failed: 2
      }
    },
    {
      id: "interview-scheduling",
      name: "Interview Scheduling Campaign",
      description: "Automated interview scheduling and confirmations",
      message: "Hi {{name}}! 🎯 Your interview is scheduled for {{date}} at {{time}}. Please confirm: {{confirmation_link}}",
      status: "DRAFT",
      targetAudience: "Shortlisted candidates (50)",
      templateId: "interview-schedule",
      analytics: {
        sent: 0,
        delivered: 0,
        read: 0,
        replied: 0,
        failed: 0
      }
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setTools(marketingTools)
      setEmailTemplates(mockEmailTemplates)
      setSmsTemplates(mockSmsTemplates)
      setWhatsappTemplates(mockWhatsappTemplates)
      setEmailCampaigns(mockEmailCampaigns)
      setSmsCampaigns(mockSmsCampaigns)
      setWhatsappCampaigns(mockWhatsappCampaigns)
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-green-100 text-green-800"
      case "DRAFT": return "bg-gray-100 text-gray-800"
      case "SCHEDULED": return "bg-blue-100 text-blue-800"
      case "COMPLETED": return "bg-purple-100 text-purple-800"
      case "PAUSED": return "bg-yellow-100 text-yellow-800"
      case "CANCELLED": return "bg-red-100 text-red-800"
      case "SENT": return "bg-indigo-100 text-indigo-800"
      case "FAILED": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "EMAIL": return EmailIcon
      case "SMS": return SmsIcon
      case "WHATSAPP": return WhatsAppIcon
      case "SOCIAL_MEDIA": return SocialIcon
      case "ANALYTICS": return AnalyticsIcon
      case "AUTOMATION": return AutomationIcon
      case "DESIGN": return DesignIcon
      case "CRM": return CrmIcon
      default: return Settings
    }
  }

  const calculateEngagementRate = (campaign: EmailCampaign | SmsCampaign | WhatsAppCampaign) => {
    if ('opened' in campaign.analytics) {
      return ((campaign.analytics.opened / campaign.analytics.sent) * 100).toFixed(1)
    } else if ('read' in campaign.analytics) {
      return ((campaign.analytics.read / campaign.analytics.sent) * 100).toFixed(1)
    }
    return '0.0'
  }

  const filteredEmailCampaigns = emailCampaigns.filter(campaign => 
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.subject.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredSmsCampaigns = smsCampaigns.filter(campaign => 
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.message.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredWhatsappCampaigns = whatsappCampaigns.filter(campaign => 
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.message.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredTools = tools.filter(tool => 
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (channelFilter !== "all" && tool.category === channelFilter)
  )

  const marketingStats = {
    totalCampaigns: emailCampaigns.length + smsCampaigns.length + whatsappCampaigns.length,
    activeCampaigns: [...emailCampaigns, ...smsCampaigns, ...whatsappCampaigns].filter(c => c.status === 'ACTIVE').length,
    totalEmailsSent: emailCampaigns.reduce((sum, c) => sum + c.analytics.sent, 0),
    totalSmsSent: smsCampaigns.reduce((sum, c) => sum + c.analytics.sent, 0),
    totalWhatsappSent: whatsappCampaigns.reduce((sum, c) => sum + c.analytics.sent, 0),
    averageEngagementRate: '68.5'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Marketing Hub</h1>
          <p className="text-muted-foreground">Multi-channel marketing automation and campaign management</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateEmailCampaignOpen} onOpenChange={setIsCreateEmailCampaignOpen}>
            <DialogTrigger asChild>
              <Button>
                <EmailIcon className="h-4 w-4 mr-2" />
                Email Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Email Campaign</DialogTitle>
                <DialogDescription>Design and launch a new email marketing campaign</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email-name">Campaign Name *</Label>
                    <Input
                      id="email-name"
                      value={newEmailCampaign.name}
                      onChange={(e) => setNewEmailCampaign(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter campaign name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email-subject">Subject Line *</Label>
                    <Input
                      id="email-subject"
                      value={newEmailCampaign.subject}
                      onChange={(e) => setNewEmailCampaign(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Enter subject line"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email-description">Description</Label>
                  <Textarea
                    id="email-description"
                    value={newEmailCampaign.description}
                    onChange={(e) => setNewEmailCampaign(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter campaign description"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="from-name">From Name</Label>
                    <Input
                      id="from-name"
                      value={newEmailCampaign.fromName}
                      onChange={(e) => setNewEmailCampaign(prev => ({ ...prev, fromName: e.target.value }))}
                      placeholder="Your Name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="from-email">From Email</Label>
                    <Input
                      id="from-email"
                      type="email"
                      value={newEmailCampaign.fromEmail}
                      onChange={(e) => setNewEmailCampaign(prev => ({ ...prev, fromEmail: e.target.value }))}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email-template">Template</Label>
                    <Select value={newEmailCampaign.templateId} onValueChange={(value) => setNewEmailCampaign(prev => ({ ...prev, templateId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {emailTemplates.map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="email-schedule">Schedule</Label>
                    <Input
                      id="email-schedule"
                      type="datetime-local"
                      value={newEmailCampaign.scheduledAt}
                      onChange={(e) => setNewEmailCampaign(prev => ({ ...prev, scheduledAt: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email-audience">Target Audience</Label>
                  <Input
                    id="email-audience"
                    value={newEmailCampaign.targetAudience}
                    onChange={(e) => setNewEmailCampaign(prev => ({ ...prev, targetAudience: e.target.value }))}
                    placeholder="Describe target audience"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateEmailCampaignOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  // Handle create email campaign
                  setIsCreateEmailCampaignOpen(false)
                }}>
                  Create Campaign
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateSmsCampaignOpen} onOpenChange={setIsCreateSmsCampaignOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <SmsIcon className="h-4 w-4 mr-2" />
                SMS Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create SMS Campaign</DialogTitle>
                <DialogDescription>Launch a new SMS marketing campaign</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sms-name">Campaign Name *</Label>
                    <Input
                      id="sms-name"
                      value={newSmsCampaign.name}
                      onChange={(e) => setNewSmsCampaign(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter campaign name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sms-schedule">Schedule</Label>
                    <Input
                      id="sms-schedule"
                      type="datetime-local"
                      value={newSmsCampaign.scheduledAt}
                      onChange={(e) => setNewSmsCampaign(prev => ({ ...prev, scheduledAt: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="sms-description">Description</Label>
                  <Textarea
                    id="sms-description"
                    value={newSmsCampaign.description}
                    onChange={(e) => setNewSmsCampaign(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter campaign description"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="sms-message">Message *</Label>
                  <Textarea
                    id="sms-message"
                    value={newSmsCampaign.message}
                    onChange={(e) => setNewSmsCampaign(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Enter SMS message"
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Character count: {newSmsCampaign.message.length}/160
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sms-template">Template</Label>
                    <Select value={newSmsCampaign.templateId} onValueChange={(value) => setNewSmsCampaign(prev => ({ ...prev, templateId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {smsTemplates.map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="sms-audience">Target Audience</Label>
                    <Input
                      id="sms-audience"
                      value={newSmsCampaign.targetAudience}
                      onChange={(e) => setNewSmsCampaign(prev => ({ ...prev, targetAudience: e.target.value }))}
                      placeholder="Describe target audience"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateSmsCampaignOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  // Handle create SMS campaign
                  setIsCreateSmsCampaignOpen(false)
                }}>
                  Create Campaign
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateWhatsappCampaignOpen} onOpenChange={setIsCreateWhatsappCampaignOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <WhatsAppIcon className="h-4 w-4 mr-2" />
                WhatsApp Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create WhatsApp Campaign</DialogTitle>
                <DialogDescription>Launch a new WhatsApp marketing campaign</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="whatsapp-name">Campaign Name *</Label>
                    <Input
                      id="whatsapp-name"
                      value={newWhatsappCampaign.name}
                      onChange={(e) => setNewWhatsappCampaign(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter campaign name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="whatsapp-schedule">Schedule</Label>
                    <Input
                      id="whatsapp-schedule"
                      type="datetime-local"
                      value={newWhatsappCampaign.scheduledAt}
                      onChange={(e) => setNewWhatsappCampaign(prev => ({ ...prev, scheduledAt: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="whatsapp-description">Description</Label>
                  <Textarea
                    id="whatsapp-description"
                    value={newWhatsappCampaign.description}
                    onChange={(e) => setNewWhatsappCampaign(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter campaign description"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp-message">Message *</Label>
                  <Textarea
                    id="whatsapp-message"
                    value={newWhatsappCampaign.message}
                    onChange={(e) => setNewWhatsappCampaign(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Enter WhatsApp message"
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp-media">Media URL (optional)</Label>
                  <Input
                    id="whatsapp-media"
                    value={newWhatsappCampaign.mediaUrl}
                    onChange={(e) => setNewWhatsappCampaign(prev => ({ ...prev, mediaUrl: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="whatsapp-template">Template</Label>
                    <Select value={newWhatsappCampaign.templateId} onValueChange={(value) => setNewWhatsappCampaign(prev => ({ ...prev, templateId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {whatsappTemplates.map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="whatsapp-audience">Target Audience</Label>
                    <Input
                      id="whatsapp-audience"
                      value={newWhatsappCampaign.targetAudience}
                      onChange={(e) => setNewWhatsappCampaign(prev => ({ ...prev, targetAudience: e.target.value }))}
                      placeholder="Describe target audience"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateWhatsappCampaignOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  // Handle create WhatsApp campaign
                  setIsCreateWhatsappCampaignOpen(false)
                }}>
                  Create Campaign
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketingStats.totalCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              {marketingStats.activeCampaigns} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <EmailIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketingStats.totalEmailsSent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SMS Sent</CardTitle>
            <SmsIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketingStats.totalSmsSent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">WhatsApp Sent</CardTitle>
            <WhatsAppIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketingStats.totalWhatsappSent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="tools">Marketing Tools</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="PAUSED">Paused</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Email Campaigns */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <EmailIcon className="h-5 w-5" />
                Email Campaigns
              </CardTitle>
              <CardDescription>Manage your email marketing campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Opened</TableHead>
                    <TableHead>Clicked</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmailCampaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{campaign.name}</div>
                          <div className="text-sm text-muted-foreground">{campaign.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">{campaign.subject}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{campaign.analytics.sent.toLocaleString()}</TableCell>
                      <TableCell>{campaign.analytics.opened.toLocaleString()}</TableCell>
                      <TableCell>{campaign.analytics.clicked.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span>{calculateEngagementRate(campaign)}%</span>
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* SMS Campaigns */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SmsIcon className="h-5 w-5" />
                SMS Campaigns
              </CardTitle>
              <CardDescription>Manage your SMS marketing campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Delivered</TableHead>
                    <TableHead>Failed</TableHead>
                    <TableHead>Opt-out</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSmsCampaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{campaign.name}</div>
                          <div className="text-sm text-muted-foreground">{campaign.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">{campaign.message}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{campaign.analytics.sent.toLocaleString()}</TableCell>
                      <TableCell>{campaign.analytics.delivered.toLocaleString()}</TableCell>
                      <TableCell>{campaign.analytics.failed.toLocaleString()}</TableCell>
                      <TableCell>{campaign.analytics.optOut.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* WhatsApp Campaigns */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <WhatsAppIcon className="h-5 w-5" />
                WhatsApp Campaigns
              </CardTitle>
              <CardDescription>Manage your WhatsApp marketing campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Delivered</TableHead>
                    <TableHead>Read</TableHead>
                    <TableHead>Replied</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWhatsappCampaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{campaign.name}</div>
                          <div className="text-sm text-muted-foreground">{campaign.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">{campaign.message}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{campaign.analytics.sent.toLocaleString()}</TableCell>
                      <TableCell>{campaign.analytics.delivered.toLocaleString()}</TableCell>
                      <TableCell>{campaign.analytics.read.toLocaleString()}</TableCell>
                      <TableCell>{campaign.analytics.replied.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search marketing tools..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="EMAIL">Email</SelectItem>
                <SelectItem value="SMS">SMS</SelectItem>
                <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                <SelectItem value="SOCIAL_MEDIA">Social Media</SelectItem>
                <SelectItem value="ANALYTICS">Analytics</SelectItem>
                <SelectItem value="AUTOMATION">Automation</SelectItem>
                <SelectItem value="DESIGN">Design</SelectItem>
                <SelectItem value="CRM">CRM</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => {
              const IconComponent = tool.icon
              return (
                <Card key={tool.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-6 w-6 text-primary" />
                        <div>
                          <CardTitle className="text-lg">{tool.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={tool.status === 'ACTIVE' ? 'default' : tool.status === 'BETA' ? 'secondary' : 'destructive'}>
                              {tool.status}
                            </Badge>
                            <Badge variant="outline">{tool.type}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {tool.isConnected ? (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        ) : (
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {tool.isConnected ? 'Connected' : 'Disconnected'}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">{tool.description}</CardDescription>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Key Features:</h4>
                      <div className="flex flex-wrap gap-1">
                        {tool.features.slice(0, 4).map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {tool.features.length > 4 && (
                          <Badge variant="secondary" className="text-xs">
                            +{tool.features.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {tool.lastSynced && (
                      <div className="text-xs text-muted-foreground mb-4">
                        Last synced: {new Date(tool.lastSynced).toLocaleString()}
                      </div>
                    )}

                    <div className="flex gap-2">
                      {tool.isConnected ? (
                        <Button variant="outline" size="sm" className="flex-1">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                      ) : (
                        <Button size="sm" className="flex-1">
                          <Plug className="h-4 w-4 mr-2" />
                          Connect
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Email Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <EmailIcon className="h-5 w-5" />
                  Email Templates
                </CardTitle>
                <CardDescription>Manage your email templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {emailTemplates.map((template) => (
                    <div key={template.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{template.name}</h4>
                        {template.isDefault && (
                          <Badge variant="secondary" className="text-xs">Default</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{template.subject}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Used {template.usageCount} times
                        </span>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Template
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* SMS Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SmsIcon className="h-5 w-5" />
                  SMS Templates
                </CardTitle>
                <CardDescription>Manage your SMS templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {smsTemplates.map((template) => (
                    <div key={template.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{template.name}</h4>
                        {template.isDefault && (
                          <Badge variant="secondary" className="text-xs">Default</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 truncate">
                        {template.content}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Used {template.usageCount} times
                        </span>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Template
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* WhatsApp Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <WhatsAppIcon className="h-5 w-5" />
                  WhatsApp Templates
                </CardTitle>
                <CardDescription>Manage your WhatsApp templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {whatsappTemplates.map((template) => (
                    <div key={template.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{template.name}</h4>
                        {template.isDefault && (
                          <Badge variant="secondary" className="text-xs">Default</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 truncate">
                        {template.content}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Used {template.usageCount} times
                        </span>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(marketingStats.totalEmailsSent + marketingStats.totalSmsSent + marketingStats.totalWhatsappSent).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all channels
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Avg. Engagement Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{marketingStats.averageEngagementRate}%</div>
                <p className="text-xs text-muted-foreground">
                  +2.5% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Active Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tools.filter(t => t.isConnected).length}</div>
                <p className="text-xs text-muted-foreground">
                  Connected and ready
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Templates Available</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{emailTemplates.length + smsTemplates.length + whatsappTemplates.length}</div>
                <p className="text-xs text-muted-foreground">
                  Ready to use
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Channel Performance</CardTitle>
                <CardDescription>Compare performance across different marketing channels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <EmailIcon className="h-4 w-4" />
                      <span>Email Marketing</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{marketingStats.totalEmailsSent.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">72.5% engagement</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <SmsIcon className="h-4 w-4" />
                      <span>SMS Marketing</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{marketingStats.totalSmsSent.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">68.2% engagement</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <WhatsAppIcon className="h-4 w-4" />
                      <span>WhatsApp Marketing</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{marketingStats.totalWhatsappSent.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">85.7% engagement</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Campaigns</CardTitle>
                <CardDescription>Your most successful campaigns this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Spring Education Opportunities</div>
                      <div className="text-xs text-muted-foreground">Email Campaign</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">74.0%</div>
                      <div className="text-xs text-muted-foreground">engagement</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Document Collection Campaign</div>
                      <div className="text-xs text-muted-foreground">WhatsApp Campaign</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">88.4%</div>
                      <div className="text-xs text-muted-foreground">engagement</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Exam Reminder Campaign</div>
                      <div className="text-xs text-muted-foreground">SMS Campaign</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">97.2%</div>
                      <div className="text-xs text-muted-foreground">delivery rate</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}