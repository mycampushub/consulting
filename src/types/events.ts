export interface Event {
  id: string
  title: string
  description: string
  type: 'WEBINAR' | 'WORKSHOP' | 'SEMINAR' | 'FAIR' | 'MEETING' | 'CONFERENCE'
  status: 'DRAFT' | 'PUBLISHED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'
  startDate: string
  endDate: string
  location?: string
  isVirtual: boolean
  maxParticipants?: number
  registeredCount: number
  price?: number
  currency?: string
  organizer: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface EventRegistration {
  id: string
  eventId: string
  studentId: string
  studentName: string
  studentEmail: string
  registrationDate: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'ATTENDED'
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED' | 'FREE'
}