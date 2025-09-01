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
import { Checkbox } from "@/components/ui/checkbox"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Globe,
  MapPin,
  Star,
  Award,
  Building2,
  Mail,
  Phone,
  ExternalLink,
  TrendingUp,
  Users,
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  Calendar,
  Target,
  BookOpen,
  GraduationCap,
  DollarSign,
  BarChart3,
  Activity,
  Settings,
  Handshake,
  Send,
  Download,
  Save,
  Loader2,
  ChevronsUpDown,
  X
} from "lucide-react"

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
  accreditation: string[]
  programs: string[]
  subjects: string[]
  studyLevels: string[]
  requirements: {
    academic: string[]
    language: string[]
    financial: string[]
    documents: string[]
  }
  tuitionFeeRange?: {
    min: number
    max: number
    currency: string
  }
  isPartner: boolean
  partnershipLevel: 'NONE' | 'BASIC' | 'PREMIUM' | 'STRATEGIC'
  commissionRate?: number
  contactEmail?: string
  contactPhone?: string
  address?: string
  studentsPlaced: number
  applications: number
  successRate: number
  notes?: string
  isGlobal?: boolean
  globalId?: string
  verified?: boolean
  verificationStatus?: string
}

interface GlobalUniversity {
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
  logo?: string
  establishedYear?: number
  studentPopulation?: number
  verificationStatus?: string
  isGlobal: true
}

const countries = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany",
  "France", "Netherlands", "Sweden", "Norway", "Denmark", "Finland",
  "Switzerland", "Austria", "Belgium", "Ireland", "New Zealand",
  "Singapore", "Japan", "South Korea", "China", "India", "United Arab Emirates"
]

const programs = [
  "Computer Science", "Engineering", "Business Administration", "Medicine",
  "Law", "Mathematics", "Physics", "Chemistry", "Biology", "Psychology",
  "Economics", "Political Science", "History", "Philosophy", "Literature",
  "Art & Design", "Architecture", "Education", "Journalism", "Hospitality"
]

const subjects = [
  "Computer Science", "Software Engineering", "Data Science", "Artificial Intelligence",
  "Mechanical Engineering", "Electrical Engineering", "Civil Engineering", "Chemical Engineering",
  "Business Administration", "Marketing", "Finance", "International Business", "Entrepreneurship",
  "Medicine", "Nursing", "Pharmacy", "Public Health", "Psychology",
  "Law", "International Law", "Corporate Law", "Criminal Law",
  "Mathematics", "Physics", "Chemistry", "Biology", "Environmental Science",
  "Economics", "Political Science", "Sociology", "History", "Philosophy",
  "Literature", "Creative Writing", "Journalism", "Communications",
  "Art & Design", "Architecture", "Urban Planning", "Graphic Design",
  "Education", "Early Childhood Education", "Special Education", "Educational Leadership",
  "Hospitality Management", "Tourism Management", "Culinary Arts", "Event Management"
]

const studyLevels = [
  "Undergraduate", "Postgraduate", "PhD", "Foundation", "Diploma", "Certificate"
]

