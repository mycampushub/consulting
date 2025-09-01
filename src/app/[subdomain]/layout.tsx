"use client"

import { ReactNode } from "react"
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
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
  Mail,
  Phone,
  MapPin,
  BookOpen,
  Activity,
  Globe,
  Folder,
  File,
  Download,
  RefreshCw,
  Plug,
  Building,
  Play,
  Loader2
} from "lucide-react"

interface SubdomainLayoutProps {
  children: ReactNode
  params: {
    subdomain: string
  }
}

const menuItems = [
  {
    title: "Dashboard",
    url: `/${encodeURIComponent("dashboard")}`,
    icon: LayoutDashboard,
  },
  {
    title: "Students",
    url: `/${encodeURIComponent("students")}`,
    icon: Users,
  },
  {
    title: "Universities",
    url: `/${encodeURIComponent("universities")}`,
    icon: GraduationCap,
  },
  {
    title: "Branches",
    url: `/${encodeURIComponent("branches")}`,
    icon: Building2,
  },
  {
    title: "Accounting",
    url: `/${encodeURIComponent("accounting")}`,
    icon: CreditCard,
    badge: "Enhanced"
  },
  {
    title: "Applications",
    url: `/${encodeURIComponent("applications")}`,
    icon: FileText,
  },
  {
    title: "Events",
    url: `/${encodeURIComponent("events")}`,
    icon: Calendar,
  },
  {
    title: "Communications",
    url: `/${encodeURIComponent("communications")}`,
    icon: MessageSquare,
  },
  {
    title: "Marketing",
    url: `/${encodeURIComponent("marketing")}`,
    icon: Target,
  },
  {
    title: "Analytics",
    url: `/${encodeURIComponent("analytics")}`,
    icon: BarChart3,
  },
  {
    title: "Workflows",
    url: `/${encodeURIComponent("workflows")}`,
    icon: Workflow,
  },
  {
    title: "Documents",
    url: `/${encodeURIComponent("documents")}`,
    icon: Folder,
  },
  {
    title: "Forms",
    url: `/${encodeURIComponent("forms")}`,
    icon: File,
  },
  {
    title: "Landing Pages",
    url: `/${encodeURIComponent("landing-pages")}`,
    icon: Globe,
  },
  {
    title: "Integrations",
    url: `/${encodeURIComponent("integrations")}`,
    icon: Plug,
  },
  {
    title: "Team",
    url: `/${encodeURIComponent("team")}`,
    icon: Users,
  },
  {
    title: "Billing",
    url: `/${encodeURIComponent("billing")}`,
    icon: CreditCard,
  },
]

export default function SubdomainLayout({ children, params }: SubdomainLayoutProps) {
  const subdomain = params.subdomain

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">EA</span>
              </div>
              <div>
                <h1 className="font-semibold text-lg">Education Agency</h1>
                <p className="text-xs text-muted-foreground">{subdomain}.eduagency.com</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="flex-1 overflow-y-auto">
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <div className="flex items-center gap-2">
                      <a href={`/${subdomain}${item.url}`} className="flex items-center gap-2 flex-1">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </a>
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          
          <SidebarFooter className="border-t p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href={`/${subdomain}/settings`} className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        
        <SidebarInset className="flex-1 overflow-auto">
          <div className="flex items-center gap-2 border-b p-4">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-xl font-semibold">Agency Management System</h1>
            </div>
          </div>
          <main className="flex-1 p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}