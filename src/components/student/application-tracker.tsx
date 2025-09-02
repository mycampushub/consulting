"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { 
  FileText, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  Download, 
  MessageSquare, 
  Bell,
  TrendingUp,
  Target,
  Users,
  MapPin,
  GraduationCap,
  Award,
  Star,
  ChevronRight,
  ChevronDown,
  Plus,
  Filter,
  Search,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  Info,
  Zap
} from "lucide-react"

interface Application {
  id: string
  university: string
  program: string
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'IN_PROGRESS' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'ON_HOLD'
  submittedAt: string
  updatedAt: string
  progress: number
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  deadline?: string
  estimatedResponseTime?: string
  currentStage?: string
  nextSteps?: string[]
  requirements?: ApplicationRequirement[]
  documents: ApplicationDocument[]
  communications: ApplicationCommunication[]
  timeline: ApplicationTimeline[]
  universityInfo: UniversityInfo
  pipeline: PipelineInfo
}

interface ApplicationRequirement {
  id: string
  name: string
  type: 'DOCUMENT' | 'TEST' | 'INTERVIEW' | 'PAYMENT' | 'OTHER'
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'WAIVED' | 'NOT_APPLICABLE'
  dueDate?: string
  description: string
  completedAt?: string
  notes?: string
}

interface ApplicationDocument {
  id: string
  name: string
  category: string
  type: string
  status: 'UPLOADED' | 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED' | 'EXPIRING_SOON'
  uploadedAt: string
  fileSize: number
  fileUrl: string
  required: boolean
  verifiedBy?: string
  verifiedAt?: string
  rejectionReason?: string
}

interface ApplicationCommunication {
  id: string
  type: 'EMAIL' | 'PHONE' | 'MEETING' | 'PORTAL_MESSAGE'
  direction: 'INBOUND' | 'OUTBOUND'
  subject: string
  message: string
  timestamp: string
  sender?: string
  senderRole?: string
  readAt?: string
  attachments?: CommunicationAttachment[]
}

interface CommunicationAttachment {
  name: string
  size: number
  url: string
}

interface ApplicationTimeline {
  id: string
  stage: string
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'SKIPPED'
  startDate?: string
  endDate?: string
  description: string
  notes?: string
  responsible?: string
}

interface UniversityInfo {
  id: string
  name: string
  logo?: string
  website?: string
  ranking?: {
    world?: number
    national?: number
    subject?: number
  }
  location: {
    city: string
    country: string
    campus?: string
  }
  contactInfo?: {
    email?: string
    phone?: string
    address?: string
  }
  programDetails: {
    duration: string
    studyMode: string
    tuitionFee?: number
    currency?: string
    requirements?: string[]
  }
}

interface PipelineInfo {
  id: string
  name: string
  type: string
  currentStage: string
  progress: number
  stages: PipelineStage[]
  estimatedCompletion?: string
}

interface PipelineStage {
  id: string
  name: string
  description: string
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'SKIPPED'
  order: number
  estimatedDuration?: string
  actualDuration?: string
  notes?: string
}

interface ApplicationStats {
  totalApplications: number
  activeApplications: number
  completedApplications: number
  acceptedApplications: number
  rejectedApplications: number
  averageResponseTime: number
  successRate: number
  totalDocuments: number
  verifiedDocuments: number
  pendingActions: number
  upcomingDeadlines: number
}

