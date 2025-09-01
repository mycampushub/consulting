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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { 
  Plus, 
  Search, 
  Filter, 
  Upload, 
  Download, 
  FileText, 
  FileImage, 
  FileVideo, 
  FileAudio,
  FileArchive,
  File,
  Eye,
  Edit,
  Trash2,
  Share,
  Star,
  Clock,
  User,
  Folder,
  Tag,
  MoreHorizontal,
  Settings,
  HardDrive,
  Cloud
} from "lucide-react"

interface Document {
  id: string
  name: string
  type: 'PDF' | 'DOC' | 'DOCX' | 'XLS' | 'XLSX' | 'PPT' | 'PPTX' | 'JPG' | 'PNG' | 'MP4' | 'MP3' | 'ZIP' | 'OTHER'
  category: 'APPLICATION' | 'CONTRACT' | 'TRANSCRIPT' | 'CERTIFICATE' | 'PASSPORT' | 'VISA' | 'FINANCIAL' | 'OTHER'
  size: number
  uploadedBy: string
  uploadedAt: string
  lastModified: string
  tags: string[]
  isStarred: boolean
  isShared: boolean
  sharedWith?: string[]
  studentId?: string
  studentName?: string
  status: 'ACTIVE' | 'ARCHIVED' | 'DELETED'
}

interface DocumentFolder {
  id: string
  name: string
  description?: string
  documentCount: number
  totalSize: number
  createdAt: string
  createdBy: string
  tags: string[]
  isShared: boolean
}

const mockDocuments: Document[] = [
  {
    id: "1",
    name: "University Application Form",
    type: "PDF",
    category: "APPLICATION",
    size: 2048576,
    uploadedBy: "Sarah Johnson",
    uploadedAt: "2024-01-15T10:30:00Z",
    lastModified: "2024-01-15T10:30:00Z",
    tags: ["application", "university", "form"],
    isStarred: true,
    isShared: false,
    studentId: "1",
    studentName: "Alex Thompson",
    status: "ACTIVE"
  },
  {
    id: "2",
    name: "Academic Transcript",
    type: "PDF",
    category: "TRANSCRIPT",
    size: 1048576,
    uploadedBy: "Michael Chen",
    uploadedAt: "2024-01-10T14:20:00Z",
    lastModified: "2024-01-10T14:20:00Z",
    tags: ["transcript", "academic", "records"],
    isStarred: false,
    isShared: true,
    sharedWith: ["emma@agency.com"],
    studentId: "2",
    studentName: "Maria Garcia",
    status: "ACTIVE"
  },
  {
    id: "3",
    name: "Passport Copy",
    type: "JPG",
    category: "PASSPORT",
    size: 512000,
    uploadedBy: "Emma Rodriguez",
    uploadedAt: "2024-01-12T09:15:00Z",
    lastModified: "2024-01-12T09:15:00Z",
    tags: ["passport", "identification", "travel"],
    isStarred: true,
    isShared: false,
    studentId: "3",
    studentName: "James Wilson",
    status: "ACTIVE"
  },
  {
    id: "4",
    name: "Financial Guarantee Letter",
    type: "PDF",
    category: "FINANCIAL",
    size: 1536000,
    uploadedBy: "Sarah Johnson",
    uploadedAt: "2024-01-18T16:45:00Z",
    lastModified: "2024-01-18T16:45:00Z",
    tags: ["financial", "guarantee", "bank"],
    isStarred: false,
    isShared: true,
    sharedWith: ["michael@agency.com", "emma@agency.com"],
    studentId: "1",
    studentName: "Alex Thompson",
    status: "ACTIVE"
  }
]

