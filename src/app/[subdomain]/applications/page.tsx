'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar,
  User,
  GraduationCap,
  CheckCircle,
  Clock,
  AlertCircle,
  MoreHorizontal,
  Loader2,
  ArrowRight,
  BookOpen,
  MapPin,
  DollarSign,
  Users,
  FileCheck,
  MessageSquare,
  Video,
  Plane,
  CreditCard,
  Award,
  Target
} from 'lucide-react'
import { format } from 'date-fns'

interface Application {
  id: string
  studentId: string
  student: {
    firstName: string
    lastName: string
    email: string
    currentEducation?: string
    gpa?: number
    englishProficiency?: string
    testScores?: string
  }
  universityId: string
  university: {
    name: string
    country: string
    city: string
    website?: string
    subjects: string[]
    studyLevels: string[]
    tuitionFeeRange?: {
      min: number
      max: number
      currency: string
    }
  }
  program: string
  programCode?: string
  programLevel?: string
  studyMode?: string
  duration?: number
  intake?: string
  intakeYear?: number
  startDate?: string
  expectedEndDate?: string
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN'
  subStatus?: string
  priority?: string
  applicationFee?: number
  applicationFeeCurrency?: string
  applicationFeePaid: boolean
  submissionDate?: string
  deadlineDate?: string
  currentEducation?: string
  gpa?: number
  englishProficiency?: string
  testScores?: string
  tuitionFee?: number
  tuitionFeeCurrency?: string
  scholarshipAmount?: number
  scholarshipCurrency?: string
  totalCost?: number
  fundingSource?: string[]
  progressPercentage: number
  currentStage?: string
  stageHistory?: string[]
  nextStep?: string
  nextStepDeadline?: string
  internalNotes?: string
  studentNotes?: string
  universityNotes?: string
  interviewRequired: boolean
  interviewScheduled: boolean
  interviewDate?: string
  interviewType?: string
  interviewStatus?: string
  interviewNotes?: string
  decisionDate?: string
  decisionMadeBy?: string
  decisionReason?: string
  conditions?: string[]
  offerReceived: boolean
  offerReceivedAt?: string
  offerAccepted: boolean
  offerAcceptedAt?: string
  offerRejected: boolean
  offerRejectedAt?: string
  enrollmentConfirmed: boolean
  enrollmentConfirmedAt?: string
  visaRequired: boolean
  visaApplied: boolean
  visaAppliedAt?: string
  visaApproved: boolean
  visaApprovedAt?: string
  visaRejected: boolean
  visaRejectedAt?: string
  visaNotes?: string
  payments?: any[]
  paymentPlan?: any
  financialAid?: any
  scholarships?: any
  assignedTo?: string
  assignedAt?: string
  lastContactAt?: string
  nextFollowUpAt?: string
  autoFilledFields?: string[]
  createdAt: string
  updatedAt: string
}

interface Student {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  dateOfBirth?: string
  nationality?: string
  currentEducation?: string
  educationLevel?: string
  institution?: string
  gpa?: number
  testScores?: string
  englishProficiency?: string
  preferredCountries: string[]
  preferredCourses: string[]
  preferredStudyLevels: string[]
  budget?: number
  budgetCurrency?: string
  availableIntakes: string[]
  studyMode?: string
  address?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  emergencyContactRelation?: string
}

interface University {
  id: string
  name: string
  country: string
  city: string
  state?: string
  website?: string
  description?: string
  worldRanking?: number
  nationalRanking?: number
  type?: string
  programs: string[]
  subjects: string[]
  studyLevels: string[]
  tuitionFeeRange?: {
    min: number
    max: number
    currency: string
  }
  acceptanceRate?: number
  requirements?: {
    academic: string[]
    language: string[]
    financial: string[]
    documents: string[]
  }
  contactEmail?: string
  contactPhone?: string
  address?: string
}

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SUBMITTED: 'bg-blue-100 text-blue-800',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  WITHDRAWN: 'bg-purple-100 text-purple-800'
}

const statusLabels = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn'
}

const studyModes = [
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'ONLINE', label: 'Online' },
  { value: 'HYBRID', label: 'Hybrid' }
]

