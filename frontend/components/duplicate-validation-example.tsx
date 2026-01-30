"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"

interface DuplicateCheckResult {
  phoneExists?: boolean
  emailExists?: boolean
  hasDuplicates: boolean
}

export function DuplicateValidationExample() {
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DuplicateCheckResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const checkDuplicates = async () => {
    if (!phone && !email) {
      setError("Please enter a phone number or email to check")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/business/check-duplicates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, email }),
      })

      const data = await response.json()

      if (data.ok) {
        setResult(data.duplicates)
      } else {
        setError(data.error || 'Failed to check duplicates')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (exists: boolean) => {
    if (exists) {
      return <XCircle className="h-4 w-4 text-red-500" />
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

  const getStatusText = (exists: boolean) => {
    if (exists) {
      return "Already registered"
    }
    return "Available"
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Duplicate Phone & Email Validation</CardTitle>
        <CardDescription>
          Check if a phone number or email is already registered with another business
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+92-21-34567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="business@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <Button 
          onClick={checkDuplicates} 
          disabled={loading}
          className="w-full"
        >
          {loading ? "Checking..." : "Check for Duplicates"}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <div className="space-y-3">
            <h4 className="font-medium">Validation Results:</h4>
            
            {phone && (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Phone Number</p>
                  <p className="text-sm text-muted-foreground">{phone}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(result.phoneExists || false)}
                  <span className={result.phoneExists ? "text-red-600" : "text-green-600"}>
                    {getStatusText(result.phoneExists || false)}
                  </span>
                </div>
              </div>
            )}

            {email && (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Email Address</p>
                  <p className="text-sm text-muted-foreground">{email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(result.emailExists || false)}
                  <span className={result.emailExists ? "text-red-600" : "text-green-600"}>
                    {getStatusText(result.emailExists || false)}
                  </span>
                </div>
              </div>
            )}

            {result.hasDuplicates && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Some of the provided information is already registered with another business. 
                  Please use different phone number or email.
                </AlertDescription>
              </Alert>
            )}

            {!result.hasDuplicates && (phone || email) && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Great! The provided information is available and can be used for registration.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
