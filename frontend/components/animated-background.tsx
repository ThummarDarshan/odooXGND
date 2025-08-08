"use client"

import { useEffect, useRef } from "react"

interface Wave {
  x: number
  y: number
  length: number
  amplitude: number
  frequency: number
  phase: number
  speed: number
  color: string
  opacity: number
}

interface FloatingOrb {
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

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wavesRef = useRef<Wave[]>([])
  const orbsRef = useRef<FloatingOrb[]>([])
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

    // Initialize waves
    const initWaves = () => {
      wavesRef.current = [
        {
          x: 0,
          y: canvas.height * 0.7,
          length: canvas.width,
          amplitude: 50,
          frequency: 0.01,
          phase: 0,
          speed: 0.02,
          color: "#06b6d4",
          opacity: 0.1,
        },
        {
          x: 0,
          y: canvas.height * 0.8,
          length: canvas.width,
          amplitude: 30,
          frequency: 0.015,
          phase: Math.PI,
          speed: 0.015,
          color: "#3b82f6",
          opacity: 0.08,
        },
        {
          x: 0,
          y: canvas.height * 0.6,
          length: canvas.width,
          amplitude: 40,
          frequency: 0.008,
          phase: Math.PI / 2,
          speed: 0.025,
          color: "#8b5cf6",
          opacity: 0.06,
        },
        {
          x: 0,
          y: canvas.height * 0.9,
          length: canvas.width,
          amplitude: 25,
          frequency: 0.02,
          phase: Math.PI * 1.5,
          speed: 0.01,
          color: "#ec4899",
          opacity: 0.05,
        },
      ]
    }

    // Initialize floating orbs
    const initOrbs = () => {
      const colors = ["#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b"]
      orbsRef.current = Array.from({ length: 12 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 60 + 20,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.15 + 0.05,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
      }))
    }

    // Draw wave
    const drawWave = (wave: Wave) => {
      ctx.save()
      ctx.globalAlpha = wave.opacity
      ctx.strokeStyle = wave.color
      ctx.fillStyle = wave.color
      ctx.lineWidth = 2

      // Create gradient
      const gradient = ctx.createLinearGradient(0, wave.y - wave.amplitude, 0, wave.y + wave.amplitude)
      gradient.addColorStop(0, `${wave.color}00`)
      gradient.addColorStop(0.5, `${wave.color}40`)
      gradient.addColorStop(1, `${wave.color}00`)
      ctx.fillStyle = gradient

      ctx.beginPath()
      ctx.moveTo(0, wave.y)

      for (let x = 0; x <= wave.length; x += 2) {
        const y = wave.y + Math.sin(x * wave.frequency + wave.phase) * wave.amplitude
        ctx.lineTo(x, y)
      }

      ctx.lineTo(wave.length, canvas.height)
      ctx.lineTo(0, canvas.height)
      ctx.closePath()
      ctx.fill()

      // Draw wave line
      ctx.beginPath()
      ctx.moveTo(0, wave.y)
      for (let x = 0; x <= wave.length; x += 2) {
        const y = wave.y + Math.sin(x * wave.frequency + wave.phase) * wave.amplitude
        ctx.lineTo(x, y)
      }
      ctx.stroke()

      ctx.restore()
    }

    // Draw floating orb
    const drawOrb = (orb: FloatingOrb) => {
      const pulseRadius = orb.radius + Math.sin(orb.pulsePhase) * 10
      const pulseOpacity = orb.opacity + Math.sin(orb.pulsePhase) * 0.05

      ctx.save()
      ctx.globalAlpha = pulseOpacity

      // Create radial gradient
      const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, pulseRadius)
      gradient.addColorStop(0, `${orb.color}60`)
      gradient.addColorStop(0.3, `${orb.color}30`)
      gradient.addColorStop(0.7, `${orb.color}10`)
      gradient.addColorStop(1, `${orb.color}00`)

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(orb.x, orb.y, pulseRadius, 0, Math.PI * 2)
      ctx.fill()

      // Inner glow
      ctx.globalAlpha = pulseOpacity * 2
      const innerGradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, pulseRadius * 0.3)
      innerGradient.addColorStop(0, `${orb.color}80`)
      innerGradient.addColorStop(1, `${orb.color}00`)
      ctx.fillStyle = innerGradient
      ctx.beginPath()
      ctx.arc(orb.x, orb.y, pulseRadius * 0.3, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    }

    // Update waves
    const updateWaves = () => {
      wavesRef.current.forEach((wave) => {
        wave.phase += wave.speed
        // Add subtle amplitude variation
        wave.amplitude = wave.amplitude + Math.sin(timeRef.current * 0.001) * 2
      })
    }

    // Update orbs
    const updateOrbs = () => {
      orbsRef.current.forEach((orb) => {
        orb.x += orb.vx
        orb.y += orb.vy
        orb.pulsePhase += orb.pulseSpeed

        // Bounce off edges
        if (orb.x <= orb.radius || orb.x >= canvas.width - orb.radius) {
          orb.vx *= -1
        }
        if (orb.y <= orb.radius || orb.y >= canvas.height - orb.radius) {
          orb.vy *= -1
        }

        // Keep within bounds
        orb.x = Math.max(orb.radius, Math.min(canvas.width - orb.radius, orb.x))
        orb.y = Math.max(orb.radius, Math.min(canvas.height - orb.radius, orb.y))
      })
    }

    // Draw mesh connections between orbs
    const drawMesh = () => {
      ctx.save()
      orbsRef.current.forEach((orb, i) => {
        orbsRef.current.slice(i + 1).forEach((otherOrb) => {
          const dx = orb.x - otherOrb.x
          const dy = orb.y - otherOrb.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const maxDistance = 200

          if (distance < maxDistance) {
            const opacity = ((maxDistance - distance) / maxDistance) * 0.1
            ctx.globalAlpha = opacity
            ctx.strokeStyle = "#ffffff"
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(orb.x, orb.y)
            ctx.lineTo(otherOrb.x, otherOrb.y)
            ctx.stroke()
          }
        })
      })
      ctx.restore()
    }

    // Main animation loop
    const animate = () => {
      timeRef.current += 16 // ~60fps

      // Clear canvas with subtle fade effect
      ctx.fillStyle = "rgba(15, 23, 42, 0.05)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw waves
      updateWaves()
      wavesRef.current.forEach(drawWave)

      // Update and draw orbs
      updateOrbs()
      orbsRef.current.forEach(drawOrb)

      // Draw mesh connections
      drawMesh()

      // Add subtle noise texture
      if (timeRef.current % 120 === 0) {
        // Every 2 seconds, add some noise
        for (let i = 0; i < 50; i++) {
          ctx.save()
          ctx.globalAlpha = 0.02
          ctx.fillStyle = "#ffffff"
          ctx.fillRect(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            Math.random() * 2,
            Math.random() * 2,
          )
          ctx.restore()
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    const handleResize = () => {
      resizeCanvas()
      initWaves()
      initOrbs()
    }

    // Initialize
    resizeCanvas()
    initWaves()
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
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 25%, #312e81 50%, #1e1b4b 75%, #0f172a 100%)",
        backgroundSize: "400% 400%",
        animation: "gradient-shift 20s ease infinite",
      }}
    />
  )
}