export default function ApplicationTracker() {
  const [applications, setApplications] = useState<Application[]>([])
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [stats, setStats] = useState<ApplicationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'HIGH_PRIORITY'>('ALL')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadApplicationData()
  }, [])

  const loadApplicationData = () => {
    // Mock data for demonstration
    const mockApplications: Application[] = [
      {
        id: "1",
        university: "Harvard University",
        program: "Master of Computer Science",
        status: "UNDER_REVIEW",
        submittedAt: "2024-01-15",
        updatedAt: "2024-01-20",
        progress: 0.75,
        priority: "HIGH",
        deadline: "2024-02-15",
        estimatedResponseTime: "4-6 weeks",
        currentStage: "Document Review",
        nextSteps: [
          "Wait for document verification completion",
          "Prepare for potential interview",
          "Submit additional documents if requested"
        ],
        requirements: [
          {
            id: "req1",
            name: "Academic Transcript",
            type: "DOCUMENT",
            status: "COMPLETED",
            description: "Official academic transcripts from all previous institutions",
            completedAt: "2024-01-12"
          },
          {
            id: "req2",
            name: "Personal Statement",
            type: "DOCUMENT",
            status: "COMPLETED",
            description: "Statement of purpose outlining academic goals and research interests",
            completedAt: "2024-01-12"
          },
          {
            id: "req3",
            name: "Letters of Recommendation",
            type: "DOCUMENT",
            status: "IN_PROGRESS",
            description: "3 letters of recommendation from academic references",
            dueDate: "2024-01-25"
          },
          {
            id: "req4",
            name: "GRE Scores",
            type: "TEST",
            status: "COMPLETED",
            description: "GRE General Test scores",
            completedAt: "2024-01-10"
          }
        ],
        documents: [
          {
            id: "doc1",
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
            id: "doc2",
            name: "Personal Statement",
            category: "PERSONAL",
            type: "PDF",
            status: "VERIFIED",
            uploadedAt: "2024-01-12",
            fileSize: 1024000,
            fileUrl: "/files/statement.pdf",
            required: true,
            verifiedBy: "Mike Chen",
            verifiedAt: "2024-01-13"
          }
        ],
        communications: [
          {
            id: "comm1",
            type: "EMAIL",
            direction: "INBOUND",
            subject: "Application Received - Harvard University",
            message: "Dear Alex, We have received your application for the Master of Computer Science program...",
            timestamp: "2024-01-16T10:00:00Z",
            sender: "Harvard Admissions Office",
            senderRole: "Admissions Officer"
          }
        ],
        timeline: [
          {
            id: "timeline1",
            stage: "Application Submitted",
            status: "COMPLETED",
            startDate: "2024-01-15",
            endDate: "2024-01-15",
            description: "Application submitted successfully",
            responsible: "Alex Thompson"
          },
          {
            id: "timeline2",
            stage: "Initial Review",
            status: "COMPLETED",
            startDate: "2024-01-16",
            endDate: "2024-01-18",
            description: "Application under initial review by admissions committee",
            responsible: "Admissions Committee"
          },
          {
            id: "timeline3",
            stage: "Document Verification",
            status: "IN_PROGRESS",
            startDate: "2024-01-18",
            description: "Verification of submitted documents and credentials",
            responsible: "Document Review Team"
          }
        ],
        universityInfo: {
          id: "uni1",
          name: "Harvard University",
          logo: "/logos/harvard.png",
          website: "https://www.harvard.edu",
          ranking: {
            world: 2,
            national: 1,
            subject: 1
          },
          location: {
            city: "Cambridge",
            country: "United States",
            campus: "Main Campus"
          },
          contactInfo: {
            email: "admissions@harvard.edu",
            phone: "+1-617-495-1000",
            address: "Cambridge, MA 02138, USA"
          },
          programDetails: {
            duration: "2 years",
            studyMode: "Full-time",
            tuitionFee: 55000,
            currency: "USD",
            requirements: ["Bachelor's degree in CS or related field", "GRE scores", "TOEFL/IELTS"]
          }
        },
        pipeline: {
          id: "pipeline1",
          name: "Graduate Application Process",
          type: "ACADEMIC_APPLICATION",
          currentStage: "Document Verification",
          progress: 0.75,
          estimatedCompletion: "2024-02-01",
          stages: [
            {
              id: "stage1",
              name: "Application Submission",
              description: "Submit complete application with all required documents",
              status: "COMPLETED",
              order: 1,
              actualDuration: "3 days"
            },
            {
              id: "stage2",
              name: "Initial Review",
              description: "Initial screening by admissions committee",
              status: "COMPLETED",
              order: 2,
              actualDuration: "2 days"
            },
            {
              id: "stage3",
              name: "Document Verification",
              description: "Verification of academic documents and credentials",
              status: "IN_PROGRESS",
              order: 3,
              estimatedDuration: "5-7 days"
            },
            {
              id: "stage4",
              name: "Faculty Review",
              description: "Review by relevant faculty members",
              status: "PENDING",
              order: 4,
              estimatedDuration: "7-10 days"
            },
            {
              id: "stage5",
              name: "Final Decision",
              description: "Final admission decision by committee",
              status: "PENDING",
              order: 5,
              estimatedDuration: "3-5 days"
            }
          ]
        }
      },
      {
        id: "2",
        university: "MIT",
        program: "Master of Engineering",
        status: "IN_PROGRESS",
        submittedAt: "2024-01-10",
        updatedAt: "2024-01-22",
        progress: 0.45,
        priority: "MEDIUM",
        deadline: "2024-02-20",
        estimatedResponseTime: "6-8 weeks",
        currentStage: "Initial Review",
        nextSteps: [
          "Complete missing documents",
          "Wait for initial review completion",
          "Prepare for technical interview if required"
        ],
        requirements: [
          {
            id: "req5",
            name: "GRE Scores",
            type: "TEST",
            status: "COMPLETED",
            description: "GRE General Test scores (Quantitative: 168+ recommended)",
            completedAt: "2024-01-08"
          },
          {
            id: "req6",
            name: "Academic Transcript",
            type: "DOCUMENT",
            status: "COMPLETED",
            description: "Official academic transcripts",
            completedAt: "2024-01-10"
          },
          {
            id: "req7",
            name: "Statement of Purpose",
            type: "DOCUMENT",
            status: "IN_PROGRESS",
            description: "Detailed statement of purpose for engineering program",
            dueDate: "2024-01-25"
          }
        ],
        documents: [
          {
            id: "doc3",
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
        communications: [],
        timeline: [
          {
            id: "timeline4",
            stage: "Application Submitted",
            status: "COMPLETED",
            startDate: "2024-01-10",
            endDate: "2024-01-10",
            description: "Application submitted successfully"
          },
          {
            id: "timeline5",
            stage: "Initial Review",
            status: "IN_PROGRESS",
            startDate: "2024-01-20",
            description: "Application under initial review"
          }
        ],
        universityInfo: {
          id: "uni2",
          name: "Massachusetts Institute of Technology",
          logo: "/logos/mit.png",
          website: "https://www.mit.edu",
          ranking: {
            world: 1,
            national: 1,
            subject: 1
          },
          location: {
            city: "Cambridge",
            country: "United States",
            campus: "Main Campus"
          },
          programDetails: {
            duration: "2 years",
            studyMode: "Full-time",
            tuitionFee: 58000,
            currency: "USD"
          }
        },
        pipeline: {
          id: "pipeline2",
          name: "Engineering Application Process",
          type: "ACADEMIC_APPLICATION",
          currentStage: "Initial Review",
          progress: 0.45,
          estimatedCompletion: "2024-02-10",
          stages: [
            {
              id: "stage6",
              name: "Application Submission",
              description: "Submit complete application",
              status: "COMPLETED",
              order: 1
            },
            {
              id: "stage7",
              name: "Initial Review",
              description: "Initial screening process",
              status: "IN_PROGRESS",
              order: 2
            }
          ]
        }
      }
    ]

    const mockStats: ApplicationStats = {
      totalApplications: 2,
      activeApplications: 2,
      completedApplications: 0,
      acceptedApplications: 0,
      rejectedApplications: 0,
      averageResponseTime: 35,
      successRate: 0,
      totalDocuments: 5,
      verifiedDocuments: 3,
      pendingActions: 3,
      upcomingDeadlines: 2
    }

    setApplications(mockApplications)
    setStats(mockStats)
    setLoading(false)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "accepted":
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "under_review":
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      case "pending":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "submitted":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "on_hold":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "accepted":
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "under_review":
      case "in_progress":
        return <Clock className="h-4 w-4" />
      case "rejected":
        return <AlertCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "submitted":
        return <FileText className="h-4 w-4" />
      case "on_hold":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const filteredApplications = applications.filter(app => {
    const matchesFilter = filter === 'ALL' || 
      (filter === 'ACTIVE' && ['SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'PENDING'].includes(app.status)) ||
      (filter === 'COMPLETED' && ['ACCEPTED', 'COMPLETED', 'REJECTED'].includes(app.status)) ||
      (filter === 'HIGH_PRIORITY' && ['HIGH', 'CRITICAL'].includes(app.priority))
    
    const matchesSearch = app.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.program.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalApplications}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeApplications} active, {stats.completedApplications} completed
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.successRate}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.acceptedApplications} accepted, {stats.rejectedApplications} rejected
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.verifiedDocuments}/{stats.totalDocuments}</div>
              <Progress value={(stats.verifiedDocuments / stats.totalDocuments) * 100} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round((stats.verifiedDocuments / stats.totalDocuments) * 100)}% verified
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingActions}</div>
              <p className="text-xs text-muted-foreground">
                {stats.upcomingDeadlines} upcoming deadlines
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Applications</CardTitle>
              <CardDescription>Track and manage your university applications</CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Application
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === 'ALL' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('ALL')}
              >
                All ({applications.length})
              </Button>
              <Button
                variant={filter === 'ACTIVE' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('ACTIVE')}
              >
                Active ({applications.filter(app => ['SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'PENDING'].includes(app.status)).length})
              </Button>
              <Button
                variant={filter === 'HIGH_PRIORITY' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('HIGH_PRIORITY')}
              >
                High Priority ({applications.filter(app => ['HIGH', 'CRITICAL'].includes(app.priority)).length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.map((application) => (
          <Card key={application.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold">{application.university}</h3>
                      <Badge className={getPriorityColor(application.priority)}>
                        {application.priority}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-2">{application.program}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {application.universityInfo.location.city}, {application.universityInfo.location.country}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Applied: {formatDate(application.submittedAt)}
                      </div>
                      {application.deadline && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Deadline: {formatDate(application.deadline)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(application.status)}>
                    {getStatusIcon(application.status)}
                    <span className="ml-1">{application.status.replace('_', ' ')}</span>
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => setSelectedApplication(application)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>

              {/* Progress and Timeline */}
              <div className="grid md:grid-cols-2 gap-6 mb-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Application Progress</span>
                    <span className="text-sm text-muted-foreground">{(application.progress * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={application.progress * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Current Stage: {application.currentStage}
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Pipeline Progress</span>
                    <span className="text-sm text-muted-foreground">{(application.pipeline.progress * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={application.pipeline.progress * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {application.pipeline.stages.length} stages total
                  </p>
                </div>
              </div>

              {/* Next Steps */}
              {application.nextSteps && application.nextSteps.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Next Steps:</h4>
                  <div className="space-y-1">
                    {application.nextSteps.map((step, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ChevronRight className="h-3 w-3" />
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Requirements Status */}
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Requirements Status:</h4>
                <div className="flex flex-wrap gap-2">
                  {application.requirements?.map((req) => (
                    <Badge key={req.id} variant="outline" className="text-xs">
                      {req.name}: {req.status.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {application.estimatedResponseTime && (
                    <span className="text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 inline mr-1" />
                      Est. response: {application.estimatedResponseTime}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Documents
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    University Site
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Application Details - {selectedApplication.university}
              </DialogTitle>
              <DialogDescription>
                {selectedApplication.program}
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="requirements">Requirements</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="communications">Communications</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">University Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <GraduationCap className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{selectedApplication.universityInfo.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {selectedApplication.universityInfo.location.city}, {selectedApplication.universityInfo.location.country}
                            </p>
                          </div>
                        </div>
                        
                        {selectedApplication.universityInfo.ranking && (
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Rankings:</p>
                            <div className="flex gap-4 text-sm">
                              {selectedApplication.universityInfo.ranking.world && (
                                <span>World: #{selectedApplication.universityInfo.ranking.world}</span>
                              )}
                              {selectedApplication.universityInfo.ranking.national && (
                                <span>National: #{selectedApplication.universityInfo.ranking.national}</span>
                              )}
                              {selectedApplication.universityInfo.ranking.subject && (
                                <span>Subject: #{selectedApplication.universityInfo.ranking.subject}</span>
                              )}
                            </div>
                          </div>
                        )}

                        {selectedApplication.universityInfo.programDetails && (
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Program Details:</p>
                            <div className="text-sm space-y-1">
                              <p>Duration: {selectedApplication.universityInfo.programDetails.duration}</p>
                              <p>Study Mode: {selectedApplication.universityInfo.programDetails.studyMode}</p>
                              {selectedApplication.universityInfo.programDetails.tuitionFee && (
                                <p>Tuition: ${selectedApplication.universityInfo.programDetails.tuitionFee.toLocaleString()} {selectedApplication.universityInfo.programDetails.currency}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Application Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Status</span>
                          <Badge className={getStatusColor(selectedApplication.status)}>
                            {selectedApplication.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Priority</span>
                          <Badge className={getPriorityColor(selectedApplication.priority)}>
                            {selectedApplication.priority}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm">{(selectedApplication.progress * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={selectedApplication.progress * 100} className="h-2" />

                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Current Stage</span>
                          <span className="text-sm">{selectedApplication.currentStage}</span>
                        </div>

                        {selectedApplication.estimatedResponseTime && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Est. Response Time</span>
                            <span className="text-sm">{selectedApplication.estimatedResponseTime}</span>
                          </div>
                        )}

                        {selectedApplication.deadline && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Deadline</span>
                            <span className="text-sm">{formatDate(selectedApplication.deadline)}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Pipeline Visualization */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Application Pipeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedApplication.pipeline.stages.map((stage, index) => (
                        <div key={stage.id} className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            stage.status === 'COMPLETED' ? 'bg-green-500 text-white' :
                            stage.status === 'IN_PROGRESS' ? 'bg-blue-500 text-white' :
                            stage.status === 'PENDING' ? 'bg-gray-300 text-gray-600' :
                            'bg-orange-500 text-white'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{stage.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {stage.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{stage.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                              {stage.estimatedDuration && (
                                <span>Est: {stage.estimatedDuration}</span>
                              )}
                              {stage.actualDuration && (
                                <span>Actual: {stage.actualDuration}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Application Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedApplication.timeline.map((event, index) => (
                        <div key={event.id} className="flex gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            event.status === 'COMPLETED' ? 'bg-green-500 text-white' :
                            event.status === 'IN_PROGRESS' ? 'bg-blue-500 text-white' :
                            event.status === 'PENDING' ? 'bg-gray-300 text-gray-600' :
                            'bg-orange-500 text-white'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1 pb-4 border-l-2 border-gray-200">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium">{event.stage}</h4>
                              <Badge variant="outline" className="text-xs">
                                {event.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">{event.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              {event.startDate && (
                                <span>Start: {formatDate(event.startDate)}</span>
                              )}
                              {event.endDate && (
                                <span>End: {formatDate(event.endDate)}</span>
                              )}
                              {event.responsible && (
                                <span>Responsible: {event.responsible}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="requirements" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Application Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedApplication.requirements?.map((req) => (
                        <div key={req.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              req.status === 'COMPLETED' ? 'bg-green-500 text-white' :
                              req.status === 'IN_PROGRESS' ? 'bg-blue-500 text-white' :
                              req.status === 'PENDING' ? 'bg-gray-300 text-gray-600' :
                              req.status === 'WAIVED' ? 'bg-orange-500 text-white' :
                              'bg-red-500 text-white'
                            }`}>
                              {req.status === 'COMPLETED' ? '✓' : req.status === 'WAIVED' ? 'W' : req.status === 'NOT_APPLICABLE' ? 'N/A' : '?'}
                            </div>
                            <div>
                              <h4 className="font-medium">{req.name}</h4>
                              <p className="text-sm text-muted-foreground">{req.description}</p>
                              {req.dueDate && (
                                <p className="text-xs text-muted-foreground">
                                  Due: {formatDate(req.dueDate)}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="text-xs mb-1">
                              {req.type}
                            </Badge>
                            <Badge className={`text-xs ${getStatusColor(req.status)}`}>
                              {req.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Application Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedApplication.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                            <div>
                              <h4 className="font-medium">{doc.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {doc.category} • {formatFileSize(doc.fileSize)} • {formatDate(doc.uploadedAt)}
                              </p>
                              {doc.rejectionReason && (
                                <p className="text-sm text-red-600 mt-1">{doc.rejectionReason}</p>
                              )}
                              {doc.verifiedBy && (
                                <p className="text-sm text-green-600 mt-1">
                                  Verified by {doc.verifiedBy} on {formatDate(doc.verifiedAt!)}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(doc.status)}>
                              {doc.status.replace('_', ' ')}
                            </Badge>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="communications" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Application Communications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedApplication.communications.map((comm) => (
                        <div key={comm.id} className={`p-4 border rounded-lg ${
                          comm.direction === 'INBOUND' ? 'bg-blue-50' : 'bg-gray-50'
                        }`}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{comm.subject}</h4>
                              <Badge variant="outline" className="text-xs">
                                {comm.type}
                              </Badge>
                              <Badge variant={comm.direction === 'INBOUND' ? 'default' : 'secondary'} className="text-xs">
                                {comm.direction}
                              </Badge>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {formatDateTime(comm.timestamp)}
                            </span>
                          </div>
                          {comm.sender && (
                            <p className="text-sm text-muted-foreground mb-2">
                              From: {comm.sender} ({comm.senderRole})
                            </p>
                          )}
                          <p className="text-sm mb-2">{comm.message}</p>
                          {comm.attachments && comm.attachments.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-sm font-medium">Attachments:</p>
                              {comm.attachments.map((att, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <FileText className="h-4 w-4" />
                                  {att.name} ({formatFileSize(att.size)})
                                  <Button variant="ghost" size="sm">
                                    <Download className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}