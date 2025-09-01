import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Layout, Palette, Smartphone, Globe, Zap, CheckCircle } from "lucide-react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import Link from "next/link"

export default function LandingPageBuilderPage() {
  const features = [
    {
      icon: Layout,
      title: "Drag-and-Drop Editor",
      description: "Intuitive visual editor for creating stunning landing pages without coding"
    },
    {
      icon: Palette,
      title: "Customizable Templates",
      description: "Professionally designed templates optimized for education agency conversions"
    },
    {
      icon: Smartphone,
      title: "Mobile Responsive",
      description: "Automatically responsive designs that look perfect on all devices"
    },
    {
      icon: Globe,
      title: "Custom Domains",
      description: "Use your own domain or create subdomains for different campaigns"
    },
    {
      icon: Zap,
      title: "A/B Testing",
      description: "Test different versions of your pages to maximize conversions"
    },
    {
      icon: CheckCircle,
      title: "Analytics Integration",
      description: "Built-in analytics to track page performance and user behavior"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Landing Page Builder
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            Create High-Converting Landing Pages in Minutes
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Build beautiful, responsive landing pages that convert visitors into students. 
            Our drag-and-drop builder makes it easy for anyone to create professional pages.
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
                  <span>No coding skills required</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Faster page creation and deployment</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Higher conversion rates with optimized templates</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Brand consistency across all pages</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">For Your Students</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Professional and trustworthy first impression</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Easy navigation and user experience</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Mobile-friendly access on any device</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Fast loading times for better engagement</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Build Amazing Landing Pages?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Start creating high-converting pages that grow your student enrollment
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