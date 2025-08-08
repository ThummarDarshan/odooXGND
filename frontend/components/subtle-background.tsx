"use client"

import { useEffect, useRef } from "react"

interface GradientOrb {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
  opacity: number
  pulsePhase: number
}

export function SubtleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const orbsRef = useRef<GradientOrb[]>([])
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    // Subtle, professional colors
    const colors = [
      "#1e293b", // slate-800
      "#334155", // slate-700
      "#475569", // slate-600
      "#64748b", // slate-500
    ]

    // Initialize gentle floating orbs
    const initOrbs = () => {
      orbsRef.current = Array.from({ length: 4 }, (_, i) => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        radius: Math.random() * 200 + 150,
        color: colors[i % colors.length],
        opacity: 0.03 + Math.random() * 0.02,
        pulsePhase: Math.random() * Math.PI * 2,
      }))
    }

    // Draw soft gradient orb
    const drawOrb = (orb: GradientOrb) => {
      const pulseRadius = orb.radius + Math.sin(orb.pulsePhase) * 20
      const pulseOpacity = orb.opacity + Math.sin(orb.pulsePhase) * 0.01

      ctx.save()
      ctx.globalAlpha = pulseOpacity

      // Create very soft radial gradient
      const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, pulseRadius)
      gradient.addColorStop(0, `${orb.color}40`)
      gradient.addColorStop(0.4, `${orb.color}20`)
      gradient.addColorStop(0.8, `${orb.color}10`)
      gradient.addColorStop(1, `${orb.color}00`)

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(orb.x, orb.y, pulseRadius, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    }

    // Update orbs with very gentle movement
    const updateOrbs = () => {
      orbsRef.current.forEach((orb) => {
        orb.x += orb.vx
        orb.y += orb.vy
        orb.pulsePhase += 0.005

        // Gentle bounce off edges
        if (orb.x <= 0 || orb.x >= canvas.width) orb.vx *= -1
        if (orb.y <= 0 || orb.y >= canvas.height) orb.vy *= -1

        // Keep within bounds
        orb.x = Math.max(0, Math.min(canvas.width, orb.x))
        orb.y = Math.max(0, Math.min(canvas.height, orb.y))
      })
    }

    // Main animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      updateOrbs()
      orbsRef.current.forEach(drawOrb)

      animationRef.current = requestAnimationFrame(animate)
    }

    const handleResize = () => {
      resizeCanvas()
      initOrbs()
    }

    resizeCanvas()
    initOrbs()
    animate()

    window.addEventListener("resize", handleResize)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
}
