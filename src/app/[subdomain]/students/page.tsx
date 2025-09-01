"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
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
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  GraduationCap,
  FileText,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  User,
  Users,
  Target,
  BookOpen,
  Globe,
  TrendingUp,
  Activity,
  Loader2
} from "lucide-react"

interface Student {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  status: 'PROSPECT' | 'APPLIED' | 'ACCEPTED' | 'ENROLLED' | 'GRADUATED' | 'WITHDRAWN'
  stage: 'INQUIRY' | 'CONSULTATION' | 'APPLICATION' | 'DOCUMENTATION' | 'VISA_PROCESSING' | 'PRE_DEPARTURE' | 'POST_ARRIVAL'
  nationality?: string
  dateOfBirth?: string
  currentEducation?: string
  gpa?: number
  budget?: number
  preferredCountries: string[]
  preferredCourses: string[]
  assignedTo?: string
  createdAt: string
  lastActivity?: string
  notes?: string
  documents: Document[]
  applications: Application[]
}

interface Document {
  id: string
  name: string
  type: string
  status: 'UPLOADED' | 'PENDING' | 'REVIEWED' | 'APPROVED' | 'REJECTED'
  uploadedAt: string
  size?: number
}

interface Application {
  id: string
  university: string
  program: string
  intake: string
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN'
  submittedAt?: string
  universityId: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
  title?: string
}

interface ApiResponse {
  students: Student[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

const countries = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany",
  "France", "Netherlands", "Sweden", "Norway", "Denmark", "Finland",
  "Switzerland", "Austria", "Belgium", "Ireland", "New Zealand",
  "Singapore", "Japan", "South Korea", "China", "India", "United Arab Emirates"
]

const courses = [
  "Computer Science", "Engineering", "Business Administration", "Marketing",
  "Medicine", "Law", "International Relations", "Economics", "Psychology",
  "Data Science", "Artificial Intelligence", "Biotechnology", "Architecture",
  "Design", "Journalism", "Education", "Hospitality Management"
]

export default function StudentsPage() {
  const params = useParams()
  const subdomain = params.subdomain as string
  
  const [students, setStudents] = useState<Student[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [stageFilter, setStageFilter] = useState<string>("all")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [submitting, setSubmitting] = useState(false)
  
  // Form state for adding student
  const [newStudent, setNewStudent] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    nationality: "",
    dateOfBirth: "",
    gender: "",
    maritalStatus: "",
    passportNumber: "",
    passportExpiry: "",
    
    // Contact Information
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    emergencyContact: "",
    emergencyPhone: "",
    
    // Education Background
    currentEducation: "",
    institution: "",
    graduationYear: "",
    gpa: "",
    gpaScale: "4.0",
    englishProficiency: "",
    testScore: "",
    testName: "",
    
    // Study Preferences
    budget: "",
    budgetCurrency: "USD",
    preferredCountries: [] as string[],
    preferredCourses: [] as string[],
    studyLevel: "",
    preferredIntake: "",
    startDate: "",
    
    // Additional Information
    assignedTo: "",
    source: "",
    notes: "",
    tags: [] as string[],
    customFields: {} as Record<string, string>
  })

