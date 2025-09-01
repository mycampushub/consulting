"use client"

import { useState, useEffect } from "react"
import { useParams, usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton, 
  SidebarProvider,
  SidebarTrigger,
  SidebarInset
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  CreditCard,
  FileText,
  Calendar,
  MessageSquare,
  BarChart3,
  Settings,
  Workflow,
  Target,
  Database,
  Bell,
  HelpCircle,
  LogOut,
  Menu,
  Home,
  FileSearch,
  Receipt,
  TrendingUp,
  PiggyBank,
  Calculator,
  UserPlus,
  CreditCard as BillingIcon,
  Folder,
  Globe,
  File,
  Plug,
  Users as TeamIcon,
  User
} from "lucide-react"

interface ServerSidebarProps {
  children: React.ReactNode
}

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview and analytics"
  },
  {
    title: "Students",
    url: "/students",
    icon: Users,
    description: "Student management"
  },
  {
    title: "Universities",
    url: "/universities",
    icon: GraduationCap,
    description: "University partnerships"
  },
  {
    title: "Applications",
    url: "/applications",
    icon: FileText,
    description: "Application tracking"
  },
  {
    title: "Accounting",
    url: "/accounting",
    icon: CreditCard,
    description: "Financial management",
    badge: "Enhanced"
  },
  {
    title: "Branches",
    url: "/branches",
    icon: Building2,
    description: "Branch management"
  },
  {
    title: "Marketing",
    url: "/marketing",
    icon: Target,
    description: "Marketing campaigns"
  },
  {
    title: "Forms",
    url: "/forms",
    icon: FileSignature,
    description: "Form builder"
  },
  {
    title: "Landing Pages",
    url: "/landing-pages",
    icon: Globe,
    description: "Landing page builder"
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
    description: "Reports and insights"
  },
  {
    title: "Communications",
    url: "/communications",
    icon: MessageSquare,
    description: "Messaging center"
  },
  {
    title: "Events",
    url: "/events",
    icon: Calendar,
    description: "Event management"
  },
  {
    title: "Documents",
    url: "/documents",
    icon: Folder,
    description: "Document management"
  },
  {
    title: "Workflows",
    url: "/workflows",
    icon: Workflow,
    description: "Process automation"
  }
]

export function ServerSidebar({ children }: ServerSidebarProps) {
  const params = useParams()
  const pathname = usePathname()
  const subdomain = params.subdomain as string
  const [sidebarState, setSidebarState] = useState<"expanded" | "collapsed">("expanded")

  const isActive = (url: string) => {
    return pathname === `/${subdomain}${url}` || pathname.startsWith(`/${subdomain}${url}#`)
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar 
          collapsible="icon" 
          variant="inset"
          state={sidebarState}
          onStateChange={(state) => setSidebarState(state as "expanded" | "collapsed")}
        >
          <SidebarHeader className="border-b p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">EA</span>
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-lg">Agency Portal</h2>
                <p className="text-xs text-muted-foreground">{subdomain}.eduagency.com</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="flex-1 overflow-y-auto">
            <SidebarGroup>
              <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        isActive={isActive(item.url)}
                        asChild
                        tooltip={item.description}
                      >
                        <Link 
                          href={`/${subdomain}${item.url}`}
                          className="flex items-center gap-2 flex-1"
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="text-xs ml-auto">
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Settings">
                  <Link href={`/${subdomain}/settings`} className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Help & Support">
                  <Link href={`/${subdomain}/support`} className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    <span>Help & Support</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Logout">
                  <button 
                    onClick={() => {
                      // Clear any auth tokens or session data
                      if (typeof window !== 'undefined') {
                        // Clear all localStorage items
                        localStorage.clear()
                        // Clear all sessionStorage items
                        sessionStorage.clear()
                        // Clear any cookies
                        document.cookie.split(';').forEach(cookie => {
                          const eqPos = cookie.indexOf('=')
                          const name = eqPos > -1 ? cookie.slice(0, eqPos).trim() : cookie.trim()
                          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
                        })
                        // Redirect to login page
                        window.location.href = '/login'
                      }
                    }}
                    className="flex items-center gap-2 w-full"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
              <SidebarTrigger className="mr-4" />
              <div className="flex-1">
                <h1 className="font-semibold">
                  {menuItems.find(item => isActive(item.url))?.title || 
                   (pathname.includes('/settings') ? 'Settings' : 
                    pathname.includes('/support') ? 'Help & Support' : 'Dashboard')}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/${subdomain}/settings`}>
                    <User className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}