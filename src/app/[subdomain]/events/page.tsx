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
  MessageSquare
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
                    <Button variant="outline" size="sm" className="flex-1">
                      View Details
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
      </Tabs>
    </div>
  )
}