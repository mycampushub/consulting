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
  Save
} from "lucide-react"

interface University {
  id: string
  name: string
  country: string
  city: string
  website?: string
  description?: string
  worldRanking?: number
  nationalRanking?: number
  accreditation: string[]
  programs: string[]
  requirements: {
    academic: string[]
    language: string[]
    financial: string[]
    documents: string[]
  }
  isPartner: boolean
  partnershipLevel: 'NONE' | 'BASIC' | 'PREMIUM' | 'STRATEGIC'
  commissionRate?: number
  contactEmail?: string
  contactPhone?: string
  address?: string
  createdAt: string
  lastUpdated: string
  studentsPlaced: number
  applications: number
  successRate: number
  notes?: string
}

const mockUniversities: University[] = [
  {
    id: "1",
    name: "Harvard University",
    country: "United States",
    city: "Cambridge",
    website: "https://harvard.edu",
    description: "Harvard University is a private Ivy League research university in Cambridge, Massachusetts. Established in 1636, Harvard is the oldest institution of higher education in the United States.",
    worldRanking: 1,
    nationalRanking: 1,
    accreditation: ["NEASC", "AACSB", "AMBA"],
    programs: ["Computer Science", "Business Administration", "Medicine", "Law", "Engineering", "Liberal Arts"],
    requirements: {
      academic: ["Minimum GPA 3.7", "SAT/ACT required", "Strong essays"],
      language: ["TOEFL 100+ or IELTS 7.0+", "Duolingo English Test 120+"],
      financial: ["Application fee: $75", "Tuition: $54,002/year", "Financial aid available"],
      documents: ["Transcripts", "Letters of recommendation", "Personal statement", "Portfolio (for specific programs)"]
    },
    isPartner: true,
    partnershipLevel: "STRATEGIC",
    commissionRate: 18.0,
    contactEmail: "international@harvard.edu",
    contactPhone: "+1 (617) 495-1000",
    address: "Cambridge, MA 02138, USA",
    createdAt: "2024-01-01",
    lastUpdated: "2024-01-20",
    studentsPlaced: 12,
    applications: 25,
    successRate: 48,
    notes: "Strategic partner with high commission rate. Strong preference for students with exceptional academic records and leadership experience."
  },
  {
    id: "2",
    name: "University of Oxford",
    country: "United Kingdom",
    city: "Oxford",
    website: "https://ox.ac.uk",
    description: "The University of Oxford is a collegiate research university in Oxford, England. There is evidence of teaching as early as 1096, making it the oldest university in the English-speaking world.",
    worldRanking: 2,
    nationalRanking: 1,
    accreditation: ["QAA", "Russell Group"],
    programs: ["Philosophy, Politics and Economics", "Medicine", "Computer Science", "History", "Mathematics"],
    requirements: {
      academic: ["A-levels A*A*A", "IB 38-40 points", "Strong academic references"],
      language: ["IELTS 7.0+ (no band below 6.5)", "TOEFL 100+"],
      financial: ["Application fee: £75", "Tuition: £9,250-£37,510/year", "Scholarships available"],
      documents: ["Academic transcripts", "Personal statement", "Academic references", "Written work (for humanities)"]
    },
    isPartner: true,
    partnershipLevel: "PREMIUM",
    commissionRate: 15.0,
    contactEmail: "undergraduate.admissions@ox.ac.uk",
    contactPhone: "+44 1865 270000",
    address: "Oxford OX1 2JD, UK",
    createdAt: "2024-01-02",
    lastUpdated: "2024-01-19",
    studentsPlaced: 8,
    applications: 18,
    successRate: 44,
    notes: "Premium partner with excellent reputation. Particularly strong in humanities and social sciences. Interview process for most programs."
  },
  {
    id: "3",
    name: "Stanford University",
    country: "United States",
    city: "Stanford",
    website: "https://stanford.edu",
    description: "Stanford University is a private research university in Stanford, California. It was founded in 1885 by Leland and Jane Stanford in memory of their only child, Leland Stanford Jr.",
    worldRanking: 3,
    nationalRanking: 2,
    accreditation: ["WASC", "AACSB", "ABET"],
    programs: ["Computer Science", "Engineering", "Business", "Medicine", "Law", "Humanities"],
    requirements: {
      academic: ["Minimum GPA 3.5", "SAT/ACT optional for 2024", "Rigorous high school curriculum"],
      language: ["TOEFL 100+ or IELTS 7.0+", "Duolingo English Test 115+"],
      financial: ["Application fee: $90", "Tuition: $56,169/year", "Need-based financial aid"],
      documents: ["Transcripts", "Letters of recommendation", "Essays", "Test scores (if submitted)"]
    },
    isPartner: true,
    partnershipLevel: "STRATEGIC",
    commissionRate: 20.0,
    contactEmail: "admissions@stanford.edu",
    contactPhone: "+1 (650) 723-2300",
    address: "450 Serra Mall, Stanford, CA 94305, USA",
    createdAt: "2024-01-03",
    lastUpdated: "2024-01-18",
    studentsPlaced: 15,
    applications: 32,
    successRate: 47,
    notes: "Strategic partner with highest commission rate. Excellent for STEM and business programs. Strong entrepreneurial culture."
  },
  {
    id: "4",
    name: "MIT",
    country: "United States",
    city: "Cambridge",
    website: "https://mit.edu",
    description: "The Massachusetts Institute of Technology is a private land-grant research university in Cambridge, Massachusetts. Founded in 1861, MIT has since played a key role in the development of modern technology and science.",
    worldRanking: 4,
    nationalRanking: 3,
    accreditation: ["NEASC", "ABET", "AACSB"],
    programs: ["Computer Science", "Engineering", "Physics", "Mathematics", "Economics", "Management"],
    requirements: {
      academic: ["Minimum GPA 3.7", "Strong STEM background", "Exceptional test scores"],
      language: ["TOEFL 100+ or IELTS 7.0+", "Duolingo English Test 120+"],
      financial: ["Application fee: $75", "Tuition: $53,790/year", "Need-based aid available"],
      documents: ["Transcripts", "Letters of recommendation (2 from STEM teachers)", "Essays", "Portfolio (for architecture)"]
    },
    isPartner: true,
    partnershipLevel: "PREMIUM",
    commissionRate: 16.0,
    contactEmail: "admissions@mit.edu",
    contactPhone: "+1 (617) 253-1000",
    address: "77 Massachusetts Ave, Cambridge, MA 02139, USA",
    createdAt: "2024-01-04",
    lastUpdated: "2024-01-17",
    studentsPlaced: 6,
    applications: 14,
    successRate: 43,
    notes: "Premium partner focused on STEM fields. Highly competitive with emphasis on research and innovation. Strong industry connections."
  },
  {
    id: "5",
    name: "University of Toronto",
    country: "Canada",
    city: "Toronto",
    website: "https://utoronto.ca",
    description: "The University of Toronto is a public research university in Toronto, Ontario, Canada. Founded in 1827 by royal charter, it is the oldest university in Upper Canada.",
    worldRanking: 25,
    nationalRanking: 1,
    accreditation: ["OUAC", "AUCC"],
    programs: ["Computer Science", "Engineering", "Medicine", "Law", "Business", "Arts & Science"],
    requirements: {
      academic: ["Minimum GPA 3.3", "Top 6 Grade 12 courses", "Program-specific prerequisites"],
      language: ["IELTS 6.5+ (no band below 6.0)", "TOEFL 89+"],
      financial: ["Application fee: $180 CAD", "Tuition: $31,000-67,000 CAD/year", "Scholarships available"],
      documents: ["Academic transcripts", "English proficiency test", "Personal profile", "Supplementary applications (for some programs)"]
    },
    isPartner: true,
    partnershipLevel: "BASIC",
    commissionRate: 10.0,
    contactEmail: "ask@utoronto.ca",
    contactPhone: "+1 (416) 978-2011",
    address: "27 King's College Cir, Toronto, ON M5S, Canada",
    createdAt: "2024-01-05",
    lastUpdated: "2024-01-16",
    studentsPlaced: 22,
    applications: 45,
    successRate: 49,
    notes: "Basic partner with good placement rates. More accessible admission requirements compared to top US/UK schools. Popular destination for international students."
  }
]

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
  const [hasMultipleCampuses, setHasMultipleCampuses] = useState(false)
  const [campuses, setCampuses] = useState<Array<{
    name: string
    city: string
    state: string
    country: string
    address: string
    contactEmail: string
    contactPhone: string
    studentCapacity: number
    facilities: string[]
  }>>([])
  // Partnership Management State
  const [isNewPartnershipDialogOpen, setIsNewPartnershipDialogOpen] = useState(false)
  const [isAgreementRenewalsDialogOpen, setIsAgreementRenewalsDialogOpen] = useState(false)
  const [isPerformanceReviewDialogOpen, setIsPerformanceReviewDialogOpen] = useState(false)
  const [isBulkOutreachDialogOpen, setIsBulkOutreachDialogOpen] = useState(false)
  const [selectedUniversityForPartnership, setSelectedUniversityForPartnership] = useState<University | null>(null)

  const addCampus = () => {
    setCampuses([...campuses, {
      name: "",
      city: "",
      state: "",
      country: "United States",
      address: "",
      contactEmail: "",
      contactPhone: "",
      studentCapacity: 0,
      facilities: []
    }])
  }

  const removeCampus = (index: number) => {
    setCampuses(campuses.filter((_, i) => i !== index))
  }

  const updateCampus = (index: number, field: string, value: any) => {
    const updatedCampuses = [...campuses]
    updatedCampuses[index] = { ...updatedCampuses[index], [field]: value }
    setCampuses(updatedCampuses)
  }

  // Partnership Management Functions
  const handleNewPartnership = () => {
    const nonPartnerUniversities = universities.filter(u => !u.isPartner || u.partnershipLevel === 'NONE')
    if (nonPartnerUniversities.length === 0) {
      alert('All universities are already partners. Consider upgrading existing partnerships instead.')
      return
    }
    setIsNewPartnershipDialogOpen(true)
  }

  const handleAgreementRenewals = () => {
    const partnerUniversities = universities.filter(u => u.isPartner && u.partnershipLevel !== 'NONE')
    if (partnerUniversities.length === 0) {
      alert('No active partnerships found to renew.')
      return
    }
    setIsAgreementRenewalsDialogOpen(true)
  }

  const handlePerformanceReview = () => {
    const partnerUniversities = universities.filter(u => u.isPartner && u.partnershipLevel !== 'NONE')
    if (partnerUniversities.length === 0) {
      alert('No active partnerships found to review.')
      return
    }
    setIsPerformanceReviewDialogOpen(true)
  }

  const handleBulkOutreach = () => {
    setIsBulkOutreachDialogOpen(true)
  }

  const createPartnership = async (universityId: string, partnershipLevel: string, commissionRate: number) => {
    try {
      const response = await fetch(`/api/${subdomain}/universities?id=${universityId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isPartner: true,
          partnershipLevel: partnershipLevel,
          commissionRate: commissionRate
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create partnership')
      }

      // Refresh universities list
      const fetchResponse = await fetch(`/api/${subdomain}/universities?limit=100`)
      if (fetchResponse.ok) {
        const data = await fetchResponse.json()
        const processedUniversities = data.universities.map((university: any) => ({
          id: university.id,
          name: university.name,
          country: university.country,
          city: university.city,
          website: university.website,
          description: university.description,
          worldRanking: university.worldRanking,
          nationalRanking: university.nationalRanking,
          accreditation: university.accreditation || [],
          programs: university.programs || [],
          requirements: university.requirements || {
            academic: [],
            language: [],
            financial: [],
            documents: []
          },
          isPartner: university.isPartner,
          partnershipLevel: university.partnershipLevel,
          commissionRate: university.commissionRate,
          contactEmail: university.contactEmail,
          contactPhone: university.contactPhone,
          address: university.address,
          createdAt: university.createdAt,
          lastUpdated: university.updatedAt,
          studentsPlaced: university.applications?.filter((app: any) => app.status === 'ACCEPTED').length || 0,
          applications: university.applications?.length || 0,
          successRate: university.applications?.length > 0 
            ? Math.round((university.applications.filter((app: any) => app.status === 'ACCEPTED').length / university.applications.length) * 100)
            : 0,
          notes: university.notes
        }))
        setUniversities(processedUniversities)
      }

      setIsNewPartnershipDialogOpen(false)
      alert('Partnership created successfully!')
    } catch (error) {
      console.error('Error creating partnership:', error)
      alert('Failed to create partnership. Please try again.')
    }
  }

  const renewAgreement = async (universityId: string, newCommissionRate: number, renewalTerms: string) => {
    try {
      const response = await fetch(`/api/${subdomain}/universities?id=${universityId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commissionRate: newCommissionRate,
          notes: renewalTerms
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to renew agreement')
      }

      // Refresh universities list
      const fetchResponse = await fetch(`/api/${subdomain}/universities?limit=100`)
      if (fetchResponse.ok) {
        const data = await fetchResponse.json()
        const processedUniversities = data.universities.map((university: any) => ({
          id: university.id,
          name: university.name,
          country: university.country,
          city: university.city,
          website: university.website,
          description: university.description,
          worldRanking: university.worldRanking,
          nationalRanking: university.nationalRanking,
          accreditation: university.accreditation || [],
          programs: university.programs || [],
          requirements: university.requirements || {
            academic: [],
            language: [],
            financial: [],
            documents: []
          },
          isPartner: university.isPartner,
          partnershipLevel: university.partnershipLevel,
          commissionRate: university.commissionRate,
          contactEmail: university.contactEmail,
          contactPhone: university.contactPhone,
          address: university.address,
          createdAt: university.createdAt,
          lastUpdated: university.updatedAt,
          studentsPlaced: university.applications?.filter((app: any) => app.status === 'ACCEPTED').length || 0,
          applications: university.applications?.length || 0,
          successRate: university.applications?.length > 0 
            ? Math.round((university.applications.filter((app: any) => app.status === 'ACCEPTED').length / university.applications.length) * 100)
            : 0,
          notes: university.notes
        }))
        setUniversities(processedUniversities)
      }

      setIsAgreementRenewalsDialogOpen(false)
      alert('Agreement renewed successfully!')
    } catch (error) {
      console.error('Error renewing agreement:', error)
      alert('Failed to renew agreement. Please try again.')
    }
  }

  const sendBulkOutreach = async (message: string, targetUniversities: string[]) => {
    try {
      // Simulate bulk outreach - in a real implementation, this would send emails or messages
      const selectedUniversities = universities.filter(u => targetUniversities.includes(u.id))
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setIsBulkOutreachDialogOpen(false)
      alert(`Bulk outreach sent successfully to ${selectedUniversities.length} universities!`)
    } catch (error) {
      console.error('Error sending bulk outreach:', error)
      alert('Failed to send bulk outreach. Please try again.')
    }
  }

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/${subdomain}/universities?limit=100`)
        if (!response.ok) throw new Error('Failed to fetch universities')
        
        const data = await response.json()
        const processedUniversities = data.universities.map((university: any) => ({
          id: university.id,
          name: university.name,
          country: university.country,
          city: university.city,
          website: university.website,
          description: university.description,
          worldRanking: university.worldRanking,
          nationalRanking: university.nationalRanking,
          accreditation: university.accreditation || [],
          programs: university.programs || [],
          requirements: university.requirements || {
            academic: [],
            language: [],
            financial: [],
            documents: []
          },
          isPartner: university.isPartner,
          partnershipLevel: university.partnershipLevel,
          commissionRate: university.commissionRate,
          contactEmail: university.contactEmail,
          contactPhone: university.contactPhone,
          address: university.address,
          createdAt: university.createdAt,
          lastUpdated: university.updatedAt,
          studentsPlaced: university.applications?.filter((app: any) => app.status === 'ACCEPTED').length || 0,
          applications: university.applications?.length || 0,
          successRate: university.applications?.length > 0 
            ? Math.round((university.applications.filter((app: any) => app.status === 'ACCEPTED').length / university.applications.length) * 100)
            : 0,
          notes: university.notes
        }))
        setUniversities(processedUniversities)
      } catch (err) {
        console.error('Error fetching universities:', err)
        setUniversities([])
      } finally {
        setLoading(false)
      }
    }

    fetchUniversities()
  }, [subdomain])

  // CRUD Operations
  const addUniversity = async (newUniversity: Omit<University, 'id' | 'createdAt' | 'lastUpdated'>) => {
    try {
      const response = await fetch(`/api/${subdomain}/universities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newUniversity.name,
          country: newUniversity.country,
          city: newUniversity.city,
          website: newUniversity.website,
          description: newUniversity.description,
          worldRanking: newUniversity.worldRanking,
          nationalRanking: newUniversity.nationalRanking,
          accreditation: newUniversity.accreditation,
          programs: newUniversity.programs,
          requirements: JSON.stringify(newUniversity.requirements),
          isPartner: newUniversity.isPartner,
          partnershipLevel: newUniversity.partnershipLevel,
          commissionRate: newUniversity.commissionRate,
          contactEmail: newUniversity.contactEmail,
          contactPhone: newUniversity.contactPhone,
          address: newUniversity.address
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create university')
      }

      const createdUniversity = await response.json()
      
      // Create campuses if the university has multiple campuses
      if (hasMultipleCampuses && campuses.length > 0) {
        for (const campus of campuses) {
          if (campus.name && campus.city && campus.country) {
            await fetch(`/api/${subdomain}/campuses`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                universityId: createdUniversity.id,
                name: campus.name,
                city: campus.city,
                state: campus.state,
                country: campus.country,
                address: campus.address,
                contactEmail: campus.contactEmail,
                contactPhone: campus.contactPhone,
                studentCapacity: campus.studentCapacity || null,
                facilities: campus.facilities || []
              }),
            })
          }
        }
      }
      
      // Reset form state
      setHasMultipleCampuses(false)
      setCampuses([])
      
      // Refresh universities list
      const fetchResponse = await fetch(`/api/${subdomain}/universities?limit=100`)
      if (fetchResponse.ok) {
        const data = await fetchResponse.json()
        const processedUniversities = data.universities.map((university: any) => ({
          id: university.id,
          name: university.name,
          country: university.country,
          city: university.city,
          website: university.website,
          description: university.description,
          worldRanking: university.worldRanking,
          nationalRanking: university.nationalRanking,
          accreditation: university.accreditation || [],
          programs: university.programs || [],
          requirements: university.requirements || {
            academic: [],
            language: [],
            financial: [],
            documents: []
          },
          isPartner: university.isPartner,
          partnershipLevel: university.partnershipLevel,
          commissionRate: university.commissionRate,
          contactEmail: university.contactEmail,
          contactPhone: university.contactPhone,
          address: university.address,
          createdAt: university.createdAt,
          lastUpdated: university.updatedAt,
          studentsPlaced: university.applications?.filter((app: any) => app.status === 'ACCEPTED').length || 0,
          applications: university.applications?.length || 0,
          successRate: university.applications?.length > 0 
            ? Math.round((university.applications.filter((app: any) => app.status === 'ACCEPTED').length / university.applications.length) * 100)
            : 0,
          notes: university.notes
        }))
        setUniversities(processedUniversities)
      }

      setIsAddDialogOpen(false)
      alert('University added successfully!')
    } catch (error) {
      console.error('Error adding university:', error)
      alert('Failed to add university. Please try again.')
    }
  }

  const updateUniversity = async (updatedUniversity: University) => {
    try {
      const response = await fetch(`/api/${subdomain}/universities?id=${updatedUniversity.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: updatedUniversity.name,
          country: updatedUniversity.country,
          city: updatedUniversity.city,
          website: updatedUniversity.website,
          description: updatedUniversity.description,
          worldRanking: updatedUniversity.worldRanking,
          nationalRanking: updatedUniversity.nationalRanking,
          accreditation: updatedUniversity.accreditation,
          programs: updatedUniversity.programs,
          requirements: JSON.stringify(updatedUniversity.requirements),
          isPartner: updatedUniversity.isPartner,
          partnershipLevel: updatedUniversity.partnershipLevel,
          commissionRate: updatedUniversity.commissionRate,
          contactEmail: updatedUniversity.contactEmail,
          contactPhone: updatedUniversity.contactPhone,
          address: updatedUniversity.address
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update university')
      }

      // Refresh universities list
      const fetchResponse = await fetch(`/api/${subdomain}/universities?limit=100`)
      if (fetchResponse.ok) {
        const data = await fetchResponse.json()
        const processedUniversities = data.universities.map((university: any) => ({
          id: university.id,
          name: university.name,
          country: university.country,
          city: university.city,
          website: university.website,
          description: university.description,
          worldRanking: university.worldRanking,
          nationalRanking: university.nationalRanking,
          accreditation: university.accreditation || [],
          programs: university.programs || [],
          requirements: university.requirements || {
            academic: [],
            language: [],
            financial: [],
            documents: []
          },
          isPartner: university.isPartner,
          partnershipLevel: university.partnershipLevel,
          commissionRate: university.commissionRate,
          contactEmail: university.contactEmail,
          contactPhone: university.contactPhone,
          address: university.address,
          createdAt: university.createdAt,
          lastUpdated: university.updatedAt,
          studentsPlaced: university.applications?.filter((app: any) => app.status === 'ACCEPTED').length || 0,
          applications: university.applications?.length || 0,
          successRate: university.applications?.length > 0 
            ? Math.round((university.applications.filter((app: any) => app.status === 'ACCEPTED').length / university.applications.length) * 100)
            : 0,
          notes: university.notes
        }))
        setUniversities(processedUniversities)
      }

      setIsEditDialogOpen(false)
      setEditingUniversity(null)
      alert('University updated successfully!')
    } catch (error) {
      console.error('Error updating university:', error)
      alert('Failed to update university. Please try again.')
    }
  }

  const deleteUniversity = async (universityId: string) => {
    if (!confirm('Are you sure you want to delete this university? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/${subdomain}/universities?id=${universityId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete university')
      }

      // Remove university from state
      setUniversities(universities.filter(u => u.id !== universityId))
      alert('University deleted successfully!')
    } catch (error) {
      console.error('Error deleting university:', error)
      alert('Failed to delete university. Please try again.')
    }
  }

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
    premium: universities.filter(u => u.partnershipLevel === 'PREMIUM').length,
    basic: universities.filter(u => u.partnershipLevel === 'BASIC').length,
    totalStudents: universities.reduce((sum, u) => sum + u.studentsPlaced, 0),
    totalApplications: universities.reduce((sum, u) => sum + u.applications, 0),
    avgSuccessRate: Math.round(universities.reduce((sum, u) => sum + u.successRate, 0) / universities.length)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading universities...</p>
        </div>
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
                <h1 className="text-xl font-bold">University Partnerships</h1>
                <p className="text-sm text-muted-foreground">{subdomain}.eduagency.com</p>
              </div>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
              if (!open) {
                // Reset form state when dialog is closed
                setHasMultipleCampuses(false)
                setCampuses([])
              }
              setIsAddDialogOpen(open)
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add University
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New University</DialogTitle>
                  <DialogDescription>
                    Add a new university to your partnership network
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">University Name *</Label>
                      <Input id="name" placeholder="Enter university name" />
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input id="website" placeholder="https://university.edu" />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="country">Country *</Label>
                      <Select>
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
                      <Input id="city" placeholder="Enter city" />
                    </div>
                    <div>
                      <Label htmlFor="worldRanking">World Ranking</Label>
                      <Input id="worldRanking" type="number" placeholder="1" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="Brief description of the university..." rows={3} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="partnershipLevel">Partnership Level</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select partnership level" />
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
                      <Input id="commissionRate" type="number" step="0.1" placeholder="15.0" />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input id="contactEmail" type="email" placeholder="contact@university.edu" />
                    </div>
                    <div>
                      <Label htmlFor="contactPhone">Contact Phone</Label>
                      <Input id="contactPhone" placeholder="+1 (555) 123-4567" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" placeholder="Full address" />
                  </div>
                  <div>
                    <Label htmlFor="programs">Programs</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select programs" />
                      </SelectTrigger>
                      <SelectContent>
                        {programs.map(program => (
                          <SelectItem key={program} value={program}>{program}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="hasMultipleCampuses"
                      checked={hasMultipleCampuses}
                      onChange={(e) => {
                        setHasMultipleCampuses(e.target.checked)
                        if (!e.target.checked) {
                          setCampuses([])
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="hasMultipleCampuses">This university has multiple campuses</Label>
                  </div>
                  
                  {hasMultipleCampuses && (
                    <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Campuses</h3>
                        <Button type="button" variant="outline" size="sm" onClick={addCampus}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Campus
                        </Button>
                      </div>
                      
                      {campuses.map((campus, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-4">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">Campus {index + 1}</h4>
                            {campuses.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeCampus(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`campus-name-${index}`}>Campus Name *</Label>
                              <Input
                                id={`campus-name-${index}`}
                                placeholder="Main Campus"
                                value={campus.name}
                                onChange={(e) => updateCampus(index, 'name', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`campus-city-${index}`}>City *</Label>
                              <Input
                                id={`campus-city-${index}`}
                                placeholder="Enter city"
                                value={campus.city}
                                onChange={(e) => updateCampus(index, 'city', e.target.value)}
                              />
                            </div>
                          </div>
                          
                          <div className="grid md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor={`campus-state-${index}`}>State/Province</Label>
                              <Input
                                id={`campus-state-${index}`}
                                placeholder="State"
                                value={campus.state}
                                onChange={(e) => updateCampus(index, 'state', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`campus-country-${index}`}>Country *</Label>
                              <Select
                                value={campus.country}
                                onValueChange={(value) => updateCampus(index, 'country', value)}
                              >
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
                              <Label htmlFor={`campus-capacity-${index}`}>Student Capacity</Label>
                              <Input
                                id={`campus-capacity-${index}`}
                                type="number"
                                placeholder="5000"
                                value={campus.studentCapacity || ''}
                                onChange={(e) => updateCampus(index, 'studentCapacity', parseInt(e.target.value) || 0)}
                              />
                            </div>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`campus-email-${index}`}>Contact Email</Label>
                              <Input
                                id={`campus-email-${index}`}
                                type="email"
                                placeholder="campus@university.edu"
                                value={campus.contactEmail}
                                onChange={(e) => updateCampus(index, 'contactEmail', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`campus-phone-${index}`}>Contact Phone</Label>
                              <Input
                                id={`campus-phone-${index}`}
                                placeholder="+1 (555) 123-4567"
                                value={campus.contactPhone}
                                onChange={(e) => updateCampus(index, 'contactPhone', e.target.value)}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor={`campus-address-${index}`}>Address</Label>
                            <Input
                              id={`campus-address-${index}`}
                              placeholder="Full campus address"
                              value={campus.address}
                              onChange={(e) => updateCampus(index, 'address', e.target.value)}
                            />
                          </div>
                        </div>
                      ))}
                      
                      {campuses.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No campuses added yet. Click "Add Campus" to add your first campus.
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea id="notes" placeholder="Additional notes about the partnership..." rows={3} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => {
                      // Collect form data
                      const name = (document.getElementById('name') as HTMLInputElement)?.value || ""
                      const country = (document.getElementById('country') as HTMLInputElement)?.value || ""
                      const city = (document.getElementById('city') as HTMLInputElement)?.value || ""
                      const website = (document.getElementById('website') as HTMLInputElement)?.value || ""
                      const description = (document.getElementById('description') as HTMLTextAreaElement)?.value || ""
                      const worldRanking = parseInt((document.getElementById('worldRanking') as HTMLInputElement)?.value || "") || null
                      const partnershipLevel = (document.getElementById('partnershipLevel') as HTMLSelectElement)?.value || "NONE"
                      const commissionRate = parseFloat((document.getElementById('commissionRate') as HTMLInputElement)?.value || "") || null
                      const contactEmail = (document.getElementById('contactEmail') as HTMLInputElement)?.value || ""
                      const contactPhone = (document.getElementById('contactPhone') as HTMLInputElement)?.value || ""
                      const address = (document.getElementById('address') as HTMLInputElement)?.value || ""
                      const notes = (document.getElementById('notes') as HTMLTextAreaElement)?.value || ""
                      
                      if (!name || !country || !city) {
                        alert("Please fill in all required fields (Name, Country, City)")
                        return
                      }
                      
                      if (hasMultipleCampuses && campuses.length === 0) {
                        alert("Please add at least one campus or uncheck the multiple campuses option")
                        return
                      }
                      
                      if (hasMultipleCampuses) {
                        const invalidCampus = campuses.find(c => !c.name || !c.city || !c.country)
                        if (invalidCampus) {
                          alert("Please fill in all required campus fields (Name, City, Country)")
                          return
                        }
                      }
                      
                      const newUniversity: Omit<University, 'id' | 'createdAt' | 'lastUpdated'> = {
                        name,
                        country,
                        city,
                        website: website || undefined,
                        description: description || undefined,
                        worldRanking: worldRanking || undefined,
                        nationalRanking: undefined,
                        accreditation: [],
                        programs: [],
                        requirements: {
                          academic: [],
                          language: [],
                          financial: [],
                          documents: []
                        },
                        isPartner: partnershipLevel !== "NONE",
                        partnershipLevel: partnershipLevel as any,
                        commissionRate: commissionRate || undefined,
                        contactEmail: contactEmail || undefined,
                        contactPhone: contactPhone || undefined,
                        address: address || undefined,
                        studentsPlaced: 0,
                        applications: 0,
                        successRate: 0,
                        notes: notes || undefined
                      }
                      
                      addUniversity(newUniversity)
                    }}>
                      Add University
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Students Placed</p>
                          <p className="font-semibold">{university.studentsPlaced}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Applications</p>
                          <p className="font-semibold">{university.applications}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Success Rate</p>
                          <p className="font-semibold">{university.successRate}%</p>
                        </div>
                        {university.commissionRate && (
                          <div>
                            <p className="text-muted-foreground">Commission</p>
                            <p className="font-semibold">{university.commissionRate}%</p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => {
                            setSelectedUniversity(university)
                            setIsViewDialogOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => {
                            setEditingUniversity(university)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteUniversity(university.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        {university.website && (
                          <Button variant="outline" size="sm" asChild>
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
          </TabsContent>

          <TabsContent value="partnerships" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Handshake className="h-5 w-5 text-purple-600" />
                    Strategic
                  </CardTitle>
                  <CardDescription>High-value partnerships</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.strategic}</div>
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between text-sm">
                      <span>Students</span>
                      <span>{universities.filter(u => u.partnershipLevel === 'STRATEGIC').reduce((sum, u) => sum + u.studentsPlaced, 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Avg Commission</span>
                      <span>18%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-blue-600" />
                    Premium
                  </CardTitle>
                  <CardDescription>Established partnerships</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.premium}</div>
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between text-sm">
                      <span>Students</span>
                      <span>{universities.filter(u => u.partnershipLevel === 'PREMIUM').reduce((sum, u) => sum + u.studentsPlaced, 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Avg Commission</span>
                      <span>15.5%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Basic
                  </CardTitle>
                  <CardDescription>Standard partnerships</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.basic}</div>
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between text-sm">
                      <span>Students</span>
                      <span>{universities.filter(u => u.partnershipLevel === 'BASIC').reduce((sum, u) => sum + u.studentsPlaced, 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Avg Commission</span>
                      <span>10%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-orange-600" />
                    Partnership Goals
                  </CardTitle>
                  <CardDescription>2024 Targets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>New Strategic</span>
                        <span>2/5</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '40%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Total Partners</span>
                        <span>{stats.partners}/25</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Partnership Management</CardTitle>
                <CardDescription>Tools and actions for managing university partnerships</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button onClick={handleNewPartnership} className="h-20 flex-col">
                    <Plus className="h-6 w-6 mb-2" />
                    New Partnership
                  </Button>
                  <Button onClick={handleAgreementRenewals} variant="outline" className="h-20 flex-col">
                    <FileText className="h-6 w-6 mb-2" />
                    Agreement Renewals
                  </Button>
                  <Button onClick={handlePerformanceReview} variant="outline" className="h-20 flex-col">
                    <BarChart3 className="h-6 w-6 mb-2" />
                    Performance Review
                  </Button>
                  <Button onClick={handleBulkOutreach} variant="outline" className="h-20 flex-col">
                    <Mail className="h-6 w-6 mb-2" />
                    Bulk Outreach
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Partnership Performance</CardTitle>
                  <CardDescription>Success rates by partnership level</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Strategic</span>
                        <span>47% success rate</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-purple-600 h-3 rounded-full" style={{ width: '47%' }}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Premium</span>
                        <span>44% success rate</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-blue-600 h-3 rounded-full" style={{ width: '44%' }}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Basic</span>
                        <span>49% success rate</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-green-600 h-3 rounded-full" style={{ width: '49%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Universities</CardTitle>
                  <CardDescription>Based on student placements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {universities
                      .sort((a, b) => b.studentsPlaced - a.studentsPlaced)
                      .slice(0, 5)
                      .map((university, index) => (
                        <div key={university.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium">{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-medium">{university.name}</p>
                              <p className="text-sm text-muted-foreground">{university.studentsPlaced} students</p>
                            </div>
                          </div>
                          <Badge className={getPartnershipColor(university.partnershipLevel)}>
                            {university.partnershipLevel}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Partnership Revenue</CardTitle>
                <CardDescription>Commission earnings by partnership level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">$54K</div>
                    <p className="text-sm text-muted-foreground">Strategic</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">$36K</div>
                    <p className="text-sm text-muted-foreground">Premium</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">$22K</div>
                    <p className="text-sm text-muted-foreground">Basic</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-600">$112K</div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Student Application Analytics */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Application Funnel Analysis</CardTitle>
                  <CardDescription>Student application journey metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Inquiries Received</span>
                        <span className="font-medium">{stats.totalApplications * 2.5}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Applications Started</span>
                        <span className="font-medium">{stats.totalApplications * 1.8}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '72%' }}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Applications Submitted</span>
                        <span className="font-medium">{stats.totalApplications}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-600 h-2 rounded-full" style={{ width: '40%' }}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Acceptances Received</span>
                        <span className="font-medium">{stats.totalStudents}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: `${stats.avgSuccessRate}%` }}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Enrollments Confirmed</span>
                        <span className="font-medium">{Math.round(stats.totalStudents * 0.85)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-teal-600 h-2 rounded-full" style={{ width: `${Math.round(stats.avgSuccessRate * 0.85)}%` }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Student Demographics</CardTitle>
                  <CardDescription>Applicant background and preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-3">Study Level Preferences</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Undergraduate</span>
                          <span>65%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Postgraduate</span>
                          <span>25%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Doctoral/Research</span>
                          <span>10%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-orange-600 h-2 rounded-full" style={{ width: '10%' }}></div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3">Popular Study Fields</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span>Business & Management</span>
                          <span className="font-medium">28%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Computer Science</span>
                          <span className="font-medium">22%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Engineering</span>
                          <span className="font-medium">18%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Medicine & Health</span>
                          <span className="font-medium">15%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Social Sciences</span>
                          <span className="font-medium">10%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Other Fields</span>
                          <span className="font-medium">7%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Application Success Metrics</CardTitle>
                  <CardDescription>Detailed performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{stats.avgSuccessRate}%</div>
                      <p className="text-sm text-muted-foreground">Overall Success Rate</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-xl font-bold text-blue-600">12 days</div>
                        <p className="text-xs text-muted-foreground">Avg. Processing Time</p>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-purple-600">94%</div>
                        <p className="text-xs text-muted-foreground">Document Completion</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Interview Rate</span>
                        <span>78%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Application Trends</CardTitle>
                  <CardDescription>Application volume over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { month: 'Jan', applications: 45, trend: 'up' },
                      { month: 'Feb', applications: 52, trend: 'up' },
                      { month: 'Mar', applications: 48, trend: 'down' },
                      { month: 'Apr', applications: 67, trend: 'up' },
                      { month: 'May', applications: 73, trend: 'up' },
                      { month: 'Jun', applications: 69, trend: 'down' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span>{item.month}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full" 
                              style={{ width: `${(item.applications / 80) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs w-8 text-right">{item.applications}</span>
                          {item.trend === 'up' ? (
                            <TrendingUp className="h-3 w-3 text-green-600" />
                          ) : (
                            <Activity className="h-3 w-3 text-red-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Regional Insights</CardTitle>
                  <CardDescription>Application distribution by region</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { region: 'North America', applications: 156, percentage: 42 },
                      { region: 'Europe', applications: 98, percentage: 26 },
                      { region: 'Asia Pacific', applications: 75, percentage: 20 },
                      { region: 'Other Regions', applications: 42, percentage: 12 }
                    ].map((item, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{item.region}</span>
                          <span>{item.applications} ({item.percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full" 
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Popular Destinations Feature */}
            <Card>
              <CardHeader>
                <CardTitle>Popular Student Destinations</CardTitle>
                <CardDescription>Most sought-after countries and cities for student applications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-4">Top Countries by Applications</h4>
                    <div className="space-y-3">
                      {[
                        { country: 'United States', applications: 89, percentage: 24, trend: 'up', universities: 45 },
                        { country: 'United Kingdom', applications: 76, percentage: 20, trend: 'up', universities: 38 },
                        { country: 'Canada', applications: 68, percentage: 18, trend: 'stable', universities: 32 },
                        { country: 'Australia', applications: 54, percentage: 15, trend: 'up', universities: 28 },
                        { country: 'Germany', applications: 42, percentage: 11, trend: 'up', universities: 22 },
                        { country: 'Netherlands', applications: 38, percentage: 10, trend: 'stable', universities: 18 }
                      ].map((item, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium">{index + 1}</span>
                              </div>
                              <div>
                                <p className="font-medium text-sm">{item.country}</p>
                                <p className="text-xs text-muted-foreground">{item.universities} universities</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{item.applications}</span>
                              {item.trend === 'up' ? (
                                <TrendingUp className="h-3 w-3 text-green-600" />
                              ) : (
                                <Activity className="h-3 w-3 text-gray-400" />
                              )}
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-gradient-to-r from-blue-600 to-purple-600 h-1.5 rounded-full" 
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-4">Top Cities by Student Preferences</h4>
                    <div className="space-y-3">
                      {[
                        { city: 'London', country: 'UK', applications: 34, popularity: 92, avgCost: '$22,000' },
                        { city: 'New York', country: 'USA', applications: 31, popularity: 89, avgCost: '$28,000' },
                        { city: 'Toronto', country: 'Canada', applications: 28, popularity: 87, avgCost: '$18,000' },
                        { city: 'Sydney', country: 'Australia', applications: 25, popularity: 85, avgCost: '$25,000' },
                        { city: 'Berlin', country: 'Germany', applications: 22, popularity: 82, avgCost: '$15,000' },
                        { city: 'Melbourne', country: 'Australia', applications: 20, popularity: 80, avgCost: '$23,000' }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <MapPin className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{item.city}</p>
                              <p className="text-xs text-muted-foreground">{item.country}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-sm">
                              <span className="font-medium">{item.applications}</span>
                              <span className="text-xs text-muted-foreground">apps</span>
                            </div>
                            <div className="text-xs text-muted-foreground">{item.avgCost}/year</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h5 className="font-medium text-blue-900 mb-2">Destination Insights</h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Most Popular Region:</span>
                          <span className="text-blue-700">Europe (44%)</span>
                        </div>
                        <div>
                          <span className="font-medium">Fastest Growing:</span>
                          <span className="text-blue-700">Germany (+18%)</span>
                        </div>
                        <div>
                          <span className="font-medium">Avg. Budget Range:</span>
                          <span className="text-blue-700">$15K-$30K</span>
                        </div>
                        <div>
                          <span className="font-medium">Preferred Duration:</span>
                          <span className="text-blue-700">2-4 years</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Destination Trends</h4>
                    <Button variant="outline" size="sm">
                      <Download className="h-3 w-3 mr-2" />
                      Export Report
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-3 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">+24%</div>
                      <p className="text-sm text-muted-foreground">Growth in European destinations</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">$22.5K</div>
                      <p className="text-sm text-muted-foreground">Average tuition cost</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">87%</div>
                      <p className="text-sm text-muted-foreground">Student satisfaction rate</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* University Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>University Details</DialogTitle>
            <DialogDescription>
              Complete university information and partnership details
            </DialogDescription>
          </DialogHeader>
          {selectedUniversity && (
            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">University Name</Label>
                        <p className="text-lg">{selectedUniversity.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Location</Label>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <p>{selectedUniversity.city}, {selectedUniversity.country}</p>
                        </div>
                      </div>
                      {selectedUniversity.website && (
                        <div>
                          <Label className="text-sm font-medium">Website</Label>
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <a 
                              href={selectedUniversity.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {selectedUniversity.website}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      {selectedUniversity.worldRanking && (
                        <div>
                          <Label className="text-sm font-medium">World Ranking</Label>
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <p className="text-lg font-semibold">#{selectedUniversity.worldRanking}</p>
                          </div>
                        </div>
                      )}
                      <div>
                        <Label className="text-sm font-medium">Partnership Level</Label>
                        <Badge className={getPartnershipColor(selectedUniversity.partnershipLevel)}>
                          {selectedUniversity.partnershipLevel}
                        </Badge>
                      </div>
                      {selectedUniversity.commissionRate && (
                        <div>
                          <Label className="text-sm font-medium">Commission Rate</Label>
                          <p className="text-lg font-semibold">{selectedUniversity.commissionRate}%</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{selectedUniversity.description}</p>
                </CardContent>
              </Card>

              {/* Programs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Programs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedUniversity.programs.map((program, index) => (
                      <Badge key={index} variant="outline">{program}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Requirements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Admission Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Academic</h4>
                      <ul className="space-y-1">
                        {selectedUniversity.requirements.academic.map((req, index) => (
                          <li key={index} className="text-sm flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Language</h4>
                      <ul className="space-y-1">
                        {selectedUniversity.requirements.language.map((req, index) => (
                          <li key={index} className="text-sm flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Financial</h4>
                      <ul className="space-y-1">
                        {selectedUniversity.requirements.financial.map((req, index) => (
                          <li key={index} className="text-sm flex items-center gap-2">
                            <DollarSign className="h-3 w-3 text-green-600" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Documents</h4>
                      <ul className="space-y-1">
                        {selectedUniversity.requirements.documents.map((req, index) => (
                          <li key={index} className="text-sm flex items-center gap-2">
                            <FileText className="h-3 w-3 text-green-600" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      {selectedUniversity.contactEmail && (
                        <div>
                          <Label className="text-sm font-medium">Email</Label>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <p>{selectedUniversity.contactEmail}</p>
                          </div>
                        </div>
                      )}
                      {selectedUniversity.contactPhone && (
                        <div>
                          <Label className="text-sm font-medium">Phone</Label>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <p>{selectedUniversity.contactPhone}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      {selectedUniversity.address && (
                        <div>
                          <Label className="text-sm font-medium">Address</Label>
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <p className="text-sm">{selectedUniversity.address}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{selectedUniversity.studentsPlaced}</div>
                      <p className="text-sm text-muted-foreground">Students Placed</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{selectedUniversity.applications}</div>
                      <p className="text-sm text-muted-foreground">Applications</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">{selectedUniversity.successRate}%</div>
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600">
                        {selectedUniversity.commissionRate || 0}%
                      </div>
                      <p className="text-sm text-muted-foreground">Commission</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {selectedUniversity.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">{selectedUniversity.notes}</p>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
                <Button>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit University
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Partnership Dialog */}
      <Dialog open={isNewPartnershipDialogOpen} onOpenChange={setIsNewPartnershipDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Partnership</DialogTitle>
            <DialogDescription>
              Establish a new partnership with a university
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="university-select">Select University *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a university" />
                </SelectTrigger>
                <SelectContent>
                  {universities
                    .filter(u => !u.isPartner || u.partnershipLevel === 'NONE')
                    .map(university => (
                      <SelectItem key={university.id} value={university.id}>
                        {university.name} - {university.country}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="partnership-level">Partnership Level *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BASIC">Basic</SelectItem>
                    <SelectItem value="PREMIUM">Premium</SelectItem>
                    <SelectItem value="STRATEGIC">Strategic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="commission-rate">Commission Rate (%) *</Label>
                <Input id="commission-rate" type="number" step="0.1" placeholder="15.0" />
              </div>
            </div>
            <div>
              <Label htmlFor="partnership-notes">Partnership Terms</Label>
              <Textarea id="partnership-notes" placeholder="Describe partnership terms, conditions, and expectations..." rows={4} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsNewPartnershipDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                const universitySelect = document.getElementById('university-select') as HTMLSelectElement
                const partnershipLevel = document.getElementById('partnership-level') as HTMLSelectElement
                const commissionRate = document.getElementById('commission-rate') as HTMLInputElement
                
                if (!universitySelect.value || !partnershipLevel.value || !commissionRate.value) {
                  alert('Please fill in all required fields')
                  return
                }
                
                createPartnership(universitySelect.value, partnershipLevel.value, parseFloat(commissionRate.value))
              }}>
                Create Partnership
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Agreement Renewals Dialog */}
      <Dialog open={isAgreementRenewalsDialogOpen} onOpenChange={setIsAgreementRenewalsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Renew Partnership Agreement</DialogTitle>
            <DialogDescription>
              Renew and update partnership agreements with existing partners
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="renewal-university">Select University *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a partner university" />
                </SelectTrigger>
                <SelectContent>
                  {universities
                    .filter(u => u.isPartner && u.partnershipLevel !== 'NONE')
                    .map(university => (
                      <SelectItem key={university.id} value={university.id}>
                        {university.name} - {university.partnershipLevel} ({university.commissionRate}%)
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-commission-rate">New Commission Rate (%)</Label>
                <Input id="new-commission-rate" type="number" step="0.1" placeholder="15.0" />
              </div>
              <div>
                <Label htmlFor="renewal-duration">Renewal Period</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Year</SelectItem>
                    <SelectItem value="2">2 Years</SelectItem>
                    <SelectItem value="3">3 Years</SelectItem>
                    <SelectItem value="5">5 Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="renewal-terms">Renewal Terms & Conditions</Label>
              <Textarea id="renewal-terms" placeholder="Updated terms, conditions, and expectations for the renewed partnership..." rows={4} />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Current Partnership Details</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Current Level:</span> <span id="current-level">-</span>
                </div>
                <div>
                  <span className="font-medium">Current Rate:</span> <span id="current-rate">-</span>
                </div>
                <div>
                  <span className="font-medium">Students Placed:</span> <span id="current-students">-</span>
                </div>
                <div>
                  <span className="font-medium">Success Rate:</span> <span id="current-success">-</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAgreementRenewalsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                const universitySelect = document.getElementById('renewal-university') as HTMLSelectElement
                const newCommissionRate = document.getElementById('new-commission-rate') as HTMLInputElement
                const renewalTerms = document.getElementById('renewal-terms') as HTMLTextAreaElement
                
                if (!universitySelect.value) {
                  alert('Please select a university')
                  return
                }
                
                renewAgreement(universitySelect.value, newCommissionRate.value ? parseFloat(newCommissionRate.value) : 0, renewalTerms.value || '')
              }}>
                Renew Agreement
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Performance Review Dialog */}
      <Dialog open={isPerformanceReviewDialogOpen} onOpenChange={setIsPerformanceReviewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Partnership Performance Review</DialogTitle>
            <DialogDescription>
              Review and analyze partnership performance across all universities
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Total Partners</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.partners}</div>
                  <div className="text-xs text-muted-foreground">Active partnerships</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Total Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalStudents}</div>
                  <div className="text-xs text-muted-foreground">Placed this year</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Avg Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.avgSuccessRate}%</div>
                  <div className="text-xs text-muted-foreground">Across all partners</div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Label htmlFor="review-university">Select University for Detailed Review</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a partner university" />
                </SelectTrigger>
                <SelectContent>
                  {universities
                    .filter(u => u.isPartner && u.partnershipLevel !== 'NONE')
                    .map(university => (
                      <SelectItem key={university.id} value={university.id}>
                        {university.name} - {university.partnershipLevel}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-4">Performance Metrics</h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Application Success Rate</span>
                      <span>47%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '47%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Student Satisfaction</span>
                      <span>4.2/5</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '84%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Response Time</span>
                      <span>2.3 days</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '76%' }}></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Document Processing</span>
                      <span>91%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-600 h-2 rounded-full" style={{ width: '91%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Communication Quality</span>
                      <span>4.5/5</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-teal-600 h-2 rounded-full" style={{ width: '90%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Overall Partnership Score</span>
                      <span>8.7/10</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsPerformanceReviewDialogOpen(false)}>
                Close
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Outreach Dialog */}
      <Dialog open={isBulkOutreachDialogOpen} onOpenChange={setIsBulkOutreachDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Bulk Outreach Campaign</DialogTitle>
            <DialogDescription>
              Send bulk messages to multiple universities for partnerships, updates, or announcements
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label htmlFor="outreach-type">Campaign Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select campaign type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="partnership">Partnership Proposal</SelectItem>
                  <SelectItem value="update">Partnership Update</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="followup">Follow-up</SelectItem>
                  <SelectItem value="event">Event Invitation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="target-universities">Target Universities</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-3">
                {universities.map(university => (
                  <div key={university.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`university-${university.id}`}
                      className="rounded border-gray-300"
                      defaultChecked={university.isPartner}
                    />
                    <label htmlFor={`university-${university.id}`} className="text-sm flex-1">
                      {university.name} - {university.country}
                      {university.isPartner && (
                        <Badge className={`ml-2 ${getPartnershipColor(university.partnershipLevel)}`}>
                          {university.partnershipLevel}
                        </Badge>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="email-template">Email Template</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="partnership-proposal">Partnership Proposal</SelectItem>
                  <SelectItem value="partnership-renewal">Partnership Renewal</SelectItem>
                  <SelectItem value="program-update">Program Update</SelectItem>
                  <SelectItem value="event-invitation">Event Invitation</SelectItem>
                  <SelectItem value="custom">Custom Message</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="message-content">Message Content</Label>
              <Textarea 
                id="message-content" 
                placeholder="Compose your message here..." 
                rows={8}
                defaultValue={`Dear University Partner,

We hope this message finds you well. We are reaching out to discuss potential collaboration opportunities and strengthen our partnership.

We believe that by working together, we can create valuable opportunities for students and enhance educational outcomes.

We look forward to your response and the possibility of working together.

Best regards,
The Education Agency Team`}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="schedule-send">Schedule Send</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Send timing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="now">Send Now</SelectItem>
                    <SelectItem value="tomorrow">Send Tomorrow</SelectItem>
                    <SelectItem value="next-week">Send Next Week</SelectItem>
                    <SelectItem value="custom">Custom Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="follow-up">Follow-up Days</Label>
                <Input id="follow-up" type="number" placeholder="7" defaultValue="7" />
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">Campaign Summary</h4>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Selected Universities:</span> <span id="selected-count">0</span>
                </div>
                <div>
                  <span className="font-medium">Estimated Delivery:</span> <span>Immediate</span>
                </div>
                <div>
                  <span className="font-medium">Status:</span> <span className="text-green-600">Ready to send</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsBulkOutreachDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="outline">
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button onClick={() => {
                const messageContent = document.getElementById('message-content') as HTMLTextAreaElement
                const checkboxes = document.querySelectorAll<HTMLInputElement>('input[type="checkbox"][id^="university-"]')
                const selectedUniversities = Array.from(checkboxes)
                  .filter(cb => cb.checked)
                  .map(cb => cb.id.replace('university-', ''))
                
                if (selectedUniversities.length === 0) {
                  alert('Please select at least one university')
                  return
                }
                
                if (!messageContent.value.trim()) {
                  alert('Please enter a message')
                  return
                }
                
                sendBulkOutreach(messageContent.value, selectedUniversities)
              }}>
                <Send className="h-4 w-4 mr-2" />
                Send Campaign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}