const mockFolders: DocumentFolder[] = [
  {
    id: "1",
    name: "Applications",
    description: "University application documents",
    documentCount: 15,
    totalSize: 25600000,
    createdAt: "2024-01-01T00:00:00Z",
    createdBy: "Sarah Johnson",
    tags: ["application", "university"],
    isShared: false
  },
  {
    id: "2",
    name: "Student Records",
    description: "Academic transcripts and certificates",
    documentCount: 23,
    totalSize: 35600000,
    createdAt: "2024-01-01T00:00:00Z",
    createdBy: "Michael Chen",
    tags: ["academic", "records"],
    isShared: true
  },
  {
    id: "3",
    name: "Legal Documents",
    description: "Passports, visas, and legal papers",
    documentCount: 8,
    totalSize: 12800000,
    createdAt: "2024-01-05T00:00:00Z",
    createdBy: "Emma Rodriguez",
    tags: ["legal", "passport", "visa"],
    isShared: false
  }
]

export default function DocumentsPage() {
  const params = useParams()
  const subdomain = params.subdomain as string
  
  const [documents] = useState<Document[]>(mockDocuments)
  const [folders] = useState<DocumentFolder[]>(mockFolders)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = categoryFilter === "all" || doc.category === categoryFilter
    const matchesType = typeFilter === "all" || doc.type === typeFilter
    return matchesSearch && matchesCategory && matchesType && doc.status === "ACTIVE"
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "APPLICATION": return "bg-blue-100 text-blue-800"
      case "CONTRACT": return "bg-purple-100 text-purple-800"
      case "TRANSCRIPT": return "bg-green-100 text-green-800"
      case "CERTIFICATE": return "bg-yellow-100 text-yellow-800"
      case "PASSPORT": return "bg-red-100 text-red-800"
      case "VISA": return "bg-orange-100 text-orange-800"
      case "FINANCIAL": return "bg-indigo-100 text-indigo-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "PDF": return <FileText className="h-4 w-4 text-red-500" />
      case "DOC":
      case "DOCX": return <FileText className="h-4 w-4 text-blue-500" />
      case "XLS":
      case "XLSX": return <FileText className="h-4 w-4 text-green-500" />
      case "PPT":
      case "PPTX": return <FileText className="h-4 w-4 text-orange-500" />
      case "JPG":
      case "PNG": return <FileImage className="h-4 w-4 text-purple-500" />
      case "MP4": return <FileVideo className="h-4 w-4 text-red-500" />
      case "MP3": return <FileAudio className="h-4 w-4 text-blue-500" />
      case "ZIP": return <FileArchive className="h-4 w-4 text-yellow-500" />
      default: return <File className="h-4 w-4 text-gray-500" />
    }
  }

  const totalStorage = 5 * 1024 * 1024 * 1024 // 5GB
  const usedStorage = documents.reduce((sum, doc) => sum + doc.size, 0)
  const storagePercentage = (usedStorage / totalStorage) * 100

  const starredDocuments = documents.filter(doc => doc.isStarred && doc.status === "ACTIVE")
  const sharedDocuments = documents.filter(doc => doc.isShared && doc.status === "ACTIVE")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Documents Management</h1>
          <p className="text-muted-foreground">Organize, store, and share documents securely</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogDescription>Upload a new document to the system</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file">Select File</Label>
                  <Input id="file" type="file" />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="APPLICATION">Application</SelectItem>
                      <SelectItem value="CONTRACT">Contract</SelectItem>
                      <SelectItem value="TRANSCRIPT">Transcript</SelectItem>
                      <SelectItem value="CERTIFICATE">Certificate</SelectItem>
                      <SelectItem value="PASSPORT">Passport</SelectItem>
                      <SelectItem value="VISA">Visa</SelectItem>
                      <SelectItem value="FINANCIAL">Financial</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="student">Student (Optional)</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Alex Thompson</SelectItem>
                      <SelectItem value="2">Maria Garcia</SelectItem>
                      <SelectItem value="3">James Wilson</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <Input id="tags" placeholder="Enter tags separated by commas" />
                </div>
                {uploadProgress > 0 && (
                  <div>
                    <Label>Upload Progress</Label>
                    <Progress value={uploadProgress} className="mt-2" />
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    setUploadProgress(100)
                    setTimeout(() => {
                      setIsUploadOpen(false)
                      setUploadProgress(0)
                    }, 1000)
                  }}>
                    Upload
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Storage Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Storage Used</span>
              <span className="text-sm text-muted-foreground">
                {formatFileSize(usedStorage)} of {formatFileSize(totalStorage)}
              </span>
            </div>
            <Progress value={storagePercentage} className="h-2" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{documents.length}</div>
                <div className="text-xs text-muted-foreground">Total Files</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{starredDocuments.length}</div>
                <div className="text-xs text-muted-foreground">Starred</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{sharedDocuments.length}</div>
                <div className="text-xs text-muted-foreground">Shared</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="documents" className="space-y-6">
        <TabsList>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="folders">Folders</TabsTrigger>
          <TabsTrigger value="starred">Starred</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-4 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="APPLICATION">Application</SelectItem>
                  <SelectItem value="CONTRACT">Contract</SelectItem>
                  <SelectItem value="TRANSCRIPT">Transcript</SelectItem>
                  <SelectItem value="CERTIFICATE">Certificate</SelectItem>
                  <SelectItem value="PASSPORT">Passport</SelectItem>
                  <SelectItem value="VISA">Visa</SelectItem>
                  <SelectItem value="FINANCIAL">Financial</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="DOC">DOC</SelectItem>
                  <SelectItem value="DOCX">DOCX</SelectItem>
                  <SelectItem value="JPG">JPG</SelectItem>
                  <SelectItem value="PNG">PNG</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Documents Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredDocuments.map((document) => (
              <Card key={document.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    {getTypeIcon(document.type)}
                    <div className="flex gap-1">
                      {document.isStarred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                      {document.isShared && <Share className="h-4 w-4 text-blue-500" />}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm line-clamp-2">{document.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(document.category)}>
                        {document.category}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <div>{formatFileSize(document.size)}</div>
                      <div>by {document.uploadedBy}</div>
                      <div>{new Date(document.uploadedAt).toLocaleDateString()}</div>
                    </div>
                    {document.studentName && (
                      <div className="text-xs text-muted-foreground">
                        Student: {document.studentName}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1">
                      {document.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-xs bg-gray-100 px-1 rounded">
                          {tag}
                        </span>
                      ))}
                      {document.tags.length > 2 && (
                        <span className="text-xs text-muted-foreground">
                          +{document.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="ghost" size="sm" className="flex-1">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="folders" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {folders.map((folder) => (
              <Card key={folder.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Folder className="h-8 w-8 text-blue-500" />
                    <div className="flex-1">
                      <h3 className="font-medium">{folder.name}</h3>
                      <p className="text-sm text-muted-foreground">{folder.description}</p>
                    </div>
                    {folder.isShared && <Share className="h-4 w-4 text-blue-500" />}
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Documents:</span>
                      <span>{folder.documentCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Size:</span>
                      <span>{formatFileSize(folder.totalSize)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span>{new Date(folder.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {folder.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 px-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="starred" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {starredDocuments.map((document) => (
              <Card key={document.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    {getTypeIcon(document.type)}
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm line-clamp-2">{document.name}</h3>
                    <div className="text-xs text-muted-foreground">
                      <div>{formatFileSize(document.size)}</div>
                      <div>{new Date(document.uploadedAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="ghost" size="sm" className="flex-1">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="shared" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sharedDocuments.map((document) => (
              <Card key={document.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    {getTypeIcon(document.type)}
                    <Share className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm line-clamp-2">{document.name}</h3>
                    <div className="text-xs text-muted-foreground">
                      <div>{formatFileSize(document.size)}</div>
                      <div>Shared with {document.sharedWith?.length || 0} people</div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="ghost" size="sm" className="flex-1">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}