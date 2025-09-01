"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  Building2,
  AlertCircle,
  CheckCircle,
  Loader2,
  Chrome,
  Github,
  Twitter
} from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    subdomain: ""
  })
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("email")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // For demo purposes, accept any email/password combination
      if (loginForm.email && loginForm.password) {
        // Store a simple token in localStorage
        localStorage.setItem('authToken', 'demo-token-' + Date.now())
        localStorage.setItem('userEmail', loginForm.email)
        localStorage.setItem('userSubdomain', loginForm.subdomain || 'demo')
        
        // Redirect to the subdomain dashboard
        const subdomain = loginForm.subdomain || 'demo'
        router.push(`/${subdomain}/dashboard`)
      } else {
        setError("Please fill in all required fields")
      }
    } catch (err) {
      setError("Login failed. Please check your credentials.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSSOLogin = (provider: string) => {
    setIsLoading(true)
    // Simulate SSO login
    setTimeout(() => {
      localStorage.setItem('authToken', 'sso-token-' + Date.now())
      localStorage.setItem('userEmail', `user@${provider}.com`)
      localStorage.setItem('userSubdomain', 'demo')
      router.push('/demo/dashboard')
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-bold text-2xl">EA</span>
          </div>
          <h1 className="text-2xl font-bold">EduAgency Portal</h1>
          <p className="text-muted-foreground">Sign in to your agency dashboard</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              Enter your credentials to access your agency portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email">Email Login</TabsTrigger>
                <TabsTrigger value="sso">SSO Login</TabsTrigger>
              </TabsList>

              <TabsContent value="email" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="subdomain">Agency Subdomain</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="subdomain"
                        type="text"
                        placeholder="your-agency"
                        value={loginForm.subdomain}
                        onChange={(e) => setLoginForm({...loginForm, subdomain: e.target.value})}
                        className="pl-10"
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Your agency subdomain (e.g., your-agency.eduagency.com)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@agency.com"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Remember me</span>
                    </label>
                    <Button variant="link" className="text-sm p-0 h-auto">
                      Forgot password?
                    </Button>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="sso" className="space-y-4">
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleSSOLogin('google')}
                    disabled={isLoading}
                  >
                    <Chrome className="w-4 h-4 mr-2" />
                    Continue with Google
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleSSOLogin('github')}
                    disabled={isLoading}
                  >
                    <Github className="w-4 h-4 mr-2" />
                    Continue with GitHub
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleSSOLogin('microsoft')}
                    disabled={isLoading}
                  >
                    <div className="w-4 h-4 mr-2 flex items-center justify-center">
                      <span className="text-xs font-bold">MS</span>
                    </div>
                    Continue with Microsoft
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 pt-6 border-t">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an agency account?{" "}
                  <Button variant="link" className="text-sm p-0 h-auto" onClick={() => router.push('/signup')}>
                    Sign up here
                  </Button>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials Notice */}
        <div className="mt-6 text-center">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Demo Mode:</strong> Any email/password combination will work for testing.
              Use a subdomain like "demo" to access the dashboard.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  )
}