const programLevels = [
  { value: 'UNDERGRADUATE', label: 'Undergraduate' },
  { value: 'POSTGRADUATE', label: 'Postgraduate' },
  { value: 'PHD', label: 'PhD' },
  { value: 'FOUNDATION', label: 'Foundation' },
  { value: 'DIPLOMA', label: 'Diploma' },
  { value: 'CERTIFICATE', label: 'Certificate' }
]

const priorities = [
  { value: 'LOW', label: 'Low' },
  { value: 'NORMAL', label: 'Normal' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' }
]

const intakes = [
  'Fall 2024', 'Spring 2025', 'Summer 2025', 'Fall 2025',
  'Spring 2026', 'Summer 2026', 'Fall 2026'
]

export default function ApplicationsPage() {
  const params = useParams()
  const subdomain = params.subdomain as string
  
  const [applications, setApplications] = useState<Application[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [universities, setUniversities] = useState<University[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Form state with auto-fill
  const [formData, setFormData] = useState({
    studentId: '',
    universityId: '',
    program: '',
    programCode: '',
    programLevel: '',
    studyMode: '',
    duration: '',
    intake: '',
    intakeYear: new Date().getFullYear() + 1,
    startDate: '',
    expectedEndDate: '',
    status: 'DRAFT',
    subStatus: '',
    priority: 'NORMAL',
    applicationFee: '',
    applicationFeeCurrency: 'USD',
    applicationFeePaid: false,
    submissionDate: '',
    deadlineDate: '',
    currentEducation: '',
    gpa: '',
    englishProficiency: '',
    testScores: '',
    tuitionFee: '',
    tuitionFeeCurrency: 'USD',
    scholarshipAmount: '',
    scholarshipCurrency: 'USD',
    totalCost: '',
    fundingSource: [] as string[],
    interviewRequired: false,
    interviewDate: '',
    interviewType: '',
    visaRequired: false,
    notes: '',
    // Auto-fill tracking
    autoFilledFields: [] as string[]
  })

  // Available options based on selections
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([])
  const [availablePrograms, setAvailablePrograms] = useState<string[]>([])
  const [availableStudyLevels, setAvailableStudyLevels] = useState<string[]>([])

  // Load data from API
  useEffect(() => {
    loadData()
  }, [subdomain])

  const loadData = async () => {
    setLoading(true)
    setError('')
    
    try {
      // Load applications
      const applicationsResponse = await fetch(`/api/${subdomain}/applications`)
      if (applicationsResponse.ok) {
        const applicationsData = await applicationsResponse.json()
        setApplications(applicationsData.applications || [])
      } else {
        setError('Failed to load applications')
      }

      // Load students
      const studentsResponse = await fetch(`/api/${subdomain}/students`)
      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json()
        setStudents(studentsData.students || [])
      }

      // Load universities
      const universitiesResponse = await fetch(`/api/${subdomain}/universities`)
      if (universitiesResponse.ok) {
        const universitiesData = await universitiesResponse.json()
        setUniversities(universitiesData.universities || [])
      }
    } catch (err) {
      setError('Error loading data')
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Auto-fill student data when student is selected
  useEffect(() => {
    if (formData.studentId) {
      const student = students.find(s => s.id === formData.studentId)
      if (student) {
        const autoFilled = [
          'currentEducation', 'gpa', 'englishProficiency', 'testScores',
          'studyMode', 'preferredStudyLevels', 'availableIntakes'
        ]
        
        setFormData(prev => ({
          ...prev,
          currentEducation: student.currentEducation || '',
          gpa: student.gpa?.toString() || '',
          englishProficiency: student.englishProficiency || '',
          testScores: student.testScores || '',
          studyMode: student.studyMode || '',
          autoFilledFields: [...prev.autoFilledFields, ...autoFilled]
        }))
      }
    }
  }, [formData.studentId, students])

  // Update available options when university is selected
  useEffect(() => {
    if (formData.universityId) {
      const university = universities.find(u => u.id === formData.universityId)
      if (university) {
        setAvailableSubjects(university.subjects || [])
        setAvailablePrograms(university.programs || [])
        setAvailableStudyLevels(university.studyLevels || [])
        
        // Auto-fill tuition fee if available
        if (university.tuitionFeeRange) {
          setFormData(prev => ({
            ...prev,
            tuitionFee: university.tuitionFeeRange.max?.toString() || '',
            tuitionFeeCurrency: university.tuitionFeeRange.currency || 'USD',
            autoFilledFields: [...prev.autoFilledFields, 'tuitionFee', 'tuitionFeeCurrency']
          }))
        }
      }
    } else {
      setAvailableSubjects([])
      setAvailablePrograms([])
      setAvailableStudyLevels([])
    }
  }, [formData.universityId, universities])

  // Calculate expected end date based on duration and start date
  useEffect(() => {
    if (formData.startDate && formData.duration) {
      const startDate = new Date(formData.startDate)
      const duration = parseInt(formData.duration)
      const expectedEndDate = new Date(startDate.setFullYear(startDate.getFullYear() + duration))
      setFormData(prev => ({
        ...prev,
        expectedEndDate: expectedEndDate.toISOString().split('T')[0]
      }))
    }
  }, [formData.startDate, formData.duration])

  useEffect(() => {
    let filtered = applications

    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.university.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.program.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter)
    }

    setFilteredApplications(filtered)
  }, [applications, searchTerm, statusFilter])

  const handleInputChange = (field: string, value: string | string[] | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleStudentChange = (studentId: string) => {
    setFormData(prev => ({ 
      ...prev, 
      studentId,
      universityId: '', // Reset university when student changes
      program: '', // Reset program when student changes
      autoFilledFields: [] // Reset auto-fill tracking
    }))
  }

  const handleUniversityChange = (universityId: string) => {
    setFormData(prev => ({ 
      ...prev, 
      universityId,
      program: '', // Reset program when university changes
      programLevel: '', // Reset program level when university changes
      autoFilledFields: prev.autoFilledFields.filter(field => 
        !['tuitionFee', 'tuitionFeeCurrency'].includes(field)
      ) // Remove university-specific auto-fills
    }))
  }

  const handleProgramChange = (program: string) => {
    setFormData(prev => ({ ...prev, program }))
    
    // Auto-fill program level based on program selection
    const university = universities.find(u => u.id === prev.universityId)
    if (university) {
      const programLevel = program.toLowerCase().includes('phd') ? 'PHD' :
                           program.toLowerCase().includes('master') || program.toLowerCase().includes('mba') ? 'POSTGRADUATE' :
                           program.toLowerCase().includes('bachelor') ? 'UNDERGRADUATE' :
                           program.toLowerCase().includes('foundation') ? 'FOUNDATION' :
                           program.toLowerCase().includes('diploma') ? 'DIPLOMA' :
                           program.toLowerCase().includes('certificate') ? 'CERTIFICATE' : ''
      
      if (programLevel) {
        setFormData(prev => ({
          ...prev,
          programLevel,
          autoFilledFields: [...prev.autoFilledFields, 'programLevel']
        }))
      }
    }
  }

  const resetForm = () => {
    setFormData({
      studentId: '',
      universityId: '',
      program: '',
      programCode: '',
      programLevel: '',
      studyMode: '',
      duration: '',
      intake: '',
      intakeYear: new Date().getFullYear() + 1,
      startDate: '',
      expectedEndDate: '',
      status: 'DRAFT',
      subStatus: '',
      priority: 'NORMAL',
      applicationFee: '',
      applicationFeeCurrency: 'USD',
      applicationFeePaid: false,
      submissionDate: '',
      deadlineDate: '',
      currentEducation: '',
      gpa: '',
      englishProficiency: '',
      testScores: '',
      tuitionFee: '',
      tuitionFeeCurrency: 'USD',
      scholarshipAmount: '',
      scholarshipCurrency: 'USD',
      totalCost: '',
      fundingSource: [] as string[],
      interviewRequired: false,
      interviewDate: '',
      interviewType: '',
      visaRequired: false,
      notes: '',
      autoFilledFields: [] as string[]
    })
    setAvailableSubjects([])
    setAvailablePrograms([])
    setAvailableStudyLevels([])
  }

  const handleAddApplication = async () => {
    if (!formData.studentId || !formData.universityId || !formData.program) {
      setError('Please fill in all required fields: Student, University, and Program')
      return
    }

    setSubmitting(true)
    try {
      const applicationData = {
        ...formData,
        gpa: formData.gpa ? parseFloat(formData.gpa) : undefined,
        applicationFee: formData.applicationFee ? parseFloat(formData.applicationFee) : undefined,
        tuitionFee: formData.tuitionFee ? parseFloat(formData.tuitionFee) : undefined,
        scholarshipAmount: formData.scholarshipAmount ? parseFloat(formData.scholarshipAmount) : undefined,
        totalCost: formData.totalCost ? parseFloat(formData.totalCost) : undefined,
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        intakeYear: formData.intakeYear ? parseInt(formData.intakeYear) : undefined,
        progressPercentage: 0,
        currentStage: 'DRAFT',
        interviewRequired: formData.interviewRequired,
        interviewScheduled: false,
        visaRequired: formData.visaRequired,
        offerReceived: false,
        offerAccepted: false,
        enrollmentConfirmed: false,
        visaApplied: false,
        visaApproved: false,
        autoFilledFields: formData.autoFilledFields,
        fundingSource: formData.fundingSource.length > 0 ? formData.fundingSource : undefined
      }

      const response = await fetch(`/api/${subdomain}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to create application')
        return
      }

      const createdApplication = await response.json()
      
      // Add the new application to the list
      setApplications([createdApplication, ...applications])
      
      // Reset form and close dialog
      resetForm()
      setIsAddDialogOpen(false)
      setError('')
    } catch (err) {
      setError('Error creating application')
      console.error('Error creating application:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const getWorkflowProgress = (status: string) => {
    const progressMap = {
      DRAFT: 10,
      SUBMITTED: 30,
      UNDER_REVIEW: 60,
      APPROVED: 100,
      REJECTED: 0,
      WITHDRAWN: 0
    }
    return progressMap[status as keyof typeof progressMap] || 0
  }

  const getWorkflowSteps = (status: string) => {
    const steps = [
      { key: 'draft', label: 'Draft', completed: true },
      { key: 'submitted', label: 'Submitted', completed: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED'].includes(status) },
      { key: 'review', label: 'Under Review', completed: ['UNDER_REVIEW', 'APPROVED'].includes(status) },
      { key: 'approved', label: 'Approved', completed: status === 'APPROVED' }
    ]
    return steps
  }

  const stats = {
    total: applications.length,
    underReview: applications.filter(app => app.status === 'UNDER_REVIEW').length,
    approved: applications.filter(app => app.status === 'APPROVED').length,
    successRate: applications.length > 0 
      ? Math.round((applications.filter(app => app.status === 'APPROVED').length / applications.length) * 100)
      : 0
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Error Handling */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading applications...</span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
          <p className="text-muted-foreground">
            Manage student applications and track progress
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData} disabled={loading}>
            <Loader2 className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            if (!open) resetForm()
            setIsAddDialogOpen(open)
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Application
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Application</DialogTitle>
                <DialogDescription>
                  Create a new university application for a student. Fields will auto-fill based on your selections.
                </DialogDescription>
              </DialogHeader>

              {/* Auto-fill Indicator */}
              {formData.autoFilledFields.length > 0 && (
                <Alert>
                  <Target className="h-4 w-4" />
                  <AlertDescription>
                    Auto-filled fields: {formData.autoFilledFields.join(', ')}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="student">Student *</Label>
                    <Select value={formData.studentId} onValueChange={handleStudentChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.firstName} {student.lastName} - {student.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="university">University *</Label>
                    <Select value={formData.universityId} onValueChange={handleUniversityChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select university" />
                      </SelectTrigger>
                      <SelectContent>
                        {universities.map((university) => (
                          <SelectItem key={university.id} value={university.id}>
                            {university.name} - {university.country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Program Details */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="program">Program *</Label>
                    {availablePrograms.length > 0 ? (
                      <Select value={formData.program} onValueChange={handleProgramChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select program" />
                        </SelectTrigger>
                        <SelectContent>
                          {availablePrograms.map((program) => (
                            <SelectItem key={program} value={program}>
                              {program}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id="program"
                        placeholder="Enter program name"
                        value={formData.program}
                        onChange={(e) => handleInputChange('program', e.target.value)}
                      />
                    )}
                  </div>
                  <div>
                    <Label htmlFor="programLevel">Program Level</Label>
                    <Select value={formData.programLevel} onValueChange={(value) => handleInputChange('programLevel', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStudyLevels.length > 0 ? (
                          availableStudyLevels.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level.replace('_', ' ')}
                            </SelectItem>
                          ))
                        ) : (
                          programLevels.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="studyMode">Study Mode</Label>
                    <Select value={formData.studyMode} onValueChange={(value) => handleInputChange('studyMode', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                      <SelectContent>
                        {studyModes.map((mode) => (
                          <SelectItem key={mode.value} value={mode.value}>
                            {mode.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Duration and Dates */}
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="duration">Duration (years)</Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="4"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="intake">Intake</Label>
                    <Select value={formData.intake} onValueChange={(value) => handleInputChange('intake', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select intake" />
                      </SelectTrigger>
                      <SelectContent>
                        {intakes.map((intake) => (
                          <SelectItem key={intake} value={intake}>
                            {intake}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expectedEndDate">Expected End Date</Label>
                    <Input
                      id="expectedEndDate"
                      type="date"
                      value={formData.expectedEndDate}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>

                {/* Academic Information (Auto-filled from Student) */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="currentEducation">Current Education</Label>
                    <Input
                      id="currentEducation"
                      placeholder="Current education"
                      value={formData.currentEducation}
                      onChange={(e) => handleInputChange('currentEducation', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gpa">GPA</Label>
                    <Input
                      id="gpa"
                      type="number"
                      step="0.1"
                      placeholder="3.5"
                      value={formData.gpa}
                      onChange={(e) => handleInputChange('gpa', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="englishProficiency">English Proficiency</Label>
                    <Input
                      id="englishProficiency"
                      placeholder="IELTS 7.0, TOEFL 100, etc."
                      value={formData.englishProficiency}
                      onChange={(e) => handleInputChange('englishProficiency', e.target.value)}
                    />
                  </div>
                </div>

                {/* Financial Information */}
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="applicationFee">Application Fee</Label>
                    <Input
                      id="applicationFee"
                      type="number"
                      step="0.01"
                      placeholder="50.00"
                      value={formData.applicationFee}
                      onChange={(e) => handleInputChange('applicationFee', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tuitionFee">Tuition Fee</Label>
                    <Input
                      id="tuitionFee"
                      type="number"
                      step="0.01"
                      placeholder="25000"
                      value={formData.tuitionFee}
                      onChange={(e) => handleInputChange('tuitionFee', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="scholarshipAmount">Scholarship Amount</Label>
                    <Input
                      id="scholarshipAmount"
                      type="number"
                      step="0.01"
                      placeholder="5000"
                      value={formData.scholarshipAmount}
                      onChange={(e) => handleInputChange('scholarshipAmount', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="totalCost">Total Cost</Label>
                    <Input
                      id="totalCost"
                      type="number"
                      step="0.01"
                      placeholder="30000"
                      value={formData.totalCost}
                      onChange={(e) => handleInputChange('totalCost', e.target.value)}
                    />
                  </div>
                </div>

                {/* Application Status */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="SUBMITTED">Submitted</SelectItem>
                        <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                        <SelectItem value="APPROVED">Approved</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                        <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="deadlineDate">Deadline</Label>
                    <Input
                      id="deadlineDate"
                      type="date"
                      value={formData.deadlineDate}
                      onChange={(e) => handleInputChange('deadlineDate', e.target.value)}
                    />
                  </div>
                </div>

                {/* Requirements */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="interviewRequired"
                      checked={formData.interviewRequired}
                      onCheckedChange={(checked) => handleInputChange('interviewRequired', checked as boolean)}
                    />
                    <Label htmlFor="interviewRequired">Interview Required</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="visaRequired"
                      checked={formData.visaRequired}
                      onCheckedChange={(checked) => handleInputChange('visaRequired', checked as boolean)}
                    />
                    <Label htmlFor="visaRequired">Visa Required</Label>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes about this application..."
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddApplication} disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Application
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.underReview}
            </div>
            <p className="text-xs text-muted-foreground">
              Pending decisions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.approved}
            </div>
            <p className="text-xs text-muted-foreground">
              Successful applications
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.successRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              Approval rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Applications Overview</CardTitle>
          <CardDescription>
            Track all student applications and their progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="SUBMITTED">Submitted</SelectItem>
                  <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>University</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Intake</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {application.student.firstName} {application.student.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {application.student.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{application.university.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {application.university.city}, {application.university.country}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{application.program}</div>
                      {application.programLevel && (
                        <div className="text-sm text-muted-foreground">
                          {application.programLevel.replace('_', ' ')}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[application.status]}>
                      {statusLabels[application.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Progress value={getWorkflowProgress(application.status)} className="w-20" />
                      <div className="text-xs text-muted-foreground">
                        {getWorkflowProgress(application.status)}%
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {application.intake || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => {
                        setSelectedApplication(application)
                        setIsViewDialogOpen(true)
                      }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredApplications.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No applications found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search criteria.' 
                  : 'Get started by creating your first application.'
                }
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Application
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Full application information and progress tracking
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-6">
              {/* Header Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Student Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {selectedApplication.student.firstName} {selectedApplication.student.lastName}</p>
                    <p><span className="font-medium">Email:</span> {selectedApplication.student.email}</p>
                    <p><span className="font-medium">Current Education:</span> {selectedApplication.student.currentEducation || 'N/A'}</p>
                    <p><span className="font-medium">GPA:</span> {selectedApplication.student.gpa || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">University Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {selectedApplication.university.name}</p>
                    <p><span className="font-medium">Location:</span> {selectedApplication.university.city}, {selectedApplication.university.country}</p>
                    <p><span className="font-medium">Website:</span> 
                      {selectedApplication.university.website ? (
                        <a href={selectedApplication.university.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          Visit Website
                        </a>
                      ) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Program Details */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Program Details</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Program</Label>
                    <p className="font-medium">{selectedApplication.program}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Program Level</Label>
                    <p>{selectedApplication.programLevel?.replace('_', ' ') || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Study Mode</Label>
                    <p>{selectedApplication.studyMode?.replace('_', ' ') || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Duration</Label>
                    <p>{selectedApplication.duration ? `${selectedApplication.duration} years` : 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Intake</Label>
                    <p>{selectedApplication.intake || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Start Date</Label>
                    <p>{selectedApplication.startDate ? format(new Date(selectedApplication.startDate), 'PPP') : 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Financial Information</h3>
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Application Fee</Label>
                    <p>{selectedApplication.applicationFee ? `${selectedApplication.applicationFeeCurrency} ${selectedApplication.applicationFee}` : 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Tuition Fee</Label>
                    <p>{selectedApplication.tuitionFee ? `${selectedApplication.tuitionFeeCurrency} ${selectedApplication.tuitionFee}` : 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Scholarship</Label>
                    <p>{selectedApplication.scholarshipAmount ? `${selectedApplication.scholarshipCurrency} ${selectedApplication.scholarshipAmount}` : 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Total Cost</Label>
                    <p>{selectedApplication.totalCost ? `${selectedApplication.tuitionFeeCurrency} ${selectedApplication.totalCost}` : 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Progress Tracking */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Application Progress</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Overall Progress</span>
                      <span className="text-sm text-muted-foreground">{selectedApplication.progressPercentage}%</span>
                    </div>
                    <Progress value={selectedApplication.progressPercentage} className="w-full" />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Current Stage</Label>
                      <p>{selectedApplication.currentStage || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Next Step</Label>
                      <p>{selectedApplication.nextStep || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Requirements</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <FileCheck className={`h-5 w-5 ${selectedApplication.interviewRequired ? 'text-orange-500' : 'text-gray-400'}`} />
                    <span>Interview {selectedApplication.interviewRequired ? 'Required' : 'Not Required'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Plane className={`h-5 w-5 ${selectedApplication.visaRequired ? 'text-blue-500' : 'text-gray-400'}`} />
                    <span>Visa {selectedApplication.visaRequired ? 'Required' : 'Not Required'}</span>
                  </div>
                </div>
              </div>

              {/* Status Timeline */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Application Timeline</h3>
                <div className="space-y-3">
                  {getWorkflowSteps(selectedApplication.status).map((step, index) => (
                    <div key={step.key} className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        step.completed 
                          ? 'bg-green-500 border-green-500' 
                          : 'border-gray-300'
                      }`}>
                        {step.completed && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span className={`font-medium ${step.completed ? 'text-green-600' : 'text-gray-500'}`}>
                        {step.label}
                      </span>
                      {index < getWorkflowSteps(selectedApplication.status).length - 1 && (
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {selectedApplication.internalNotes && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Internal Notes</h3>
                  <p className="text-sm bg-muted p-3 rounded-md">
                    {selectedApplication.internalNotes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}