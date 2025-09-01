import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Code, BookOpen, Zap, Shield, Users, CheckCircle } from "lucide-react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import Link from "next/link"

export default function APIPage() {
  const endpoints = [
    {
      method: "GET",
      path: "/api/health",
      description: "Health check endpoint",
      category: "System"
    },
    {
      method: "POST",
      path: "/api/auth/signup",
      description: "Create new account",
      category: "Authentication"
    },
    {
      method: "POST",
      path: "/api/auth/login",
      description: "User authentication",
      category: "Authentication"
    },
    {
      method: "GET",
      path: "/api/[subdomain]/students",
      description: "List students for agency",
      category: "Students"
    },
    {
      method: "POST",
      path: "/api/[subdomain]/students",
      description: "Create new student",
      category: "Students"
    },
    {
      method: "GET",
      path: "/api/[subdomain]/applications",
      description: "List applications",
      category: "Applications"
    },
    {
      method: "POST",
      path: "/api/[subdomain]/communications",
      description: "Send communication",
      category: "Communications"
    }
  ]

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-green-100 text-green-800"
      case "POST":
        return "bg-blue-100 text-blue-800"
      case "PUT":
        return "bg-yellow-100 text-yellow-800"
      case "DELETE":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-4">
              API Documentation
            </Badge>
            <h1 className="text-4xl font-bold mb-4">
              API Reference
            </h1>
            <p className="text-lg text-muted-foreground">
              Comprehensive API documentation for integrating with EduSaaS
            </p>
          </div>

          {/* Quick Start */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Start
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Get started with our API in minutes:</p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Create an account and obtain your API key</li>
                <li>Include your API key in the Authorization header</li>
                <li>Make requests to our endpoints</li>
                <li>Handle responses and implement error handling</li>
              </ol>
            </CardContent>
          </Card>

          {/* Authentication */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Authentication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">All API requests require authentication using an API key:</p>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                Authorization: Bearer your-api-key
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                You can generate and manage your API keys from your account dashboard.
              </p>
            </CardContent>
          </Card>

          {/* API Endpoints */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                API Endpoints
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {endpoints.map((endpoint, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getMethodColor(endpoint.method)}`}>
                        {endpoint.method}
                      </span>
                      <code className="bg-muted px-2 py-1 rounded text-sm">{endpoint.path}</code>
                      <Badge variant="outline">{endpoint.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Rate Limiting */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Rate Limiting</CardTitle>
            </CardHeader>
            <CardContent>
              <p>To ensure fair usage and system stability, we implement rate limiting:</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>100 requests per minute per API key</li>
                <li>10,000 requests per day per API key</li>
                <li>Rate limit headers included in responses</li>
                <li>429 status code for rate limit exceeded</li>
              </ul>
            </CardContent>
          </Card>

          {/* Response Format */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Response Format</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">All API responses follow a consistent JSON format:</p>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                <pre>{`{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2024-01-15T10:30:00Z"
}`}</pre>
              </div>
            </CardContent>
          </Card>

          {/* Error Handling */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Error Handling</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">API errors return appropriate HTTP status codes and detailed error messages:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Common Error Codes</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>400 - Bad Request</li>
                    <li>401 - Unauthorized</li>
                    <li>403 - Forbidden</li>
                    <li>404 - Not Found</li>
                    <li>429 - Too Many Requests</li>
                    <li>500 - Internal Server Error</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Error Response Format</h4>
                  <div className="bg-muted p-3 rounded-lg font-mono text-xs">
                    <pre>{`{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Invalid input data"
  }
}`}</pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SDKs and Libraries */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                SDKs and Libraries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">We provide official SDKs for popular programming languages:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Available SDKs</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>JavaScript/Node.js</li>
                    <li>Python</li>
                    <li>PHP</li>
                    <li>Ruby</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Features</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Easy authentication</li>
                    <li>Type definitions</li>
                    <li>Retry logic</li>
                    <li>Comprehensive documentation</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                API Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Need help with our API? We're here to assist:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Resources</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Comprehensive documentation</li>
                    <li>Code examples and tutorials</li>
                    <li>API reference guide</li>
                    <li>Community forum</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Contact</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Email: api-support@edusaas.com</li>
                    <li>Developer Slack channel</li>
                    <li>Priority support for Enterprise</li>
                    <li>24/7 emergency support</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}