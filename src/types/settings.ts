export interface AgencySettings {
  id: string
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
    country: string
    zipCode: string
  }
  contact: {
    email: string
    phone: string
    website?: string
  }
  features: {
    enableStudentPortal: boolean
    enableUniversityPartnerships: boolean
    enableDocumentManagement: boolean
    enableAnalytics: boolean
    enableNotifications: boolean
    enableApiAccess: boolean
  }
}

export interface UserPreferences {
  id: string
  userId: string
  theme: 'light' | 'dark' | 'auto'
  language: string
  timezone: string
  emailNotifications: boolean
  pushNotifications: boolean
  dateFormat: string
  timeFormat: '12h' | '24h'
}

export interface SecuritySettings {
  id: string
  twoFactorEnabled: boolean
  sessionTimeout: number
  passwordPolicy: {
    minLength: number
    requireUppercase: boolean
    requireNumbers: boolean
    requireSpecialChars: boolean
    expireDays: number
  }
  ipRestrictions: string[]
  auditLogEnabled: boolean
}