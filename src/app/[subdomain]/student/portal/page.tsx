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
import { Calendar, FileText, MessageSquare, Bell, CheckCircle, Clock, AlertCircle, TrendingUp, Award, BookOpen, Users, Target, DollarSign, Upload, Download, Video, Phone, Mail, ExternalLink, Eye, Edit, Plus, Search, Filter, ChevronRight, ChevronDown, User, Settings, LogOut, Star, MapPin, GraduationCap, Briefcase, Globe, Heart, Share2, Camera, Mic, Send, Paperclip, Smile, MoreHorizontal } from "lucide-react"
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
}

interface Notification {
  id: string
  type: string
  title: string
  message: string
  createdAt: string
  readAt?: string
  priority: string
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
  }
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
}

interface Task {
  id: string
  title: string
  description: string
  status: string
  priority: string
  dueDate?: string
  assignedTo?: string
}

export default function StudentPortal() {
  const [student, setStudent] = useState<Student | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    fetchStudentData()
  }, [])

  const fetchStudentData = async () => {
    try {
      const studentId = localStorage.getItem('studentId') || new URLSearchParams(window.location.search).get('studentId')
      const subdomain = window.location.hostname.split('.')[0]

      if (!studentId) {
        // Try to get student ID from authentication
        const authRes = await fetch(`/api/${subdomain}/student/auth/me`, {
          credentials: 'include'
        })
        if (authRes.ok) {
          const authData = await authRes.json()
          if (authData.student) {
            localStorage.setItem('studentId', authData.student.id)
            await fetchStudentDataWithId(authData.student.id, subdomain)
            return
          }
        }
        loadEnhancedDemoData()
        return
      }

      await fetchStudentDataWithId(studentId, subdomain)

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

  const fetchStudentDataWithId = async (studentId: string, subdomain: string) => {
    try {
      const [studentRes, applicationsRes, documentsRes, paymentsRes, communicationsRes] = await Promise.all([
        fetch(`/api/${subdomain}/student/portal?studentId=${studentId}`),
        fetch(`/api/${subdomain}/student/portal/applications?studentId=${studentId}`),
        fetch(`/api/${subdomain}/student/portal/documents?studentId=${studentId}`),
        fetch(`/api/${subdomain}/student/portal/payments?studentId=${studentId}`),
        fetch(`/api/${subdomain}/student/portal/communications?studentId=${studentId}`)
      ])

      const studentData = await studentRes.json()
      const applicationsData = await applicationsRes.json()
      const documentsData = await documentsRes.json()
      const paymentsData = await paymentsRes.json()
      const communicationsData = await communicationsRes.json()

      if (studentData.student) {
        setStudent(studentData.student)
      }
      if (applicationsData.applications) {
        setApplications(applicationsData.applications)
      }
      if (documentsData.documents) {
        setDocuments(documentsData.documents)
      }
      if (paymentsData.invoices) {
        setPayments(paymentsData.invoices)
      }
      if (communicationsData.conversations) {
        setMessages(communicationsData.conversations[0]?.messages || [])
      }
      if (communicationsData.unreadNotificationsFormatted) {
        setNotifications(communicationsData.unreadNotificationsFormatted)
      }

    } catch (error) {
      console.error('Error fetching student data with ID:', error)
      throw error
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
      preferredCourses: ["Computer Science", "Data Science", "Software Engineering"]
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
            required: true
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
            movedAt: "2024-01-18"
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
            required: true
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
            movedAt: "2024-01-20"
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
        required: true
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
        required: true
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
        required: true
      },
      {
        id: "5",
        name: "English Proficiency Certificate",
        category: "LANGUAGE",
        type: "PDF",
        status: "PENDING",
        uploadedAt: "2024-01-14",
        fileSize: 768000,
        fileUrl: "/files/english.pdf",
        required: true
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
        paidDate: "2024-01-10"
      },
      {
        id: "2",
        invoiceNumber: "INV-2024-002",
        amount: 1500,
        currency: "USD",
        status: "PENDING",
        dueDate: "2024-02-01",
        description: "Application Fee - MIT"
      }
    ]

    setStudent(mockStudent)
    setApplications(mockApplications)
    setDocuments(mockDocuments)
    setPayments(mockPayments)
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
        priority: "MEDIUM"
      },
      {
        id: "2",
        type: "TASK",
        title: "Missing Document",
        message: "Please upload your recommendation letter for Harvard application.",
        createdAt: "2024-01-17T14:30:00Z",
        priority: "HIGH"
      },
      {
        id: "3",
        type: "SUCCESS",
        title: "Application Progress",
        message: "Your MIT application is now 45% complete.",
        createdAt: "2024-01-16T09:15:00Z",
        priority: "LOW"
      },
      {
        id: "4",
        type: "REMINDER",
        title: "Payment Due",
        message: "Your MIT application fee of $1,500 is due on February 1st.",
        createdAt: "2024-01-15T16:00:00Z",
        priority: "HIGH"
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
          avatar: "/avatars/sarah.jpg"
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
          avatar: "/avatars/sarah.jpg"
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
        consultantName: "Sarah Johnson"
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
        dueDate: "2024-01-25"
      },
      {
        id: "2",
        title: "Complete English Test",
        description: "Schedule and complete English proficiency test",
        status: "IN_PROGRESS",
        priority: "MEDIUM",
        dueDate: "2024-01-30"
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
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const unreadNotifications = notifications.filter(n => !n.readAt).length
  const unreadMessages = messages.filter(m => !m.readAt && m.direction === "INBOUND").length

  // Calculate statistics
  const totalApplications = applications.length
  const activeApplications = applications.filter(app => 
    ["PENDING", "UNDER_REVIEW", "IN_PROGRESS"].includes(app.status)
  ).length
  const completedApplications = applications.filter(app => 
    ["COMPLETED", "ACCEPTED"].includes(app.status)
  ).length
  const verifiedDocuments = documents.filter(doc => doc.status === "VERIFIED").length
  const totalDocuments = documents.length
  const documentProgress = totalDocuments > 0 ? (verifiedDocuments / totalDocuments) * 100 : 0
  const upcomingAppointments = appointments.filter(apt => 
    new Date(apt.startTime) > new Date()
  ).length
  const pendingTasks = tasks.filter(task => task.status !== "COMPLETED").length
  const overduePayments = payments.filter(payment => 
    payment.status === "PENDING" && new Date(payment.dueDate) < new Date()
  ).length

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const studentId = localStorage.getItem('studentId') || new URLSearchParams(window.location.search).get('studentId')
    const subdomain = window.location.hostname.split('.')[0]

    if (!studentId) {
      toast({
        title: "Error",
        description: "Student ID not found. Please log in again.",
        variant: "destructive"
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('studentId', studentId)
      formData.append('documentType', 'UPLOADED')
      formData.append('file', file)

      const response = await fetch(`/api/${subdomain}/student/portal/documents`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      
      // Refresh documents list
      const documentsRes = await fetch(`/api/${subdomain}/student/portal/documents?studentId=${studentId}`)
      const documentsData = await documentsRes.json()
      if (documentsData.documents) {
        setDocuments(documentsData.documents)
      }

      toast({
        title: "Upload Successful",
        description: result.message || `${file.name} has been uploaded successfully.`,
      })

    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    const studentId = localStorage.getItem('studentId') || new URLSearchParams(window.location.search).get('studentId')
    const subdomain = window.location.hostname.split('.')[0]

    if (!studentId) {
      toast({
        title: "Error",
        description: "Student ID not found. Please log in again.",
        variant: "destructive"
      })
      return
    }

    try {
      const response = await fetch(`/api/${subdomain}/student/portal/communications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId,
          recipientId: 'consultant', // This would be dynamic in real implementation
          content: newMessage,
          type: 'TEXT'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const result = await response.json()
      
      // Add message to local state
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
        description: result.message || "Your message has been sent to your consultant.",
      })

    } catch (error) {
      console.error('Send message error:', error)
      toast({
        title: "Send Failed",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      })
    }
  }

  const markNotificationAsRead = async (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, readAt: new Date().toISOString() }
          : notif
      )
    )

    // In a real implementation, you would also update the backend
    try {
      const studentId = localStorage.getItem('studentId') || new URLSearchParams(window.location.search).get('studentId')
      const subdomain = window.location.hostname.split('.')[0]

      if (studentId) {
        await fetch(`/api/${subdomain}/notifications/${notificationId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ isRead: true })
        })
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleViewApplicationDetails = async (applicationId: string) => {
    try {
      const studentId = localStorage.getItem('studentId') || new URLSearchParams(window.location.search).get('studentId')
      const subdomain = window.location.hostname.split('.')[0]

      if (!studentId) {
        toast({
          title: "Error",
          description: "Student ID not found. Please log in again.",
          variant: "destructive"
        })
        return
      }

      const response = await fetch(`/api/${subdomain}/applications/${applicationId}?studentId=${studentId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch application details')
      }

      const applicationData = await response.json()
      setSelectedApplication(applicationData.application)
      
      // In a real implementation, you would open a modal or navigate to a details page
      toast({
        title: "Application Details",
        description: "Application details loaded successfully.",
      })

    } catch (error) {
      console.error('Error fetching application details:', error)
      toast({
        title: "Error",
        description: "Failed to load application details.",
        variant: "destructive"
      })
    }
  }

  const handleDownloadDocuments = async (applicationId: string) => {
    try {
      const studentId = localStorage.getItem('studentId') || new URLSearchParams(window.location.search).get('studentId')
      const subdomain = window.location.hostname.split('.')[0]

      if (!studentId) {
        toast({
          title: "Error",
          description: "Student ID not found. Please log in again.",
          variant: "destructive"
        })
        return
      }

      // In a real implementation, this would generate and download a ZIP file
      const response = await fetch(`/api/${subdomain}/applications/${applicationId}/documents?studentId=${studentId}`)
      if (!response.ok) {
        throw new Error('Failed to download documents')
      }

      // Create a blob from the response
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `application-${applicationId}-documents.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Download Started",
        description: "Your documents are being downloaded.",
      })

    } catch (error) {
      console.error('Error downloading documents:', error)
      toast({
        title: "Error",
        description: "Failed to download documents.",
        variant: "destructive"
      })
    }
  }

  const handleViewDocument = async (documentId: string) => {
    try {
      const studentId = localStorage.getItem('studentId') || new URLSearchParams(window.location.search).get('studentId')
      const subdomain = window.location.hostname.split('.')[0]

      if (!studentId) {
        toast({
          title: "Error",
          description: "Student ID not found. Please log in again.",
          variant: "destructive"
        })
        return
      }

      const response = await fetch(`/api/${subdomain}/documents/${documentId}?studentId=${studentId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch document')
      }

      const documentData = await response.json()
      
      // In a real implementation, this would open the document in a new tab
      if (documentData.document.filePath) {
        window.open(documentData.document.filePath, '_blank')
      }

      toast({
        title: "Document Opened",
        description: "Document opened in new tab.",
      })

    } catch (error) {
      console.error('Error viewing document:', error)
      toast({
        title: "Error",
        description: "Failed to open document.",
        variant: "destructive"
      })
    }
  }

  const handleDownloadDocument = async (documentId: string) => {
    try {
      const studentId = localStorage.getItem('studentId') || new URLSearchParams(window.location.search).get('studentId')
      const subdomain = window.location.hostname.split('.')[0]

      if (!studentId) {
        toast({
          title: "Error",
          description: "Student ID not found. Please log in again.",
          variant: "destructive"
        })
        return
      }

      const response = await fetch(`/api/${subdomain}/documents/${documentId}/download?studentId=${studentId}`)
      if (!response.ok) {
        throw new Error('Failed to download document')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `document-${documentId}.pdf` // This would be dynamic based on document type
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Download Started",
        description: "Your document is being downloaded.",
      })

    } catch (error) {
      console.error('Error downloading document:', error)
      toast({
        title: "Error",
        description: "Failed to download document.",
        variant: "destructive"
      })
    }
  }

  const handleMakePayment = async (invoiceId: string) => {
    try {
      const studentId = localStorage.getItem('studentId') || new URLSearchParams(window.location.search).get('studentId')
      const subdomain = window.location.hostname.split('.')[0]

      if (!studentId) {
        toast({
          title: "Error",
          description: "Student ID not found. Please log in again.",
          variant: "destructive"
        })
        return
      }

      // In a real implementation, this would integrate with a payment processor
      const response = await fetch(`/api/${subdomain}/student/portal/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          invoiceId,
          amount: 0, // This would be the invoice amount
          paymentMethod: 'STRIPE' // This would be selected by user
        })
      })

      if (!response.ok) {
        throw new Error('Failed to process payment')
      }

      const result = await response.json()
      
      // Refresh payments data
      const paymentsRes = await fetch(`/api/${subdomain}/student/portal/payments?studentId=${studentId}`)
      const paymentsData = await paymentsRes.json()
      if (paymentsData.invoices) {
        setPayments(paymentsData.invoices)
      }

      toast({
        title: "Payment Successful",
        description: result.message || "Your payment has been processed successfully.",
      })

    } catch (error) {
      console.error('Error processing payment:', error)
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Failed to process payment.",
        variant: "destructive"
      })
    }
  }

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const studentId = localStorage.getItem('studentId') || new URLSearchParams(window.location.search).get('studentId')
      const subdomain = window.location.hostname.split('.')[0]

      if (!studentId) {
        toast({
          title: "Error",
          description: "Student ID not found. Please log in again.",
          variant: "destructive"
        })
        return
      }

      const response = await fetch(`/api/${subdomain}/accounting/invoices/${invoiceId}/download?studentId=${studentId}`)
      if (!response.ok) {
        throw new Error('Failed to download invoice')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${invoiceId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Download Started",
        description: "Your invoice is being downloaded.",
      })

    } catch (error) {
      console.error('Error downloading invoice:', error)
      toast({
        title: "Error",
        description: "Failed to download invoice.",
        variant: "destructive"
      })
    }
  }

  const handleScheduleMeeting = async () => {
    try {
      const studentId = localStorage.getItem('studentId') || new URLSearchParams(window.location.search).get('studentId')
      const subdomain = window.location.hostname.split('.')[0]

      if (!studentId) {
        toast({
          title: "Error",
          description: "Student ID not found. Please log in again.",
          variant: "destructive"
        })
        return
      }

      // In a real implementation, this would open a scheduling interface
      toast({
        title: "Meeting Scheduler",
        description: "Meeting scheduling feature would open here.",
      })

    } catch (error) {
      console.error('Error scheduling meeting:', error)
      toast({
        title: "Error",
        description: "Failed to open meeting scheduler.",
        variant: "destructive"
      })
    }
  }

  const handleUpdateProfile = async (profileData: any) => {
    try {
      const studentId = localStorage.getItem('studentId') || new URLSearchParams(window.location.search).get('studentId')
      const subdomain = window.location.hostname.split('.')[0]

      if (!studentId) {
        toast({
          title: "Error",
          description: "Student ID not found. Please log in again.",
          variant: "destructive"
        })
        return
      }

      const response = await fetch(`/api/${subdomain}/students/${studentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const result = await response.json()
      
      // Refresh student data
      const studentRes = await fetch(`/api/${subdomain}/student/portal?studentId=${studentId}`)
      const studentData = await studentRes.json()
      if (studentData.student) {
        setStudent(studentData.student)
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      })

    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      })
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="text-primary-foreground h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Student Portal
                </h1>
                <p className="text-muted-foreground">
                  Welcome back, {student?.firstName} {student?.lastName}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="h-6 w-6 text-muted-foreground cursor-pointer" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                    {unreadNotifications}
                  </span>
                )}
              </div>
              <div className="relative">
                <MessageSquare className="h-6 w-6 text-muted-foreground cursor-pointer" />
                {unreadMessages > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                    {unreadMessages}
                  </span>
                )}
              </div>
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
        {/* Dashboard Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalApplications}</div>
              <p className="text-xs text-muted-foreground">
                {activeApplications} active, {completedApplications} completed
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
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

          <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasks</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingTasks}</div>
              <p className="text-xs text-muted-foreground">
                {tasks.filter(t => t.priority === "HIGH").length} high priority
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payments</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${payments.filter(p => p.status === "PAID").reduce((sum, p) => sum + p.amount, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {overduePayments} overdue payments
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
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
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <Upload className="h-6 w-6" />
                    <span className="text-sm">Upload Document</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2"
                    onClick={handleScheduleMeeting}
                  >
                    <Calendar className="h-6 w-6" />
                    <span className="text-sm">Schedule Meeting</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2"
                    onClick={() => setActiveTab("communication")}
                  >
                    <MessageSquare className="h-6 w-6" />
                    <span className="text-sm">Message Consultant</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2"
                    onClick={() => setActiveTab("payments")}
                  >
                    <DollarSign className="h-6 w-6" />
                    <span className="text-sm">Make Payment</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Applications</CardTitle>
                  <CardDescription>Your latest application updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {applications.slice(0, 3).map((app) => (
                      <div key={app.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{app.university}</h4>
                          <p className="text-sm text-muted-foreground">{app.program}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(app.status)}>
                            {app.status.replace('_', ' ')}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {app.progress * 100}% complete
                          </p>
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
                      <div key={apt.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <h4 className="font-medium">{apt.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(apt.startTime).toLocaleDateString()}
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
            </div>
          </TabsContent>

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
                            {app.intake && (
                              <Badge variant="outline" className="mt-2">
                                {app.intake}
                              </Badge>
                            )}
                          </div>
                          <Badge className={getStatusColor(app.status)}>
                            {app.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-4 mb-4">
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
                            <p className="text-sm text-muted-foreground">Last Updated</p>
                            <p className="text-sm font-medium">{formatDate(app.updatedAt)}</p>
                          </div>
                        </div>

                        {app.pipelineEntries.length > 0 && (
                          <div className="border-t pt-4">
                            <p className="text-sm text-muted-foreground mb-2">Current Stage</p>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-sm font-medium">
                                {app.pipelineEntries[0].currentStage}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 mt-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewApplicationDetails(app.id)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownloadDocuments(app.id)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download Documents
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Management</CardTitle>
                <CardDescription>Upload and manage your application documents</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Upload Section */}
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 mb-6">
                  <div className="text-center">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Upload Documents</h3>
                    <p className="text-muted-foreground mb-4">
                      Drag and drop your files here, or click to browse
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      disabled={isUploading}
                    />
                    <label htmlFor="file-upload">
                      <Button disabled={isUploading}>
                        {isUploading ? 'Uploading...' : 'Choose Files'}
                      </Button>
                    </label>
                    {isUploading && (
                      <div className="mt-4">
                        <Progress value={uploadProgress} className="w-full" />
                        <p className="text-sm text-muted-foreground mt-2">
                          {uploadProgress}% uploaded
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Documents List */}
                <div className="space-y-4">
                  {documents.map((doc) => (
                    <Card key={doc.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-medium">{doc.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {doc.category} • {formatFileSize(doc.fileSize)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={getStatusColor(doc.status)}>
                              {getStatusIcon(doc.status)}
                              <span className="ml-1">{doc.status.replace('_', ' ')}</span>
                            </Badge>
                            {doc.required && (
                              <Badge variant="outline">Required</Badge>
                            )}
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleViewDocument(doc.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDownloadDocument(doc.id)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Manage your application fees and payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <Card key={payment.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">{payment.invoiceNumber}</h3>
                            <p className="text-muted-foreground">{payment.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">
                              {payment.currency} {payment.amount.toLocaleString()}
                            </p>
                            <Badge className={getStatusColor(payment.status)}>
                              {getStatusIcon(payment.status)}
                              <span className="ml-1">{payment.status.replace('_', ' ')}</span>
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Due Date</p>
                            <p className="text-sm font-medium">{formatDate(payment.dueDate)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <p className="text-sm font-medium">{payment.status.replace('_', ' ')}</p>
                          </div>
                          {payment.paidDate && (
                            <div>
                              <p className="text-sm text-muted-foreground">Paid Date</p>
                              <p className="text-sm font-medium">{formatDate(payment.paidDate)}</p>
                            </div>
                          )}
                        </div>

                        {payment.status === "PENDING" && (
                          <div className="flex gap-2 mt-4">
                            <Button 
                              size="sm"
                              onClick={() => handleMakePayment(payment.id)}
                            >
                              <DollarSign className="h-4 w-4 mr-2" />
                              Pay Now
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDownloadInvoice(payment.id)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download Invoice
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="communication" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Messages */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Messages</CardTitle>
                  <CardDescription>Communicate with your education consultant</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.direction === "OUTBOUND" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md p-3 rounded-lg ${
                            message.direction === "OUTBOUND"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          {message.sender && (
                            <p className="text-xs font-medium mb-1">
                              {message.sender.name}
                            </p>
                          )}
                          <p className="text-sm">{message.message}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2 mt-4">
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

              {/* Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Important updates and reminders</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          notification.readAt ? "bg-muted/50" : "bg-background"
                        }`}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(notification.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge className={getPriorityColor(notification.priority)}>
                              {notification.priority}
                            </Badge>
                            {!notification.readAt && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
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
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Manage your personal and academic information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" value={student?.firstName || ""} />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" value={student?.lastName || ""} />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={student?.email || ""} />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" value={student?.phone || ""} />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nationality">Nationality</Label>
                      <Input id="nationality" value={student?.nationality || ""} />
                    </div>
                    <div>
                      <Label htmlFor="currentEducation">Current Education</Label>
                      <Input id="currentEducation" value={student?.currentEducation || ""} />
                    </div>
                    <div>
                      <Label htmlFor="gpa">GPA</Label>
                      <Input id="gpa" type="number" step="0.1" value={student?.gpa || ""} />
                    </div>
                    <div>
                      <Label htmlFor="budget">Budget (USD)</Label>
                      <Input id="budget" type="number" value={student?.budget || ""} />
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button onClick={() => {
                    const profileData = {
                      firstName: student?.firstName,
                      lastName: student?.lastName,
                      email: student?.email,
                      phone: student?.phone,
                      nationality: student?.nationality,
                      currentEducation: student?.currentEducation,
                      gpa: student?.gpa,
                      budget: student?.budget
                    }
                    handleUpdateProfile(profileData)
                  }}>
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
