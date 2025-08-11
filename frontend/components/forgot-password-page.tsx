"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft, Mail, Key, Clock, RefreshCw, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GradientBackground } from "./gradient-background"
import { AnimatedDots } from "./animated-dots"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Logo } from "@/components/ui/logo"
import axios from 'axios'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [timer, setTimer] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timer])

  const sendOtp = async () => {
    setMessage('')
    setError('')
    setIsLoading(true)
    
    try {
      const response = await axios.post('http://localhost:5001/api/auth/forgot-password', { email })
      setMessage(response.data.message)
      setOtpSent(true)
      setTimer(60) // 60 seconds timer for resend
      toast({
        title: "OTP Sent!",
        description: "Please check your email for the verification code.",
      })
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong')
      toast({
        title: "Error",
        description: err.response?.data?.error || 'Failed to send OTP',
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const verifyOtp = async () => {
    setMessage('')
    setError('')
    setIsVerifying(true)
    
    try {
      await axios.post('http://localhost:5001/api/auth/verify-otp', { email, otp })
      toast({
        title: "OTP Verified!",
        description: "Redirecting to password reset page...",
      })
      router.push(`/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid OTP')
      toast({
        title: "Verification Failed",
        description: err.response?.data?.error || 'Invalid OTP',
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendOtp = async () => {
    if (timer > 0) return
    await sendOtp()
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-background dark:bg-slate-900">
      <GradientBackground />
      <AnimatedDots />

      {/* Back to Home Button */}
      <div className="absolute top-6 left-6 z-20">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground hover:bg-background/80 backdrop-blur-sm transition-all duration-300"
          asChild
        >
          <a href="/" className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </a>
        </Button>
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8 animate-in fade-in-0 slide-in-from-top-4 duration-1000">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-2xl">
                  <Key className="h-8 w-8 text-white" />
                </div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 animate-pulse opacity-20"></div>
              </div>
            </div>
                          <a href="/" className="hover:opacity-80 transition-opacity duration-300">
                <Logo size="lg" />
              </a>
            <p className="text-muted-foreground dark:text-slate-400 mt-2">
              {!otpSent 
                ? "Forgot your password? No worries, we'll help you reset it."
                : "Enter the verification code sent to your email."
              }
            </p>
          </div>

          {/* Forgot Password Form */}
          <div className="bg-background/80 dark:bg-slate-800 backdrop-blur-xl rounded-2xl shadow-2xl border border-border dark:border-slate-700 p-8 animate-in fade-in-0 slide-in-from-bottom-8 duration-1000 delay-300">
            {!otpSent ? (
              // Email Input Section
              <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
                <div>
                  <Label htmlFor="email" className="text-slate-700 dark:text-slate-100 font-medium">
                    Email Address
                  </Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-background dark:bg-slate-800 border-border dark:border-slate-700 text-foreground dark:text-slate-100 placeholder:text-muted-foreground dark:placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                <Button
                  onClick={sendOtp}
                  disabled={!email || isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending OTP...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                      <span>Send Verification Code</span>
                    </div>
                  )}
                </Button>
              </div>
            ) : (
              // OTP Verification Section
              <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground dark:text-slate-400">
                    We've sent a verification code to
                  </p>
                  <p className="font-medium text-foreground dark:text-slate-100">
                    {email}
                  </p>
                </div>

                <div>
                  <Label htmlFor="otp" className="text-slate-700 dark:text-slate-100 font-medium">
                    Verification Code
                  </Label>
                  <div className="relative mt-2">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="pl-10 bg-background dark:bg-slate-800 border-border dark:border-slate-700 text-foreground dark:text-slate-100 placeholder:text-muted-foreground dark:placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-center text-lg tracking-widest"
                      maxLength={6}
                      required
                    />
                  </div>
                </div>

                <Button
                  onClick={verifyOtp}
                  disabled={!otp || otp.length < 6 || isVerifying}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerifying ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                      <span>Verify Code</span>
                    </div>
                  )}
                </Button>

                {/* Resend OTP Section */}
                <div className="text-center">
                  {timer > 0 ? (
                    <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground dark:text-slate-400">
                      <Clock className="h-4 w-4" />
                      <span>Resend code in {timer}s</span>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      onClick={handleResendOtp}
                      className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Resend Code
                    </Button>
                  )}
                </div>

                {/* Change Email Option */}
                <div className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setOtpSent(false)
                      setOtp('')
                      setTimer(0)
                      setMessage('')
                      setError('')
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    Use different email
                  </Button>
                </div>
              </div>
            )}

            {/* Status Messages */}
            {message && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg animate-in fade-in-0 slide-in-from-top-2 duration-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <p className="text-sm text-green-700 dark:text-green-300">{message}</p>
                </div>
              </div>
            )}
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-in fade-in-0 slide-in-from-top-2 duration-300">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-1000 delay-700">
            <p className="text-muted-foreground dark:text-slate-400">
              Remember your password?{" "}
              <a
                href="/login"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
              >
                Sign in here
              </a>
            </p>
            <p className="text-xs text-muted-foreground dark:text-slate-400 mt-4">
              Need help?{" "}
              <a href="#" className="text-blue-600 hover:text-blue-700 transition-colors duration-200">
                Contact support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 