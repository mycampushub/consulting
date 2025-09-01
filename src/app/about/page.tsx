import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="bg-gradient-to-b from-background to-muted">
        {/* Hero Section */}
        <div className="bg-primary text-primary-foreground py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">About EduSaaS</h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Empowering education agencies worldwide with innovative technology solutions since 2020
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16 space-y-16">
          {/* Mission Statement */}
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              To revolutionize education agency management through cutting-edge technology, 
              enabling agencies to focus on what matters most - helping students achieve their 
              educational dreams. We're committed to providing the tools, support, and 
              innovation needed to scale education businesses globally.
            </p>
          </div>

          {/* CTA Section */}
          <div className="bg-primary text-primary-foreground rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Agency?</h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Join hundreds of education agencies that have already revolutionized their operations with EduSaaS
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}