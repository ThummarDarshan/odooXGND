"use client"

import { useEffect, useRef } from "react"

interface AuroraLayer {
  points: { x: number; y: number; vx: number; vy: number }[]
  color: string
  opacity: number
  speed: number
  amplitude: number
  frequency: number
  phase: number
}

export function AuroraBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const layersRef = useRef<AuroraLayer[]>([])
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

    // Initialize aurora layers
    const initLayers = () => {
      const colors = [
        { color: "#06b6d4", opacity: 0.15 },
        { color: "#3b82f6", opacity: 0.12 },
        { color: "#8b5cf6", opacity: 0.1 },
        { color: "#ec4899", opacity: 0.08 },
        { color: "#10b981", opacity: 0.06 },
      ]

      layersRef.current = colors.map((colorData, index) => ({
        points: Array.from({ length: 8 }, (_, i) => ({
          x: (canvas.width / 7) * i,
          y: canvas.height * (0.3 + Math.random() * 0.4),
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.3,
        })),
        color: colorData.color,
        opacity: colorData.opacity,
        speed: 0.01 + index * 0.005,
        amplitude: 100 + index * 20,
        frequency: 0.005 + index * 0.002,
        phase: index * Math.PI * 0.5,
      }))
    }

    // Draw aurora layer
    const drawAuroraLayer = (layer: AuroraLayer) => {
      ctx.save()
      ctx.globalAlpha = layer.opacity

      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, `${layer.color}00`)
      gradient.addColorStop(0.3, `${layer.color}80`)
      gradient.addColorStop(0.7, `${layer.color}60`)
      gradient.addColorStop(1, `${layer.color}00`)

      ctx.fillStyle = gradient

      // Draw flowing curves
      ctx.beginPath()
      ctx.moveTo(0, canvas.height)

      // Create smooth curves through points
      for (let i = 0; i < layer.points.length; i++) {
        const point = layer.points[i]
        const waveY = point.y + Math.sin(timeRef.current * layer.frequency + layer.phase + i) * layer.amplitude

        if (i === 0) {
          ctx.lineTo(point.x, waveY)
        } else {
          const prevPoint = layer.points[i - 1]
          const prevWaveY =
            prevPoint.y + Math.sin(timeRef.current * layer.frequency + layer.phase + (i - 1)) * layer.amplitude

          const cpx = (prevPoint.x + point.x) / 2
          const cpy = (prevWaveY + waveY) / 2

          ctx.quadraticCurveTo(cpx, cpy, point.x, waveY)
        }
      }

      // Complete the shape
      ctx.lineTo(canvas.width, canvas.height)
      ctx.lineTo(0, canvas.height)
      ctx.closePath()
      ctx.fill()

      // Add glow effect
      ctx.globalCompositeOperation = "screen"
      ctx.globalAlpha = layer.opacity * 0.5
      ctx.filter = "blur(20px)"
      ctx.fill()
      ctx.filter = "none"
      ctx.globalCompositeOperation = "source-over"

      ctx.restore()
    }

    // Update aurora layers
    const updateLayers = () => {
      layersRef.current.forEach((layer) => {
        layer.phase += layer.speed

        // Subtle point movement
        layer.points.forEach((point) => {
          point.x += point.vx
          point.y += point.vy

          // Gentle boundaries
          if (point.x < -50 || point.x > canvas.width + 50) point.vx *= -1
          if (point.y < canvas.height * 0.1 || point.y > canvas.height * 0.9) point.vy *= -1
        })
      })
    }

    // Main animation loop
    const animate = () => {
      timeRef.current += 16

      // Clear with subtle fade
      ctx.fillStyle = "rgba(15, 23, 42, 0.02)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      updateLayers()
      layersRef.current.forEach(drawAuroraLayer)

      animationRef.current = requestAnimationFrame(animate)
    }

    const handleResize = () => {
      resizeCanvas()
      initLayers()
    }

    resizeCanvas()
    initLayers()
    animate()

    window.addEventListener("resize", handleResize)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-2" style={{ mixBlendMode: "screen" }} />
}
