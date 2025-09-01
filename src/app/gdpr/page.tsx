import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"

export default function GDPRPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-4">
              GDPR Compliance
            </Badge>
            <h1 className="text-4xl font-bold mb-4">
              GDPR Compliance Statement
            </h1>
            <p className="text-lg text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>1. Introduction</CardTitle>
              </CardHeader>
              <CardContent>
                <p>EduSaaS is committed to protecting the privacy and security of personal data in compliance with the General Data Protection Regulation (GDPR) and other applicable data protection laws.</p>
                <p className="mt-2">This GDPR Compliance Statement explains how we handle personal data and the rights you have under GDPR.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Data Controller</CardTitle>
              </CardHeader>
              <CardContent>
                <p>EduSaaS acts as the data controller for personal data processed through our platform. We are responsible for determining the purposes and means of processing personal data.</p>
                <p className="mt-2"><strong>Contact Information:</strong></p>
                <p>Email: dpo@edusaas.com</p>
                <p>Address: San Francisco, CA</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Lawful Basis for Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <p>We process personal data only when we have a lawful basis to do so. The lawful bases we rely on include:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li><strong>Consent:</strong> You have given clear consent for us to process your personal data</li>
                  <li><strong>Contract:</strong> Processing is necessary for the performance of a contract with you</li>
                  <li><strong>Legal obligation:</strong> Processing is necessary to comply with legal obligations</li>
                  <li><strong>Legitimate interests:</strong> Processing is necessary for our legitimate interests</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. Data Subject Rights</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Under GDPR, you have the following rights regarding your personal data:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li><strong>Right to be informed:</strong> You have the right to be informed about how we use your data</li>
                  <li><strong>Right of access:</strong> You can request a copy of your personal data</li>
                  <li><strong>Right to rectification:</strong> You can request correction of inaccurate data</li>
                  <li><strong>Right to erasure:</strong> You can request deletion of your data</li>
                  <li><strong>Right to restrict processing:</strong> You can limit how we use your data</li>
                  <li><strong>Right to data portability:</strong> You can request your data in a machine-readable format</li>
                  <li><strong>Right to object:</strong> You can object to certain types of processing</li>
                  <li><strong>Rights related to automated decision-making:</strong> You have rights regarding automated profiling</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. Data Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p>We implement appropriate technical and organizational measures to ensure a level of security appropriate to the risk, including:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Encryption of personal data</li>
                  <li>Pseudonymization and anonymization</li>
                  <li>Regular security testing and assessments</li>
                  <li>Access controls and authentication</li>
                  <li>Employee training on data protection</li>
                  <li>Incident response procedures</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. Data Breach Notification</CardTitle>
              </CardHeader>
              <CardContent>
                <p>In the event of a personal data breach, we will:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Notify the relevant supervisory authority within 72 hours of becoming aware of the breach</li>
                  <li>Communicate with affected individuals without undue delay if the breach poses a high risk to their rights and freedoms</li>
                  <li>Document all data breaches, including facts, effects, and remedial actions taken</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>7. International Data Transfers</CardTitle>
              </CardHeader>
              <CardContent>
                <p>We may transfer personal data to countries outside the European Economic Area (EEA). We ensure that such transfers are conducted in compliance with GDPR requirements by:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Using countries with an adequacy decision</li>
                  <li>Implementing appropriate safeguards (e.g., Standard Contractual Clauses)</li>
                  <li>Applying binding corporate rules for intra-organizational transfers</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>8. Data Protection Officer (DPO)</CardTitle>
              </CardHeader>
              <CardContent>
                <p>We have appointed a Data Protection Officer to oversee our data protection strategy and ensure compliance with GDPR. You can contact our DPO at:</p>
                <p className="mt-2">Email: dpo@edusaas.com</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>9. Data Processing Agreements</CardTitle>
              </CardHeader>
              <CardContent>
                <p>We enter into Data Processing Agreements with all third-party processors who process personal data on our behalf. These agreements ensure that processors:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Process data only on our documented instructions</li>
                  <li>Implement appropriate security measures</li>
                  <li>Assist us in fulfilling our GDPR obligations</li>
                  <li>Delete or return personal data after processing</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>10. Privacy by Design and Default</CardTitle>
              </CardHeader>
              <CardContent>
                <p>We implement privacy by design and default principles by:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Minimizing data collection to what is necessary</li>
                  <li>Implementing privacy features at the design stage</li>
                  <li>Providing privacy-friendly default settings</li>
                  <li>Conducting Data Protection Impact Assessments (DPIAs) for high-risk processing</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>11. Exercising Your Rights</CardTitle>
              </CardHeader>
              <CardContent>
                <p>To exercise your GDPR rights, please contact us at:</p>
                <p className="mt-2">Email: dpo@edusaas.com</p>
                <p>We will respond to your request within one month of receipt, unless the request is complex, in which case we may extend this period by two months.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>12. Complaints</CardTitle>
              </CardHeader>
              <CardContent>
                <p>If you believe we have not complied with your data protection rights, you have the right to lodge a complaint with a supervisory authority. You can contact the Information Commissioner's Office (ICO) or your local data protection authority.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>13. Updates to This Statement</CardTitle>
              </CardHeader>
              <CardContent>
                <p>We may update this GDPR Compliance Statement to reflect changes in our practices or applicable law. We will notify you of any material changes.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}