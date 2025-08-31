"use client"

import { ReactNode } from "react"

interface SubdomainLayoutProps {
  children: ReactNode
  params: {
    subdomain: string
  }
}

export default function SubdomainLayout({ children }: SubdomainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Main Content - Clean SPA look without sidebar and topbar */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}