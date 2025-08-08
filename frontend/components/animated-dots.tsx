"use client"

import { useEffect, useRef } from "react"

interface Dot {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  color: string
  pulsePhase: number
}

export function AnimatedDots() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dotsRef = useRef<Dot[]>([])
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

    const colors = ["#3b82f6", "#6366f1", "#8b5cf6", "#06b6d4"]

    // Initialize floating dots
    const initDots = () => {
      dotsRef.current = Array.from({ length: 20 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 4 + 2,
        opacity: Math.random() * 0.3 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulsePhase: Math.random() * Math.PI * 2,
      }))
    }

    // Draw dot with glow effect
    const drawDot = (dot: Dot) => {
      const pulseSize = dot.size + Math.sin(dot.pulsePhase) * 1
      const pulseOpacity = dot.opacity + Math.sin(dot.pulsePhase) * 0.1

      ctx.save()
      ctx.globalAlpha = pulseOpacity

      // Glow effect
      ctx.shadowBlur = 10
      ctx.shadowColor = dot.color
      ctx.fillStyle = dot.color

      ctx.beginPath()
      ctx.arc(dot.x, dot.y, pulseSize, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    }

    // Update dots
    const updateDots = () => {
      dotsRef.current.forEach((dot) => {
        dot.x += dot.vx
        dot.y += dot.vy
        dot.pulsePhase += 0.02

        // Bounce off edges
        if (dot.x <= 0 || dot.x >= canvas.width) dot.vx *= -1
        if (dot.y <= 0 || dot.y >= canvas.height) dot.vy *= -1

        // Keep within bounds
        dot.x = Math.max(0, Math.min(canvas.width, dot.x))
        dot.y = Math.max(0, Math.min(canvas.height, dot.y))
      })
    }

    // Draw connections between nearby dots
    const drawConnections = () => {
      dotsRef.current.forEach((dot, i) => {
        dotsRef.current.slice(i + 1).forEach((otherDot) => {
          const dx = dot.x - otherDot.x
          const dy = dot.y - otherDot.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 100) {
            ctx.save()
            ctx.globalAlpha = ((100 - distance) / 100) * 0.1
            ctx.strokeStyle = "#6366f1"
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(dot.x, dot.y)
            ctx.lineTo(otherDot.x, otherDot.y)
            ctx.stroke()
            ctx.restore()
          }
        })
      })
    }

    // Main animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      updateDots()
      drawConnections()
      dotsRef.current.forEach(drawDot)

      animationRef.current = requestAnimationFrame(animate)
    }

    const handleResize = () => {
      resizeCanvas()
      initDots()
    }

    resizeCanvas()
    initDots()
    animate()

    window.addEventListener("resize", handleResize)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-60" />
}
