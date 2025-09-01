"use client"

import { ReactNode } from "react"
import { ServerSidebar } from "@/components/layout/server-sidebar"

interface SubdomainLayoutProps {
  children: ReactNode
  params: {
    subdomain: string
  }
}

export default function SubdomainLayout({ children, params }: SubdomainLayoutProps) {
  return (
    <ServerSidebar>
      {children}
    </ServerSidebar>
  )
}