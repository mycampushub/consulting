"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, FileText, MessageSquare, Bell, CheckCircle, Clock, AlertCircle, TrendingUp, Award, BookOpen, Users, Target, DollarSign, Upload, Download, Video, Phone, Mail, ExternalLink, Eye, Edit, Plus, Search, Filter, ChevronRight, ChevronDown, User, Settings, LogOut, Star, MapPin, GraduationCap, Briefcase, Globe, Heart, Share2, Camera, Mic, Send, Paperclip, Smile, MoreHorizontal, Activity, BarChart3, Zap, Shield, Fingerprint, Smartphone, Wifi, Database, Cloud, RefreshCw, AlertTriangle, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Student {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  status: string
  currentEducation: string
  gpa?: number
  nationality: string
  country: string
  dateOfBirth?: string
  budget?: number
  preferredCountries: string[]
  preferredCourses: string[]
  profileComplete: boolean
  twoFactorEnabled: boolean
  lastLogin: string
  securityScore: number
}

interface Application {
  id: string
  university: string
  program: string
  status: string
  submittedAt: string
  updatedAt: string
  progress: number
  documents: Document[]
  pipelineEntries: PipelineEntry[]
  intake?: string
  deadline?: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  estimatedResponseTime?: string
}

interface Document {
  id: string
  name: string
  category: string
  type: string
  status: string
  uploadedAt: string
  fileSize: number
  fileUrl: string
  required: boolean
  verifiedBy?: string
  verifiedAt?: string
  rejectionReason?: string
}

interface PipelineEntry {
  id: string
  pipeline: {
    name: string
    type: string
  }
  currentStage: string
  progress: number
  enteredAt: string
  movedAt?: string
  estimatedCompletion?: string
}

interface Notification {
  id: string
  type: string
  title: string
  message: string
  createdAt: string
  readAt?: string
  priority: string
  actionRequired?: boolean
  actionUrl?: string
}

interface Message {
  id: string
  message: string
  channel: string
  direction: string
  createdAt: string
  readAt?: string
  sender?: {
    name: string
    avatar?: string
    role: string
  }
  attachments?: {
    name: string
    size: number
    url: string
  }[]
}

interface Appointment {
  id: string
  title: string
  type: string
  startTime: string
  endTime: string
  status: string
  location?: string
  virtualMeetingUrl?: string
  consultantName?: string
  consultantAvatar?: string
  reminderSent?: boolean
}

interface Payment {
  id: string
  invoiceNumber: string
  amount: number
  currency: string
  status: string
  dueDate: string
  description: string
  paidDate?: string
  paymentMethod?: string
  transactionId?: string
  lateFee?: number
}

interface Task {
  id: string
  title: string
  description: string
  status: string
  priority: string
  dueDate?: string
  assignedTo?: string
  category: string
  estimatedTime?: number
  timeSpent?: number
  dependencies?: string[]
}

interface SecurityAlert {
  id: string
  type: 'LOGIN' | 'DEVICE' | 'LOCATION' | 'BEHAVIOR'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  title: string
  description: string
  timestamp: string
  resolved: boolean
  actionRequired?: string
}

interface ActivityLog {
  id: string
  action: string
  description: string
  timestamp: string
  ipAddress?: string
  device?: string
  location?: string
}

