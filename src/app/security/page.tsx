import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Lock, Server, Users, AlertTriangle, CheckCircle } from "lucide-react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-4">
              Security
            </Badge>
            <h1 className="text-4xl font-bold mb-4">
              Security & Compliance
            </h1>
            <p className="text-lg text-muted-foreground">
              Learn how we protect your data and ensure platform security
            </p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Our Security Commitment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>At EduSaaS, security is our top priority. We implement industry-leading security measures to protect your data and ensure the integrity of our platform. Our security program is designed to meet the highest standards of data protection and regulatory compliance.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Data Protection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Encryption</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>All data is encrypted in transit using TLS 1.3</li>
                    <li>Sensitive data is encrypted at rest using AES-256</li>
                    <li>End-to-end encryption for sensitive communications</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Access Controls</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Multi-factor authentication (MFA) for all users</li>
                    <li>Role-based access control (RBAC) system</li>
                    <li>Regular access reviews and permissions audits</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Data Storage</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Secure data centers with 24/7 monitoring</li>
                    <li>Regular backups with point-in-time recovery</li>
                    <li>Geographic redundancy for high availability</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Infrastructure Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Network Security</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Firewalls and intrusion detection systems</li>
                    <li>DDoS protection and mitigation</li>
                    <li>Network segmentation and isolation</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Application Security</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Regular security assessments and penetration testing</li>
                    <li>Secure coding practices and code reviews</li>
                    <li>Vulnerability scanning and management</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Monitoring & Detection</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>24/7 security monitoring and alerting</li>
                    <li>Automated threat detection</li>
                    <li>Security information and event management (SIEM)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Compliance & Certifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>We maintain compliance with major security and privacy regulations:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li><strong>SOC 2 Type II:</strong> Annual audit of security controls</li>
                  <li><strong>GDPR:</strong> Full compliance with EU data protection regulations</li>
                  <li><strong>CCPA:</strong> California Consumer Privacy Act compliance</li>
                  <li><strong>ISO 27001:</strong> Information Security Management System</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Incident Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>We have a comprehensive incident response program to handle security events:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>24/7 incident response team</li>
                  <li>Regular incident response drills and training</li>
                  <li>Clear communication protocols for incident notification</li>
                  <li>Post-incident reviews and continuous improvement</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">For Your Agency</h4>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Enable MFA for all user accounts</li>
                      <li>Use strong, unique passwords</li>
                      <li>Regular security training for your team</li>
                      <li>Monitor account activity and access logs</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">For Your Students</h4>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Secure data collection and storage</li>
                      <li>Transparent privacy practices</li>
                      <li>Easy data access and deletion requests</li>
                      <li>Clear communication about data usage</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <p>We continuously monitor and update our security measures to protect against emerging threats. Security updates are applied promptly, and we maintain a vulnerability management program to identify and address potential security issues.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Report a Security Issue</CardTitle>
              </CardHeader>
              <CardContent>
                <p>If you discover a security vulnerability, please report it to us immediately. We take all security reports seriously and will investigate promptly.</p>
                <p className="mt-2">Email: security@edusaas.com</p>
                <p>We encourage responsible disclosure and will work with you to address any issues found.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}