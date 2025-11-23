"use client"

import { useEffect, useRef } from "react"

interface GrainGradientProps {
  width: number
  height: number
  colors: string[]
  colorBack?: string
  softness?: number
  intensity?: number
  noise?: number
  shape?: string
  speed?: number
}

export function GrainGradient({ width, height, colors, speed = 1 }: GrainGradientProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let time = 0

    const render = () => {
      time += 0.005 * speed

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Create a complex gradient that moves
      const gradient = ctx.createLinearGradient(0, 0, width * Math.cos(time), height * Math.sin(time))

      // Distribute colors
      colors.forEach((color, index) => {
        const stop = index / (colors.length - 1) + Math.sin(time + index) * 0.1
        // Clamp stop between 0 and 1
        const clampedStop = Math.max(0, Math.min(1, stop))
        gradient.addColorStop(clampedStop, color)
      })

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      // Add noise
      const imageData = ctx.getImageData(0, 0, width, height)
      const data = imageData.data

      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 20
        data[i] = Math.max(0, Math.min(255, data[i] + noise))
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise))
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise))
      }

      ctx.putImageData(imageData, 0, 0)

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [width, height, colors, speed])

  return (
    <canvas ref={canvasRef} width={width} height={height} className="w-full h-full object-cover absolute inset-0" />
  )
}
