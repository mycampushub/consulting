export interface Agency {
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