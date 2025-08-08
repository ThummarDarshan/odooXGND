"use client"

import { useEffect, useRef } from "react"

interface GeometricShape {
  x: number
  y: number
  size: number
  rotation: number
  rotationSpeed: number
  opacity: number
  color: string
  type: "triangle" | "square" | "hexagon" | "circle"
  vx: number
  vy: number
  pulsePhase: number
}

export function GeometricBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const shapesRef = useRef<GeometricShape[]>([])
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

    const colors = ["#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b"]
    const shapeTypes: ("triangle" | "square" | "hexagon" | "circle")[] = ["triangle", "square", "hexagon", "circle"]

    // Initialize shapes
    const initShapes = () => {
      shapesRef.current = Array.from({ length: 25 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 40 + 10,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        opacity: Math.random() * 0.1 + 0.02,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        pulsePhase: Math.random() * Math.PI * 2,
      }))
    }

    // Draw triangle
    const drawTriangle = (shape: GeometricShape) => {
      ctx.save()
      ctx.translate(shape.x, shape.y)
      ctx.rotate(shape.rotation)
      ctx.beginPath()
      ctx.moveTo(0, -shape.size / 2)
      ctx.lineTo(-shape.size / 2, shape.size / 2)
      ctx.lineTo(shape.size / 2, shape.size / 2)
      ctx.closePath()
      ctx.restore()
    }

    // Draw square
    const drawSquare = (shape: GeometricShape) => {
      ctx.save()
      ctx.translate(shape.x, shape.y)
      ctx.rotate(shape.rotation)
      ctx.beginPath()
      ctx.rect(-shape.size / 2, -shape.size / 2, shape.size, shape.size)
      ctx.restore()
    }

    // Draw hexagon
    const drawHexagon = (shape: GeometricShape) => {
      ctx.save()
      ctx.translate(shape.x, shape.y)
      ctx.rotate(shape.rotation)
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3
        const x = (Math.cos(angle) * shape.size) / 2
        const y = (Math.sin(angle) * shape.size) / 2
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.restore()
    }

    // Draw circle
    const drawCircle = (shape: GeometricShape) => {
      ctx.save()
      ctx.translate(shape.x, shape.y)
      ctx.beginPath()
      ctx.arc(0, 0, shape.size / 2, 0, Math.PI * 2)
      ctx.restore()
    }

    // Draw shape
    const drawShape = (shape: GeometricShape) => {
      const pulseSize = shape.size + Math.sin(shape.pulsePhase) * 5
      const pulseOpacity = shape.opacity + Math.sin(shape.pulsePhase) * 0.02

      ctx.save()
      ctx.globalAlpha = pulseOpacity

      // Create gradient
      const gradient = ctx.createRadialGradient(shape.x, shape.y, 0, shape.x, shape.y, pulseSize)
      gradient.addColorStop(0, `${shape.color}60`)
      gradient.addColorStop(0.7, `${shape.color}20`)
      gradient.addColorStop(1, `${shape.color}00`)

      ctx.fillStyle = gradient
      ctx.strokeStyle = `${shape.color}40`
      ctx.lineWidth = 1

      // Temporarily modify size for pulsing
      const originalSize = shape.size
      shape.size = pulseSize

      switch (shape.type) {
        case "triangle":
          drawTriangle(shape)
          break
        case "square":
          drawSquare(shape)
          break
        case "hexagon":
          drawHexagon(shape)
          break
        case "circle":
          drawCircle(shape)
          break
      }

      ctx.fill()
      ctx.stroke()

      // Restore original size
      shape.size = originalSize

      ctx.restore()
    }

    // Update shapes
    const updateShapes = () => {
      shapesRef.current.forEach((shape) => {
        shape.x += shape.vx
        shape.y += shape.vy
        shape.rotation += shape.rotationSpeed
        shape.pulsePhase += 0.02

        // Wrap around edges
        if (shape.x < -shape.size) shape.x = canvas.width + shape.size
        if (shape.x > canvas.width + shape.size) shape.x = -shape.size
        if (shape.y < -shape.size) shape.y = canvas.height + shape.size
        if (shape.y > canvas.height + shape.size) shape.y = -shape.size
      })
    }

    // Main animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      updateShapes()
      shapesRef.current.forEach(drawShape)

      animationRef.current = requestAnimationFrame(animate)
    }

    const handleResize = () => {
      resizeCanvas()
      initShapes()
    }

    resizeCanvas()
    initShapes()
    animate()

    window.addEventListener("resize", handleResize)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-1" style={{ opacity: 0.6 }} />
}
