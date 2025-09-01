import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Facebook, Globe, Zap, Smartphone, CheckCircle } from "lucide-react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import Link from "next/link"

export default function FormBuilderPage() {
  const features = [
    {
      icon: FileText,
      title: "Drag-and-Drop Forms",
      description: "Create custom forms with our intuitive drag-and-drop form builder"
    },
    {
      icon: Facebook,
      title: "Facebook Integration",
      description: "Seamless integration with Facebook Lead Ads for automated lead capture"
    },
    {
      icon: Globe,
      title: "Google Integration",
      description: "Connect with Google Forms and Google Ads for comprehensive lead generation"
    },
    {
      icon: Zap,
      title: "Smart Forms",
      description: "Conditional logic and dynamic fields for personalized user experiences"
    },
    {
      icon: Smartphone,
      title: "Mobile Optimized",
      description: "Forms that work perfectly on all devices and screen sizes"
    },
    {
      icon: CheckCircle,
      title: "Auto-Response",
      description: "Automated email responses and lead routing upon form submission"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Form Builder
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            Powerful Lead Capture with Smart Forms
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Create custom forms that integrate with Facebook, Google, and your marketing automation. 
            Capture leads efficiently and automatically route them to your team.
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
                  <span>Increased lead capture from multiple sources</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Automated lead routing and assignment</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Reduced manual data entry</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Better lead quality with smart forms</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">For Your Students</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Easy and quick form completion</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Instant confirmation and follow-up</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Mobile-friendly form experience</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Personalized form fields based on needs</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Capture More Leads?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Start building smart forms that integrate with your favorite platforms
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