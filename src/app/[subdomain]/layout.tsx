"use client"

import { ReactNode, use } from "react"
import { useParams, usePathname } from "next/navigation"
import { ServerSidebar } from "@/components/layout/server-sidebar"

interface SubdomainLayoutProps {
  children: ReactNode
  params: Promise<{
    subdomain: string
  }>
}

export default function SubdomainLayout({ children, params }: SubdomainLayoutProps) {
  const pathname = usePathname()
  const { subdomain } = use(params)
  
  // Check if the current path is a student page
  // Student pages should NOT use the admin sidebar
  const isStudentPage = pathname.startsWith(`/${subdomain}/student`)
  
  if (isStudentPage) {
    // For student pages, render children directly without the admin sidebar
    // The student layout will handle the student-specific layout
    return children
  }
  
  // For all other pages (admin/agency pages), use the admin sidebar
  return (
    <ServerSidebar>
      {children}
    </ServerSidebar>
  )
}