import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-4">
              Privacy Policy
            </Badge>
            <h1 className="text-4xl font-bold mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>1. Information We Collect</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>We collect information you provide directly to us, such as when you create an account, fill out a form, or contact us for support.</p>
                <h4 className="font-semibold">Personal Information:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Name and contact information</li>
                  <li>Company and agency details</li>
                  <li>Payment and billing information</li>
                  <li>Communication preferences</li>
                </ul>
                <h4 className="font-semibold">Usage Information:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>IP address and browser information</li>
                  <li>Pages visited and time spent</li>
                  <li>Device and application usage data</li>
                  <li>Interaction with our platform features</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. How We Use Your Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Provide and maintain our services</li>
                  <li>Process transactions and send billing information</li>
                  <li>Communicate with you about your account</li>
                  <li>Improve and develop our platform</li>
                  <li>Monitor and analyze usage patterns</li>
                  <li>Detect and prevent fraudulent activities</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Data Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These include:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Encryption of sensitive data in transit and at rest</li>
                  <li>Regular security assessments and penetration testing</li>
                  <li>Access controls and authentication mechanisms</li>
                  <li>Employee training on data protection practices</li>
                  <li>Secure data storage and backup procedures</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. Data Sharing and Disclosure</CardTitle>
              </CardHeader>
              <CardContent>
                <p>We do not sell, rent, or trade your personal information. We may share your information only with:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Service providers who perform services on our behalf</li>
                  <li>Business partners with your explicit consent</li>
                  <li>Legal authorities when required by law</li>
                  <li>In connection with a business transfer or merger</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. Your Rights</CardTitle>
              </CardHeader>
              <CardContent>
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Request deletion of your data</li>
                  <li>Object to or restrict processing</li>
                  <li>Request data portability</li>
                  <li>Withdraw consent where applicable</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. International Data Transfers</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place for international data transfers in compliance with applicable data protection laws.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>7. Cookies and Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p>We use cookies and similar tracking technologies to enhance your experience, analyze site traffic, and for security purposes. You can manage your cookie preferences through your browser settings.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>8. Changes to This Policy</CardTitle>
              </CardHeader>
              <CardContent>
                <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>9. Contact Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p>If you have any questions about this Privacy Policy, please contact us at:</p>
                <p className="mt-2">Email: privacy@edusaas.com</p>
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