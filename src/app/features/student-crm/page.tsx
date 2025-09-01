import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Database, TrendingUp, MessageSquare, Calendar, CheckCircle } from "lucide-react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import Link from "next/link"

export default function StudentCRMPage() {
  const features = [
    {
      icon: Users,
      title: "Student Profiles",
      description: "Comprehensive student information management with custom fields and tags"
    },
    {
      icon: Database,
      title: "Document Management",
      description: "Secure storage and organization of student documents, certificates, and applications"
    },
    {
      icon: TrendingUp,
      title: "Lead Scoring",
      description: "AI-powered lead scoring to prioritize high-potential students"
    },
    {
      icon: MessageSquare,
      title: "Communication Tracking",
      description: "Complete communication history with students across all channels"
    },
    {
      icon: Calendar,
      title: "Appointment Scheduling",
      description: "Integrated calendar for consultations, follow-ups, and deadlines"
    },
    {
      icon: CheckCircle,
      title: "Application Pipeline",
      description: "Visual pipeline management for student applications and visa processing"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Student CRM
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            Complete Student Lifecycle Management
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Manage every aspect of your student relationships from initial inquiry to successful enrollment 
            and beyond. Our CRM is specifically designed for education agencies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/signup">Start Free Trial</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/contact">Schedule Demo</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Key Benefits */}
        <div className="bg-muted/50 rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Key Benefits</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">For Your Agency</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Increased conversion rates with lead scoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Improved team collaboration and communication</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Automated workflows save time and reduce errors</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Comprehensive reporting and analytics</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">For Your Students</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Personalized communication and support</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Transparent application tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Easy document submission and management</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Timely reminders and updates</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Student Management?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join hundreds of education agencies already using our CRM to scale their operations
          </p>
          <Button size="lg" asChild>
            <Link href="/signup">Get Started Today</Link>
          </Button>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}