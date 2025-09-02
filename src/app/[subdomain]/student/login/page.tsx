"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Eye, 
  EyeOff, 
  User, 
  Lock, 
  GraduationCap, 
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Mail,
  Phone,
  BookOpen,
  Globe,
  Target,
  Calendar,
  FileText,
  MessageSquare,
  Bell,
  CreditCard,
  Users,
  Settings,
  Upload
} from "lucide-react"

interface LoginFormData {
  email: string
  password: string
  rememberMe: boolean
  deviceInfo: {
    userAgent?: string
    deviceType?: 'desktop' | 'mobile' | 'tablet'
    browser?: string
  }
}

export default function StudentLoginPage() {
  const params = useParams()
  const router = useRouter()
  const subdomain = params.subdomain as string
  
  // Helper functions for device detection
  const getDeviceType = (): 'desktop' | 'mobile' | 'tablet' => {
    if (typeof navigator === 'undefined') return 'desktop'
    
    const userAgent = navigator.userAgent
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet'
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'mobile'
    }
    return 'desktop'
  }

  const getBrowser = (): string => {
    if (typeof navigator === 'undefined') return 'unknown'
    
    const userAgent = navigator.userAgent
    if (userAgent.indexOf("Chrome") > -1) return "Chrome"
    if (userAgent.indexOf("Safari") > -1) return "Safari"
    if (userAgent.indexOf("Firefox") > -1) return "Firefox"
    if (userAgent.indexOf("Edge") > -1) return "Edge"
    if (userAgent.indexOf("Opera") > -1) return "Opera"
    return "unknown"
  }

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false,
    deviceInfo: {
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      deviceType: getDeviceType(),
      browser: getBrowser()
    }
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [showDemoInfo, setShowDemoInfo] = useState(false)
  const [twoFactorRequired, setTwoFactorRequired] = useState(false)
  const [twoFactorCode, setTwoFactorCode] = useState("")
  const [showResend, setShowResend] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [lockTimer, setLockTimer] = useState(0)

  const updateFormData = (field: keyof LoginFormData, value: string | boolean) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: value 
    }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if account is locked
    if (isLocked) {
      setError(`Account temporarily locked. Try again in ${lockTimer} seconds.`)
      return
    }
    
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/${subdomain}/student/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          security: {
            loginAttempts,
            deviceInfo: formData.deviceInfo
          }
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        // Increment login attempts on failure
        const newAttempts = loginAttempts + 1
        setLoginAttempts(newAttempts)
        
        // Lock account after 5 failed attempts
        if (newAttempts >= 5) {
          setIsLocked(true)
          setLockTimer(300) // 5 minutes lock
          startLockTimer()
        }
        
        throw new Error(result.error || 'Login failed')
      }

      // Check if 2FA is required
      if (result.security?.requiresTwoFactor) {
        setTwoFactorRequired(true)
        startResendTimer()
        return
      }

      // Reset login attempts on success
      setLoginAttempts(0)
      
      // Store authentication data
      localStorage.setItem('studentToken', result.token)
      localStorage.setItem('studentId', result.student.id)
      localStorage.setItem('studentEmail', result.student.email)
      localStorage.setItem('studentName', `${result.student.firstName} ${result.student.lastName}`)
      localStorage.setItem('agencyId', result.agency.id)
      localStorage.setItem('agencyName', result.agency.name)
      localStorage.setItem('sessionId', result.sessionId)
      localStorage.setItem('securityInfo', JSON.stringify(result.security))
      localStorage.setItem('lastLogin', new Date().toISOString())

      setSuccess(true)
      
      // Redirect to student portal
      setTimeout(() => {
        router.push(`/${subdomain}/student/portal`)
      }, 1500)

    } catch (error) {
      setError(error instanceof Error ? error.message : "Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const startLockTimer = () => {
    const timer = setInterval(() => {
      setLockTimer(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          setIsLocked(false)
          setLoginAttempts(0)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const startResendTimer = () => {
    setShowResend(false)
    setResendTimer(60)
    
    const timer = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          setShowResend(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleTwoFactorSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/${subdomain}/student/auth/verify-2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('studentToken')}`
        },
        body: JSON.stringify({
          code: twoFactorCode,
          sessionId: localStorage.getItem('sessionId')
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '2FA verification failed')
      }

      // Store final authentication data
      localStorage.setItem('twoFactorVerified', 'true')
      localStorage.setItem('authCompleteTime', new Date().toISOString())

      setSuccess(true)
      
      // Redirect to student portal
      setTimeout(() => {
        router.push(`/${subdomain}/student/portal`)
      }, 1500)

    } catch (error) {
      setError(error instanceof Error ? error.message : "2FA verification failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    try {
      const response = await fetch(`/api/${subdomain}/student/auth/resend-2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('studentToken')}`
        },
        body: JSON.stringify({
          sessionId: localStorage.getItem('sessionId')
        }),
      })

      if (response.ok) {
        startResendTimer()
        // Show success message
        setError("")
      }
    } catch (error) {
      setError("Failed to resend code. Please try again.")
    }
  }

  const handleDemoLogin = (demoEmail: string, demoPassword: string) => {
    updateFormData('email', demoEmail)
    updateFormData('password', demoPassword)
    
    // Auto-submit the form
    setTimeout(() => {
      const form = document.getElementById('loginForm') as HTMLFormElement
      if (form) form.requestSubmit()
    }, 100)
  }

  if (twoFactorRequired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Two-Factor Authentication</CardTitle>
            <CardDescription>
              Enter the verification code sent to your email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTwoFactorSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="twoFactorCode">Verification Code</Label>
                <Input
                  id="twoFactorCode"
                  type="text"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || twoFactorCode.length !== 6}>
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify Code
                    <CheckCircle className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="text-center">
                {showResend ? (
                  <Button
                    type="button"
                    variant="link"
                    onClick={handleResendCode}
                    className="text-sm"
                  >
                    Resend Code
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Resend code in {resendTimer} seconds
                  </p>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Login Successful!</h2>
            <p className="text-muted-foreground mb-4">
              Welcome back! Redirecting to your student portal...
            </p>
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="text-primary-foreground h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Student Portal</h1>
                <p className="text-sm text-muted-foreground">{subdomain}.eduagency.com</p>
              </div>
            </div>
            <Button variant="ghost" onClick={() => router.push(`/${subdomain}/student/register`)}>
              Create Account
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* Login Form */}
          <div>
            <Card className="w-full max-w-md mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Welcome Back</CardTitle>
                <CardDescription>
                  Sign in to your student portal to track your applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form id="loginForm" onSubmit={handleLogin} className="space-y-4">
                  {isLocked && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Account temporarily locked due to too many failed attempts. 
                        Please try again in {lockTimer} seconds.
                      </AlertDescription>
                    </Alert>
                  )}

                  {error && !isLocked && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        placeholder="your.email@example.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => updateFormData('password', e.target.value)}
                        placeholder="Enter your password"
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="rememberMe"
                        checked={formData.rememberMe}
                        onCheckedChange={(checked) => updateFormData('rememberMe', checked as boolean)}
                      />
                      <Label htmlFor="rememberMe" className="text-sm">Remember me</Label>
                    </div>
                    <Button variant="link" className="text-sm p-0 h-auto">
                      Forgot password?
                    </Button>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading || isLocked}>
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Signing in...
                      </>
                    ) : isLocked ? (
                      <>
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Account Locked
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>

                {/* Demo Accounts */}
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">Demo Accounts</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDemoInfo(!showDemoInfo)}
                    >
                      {showDemoInfo ? "Hide" : "Show"}
                    </Button>
                  </div>
                  
                  {showDemoInfo && (
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground mb-2">
                        Quick access to explore the student portal:
                      </div>
                      
                      <div className="grid gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="justify-start text-xs h-auto p-2"
                          onClick={() => handleDemoLogin('alex.thompson@demo.com', 'demo123')}
                        >
                          <div className="flex-1">
                            <div className="font-medium">Alex Thompson</div>
                            <div className="text-muted-foreground">Applied Student</div>
                          </div>
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="justify-start text-xs h-auto p-2"
                          onClick={() => handleDemoLogin('maria.garcia@demo.com', 'demo123')}
                        >
                          <div className="flex-1">
                            <div className="font-medium">Maria Garcia</div>
                            <div className="text-muted-foreground">Accepted Student</div>
                          </div>
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="justify-start text-xs h-auto p-2"
                          onClick={() => handleDemoLogin('james.wilson@demo.com', 'demo123')}
                        >
                          <div className="flex-1">
                            <div className="font-medium">James Wilson</div>
                            <div className="text-muted-foreground">Enrolled Student</div>
                          </div>
                        </Button>
                      </div>
                      
                      <div className="text-xs text-muted-foreground mt-2">
                        Password for all demo accounts: <code className="bg-muted px-1 rounded">demo123</code>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features Overview */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Student Portal Features</h2>
              <p className="text-muted-foreground">
                Access all your study abroad application tools in one place
              </p>
            </div>

            <div className="grid gap-4">
              <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                <FileText className="h-6 w-6 text-blue-500 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Application Tracking</h3>
                  <p className="text-sm text-muted-foreground">
                    Real-time status updates on all your university applications
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                <Upload className="h-6 w-6 text-green-500 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Document Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Secure upload and tracking of all required documents
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                <MessageSquare className="h-6 w-6 text-purple-500 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Consultant Communication</h3>
                  <p className="text-sm text-muted-foreground">
                    Direct messaging with your education consultants
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                <CreditCard className="h-6 w-6 text-orange-500 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Payment Processing</h3>
                  <p className="text-sm text-muted-foreground">
                    Secure payment tracking and invoice management
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                <Calendar className="h-6 w-6 text-red-500 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Appointment Scheduling</h3>
                  <p className="text-sm text-muted-foreground">
                    Schedule meetings and track important deadlines
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                <Bell className="h-6 w-6 text-indigo-500 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Smart Notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    Get notified about application updates and deadlines
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}