  // Fetch students from API
  const fetchStudents = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: "1",
        limit: "50",
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(stageFilter !== "all" && { stage: stageFilter })
      })
      
      const response = await fetch(`/api/${subdomain}/students?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch students')
      }
      
      const data: ApiResponse = await response.json()
      setStudents(data.students)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // Fetch users for assignment
  const fetchUsers = async () => {
    try {
      // Mock users for now - in real app, this would be an API call
      setUsers([
        {
          id: "1",
          name: "Sarah Johnson",
          email: "sarah@agency.com",
          role: "AGENCY_ADMIN",
          title: "CEO"
        },
        {
          id: "2",
          name: "Michael Chen",
          email: "michael@agency.com",
          role: "CONSULTANT",
          title: "Senior Education Consultant"
        },
        {
          id: "3",
          name: "Emma Rodriguez",
          email: "emma@agency.com",
          role: "CONSULTANT",
          title: "Education Consultant"
        }
      ])
    } catch (err) {
      console.error('Error fetching users:', err)
    }
  }

  useEffect(() => {
    fetchStudents()
    fetchUsers()
  }, [subdomain])

  useEffect(() => {
    fetchStudents()
  }, [searchTerm, statusFilter, stageFilter])

  const handleInputChange = (field: string, value: string | string[]) => {
    setNewStudent(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmitStudent = async () => {
    if (!newStudent.firstName || !newStudent.lastName || !newStudent.email) {
      alert("Please fill in required fields: First Name, Last Name, and Email")
      return
    }

    setSubmitting(true)
    try {
      const studentData = {
        // Personal Information
        firstName: newStudent.firstName,
        lastName: newStudent.lastName,
        email: newStudent.email,
        phone: newStudent.phone || undefined,
        nationality: newStudent.nationality || undefined,
        dateOfBirth: newStudent.dateOfBirth || undefined,
        gender: newStudent.gender || undefined,
        maritalStatus: newStudent.maritalStatus || undefined,
        passportNumber: newStudent.passportNumber || undefined,
        passportExpiry: newStudent.passportExpiry || undefined,
        
        // Contact Information
        address: newStudent.address || undefined,
        city: newStudent.city || undefined,
        state: newStudent.state || undefined,
        country: newStudent.country || undefined,
        postalCode: newStudent.postalCode || undefined,
        emergencyContact: newStudent.emergencyContact || undefined,
        emergencyPhone: newStudent.emergencyPhone || undefined,
        
        // Education Background
        currentEducation: newStudent.currentEducation || undefined,
        institution: newStudent.institution || undefined,
        graduationYear: newStudent.graduationYear || undefined,
        gpa: newStudent.gpa ? parseFloat(newStudent.gpa) : undefined,
        gpaScale: newStudent.gpaScale || undefined,
        englishProficiency: newStudent.englishProficiency || undefined,
        testScore: newStudent.testScore || undefined,
        testName: newStudent.testName || undefined,
        
        // Study Preferences
        budget: newStudent.budget ? parseFloat(newStudent.budget) : undefined,
        budgetCurrency: newStudent.budgetCurrency || undefined,
        preferredCountries: newStudent.preferredCountries,
        preferredCourses: newStudent.preferredCourses,
        studyLevel: newStudent.studyLevel || undefined,
        preferredIntake: newStudent.preferredIntake || undefined,
        startDate: newStudent.startDate || undefined,
        
        // Additional Information
        assignedTo: newStudent.assignedTo || undefined,
        source: newStudent.source || undefined,
        notes: newStudent.notes || undefined,
        tags: newStudent.tags,
        customFields: newStudent.customFields
      }

      const response = await fetch(`/api/${subdomain}/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create student')
      }

      await fetchStudents()
      setIsAddDialogOpen(false)
      // Reset form
      setNewStudent({
        // Personal Information
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        nationality: "",
        dateOfBirth: "",
        gender: "",
        maritalStatus: "",
        passportNumber: "",
        passportExpiry: "",
        
        // Contact Information
        address: "",
        city: "",
        state: "",
        country: "",
        postalCode: "",
        emergencyContact: "",
        emergencyPhone: "",
        
        // Education Background
        currentEducation: "",
        institution: "",
        graduationYear: "",
        gpa: "",
        gpaScale: "4.0",
        englishProficiency: "",
        testScore: "",
        testName: "",
        
        // Study Preferences
        budget: "",
        budgetCurrency: "USD",
        preferredCountries: [],
        preferredCourses: [],
        studyLevel: "",
        preferredIntake: "",
        startDate: "",
        
        // Additional Information
        assignedTo: "",
        source: "",
        notes: "",
        tags: [],
        customFields: {}
      })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create student')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateStudent = async (studentData: Partial<Student>) => {
    if (!editingStudent) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/${subdomain}/students/${editingStudent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update student')
      }

      await fetchStudents()
      setIsEditDialogOpen(false)
      setEditingStudent(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update student')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this student?')) {
      return
    }

    try {
      const response = await fetch(`/api/${subdomain}/students/${studentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete student')
      }

      await fetchStudents()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete student')
    }
  }

  const handleGenerateReport = async () => {
    try {
      const response = await fetch(`/api/${subdomain}/students?limit=1000&export=true`)
      if (!response.ok) throw new Error('Failed to generate report')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `students-report-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      alert('Failed to generate report. Please try again.')
    }
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || student.status === statusFilter
    const matchesStage = stageFilter === "all" || student.stage === stageFilter
    return matchesSearch && matchesStatus && matchesStage
  })

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

  const stats = {
    total: students.length,
    prospects: students.filter(s => s.status === 'PROSPECT').length,
    applied: students.filter(s => s.status === 'APPLIED').length,
    accepted: students.filter(s => s.status === 'ACCEPTED').length,
    enrolled: students.filter(s => s.status === 'ENROLLED').length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">EA</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Student Management</h1>
                <p className="text-sm text-muted-foreground">{subdomain}.eduagency.com</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Student
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Student</DialogTitle>
                    <DialogDescription>
                      Create a new student profile and add them to your pipeline
                    </DialogDescription>
                  </DialogHeader>
                  <Tabs defaultValue="personal" className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="personal">Personal</TabsTrigger>
                      <TabsTrigger value="contact">Contact</TabsTrigger>
                      <TabsTrigger value="education">Education</TabsTrigger>
                      <TabsTrigger value="preferences">Preferences</TabsTrigger>
                      <TabsTrigger value="additional">Additional</TabsTrigger>
                    </TabsList>
                    
                    {/* Personal Information Tab */}
                    <TabsContent value="personal" className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input 
                            id="firstName" 
                            placeholder="Enter first name"
                            value={newStudent.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input 
                            id="lastName" 
                            placeholder="Enter last name"
                            value={newStudent.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            placeholder="student@email.com"
                            value={newStudent.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input 
                            id="phone" 
                            placeholder="+1 (555) 123-4567"
                            value={newStudent.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="nationality">Nationality</Label>
                          <Input 
                            id="nationality" 
                            placeholder="e.g., Canadian"
                            value={newStudent.nationality}
                            onChange={(e) => handleInputChange('nationality', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="dateOfBirth">Date of Birth</Label>
                          <Input 
                            id="dateOfBirth" 
                            type="date"
                            value={newStudent.dateOfBirth}
                            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="gender">Gender</Label>
                          <Select value={newStudent.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                              <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="maritalStatus">Marital Status</Label>
                          <Select value={newStudent.maritalStatus} onValueChange={(value) => handleInputChange('maritalStatus', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="single">Single</SelectItem>
                              <SelectItem value="married">Married</SelectItem>
                              <SelectItem value="divorced">Divorced</SelectItem>
                              <SelectItem value="widowed">Widowed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="passportNumber">Passport Number</Label>
                          <Input 
                            id="passportNumber" 
                            placeholder="Passport number"
                            value={newStudent.passportNumber}
                            onChange={(e) => handleInputChange('passportNumber', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="passportExpiry">Passport Expiry</Label>
                          <Input 
                            id="passportExpiry" 
                            type="date"
                            value={newStudent.passportExpiry}
                            onChange={(e) => handleInputChange('passportExpiry', e.target.value)}
                          />
                        </div>
                      </div>
                    </TabsContent>
                    
                    {/* Contact Information Tab */}
                    <TabsContent value="contact" className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="address">Address</Label>
                          <Input 
                            id="address" 
                            placeholder="Street address"
                            value={newStudent.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input 
                            id="city" 
                            placeholder="City"
                            value={newStudent.city}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="state">State/Province</Label>
                          <Input 
                            id="state" 
                            placeholder="State or province"
                            value={newStudent.state}
                            onChange={(e) => handleInputChange('state', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="country">Country</Label>
                          <Input 
                            id="country" 
                            placeholder="Country"
                            value={newStudent.country}
                            onChange={(e) => handleInputChange('country', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="postalCode">Postal Code</Label>
                          <Input 
                            id="postalCode" 
                            placeholder="Postal code"
                            value={newStudent.postalCode}
                            onChange={(e) => handleInputChange('postalCode', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="emergencyContact">Emergency Contact</Label>
                          <Input 
                            id="emergencyContact" 
                            placeholder="Emergency contact name"
                            value={newStudent.emergencyContact}
                            onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                          <Input 
                            id="emergencyPhone" 
                            placeholder="Emergency contact phone"
                            value={newStudent.emergencyPhone}
                            onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                          />
                        </div>
                      </div>
                    </TabsContent>
                    
                    {/* Education Background Tab */}
                    <TabsContent value="education" className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="currentEducation">Current Education</Label>
                          <Input 
                            id="currentEducation" 
                            placeholder="e.g., High School Diploma"
                            value={newStudent.currentEducation}
                            onChange={(e) => handleInputChange('currentEducation', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="institution">Institution</Label>
                          <Input 
                            id="institution" 
                            placeholder="School/College name"
                            value={newStudent.institution}
                            onChange={(e) => handleInputChange('institution', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="graduationYear">Graduation Year</Label>
                          <Input 
                            id="graduationYear" 
                            type="number"
                            placeholder="2024"
                            value={newStudent.graduationYear}
                            onChange={(e) => handleInputChange('graduationYear', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="gpa">GPA</Label>
                          <Input 
                            id="gpa" 
                            type="number" 
                            step="0.1" 
                            min="0" 
                            max="4"
                            placeholder="3.8"
                            value={newStudent.gpa}
                            onChange={(e) => handleInputChange('gpa', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="gpaScale">GPA Scale</Label>
                          <Select value={newStudent.gpaScale} onValueChange={(value) => handleInputChange('gpaScale', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="4.0">4.0 Scale</SelectItem>
                              <SelectItem value="5.0">5.0 Scale</SelectItem>
                              <SelectItem value="10.0">10.0 Scale</SelectItem>
                              <SelectItem value="100">100 Scale</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="englishProficiency">English Proficiency</Label>
                          <Select value={newStudent.englishProficiency} onValueChange={(value) => handleInputChange('englishProficiency', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="native">Native</SelectItem>
                              <SelectItem value="fluent">Fluent</SelectItem>
                              <SelectItem value="advanced">Advanced</SelectItem>
                              <SelectItem value="intermediate">Intermediate</SelectItem>
                              <SelectItem value="beginner">Beginner</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="testName">English Test</Label>
                          <Select value={newStudent.testName} onValueChange={(value) => handleInputChange('testName', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select test" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ielts">IELTS</SelectItem>
                              <SelectItem value="toefl">TOEFL</SelectItem>
                              <SelectItem value="pte">PTE</SelectItem>
                              <SelectItem value="duolingo">Duolingo</SelectItem>
                              <SelectItem value="none">None</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="testScore">Test Score</Label>
                          <Input 
                            id="testScore" 
                            placeholder="e.g., 7.5 for IELTS"
                            value={newStudent.testScore}
                            onChange={(e) => handleInputChange('testScore', e.target.value)}
                          />
                        </div>
                      </div>
                    </TabsContent>
                    
                    {/* Study Preferences Tab */}
                    <TabsContent value="preferences" className="space-y-4">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="budget">Budget</Label>
                          <Input 
                            id="budget" 
                            type="number" 
                            placeholder="50000"
                            value={newStudent.budget}
                            onChange={(e) => handleInputChange('budget', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="budgetCurrency">Currency</Label>
                          <Select value={newStudent.budgetCurrency} onValueChange={(value) => handleInputChange('budgetCurrency', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="CAD">CAD</SelectItem>
                              <SelectItem value="GBP">GBP</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                              <SelectItem value="AUD">AUD</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="studyLevel">Study Level</Label>
                          <Select value={newStudent.studyLevel} onValueChange={(value) => handleInputChange('studyLevel', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="undergraduate">Undergraduate</SelectItem>
                              <SelectItem value="postgraduate">Postgraduate</SelectItem>
                              <SelectItem value="phd">PhD</SelectItem>
                              <SelectItem value="diploma">Diploma</SelectItem>
                              <SelectItem value="certificate">Certificate</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="preferredIntake">Preferred Intake</Label>
                          <Select value={newStudent.preferredIntake} onValueChange={(value) => handleInputChange('preferredIntake', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select intake" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fall_2024">Fall 2024</SelectItem>
                              <SelectItem value="spring_2025">Spring 2025</SelectItem>
                              <SelectItem value="summer_2025">Summer 2025</SelectItem>
                              <SelectItem value="fall_2025">Fall 2025</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="startDate">Preferred Start Date</Label>
                          <Input 
                            id="startDate" 
                            type="date"
                            value={newStudent.startDate}
                            onChange={(e) => handleInputChange('startDate', e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="preferredCountries">Preferred Countries</Label>
                        <Select value={newStudent.preferredCountries.join(',')} onValueChange={(value) => handleInputChange('preferredCountries', value.split(','))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select countries" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem key={country} value={country}>
                                {country}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="preferredCourses">Preferred Courses</Label>
                        <Select value={newStudent.preferredCourses.join(',')} onValueChange={(value) => handleInputChange('preferredCourses', value.split(','))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select courses" />
                          </SelectTrigger>
                          <SelectContent>
                            {courses.map((course) => (
                              <SelectItem key={course} value={course}>
                                {course}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TabsContent>
                    
                    {/* Additional Information Tab */}
                    <TabsContent value="additional" className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="assignedTo">Assigned To</Label>
                          <Select value={newStudent.assignedTo} onValueChange={(value) => handleInputChange('assignedTo', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select team member" />
                            </SelectTrigger>
                            <SelectContent>
                              {users.map((user) => (
                                <SelectItem key={user.id} value={user.id}>
                                  {user.name} - {user.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="source">Lead Source</Label>
                          <Select value={newStudent.source} onValueChange={(value) => handleInputChange('source', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select source" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="website">Website</SelectItem>
                              <SelectItem value="social_media">Social Media</SelectItem>
                              <SelectItem value="referral">Referral</SelectItem>
                              <SelectItem value="event">Event</SelectItem>
                              <SelectItem value="advertisement">Advertisement</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea 
                          id="notes" 
                          placeholder="Additional information about the student..."
                          value={newStudent.notes}
                          onChange={(e) => handleInputChange('notes', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="tags">Tags (comma-separated)</Label>
                        <Input 
                          id="tags" 
                          placeholder="e.g., priority, STEM, scholarship"
                          value={newStudent.tags.join(',')}
                          onChange={(e) => handleInputChange('tags', e.target.value.split(',').map(tag => tag.trim()))}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmitStudent} disabled={submitting}>
                      {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                      Add Student
                    </Button>
                  </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Prospects</p>
                  <p className="text-2xl font-bold">{stats.prospects}</p>
                </div>
                <Target className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Applied</p>
                  <p className="text-2xl font-bold">{stats.applied}</p>
                </div>
                <FileText className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Accepted</p>
                  <p className="text-2xl font-bold">{stats.accepted}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Enrolled</p>
                  <p className="text-2xl font-bold">{stats.enrolled}</p>
                </div>
                <GraduationCap className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PROSPECT">Prospect</SelectItem>
                <SelectItem value="APPLIED">Applied</SelectItem>
                <SelectItem value="ACCEPTED">Accepted</SelectItem>
                <SelectItem value="ENROLLED">Enrolled</SelectItem>
                <SelectItem value="GRADUATED">Graduated</SelectItem>
                <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
              </SelectContent>
            </Select>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="INQUIRY">Inquiry</SelectItem>
                <SelectItem value="CONSULTATION">Consultation</SelectItem>
                <SelectItem value="APPLICATION">Application</SelectItem>
                <SelectItem value="DOCUMENTATION">Documentation</SelectItem>
                <SelectItem value="VISA_PROCESSING">Visa Processing</SelectItem>
                <SelectItem value="PRE_DEPARTURE">Pre-Departure</SelectItem>
                <SelectItem value="POST_ARRIVAL">Post-Arrival</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>Students</CardTitle>
            <CardDescription>
              Manage your student pipeline and track application progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No students found</p>
                </div>
              ) : (
                filteredStudents.map((student) => (
                  <div key={student.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">
                              {student.firstName} {student.lastName}
                            </h3>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge className={getStatusColor(student.status)}>
                            {student.status}
                          </Badge>
                          <Badge className={getStageColor(student.stage)}>
                            {student.stage.replace('_', ' ')}
                          </Badge>
                          {student.nationality && (
                            <Badge variant="outline">
                              <MapPin className="h-3 w-3 mr-1" />
                              {student.nationality}
                            </Badge>
                          )}
                          {student.assignedTo && (
                            <Badge variant="outline">
                              <Users className="h-3 w-3 mr-1" />
                              {users.find(u => u.id === student.assignedTo)?.name || 'Unassigned'}
                            </Badge>
                          )}
                        </div>

                        {student.currentEducation && (
                          <p className="text-sm text-muted-foreground mb-2">
                            <BookOpen className="h-4 w-4 inline mr-1" />
                            {student.currentEducation}
                            {student.gpa && ` • GPA: ${student.gpa}`}
                          </p>
                        )}

                        {student.budget && (
                          <p className="text-sm text-muted-foreground mb-2">
                            <TrendingUp className="h-4 w-4 inline mr-1" />
                            Budget: ${student.budget.toLocaleString()}
                          </p>
                        )}

                        {student.preferredCountries.length > 0 && (
                          <p className="text-sm text-muted-foreground mb-2">
                            <Globe className="h-4 w-4 inline mr-1" />
                            Preferred: {student.preferredCountries.join(', ')}
                          </p>
                        )}

                        {student.notes && (
                          <p className="text-sm text-muted-foreground mb-3">
                            <MessageSquare className="h-4 w-4 inline mr-1" />
                            {student.notes}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Created: {new Date(student.createdAt).toLocaleDateString()}
                          </div>
                          {student.lastActivity && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Last activity: {new Date(student.lastActivity).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedStudent(student)
                            setIsViewDialogOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingStudent(student)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteStudent(student.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Student Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription>
              View complete student information and application history
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Full Name</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedStudent.firstName} {selectedStudent.lastName}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm text-muted-foreground">{selectedStudent.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Phone</Label>
                    <p className="text-sm text-muted-foreground">{selectedStudent.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Nationality</Label>
                    <p className="text-sm text-muted-foreground">{selectedStudent.nationality || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Date of Birth</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedStudent.dateOfBirth ? new Date(selectedStudent.dateOfBirth).toLocaleDateString() : 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge className={getStatusColor(selectedStudent.status)}>
                      {selectedStudent.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Academic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Current Education</Label>
                    <p className="text-sm text-muted-foreground">{selectedStudent.currentEducation || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">GPA</Label>
                    <p className="text-sm text-muted-foreground">{selectedStudent.gpa || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Budget</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedStudent.budget ? `$${selectedStudent.budget.toLocaleString()}` : 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Stage</Label>
                    <Badge className={getStageColor(selectedStudent.stage)}>
                      {selectedStudent.stage.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Preferences</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Preferred Countries</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedStudent.preferredCountries.length > 0 
                        ? selectedStudent.preferredCountries.join(', ') 
                        : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Preferred Courses</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedStudent.preferredCourses.length > 0 
                        ? selectedStudent.preferredCourses.join(', ') 
                        : 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Applications */}
              {selectedStudent.applications.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Applications</h3>
                  <div className="space-y-2">
                    {selectedStudent.applications.map((app) => (
                      <div key={app.id} className="border rounded p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{app.university}</p>
                            <p className="text-sm text-muted-foreground">{app.program}</p>
                            <p className="text-xs text-muted-foreground">Intake: {app.intake}</p>
                          </div>
                          <Badge className={getApplicationStatusColor(app.status)}>
                            {app.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedStudent.notes && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Notes</h3>
                  <p className="text-sm text-muted-foreground">{selectedStudent.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  </div>
  )
}