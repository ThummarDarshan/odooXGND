"use client"

import { useEffect, useState } from "react"

export function FloatingElements() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-5">
      {/* Floating geometric shapes */}
      <div className="absolute top-20 left-10 w-4 h-4 bg-blue-500/30 rounded-full animate-float animation-delay-0" />
      <div className="absolute top-40 right-20 w-6 h-6 bg-purple-500/30 rotate-45 animate-float animation-delay-1000" />
      <div className="absolute bottom-40 left-20 w-3 h-3 bg-green-500/30 rounded-full animate-float animation-delay-2000" />
      <div className="absolute bottom-60 right-40 w-5 h-5 bg-pink-500/30 rotate-12 animate-float animation-delay-1500" />
      <div className="absolute top-60 left-1/3 w-2 h-2 bg-yellow-500/30 rounded-full animate-float animation-delay-3000" />
      <div className="absolute top-80 right-1/3 w-4 h-4 bg-indigo-500/30 rotate-45 animate-float animation-delay-500" />

      {/* Animated lines */}
      <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent animate-pulse" />
      <div className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent animate-pulse animation-delay-2000" />
    </div>
  )
}
