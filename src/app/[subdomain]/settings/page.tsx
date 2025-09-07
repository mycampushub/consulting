"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Settings, 
  User, 
  Building, 
  Bell, 
  Shield, 
  Database, 
  Globe,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Upload,
  Download,
  Save,
  RefreshCw,
  Key,
  Users,
  UserPlus,
  CreditCard,
  Palette,
  Zap,
  BarChart3,
  FileText,
  MessageSquare,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Plus,
  Activity
} from "lucide-react"

interface AgencySettings {
  name: string
  subdomain: string
  customDomain?: string
  logo?: string
  primaryColor: string
  secondaryColor: string
  timezone: string
  currency: string
  language: string
  address: {
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
  contact: {
    email: string
    phone: string
    website?: string
  }
  social: {
    facebook?: string
    twitter?: string
    linkedin?: string
    instagram?: string
  }
}

interface NotificationSettings {
  email: {
    newStudent: boolean
    applicationUpdate: boolean
    paymentReceived: boolean
    systemUpdates: boolean
    marketingEmails: boolean
  }
  push: {
    newStudent: boolean
    applicationUpdate: boolean
    paymentReceived: boolean
    systemUpdates: boolean
  }
  sms: {
    urgentAlerts: boolean
    paymentReminders: boolean
    appointmentReminders: boolean
  }
}

interface SecuritySettings {
  twoFactorEnabled: boolean
  sessionTimeout: number
  passwordPolicy: {
    minLength: number
    requireUppercase: boolean
    requireNumbers: boolean
    requireSpecialChars: boolean
    expiryDays: number
  }
  ipRestrictions: string[]
  auditLogEnabled: boolean
}

interface IntegrationSettings {
  crm?: {
    provider: 'NONE' | 'SALESFORCE' | 'HUBSPOT' | 'ZOHO'
    apiKey?: string
    connected: boolean
  }
  email?: {
    provider: 'NONE' | 'SENDGRID' | 'MAILGUN' | 'AWS_SES'
    apiKey?: string
    connected: boolean
  }
  payment?: {
    provider: 'NONE' | 'STRIPE' | 'PAYPAL' | 'BRAINTREE'
    apiKey?: string
    connected: boolean
  }
  analytics?: {
    provider: 'NONE' | 'GOOGLE_ANALYTICS' | 'MIXPANEL' | 'AMPLITITUDE'
    trackingId?: string
    connected: boolean
  }
}

const mockAgencySettings: AgencySettings = {
  name: "Global Education Partners",
  subdomain: "global-education",
  customDomain: "globaledu.com",
  primaryColor: "#3b82f6",
  secondaryColor: "#8b5cf6",
  timezone: "America/New_York",
  currency: "USD",
  language: "en",
  address: {
    street: "123 Business Avenue",
    city: "New York",
    state: "NY",
    zip: "10001",
    country: "US"
  },
  contact: {
    email: "info@globaledu.com",
    phone: "+1 (555) 123-4567",
    website: "https://globaledu.com"
  },
  social: {
    facebook: "https://facebook.com/globaledu",
    linkedin: "https://linkedin.com/company/globaledu"
  }
}

const mockNotificationSettings: NotificationSettings = {
  email: {
    newStudent: true,
    applicationUpdate: true,
    paymentReceived: true,
    systemUpdates: true,
    marketingEmails: false
  },
  push: {
    newStudent: true,
    applicationUpdate: true,
    paymentReceived: false,
    systemUpdates: true
  },
  sms: {
    urgentAlerts: true,
    paymentReminders: true,
    appointmentReminders: true
  }
}

const mockSecuritySettings: SecuritySettings = {
  twoFactorEnabled: false,
  sessionTimeout: 3600,
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    expiryDays: 90
  },
  ipRestrictions: [],
  auditLogEnabled: true
}

const mockIntegrationSettings: IntegrationSettings = {
  crm: {
    provider: 'NONE',
    connected: false
  },
  email: {
    provider: 'SENDGRID',
    connected: true
  },
  payment: {
    provider: 'STRIPE',
    connected: true
  },
  analytics: {
    provider: 'GOOGLE_ANALYTICS',
    connected: true
  }
}

