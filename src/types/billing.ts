export interface Subscription {
  id: string
  plan: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PENDING'
  currentPeriodStart: string
  currentPeriodEnd: string
  trialEnd?: string
  price: number
  currency: string
  billingCycle: 'MONTHLY' | 'YEARLY'
  features: string[]
  usage: {
    students: number
    users: number
    storage: number
    apiCalls: number
  }
  limits: {
    students: number
    users: number
    storage: number
    apiCalls: number
  }
}

export interface Invoice {
  id: string
  invoiceNumber: string
  amount: number
  currency: string
  status: 'DRAFT' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'REFUNDED'
  issueDate: string
  dueDate: string
  paidDate?: string
  items: InvoiceItem[]
  subtotal: number
  tax: number
  total: number
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface PaymentMethod {
  id: string
  type: 'CREDIT_CARD' | 'BANK_TRANSFER' | 'PAYPAL' | 'STRIPE'
  last4?: string
  brand?: string
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
  status: 'ACTIVE' | 'EXPIRED' | 'FAILED'
}

export interface UsageRecord {
  id: string
  metric: string
  currentValue: number
  limit: number
  unit: string
  period: 'CURRENT' | 'PREVIOUS'
  resetDate: string
}