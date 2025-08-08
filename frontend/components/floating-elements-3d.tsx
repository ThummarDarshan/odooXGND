"use client"

import { useEffect, useState } from "react"

interface FloatingElement {
  id: number
  x: number
  y: number
  z: number
  rotateX: number
  rotateY: number
  rotateZ: number
  size: number
  color: string
  shape: "cube" | "sphere" | "pyramid" | "torus"
}

export function FloatingElements3D() {
  const [elements, setElements] = useState<FloatingElement[]>([])
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const colors = ["#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b"]
    const shapes: ("cube" | "sphere" | "pyramid" | "torus")[] = ["cube", "sphere", "pyramid", "torus"]

    const initialElements: FloatingElement[] = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      z: Math.random() * 100,
      rotateX: Math.random() * 360,
      rotateY: Math.random() * 360,
      rotateZ: Math.random() * 360,
      size: Math.random() * 40 + 20,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    }))

    setElements(initialElements)

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      })
    }

    window.addEventListener("mousemove", handleMouseMove)

    const animateElements = () => {
      setElements((prev) =>
        prev.map((element) => ({
          ...element,
          rotateX: element.rotateX + 1,
          rotateY: element.rotateY + 0.5,
          rotateZ: element.rotateZ + 0.8,
          x: element.x + Math.sin(Date.now() * 0.001 + element.id) * 0.1,
          y: element.y + Math.cos(Date.now() * 0.001 + element.id) * 0.1,
        })),
      )
    }

    const interval = setInterval(animateElements, 50)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      clearInterval(interval)
    }
  }, [])

  const getShapeStyles = (element: FloatingElement) => {
    const baseStyles = {
      position: "absolute" as const,
      left: `${element.x}%`,
      top: `${element.y}%`,
      width: `${element.size}px`,
      height: `${element.size}px`,
      transform: `
        translate(-50%, -50%) 
        translateZ(${element.z}px)
        rotateX(${element.rotateX + mousePosition.y * 0.1}deg) 
        rotateY(${element.rotateY + mousePosition.x * 0.1}deg) 
        rotateZ(${element.rotateZ}deg)
      `,
      transformStyle: "preserve-3d" as const,
      opacity: 0.7,
      filter: `drop-shadow(0 0 20px ${element.color}40)`,
      transition: "all 0.1s ease-out",
    }

    switch (element.shape) {
      case "cube":
        return {
          ...baseStyles,
          background: `linear-gradient(45deg, ${element.color}, ${element.color}80)`,
          borderRadius: "8px",
          border: `2px solid ${element.color}`,
        }
      case "sphere":
        return {
          ...baseStyles,
          background: `radial-gradient(circle at 30% 30%, ${element.color}, ${element.color}40)`,
          borderRadius: "50%",
          border: `2px solid ${element.color}60`,
        }
      case "pyramid":
        return {
          ...baseStyles,
          background: `linear-gradient(135deg, ${element.color}, ${element.color}60)`,
          clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
          border: `2px solid ${element.color}80`,
        }
      case "torus":
        return {
          ...baseStyles,
          background: `conic-gradient(from 0deg, ${element.color}, ${element.color}40, ${element.color})`,
          borderRadius: "50%",
          border: `4px solid transparent`,
          backgroundClip: "padding-box",
          position: "relative" as const,
        }
      default:
        return baseStyles
    }
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-5 perspective-1000">
      {elements.map((element) => (
        <div
          key={element.id}
          className="animate-float-3d"
          style={{
            ...getShapeStyles(element),
            animationDelay: `${element.id * 0.2}s`,
            animationDuration: `${4 + element.id * 0.5}s`,
          }}
        >
          {element.shape === "torus" && (
            <div
              className="absolute inset-2 rounded-full"
              style={{
                background: "transparent",
                border: `2px solid ${element.color}`,
              }}
            />
          )}
        </div>
      ))}
    </div>
  )
}
