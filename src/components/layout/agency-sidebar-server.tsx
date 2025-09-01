"use client"

import { Suspense, useState } from "react"
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
  SidebarMenuButton, 
  SidebarMenuItem,
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

// Server component for menu items data fetching
async function getMenuItems() {
  // This would normally fetch from an API based on user permissions
  // For now, we'll return static data
  return [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      description: "Overview and analytics",
      enabled: true
    },
    {
      title: "Students",
      url: "/students",
      icon: Users,
      description: "Student management",
      enabled: true
    },
    {
      title: "Universities",
      url: "/universities",
      icon: GraduationCap,
      description: "University partnerships",
      enabled: true
    },
    {
      title: "Applications",
      url: "/applications",
      icon: FileText,
      description: "Application tracking",
      enabled: true
    },
    {
      title: "Accounting",
      url: "/accounting",
      icon: CreditCard,
      description: "Financial management",
      badge: "Enhanced",
      enabled: true
    },
    {
      title: "Branches",
      url: "/branches",
      icon: Building2,
      description: "Branch management",
      enabled: true
    },
    {
      title: "Marketing",
      url: "/marketing",
      icon: Target,
      description: "Marketing campaigns",
      enabled: true
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: BarChart3,
      description: "Reports and insights",
      enabled: true
    },
    {
      title: "Communications",
      url: "/communications",
      icon: MessageSquare,
      description: "Messaging center",
      enabled: true
    },
    {
      title: "Events",
      url: "/events",
      icon: Calendar,
      description: "Event management",
      enabled: true
    },
    {
      title: "Documents",
      url: "/documents",
      icon: FileSearch,
      description: "Document management",
      enabled: true
    },
    {
      title: "Workflows",
      url: "/workflows",
      icon: Workflow,
      description: "Process automation",
      enabled: true
    },
    {
      title: "Integrations",
      url: "/integrations",
      icon: Database,
      description: "Third-party integrations",
      enabled: true
    },
    {
      title: "Team",
      url: "/team",
      icon: Users,
      description: "Team management",
      enabled: true
    },
    {
      title: "Billing",
      url: "/billing",
      icon: Receipt,
      description: "Subscription & billing",
      enabled: true
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
      description: "Agency settings",
      enabled: true
    }
  ]
}

// Client component for the sidebar content
function SidebarContentClient({ menuItems, subdomain, pathname, handleNavigation }: {
  menuItems: any[]
  subdomain: string
  pathname: string
  handleNavigation: (url: string) => void
}) {
  const isActive = (url: string) => {
    return pathname === `/${subdomain}${url}`
  }

  return (
    <>
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
              {menuItems.filter(item => item.enabled).map((item) => (
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
            <SidebarMenuButton tooltip="Settings">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
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
    </>
  )
}

// Loading component for suspense fallback
function SidebarLoading() {
  return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  )
}

interface AgencySidebarServerProps {
  children: React.ReactNode
}

export default function AgencySidebarServer({ children }: AgencySidebarServerProps) {
  const params = useParams()
  const pathname = usePathname()
  const router = useRouter()
  const subdomain = params.subdomain as string
  const [menuItems, setMenuItems] = useState<any[]>([])

  // Fetch menu items on client side for SPA behavior
  useState(() => {
    getMenuItems().then(setMenuItems)
  })

  const handleNavigation = (url: string) => {
    router.push(`/${subdomain}${url}`)
  }

  const getPageTitle = () => {
    const currentPath = pathname.replace(`/${subdomain}`, "")
    const menuItem = menuItems.find(item => item.url === currentPath)
    return menuItem?.title || "Dashboard"
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar collapsible="icon" variant="inset">
          <Suspense fallback={<SidebarLoading />}>
            <SidebarContentClient 
              menuItems={menuItems}
              subdomain={subdomain}
              pathname={pathname}
              handleNavigation={handleNavigation}
            />
          </Suspense>
        </Sidebar>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
              <SidebarTrigger className="mr-4" />
              <div className="flex-1">
                <h1 className="font-semibold">{getPageTitle()}</h1>
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
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}