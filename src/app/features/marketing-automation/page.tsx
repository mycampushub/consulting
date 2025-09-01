import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Zap, Mail, MessageSquare, Users, Target, CheckCircle } from "lucide-react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import Link from "next/link"

export default function MarketingAutomationPage() {
  const features = [
    {
      icon: Zap,
      title: "Workflow Builder",
      description: "Advanced drag-and-drop workflow builder like GoHighLevel for complex automation sequences"
    },
    {
      icon: Mail,
      title: "Email Campaigns",
      description: "Create and automate personalized email campaigns with A/B testing capabilities"
    },
    {
      icon: MessageSquare,
      title: "SMS & WhatsApp",
      description: "Automated messaging across multiple channels with template management"
    },
    {
      icon: Users,
      title: "Lead Nurturing",
      description: "Automated lead nurturing sequences based on student behavior and engagement"
    },
    {
      icon: Target,
      title: "Behavioral Triggers",
      description: "Trigger actions based on student interactions, website visits, and form submissions"
    },
    {
      icon: CheckCircle,
      title: "Analytics Dashboard",
      description: "Comprehensive analytics to track campaign performance and ROI"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Marketing Automation
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            Advanced Marketing Automation for Education Agencies
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Streamline your marketing efforts with powerful automation tools designed specifically for 
            education agencies. Nurture leads, engage students, and grow your agency efficiently.
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
                  <span>Save hours with automated follow-ups</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Higher conversion rates with personalized nurturing</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Consistent brand messaging across all channels</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Data-driven decision making with analytics</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">For Your Students</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Personalized communication based on interests</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Timely and relevant information delivery</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Multi-channel engagement options</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Consistent follow-up and support</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Automate Your Marketing?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Start converting more leads with our powerful marketing automation tools
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