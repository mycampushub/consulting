"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Plus,
  Search,
  Filter,
  Calendar,
  MapPin,
  Users,
  Clock,
  Video,
  Map,
  Star,
  Edit,
  Trash2,
  MoreHorizontal,
  Settings,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ExternalLink,
  UserPlus,
  MessageSquare,
  Eye,
  Download,
  BarChart3,
  FileText,
  TrendingUp,
  Target
} from "lucide-react"

interface Event {
  id: string
  title: string
  description?: string
  type: 'WEBINAR' | 'WORKSHOP' | 'INFO_SESSION' | 'NETWORKING' | 'ORIENTATION' | 'TRAINING'
  status: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'
  platform: 'ZOOM' | 'TEAMS' | 'GOOGLE_MEET' | 'IN_PERSON' | 'HYBRID'
  startTime: string
  endTime: string
  location?: string
  virtualMeetingUrl?: string
  maxAttendees?: number
  currentAttendees: number
  isPublic: boolean
  requiresRegistration: boolean
  tags: string[]
  createdAt: string
  organizer: {
    id: string
    name: string
    email: string
  }
  registrations: EventRegistration[]
}

interface EventRegistration {
  id: string
  eventId: string
  studentId: string
  student: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  status: 'REGISTERED' | 'CONFIRMED' | 'ATTENDED' | 'CANCELLED' | 'NO_SHOW'
  registeredAt: string
  attendedAt?: string
}

interface EventStats {
  totalEvents: number
  upcomingEvents: number
  ongoingEvents: number
  completedEvents: number
  totalRegistrations: number
  averageAttendance: number
}

