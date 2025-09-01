"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Calendar, 
  User, 
  Clock, 
  Tag, 
  Heart, 
  MessageCircle, 
  Share2,
  ArrowRight,
  Filter,
  TrendingUp,
  BookOpen,
  Lightbulb,
  Users,
  Globe,
  Zap,
  Award,
  Eye,
  FolderOpen,
  Mail
} from "lucide-react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground py-20">
          <div className="container mx-auto px-4 text-center">
            <Badge variant="secondary" className="mb-4">
              <BookOpen className="h-4 w-4 mr-2" />
              EduSaaS Blog
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Insights & Innovation in Education Technology
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto mb-8">
              Stay updated with the latest trends, best practices, and product updates from the world of education agencies
            </p>
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  className="pl-10 bg-background/20 border-background/30 text-white placeholder:text-white/70"
                />
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Latest Articles</h2>
            <p className="text-muted-foreground">
              Check back soon for our latest blog posts!
            </p>
            <div className="mt-8">
              <Mail className="h-8 w-8 mx-auto mb-4 text-primary" />
              <p>Mail icon is working!</p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}