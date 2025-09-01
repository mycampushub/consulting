import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="bg-gradient-to-b from-background to-muted">
        {/* Hero Section */}
        <div className="bg-primary text-primary-foreground py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">Powerful Features for Modern Education Agencies</h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Everything you need to manage students, automate workflows, and grow your education agency
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16 space-y-16">
          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Student CRM</h3>
              <p className="text-muted-foreground">Complete student lifecycle management</p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Marketing Automation</h3>
              <p className="text-muted-foreground">Advanced workflow automation</p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Analytics</h3>
              <p className="text-muted-foreground">Comprehensive reporting dashboard</p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-primary text-primary-foreground rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of education agencies already using EduSaaS
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}