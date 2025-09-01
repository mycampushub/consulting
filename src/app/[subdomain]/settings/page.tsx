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
  Plus
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
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("general")

  const handleSaveSettings = async () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      // Show success message
    }, 1000)
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Handle logo upload
      console.log('Logo uploaded:', file.name)
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
        <Button onClick={handleSaveSettings} disabled={loading}>
          {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
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
                        <Button variant="outline" size="sm">Configure</Button>
                      </>
                    ) : (
                      <Select
                        value={integrationSettings.crm?.provider || 'NONE'}
                        onValueChange={(value) => setIntegrationSettings({
                          ...integrationSettings,
                          crm: {
                            ...integrationSettings.crm!,
                            provider: value as any,
                            connected: value !== 'NONE'
                          }
                        })}
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
                        <Button variant="outline" size="sm">Configure</Button>
                      </>
                    ) : (
                      <Select
                        value={integrationSettings.email?.provider || 'NONE'}
                        onValueChange={(value) => setIntegrationSettings({
                          ...integrationSettings,
                          email: {
                            ...integrationSettings.email!,
                            provider: value as any,
                            connected: value !== 'NONE'
                          }
                        })}
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
                        <Button variant="outline" size="sm">Configure</Button>
                      </>
                    ) : (
                      <Select
                        value={integrationSettings.payment?.provider || 'NONE'}
                        onValueChange={(value) => setIntegrationSettings({
                          ...integrationSettings,
                          payment: {
                            ...integrationSettings.payment!,
                            provider: value as any,
                            connected: value !== 'NONE'
                          }
                        })}
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
                        <Button variant="outline" size="sm">Configure</Button>
                      </>
                    ) : (
                      <Select
                        value={integrationSettings.analytics?.provider || 'NONE'}
                        onValueChange={(value) => setIntegrationSettings({
                          ...integrationSettings,
                          analytics: {
                            ...integrationSettings.analytics!,
                            provider: value as any,
                            connected: value !== 'NONE'
                          }
                        })}
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
      </Tabs>
    </div>
  )
}