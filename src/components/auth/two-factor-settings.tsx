"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QRCodeSVG } from "qrcode.react"
import { 
  Shield, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Loader2,
  Key,
  Copy,
  Download,
  RefreshCw,
  Eye,
  EyeOff
} from "lucide-react"

interface TwoFactorSettingsProps {
  subdomain: string
  onSettingsUpdate?: () => void
}

interface TwoFactorStatus {
  enabled: boolean
  method?: "EMAIL" | "SMS" | "AUTHENTICATOR"
  hasSecret: boolean
  backupCodesCount: number
}

export default function TwoFactorSettings({ subdomain, onSettingsUpdate }: TwoFactorSettingsProps) {
  const [twoFactorStatus, setTwoFactorStatus] = useState<TwoFactorStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [password, setPassword] = useState("")
  const [selectedMethod, setSelectedMethod] = useState<"EMAIL" | "SMS" | "AUTHENTICATOR" | null>(null)
  const [setupData, setSetupData] = useState<{
    secret?: string
    backupCodes?: string[]
    qrCodeUrl?: string
  } | null>(null)
  const [showBackupCodes, setShowBackupCodes] = useState(false)

  useEffect(() => {
    checkTwoFactorStatus()
  }, [])

  const checkTwoFactorStatus = async () => {
    try {
      const token = localStorage.getItem('studentToken')
      const response = await fetch(`/api/${subdomain}/student/auth/2fa`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setTwoFactorStatus(data.twoFactor)
      }
    } catch (error) {
      console.error("Error checking 2FA status:", error)
    }
  }

  const handleEnable2FA = async (method: "EMAIL" | "SMS" | "AUTHENTICATOR") => {
    if (!password) {
      setError("Password is required to enable 2FA")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem('studentToken')
      const response = await fetch(`/api/${subdomain}/student/auth/2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: "enable_2fa",
          method,
          password
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to enable 2FA")
      }

      setSetupData({
        secret: result.secret,
        backupCodes: result.backupCodes,
        qrCodeUrl: method === "AUTHENTICATOR" ? generateQRCodeUrl(result.secret) : undefined
      })

      setSuccess("2FA enabled successfully!")
      setPassword("")
      await checkTwoFactorStatus()

      if (onSettingsUpdate) {
        onSettingsUpdate()
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to enable 2FA"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisable2FA = async () => {
    if (!password) {
      setError("Password is required to disable 2FA")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const token = localStorage.getItem('studentToken')
      const response = await fetch(`/api/${subdomain}/student/auth/2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: "disable_2fa",
          password
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to disable 2FA")
      }

      setSuccess("2FA disabled successfully!")
      setPassword("")
      setSetupData(null)
      await checkTwoFactorStatus()

      if (onSettingsUpdate) {
        onSettingsUpdate()
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to disable 2FA"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegenerateBackupCodes = async () => {
    if (!password) {
      setError("Password is required to regenerate backup codes")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const token = localStorage.getItem('studentToken')
      const response = await fetch(`/api/${subdomain}/student/auth/2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: "regenerate_backup_codes",
          password
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to regenerate backup codes")
      }

      setSetupData({
        ...setupData,
        backupCodes: result.backupCodes
      })

      setSuccess("Backup codes regenerated successfully!")
      setPassword("")
      await checkTwoFactorStatus()

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to regenerate backup codes"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const generateQRCodeUrl = (secret: string): string => {
    // In a real implementation, you would generate a proper TOTP URI
    // For demo purposes, we'll use a simple format
    const email = localStorage.getItem('studentEmail') || 'user@example.com'
    return `otpauth://totp/${email}?secret=${secret}&issuer=StudentPortal`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setSuccess("Copied to clipboard!")
    setTimeout(() => setSuccess(""), 2000)
  }

  const downloadBackupCodes = () => {
    if (!setupData?.backupCodes) return

    const content = setupData.backupCodes.join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'backup-codes.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const MethodCard = ({ 
    method, 
    icon: Icon, 
    title, 
    description 
  }: {
    method: "EMAIL" | "SMS" | "AUTHENTICATOR"
    icon: any
    title: string
    description: string
  }) => {
    const isSelected = selectedMethod === method
    const isEnabled = twoFactorStatus?.enabled && twoFactorStatus?.method === method

    return (
      <Card className={`transition-all cursor-pointer ${
        isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'
      } ${isEnabled ? 'border-green-200 bg-green-50' : ''}`}
        onClick={() => setSelectedMethod(method)}>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-lg flex items-center justify-center gap-2">
            {title}
            {isEnabled && <CheckCircle className="w-5 h-5 text-green-600" />}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {isSelected && (
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-sm"
              />
              <Button
                onClick={() => handleEnable2FA(method)}
                disabled={!password || isLoading}
                className="w-full"
                size="sm"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Key className="w-4 h-4 mr-2" />
                )}
                Enable {title}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  if (!twoFactorStatus) {
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
        <h3 className="text-lg font-semibold">Two-Factor Authentication</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Add an extra layer of security to your account
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

      <Tabs defaultValue="status" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="setup">Setup</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Current Status
                <Badge variant={twoFactorStatus.enabled ? "default" : "secondary"}>
                  {twoFactorStatus.enabled ? "Enabled" : "Disabled"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {twoFactorStatus.enabled ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Method:</span>
                    <Badge variant="outline">{twoFactorStatus.method}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Backup Codes:</span>
                    <span className="text-sm">{twoFactorStatus.backupCodesCount} remaining</span>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => setShowBackupCodes(!showBackupCodes)}
                      variant="outline"
                      size="sm"
                    >
                      {showBackupCodes ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                      {showBackupCodes ? "Hide" : "Show"} Codes
                    </Button>
                    <Button
                      onClick={handleRegenerateBackupCodes}
                      variant="outline"
                      size="sm"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate
                    </Button>
                  </div>

                  {showBackupCodes && setupData?.backupCodes && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Backup Codes:</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {setupData.backupCodes.map((code, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                              {code}
                            </code>
                            <Button
                              onClick={() => copyToClipboard(code)}
                              variant="ghost"
                              size="sm"
                              className="p-1 h-auto"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Button
                        onClick={downloadBackupCodes}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download All Codes
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Two-factor authentication is currently disabled. Enable it to add an extra layer of security to your account.
                </p>
              )}
            </CardContent>
          </Card>

          {twoFactorStatus.enabled && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <XCircle className="w-5 h-5" />
                  Disable 2FA
                </CardTitle>
                <CardDescription>
                  Disabling 2FA will make your account less secure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  type="password"
                  placeholder="Enter your password to disable 2FA"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  onClick={handleDisable2FA}
                  disabled={!password || isLoading}
                  variant="destructive"
                  className="w-full"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-2" />
                  )}
                  Disable Two-Factor Authentication
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="setup" className="space-y-4">
          {!twoFactorStatus.enabled ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Choose a method to enable two-factor authentication:
              </p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <MethodCard
                  method="EMAIL"
                  icon={Mail}
                  title="Email"
                  description="Receive codes via email"
                />
                
                <MethodCard
                  method="SMS"
                  icon={MessageSquare}
                  title="SMS"
                  description="Receive codes via text message"
                />
                
                <MethodCard
                  method="AUTHENTICATOR"
                  icon={Smartphone}
                  title="Authenticator App"
                  description="Use an app like Google Authenticator"
                />
              </div>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Setup Complete</CardTitle>
                <CardDescription>
                  Two-factor authentication is already enabled. You can manage your settings or disable it from the Status tab.
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {setupData && (
            <Card>
              <CardHeader>
                <CardTitle>Setup Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {setupData.qrCodeUrl && (
                  <div className="text-center">
                    <Label className="text-sm font-medium">Scan this QR code with your authenticator app:</Label>
                    <div className="flex justify-center mt-2">
                      <QRCodeSVG value={setupData.qrCodeUrl} size={200} />
                    </div>
                  </div>
                )}

                {setupData.secret && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Or enter this secret manually:</Label>
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-3 py-2 rounded text-sm font-mono flex-1">
                        {setupData.secret}
                      </code>
                      <Button
                        onClick={() => copyToClipboard(setupData.secret!)}
                        variant="outline"
                        size="sm"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {setupData.backupCodes && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Your backup codes:</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {setupData.backupCodes.map((code, index) => (
                        <code key={index} className="bg-muted px-2 py-1 rounded text-sm font-mono text-center">
                          {code}
                        </code>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Save these codes in a safe place. You can use them to access your account if you lose your authentication method.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}