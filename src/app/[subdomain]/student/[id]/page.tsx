"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  GraduationCap, 
  FileText, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Edit, 
  Trash2, 
  Plus, 
  Send,
  Download,
  Eye,
  Settings,
  Activity,
  Target,
  BookOpen,
  Globe,
  CreditCard,
  Bell,
  Users,
  Building2,
  Award,
  TrendingUp,
  Loader2,
  ArrowLeft,
  ExternalLink,
  Copy,
  RefreshCw
} from "lucide-react"
import { format } from "date-fns"

interface Student {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  alternatePhone?: string
  dateOfBirth?: string
  nationality?: string
  passportNumber?: string
  gender?: string
  maritalStatus?: string
  address?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  emergencyContactRelation?: string
  status: 'PROSPECT' | 'APPLIED' | 'ACCEPTED' | 'ENROLLED' | 'GRADUATED' | 'WITHDRAWN'
  stage: 'INQUIRY' | 'CONSULTATION' | 'APPLICATION' | 'DOCUMENTATION' | 'VISA_PROCESSING' | 'PRE_DEPARTURE' | 'POST_ARRIVAL'
  currentEducation?: string
  educationLevel?: string
  institution?: string
  gpa?: number
  testScores?: string
  englishProficiency?: string
  source?: string
  medium?: string
  campaign?: string
  content?: string
  term?: string
  referrer?: string
  leadSource?: string
  leadSourceDetail?: string
  portalAccess: boolean
  portalEmail?: string
  portalInvitationSent: boolean
  portalInvitationSentAt?: string
  portalLastLogin?: string
  preferredCountries: string[]
  preferredCourses: string[]
  preferredStudyLevels: string[]
  budget?: number
  budgetCurrency?: string
  availableIntakes: string[]
  studyMode?: string
  preferredContactMethod?: string
  emailNotifications: boolean
  smsNotifications: boolean
  marketingConsent: boolean
  workExperience?: string
  achievements?: string
  extracurricular?: string
  interests?: string
  notes?: string
  assignedTo?: string
  firstContactAt?: string
  lastContactAt?: string
  nextFollowUpAt?: string
  createdAt: string
  updatedAt: string
}

interface Application {
  id: string
  university: {
    name: string
    country: string
    city: string
    website?: string
  }
  program: string
  programLevel?: string
  studyMode?: string
  intake?: string
  intakeYear?: number
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN'
  subStatus?: string
  priority?: string
  applicationFee?: number
  applicationFeePaid: boolean
  submissionDate?: string
  deadlineDate?: string
  progressPercentage: number
  currentStage?: string
  tuitionFee?: number
  scholarshipAmount?: number
  documentsVerified: boolean
  interviewRequired: boolean
  interviewScheduled: boolean
  interviewDate?: string
  offerReceived: boolean
  offerReceivedAt?: string
  offerAccepted: boolean
  enrollmentConfirmed: boolean
  visaRequired: boolean
  visaApplied: boolean
  visaApproved: boolean
  assignedTo?: string
  createdAt: string
  updatedAt: string
}

interface Document {
  id: string
  name: string
  type: string
  category: string
  status: 'UPLOADED' | 'PENDING' | 'REVIEWED' | 'APPROVED' | 'REJECTED'
  uploadedAt: string
  size?: number
  url?: string
  notes?: string
}

interface Appointment {
  id: string
  title: string
  type: string
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  date: string
  time: string
  duration: number
  location?: string
  description?: string
  assignedTo?: string
  createdAt: string
}

interface Communication {
  id: string
  type: 'EMAIL' | 'PHONE' | 'SMS' | 'MEETING'
  direction: 'INCOMING' | 'OUTGOING'
  subject?: string
  content: string
  status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED'
  sentAt: string
  sentBy?: string
  notes?: string
}

interface TimelineEvent {
  id: string
  type: string
  title: string
  description: string
  timestamp: string
  user?: string
  icon?: string
  color?: string
}

const countries = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany",
  "France", "Netherlands", "Sweden", "Norway", "Denmark", "Finland",
  "Switzerland", "Austria", "Belgium", "Ireland", "New Zealand",
  "Singapore", "Japan", "South Korea", "China", "India", "United Arab Emirates"
]

