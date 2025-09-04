"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Fingerprint, 
  User, 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Loader2,
  Camera,
  Smartphone,
  Key,
  RefreshCw
} from "lucide-react"

interface BiometricAuthProps {
  subdomain: string
  sessionId?: string
  onAuthSuccess?: (data: any) => void
  onAuthError?: (error: string) => void
  mode?: "login" | "register" | "settings"
}

interface BiometricStatus {
  fingerprint: {
    enabled: boolean
    registered: boolean
    registeredAt?: string
  }
  faceRecognition: {
    enabled: boolean
    registered: boolean
    registeredAt?: string
  }
}

export default function BiometricAuth({ 
  subdomain, 
  sessionId, 
  onAuthSuccess, 
  onAuthError, 
  mode = "login" 
}: BiometricAuthProps) {
  const [biometricStatus, setBiometricStatus] = useState<BiometricStatus | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<"fingerprint" | "face" | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [password, setPassword] = useState("")
  const [showPasswordInput, setShowPasswordInput] = useState(false)

  // Check biometric status on component mount
  useEffect(() => {
    if (mode === "settings") {
      checkBiometricStatus()
    }
  }, [mode])

  const checkBiometricStatus = async () => {
    try {
      const token = localStorage.getItem('studentToken')
      const response = await fetch(`/api/${subdomain}/student/auth/fingerprint`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const fingerprintData = await response.json()
        
        const faceResponse = await fetch(`/api/${subdomain}/student/auth/face`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        const faceData = faceResponse.ok ? await faceResponse.json() : null
        
        setBiometricStatus({
          fingerprint: {
            enabled: fingerprintData.fingerprint?.enabled || false,
            registered: fingerprintData.fingerprint?.registered || false,
            registeredAt: fingerprintData.fingerprint?.registeredAt
          },
          faceRecognition: {
            enabled: faceData?.faceRecognition?.enabled || false,
            registered: faceData?.faceRecognition?.registered || false,
            registeredAt: faceData?.faceRecognition?.registeredAt
          }
        })
      }
    } catch (error) {
      console.error("Error checking biometric status:", error)
    }
  }

  const handleBiometricAuth = async (method: "fingerprint" | "face") => {
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      // Simulate biometric data collection
      const biometricData = await simulateBiometricDataCollection(method)
      
      const endpoint = method === "fingerprint" 
        ? `/api/${subdomain}/student/auth/fingerprint`
        : `/api/${subdomain}/student/auth/face`

      const body: any = {
        action: mode === "register" ? "register" : "verify",
        [`${method}Data`]: biometricData
      }

      if (mode === "register") {
        body.password = password
      }

      if (sessionId) {
        body.sessionId = sessionId
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(mode !== "login" && { 'Authorization': `Bearer ${localStorage.getItem('studentToken')}` })
        },
        body: JSON.stringify(body)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `${method} authentication failed`)
      }

      setSuccess(`${method === "fingerprint" ? "Fingerprint" : "Face recognition"} ${mode === "register" ? "registered" : "verification"} successful!`)
      
      if (onAuthSuccess) {
        onAuthSuccess(result)
      }

      if (mode === "settings") {
        await checkBiometricStatus()
        setShowPasswordInput(false)
        setPassword("")
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `${method} authentication failed`
      setError(errorMessage)
      if (onAuthError) {
        onAuthError(errorMessage)
      }
    } finally {
      setIsLoading(false)
      setSelectedMethod(null)
    }
  }

  const simulateBiometricDataCollection = async (method: "fingerprint" | "face"): Promise<string> => {
    // Simulate the time it takes to collect biometric data
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Generate a unique identifier for the biometric data
    // In a real implementation, this would be actual biometric data
    return `biometric_${method}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const handleDisableBiometric = async (method: "fingerprint" | "face") => {
    if (!password) {
      setError("Password is required to disable biometric authentication")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const endpoint = method === "fingerprint" 
        ? `/api/${subdomain}/student/auth/fingerprint`
        : `/api/${subdomain}/student/auth/face`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('studentToken')}`
        },
        body: JSON.stringify({
          action: "disable",
          password
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `Failed to disable ${method} authentication`)
      }

      setSuccess(`${method === "fingerprint" ? "Fingerprint" : "Face recognition"} authentication disabled successfully`)
      setPassword("")
      await checkBiometricStatus()

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to disable ${method} authentication`
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const BiometricMethodCard = ({ 
    method, 
    icon: Icon, 
    title, 
    description 
  }: {
    method: "fingerprint" | "face"
    icon: any
    title: string
    description: string
  }) => {
    const status = biometricStatus?.[method === "fingerprint" ? "fingerprint" : "faceRecognition"]
    const isAvailable = mode === "login" || (status && status.enabled)
    const isSelected = selectedMethod === method

    if (mode === "settings" && !status?.enabled) {
      return null
    }

    return (
      <Card className={`transition-all cursor-pointer ${
        isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'
      } ${!isAvailable ? 'opacity-50' : ''}`}
        onClick={() => isAvailable && setSelectedMethod(method)}>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {mode === "settings" && status && (
            <div className="space-y-2">
              <Badge variant={status.enabled ? "default" : "secondary"}>
                {status.enabled ? "Enabled" : "Disabled"}
              </Badge>
              {status.registered && (
                <p className="text-xs text-muted-foreground">
                  Registered: {new Date(status.registeredAt!).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
          
          {isSelected && (
            <div className="mt-4 space-y-2">
              {mode === "register" && !showPasswordInput && (
                <Button 
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowPasswordInput(true)
                  }}
                  className="w-full"
                  size="sm"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Enable {title}
                </Button>
              )}
              
              {showPasswordInput && (
                <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleBiometricAuth(method)}
                      disabled={!password || isLoading}
                      className="flex-1"
                      size="sm"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Confirm
                    </Button>
                    <Button
                      onClick={() => {
                        setShowPasswordInput(false)
                        setPassword("")
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              
              {mode === "settings" && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleBiometricAuth(method)}
                    disabled={isLoading}
                    className="flex-1"
                    size="sm"
                    variant="outline"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Re-register
                  </Button>
                  <Button
                    onClick={() => handleDisableBiometric(method)}
                    disabled={isLoading}
                    className="flex-1"
                    size="sm"
                    variant="destructive"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Disable
                  </Button>
                </div>
              )}
              
              {mode === "login" && (
                <Button
                  onClick={() => handleBiometricAuth(method)}
                  disabled={isLoading}
                  className="w-full"
                  size="sm"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                  Authenticate with {title}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  if (mode === "settings" && !biometricStatus) {
    return (
      <div className="flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">
          {mode === "login" && "Biometric Authentication"}
          {mode === "register" && "Enable Biometric Authentication"}
          {mode === "settings" && "Biometric Settings"}
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          {mode === "login" && "Use your biometric data for quick and secure access"}
          {mode === "register" && "Add an extra layer of security with biometric authentication"}
          {mode === "settings" && "Manage your biometric authentication methods"}
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <BiometricMethodCard
          method="fingerprint"
          icon={Fingerprint}
          title="Fingerprint"
          description="Use your fingerprint for quick authentication"
        />
        
        <BiometricMethodCard
          method="face"
          icon={Camera}
          title="Face Recognition"
          description="Use facial recognition for secure access"
        />
      </div>

      {mode === "register" && !biometricStatus?.fingerprint.enabled && !biometricStatus?.faceRecognition.enabled && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            No biometric methods enabled. Click on a method above to set it up.
          </p>
        </div>
      )}

      {mode === "settings" && !biometricStatus?.fingerprint.enabled && !biometricStatus?.faceRecognition.enabled && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            No biometric authentication methods are currently enabled.
          </p>
        </div>
      )}
    </div>
  )
}