"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar as CalendarIcon, 
  MapPin, 
  Users, 
  Clock,
  Edit,
  Trash2,
  Eye,
  Download,
  Bell,
  Video,
  Building,
  GraduationCap,
  Briefcase,
  Heart,
  Star,
  Settings
} from "lucide-react"

interface Event {
  id: string
  title: string
  description: string
  type: 'WEBINAR' | 'WORKSHOP' | 'SEMINAR' | 'FAIR' | 'MEETING' | 'TRAINING' | 'NETWORKING' | 'OTHER'
  status: 'DRAFT' | 'PUBLISHED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'
  startDate: string
  endDate: string
  location?: string
  isVirtual: boolean
  maxAttendees?: number
  registeredAttendees: number
  organizer: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

interface EventRegistration {
  id: string
  eventId: string
  studentId: string
  studentName: string
  studentEmail: string
  registrationDate: string
  status: 'REGISTERED' | 'CONFIRMED' | 'ATTENDED' | 'CANCELLED' | 'NO_SHOW'
  notes?: string
}

const mockEvents: Event[] = [
  {
    id: "1",
    title: "Study Abroad Information Session",
    description: "Comprehensive information session about studying abroad opportunities in the USA, UK, and Canada",
    type: "WEBINAR",
    status: "PUBLISHED",
    startDate: "2024-02-15T14:00:00Z",
    endDate: "2024-02-15T16:00:00Z",
    location: "Virtual",
    isVirtual: true,
    maxAttendees: 100,
    registeredAttendees: 45,
    organizer: "Sarah Johnson",
    tags: ["study abroad", "webinar", "information"],
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z"
  },
  {
    id: "2",
    title: "University Fair Spring 2024",
    description: "Meet representatives from top universities around the world",
    type: "FAIR",
    status: "PUBLISHED",
    startDate: "2024-03-10T10:00:00Z",
    endDate: "2024-03-10T16:00:00Z",
    location: "Convention Center, Downtown",
    isVirtual: false,
    maxAttendees: 500,
    registeredAttendees: 234,
    organizer: "Michael Chen",
    tags: ["university fair", "networking", "recruitment"],
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-18T00:00:00Z"
  },
  {
    id: "3",
    title: "Visa Application Workshop",
    description: "Step-by-step guide to successful visa applications",
    type: "WORKSHOP",
    status: "ONGOING",
    startDate: "2024-02-01T09:00:00Z",
    endDate: "2024-02-01T12:00:00Z",
    location: "Office Training Room",
    isVirtual: false,
    maxAttendees: 30,
    registeredAttendees: 28,
    organizer: "Emma Rodriguez",
    tags: ["visa", "workshop", "application"],
    createdAt: "2024-01-05T00:00:00Z",
    updatedAt: "2024-02-01T00:00:00Z"
  }
]

const mockRegistrations: EventRegistration[] = [
  {
    id: "1",
    eventId: "1",
    studentId: "1",
    studentName: "Alex Thompson",
    studentEmail: "alex.thompson@email.com",
    registrationDate: "2024-01-20T00:00:00Z",
    status: "CONFIRMED"
  },
  {
    id: "2",
    eventId: "2",
    studentId: "2",
    studentName: "Maria Garcia",
    studentEmail: "maria.garcia@email.com",
    registrationDate: "2024-01-15T00:00:00Z",
    status: "REGISTERED"
  },
  {
    id: "3",
    eventId: "3",
    studentId: "3",
    studentName: "James Wilson",
    studentEmail: "james.wilson@email.com",
    registrationDate: "2024-01-25T00:00:00Z",
    status: "ATTENDED"
  }
]

export default function EventsPage() {
  const params = useParams()
  const subdomain = params.subdomain as string
  
  const [events] = useState<Event[]>(mockEvents)
  const [registrations] = useState<EventRegistration[]>(mockRegistrations)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false)

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || event.status === statusFilter
    const matchesType = typeFilter === "all" || event.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED": return "bg-green-100 text-green-800"
      case "ONGOING": return "bg-blue-100 text-blue-800"
      case "COMPLETED": return "bg-gray-100 text-gray-800"
      case "CANCELLED": return "bg-red-100 text-red-800"
      case "DRAFT": return "bg-yellow-100 text-yellow-800"
      case "REGISTERED": case "CONFIRMED": return "bg-blue-100 text-blue-800"
      case "ATTENDED": return "bg-green-100 text-green-800"
      case "CANCELLED": return "bg-red-100 text-red-800"
      case "NO_SHOW": return "bg-orange-100 text-orange-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "WEBINAR": return "bg-purple-100 text-purple-800"
      case "WORKSHOP": return "bg-blue-100 text-blue-800"
      case "SEMINAR": return "bg-green-100 text-green-800"
      case "FAIR": return "bg-orange-100 text-orange-800"
      case "MEETING": return "bg-gray-100 text-gray-800"
      case "TRAINING": return "bg-indigo-100 text-indigo-800"
      case "NETWORKING": return "bg-pink-100 text-pink-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "WEBINAR": return <Video className="h-4 w-4" />
      case "WORKSHOP": return <Briefcase className="h-4 w-4" />
      case "SEMINAR": return <GraduationCap className="h-4 w-4" />
      case "FAIR": return <Building className="h-4 w-4" />
      case "MEETING": return <Users className="h-4 w-4" />
      case "TRAINING": return <Settings className="h-4 w-4" />
      case "NETWORKING": return <Heart className="h-4 w-4" />
      default: return <CalendarIcon className="h-4 w-4" />
    }
  }

  const upcomingEvents = events.filter(event => 
    new Date(event.startDate) > new Date() && event.status === 'PUBLISHED'
  )

  const totalRegistrations = events.reduce((sum, event) => sum + event.registeredAttendees, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Events Management</h1>
          <p className="text-muted-foreground">Organize and manage events, webinars, and workshops</p>
        </div>
        <Dialog open={isCreateEventOpen} onOpenChange={setIsCreateEventOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
              <DialogDescription>Set up a new event, webinar, or workshop</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Event Title</Label>
                  <Input id="title" placeholder="Enter event title" />
                </div>
                <div>
                  <Label htmlFor="type">Event Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WEBINAR">Webinar</SelectItem>
                      <SelectItem value="WORKSHOP">Workshop</SelectItem>
                      <SelectItem value="SEMINAR">Seminar</SelectItem>
                      <SelectItem value="FAIR">Fair</SelectItem>
                      <SelectItem value="MEETING">Meeting</SelectItem>
                      <SelectItem value="TRAINING">Training</SelectItem>
                      <SelectItem value="NETWORKING">Networking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Describe your event" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" type="datetime-local" />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" type="datetime-local" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="Physical location or 'Virtual'" />
                </div>
                <div>
                  <Label htmlFor="maxAttendees">Max Attendees</Label>
                  <Input id="maxAttendees" type="number" placeholder="Leave empty for unlimited" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateEventOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsCreateEventOpen(false)}>
                  Create Event
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground">
              {upcomingEvents.length} upcoming
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRegistrations}</div>
            <p className="text-xs text-muted-foreground">
              Across all events
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingEvents.length}</div>
            <p className="text-xs text-muted-foreground">
              Next 30 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Virtual Events</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.filter(e => e.isVirtual).length}</div>
            <p className="text-xs text-muted-foreground">
              Online events
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="events" className="space-y-6">
        <TabsList>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="registrations">Registrations</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-4 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="ONGOING">Ongoing</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="WEBINAR">Webinar</SelectItem>
                  <SelectItem value="WORKSHOP">Workshop</SelectItem>
                  <SelectItem value="SEMINAR">Seminar</SelectItem>
                  <SelectItem value="FAIR">Fair</SelectItem>
                  <SelectItem value="MEETING">Meeting</SelectItem>
                  <SelectItem value="TRAINING">Training</SelectItem>
                  <SelectItem value="NETWORKING">Networking</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Events Table */}
          <Card>
            <CardHeader>
              <CardTitle>Events</CardTitle>
              <CardDescription>Manage your events and track registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Attendees</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{event.title}</div>
                          <div className="text-sm text-muted-foreground">{event.description.substring(0, 50)}...</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(event.type)}
                          <Badge className={getTypeColor(event.type)}>
                            {event.type}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{new Date(event.startDate).toLocaleDateString()}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(event.startDate).toLocaleTimeString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {event.isVirtual ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                          <span className="text-sm">{event.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{event.registeredAttendees}</div>
                          {event.maxAttendees && (
                            <div className="text-xs text-muted-foreground">
                              of {event.maxAttendees}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
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

        <TabsContent value="registrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Registrations</CardTitle>
              <CardDescription>Manage student registrations for all events</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.map((registration) => {
                    const event = events.find(e => e.id === registration.eventId)
                    return (
                      <TableRow key={registration.id}>
                        <TableCell className="font-medium">{registration.studentName}</TableCell>
                        <TableCell>{registration.studentEmail}</TableCell>
                        <TableCell>{event?.title || 'Unknown Event'}</TableCell>
                        <TableCell>{new Date(registration.registrationDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(registration.status)}>
                            {registration.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Calendar</CardTitle>
              <CardDescription>View events in calendar format</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Calendar view will be implemented here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}