export default function EnhancedStudentDashboard() {
  const [student, setStudent] = useState<Student | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    loginNotifications: true,
    sessionTimeout: 30,
    allowedDevices: [] as string[]
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchEnhancedStudentData()
  }, [])

  const fetchEnhancedStudentData = async () => {
    try {
      const studentId = localStorage.getItem('studentId')
      const sessionId = localStorage.getItem('sessionId')
      const subdomain = window.location.hostname.split('.')[0]

      if (!studentId) {
        loadEnhancedDemoData()
        return
      }

      // Simulate API calls with enhanced data
      loadEnhancedDemoData()

    } catch (error) {
      console.error('Error fetching student data:', error)
      toast({
        title: "Error",
        description: "Failed to load student data. Using demo mode.",
        variant: "destructive"
      })
      loadEnhancedDemoData()
    } finally {
      setLoading(false)
    }
  }

  const loadEnhancedDemoData = () => {
    const mockStudent: Student = {
      id: "1",
      firstName: "Alex",
      lastName: "Thompson",
      email: "alex.thompson@demo.com",
      phone: "+1234567890",
      status: "ACTIVE",
      currentEducation: "Bachelor's Degree in Computer Science",
      gpa: 3.8,
      nationality: "Canadian",
      country: "Canada",
      dateOfBirth: "2000-05-15",
      budget: 50000,
      preferredCountries: ["United States", "United Kingdom", "Australia"],
      preferredCourses: ["Computer Science", "Data Science", "Software Engineering"],
      profileComplete: true,
      twoFactorEnabled: false,
      lastLogin: "2024-01-18T10:00:00Z",
      securityScore: 85
    }

    const mockApplications: Application[] = [
      {
        id: "1",
        university: "Harvard University",
        program: "Master of Computer Science",
        status: "UNDER_REVIEW",
        submittedAt: "2024-01-15",
        updatedAt: "2024-01-20",
        progress: 0.75,
        intake: "Fall 2024",
        deadline: "2024-02-15",
        priority: "HIGH",
        estimatedResponseTime: "4-6 weeks",
        documents: [
          {
            id: "1",
            name: "Academic Transcript",
            category: "ACADEMIC",
            type: "PDF",
            status: "VERIFIED",
            uploadedAt: "2024-01-10",
            fileSize: 2048000,
            fileUrl: "/files/transcript.pdf",
            required: true,
            verifiedBy: "Sarah Johnson",
            verifiedAt: "2024-01-12"
          },
          {
            id: "2",
            name: "Personal Statement",
            category: "PERSONAL",
            type: "PDF",
            status: "PENDING_VERIFICATION",
            uploadedAt: "2024-01-12",
            fileSize: 1024000,
            fileUrl: "/files/statement.pdf",
            required: true
          }
        ],
        pipelineEntries: [
          {
            id: "1",
            pipeline: {
              name: "Application Process",
              type: "APPLICATION_PROCESSING"
            },
            currentStage: "Document Review",
            progress: 0.75,
            enteredAt: "2024-01-15",
            movedAt: "2024-01-18",
            estimatedCompletion: "2024-02-01"
          }
        ]
      },
      {
        id: "2",
        university: "MIT",
        program: "Master of Engineering",
        status: "IN_PROGRESS",
        submittedAt: "2024-01-10",
        updatedAt: "2024-01-22",
        progress: 0.45,
        intake: "Fall 2024",
        deadline: "2024-02-20",
        priority: "MEDIUM",
        estimatedResponseTime: "6-8 weeks",
        documents: [
          {
            id: "3",
            name: "GRE Scores",
            category: "TEST",
            type: "PDF",
            status: "VERIFIED",
            uploadedAt: "2024-01-08",
            fileSize: 512000,
            fileUrl: "/files/gre.pdf",
            required: true,
            verifiedBy: "Mike Chen",
            verifiedAt: "2024-01-10"
          }
        ],
        pipelineEntries: [
          {
            id: "2",
            pipeline: {
              name: "Application Process",
              type: "APPLICATION_PROCESSING"
            },
            currentStage: "Initial Review",
            progress: 0.45,
            enteredAt: "2024-01-10",
            movedAt: "2024-01-20",
            estimatedCompletion: "2024-02-10"
          }
        ]
      }
    ]

    const mockDocuments: Document[] = [
      {
        id: "1",
        name: "Academic Transcript",
        category: "ACADEMIC",
        type: "PDF",
        status: "VERIFIED",
        uploadedAt: "2024-01-10",
        fileSize: 2048000,
        fileUrl: "/files/transcript.pdf",
        required: true,
        verifiedBy: "Sarah Johnson",
        verifiedAt: "2024-01-12"
      },
      {
        id: "2",
        name: "Personal Statement",
        category: "PERSONAL",
        type: "PDF",
        status: "PENDING_VERIFICATION",
        uploadedAt: "2024-01-12",
        fileSize: 1024000,
        fileUrl: "/files/statement.pdf",
        required: true
      },
      {
        id: "3",
        name: "GRE Scores",
        category: "TEST",
        type: "PDF",
        status: "VERIFIED",
        uploadedAt: "2024-01-08",
        fileSize: 512000,
        fileUrl: "/files/gre.pdf",
        required: true,
        verifiedBy: "Mike Chen",
        verifiedAt: "2024-01-10"
      },
      {
        id: "4",
        name: "Passport Copy",
        category: "IDENTITY",
        type: "PDF",
        status: "EXPIRING_SOON",
        uploadedAt: "2024-01-05",
        fileSize: 256000,
        fileUrl: "/files/passport.pdf",
        required: true,
        verifiedBy: "Sarah Johnson",
        verifiedAt: "2024-01-07"
      },
      {
        id: "5",
        name: "English Proficiency Certificate",
        category: "LANGUAGE",
        type: "PDF",
        status: "REJECTED",
        uploadedAt: "2024-01-14",
        fileSize: 768000,
        fileUrl: "/files/english.pdf",
        required: true,
        rejectionReason: "Certificate expired. Please upload a valid certificate."
      }
    ]

    const mockPayments: Payment[] = [
      {
        id: "1",
        invoiceNumber: "INV-2024-001",
        amount: 2500,
        currency: "USD",
        status: "PAID",
        dueDate: "2024-01-15",
        description: "Application Fee - Harvard University",
        paidDate: "2024-01-10",
        paymentMethod: "Credit Card",
        transactionId: "TXN-001"
      },
      {
        id: "2",
        invoiceNumber: "INV-2024-002",
        amount: 1500,
        currency: "USD",
        status: "PENDING",
        dueDate: "2024-02-01",
        description: "Application Fee - MIT",
        lateFee: 50
      }
    ]

    const mockSecurityAlerts: SecurityAlert[] = [
      {
        id: "1",
        type: "LOGIN",
        severity: "MEDIUM",
        title: "New Device Login",
        description: "Your account was accessed from a new device in New York.",
        timestamp: "2024-01-18T10:00:00Z",
        resolved: false,
        actionRequired: "Please verify this was you."
      },
      {
        id: "2",
        type: "DEVICE",
        severity: "LOW",
        title: "Session Timeout",
        description: "Your session expired due to inactivity.",
        timestamp: "2024-01-17T15:30:00Z",
        resolved: true
      }
    ]

    const mockActivityLogs: ActivityLog[] = [
      {
        id: "1",
        action: "LOGIN_SUCCESS",
        description: "Successful login from Chrome browser",
        timestamp: "2024-01-18T10:00:00Z",
        ipAddress: "192.168.1.1",
        device: "Desktop - Chrome",
        location: "Toronto, Canada"
      },
      {
        id: "2",
        action: "DOCUMENT_UPLOADED",
        description: "Uploaded Personal Statement",
        timestamp: "2024-01-12T14:30:00Z",
        device: "Desktop - Chrome"
      }
    ]

    setStudent(mockStudent)
    setApplications(mockApplications)
    setDocuments(mockDocuments)
    setPayments(mockPayments)
    setSecurityAlerts(mockSecurityAlerts)
    setActivityLogs(mockActivityLogs)
    loadEnhancedMockCommunications()
  }

  const loadEnhancedMockCommunications = () => {
    const mockNotifications: Notification[] = [
      {
        id: "1",
        type: "INFO",
        title: "Document Approved",
        message: "Your academic transcript has been approved by the review committee.",
        createdAt: "2024-01-18T10:00:00Z",
        priority: "MEDIUM",
        actionRequired: false
      },
      {
        id: "2",
        type: "TASK",
        title: "Missing Document",
        message: "Please upload your recommendation letter for Harvard application.",
        createdAt: "2024-01-17T14:30:00Z",
        priority: "HIGH",
        actionRequired: true,
        actionUrl: "/documents/upload"
      },
      {
        id: "3",
        type: "SUCCESS",
        title: "Application Progress",
        message: "Your MIT application is now 45% complete.",
        createdAt: "2024-01-16T09:15:00Z",
        priority: "LOW",
        actionRequired: false
      },
      {
        id: "4",
        type: "REMINDER",
        title: "Payment Due",
        message: "Your MIT application fee of $1,500 is due on February 1st.",
        createdAt: "2024-01-15T16:00:00Z",
        priority: "HIGH",
        actionRequired: true,
        actionUrl: "/payments"
      }
    ]

    const mockMessages: Message[] = [
      {
        id: "1",
        message: "Hi Alex! Your Harvard application is looking good. We just need your recommendation letter to complete the review process.",
        channel: "EMAIL",
        direction: "INBOUND",
        createdAt: "2024-01-16T09:00:00Z",
        readAt: "2024-01-16T10:00:00Z",
        sender: {
          name: "Sarah Johnson",
          avatar: "/avatars/sarah.jpg",
          role: "Senior Consultant"
        }
      },
      {
        id: "2",
        message: "Thank you! I'll upload the recommendation letter today.",
        channel: "EMAIL",
        direction: "OUTBOUND",
        createdAt: "2024-01-16T10:30:00Z"
      },
      {
        id: "3",
        message: "Perfect! Also, don't forget about the English proficiency certificate. It's required for both applications.",
        channel: "EMAIL",
        direction: "INBOUND",
        createdAt: "2024-01-16T11:00:00Z",
        sender: {
          name: "Sarah Johnson",
          avatar: "/avatars/sarah.jpg",
          role: "Senior Consultant"
        }
      }
    ]

    const mockAppointments: Appointment[] = [
      {
        id: "1",
        title: "Application Review Meeting",
        type: "VIDEO_CALL",
        startTime: "2024-01-25T14:00:00Z",
        endTime: "2024-01-25T15:00:00Z",
        status: "SCHEDULED",
        virtualMeetingUrl: "https://meet.example.com/alex-thompson",
        consultantName: "Sarah Johnson",
        consultantAvatar: "/avatars/sarah.jpg",
        reminderSent: true
      },
      {
        id: "2",
        title: "Document Submission Deadline",
        type: "DEADLINE",
        startTime: "2024-01-30T23:59:00Z",
        endTime: "2024-01-30T23:59:00Z",
        status: "UPCOMING"
      }
    ]

    const mockTasks: Task[] = [
      {
        id: "1",
        title: "Upload Recommendation Letter",
        description: "Upload 2 letters of recommendation for Harvard application",
        status: "TODO",
        priority: "HIGH",
        dueDate: "2024-01-25",
        category: "DOCUMENTS",
        estimatedTime: 30
      },
      {
        id: "2",
        title: "Complete English Test",
        description: "Schedule and complete English proficiency test",
        status: "IN_PROGRESS",
        priority: "MEDIUM",
        dueDate: "2024-01-30",
        category: "TESTS",
        estimatedTime: 120
      }
    ]

    setNotifications(mockNotifications)
    setMessages(mockMessages)
    setAppointments(mockAppointments)
    setTasks(mockTasks)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
      case "approved":
      case "verified":
      case "completed":
      case "paid":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
      case "under_review":
      case "in_progress":
      case "pending_verification":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "rejected":
      case "cancelled":
      case "expired":
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200"
      case "expiring_soon":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
      case "approved":
      case "verified":
      case "completed":
      case "paid":
        return <CheckCircle className="h-4 w-4" />
      case "pending":
      case "under_review":
      case "in_progress":
      case "pending_verification":
        return <Clock className="h-4 w-4" />
      case "rejected":
      case "cancelled":
      case "expired":
      case "overdue":
        return <AlertCircle className="h-4 w-4" />
      case "expiring_soon":
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getSecurityScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const unreadNotifications = notifications.filter(n => !n.readAt).length
  const unreadMessages = messages.filter(m => !m.readAt && m.direction === "INBOUND").length
  const criticalSecurityAlerts = securityAlerts.filter(a => !a.resolved && a.severity === "CRITICAL").length

  // Calculate enhanced statistics
  const totalApplications = applications.length
  const activeApplications = applications.filter(app => 
    ["PENDING", "UNDER_REVIEW", "IN_PROGRESS"].includes(app.status)
  ).length
  const completedApplications = applications.filter(app => 
    ["COMPLETED", "ACCEPTED"].includes(app.status)
  ).length
  const highPriorityApplications = applications.filter(app => app.priority === "HIGH").length
  const verifiedDocuments = documents.filter(doc => doc.status === "VERIFIED").length
  const totalDocuments = documents.length
  const documentProgress = totalDocuments > 0 ? (verifiedDocuments / totalDocuments) * 100 : 0
  const upcomingAppointments = appointments.filter(apt => 
    new Date(apt.startTime) > new Date()
  ).length
  const pendingTasks = tasks.filter(task => task.status !== "COMPLETED").length
  const overdueTasks = tasks.filter(task => 
    task.status !== "COMPLETED" && task.dueDate && new Date(task.dueDate) < new Date()
  ).length
  const overduePayments = payments.filter(payment => 
    payment.status === "PENDING" && new Date(payment.dueDate) < new Date()
  ).length
  const totalPaid = payments.filter(p => p.status === "PAID").reduce((sum, p) => sum + p.amount, 0)
  const totalDue = payments.filter(p => p.status === "PENDING").reduce((sum, p) => sum + p.amount, 0)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    // Simulate upload completion
    setTimeout(() => {
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      // Add new document to the list
      const newDocument: Document = {
        id: `doc-${Date.now()}`,
        name: file.name,
        category: "UPLOADED",
        type: file.type.split('/')[1].toUpperCase(),
        status: "PENDING_VERIFICATION",
        uploadedAt: new Date().toISOString(),
        fileSize: file.size,
        fileUrl: `/files/${file.name}`,
        required: false
      }

      setDocuments(prev => [...prev, newDocument])
      setIsUploading(false)
      setUploadProgress(0)

      toast({
        title: "Upload Successful",
        description: `${file.name} has been uploaded successfully.`,
      })
    }, 2000)
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message: Message = {
      id: `msg-${Date.now()}`,
      message: newMessage,
      channel: "EMAIL",
      direction: "OUTBOUND",
      createdAt: new Date().toISOString()
    }

    setMessages(prev => [...prev, message])
    setNewMessage("")

    toast({
      title: "Message Sent",
      description: "Your message has been sent to your consultant.",
    })
  }

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, readAt: new Date().toISOString() }
          : notif
      )
    )
  }

  const resolveSecurityAlert = (alertId: string) => {
    setSecurityAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, resolved: true }
          : alert
      )
    )
    toast({
      title: "Security Alert Resolved",
      description: "The security alert has been marked as resolved.",
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      {/* Enhanced Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                <GraduationCap className="text-primary-foreground h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Enhanced Student Portal
                </h1>
                <p className="text-muted-foreground">
                  Welcome back, {student?.firstName} {student?.lastName}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Security Score */}
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <span className={`text-sm font-semibold ${getSecurityScoreColor(student?.securityScore || 0)}`}>
                  Security Score: {student?.securityScore || 0}%
                </span>
              </div>
              
              {/* Notifications */}
              <div className="relative">
                <Bell className="h-6 w-6 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                    {unreadNotifications}
                  </span>
                )}
              </div>
              
              {/* Messages */}
              <div className="relative">
                <MessageSquare className="h-6 w-6 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
                {unreadMessages > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                    {unreadMessages}
                  </span>
                )}
              </div>
              
              {/* Security Alerts */}
              {criticalSecurityAlerts > 0 && (
                <div className="relative">
                  <AlertTriangle className="h-6 w-6 text-red-500 cursor-pointer animate-pulse" />
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                    {criticalSecurityAlerts}
                  </span>
                </div>
              )}
              
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-6">
        {/* Enhanced Dashboard Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalApplications}</div>
              <div className="flex items-center gap-2 mt-2">
                <div className="text-xs text-muted-foreground">
                  {activeApplications} active, {completedApplications} completed
                </div>
                {highPriorityApplications > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {highPriorityApplications} High Priority
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{verifiedDocuments}/{totalDocuments}</div>
              <Progress value={documentProgress} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {documentProgress.toFixed(0)}% verified
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasks</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingTasks}</div>
              <div className="flex items-center gap-2 mt-2">
                <div className="text-xs text-muted-foreground">
                  {tasks.filter(t => t.priority === "HIGH").length} high priority
                </div>
                {overdueTasks > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {overdueTasks} overdue
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payments</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalPaid.toLocaleString()}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="text-xs text-muted-foreground">
                  ${totalDue.toLocaleString()} pending
                </div>
                {overduePayments > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {overduePayments} overdue
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Alerts Section */}
        {securityAlerts.some(alert => !alert.resolved) && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Security Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {securityAlerts.filter(alert => !alert.resolved).map((alert) => (
                  <Alert key={alert.id} className={`border-l-4 ${
                    alert.severity === 'CRITICAL' ? 'border-red-500 bg-red-100' :
                    alert.severity === 'HIGH' ? 'border-orange-500 bg-orange-100' :
                    alert.severity === 'MEDIUM' ? 'border-yellow-500 bg-yellow-100' :
                    'border-blue-500 bg-blue-100'
                  }`}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex items-center justify-between">
                        <div>
                          <strong>{alert.title}</strong>
                          <p className="text-sm mt-1">{alert.description}</p>
                          {alert.actionRequired && (
                            <p className="text-sm font-medium mt-1">{alert.actionRequired}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <Button
                            size="sm"
                            onClick={() => resolveSecurityAlert(alert.id)}
                          >
                            Resolve
                          </Button>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks you might want to perform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-primary hover:text-primary-foreground transition-colors">
                    <Upload className="h-6 w-6" />
                    <span className="text-sm">Upload Document</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-primary hover:text-primary-foreground transition-colors">
                    <Calendar className="h-6 w-6" />
                    <span className="text-sm">Schedule Meeting</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-primary hover:text-primary-foreground transition-colors">
                    <MessageSquare className="h-6 w-6" />
                    <span className="text-sm">Message Consultant</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-primary hover:text-primary-foreground transition-colors">
                    <DollarSign className="h-6 w-6" />
                    <span className="text-sm">Make Payment</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Recent Activity */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Applications</CardTitle>
                  <CardDescription>Your latest application updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {applications.slice(0, 3).map((app) => (
                      <div key={app.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex-1">
                          <h4 className="font-medium">{app.university}</h4>
                          <p className="text-sm text-muted-foreground">{app.program}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getStatusColor(app.status)}>
                              {app.status.replace('_', ' ')}
                            </Badge>
                            {app.priority === "HIGH" && (
                              <Badge variant="destructive" className="text-xs">
                                HIGH PRIORITY
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-sm font-medium">{(app.progress * 100).toFixed(0)}%</div>
                          <Progress value={app.progress * 100} className="w-16 mt-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Events</CardTitle>
                  <CardDescription>Your scheduled appointments and deadlines</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {appointments.slice(0, 3).map((apt) => (
                      <div key={apt.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <h4 className="font-medium">{apt.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {formatDateTime(apt.startTime)}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(apt.status)}>
                          {apt.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your recent account activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activityLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <Activity className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{log.action.replace('_', ' ')}</p>
                          <p className="text-xs text-muted-foreground">{log.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDateTime(log.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Security Score</span>
                      <span className={`text-lg font-bold ${getSecurityScoreColor(student?.securityScore || 0)}`}>
                        {student?.securityScore || 0}%
                      </span>
                    </div>
                    <Progress value={student?.securityScore || 0} className="h-2" />
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Two-Factor Authentication</span>
                        <Badge className={student?.twoFactorEnabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {student?.twoFactorEnabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Login Notifications</span>
                        <Badge className="bg-green-100 text-green-800">
                          Enabled
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Session Timeout</span>
                        <span className="text-sm">{securitySettings.sessionTimeout} minutes</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Fingerprint className="h-5 w-5" />
                    Active Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Current Session</p>
                          <p className="text-xs text-muted-foreground">Chrome on Desktop</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Security Alerts History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {securityAlerts.map((alert) => (
                    <div key={alert.id} className={`p-4 border rounded-lg ${
                      alert.resolved ? 'bg-gray-50' : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{alert.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDateTime(alert.timestamp)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          {alert.resolved ? (
                            <Badge className="bg-green-100 text-green-800">Resolved</Badge>
                          ) : (
                            <Button size="sm" onClick={() => resolveSecurityAlert(alert.id)}>
                              Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tabs remain the same as the original implementation */}
          <TabsContent value="applications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Applications</CardTitle>
                <CardDescription>Track your university applications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applications.map((app) => (
                    <Card key={app.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">{app.university}</h3>
                            <p className="text-muted-foreground">{app.program}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="mt-2">
                                {app.intake}
                              </Badge>
                              {app.priority === "HIGH" && (
                                <Badge variant="destructive" className="text-xs">
                                  HIGH PRIORITY
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Badge className={getStatusColor(app.status)}>
                            {app.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <div className="grid md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Progress</p>
                            <div className="flex items-center gap-2">
                              <Progress value={app.progress * 100} className="flex-1" />
                              <span className="text-sm font-medium">{(app.progress * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Submitted</p>
                            <p className="text-sm font-medium">{formatDate(app.submittedAt)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Deadline</p>
                            <p className="text-sm font-medium">{formatDate(app.deadline || '')}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Est. Response</p>
                            <p className="text-sm font-medium">{app.estimatedResponseTime || 'N/A'}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Download Documents
                            </Button>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Last updated: {formatDate(app.updatedAt)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tabs content would be similar to the original implementation */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Documents</CardTitle>
                <CardDescription>Manage your application documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium">{doc.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {doc.category} • {formatFileSize(doc.fileSize)} • {formatDate(doc.uploadedAt)}
                          </p>
                          {doc.rejectionReason && (
                            <p className="text-sm text-red-600 mt-1">{doc.rejectionReason}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(doc.status)}>
                          {doc.status.replace('_', ' ')}
                        </Badge>
                        {doc.verifiedBy && (
                          <p className="text-sm text-muted-foreground">
                            Verified by {doc.verifiedBy}
                          </p>
                        )}
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Payments</CardTitle>
                <CardDescription>Track your application fees and payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{payment.description}</h4>
                        <p className="text-sm text-muted-foreground">
                          Invoice: {payment.invoiceNumber} • Due: {formatDate(payment.dueDate)}
                        </p>
                        {payment.paidDate && (
                          <p className="text-sm text-green-600">
                            Paid on {formatDate(payment.paidDate)} via {payment.paymentMethod}
                          </p>
                        )}
                        {payment.lateFee && payment.status === "PENDING" && (
                          <p className="text-sm text-red-600">
                            Late fee: ${payment.lateFee}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">${payment.amount.toLocaleString()}</div>
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status.replace('_', ' ')}
                        </Badge>
                        {payment.status === "PENDING" && (
                          <Button size="sm" className="mt-2">
                            Pay Now
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="communication" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Messages</CardTitle>
                  <CardDescription>Communicate with your consultant</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div key={message.id} className={`p-3 rounded-lg ${
                        message.direction === "INBOUND" ? "bg-blue-50" : "bg-gray-50"
                      }`}>
                        <div className="flex items-start gap-3">
                          {message.sender && (
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                              <span className="text-primary-foreground text-sm font-medium">
                                {message.sender.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div className="flex-1">
                            {message.sender && (
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">{message.sender.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {message.sender.role}
                                </Badge>
                              </div>
                            )}
                            <p className="text-sm">{message.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDateTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Stay updated with important alerts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div key={notification.id} className={`p-3 border rounded-lg ${
                        notification.readAt ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm">{notification.title}</h4>
                              <Badge className={getPriorityColor(notification.priority)}>
                                {notification.priority}
                              </Badge>
                              {notification.actionRequired && (
                                <Badge variant="destructive" className="text-xs">
                                  Action Required
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDateTime(notification.createdAt)}
                            </p>
                          </div>
                          {!notification.readAt && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => markNotificationAsRead(notification.id)}
                            >
                              Mark as read
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Manage your personal information and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" defaultValue={student?.firstName || ''} />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" defaultValue={student?.lastName || ''} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={student?.email || ''} />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" defaultValue={student?.phone || ''} />
                  </div>
                  <div>
                    <Label htmlFor="currentEducation">Current Education</Label>
                    <Input id="currentEducation" defaultValue={student?.currentEducation || ''} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gpa">GPA</Label>
                      <Input id="gpa" type="number" step="0.1" defaultValue={student?.gpa || ''} />
                    </div>
                    <div>
                      <Label htmlFor="budget">Budget (USD)</Label>
                      <Input id="budget" type="number" defaultValue={student?.budget || ''} />
                    </div>
                  </div>
                  <Button>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}