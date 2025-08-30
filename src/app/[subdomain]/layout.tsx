"use client"

import { ReactNode } from "react"
import { useParams, useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  GraduationCap, 
  Globe, 
  CreditCard, 
  Calculator, 
  Megaphone, 
  Landmark, 
  MessageSquare, 
  FolderOpen, 
  BarChart3, 
  Calendar, 
  Plug, 
  Settings, 
  Bell,
  User,
  Search,
  ChevronDown,
  LogOut
} from "lucide-react"

interface SubdomainLayoutProps {
  children: ReactNode
  params: {
    subdomain: string
  }
}

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: LayoutDashboard 
  },
  { 
    name: 'Students', 
    href: '/students', 
    icon: Users 
  },
  { 
    name: 'Applications', 
    href: '/applications', 
    icon: FileText 
  },
  { 
    name: 'Team', 
    href: '/team', 
    icon: User 
  },
  { 
    name: 'Universities', 
    href: '/universities', 
    icon: GraduationCap 
  },
  { 
    name: 'Billing', 
    href: '/billing', 
    icon: CreditCard 
  },
  { 
    name: 'Accounting', 
    href: '/accounting', 
    icon: Calculator 
  },
  { 
    name: 'Marketing', 
    href: '/marketing', 
    icon: Megaphone 
  },
  { 
    name: 'Landing Pages', 
    href: '/landing-pages', 
    icon: Landmark 
  },
  { 
    name: 'Forms', 
    href: '/forms', 
    icon: FileText 
  },
  { 
    name: 'Communications', 
    href: '/communications', 
    icon: MessageSquare 
  },
  { 
    name: 'Documents', 
    href: '/documents', 
    icon: FolderOpen 
  },
  { 
    name: 'Analytics', 
    href: '/analytics', 
    icon: BarChart3 
  },
  { 
    name: 'Events', 
    href: '/events', 
    icon: Calendar 
  },
  { 
    name: 'Integrations', 
    href: '/integrations', 
    icon: Plug 
  }
]

export default function SubdomainLayout({ children }: SubdomainLayoutProps) {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const subdomain = params.subdomain as string

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-border">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">EA</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold">Agency Dashboard</h1>
              <p className="text-sm text-muted-foreground">{subdomain}.eduagency.com</p>
            </div>
          </div>
          
          <div className="ml-auto flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
              <Badge variant="destructive" className="ml-2 h-5 w-5 flex items-center justify-center text-xs">
                3
              </Badge>
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push('/student')}>
              <GraduationCap className="h-4 w-4 mr-2" />
              Student Portal
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-background border-r border-border">
          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === `/${subdomain}${item.href}`
              return (
                <Link
                  key={item.name}
                  href={`/${subdomain}${item.href}`}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}