export default function UniversitiesPage() {
  const params = useParams()
  const subdomain = params.subdomain as string
  
  const [universities, setUniversities] = useState<University[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [countryFilter, setCountryFilter] = useState<string>("all")
  const [partnershipFilter, setPartnershipFilter] = useState<string>("all")
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingUniversity, setEditingUniversity] = useState<University | null>(null)
  const [activeTab, setActiveTab] = useState("universities")
  const [submitting, setSubmitting] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    country: "",
    city: "",
    state: "",
    website: "",
    description: "",
    worldRanking: "",
    nationalRanking: "",
    type: "Public",
    establishedYear: "",
    studentPopulation: "",
    internationalStudentRatio: "",
    studentFacultyRatio: "",
    programs: [] as string[],
    subjects: [] as string[],
    studyLevels: [] as string[],
    tuitionFeeMin: "",
    tuitionFeeMax: "",
    tuitionCurrency: "USD",
    acceptanceRate: "",
    partnershipLevel: "NONE",
    commissionRate: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    notes: ""
  })

  // Global university search
  const [globalSearchTerm, setGlobalSearchTerm] = useState("")
  const [globalUniversities, setGlobalUniversities] = useState<GlobalUniversity[]>([])
  const [globalSearchLoading, setGlobalSearchLoading] = useState(false)
  const [selectedGlobalUniversity, setSelectedGlobalUniversity] = useState<GlobalUniversity | null>(null)
  const [showGlobalSearch, setShowGlobalSearch] = useState(false)

  // Fetch universities from API
  const fetchUniversities = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        limit: "100",
        ...(searchTerm && { search: searchTerm }),
        ...(countryFilter !== "all" && { country: countryFilter }),
        ...(partnershipFilter !== "all" && { partnership: partnershipFilter })
      })
      
      const response = await fetch(`/api/${subdomain}/universities?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch universities')
      }
      
      const data = await response.json()
      const processedUniversities = data.universities.map((university: any) => ({
        id: university.id,
        name: university.name,
        country: university.country,
        city: university.city,
        state: university.state,
        website: university.website,
        description: university.description,
        worldRanking: university.worldRanking,
        nationalRanking: university.nationalRanking,
        accreditation: university.accreditation || [],
        programs: university.programs || [],
        subjects: university.subjects || [],
        studyLevels: university.studyLevels || [],
        requirements: university.requirements || {
          academic: [],
          language: [],
          financial: [],
          documents: []
        },
        tuitionFeeRange: university.tuitionFeeRange,
        isPartner: university.isPartner,
        partnershipLevel: university.partnershipLevel,
        commissionRate: university.commissionRate,
        contactEmail: university.contactEmail,
        contactPhone: university.contactPhone,
        address: university.address,
        studentsPlaced: university.applications?.filter((app: any) => app.status === 'ACCEPTED').length || 0,
        applications: university.applications?.length || 0,
        successRate: university.applications?.length > 0 
          ? Math.round((university.applications.filter((app: any) => app.status === 'ACCEPTED').length / university.applications.length) * 100)
          : 0,
        notes: university.notes,
        isGlobal: university.isGlobal,
        globalId: university.globalId,
        verified: university.verified,
        verificationStatus: university.verificationStatus
      }))
      setUniversities(processedUniversities)
    } catch (err) {
      console.error('Error fetching universities:', err)
      setUniversities([])
    } finally {
      setLoading(false)
    }
  }

  // Search global universities
  const searchGlobalUniversities = async (query: string) => {
    if (!query.trim()) {
      setGlobalUniversities([])
      return
    }

    try {
      setGlobalSearchLoading(true)
      const response = await fetch(`/api/global/universities?q=${encodeURIComponent(query)}&limit=10`)
      if (!response.ok) {
        throw new Error('Failed to search global universities')
      }
      
      const data = await response.json()
      setGlobalUniversities(data.universities || [])
    } catch (err) {
      console.error('Error searching global universities:', err)
      setGlobalUniversities([])
    } finally {
      setGlobalSearchLoading(false)
    }
  }

  // Auto-fill form from global university
  const autoFillFromGlobal = (globalUni: GlobalUniversity) => {
    setSelectedGlobalUniversity(globalUni)
    setFormData(prev => ({
      ...prev,
      name: globalUni.name,
      country: globalUni.country,
      city: globalUni.city,
      state: globalUni.state || "",
      website: globalUni.website || "",
      description: globalUni.description || "",
      worldRanking: globalUni.worldRanking?.toString() || "",
      nationalRanking: globalUni.nationalRanking?.toString() || "",
      type: globalUni.type || "Public",
      establishedYear: globalUni.establishedYear?.toString() || "",
      studentPopulation: globalUni.studentPopulation?.toString() || "",
      programs: globalUni.programs,
      subjects: globalUni.subjects,
      studyLevels: globalUni.studyLevels,
      tuitionFeeMin: globalUni.tuitionFeeRange?.min?.toString() || "",
      tuitionFeeMax: globalUni.tuitionFeeRange?.max?.toString() || "",
      tuitionCurrency: globalUni.tuitionFeeRange?.currency || "USD",
      acceptanceRate: globalUni.acceptanceRate?.toString() || ""
    }))
    setShowGlobalSearch(false)
    setGlobalSearchTerm("")
    setGlobalUniversities([])
  }

  // Handle form input changes
  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle multi-select changes
  const handleMultiSelectChange = (field: string, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentValues = prev[field] as string[]
      if (checked) {
        return { ...prev, [field]: [...currentValues, value] }
      } else {
        return { ...prev, [field]: currentValues.filter(v => v !== value) }
      }
    })
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      country: "",
      city: "",
      state: "",
      website: "",
      description: "",
      worldRanking: "",
      nationalRanking: "",
      type: "Public",
      establishedYear: "",
      studentPopulation: "",
      internationalStudentRatio: "",
      studentFacultyRatio: "",
      programs: [],
      subjects: [],
      studyLevels: [],
      tuitionFeeMin: "",
      tuitionFeeMax: "",
      tuitionCurrency: "USD",
      acceptanceRate: "",
      partnershipLevel: "NONE",
      commissionRate: "",
      contactEmail: "",
      contactPhone: "",
      address: "",
      notes: ""
    })
    setSelectedGlobalUniversity(null)
    setShowGlobalSearch(false)
    setGlobalSearchTerm("")
    setGlobalUniversities([])
  }

  // Submit form
  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.name || !formData.country || !formData.city) {
      alert("Please fill in all required fields: Name, Country, and City")
      return
    }

    setSubmitting(true)
    try {
      const universityData = {
        name: formData.name,
        country: formData.country,
        city: formData.city,
        state: formData.state || undefined,
        website: formData.website || undefined,
        description: formData.description || undefined,
        worldRanking: formData.worldRanking ? parseInt(formData.worldRanking) : undefined,
        nationalRanking: formData.nationalRanking ? parseInt(formData.nationalRanking) : undefined,
        type: formData.type,
        establishedYear: formData.establishedYear ? parseInt(formData.establishedYear) : undefined,
        studentPopulation: formData.studentPopulation ? parseInt(formData.studentPopulation) : undefined,
        internationalStudentRatio: formData.internationalStudentRatio ? parseFloat(formData.internationalStudentRatio) : undefined,
        studentFacultyRatio: formData.studentFacultyRatio ? parseFloat(formData.studentFacultyRatio) : undefined,
        programs: formData.programs,
        subjects: formData.subjects,
        studyLevels: formData.studyLevels,
        tuitionFeeRange: formData.tuitionFeeMin || formData.tuitionFeeMax ? {
          min: formData.tuitionFeeMin ? parseFloat(formData.tuitionFeeMin) : 0,
          max: formData.tuitionFeeMax ? parseFloat(formData.tuitionFeeMax) : 0,
          currency: formData.tuitionCurrency
        } : undefined,
        acceptanceRate: formData.acceptanceRate ? parseFloat(formData.acceptanceRate) : undefined,
        isPartner: formData.partnershipLevel !== "NONE",
        partnershipLevel: formData.partnershipLevel,
        commissionRate: formData.commissionRate ? parseFloat(formData.commissionRate) : undefined,
        contactEmail: formData.contactEmail || undefined,
        contactPhone: formData.contactPhone || undefined,
        address: formData.address || undefined,
        notes: formData.notes || undefined,
        isGlobal: !!selectedGlobalUniversity,
        globalId: selectedGlobalUniversity?.id,
        verified: selectedGlobalUniversity?.verified || false,
        verificationStatus: selectedGlobalUniversity?.verificationStatus || "PENDING"
      }

      const response = await fetch(`/api/${subdomain}/universities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(universityData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create university')
      }

      await fetchUniversities()
      setIsAddDialogOpen(false)
      resetForm()
      alert('University added successfully!')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create university')
    } finally {
      setSubmitting(false)
    }
  }

  // Debounced global search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (globalSearchTerm) {
        searchGlobalUniversities(globalSearchTerm)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [globalSearchTerm])

  useEffect(() => {
    fetchUniversities()
  }, [subdomain])

  useEffect(() => {
    fetchUniversities()
  }, [searchTerm, countryFilter, partnershipFilter])

  const filteredUniversities = universities.filter(university => {
    const matchesSearch = university.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         university.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         university.city.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCountry = countryFilter === "all" || university.country === countryFilter
    const matchesPartnership = partnershipFilter === "all" || university.partnershipLevel === partnershipFilter
    return matchesSearch && matchesCountry && matchesPartnership
  })

  const getPartnershipColor = (level: string) => {
    switch (level) {
      case "STRATEGIC": return "bg-purple-100 text-purple-800"
      case "PREMIUM": return "bg-blue-100 text-blue-800"
      case "BASIC": return "bg-green-100 text-green-800"
      case "NONE": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const stats = {
    total: universities.length,
    partners: universities.filter(u => u.isPartner).length,
    strategic: universities.filter(u => u.partnershipLevel === 'STRATEGIC').length,
    totalStudents: universities.reduce((sum, u) => sum + u.studentsPlaced, 0),
    avgSuccessRate: universities.length > 0 
      ? Math.round(universities.reduce((sum, u) => sum + u.successRate, 0) / universities.length)
      : 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
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
                <h1 className="text-xl font-bold">University Management</h1>
                <p className="text-sm text-muted-foreground">{subdomain}.eduagency.com</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
                if (!open) resetForm()
                setIsAddDialogOpen(open)
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add University
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New University</DialogTitle>
                    <DialogDescription>
                      Add a new university to your partnership network. You can search the global database for auto-fill.
                    </DialogDescription>
                  </DialogHeader>
                  
                  {/* Global University Search */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="useGlobalDatabase"
                        checked={showGlobalSearch}
                        onCheckedChange={(checked) => {
                          setShowGlobalSearch(checked as boolean)
                          if (!checked) {
                            setSelectedGlobalUniversity(null)
                            setGlobalSearchTerm("")
                            setGlobalUniversities([])
                          }
                        }}
                      />
                      <Label htmlFor="useGlobalDatabase">Search global university database</Label>
                    </div>

                    {showGlobalSearch && (
                      <div className="space-y-2">
                        <Label>Search Global Universities</Label>
                        <div className="relative">
                          <Input
                            placeholder="Type to search universities..."
                            value={globalSearchTerm}
                            onChange={(e) => setGlobalSearchTerm(e.target.value)}
                            className="pr-10"
                          />
                          {globalSearchLoading && (
                            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
                          )}
                        </div>
                        
                        {globalUniversities.length > 0 && (
                          <div className="border rounded-md max-h-60 overflow-y-auto">
                            {globalUniversities.map((uni) => (
                              <div
                                key={uni.id}
                                className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                                onClick={() => autoFillFromGlobal(uni)}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-medium">{uni.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {uni.city}, {uni.country}
                                    </div>
                                    {uni.worldRanking && (
                                      <div className="text-xs text-muted-foreground">
                                        World Rank: #{uni.worldRanking}
                                      </div>
                                    )}
                                  </div>
                                  {uni.verificationStatus === "VERIFIED" && (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {selectedGlobalUniversity && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          Auto-filled from global database: {selectedGlobalUniversity.name}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-2 h-6 w-6 p-0"
                            onClick={() => {
                              setSelectedGlobalUniversity(null)
                              resetForm()
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {/* University Form */}
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">University Name *</Label>
                        <Input 
                          id="name" 
                          placeholder="Enter university name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="website">Website</Label>
                        <Input 
                          id="website" 
                          placeholder="https://university.edu"
                          value={formData.website}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="country">Country *</Label>
                        <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map(country => (
                              <SelectItem key={country} value={country}>{country}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input 
                          id="city" 
                          placeholder="Enter city"
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State/Province</Label>
                        <Input 
                          id="state" 
                          placeholder="Enter state"
                          value={formData.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description" 
                        placeholder="Brief description of the university..."
                        rows={3}
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                      />
                    </div>

                    <div className="grid md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="type">Type</Label>
                        <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Public">Public</SelectItem>
                            <SelectItem value="Private">Private</SelectItem>
                            <SelectItem value="Community">Community</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="establishedYear">Established Year</Label>
                        <Input 
                          id="establishedYear" 
                          type="number"
                          placeholder="1850"
                          value={formData.establishedYear}
                          onChange={(e) => handleInputChange('establishedYear', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="worldRanking">World Ranking</Label>
                        <Input 
                          id="worldRanking" 
                          type="number"
                          placeholder="1"
                          value={formData.worldRanking}
                          onChange={(e) => handleInputChange('worldRanking', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="nationalRanking">National Ranking</Label>
                        <Input 
                          id="nationalRanking" 
                          type="number"
                          placeholder="1"
                          value={formData.nationalRanking}
                          onChange={(e) => handleInputChange('nationalRanking', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Multi-Select Programs */}
                    <div>
                      <Label>Programs</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                        {programs.map(program => (
                          <div key={program} className="flex items-center space-x-2">
                            <Checkbox
                              id={`program-${program}`}
                              checked={formData.programs.includes(program)}
                              onCheckedChange={(checked) => 
                                handleMultiSelectChange('programs', program, checked as boolean)
                              }
                            />
                            <Label htmlFor={`program-${program}`} className="text-sm">
                              {program}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Multi-Select Subjects */}
                    <div>
                      <Label>Subjects</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 max-h-40 overflow-y-auto border rounded-md p-2">
                        {subjects.map(subject => (
                          <div key={subject} className="flex items-center space-x-2">
                            <Checkbox
                              id={`subject-${subject}`}
                              checked={formData.subjects.includes(subject)}
                              onCheckedChange={(checked) => 
                                handleMultiSelectChange('subjects', subject, checked as boolean)
                              }
                            />
                            <Label htmlFor={`subject-${subject}`} className="text-sm">
                              {subject}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Multi-Select Study Levels */}
                    <div>
                      <Label>Study Levels</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {studyLevels.map(level => (
                          <div key={level} className="flex items-center space-x-2">
                            <Checkbox
                              id={`level-${level}`}
                              checked={formData.studyLevels.includes(level)}
                              onCheckedChange={(checked) => 
                                handleMultiSelectChange('studyLevels', level, checked as boolean)
                              }
                            />
                            <Label htmlFor={`level-${level}`} className="text-sm">
                              {level}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="partnershipLevel">Partnership Level</Label>
                        <Select value={formData.partnershipLevel} onValueChange={(value) => handleInputChange('partnershipLevel', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NONE">None</SelectItem>
                            <SelectItem value="BASIC">Basic</SelectItem>
                            <SelectItem value="PREMIUM">Premium</SelectItem>
                            <SelectItem value="STRATEGIC">Strategic</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                        <Input 
                          id="commissionRate" 
                          type="number"
                          step="0.1"
                          placeholder="15.0"
                          value={formData.commissionRate}
                          onChange={(e) => handleInputChange('commissionRate', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="contactEmail">Contact Email</Label>
                        <Input 
                          id="contactEmail" 
                          type="email"
                          placeholder="contact@university.edu"
                          value={formData.contactEmail}
                          onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="contactPhone">Contact Phone</Label>
                        <Input 
                          id="contactPhone" 
                          placeholder="+1 (555) 123-4567"
                          value={formData.contactPhone}
                          onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input 
                        id="address" 
                        placeholder="Full address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea 
                        id="notes" 
                        placeholder="Internal notes about this university..."
                        rows={3}
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSubmit} disabled={submitting}>
                        {submitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Add University
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="universities">Universities</TabsTrigger>
            <TabsTrigger value="partnerships">Partnerships</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="universities" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Universities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.partners} partners
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Strategic Partners</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{stats.strategic}</div>
                  <p className="text-xs text-muted-foreground">
                    High commission
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Students Placed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
                  <p className="text-xs text-muted-foreground">
                    Across all partners
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.avgSuccessRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    Average placement rate
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Search */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search universities..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={countryFilter} onValueChange={setCountryFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="All Countries" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Countries</SelectItem>
                        {countries.map(country => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={partnershipFilter} onValueChange={setPartnershipFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="All Partnerships" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Partnerships</SelectItem>
                        <SelectItem value="STRATEGIC">Strategic</SelectItem>
                        <SelectItem value="PREMIUM">Premium</SelectItem>
                        <SelectItem value="BASIC">Basic</SelectItem>
                        <SelectItem value="NONE">None</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      More Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Universities Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUniversities.map((university) => (
                <Card key={university.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {university.isPartner && (
                          <Award className="h-5 w-5 text-yellow-500" />
                        )}
                        {university.isGlobal && (
                          <Globe className="h-5 w-5 text-blue-500" />
                        )}
                        <CardTitle className="text-lg">{university.name}</CardTitle>
                      </div>
                      <Badge className={getPartnershipColor(university.partnershipLevel)}>
                        {university.partnershipLevel}
                      </Badge>
                    </div>
                    <CardDescription>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {university.city}, {university.country}
                      </div>
                      {university.worldRanking && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          World Rank #{university.worldRanking}
                        </div>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {university.description}
                      </p>

                      <div className="flex flex-wrap gap-1">
                        {university.programs.slice(0, 3).map((program, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {program}
                          </Badge>
                        ))}
                        {university.programs.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{university.programs.length - 3} more
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Applications</div>
                          <div className="font-medium">{university.applications}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Success Rate</div>
                          <div className="font-medium">{university.successRate}%</div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                        {university.website && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={university.website} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredUniversities.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No universities found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or add a new university.
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add University
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="partnerships">
            <Card>
              <CardHeader>
                <CardTitle>Partnership Management</CardTitle>
                <CardDescription>Manage university partnerships and agreements</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Partnership management features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>University Analytics</CardTitle>
                <CardDescription>Track university performance and metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Analytics features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}