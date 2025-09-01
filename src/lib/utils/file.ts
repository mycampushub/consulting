export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function getFileIcon(type: string): string {
  const typeMap: Record<string, string> = {
    'PDF': 'text-red-500',
    'DOC': 'text-blue-500',
    'DOCX': 'text-blue-500',
    'XLS': 'text-green-500',
    'XLSX': 'text-green-500',
    'PPT': 'text-orange-500',
    'PPTX': 'text-orange-500',
    'JPG': 'text-purple-500',
    'PNG': 'text-purple-500',
    'MP4': 'text-red-500',
    'MP3': 'text-blue-500',
    'ZIP': 'text-yellow-500'
  }
  
  return typeMap[type] || 'text-gray-500'
}