export default function SettingsPage() {
  const params = useParams()
  const subdomain = params.subdomain as string
  
  const [agencySettings, setAgencySettings] = useState<AgencySettings>(mockAgencySettings)
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(mockNotificationSettings)
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(mockSecuritySettings)
  const [integrationSettings, setIntegrationSettings] = useState<IntegrationSettings>(mockIntegrationSettings)
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("general")
  
  // Invite member dialog state
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [inviteForm, setInviteForm] = useState({
    email: '',
    name: '',
    role: 'CONSULTANT',
    phone: '',
    title: '',
    department: '',
    branchId: ''
  })
  const [inviteLoading, setInviteLoading] = useState(false)
  
  // Edit user dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [editLoading, setEditLoading] = useState(false)

  useEffect(() => {
    fetchSettings()
    fetchTeamMembers()
    fetchRoles()
    fetchIntegrations()
    fetchNotificationSettings()
  }, [subdomain])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/${subdomain}/settings`)
      if (!response.ok) {
        throw new Error('Failed to fetch settings')
      }
      
      const data = await response.json()
      setAgencySettings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      // Keep mock data as fallback
    } finally {
      setLoading(false)
    }
  }

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch(`/api/${subdomain}/users`)
      if (!response.ok) {
        throw new Error('Failed to fetch team members')
      }
      
      const data = await response.json()
      setTeamMembers(data.users || [])
    } catch (err) {
      console.error('Error fetching team members:', err)
      // Keep empty array as fallback
    }
  }

  const fetchRoles = async () => {
    try {
      const response = await fetch(`/api/${subdomain}/rbac/roles`)
      if (!response.ok) {
        throw new Error('Failed to fetch roles')
      }
      
      const data = await response.json()
      setRoles(data.roles || [])
    } catch (err) {
      console.error('Error fetching roles:', err)
      // Keep empty array as fallback
    }
  }

  const fetchIntegrations = async () => {
    try {
      const response = await fetch(`/api/${subdomain}/integrations`)
      if (!response.ok) {
        throw new Error('Failed to fetch integrations')
      }
      
      const data = await response.json()
      setIntegrationSettings(data.integrations || mockIntegrationSettings)
    } catch (err) {
      console.error('Error fetching integrations:', err)
      // Keep mock data as fallback
    }
  }

  const fetchNotificationSettings = async () => {
    try {
      const response = await fetch(`/api/${subdomain}/notifications/settings`)
      if (!response.ok) {
        throw new Error('Failed to fetch notification settings')
      }
      
      const data = await response.json()
      setNotificationSettings(data.notificationSettings || mockNotificationSettings)
    } catch (err) {
      console.error('Error fetching notification settings:', err)
      // Keep mock data as fallback
    }
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/${subdomain}/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agencySettings),
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      const result = await response.json()
      
      // Show success message
      alert('Settings saved successfully!')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Handle logo upload
      console.log('Logo uploaded:', file.name)
    }
  }

  const handleEditUser = (user: any) => {
    setEditingUser(user)
    setIsEditDialogOpen(true)
  }

  const handleSaveEditUser = async () => {
    if (!editingUser) return

    setEditLoading(true)
    try {
      const response = await fetch(`/api/${subdomain}/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${editingUser.firstName} ${editingUser.lastName}`,
          email: editingUser.email,
          role: editingUser.role,
          phone: editingUser.phone,
          title: editingUser.title,
          department: editingUser.department,
          status: editingUser.status
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update user')
      }

      const result = await response.json()
      
      // Close dialog and refresh team members
      setIsEditDialogOpen(false)
      setEditingUser(null)
      fetchTeamMembers()
      
      // Show success message
      alert(`Successfully updated ${result.firstName} ${result.lastName}!`)
    } catch (error) {
      console.error('Error updating user:', error)
      alert(error instanceof Error ? error.message : 'Failed to update user')
    } finally {
      setEditLoading(false)
    }
  }

  const handleViewPermissions = async (user: any) => {
    try {
      const response = await fetch(`/api/${subdomain}/rbac/permissions?userId=${user.id}`)
      const data = await response.json()
      
      if (data.permissions && data.permissions.length > 0) {
        const permissionList = data.permissions.map((p: any) => 
          `${p.permission.name} - ${p.permission.resource}:${p.permission.action}`
        ).join('\n')
        alert(`Current permissions for ${user.firstName} ${user.lastName}:\n\n${permissionList}\n\nFull permission management interface to be implemented in next iteration.`)
      } else {
        alert(`No custom permissions assigned to ${user.firstName} ${user.lastName}. User has default permissions based on role: ${user.role}`)
      }
    } catch (error) {
      console.error('Error fetching permissions:', error)
      alert('Error fetching permissions. Please try again.')
    }
  }

  const handleInviteMember = async () => {
    if (!inviteForm.email || !inviteForm.name) {
      alert('Please fill in all required fields')
      return
    }

    setInviteLoading(true)
    try {
      const response = await fetch(`/api/${subdomain}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inviteForm),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to invite member')
      }

      const result = await response.json()
      
      // Reset form and close dialog
      setInviteForm({
        email: '',
        name: '',
        role: 'CONSULTANT',
        phone: '',
        title: '',
        department: '',
        branchId: ''
      })
      setIsInviteDialogOpen(false)
      
      // Refresh team members
      fetchTeamMembers()
      
      // Show success message
      alert(`Successfully invited ${result.firstName} ${result.lastName}!`)
    } catch (error) {
      console.error('Error inviting member:', error)
      alert(error instanceof Error ? error.message : 'Failed to invite member')
    } finally {
      setInviteLoading(false)
    }
  }

  const handleViewRoleDetails = (role: any) => {
    // TODO: Implement view role details functionality
    console.log('View role details:', role)
    alert(`View role details functionality for ${role.name} - To be implemented`)
  }

  const handleAssignRole = async (user: any) => {
    try {
      // Fetch available roles
      const response = await fetch(`/api/${subdomain}/rbac/roles`)
      const data = await response.json()
      
      if (data.roles && data.roles.length > 0) {
        const roleNames = data.roles.map((r: any) => `${r.name} (${r.slug})`).join('\n')
        alert(`Available roles for ${user.firstName} ${user.lastName}:\n\n${roleNames}\n\nRole assignment interface to be implemented.`)
      } else {
        alert('No roles available. Please create roles first.')
      }
    } catch (error) {
      console.error('Error fetching roles:', error)
      alert('Error fetching roles. Please try again.')
    }
  }

  const handleManagePermissions = async (user: any) => {
    try {
      // Fetch user permissions
      const response = await fetch(`/api/${subdomain}/rbac/permissions?userId=${user.id}`)
      const data = await response.json()
      
      if (data.permissions && data.permissions.length > 0) {
        const permissionList = data.permissions.map((p: any) => 
          `${p.permission.name} - ${p.permission.resource}:${p.permission.action}`
        ).join('\n')
        alert(`Current permissions for ${user.firstName} ${user.lastName}:\n\n${permissionList}\n\nPermission management interface to be implemented.`)
      } else {
        alert(`No custom permissions assigned to ${user.firstName} ${user.lastName}.`)
      }
    } catch (error) {
      console.error('Error fetching permissions:', error)
      alert('Error fetching permissions. Please try again.')
    }
  }

  const handleUpdateIntegration = async (type: string, provider: string, config: any = {}) => {
    try {
      const response = await fetch(`/api/${subdomain}/integrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          provider,
          config,
          isConnected: provider !== 'NONE'
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update integration')
      }

      const result = await response.json()
      alert(`${type} integration updated successfully!`)
      
      // Refresh integrations
      fetchIntegrations()
    } catch (error) {
      console.error('Error updating integration:', error)
      alert('Failed to update integration. Please try again.')
    }
  }

  const handleTestIntegration = async (type: string, provider: string) => {
    try {
      const response = await fetch(`/api/${subdomain}/integrations`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          provider,
          config: {}
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to test integration')
      }

      const result = await response.json()
      alert(result.message || 'Integration test completed')
    } catch (error) {
      console.error('Error testing integration:', error)
      alert('Failed to test integration. Please try again.')
    }
  }

  const handleSaveNotificationSettings = async () => {
    try {
      const response = await fetch(`/api/${subdomain}/notifications/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationSettings),
      })

      if (!response.ok) {
        throw new Error('Failed to save notification settings')
      }

      const result = await response.json()
      alert('Notification settings saved successfully!')
    } catch (error) {
      console.error('Error saving notification settings:', error)
      alert('Failed to save notification settings. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure your agency preferences and settings</p>
        </div>
        <Button onClick={handleSaveSettings} disabled={saving}>
          {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          {/* Agency Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Agency Information
              </CardTitle>
              <CardDescription>Basic information about your agency</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="agencyName">Agency Name</Label>
                  <Input
                    id="agencyName"
                    value={agencySettings.name}
                    onChange={(e) => setAgencySettings({...agencySettings, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="subdomain">Subdomain</Label>
                  <Input
                    id="subdomain"
                    value={agencySettings.subdomain}
                    onChange={(e) => setAgencySettings({...agencySettings, subdomain: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="customDomain">Custom Domain (Optional)</Label>
                <Input
                  id="customDomain"
                  value={agencySettings.customDomain || ''}
                  onChange={(e) => setAgencySettings({...agencySettings, customDomain: e.target.value})}
                  placeholder="youragency.com"
                />
              </div>
              <div>
                <Label htmlFor="logo">Agency Logo</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={agencySettings.logo} />
                    <AvatarFallback>
                      {agencySettings.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('logo')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Logo
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Branding */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Branding
              </CardTitle>
              <CardDescription>Customize your agency's appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={agencySettings.primaryColor}
                      onChange={(e) => setAgencySettings({...agencySettings, primaryColor: e.target.value})}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={agencySettings.primaryColor}
                      onChange={(e) => setAgencySettings({...agencySettings, primaryColor: e.target.value})}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={agencySettings.secondaryColor}
                      onChange={(e) => setAgencySettings({...agencySettings, secondaryColor: e.target.value})}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={agencySettings.secondaryColor}
                      onChange={(e) => setAgencySettings({...agencySettings, secondaryColor: e.target.value})}
                      className="flex-1"
                    />
                  </div>
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
              <CardDescription>How clients and partners can reach you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={agencySettings.contact.email}
                    onChange={(e) => setAgencySettings({
                      ...agencySettings,
                      contact: {...agencySettings.contact, email: e.target.value}
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={agencySettings.contact.phone}
                    onChange={(e) => setAgencySettings({
                      ...agencySettings,
                      contact: {...agencySettings.contact, phone: e.target.value}
                    })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="website">Website (Optional)</Label>
                <Input
                  id="website"
                  value={agencySettings.contact.website || ''}
                  onChange={(e) => setAgencySettings({
                    ...agencySettings,
                    contact: {...agencySettings.contact, website: e.target.value}
                  })}
                  placeholder="https://youragency.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Address
              </CardTitle>
              <CardDescription>Your agency's physical location</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  value={agencySettings.address.street}
                  onChange={(e) => setAgencySettings({
                    ...agencySettings,
                    address: {...agencySettings.address, street: e.target.value}
                  })}
                />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={agencySettings.address.city}
                    onChange={(e) => setAgencySettings({
                      ...agencySettings,
                      address: {...agencySettings.address, city: e.target.value}
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={agencySettings.address.state}
                    onChange={(e) => setAgencySettings({
                      ...agencySettings,
                      address: {...agencySettings.address, state: e.target.value}
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    value={agencySettings.address.zip}
                    onChange={(e) => setAgencySettings({
                      ...agencySettings,
                      address: {...agencySettings.address, zip: e.target.value}
                    })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Select
                  value={agencySettings.address.country}
                  onValueChange={(value) => setAgencySettings({
                    ...agencySettings,
                    address: {...agencySettings.address, country: value}
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                    <SelectItem value="UK">United Kingdom</SelectItem>
                    <SelectItem value="AU">Australia</SelectItem>
                    <SelectItem value="IN">India</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Manage your personal profile and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback>
                    {agencySettings.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photo
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG or GIF. Max size of 2MB.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    defaultValue="John"
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    defaultValue="Doe"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="profileEmail">Email Address</Label>
                <Input
                  id="profileEmail"
                  type="email"
                  defaultValue="john.doe@agency.com"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  defaultValue="+1 (555) 123-4567"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  defaultValue="Agency Administrator"
                  placeholder="Enter your job title"
                />
              </div>

              <div>
                <Label htmlFor="department">Department</Label>
                <Select defaultValue="administration">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="administration">Administration</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Account Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Account Preferences
              </CardTitle>
              <CardDescription>Customize your account experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue="America/New_York">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="Europe/London">London (GMT)</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="language">Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Email Notifications</div>
                  <div className="text-sm text-muted-foreground">Receive email updates about your account</div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">SMS Notifications</div>
                  <div className="text-sm text-muted-foreground">Receive text message alerts</div>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Desktop Notifications</div>
                  <div className="text-sm text-muted-foreground">Show browser notifications</div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security
              </CardTitle>
              <CardDescription>Manage your account security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Two-Factor Authentication</div>
                  <div className="text-sm text-muted-foreground">Add an extra layer of security to your account</div>
                </div>
                <Button variant="outline" size="sm">
                  Enable
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Change Password</div>
                  <div className="text-sm text-muted-foreground">Last changed 3 months ago</div>
                </div>
                <Button variant="outline" size="sm">
                  Change
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Active Sessions</div>
                  <div className="text-sm text-muted-foreground">2 active sessions</div>
                </div>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>

              <div className="pt-4 border-t">
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          {/* Team Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Management
              </CardTitle>
              <CardDescription>Manage your agency team members and their permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">Team Members</h3>
                  <p className="text-sm text-muted-foreground">Manage user roles and permissions</p>
                </div>
                <Button onClick={() => setIsInviteDialogOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Member
                </Button>
              </div>

              {/* Team Members List */}
              <div className="space-y-3">
                {teamMembers.map((member, index) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>
                          {(member.firstName || member.name || '').split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{member.firstName} {member.lastName}</div>
                        <div className="text-sm text-muted-foreground">{member.email}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={
                            member.role === "AGENCY_ADMIN" ? "bg-purple-100 text-purple-800" :
                            member.role === "CONSULTANT" ? "bg-blue-100 text-blue-800" :
                            member.role === "SUPPORT" ? "bg-green-100 text-green-800" :
                            "bg-gray-100 text-gray-800"
                          }>
                            {member.role.replace('_', ' ')}
                          </Badge>
                          <Badge className={member.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                            {member.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Last login</div>
                      <div className="text-sm">{member.lastLogin ? new Date(member.lastLogin).toLocaleString() : 'Never'}</div>
                      <div className="flex gap-1 mt-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditUser(member)}>Edit</Button>
                        <Button variant="outline" size="sm" onClick={() => handleAssignRole(member)}>Assign Role</Button>
                        <Button variant="outline" size="sm" onClick={() => handleManagePermissions(member)}>Permissions</Button>
                      </div>
                    </div>
                  </div>
                ))}
                {teamMembers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No team members found. Click "Invite Member" to add your first team member.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Role Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Role Templates
              </CardTitle>
              <CardDescription>Pre-defined permission sets for different roles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                {roles.length > 0 ? roles.map((role, index) => (
                  <div key={role.id} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={
                        role.level === 0 ? "bg-purple-100 text-purple-800" :
                        role.level === 1 ? "bg-blue-100 text-blue-800" :
                        role.level === 2 ? "bg-green-100 text-green-800" :
                        "bg-gray-100 text-gray-800"
                      }>
                        {role.name}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{role.description || 'No description available'}</p>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => handleViewRoleDetails(role)}>
                      View Permissions
                    </Button>
                  </div>
                )) : (
                  <div className="col-span-3 text-center py-8 text-muted-foreground">
                    No roles found. Roles will be created automatically when you add team members.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Configure how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Email Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">New Student Registration</div>
                      <div className="text-sm text-muted-foreground">Get notified when new students register</div>
                    </div>
                    <Switch
                      checked={notificationSettings.email.newStudent}
                      onCheckedChange={(checked) => setNotificationSettings({
                        ...notificationSettings,
                        email: {...notificationSettings.email, newStudent: checked}
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Application Updates</div>
                      <div className="text-sm text-muted-foreground">Application status changes and updates</div>
                    </div>
                    <Switch
                      checked={notificationSettings.email.applicationUpdate}
                      onCheckedChange={(checked) => setNotificationSettings({
                        ...notificationSettings,
                        email: {...notificationSettings.email, applicationUpdate: checked}
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Payment Received</div>
                      <div className="text-sm text-muted-foreground">Notifications for successful payments</div>
                    </div>
                    <Switch
                      checked={notificationSettings.email.paymentReceived}
                      onCheckedChange={(checked) => setNotificationSettings({
                        ...notificationSettings,
                        email: {...notificationSettings.email, paymentReceived: checked}
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">System Updates</div>
                      <div className="text-sm text-muted-foreground">Important system announcements</div>
                    </div>
                    <Switch
                      checked={notificationSettings.email.systemUpdates}
                      onCheckedChange={(checked) => setNotificationSettings({
                        ...notificationSettings,
                        email: {...notificationSettings.email, systemUpdates: checked}
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Marketing Emails</div>
                      <div className="text-sm text-muted-foreground">Product updates and marketing content</div>
                    </div>
                    <Switch
                      checked={notificationSettings.email.marketingEmails}
                      onCheckedChange={(checked) => setNotificationSettings({
                        ...notificationSettings,
                        email: {...notificationSettings.email, marketingEmails: checked}
                      })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Push Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">New Student Registration</div>
                      <div className="text-sm text-muted-foreground">Instant push notifications</div>
                    </div>
                    <Switch
                      checked={notificationSettings.push.newStudent}
                      onCheckedChange={(checked) => setNotificationSettings({
                        ...notificationSettings,
                        push: {...notificationSettings.push, newStudent: checked}
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Application Updates</div>
                      <div className="text-sm text-muted-foreground">Real-time application status</div>
                    </div>
                    <Switch
                      checked={notificationSettings.push.applicationUpdate}
                      onCheckedChange={(checked) => setNotificationSettings({
                        ...notificationSettings,
                        push: {...notificationSettings.push, applicationUpdate: checked}
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Payment Received</div>
                      <div className="text-sm text-muted-foreground">Payment confirmation alerts</div>
                    </div>
                    <Switch
                      checked={notificationSettings.push.paymentReceived}
                      onCheckedChange={(checked) => setNotificationSettings({
                        ...notificationSettings,
                        push: {...notificationSettings.push, paymentReceived: checked}
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">System Updates</div>
                      <div className="text-sm text-muted-foreground">Critical system notifications</div>
                    </div>
                    <Switch
                      checked={notificationSettings.push.systemUpdates}
                      onCheckedChange={(checked) => setNotificationSettings({
                        ...notificationSettings,
                        push: {...notificationSettings.push, systemUpdates: checked}
                      })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">SMS Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Urgent Alerts</div>
                      <div className="text-sm text-muted-foreground">Critical system and security alerts</div>
                    </div>
                    <Switch
                      checked={notificationSettings.sms.urgentAlerts}
                      onCheckedChange={(checked) => setNotificationSettings({
                        ...notificationSettings,
                        sms: {...notificationSettings.sms, urgentAlerts: checked}
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Payment Reminders</div>
                      <div className="text-sm text-muted-foreground">Upcoming payment due dates</div>
                    </div>
                    <Switch
                      checked={notificationSettings.sms.paymentReminders}
                      onCheckedChange={(checked) => setNotificationSettings({
                        ...notificationSettings,
                        sms: {...notificationSettings.sms, paymentReminders: checked}
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Appointment Reminders</div>
                      <div className="text-sm text-muted-foreground">Scheduled appointment notifications</div>
                    </div>
                    <Switch
                      checked={notificationSettings.sms.appointmentReminders}
                      onCheckedChange={(checked) => setNotificationSettings({
                        ...notificationSettings,
                        sms: {...notificationSettings.sms, appointmentReminders: checked}
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleSaveNotificationSettings}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Notification Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Manage your agency's security preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Two-Factor Authentication</div>
                  <div className="text-sm text-muted-foreground">Add an extra layer of security to your account</div>
                </div>
                <Switch
                  checked={securitySettings.twoFactorEnabled}
                  onCheckedChange={(checked) => setSecuritySettings({
                    ...securitySettings,
                    twoFactorEnabled: checked
                  })}
                />
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Password Policy</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Minimum Length</div>
                      <div className="text-sm text-muted-foreground">Minimum password length requirement</div>
                    </div>
                    <Select
                      value={securitySettings.passwordPolicy.minLength.toString()}
                      onValueChange={(value) => setSecuritySettings({
                        ...securitySettings,
                        passwordPolicy: {...securitySettings.passwordPolicy, minLength: parseInt(value)}
                      })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6 characters</SelectItem>
                        <SelectItem value="8">8 characters</SelectItem>
                        <SelectItem value="10">10 characters</SelectItem>
                        <SelectItem value="12">12 characters</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Require Uppercase Letters</div>
                      <div className="text-sm text-muted-foreground">Passwords must contain uppercase letters</div>
                    </div>
                    <Switch
                      checked={securitySettings.passwordPolicy.requireUppercase}
                      onCheckedChange={(checked) => setSecuritySettings({
                        ...securitySettings,
                        passwordPolicy: {...securitySettings.passwordPolicy, requireUppercase: checked}
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Require Numbers</div>
                      <div className="text-sm text-muted-foreground">Passwords must contain numbers</div>
                    </div>
                    <Switch
                      checked={securitySettings.passwordPolicy.requireNumbers}
                      onCheckedChange={(checked) => setSecuritySettings({
                        ...securitySettings,
                        passwordPolicy: {...securitySettings.passwordPolicy, requireNumbers: checked}
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Require Special Characters</div>
                      <div className="text-sm text-muted-foreground">Passwords must contain special characters</div>
                    </div>
                    <Switch
                      checked={securitySettings.passwordPolicy.requireSpecialChars}
                      onCheckedChange={(checked) => setSecuritySettings({
                        ...securitySettings,
                        passwordPolicy: {...securitySettings.passwordPolicy, requireSpecialChars: checked}
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Password Expiry</div>
                      <div className="text-sm text-muted-foreground">Days until password must be changed</div>
                    </div>
                    <Select
                      value={securitySettings.passwordPolicy.expiryDays.toString()}
                      onValueChange={(value) => setSecuritySettings({
                        ...securitySettings,
                        passwordPolicy: {...securitySettings.passwordPolicy, expiryDays: parseInt(value)}
                      })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="60">60 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="180">180 days</SelectItem>
                        <SelectItem value="0">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Session Timeout</div>
                  <div className="text-sm text-muted-foreground">Automatically log out after inactivity</div>
                </div>
                <Select
                  value={securitySettings.sessionTimeout.toString()}
                  onValueChange={(value) => setSecuritySettings({
                    ...securitySettings,
                    sessionTimeout: parseInt(value)
                  })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1800">30 minutes</SelectItem>
                    <SelectItem value="3600">1 hour</SelectItem>
                    <SelectItem value="7200">2 hours</SelectItem>
                    <SelectItem value="14400">4 hours</SelectItem>
                    <SelectItem value="28800">8 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Audit Logging</div>
                  <div className="text-sm text-muted-foreground">Track all user activities and changes</div>
                </div>
                <Switch
                  checked={securitySettings.auditLogEnabled}
                  onCheckedChange={(checked) => setSecuritySettings({
                    ...securitySettings,
                    auditLogEnabled: checked
                  })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Third-Party Integrations
              </CardTitle>
              <CardDescription>Connect with external services and tools</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">CRM Integration</h3>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">CRM Platform</div>
                      <div className="text-sm text-muted-foreground">
                        {integrationSettings.crm?.provider === 'NONE' ? 'Not connected' : `Connected to ${integrationSettings.crm?.provider}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {integrationSettings.crm?.connected ? (
                      <>
                        <Badge className="bg-green-100 text-green-800">Connected</Badge>
                        <Button variant="outline" size="sm" onClick={() => handleTestIntegration('CRM', integrationSettings.crm?.provider || '')}>Test</Button>
                        <Button variant="outline" size="sm" onClick={() => handleUpdateIntegration('CRM', 'NONE')}>Disconnect</Button>
                      </>
                    ) : (
                      <Select
                        value={integrationSettings.crm?.provider || 'NONE'}
                        onValueChange={(value) => handleUpdateIntegration('CRM', value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NONE">Select CRM</SelectItem>
                          <SelectItem value="SALESFORCE">Salesforce</SelectItem>
                          <SelectItem value="HUBSPOT">HubSpot</SelectItem>
                          <SelectItem value="ZOHO">Zoho CRM</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Email Service</h3>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Mail className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">Email Delivery</div>
                      <div className="text-sm text-muted-foreground">
                        {integrationSettings.email?.provider === 'NONE' ? 'Not connected' : `Connected to ${integrationSettings.email?.provider}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {integrationSettings.email?.connected ? (
                      <>
                        <Badge className="bg-green-100 text-green-800">Connected</Badge>
                        <Button variant="outline" size="sm" onClick={() => handleTestIntegration('EMAIL', integrationSettings.email?.provider || '')}>Test</Button>
                        <Button variant="outline" size="sm" onClick={() => handleUpdateIntegration('EMAIL', 'NONE')}>Disconnect</Button>
                      </>
                    ) : (
                      <Select
                        value={integrationSettings.email?.provider || 'NONE'}
                        onValueChange={(value) => handleUpdateIntegration('EMAIL', value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NONE">Select Service</SelectItem>
                          <SelectItem value="SENDGRID">SendGrid</SelectItem>
                          <SelectItem value="MAILGUN">Mailgun</SelectItem>
                          <SelectItem value="AWS_SES">AWS SES</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Payment Processing</h3>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium">Payment Gateway</div>
                      <div className="text-sm text-muted-foreground">
                        {integrationSettings.payment?.provider === 'NONE' ? 'Not connected' : `Connected to ${integrationSettings.payment?.provider}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {integrationSettings.payment?.connected ? (
                      <>
                        <Badge className="bg-green-100 text-green-800">Connected</Badge>
                        <Button variant="outline" size="sm" onClick={() => handleTestIntegration('PAYMENT', integrationSettings.payment?.provider || '')}>Test</Button>
                        <Button variant="outline" size="sm" onClick={() => handleUpdateIntegration('PAYMENT', 'NONE')}>Disconnect</Button>
                      </>
                    ) : (
                      <Select
                        value={integrationSettings.payment?.provider || 'NONE'}
                        onValueChange={(value) => handleUpdateIntegration('PAYMENT', value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NONE">Select Gateway</SelectItem>
                          <SelectItem value="STRIPE">Stripe</SelectItem>
                          <SelectItem value="PAYPAL">PayPal</SelectItem>
                          <SelectItem value="BRAINTREE">Braintree</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Analytics</h3>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-medium">Web Analytics</div>
                      <div className="text-sm text-muted-foreground">
                        {integrationSettings.analytics?.provider === 'NONE' ? 'Not connected' : `Connected to ${integrationSettings.analytics?.provider}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {integrationSettings.analytics?.connected ? (
                      <>
                        <Badge className="bg-green-100 text-green-800">Connected</Badge>
                        <Button variant="outline" size="sm" onClick={() => handleTestIntegration('ANALYTICS', integrationSettings.analytics?.provider || '')}>Test</Button>
                        <Button variant="outline" size="sm" onClick={() => handleUpdateIntegration('ANALYTICS', 'NONE')}>Disconnect</Button>
                      </>
                    ) : (
                      <Select
                        value={integrationSettings.analytics?.provider || 'NONE'}
                        onValueChange={(value) => handleUpdateIntegration('ANALYTICS', value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NONE">Select Service</SelectItem>
                          <SelectItem value="GOOGLE_ANALYTICS">Google Analytics</SelectItem>
                          <SelectItem value="MIXPANEL">Mixpanel</SelectItem>
                          <SelectItem value="AMPLITITUDE">Amplitude</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Advanced Settings
              </CardTitle>
              <CardDescription>Advanced configuration options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Regional Settings</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={agencySettings.timezone}
                      onValueChange={(value) => setAgencySettings({...agencySettings, timezone: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                        <SelectItem value="Europe/London">London (GMT)</SelectItem>
                        <SelectItem value="Europe/Paris">Central European Time</SelectItem>
                        <SelectItem value="Asia/Tokyo">Japan Standard Time</SelectItem>
                        <SelectItem value="Australia/Sydney">Australian Eastern Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={agencySettings.currency}
                      onValueChange={(value) => setAgencySettings({...agencySettings, currency: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">US Dollar (USD)</SelectItem>
                        <SelectItem value="EUR">Euro (EUR)</SelectItem>
                        <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                        <SelectItem value="CAD">Canadian Dollar (CAD)</SelectItem>
                        <SelectItem value="AUD">Australian Dollar (AUD)</SelectItem>
                        <SelectItem value="INR">Indian Rupee (INR)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={agencySettings.language}
                      onValueChange={(value) => setAgencySettings({...agencySettings, language: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="zh">Chinese</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Data Management</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Data Export</div>
                      <div className="text-sm text-muted-foreground">Download all your agency data</div>
                    </div>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Data Backup</div>
                      <div className="text-sm text-muted-foreground">Automatic daily backups enabled</div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Data Retention</div>
                      <div className="text-sm text-muted-foreground">Keep data for 7 years</div>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">API Access</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">API Key</div>
                      <div className="text-sm text-muted-foreground">Manage your API access credentials</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Regenerate
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Webhooks</div>
                      <div className="text-sm text-muted-foreground">Configure webhook endpoints</div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Plus className="h-3 w-3 mr-1" />
                      Add Webhook
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                User Profile
              </CardTitle>
              <CardDescription>Manage your personal information and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback className="text-lg">JD</AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photo
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF. Max size of 5MB.</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="John" />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Doe" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue="john.doe@agency.com" />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" />
              </div>
              
              <div>
                <Label htmlFor="title">Job Title</Label>
                <Input id="title" defaultValue="Education Consultant" />
              </div>
              
              <div>
                <Label htmlFor="department">Department</Label>
                <Input id="department" defaultValue="Consulting" />
              </div>
              
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue="America/New_York">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Billing & Subscription
              </CardTitle>
              <CardDescription>Manage your subscription, payment methods, and billing information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Current Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Plan</span>
                        <Badge className="bg-blue-100 text-blue-800">Professional</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Monthly Cost</span>
                        <span className="font-medium">$99/month</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Next Billing Date</span>
                        <span className="font-medium">Feb 15, 2024</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                    </div>
                    <Button className="w-full mt-4">Upgrade Plan</Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Usage Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-muted-foreground">Students</span>
                          <span className="text-sm">45/100</span>
                        </div>
                        <Activity value={45} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-muted-foreground">Team Members</span>
                          <span className="text-sm">4/10</span>
                        </div>
                        <Activity value={40} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-muted-foreground">Storage</span>
                          <span className="text-sm">2.3 GB/10 GB</span>
                        </div>
                        <Activity value={23} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Payment Methods</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">VISA</span>
                      </div>
                      <div>
                        <div className="font-medium">•••• •••• •••• 4242</div>
                        <div className="text-sm text-muted-foreground">Expires 12/25</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">Default</Badge>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payment Method
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Billing History</h3>
                <div className="space-y-2">
                  {[
                    { date: "Jan 15, 2024", amount: "$99.00", status: "Paid", invoice: "INV-2024-001" },
                    { date: "Dec 15, 2023", amount: "$99.00", status: "Paid", invoice: "INV-2023-012" },
                    { date: "Nov 15, 2023", amount: "$99.00", status: "Paid", invoice: "INV-2023-011" }
                  ].map((invoice, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{invoice.invoice}</div>
                        <div className="text-sm text-muted-foreground">{invoice.date}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{invoice.amount}</span>
                        <Badge className="bg-green-100 text-green-800">{invoice.status}</Badge>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Invite Member Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to a new team member to join your agency.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email*
              </Label>
              <Input
                id="email"
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                className="col-span-3"
                placeholder="member@example.com"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Full Name*
              </Label>
              <Input
                id="name"
                value={inviteForm.name}
                onChange={(e) => setInviteForm({...inviteForm, name: e.target.value})}
                className="col-span-3"
                placeholder="John Doe"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role*
              </Label>
              <Select
                value={inviteForm.role}
                onValueChange={(value) => setInviteForm({...inviteForm, role: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AGENCY_ADMIN">Agency Admin</SelectItem>
                  <SelectItem value="CONSULTANT">Consultant</SelectItem>
                  <SelectItem value="SUPPORT">Support</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                  <SelectItem value="INTERN">Intern</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={inviteForm.phone}
                onChange={(e) => setInviteForm({...inviteForm, phone: e.target.value})}
                className="col-span-3"
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={inviteForm.title}
                onChange={(e) => setInviteForm({...inviteForm, title: e.target.value})}
                className="col-span-3"
                placeholder="Education Consultant"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="department" className="text-right">
                Department
              </Label>
              <Input
                id="department"
                value={inviteForm.department}
                onChange={(e) => setInviteForm({...inviteForm, department: e.target.value})}
                className="col-span-3"
                placeholder="Consulting"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInviteMember} disabled={inviteLoading}>
              {inviteLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
            <DialogDescription>
              Update team member information and settings.
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right">
                  Email*
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-firstName" className="text-right">
                  First Name*
                </Label>
                <Input
                  id="edit-firstName"
                  value={editingUser.firstName}
                  onChange={(e) => setEditingUser({...editingUser, firstName: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-lastName" className="text-right">
                  Last Name*
                </Label>
                <Input
                  id="edit-lastName"
                  value={editingUser.lastName}
                  onChange={(e) => setEditingUser({...editingUser, lastName: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-role" className="text-right">
                  Role*
                </Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(value) => setEditingUser({...editingUser, role: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AGENCY_ADMIN">Agency Admin</SelectItem>
                    <SelectItem value="CONSULTANT">Consultant</SelectItem>
                    <SelectItem value="SUPPORT">Support</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="INTERN">Intern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  value={editingUser.phone || ''}
                  onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-title" className="text-right">
                  Title
                </Label>
                <Input
                  id="edit-title"
                  value={editingUser.title || ''}
                  onChange={(e) => setEditingUser({...editingUser, title: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-department" className="text-right">
                  Department
                </Label>
                <Input
                  id="edit-department"
                  value={editingUser.department || ''}
                  onChange={(e) => setEditingUser({...editingUser, department: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-status" className="text-right">
                  Status
                </Label>
                <Select
                  value={editingUser.status}
                  onValueChange={(value) => setEditingUser({...editingUser, status: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEditUser} disabled={editLoading}>
              {editLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}