import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="bg-gradient-to-b from-background to-muted">
        {/* Header */}
        <div className="bg-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Get in touch with our team to learn how EduSaaS can help your education agency grow
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
            <p className="text-lg text-muted-foreground">
              Contact us at support@eduagency.com for any inquiries
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}