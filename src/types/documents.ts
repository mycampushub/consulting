export interface Document {
  id: string
  name: string
  type: 'PDF' | 'DOC' | 'DOCX' | 'XLS' | 'XLSX' | 'PPT' | 'PPTX' | 'JPG' | 'PNG' | 'MP4' | 'MP3' | 'ZIP' | 'OTHER'
  category: 'APPLICATION' | 'CONTRACT' | 'TRANSCRIPT' | 'CERTIFICATE' | 'ID' | 'PASSPORT' | 'FINANCIAL' | 'OTHER'
  size: number
  uploadedBy: string
  uploadedAt: string
  lastModified: string
  tags: string[]
  isStarred: boolean
  studentId?: string
  studentName?: string
  universityId?: string
  universityName?: string
  status: 'ACTIVE' | 'ARCHIVED' | 'DELETED'
  downloadCount: number
}

export interface DocumentFolder {
  id: string
  name: string
  description: string
  parentId?: string
  documentCount: number
  totalSize: number
  createdAt: string
  createdBy: string
}