"use client"

import { ReactNode, useState, useEffect } from "react"
import { useParams, usePathname, useRouter } from "next/navigation"
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
  FileText,
  CreditCard,
  BarChart3,
  MessageSquare,
  Calendar,
  Settings,
  Database,
  Workflow,
  Target,
  BookOpen,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  Menu,
  Home,
  FileSearch,
  Receipt,
  TrendingUp,
  PiggyBank,
  Calculator,
  Loader2
} from "lucide-react"

interface AppLayoutProps {
  children: ReactNode
  initialData?: any
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
    icon: FileSearch,
    description: "Document management"
  },
  {
    title: "Workflows",
    url: "/workflows",
    icon: Workflow,
    description: "Process automation"
  },
  {
    title: "Integrations",
    url: "/integrations",
    icon: Database,
    description: "Third-party integrations"
  },
  {
    title: "Team",
    url: "/team",
    icon: Users,
    description: "Team management"
  },
  {
    title: "Billing",
    url: "/billing",
    icon: Receipt,
    description: "Subscription & billing"
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    description: "Agency settings"
  }
]

export function AppLayout({ children, initialData }: AppLayoutProps) {
  const params = useParams()
  const pathname = usePathname()
  const router = useRouter()
  const subdomain = params.subdomain as string
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState(initialData || {})

  const isActive = (url: string) => {
    return pathname === `/${subdomain}${url}`
  }

  const handleNavigation = async (url: string) => {
    setIsLoading(true)
    try {
      // For SPA navigation, we'll use Next.js router
      router.push(`/${subdomain}${url}`)
    } catch (error) {
      console.error('Navigation error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar collapsible="icon" variant="inset">
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

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        isActive={isActive(item.url)}
                        onClick={() => handleNavigation(item.url)}
                        tooltip={item.description}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto text-xs">
                            {item.badge}
                          </Badge>
                        )}
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
                <SidebarMenuButton tooltip="Help & Support">
                  <HelpCircle className="h-4 w-4" />
                  <span>Help & Support</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Logout">
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
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
                  {menuItems.find(item => isActive(item.url))?.title || "Dashboard"}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              </div>
            ) : (
              <div className="p-6">
                {children}
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}