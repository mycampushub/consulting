"use client"

import { ReactNode } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GraduationCap, User, LogOut, Home, FileText, Bell, Settings } from "lucide-react"

interface StudentPortalLayoutProps {
  children: ReactNode
  params: {
    subdomain: string
  }
}

export default function StudentPortalLayout({ children, params }: StudentPortalLayoutProps) {
  const subdomain = params.subdomain

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Student Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="text-primary-foreground h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Student Portal</h1>
                <p className="text-xs text-muted-foreground">{subdomain}.eduagency.com</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                href={`/${subdomain}/student/portal`}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Home className="w-4 h-4 inline mr-1" />
                Dashboard
              </Link>
              <Link 
                href={`/${subdomain}/student/portal`}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <FileText className="w-4 h-4 inline mr-1" />
                Applications
              </Link>
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  // Clear any auth tokens or session data
                  if (typeof window !== 'undefined') {
                    localStorage.clear()
                    sessionStorage.clear()
                    document.cookie.split(';').forEach(cookie => {
                      const eqPos = cookie.indexOf('=')
                      const name = eqPos > -1 ? cookie.slice(0, eqPos).trim() : cookie.trim()
                      document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
                    })
                    window.location.href = `/${subdomain}/student/login`
                  }
                }}
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </nav>

            {/* Mobile menu button */}
            <Button variant="ghost" size="sm" className="md:hidden">
              <User className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Simple Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2024 {subdomain}.eduagency.com. All rights reserved.</p>
            <div className="mt-2 space-x-4">
              <Link href={`/${subdomain}/privacy`} className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href={`/${subdomain}/terms`} className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link href={`/${subdomain}/contact`} className="hover:text-foreground transition-colors">
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}