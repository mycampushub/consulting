import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-4">
              Terms of Service
            </Badge>
            <h1 className="text-4xl font-bold mb-4">
              Terms of Service
            </h1>
            <p className="text-lg text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>1. Acceptance of Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <p>By accessing and using EduSaaS ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. These Terms of Service apply to all users of the Service.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Use License</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Permission is granted to temporarily download one copy of the materials on EduSaaS's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose</li>
                  <li>Attempt to decompile or reverse engineer any software contained on EduSaaS</li>
                  <li>Remove any copyright or other proprietary notations from the materials</li>
                  <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Account Responsibilities</CardTitle>
              </CardHeader>
              <CardContent>
                <p>You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer. You agree to accept responsibility for all activities that occur under your account or password.</p>
                <p className="mt-2">You must provide accurate and complete information when creating an account and keep this information up to date.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. Service Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p>EduSaaS provides a comprehensive white-label SaaS platform for education agencies, including but not limited to:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Student CRM and management tools</li>
                  <li>Marketing automation features</li>
                  <li>Landing page builder</li>
                  <li>Form builder with integrations</li>
                  <li>Accounting and financial management</li>
                  <li>Analytics and reporting tools</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. Payment Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <p>EduSaaS operates on a subscription basis. You will be billed in advance on a monthly or annual basis. All fees are exclusive of all taxes, levies, or duties imposed by taxing authorities.</p>
                <p className="mt-2">Failure to pay your subscription fees within 30 days of the invoice date may result in service suspension or termination.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. Prohibited Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <p>You may not use the Service for any illegal or unauthorized purpose. You agree not to use the Service to:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Transmit spam, bulk messages, or unsolicited communications</li>
                  <li>Violate any laws in your jurisdiction</li>
                  <li>Infringe upon the rights of others</li>
                  <li>Engage in any activity that could disable or impair the Service</li>
                  <li>Use the Service to store or transmit malicious code</li>
                  <li>Attempt to gain unauthorized access to the Service or related systems</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>7. Intellectual Property</CardTitle>
              </CardHeader>
              <CardContent>
                <p>The Service and its original content, features, and functionality are and will remain the exclusive property of EduSaaS and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>8. Data and Privacy</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Your use of the Service is also governed by our Privacy Policy. By using the Service, you agree to the collection and use of information in accordance with our Privacy Policy.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>9. Disclaimer</CardTitle>
              </CardHeader>
              <CardContent>
                <p>The service is provided on an "as is" and "as available" basis. EduSaaS makes no representations or warranties of any kind, express or implied, as to the operation of the service or the information, content, materials, or products included on the service.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>10. Limitation of Liability</CardTitle>
              </CardHeader>
              <CardContent>
                <p>In no event shall EduSaaS be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the service.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>11. Termination</CardTitle>
              </CardHeader>
              <CardContent>
                <p>We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>12. Governing Law</CardTitle>
              </CardHeader>
              <CardContent>
                <p>These Terms shall be governed and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>13. Changes to Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>14. Contact Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p>If you have any questions about these Terms of Service, please contact us at:</p>
                <p className="mt-2">Email: legal@edusaas.com</p>
                <p>Address: San Francisco, CA</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}