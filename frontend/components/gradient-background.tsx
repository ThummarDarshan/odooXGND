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
  pulseSpeed: number
}

export function GradientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const orbsRef = useRef<GradientOrb[]>([])
  const animationRef = useRef<number>()
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    // Professional gradient colors
    const colors = [
      "#3b82f6", // blue-500
      "#6366f1", // indigo-500
      "#8b5cf6", // violet-500
      "#06b6d4", // cyan-500
      "#10b981", // emerald-500
    ]

    // Initialize floating gradient orbs
    const initOrbs = () => {
      orbsRef.current = Array.from({ length: 6 }, (_, i) => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 150 + 100,
        color: colors[i % colors.length],
        opacity: 0.08 + Math.random() * 0.04,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.01 + Math.random() * 0.01,
      }))
    }

    // Draw gradient orb with smooth blending
    const drawOrb = (orb: GradientOrb) => {
      const pulseRadius = orb.radius + Math.sin(orb.pulsePhase) * 30
      const pulseOpacity = orb.opacity + Math.sin(orb.pulsePhase) * 0.02

      ctx.save()
      ctx.globalAlpha = pulseOpacity

      // Create smooth radial gradient
      const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, pulseRadius)
      gradient.addColorStop(0, `${orb.color}80`)
      gradient.addColorStop(0.3, `${orb.color}40`)
      gradient.addColorStop(0.6, `${orb.color}20`)
      gradient.addColorStop(1, `${orb.color}00`)

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(orb.x, orb.y, pulseRadius, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    }

    // Update orbs with smooth movement
    const updateOrbs = () => {
      orbsRef.current.forEach((orb) => {
        orb.x += orb.vx
        orb.y += orb.vy
        orb.pulsePhase += orb.pulseSpeed

        // Add subtle wave motion
        orb.x += Math.sin(timeRef.current * 0.001 + orb.pulsePhase) * 0.1
        orb.y += Math.cos(timeRef.current * 0.001 + orb.pulsePhase) * 0.1

        // Smooth edge wrapping
        if (orb.x < -orb.radius) orb.x = canvas.width + orb.radius
        if (orb.x > canvas.width + orb.radius) orb.x = -orb.radius
        if (orb.y < -orb.radius) orb.y = canvas.height + orb.radius
        if (orb.y > canvas.height + orb.radius) orb.y = -orb.radius
      })
    }

    // Main animation loop
    const animate = () => {
      timeRef.current += 16

      // Clear canvas
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

  return (
    <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ mixBlendMode: "multiply" }} />
  )
}
