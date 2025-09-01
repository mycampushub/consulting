"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  MapPin, 
  Clock, 
  DollarSign, 
  Briefcase, 
  Users, 
  Heart,
  Star,
  Award,
  TrendingUp,
  Building2,
  Laptop,
  Coffee,
  Plane,
  HeartHandshake,
  ArrowRight,
  CheckCircle,
  Calendar,
  Mail,
  Phone,
  FileText,
  Upload,
  Send
} from "lucide-react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"

interface JobPosition {
  id: string
  title: string
  department: string
  location: string
  type: "Full-time" | "Part-time" | "Contract" | "Internship"
  experience: string
  salary: string
  description: string
  requirements: string[]
  responsibilities: string[]
  benefits: string[]
  postedDate: string
  featured: boolean
  urgent: boolean
}

interface Department {
  id: string
  name: string
  count: number
  color: string
}

interface Benefit {
  icon: any
  title: string
  description: string
}

interface CultureValue {
  icon: any
  title: string
  description: string
}

export default function CareersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [selectedJobType, setSelectedJobType] = useState("all")

  const departments: Department[] = [
    { id: "all", name: "All Departments", count: 15, color: "bg-blue-100 text-blue-800" },
    { id: "engineering", name: "Engineering", count: 6, color: "bg-green-100 text-green-800" },
    { id: "sales", name: "Sales", count: 3, color: "bg-purple-100 text-purple-800" },
    { id: "marketing", name: "Marketing", count: 2, color: "bg-orange-100 text-orange-800" },
    { id: "customer-success", name: "Customer Success", count: 2, color: "bg-red-100 text-red-800" },
    { id: "operations", name: "Operations", count: 2, color: "bg-yellow-100 text-yellow-800" }
  ]

  const locations = [
    { id: "all", name: "All Locations" },
    { id: "san-francisco", name: "San Francisco, CA" },
    { id: "new-york", name: "New York, NY" },
    { id: "london", name: "London, UK" },
    { id: "remote", name: "Remote" }
  ]

  const jobTypes = [
    { id: "all", name: "All Types" },
    { id: "full-time", name: "Full-time" },
    { id: "part-time", name: "Part-time" },
    { id: "contract", name: "Contract" },
    { id: "internship", name: "Internship" }
  ]

  const benefits: Benefit[] = [
    {
      icon: Heart,
      title: "Health & Wellness",
      description: "Comprehensive health, dental, and vision insurance for you and your family"
    },
    {
      icon: DollarSign,
      title: "Competitive Compensation",
      description: "Market-leading salaries, performance bonuses, and equity opportunities"
    },
    {
      icon: Clock,
      title: "Flexible Work",
      description: "Remote-first culture with flexible hours and work-life balance"
    },
    {
      icon: Plane,
      title: "Unlimited PTO",
      description: "Take the time you need to recharge and pursue your passions"
    },
    {
      icon: TrendingUp,
      title: "Professional Growth",
      description: "Annual learning budget, conferences, and career development programs"
    },
    {
      icon: Coffee,
      title: "Perks & Benefits",
      description: "Home office stipend, free meals, and team building activities"
    }
  ]

  const cultureValues: CultureValue[] = [
    {
      icon: Users,
      title: "Collaboration",
      description: "We believe in the power of teamwork and diverse perspectives"
    },
    {
      icon: Star,
      title: "Excellence",
      description: "We strive for excellence in everything we do and continuously improve"
    },
    {
      icon: HeartHandshake,
      title: "Integrity",
      description: "We operate with transparency, honesty, and ethical principles"
    },
    {
      icon: TrendingUp,
      title: "Innovation",
      description: "We embrace creativity and push the boundaries of what's possible"
    }
  ]

  const jobPositions: JobPosition[] = [
    {
      id: "1",
      title: "Senior Full Stack Engineer",
      department: "engineering",
      location: "san-francisco",
      type: "Full-time",
      experience: "5+ years",
      salary: "$140,000 - $180,000",
      description: "We're looking for a senior full stack engineer to help build the future of education technology. You'll work on our core platform, architect new features, and mentor junior developers.",
      requirements: [
        "5+ years of experience with React, Node.js, and TypeScript",
        "Experience with cloud platforms (AWS, GCP, or Azure)",
        "Strong understanding of database design and optimization",
        "Experience with microservices architecture",
        "Bachelor's degree in Computer Science or related field"
      ],
      responsibilities: [
        "Design and develop scalable web applications",
        "Collaborate with product managers and designers",
        "Mentor junior engineers and conduct code reviews",
        "Participate in architectural decisions",
        "Ensure code quality and best practices"
      ],
      benefits: [
        "Equity package",
        "Annual learning budget of $5,000",
        "Flexible work arrangements",
        "Health, dental, and vision insurance"
      ],
      postedDate: "2024-01-15",
      featured: true,
      urgent: false
    },
    {
      id: "2",
      title: "Product Marketing Manager",
      department: "marketing",
      location: "remote",
      type: "Full-time",
      experience: "3+ years",
      salary: "$110,000 - $140,000",
      description: "Join our marketing team to drive product adoption and growth. You'll develop go-to-market strategies, create compelling content, and work closely with our sales and product teams.",
      requirements: [
        "3+ years of product marketing experience",
        "Experience in B2B SaaS marketing",
        "Strong analytical and communication skills",
        "Experience with marketing automation tools",
        "Bachelor's degree in Marketing or related field"
      ],
      responsibilities: [
        "Develop product positioning and messaging",
        "Create marketing collateral and sales enablement materials",
        "Plan and execute product launches",
        "Analyze market trends and competitive landscape",
        "Collaborate with sales to drive revenue growth"
      ],
      benefits: [
        "Remote-first culture",
        "Professional development budget",
        "Health and wellness benefits",
        "Performance-based bonuses"
      ],
      postedDate: "2024-01-12",
      featured: true,
      urgent: true
    },
    {
      id: "3",
      title: "Customer Success Manager",
      department: "customer-success",
      location: "new-york",
      type: "Full-time",
      experience: "2+ years",
      salary: "$80,000 - $100,000",
      description: "Help our education agency customers succeed with our platform. You'll be their trusted advisor, ensuring they get maximum value from our solution.",
      requirements: [
        "2+ years in customer success or account management",
        "Experience in education technology or SaaS",
        "Excellent communication and problem-solving skills",
        "Ability to build strong customer relationships",
        "Bachelor's degree in Business or related field"
      ],
      responsibilities: [
        "Onboard new customers and ensure successful implementation",
        "Conduct regular check-ins and business reviews",
        "Identify upsell opportunities and expansion potential",
        "Act as customer advocate within the company",
        "Reduce churn and increase customer satisfaction"
      ],
      benefits: [
        "Base salary plus commission",
        "Career growth opportunities",
        "Comprehensive training program",
        "Team building and company events"
      ],
      postedDate: "2024-01-10",
      featured: false,
      urgent: false
    },
    {
      id: "4",
      title: "Sales Development Representative",
      department: "sales",
      location: "remote",
      type: "Full-time",
      experience: "1+ years",
      salary: "$60,000 - $80,000 + Commission",
      description: "Kickstart your sales career by generating qualified leads for our sales team. You'll learn about education technology and develop valuable sales skills.",
      requirements: [
        "1+ years of sales or lead generation experience",
        "Excellent communication and phone skills",
        "Self-motivated and goal-oriented",
        "Experience with CRM systems",
        "Bachelor's degree preferred"
      ],
      responsibilities: [
        "Research and identify potential customers",
        "Conduct outbound calls and emails",
        "Qualify leads and set appointments",
        "Maintain accurate CRM records",
        "Meet and exceed monthly targets"
      ],
      benefits: [
        "Uncapped commission structure",
        "Sales training and mentorship",
        "Career advancement opportunities",
        "Base salary plus aggressive commission"
      ],
      postedDate: "2024-01-08",
      featured: false,
      urgent: true
    },
    {
      id: "5",
      title: "UX/UI Designer",
      department: "engineering",
      location: "london",
      type: "Full-time",
      experience: "3+ years",
      salary: "$90,000 - $120,000",
      description: "Create beautiful and intuitive user experiences for our education platform. You'll work closely with product managers and engineers to bring ideas to life.",
      requirements: [
        "3+ years of UX/UI design experience",
        "Proficiency in Figma, Sketch, or Adobe Creative Suite",
        "Strong portfolio demonstrating design thinking",
        "Experience with user research and testing",
        "Bachelor's degree in Design or related field"
      ],
      responsibilities: [
        "Design user flows, wireframes, and high-fidelity mockups",
        "Conduct user research and usability testing",
        "Collaborate with developers to ensure design implementation",
        "Create and maintain design systems",
        "Advocate for user-centered design principles"
      ],
      benefits: [
        "Creative freedom and ownership",
        "Latest design tools and software",
        "Professional development budget",
        "Flexible work environment"
      ],
      postedDate: "2024-01-05",
      featured: false,
      urgent: false
    }
  ]

  const filteredJobs = jobPositions.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDepartment = selectedDepartment === "all" || job.department === selectedDepartment
    const matchesLocation = selectedLocation === "all" || job.location === selectedLocation
    const matchesType = selectedJobType === "all" || job.type.toLowerCase().replace("-", "") === selectedJobType
    
    return matchesSearch && matchesDepartment && matchesLocation && matchesType
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground py-20">
          <div className="container mx-auto px-4 text-center">
            <Badge variant="secondary" className="mb-4">
              <Briefcase className="h-4 w-4 mr-2" />
              Join Our Team
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Build the Future of Education Technology
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto mb-8">
              Join a passionate team dedicated to transforming education agencies worldwide. 
              We're looking for talented individuals who share our vision and want to make a difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary">
                View Open Positions
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                Learn About Our Culture
                <Users className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: "Open Positions", value: "15+", icon: Briefcase },
                { label: "Team Members", value: "50+", icon: Users },
                { label: "Countries", value: "5+", icon: MapPin },
                { label: "Founded", value: "2020", icon: Calendar }
              ].map((stat, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <stat.icon className="h-8 w-8 text-primary mx-auto mb-4" />
                    <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Job Search */}
              <section>
                <div className="bg-background border rounded-lg p-6">
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <Label className="text-sm font-medium">Search Positions</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Job title or keyword..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Department</Label>
                      <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Location</Label>
                      <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location.id} value={location.id}>
                              {location.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Job Type</Label>
                      <Select value={selectedJobType} onValueChange={setSelectedJobType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {jobTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {filteredJobs.length} positions found
                    </p>
                    <Button variant="outline" size="sm">
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </section>

              {/* Job Listings */}
              <section>
                <h2 className="text-2xl font-bold mb-6">Open Positions</h2>
                <div className="space-y-4">
                  {filteredJobs.map((job) => (
                    <Card key={job.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-xl font-semibold">{job.title}</h3>
                              {job.featured && (
                                <Badge className="bg-yellow-500 text-yellow-900">Featured</Badge>
                              )}
                              {job.urgent && (
                                <Badge variant="destructive">Urgent</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                              <div className="flex items-center gap-1">
                                <Building2 className="h-4 w-4" />
                                {departments.find(d => d.id === job.department)?.name}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {locations.find(l => l.id === job.location)?.name}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {job.type}
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                {job.salary}
                              </div>
                            </div>
                            <p className="text-muted-foreground mb-4 line-clamp-3">{job.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            Posted {formatDate(job.postedDate)}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm">
                              View Details
                            </Button>
                            <Button size="sm" variant="outline">
                              Apply Now
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Why Join Us */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Why Join EduSaaS?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      title: "Mission-Driven",
                      description: "Make a real impact on education worldwide"
                    },
                    {
                      title: "Growth Opportunities",
                      description: "Fast-growing company with career advancement"
                    },
                    {
                      title: "Innovative Culture",
                      description: "Work with cutting-edge technology and ideas"
                    },
                    {
                      title: "Great Benefits",
                      description: "Comprehensive package and work-life balance"
                    }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-sm">{item.title}</h4>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Benefits */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Benefits & Perks
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <benefit.icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-sm">{benefit.title}</h4>
                        <p className="text-xs text-muted-foreground">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Culture Values */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Our Culture
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cultureValues.map((value, index) => (
                    <div key={index} className="text-center">
                      <value.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                      <h4 className="font-medium text-sm mb-1">{value.title}</h4>
                      <p className="text-xs text-muted-foreground">{value.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Stay Connected */}
              <Card>
                <CardHeader>
                  <CardTitle>Stay Connected</CardTitle>
                  <CardDescription>
                    Get notified about new opportunities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input placeholder="Enter your email" />
                  <Button className="w-full">
                    Subscribe to Job Alerts
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Don't See Your Perfect Role?
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              We're always looking for talented individuals. Send us your resume and let us know how you can contribute to our mission.
            </p>
            <Button size="lg" variant="secondary">
              Send General Application
              <Mail className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}