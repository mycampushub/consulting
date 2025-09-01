"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { 
  Search, 
  HelpCircle, 
  BookOpen, 
  Video, 
  MessageCircle, 
  Phone, 
  Mail,
  Clock,
  CheckCircle,
  Star,
  TrendingUp,
  Users,
  Lightbulb,
  Shield,
  Zap,
  Database,
  Globe,
  FileText,
  ArrowRight,
  ExternalLink,
  Download,
  Play,
  Headphones,
  Eye,
  Calendar
} from "lucide-react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground py-20">
          <div className="container mx-auto px-4 text-center">
            <Badge variant="secondary" className="mb-4">
              <HelpCircle className="h-4 w-4 mr-2" />
              Help Center
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              How Can We Help You Today?
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto mb-8">
              Find answers, get support, and learn how to make the most of EduSaaS with our comprehensive help resources.
            </p>
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for help articles, guides, and FAQs..."
                  className="pl-10 bg-background/20 border-background/30 text-white placeholder:text-white/70 h-12"
                />
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Help Resources</h2>
            <p className="text-muted-foreground">
              Check back soon for our comprehensive help articles!
            </p>
            <div className="mt-8">
              <Calendar className="h-8 w-8 mx-auto mb-4 text-primary" />
              <p>Calendar icon is working!</p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}