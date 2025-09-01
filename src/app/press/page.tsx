"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Newspaper, 
  Calendar, 
  Download, 
  ExternalLink, 
  Award, 
  TrendingUp,
  Users,
  Building2,
  Globe,
  Mail,
  Phone,
  FileText,
  Image as ImageIcon,
  Play,
  Filter,
  CheckCircle,
  ArrowRight,
  Star,
  BarChart3,
  Target,
  Zap,
  Shield,
  Heart,
  Lightbulb
} from "lucide-react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"

export default function PressPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground py-20">
          <div className="container mx-auto px-4 text-center">
            <Badge variant="secondary" className="mb-4">
              <Newspaper className="h-4 w-4 mr-2" />
              Press Center
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              EduSaaS in the News
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto mb-8">
              Stay updated with the latest news, press releases, and media coverage about EduSaaS's 
              mission to transform education technology worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary">
                Download Press Kit
                <Download className="h-4 w-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                Contact Press Team
                <Mail className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Press Resources</h2>
            <p className="text-muted-foreground">
              Check back soon for our latest press releases!
            </p>
            <div className="mt-8">
              <Select>
                <SelectTrigger className="w-48 mx-auto">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
              </Select>
              <p className="mt-4">Select component is working!</p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}