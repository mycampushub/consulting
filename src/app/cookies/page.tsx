import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-4">
              Cookie Policy
            </Badge>
            <h1 className="text-4xl font-bold mb-4">
              Cookie Policy
            </h1>
            <p className="text-lg text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>1. What Are Cookies</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide a better user experience.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. How We Use Cookies</CardTitle>
              </CardHeader>
              <CardContent>
                <p>We use cookies for several purposes:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li><strong>Essential Cookies:</strong> Necessary for the website to function properly</li>
                  <li><strong>Performance Cookies:</strong> Help us understand how visitors interact with our website</li>
                  <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                  <li><strong>Targeting Cookies:</strong> Used to deliver relevant content and advertisements</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Types of Cookies We Use</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold">Essential Cookies</h4>
                  <p>These cookies are necessary for the website to function and cannot be switched off. They include:</p>
                  <ul className="list-disc pl-6 space-y-1 mt-1">
                    <li>Session management and authentication</li>
                    <li>Security and fraud prevention</li>
                    <li>Shopping cart functionality</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold">Performance Cookies</h4>
                  <p>These cookies collect information about how visitors use our website:</p>
                  <ul className="list-disc pl-6 space-y-1 mt-1">
                    <li>Pages visited and time spent on each page</li>
                    <li>Website performance and loading times</li>
                    <li>Error messages and troubleshooting</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold">Functional Cookies</h4>
                  <p>These cookies remember your preferences:</p>
                  <ul className="list-disc pl-6 space-y-1 mt-1">
                    <li>Language and region preferences</li>
                    <li>Theme and display settings</li>
                    <li>Login status and personalization</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. Third-Party Cookies</CardTitle>
              </CardHeader>
              <CardContent>
                <p>We may use third-party services that set cookies on our website, including:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Analytics providers (e.g., Google Analytics)</li>
                  <li>Payment processors</li>
                  <li>Social media platforms</li>
                  <li>Advertising networks</li>
                </ul>
                <p className="mt-2">These third parties have their own privacy policies and cookie policies, which we encourage you to review.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. Managing Cookies</CardTitle>
              </CardHeader>
              <CardContent>
                <p>You can manage your cookie preferences through your browser settings. Most browsers allow you to:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>View the cookies that have been set</li>
                  <li>Delete existing cookies</li>
                  <li>Block cookies from specific websites</li>
                  <li>Block third-party cookies</li>
                  <li>Enable or disable cookies altogether</li>
                </ul>
                <p className="mt-2">Please note that blocking essential cookies may affect the functionality of our website.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. Cookie Duration</CardTitle>
              </CardHeader>
              <CardContent>
                <p>The duration that cookies remain on your device varies:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li><strong>Session cookies:</strong> Deleted when you close your browser</li>
                  <li><strong>Persistent cookies:</strong> Remain on your device for a set period or until you delete them</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>7. Your Choices</CardTitle>
              </CardHeader>
              <CardContent>
                <p>You have the following choices regarding cookies:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Accept or reject cookies through our cookie banner</li>
                  <li>Adjust your browser settings to control cookies</li>
                  <li>Opt out of targeted advertising</li>
                  <li>Clear your browser cache and cookies regularly</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>8. Updates to This Policy</CardTitle>
              </CardHeader>
              <CardContent>
                <p>We may update this Cookie Policy from time to time to reflect changes in technology or regulatory requirements. We will notify you of any material changes by updating the "Last updated" date.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>9. Contact Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p>If you have any questions about this Cookie Policy, please contact us at:</p>
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