export default function EventsPage() {
  const params = useParams()
  const subdomain = params.subdomain as string
  
  const [events, setEvents] = useState<Event[]>([])
  const [stats, setStats] = useState<EventStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false)
  const [isEditEventOpen, setIsEditEventOpen] = useState(false)
  const [isPreviewEventOpen, setIsPreviewEventOpen] = useState(false)
  const [isReportEventOpen, setIsReportEventOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  // Form state
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    type: "WEBINAR" as Event['type'],
    platform: "ZOOM" as Event['platform'],
    startTime: "",
    endTime: "",
    location: "",
    virtualMeetingUrl: "",
    maxAttendees: "",
    isPublic: false,
    requiresRegistration: true,
    tags: [] as string[]
  })

  useEffect(() => {
    fetchEventsData()
  }, [subdomain])

  const fetchEventsData = async () => {
    try {
      setLoading(true)
      
      // Fetch events
      const eventsResponse = await fetch(`/api/${subdomain}/events?limit=50`)
      if (!eventsResponse.ok) throw new Error('Failed to fetch events')
      const eventsData = await eventsResponse.json()
      setEvents(eventsData.events || [])

      // Calculate stats
      const eventStats: EventStats = {
        totalEvents: eventsData.events?.length || 0,
        upcomingEvents: (eventsData.events || []).filter((e: Event) => 
          ['SCHEDULED'].includes(e.status)
        ).length,
        ongoingEvents: (eventsData.events || []).filter((e: Event) => 
          ['ONGOING'].includes(e.status)
        ).length,
        completedEvents: (eventsData.events || []).filter((e: Event) => 
          ['COMPLETED'].includes(e.status)
        ).length,
        totalRegistrations: (eventsData.events || []).reduce((sum: number, e: Event) => 
          sum + e.currentAttendees, 0
        ),
        averageAttendance: 0
      }
      
      if (eventStats.completedEvents > 0) {
        const completedEvents = (eventsData.events || []).filter((e: Event) => 
          e.status === 'COMPLETED'
        )
        const totalAttendance = completedEvents.reduce((sum: number, e: Event) => 
          sum + e.currentAttendees, 0
        )
        eventStats.averageAttendance = Math.round(totalAttendance / completedEvents.length)
      }
      
      setStats(eventStats)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.startTime || !newEvent.endTime) {
      alert("Title, start time, and end time are required")
      return
    }

    setSubmitting(true)
    try {
      const eventData = {
        title: newEvent.title,
        description: newEvent.description || undefined,
        type: newEvent.type,
        platform: newEvent.platform,
        startTime: newEvent.startTime,
        endTime: newEvent.endTime,
        location: newEvent.location || undefined,
        virtualMeetingUrl: newEvent.virtualMeetingUrl || undefined,
        maxAttendees: newEvent.maxAttendees ? parseInt(newEvent.maxAttendees) : undefined,
        isPublic: newEvent.isPublic,
        requiresRegistration: newEvent.requiresRegistration,
        tags: newEvent.tags.length > 0 ? newEvent.tags : undefined
      }

      const response = await fetch(`/api/${subdomain}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create event')
      }

      await fetchEventsData()
      setIsCreateEventOpen(false)
      // Reset form
      setNewEvent({
        title: "",
        description: "",
        type: "WEBINAR",
        platform: "ZOOM",
        startTime: "",
        endTime: "",
        location: "",
        virtualMeetingUrl: "",
        maxAttendees: "",
        isPublic: false,
        requiresRegistration: true,
        tags: []
      })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create event')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return
    }

    try {
      const response = await fetch(`/api/${subdomain}/events/${eventId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete event')
      }

      await fetchEventsData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete event')
    }
  }

  const handlePreviewEvent = (event: Event) => {
    // Open preview dialog or navigate to preview page
    const previewUrl = event.virtualMeetingUrl || '#'
    if (event.virtualMeetingUrl) {
      window.open(previewUrl, '_blank')
    } else {
      alert('Event preview functionality would show detailed event information')
    }
  }

  const handleEditEvent = (event: Event) => {
    // Populate form with event data and open edit dialog
    setNewEvent({
      title: event.title,
      description: event.description || '',
      type: event.type,
      platform: event.platform,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location || '',
      virtualMeetingUrl: event.virtualMeetingUrl || '',
      maxAttendees: event.maxAttendees?.toString() || '',
      isPublic: event.isPublic,
      requiresRegistration: event.requiresRegistration,
      tags: event.tags || []
    })
    setIsCreateEventOpen(true)
  }

  const handleExportReport = async () => {
    try {
      const response = await fetch(`/api/${subdomain}/events?limit=1000&export=true`)
      if (!response.ok) throw new Error('Failed to export report')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `events-report-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      alert('Failed to export report')
    }
  }

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event)
    setNewEvent({
      title: event.title,
      description: event.description || "",
      type: event.type,
      platform: event.platform,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location || "",
      virtualMeetingUrl: event.virtualMeetingUrl || "",
      maxAttendees: event.maxAttendees?.toString() || "",
      isPublic: event.isPublic,
      requiresRegistration: event.requiresRegistration,
      tags: event.tags || []
    })
    setIsEditEventOpen(true)
  }

  const handlePreviewEvent = (event: Event) => {
    setSelectedEvent(event)
    setIsPreviewEventOpen(true)
  }

  const handleGenerateReport = () => {
    setIsReportEventOpen(true)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "WEBINAR": return <Video className="h-4 w-4" />
      case "WORKSHOP": return <Star className="h-4 w-4" />
      case "INFO_SESSION": return <MessageSquare className="h-4 w-4" />
      case "NETWORKING": return <Users className="h-4 w-4" />
      case "ORIENTATION": return <MapPin className="h-4 w-4" />
      case "TRAINING": return <Calendar className="h-4 w-4" />
      default: return <Calendar className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED": return "bg-blue-100 text-blue-800"
      case "ONGOING": return "bg-green-100 text-green-800"
      case "COMPLETED": return "bg-gray-100 text-gray-800"
      case "CANCELLED": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "ZOOM": return <Video className="h-4 w-4" />
      case "TEAMS": return <MessageSquare className="h-4 w-4" />
      case "GOOGLE_MEET": return <Video className="h-4 w-4" />
      case "IN_PERSON": return <MapPin className="h-4 w-4" />
      case "HYBRID": return <Users className="h-4 w-4" />
      default: return <Calendar className="h-4 w-4" />
    }
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || event.type === typeFilter
    const matchesStatus = statusFilter === "all" || event.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="max-w-md">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Events Management</h1>
          <p className="text-muted-foreground">Create and manage events for your students</p>
        </div>
        <Dialog open={isCreateEventOpen} onOpenChange={setIsCreateEventOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
              <DialogDescription>Schedule a new event for your students</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Event Title *</Label>
                  <Input 
                    id="title" 
                    placeholder="Webinar: Study in the USA"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="type">Event Type</Label>
                  <Select onValueChange={(value) => setNewEvent(prev => ({ ...prev, type: value as Event['type'] }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WEBINAR">Webinar</SelectItem>
                      <SelectItem value="WORKSHOP">Workshop</SelectItem>
                      <SelectItem value="INFO_SESSION">Info Session</SelectItem>
                      <SelectItem value="NETWORKING">Networking</SelectItem>
                      <SelectItem value="ORIENTATION">Orientation</SelectItem>
                      <SelectItem value="TRAINING">Training</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Learn about studying in the USA with our expert consultants..."
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="platform">Platform</Label>
                  <Select onValueChange={(value) => setNewEvent(prev => ({ ...prev, platform: value as Event['platform'] }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ZOOM">Zoom</SelectItem>
                      <SelectItem value="TEAMS">Microsoft Teams</SelectItem>
                      <SelectItem value="GOOGLE_MEET">Google Meet</SelectItem>
                      <SelectItem value="IN_PERSON">In Person</SelectItem>
                      <SelectItem value="HYBRID">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="maxAttendees">Max Attendees</Label>
                  <Input 
                    id="maxAttendees" 
                    type="number"
                    placeholder="100"
                    value={newEvent.maxAttendees}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, maxAttendees: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input 
                    id="startTime" 
                    type="datetime-local"
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, startTime: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time *</Label>
                  <Input 
                    id="endTime" 
                    type="datetime-local"
                    value={newEvent.endTime}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, endTime: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location (for in-person events)</Label>
                <Input 
                  id="location" 
                  placeholder="123 Main St, City, State"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="virtualMeetingUrl">Virtual Meeting URL</Label>
                <Input 
                  id="virtualMeetingUrl" 
                  placeholder="https://zoom.us/j/123456789"
                  value={newEvent.virtualMeetingUrl}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, virtualMeetingUrl: e.target.value }))}
                />
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={newEvent.isPublic}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, isPublic: e.target.checked }))}
                  />
                  <Label htmlFor="isPublic">Public Event</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="requiresRegistration"
                    checked={newEvent.requiresRegistration}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, requiresRegistration: e.target.checked }))}
                  />
                  <Label htmlFor="requiresRegistration">Requires Registration</Label>
                </div>
              </div>

              <Button 
                onClick={handleCreateEvent} 
                disabled={submitting}
                className="w-full"
              >
                {submitting ? "Creating Event..." : "Create Event"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvents}</div>
              <p className="text-xs text-muted-foreground">events created</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
              <p className="text-xs text-muted-foreground">scheduled events</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Registrations</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRegistrations}</div>
              <p className="text-xs text-muted-foreground">total registrations</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageAttendance}%</div>
              <p className="text-xs text-muted-foreground">attendance rate</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="events" className="space-y-6">
        <TabsList>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="registrations">Registrations</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="WEBINAR">Webinar</SelectItem>
                  <SelectItem value="WORKSHOP">Workshop</SelectItem>
                  <SelectItem value="INFO_SESSION">Info Session</SelectItem>
                  <SelectItem value="NETWORKING">Networking</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="ONGOING">Ongoing</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Events Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(event.status)}>
                          {event.status}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getTypeIcon(event.type)}
                          {event.type.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {event.description && (
                    <CardDescription className="mt-2">
                      {event.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(event.startTime).toLocaleDateString()}</span>
                      <span>{new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {getPlatformIcon(event.platform)}
                      <span>{event.platform.replace('_', ' ')}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{event.currentAttendees} attendees</span>
                      {event.maxAttendees && (
                        <span className="text-muted-foreground">/ {event.maxAttendees}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handlePreviewEvent(event)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditEvent(event)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteEvent(event.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Calendar</CardTitle>
              <CardDescription>View all events in calendar format</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-16 w-16 mx-auto mb-4" />
                <p>Calendar view will be implemented here</p>
                <p className="text-sm">This would show a monthly/weekly calendar with events</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="registrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Registrations</CardTitle>
              <CardDescription>Manage event registrations and attendance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <UserPlus className="h-16 w-16 mx-auto mb-4" />
                <p>Registration management will be implemented here</p>
                <p className="text-sm">This would show all registrations across events</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Event Reports</h2>
              <p className="text-muted-foreground">
                Generate comprehensive reports for your events
              </p>
            </div>
            <Button onClick={handleExportReport}>
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Event Performance
                </CardTitle>
                <CardDescription>
                  Attendance and engagement metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Attendance Report
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Engagement Report
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Registration Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Time-based Reports
                </CardTitle>
                <CardDescription>
                  Reports by time period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Monthly Summary
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Quarterly Report
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Yearly Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Attendee Reports
                </CardTitle>
                <CardDescription>
                  Reports about event attendees
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Demographics Report
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Feedback Report
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Follow-up Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Reports
                </CardTitle>
                <CardDescription>
                  Event success metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    ROI Analysis
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Conversion Report
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Satisfaction Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>Previously generated reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Monthly Event Summary - January 2024</p>
                    <p className="text-sm text-muted-foreground">Generated 2 days ago</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Q4 2023 Event Performance</p>
                    <p className="text-sm text-muted-foreground">Generated 1 week ago</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Attendee Demographics Report</p>
                    <p className="text-sm text-muted-foreground">Generated 2 weeks ago</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Event Analytics</h2>
              <p className="text-muted-foreground">
                Detailed analytics and insights for your events
              </p>
            </div>
            <Select defaultValue="30">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Total Events
                </CardTitle>
                <CardDescription>
                  Events in selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">+12% vs previous period</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Total Attendees
                </CardTitle>
                <CardDescription>
                  Unique attendees
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,247</div>
                <p className="text-xs text-muted-foreground">+23% vs previous period</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Attendance Rate
                </CardTitle>
                <CardDescription>
                  Average attendance rate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78%</div>
                <p className="text-xs text-muted-foreground">+5% vs previous period</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Satisfaction Score
                </CardTitle>
                <CardDescription>
                  Average satisfaction rating
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.6</div>
                <p className="text-xs text-muted-foreground">Out of 5.0</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Type Performance</CardTitle>
                <CardDescription>Performance by event type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Webinars</span>
                      <span className="font-medium">85% attendance</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Workshops</span>
                      <span className="font-medium">92% attendance</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Info Sessions</span>
                      <span className="font-medium">76% attendance</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '76%' }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Networking</span>
                      <span className="font-medium">68% attendance</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '68%' }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Events</CardTitle>
                <CardDescription>Events with highest engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Study in USA Webinar</p>
                      <p className="text-sm text-muted-foreground">245 attendees</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">UK University Workshop</p>
                      <p className="text-sm text-muted-foreground">189 attendees</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <Star className="h-4 w-4 text-gray-300" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Canada Info Session</p>
                      <p className="text-sm text-muted-foreground">167 attendees</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <Star className="h-4 w-4 text-gray-300" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Event Dialog */}
      <Dialog open={isEditEventOpen} onOpenChange={setIsEditEventOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>Update event information and settings</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-title">Event Title *</Label>
                <Input 
                  id="edit-title" 
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-type">Event Type</Label>
                <Select value={newEvent.type} onValueChange={(value) => setNewEvent(prev => ({ ...prev, type: value as Event['type'] }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WEBINAR">Webinar</SelectItem>
                    <SelectItem value="WORKSHOP">Workshop</SelectItem>
                    <SelectItem value="INFO_SESSION">Info Session</SelectItem>
                    <SelectItem value="NETWORKING">Networking</SelectItem>
                    <SelectItem value="ORIENTATION">Orientation</SelectItem>
                    <SelectItem value="TRAINING">Training</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea 
                id="edit-description" 
                value={newEvent.description}
                onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsEditEventOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateEvent} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Edit className="h-4 w-4 mr-2" />}
                Update Event
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Event Dialog */}
      <Dialog open={isPreviewEventOpen} onOpenChange={setIsPreviewEventOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Event Preview</DialogTitle>
            <DialogDescription>Event details and information</DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold">{selectedEvent.title}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={getStatusColor(selectedEvent.status)}>
                    {selectedEvent.status}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    {getTypeIcon(selectedEvent.type)}
                    {selectedEvent.type.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              {selectedEvent.description && (
                <div>
                  <Label>Description</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedEvent.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Time</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedEvent.startTime).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label>End Time</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedEvent.endTime).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Platform</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedEvent.platform.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <Label>Attendees</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedEvent.currentAttendees} {selectedEvent.maxAttendees ? `/ ${selectedEvent.maxAttendees}` : ''}
                  </p>
                </div>
              </div>

              {selectedEvent.location && (
                <div>
                  <Label>Location</Label>
                  <p className="text-sm text-muted-foreground">{selectedEvent.location}</p>
                </div>
              )}

              {selectedEvent.virtualMeetingUrl && (
                <div>
                  <Label>Meeting URL</Label>
                  <p className="text-sm text-muted-foreground break-all">{selectedEvent.virtualMeetingUrl}</p>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsPreviewEventOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setIsPreviewEventOpen(false)
                  handleEditEvent(selectedEvent)
                }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Event
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Event Report Dialog */}
      <Dialog open={isReportEventOpen} onOpenChange={setIsReportEventOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Event Analytics Report</DialogTitle>
            <DialogDescription>Comprehensive event performance metrics</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Report Summary */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Total Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalEvents || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Total Registrations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalRegistrations || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Attendance Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.averageAttendance || 0}%</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Active Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.upcomingEvents || 0}</div>
                </CardContent>
              </Card>
            </div>

            {/* Event Type Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Event Type Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['WEBINAR', 'WORKSHOP', 'INFO_SESSION', 'NETWORKING'].map((type) => {
                    const typeEvents = events.filter(e => e.type === type)
                    const totalRegistrations = typeEvents.reduce((sum, e) => sum + e.currentAttendees, 0)
                    return (
                      <div key={type} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(type)}
                          <span className="text-sm">{type.replace('_', ' ')}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{typeEvents.length} events</div>
                          <div className="text-xs text-muted-foreground">{totalRegistrations} registrations</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Export Options */}
            <Card>
              <CardHeader>
                <CardTitle>Export Report</CardTitle>
                <CardDescription>Download event analytics in different formats</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export as PDF
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export as Excel
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export as CSV
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsReportEventOpen(false)}>
                Close
              </Button>
              <Button onClick={() => setIsReportEventOpen(false)}>
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}