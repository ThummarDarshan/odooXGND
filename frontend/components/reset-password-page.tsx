"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Shield, KeyRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GradientBackground } from "./gradient-background"
import { AnimatedDots } from "./animated-dots"
import { useSearchParams, useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Logo } from "@/components/ui/logo"
import axios from 'axios'

export function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  const email = searchParams.get('email') || ''
  const otp = searchParams.get('otp') || ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  const passwordStrength = getPasswordStrength(newPassword)
  const passwordsMatch = newPassword === confirmPassword && confirmPassword !== ""

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setError('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      toast({
        title: "Password Mismatch",
        description: "The passwords you entered do not match.",
        variant: "destructive",
      })
      return
    }

    if (passwordStrength < 3) {
      setError('Password is too weak. Please choose a stronger password.')
      toast({
        title: "Weak Password",
        description: "Please choose a stronger password with at least 8 characters, including uppercase, lowercase, numbers, and special characters.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await axios.post('http://localhost:5001/api/auth/reset-password', {
        email,
        otp,
        newPassword,
      })
      
      setMessage('Password reset successful!')
      toast({
        title: "Password Reset Successful!",
        description: "Your password has been updated. Redirecting to login...",
      })
      
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password')
      toast({
        title: "Reset Failed",
        description: err.response?.data?.error || 'Failed to reset password',
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
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
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center shadow-2xl">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-600 animate-pulse opacity-20"></div>
              </div>
            </div>
                          <a href="/" className="hover:opacity-80 transition-opacity duration-300">
                <Logo size="lg" />
              </a>
            <p className="text-muted-foreground dark:text-slate-400 mt-2">
              Create a new secure password for your account.
            </p>
          </div>

          {/* Reset Password Form */}
          <div className="bg-background/80 dark:bg-slate-800 backdrop-blur-xl rounded-2xl shadow-2xl border border-border dark:border-slate-700 p-8 animate-in fade-in-0 slide-in-from-bottom-8 duration-1000 delay-300">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="newPassword" className="text-slate-700 dark:text-slate-100 font-medium">
                    New Password
                  </Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter your new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10 pr-10 bg-background dark:bg-slate-800 border-border dark:border-slate-700 text-foreground dark:text-slate-100 placeholder:text-muted-foreground dark:placeholder:text-slate-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground dark:text-slate-400 hover:text-muted-foreground transition-colors duration-200"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {newPassword && (
                    <div className="mt-2">
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              level <= passwordStrength
                                ? passwordStrength <= 2
                                  ? "bg-red-500"
                                  : passwordStrength <= 3
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                                : "bg-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        Password strength:{" "}
                        {passwordStrength <= 2 ? "Weak" : passwordStrength <= 3 ? "Medium" : "Strong"}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-slate-100 font-medium">
                    Confirm New Password
                  </Label>
                  <div className="relative mt-2">
                    <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10 bg-background dark:bg-slate-800 border-border dark:border-slate-700 text-foreground dark:text-slate-100 placeholder:text-muted-foreground dark:placeholder:text-slate-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground dark:text-slate-400 hover:text-muted-foreground transition-colors duration-200"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Password Match Indicator */}
                  {confirmPassword && (
                    <div className="flex items-center mt-2 space-x-2">
                      {passwordsMatch ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <p className={`text-xs ${passwordsMatch ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                        {passwordsMatch ? "Passwords match" : "Passwords don't match"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !passwordsMatch || passwordStrength < 3}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Updating password...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                    <span>Update Password</span>
                  </div>
                )}
              </Button>
            </form>

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
                className="text-green-600 hover:text-green-700 font-medium transition-colors duration-200"
              >
                Sign in here
              </a>
            </p>
            <p className="text-xs text-muted-foreground dark:text-slate-400 mt-4">
              Need help?{" "}
              <a href="#" className="text-green-600 hover:text-green-700 transition-colors duration-200">
                Contact support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 