const studyLevels = [
  "Undergraduate", "Postgraduate", "PhD", "Foundation", "Diploma", "Certificate"
]

const studyModes = [
  "FULL_TIME", "PART_TIME", "ONLINE", "HYBRID"
]

export default function StudentProfilePage() {
  const params = useParams()
  const router = useRouter()
  const subdomain = params.subdomain as string
  const studentId = params.id as string
  
  const [student, setStudent] = useState<Student | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [communications, setCommunications] = useState<Communication[]>([])
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [isEditing, setIsEditing] = useState(false)
  const [sendingInvitation, setSendingInvitation] = useState(false)

  // Fetch student data
  const fetchStudentData = async () => {
    try {
      setLoading(true)
      
      // Fetch student details
      const studentResponse = await fetch(`/api/${subdomain}/students/${studentId}`)
      if (!studentResponse.ok) {
        throw new Error('Failed to fetch student data')
      }
      const studentData = await studentResponse.json()
      setStudent(studentData.student)

      // Fetch applications
      const applicationsResponse = await fetch(`/api/${subdomain}/applications?studentId=${studentId}`)
      if (applicationsResponse.ok) {
        const applicationsData = await applicationsResponse.json()
        setApplications(applicationsData.applications || [])
      }

      // Fetch documents
      const documentsResponse = await fetch(`/api/${subdomain}/documents?studentId=${studentId}`)
      if (documentsResponse.ok) {
        const documentsData = await documentsResponse.json()
        setDocuments(documentsData.documents || [])
      }

      // Fetch appointments
      const appointmentsResponse = await fetch(`/api/${subdomain}/appointments?studentId=${studentId}`)
      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json()
        setAppointments(appointmentsData.appointments || [])
      }

      // Fetch communications
      const communicationsResponse = await fetch(`/api/${subdomain}/communications?studentId=${studentId}`)
      if (communicationsResponse.ok) {
        const communicationsData = await communicationsResponse.json()
        setCommunications(communicationsData.communications || [])
      }

      // Generate timeline events
      const events: TimelineEvent[] = []
      
      // Student creation
      events.push({
        id: '1',
        type: 'created',
        title: 'Student Profile Created',
        description: 'Student profile was created in the system',
        timestamp: studentData.student.createdAt,
        icon: 'User',
        color: 'blue'
      })

      // First contact
      if (studentData.student.firstContactAt) {
        events.push({
          id: '2',
          type: 'contact',
          title: 'First Contact Made',
          description: 'Initial contact was established with the student',
          timestamp: studentData.student.firstContactAt,
          icon: 'Phone',
          color: 'green'
        })
      }

      // Portal invitation
      if (studentData.student.portalInvitationSentAt) {
        events.push({
          id: '3',
          type: 'invitation',
          title: 'Portal Invitation Sent',
          description: 'Student portal access invitation was sent',
          timestamp: studentData.student.portalInvitationSentAt,
          icon: 'Send',
          color: 'purple'
        })
      }

      // Applications
      applicationsData?.applications?.forEach((app: any, index: number) => {
        events.push({
          id: `app-${index}`,
          type: 'application',
          title: `Application Submitted: ${app.university.name}`,
          description: `Applied for ${app.program} program`,
          timestamp: app.createdAt,
          icon: 'GraduationCap',
          color: 'orange'
        })
      })

      // Sort events by timestamp
      events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setTimeline(events)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch student data')
    } finally {
      setLoading(false)
    }
  }

  // Send portal invitation
  const sendPortalInvitation = async () => {
    if (!student) return

    setSendingInvitation(true)
    try {
      const response = await fetch(`/api/${subdomain}/student/${studentId}/portal/invitation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: student.portalEmail || student.email,
          name: `${student.firstName} ${student.lastName}`
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send portal invitation')
      }

      // Update student data
      await fetchStudentData()
      alert('Portal invitation sent successfully!')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to send portal invitation')
    } finally {
      setSendingInvitation(false)
    }
  }

  // Copy portal link
  const copyPortalLink = () => {
    if (!student) return
    
    const portalLink = `${window.location.origin}/${subdomain}/student/portal`
    navigator.clipboard.writeText(portalLink)
    alert('Portal link copied to clipboard!')
  }

  useEffect(() => {
    if (studentId) {
      fetchStudentData()
    }
  }, [studentId, subdomain])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PROSPECT": return "bg-blue-100 text-blue-800"
      case "APPLIED": return "bg-yellow-100 text-yellow-800"
      case "ACCEPTED": return "bg-green-100 text-green-800"
      case "ENROLLED": return "bg-purple-100 text-purple-800"
      case "GRADUATED": return "bg-gray-100 text-gray-800"
      case "WITHDRAWN": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "INQUIRY": return "bg-gray-100 text-gray-800"
      case "CONSULTATION": return "bg-blue-100 text-blue-800"
      case "APPLICATION": return "bg-yellow-100 text-yellow-800"
      case "DOCUMENTATION": return "bg-orange-100 text-orange-800"
      case "VISA_PROCESSING": return "bg-purple-100 text-purple-800"
      case "PRE_DEPARTURE": return "bg-green-100 text-green-800"
      case "POST_ARRIVAL": return "bg-teal-100 text-teal-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT": return "bg-gray-100 text-gray-800"
      case "SUBMITTED": return "bg-blue-100 text-blue-800"
      case "UNDER_REVIEW": return "bg-yellow-100 text-yellow-800"
      case "APPROVED": return "bg-green-100 text-green-800"
      case "REJECTED": return "bg-red-100 text-red-800"
      case "WITHDRAWN": return "bg-orange-100 text-orange-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case "UPLOADED": return "bg-blue-100 text-blue-800"
      case "PENDING": return "bg-yellow-100 text-yellow-800"
      case "REVIEWED": return "bg-orange-100 text-orange-800"
      case "APPROVED": return "bg-green-100 text-green-800"
      case "REJECTED": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error || 'Student not found'}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">
                    {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                  </span>
                </div>
                <div>
                  <h1 className="text-xl font-bold">{student.firstName} {student.lastName}</h1>
                  <p className="text-sm text-muted-foreground">{student.email}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(student.status)}>
                {student.status}
              </Badge>
              <Badge className={getStageColor(student.stage)}>
                {student.stage.replace('_', ' ')}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="communications">Communications</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Basic details and contact information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                      <p className="text-lg">{student.firstName} {student.lastName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                      <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {student.email}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {student.phone || 'Not provided'}
                      </p>
                    </div>
                    {student.alternatePhone && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Alternate Phone</Label>
                        <p className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {student.alternatePhone}
                        </p>
                      </div>
                    )}
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Date of Birth</Label>
                      <p className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {student.dateOfBirth ? format(new Date(student.dateOfBirth), 'PPP') : 'Not provided'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Nationality</Label>
                      <p>{student.nationality || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {student.address ? `${student.address}, ${student.city}, ${student.state}, ${student.country}` : 'Not provided'}
                      </p>
                    </div>
                    {student.emergencyContactName && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Emergency Contact</Label>
                        <p>{student.emergencyContactName} - {student.emergencyContactPhone}</p>
                        <p className="text-sm text-muted-foreground">{student.emergencyContactRelation}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Preferred Contact</Label>
                      <p>{student.preferredContactMethod || 'Email'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Communication Preferences</Label>
                      <div className="flex gap-4 mt-1">
                        <span className={`text-sm ${student.emailNotifications ? 'text-green-600' : 'text-red-600'}`}>
                          Email: {student.emailNotifications ? 'Yes' : 'No'}
                        </span>
                        <span className={`text-sm ${student.smsNotifications ? 'text-green-600' : 'text-red-600'}`}>
                          SMS: {student.smsNotifications ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Academic Information</CardTitle>
                <CardDescription>Educational background and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Current Education</Label>
                      <p>{student.currentEducation || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Education Level</Label>
                      <p>{student.educationLevel || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Institution</Label>
                      <p>{student.institution || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">GPA</Label>
                      <p>{student.gpa || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Preferred Countries</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {student.preferredCountries?.map((country, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {country}
                          </Badge>
                        )) || <span className="text-muted-foreground">Not specified</span>}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Preferred Courses</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {student.preferredCourses?.map((course, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {course}
                          </Badge>
                        )) || <span className="text-muted-foreground">Not specified</span>}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Study Level</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {student.preferredStudyLevels?.map((level, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {level}
                          </Badge>
                        )) || <span className="text-muted-foreground">Not specified</span>}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Budget</Label>
                      <p>{student.budget ? `${student.budgetCurrency} ${student.budget.toLocaleString()}` : 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Source Tracking */}
            <Card>
              <CardHeader>
                <CardTitle>Source Tracking</CardTitle>
                <CardDescription>How the student found your agency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Source</Label>
                      <p>{student.source || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Medium</Label>
                      <p>{student.medium || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Campaign</Label>
                      <p>{student.campaign || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Lead Source</Label>
                      <p>{student.leadSource || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Lead Source Details</Label>
                      <p>{student.leadSourceDetail || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Referrer</Label>
                      <p>{student.referrer || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Portal Access */}
            <Card>
              <CardHeader>
                <CardTitle>Student Portal Access</CardTitle>
                <CardDescription>Manage student portal access and credentials</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Portal Access</Label>
                      <Badge className={student.portalAccess ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {student.portalAccess ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Portal Email</Label>
                      <p>{student.portalEmail || student.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Invitation Sent</Label>
                      <Badge className={student.portalInvitationSent ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {student.portalInvitationSent ? "Yes" : "No"}
                      </Badge>
                    </div>
                    {student.portalInvitationSentAt && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Invitation Sent At</Label>
                        <p>{format(new Date(student.portalInvitationSentAt), 'PPP')}</p>
                      </div>
                    )}
                    {student.portalLastLogin && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Last Login</Label>
                        <p>{format(new Date(student.portalLastLogin), 'PPP')}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    {!student.portalInvitationSent && (
                      <Button onClick={sendPortalInvitation} disabled={sendingInvitation}>
                        {sendingInvitation ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Portal Invitation
                          </>
                        )}
                      </Button>
                    )}
                    {student.portalInvitationSent && (
                      <Button variant="outline" onClick={sendPortalInvitation} disabled={sendingInvitation}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Resend Invitation
                      </Button>
                    )}
                    <Button variant="outline" onClick={copyPortalLink}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Portal Link
                    </Button>
                    <Button variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Portal
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {student.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                  <CardDescription>Internal notes about the student</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{student.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Applications</h2>
                <p className="text-muted-foreground">Track university applications and progress</p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Application
              </Button>
            </div>

            {applications.length > 0 ? (
              <div className="space-y-4">
                {applications.map((application) => (
                  <Card key={application.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{application.university.name}</CardTitle>
                          <CardDescription>
                            {application.university.city}, {application.university.country}
                          </CardDescription>
                        </div>
                        <Badge className={getApplicationStatusColor(application.status)}>
                          {application.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Program</Label>
                            <p className="font-medium">{application.program}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Program Level</Label>
                            <p>{application.programLevel || 'Not specified'}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Study Mode</Label>
                            <p>{application.studyMode || 'Not specified'}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Intake</Label>
                            <p>{application.intake || 'Not specified'}</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Progress</Label>
                            <div className="space-y-2">
                              <Progress value={application.progressPercentage} className="w-full" />
                              <p className="text-sm text-muted-foreground">
                                {application.progressPercentage}% Complete
                              </p>
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Current Stage</Label>
                            <p>{application.currentStage || 'Not specified'}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Application Fee</Label>
                            <p>{application.applicationFee ? `$${application.applicationFee}` : 'Not specified'}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Tuition Fee</Label>
                            <p>{application.tuitionFee ? `$${application.tuitionFee}` : 'Not specified'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-4 border-t">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                        {application.university.website && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={application.university.website} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    This student hasn't applied to any universities yet.
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Application
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Documents</h2>
                <p className="text-muted-foreground">Manage student documents and files</p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </div>

            {documents.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((document) => (
                  <Card key={document.id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{document.name}</CardTitle>
                          <CardDescription>{document.type}</CardDescription>
                        </div>
                        <Badge className={getDocumentStatusColor(document.status)}>
                          {document.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                          <p className="text-sm">{document.category}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Uploaded</Label>
                          <p className="text-sm">{format(new Date(document.uploadedAt), 'PPp')}</p>
                        </div>
                        {document.size && (
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Size</Label>
                            <p className="text-sm">{(document.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        )}
                        <div className="flex gap-2 pt-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Documents Uploaded</h3>
                  <p className="text-muted-foreground mb-4">
                    No documents have been uploaded for this student yet.
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Upload First Document
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="communications" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Communications</h2>
                <p className="text-muted-foreground">Communication history and logs</p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Communication
              </Button>
            </div>

            {communications.length > 0 ? (
              <div className="space-y-4">
                {communications.map((communication) => (
                  <Card key={communication.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            communication.type === 'EMAIL' ? 'bg-blue-500' :
                            communication.type === 'PHONE' ? 'bg-green-500' :
                            communication.type === 'SMS' ? 'bg-purple-500' : 'bg-orange-500'
                          }`} />
                          <span className="font-medium capitalize">{communication.type}</span>
                          <Badge variant={communication.direction === 'INCOMING' ? 'default' : 'secondary'}>
                            {communication.direction}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(communication.sentAt), 'PPp')}
                        </div>
                      </div>
                      
                      {communication.subject && (
                        <div className="mb-2">
                          <Label className="text-sm font-medium text-muted-foreground">Subject</Label>
                          <p className="font-medium">{communication.subject}</p>
                        </div>
                      )}
                      
                      <div className="mb-3">
                        <Label className="text-sm font-medium text-muted-foreground">Content</Label>
                        <p className="text-sm mt-1">{communication.content}</p>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <Badge className={
                            communication.status === 'READ' ? 'bg-green-100 text-green-800' :
                            communication.status === 'DELIVERED' ? 'bg-blue-100 text-blue-800' :
                            communication.status === 'SENT' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {communication.status}
                          </Badge>
                          {communication.sentBy && (
                            <span className="text-sm text-muted-foreground">
                              By: {communication.sentBy}
                            </span>
                          )}
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Communications Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    No communication records found for this student.
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Log First Communication
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Appointments</h2>
                <p className="text-muted-foreground">Scheduled appointments and meetings</p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Appointment
              </Button>
            </div>

            {appointments.length > 0 ? (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{appointment.title}</CardTitle>
                          <CardDescription>{appointment.type}</CardDescription>
                        </div>
                        <Badge className={
                          appointment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                          appointment.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }>
                          {appointment.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{format(new Date(appointment.date), 'PPP')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{appointment.time} ({appointment.duration} minutes)</span>
                          </div>
                          {appointment.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{appointment.location}</span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          {appointment.description && (
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                              <p className="text-sm mt-1">{appointment.description}</p>
                            </div>
                          )}
                          {appointment.assignedTo && (
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">Assigned To</Label>
                              <p className="text-sm mt-1">{appointment.assignedTo}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-4 border-t">
                        <div className="text-sm text-muted-foreground">
                          Scheduled on {format(new Date(appointment.createdAt), 'PPp')}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Appointments Scheduled</h3>
                  <p className="text-muted-foreground mb-4">
                    No appointments have been scheduled for this student.
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule First Appointment
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Timeline</h2>
              <p className="text-muted-foreground">Student journey and activity history</p>
            </div>

            <div className="space-y-4">
              {timeline.map((event, index) => (
                <div key={event.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${
                      event.color === 'blue' ? 'bg-blue-500' :
                      event.color === 'green' ? 'bg-green-500' :
                      event.color === 'purple' ? 'bg-purple-500' :
                      event.color === 'orange' ? 'bg-orange-500' : 'bg-gray-500'
                    }`} />
                    {index < timeline.length - 1 && (
                      <div className="w-px h-16 bg-gray-200 mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{event.title}</h3>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(event.timestamp), 'PPp')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                        {event.user && (
                          <p className="text-xs text-muted-foreground mt-2">
                            By: {event.user}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}