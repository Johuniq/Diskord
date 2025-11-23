"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { MapPin } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import Image from "next/image"

export default function ProfileCard() {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })
  const [cardTilt, setCardTilt] = useState({ x: 0, y: 0 })
  const [targetTilt, setTargetTilt] = useState({ x: 0, y: 0 })
  const [isFlipping, setIsFlipping] = useState(false)
  const cardContainerRef = useRef<HTMLDivElement>(null)
  const backCardRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number>()
  const lastUpdateTimeRef = useRef<number>(0)

  // リニア補間関数
  const lerp = (start: number, end: number, factor: number) => {
    return start + (end - start) * factor
  }

  // requestAnimationFrameを使った滑らかなチルトアニメーション
  const updateTilt = useCallback(() => {
    const now = performance.now()
    const deltaTime = now - lastUpdateTimeRef.current
    lastUpdateTimeRef.current = now

    // フリップ中はチルトを無効化
    if (isFlipping) {
      setCardTilt({ x: 0, y: 0 })
      setTargetTilt({ x: 0, y: 0 })
      return
    }

    setCardTilt((current) => {
      const lerpFactor = Math.min(deltaTime / 16, 1) * 0.15 // 60FPSベースで補間係数を計算
      const newX = lerp(current.x, targetTilt.x, lerpFactor)
      const newY = lerp(current.y, targetTilt.y, lerpFactor)

      // 十分に近い場合は目標値に設定
      const threshold = 0.1
      return {
        x: Math.abs(newX - targetTilt.x) < threshold ? targetTilt.x : newX,
        y: Math.abs(newY - targetTilt.y) < threshold ? targetTilt.y : newY,
      }
    })

    if (isFlipped && !isFlipping) {
      animationFrameRef.current = requestAnimationFrame(updateTilt)
    }
  }, [targetTilt, isFlipped, isFlipping])

  // Global mouse tracking for back side - requestAnimationFrameで最適化
  const handleGlobalMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isFlipped && !isFlipping && cardContainerRef.current) {
        const rect = cardContainerRef.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2

        const mouseX = e.clientX - centerX
        const mouseY = e.clientY - centerY

        // Calculate tilt angles (max 15 degrees)
        const maxTilt = 15
        const tiltX = (mouseY / (rect.height / 2)) * maxTilt * -1
        const tiltY = (mouseX / (rect.width / 2)) * maxTilt

        // Constrain tilt values
        const constrainedTiltX = Math.max(-maxTilt, Math.min(maxTilt, tiltX))
        const constrainedTiltY = Math.max(-maxTilt, Math.min(maxTilt, tiltY))

        // 目標値を設定（実際の更新はrequestAnimationFrameで行う）
        setTargetTilt({ x: constrainedTiltX, y: constrainedTiltY })

        // Calculate mouse position as percentage for gradients
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        setMousePosition({
          x: Math.max(0, Math.min(100, x)),
          y: Math.max(0, Math.min(100, y)),
        })
      }
    },
    [isFlipped, isFlipping],
  )

  // requestAnimationFrameループの管理
  useEffect(() => {
    if (isFlipped && !isFlipping) {
      lastUpdateTimeRef.current = performance.now()
      animationFrameRef.current = requestAnimationFrame(updateTilt)
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isFlipped, isFlipping, updateTilt])

  useEffect(() => {
    if (isFlipped) {
      document.addEventListener("mousemove", handleGlobalMouseMove, { passive: true })
    }

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove)
    }
  }, [isFlipped, handleGlobalMouseMove])

  const handleCardClick = () => {
    setIsFlipping(true)
    setIsFlipped(!isFlipped)

    // フリップアニメーション完了後にフラグをリセット
    setTimeout(() => {
      setIsFlipping(false)
    }, 600) // アニメーション時間と同期
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    // Reset tilt only for front side
    if (!isFlipped) {
      setMousePosition({ x: 50, y: 50 })
      setCardTilt({ x: 0, y: 0 })
      setTargetTilt({ x: 0, y: 0 })
    }
  }

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      // Only handle mouse move for front side hover effects
      if (!isFlipped && isHovered && cardContainerRef.current) {
        const rect = cardContainerRef.current.getBoundingClientRect()

        // Calculate mouse position as percentage for gradients (front side only)
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        setMousePosition({
          x: Math.max(0, Math.min(100, x)),
          y: Math.max(0, Math.min(100, y)),
        })
      }
    },
    [isFlipped, isHovered],
  )

  // Combine transforms: hover tilt + flip rotation (no 3D tilt for front side)
  const getTransform = () => {
    const hoverTilt = isHovered && !isFlipped && !isFlipping ? "rotateZ(4deg)" : "rotateZ(0deg)"
    const flip = isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"

    // Apply 3D tilt only for back side and when not flipping
    const tilt3D = isFlipped && !isFlipping ? `rotateX(${cardTilt.x}deg) rotateY(${cardTilt.y}deg)` : ""

    return `${hoverTilt} ${flip} ${tilt3D}`
  }

  // Generate holographic gradient based on mouse position and tilt (back side only)
  const getHolographicStyle = () => {
    if (!isFlipped) {
      return {
        background: "transparent",
        transition: "background 0.15s ease-out",
      }
    }

    const { x, y } = mousePosition
    const { x: tiltX, y: tiltY } = cardTilt

    // Use tilt values to influence color intensity and position
    const tiltIntensity = (Math.abs(tiltX) + Math.abs(tiltY)) / 30 // Normalize to 0-1
    const colorIntensity = 0.7 + tiltIntensity * 0.3 // Base intensity + tilt boost

    // Shift gradient positions based on tilt
    const tiltOffsetX = tiltY * 2 // Y tilt affects X position
    const tiltOffsetY = tiltX * 2 // X tilt affects Y position

    const adjustedX = Math.max(0, Math.min(100, x + tiltOffsetX))
    const adjustedY = Math.max(0, Math.min(100, y + tiltOffsetY))

    // Create dynamic gradients with the new specified colors (increased saturation)
    const gradient1 = `radial-gradient(circle at ${adjustedX}% ${adjustedY}%, 
      rgba(220, 160, 225, ${colorIntensity}) 0%, transparent 50%)`
    const gradient2 = `radial-gradient(circle at ${100 - adjustedX}% ${100 - adjustedY}%, 
      rgba(30, 210, 220, ${colorIntensity * 0.8}) 0%, transparent 40%)`
    const gradient3 = `radial-gradient(circle at ${adjustedX}% ${100 - adjustedY}%, 
      rgba(60, 230, 65, ${colorIntensity * 0.9}) 0%, transparent 45%)`
    const gradient4 = `linear-gradient(${(x + tiltY) * 3.6}deg, 
      rgba(220, 160, 225, ${colorIntensity * 0.6}), 
      rgba(30, 210, 220, ${colorIntensity * 0.6}), 
      rgba(140, 145, 255, ${colorIntensity * 0.6}))`

    return {
      background: `${gradient1}, ${gradient2}, ${gradient3}, ${gradient4}`,
      transition: "none", // リアルタイム追従のためtransitionを無効化
    }
  }

  // Generate front side holographic effect (only when hovered)
  const getFrontHolographicStyle = () => {
    if (!isHovered || isFlipped) {
      return {
        background: "transparent",
        transition: "background 0.15s ease-out",
      }
    }

    const { x, y } = mousePosition
    const baseOpacity = 0.1

    return {
      background: `radial-gradient(circle at ${x}% ${y}%, 
        rgba(255, 0, 255, ${baseOpacity}) 0%, 
        rgba(0, 255, 255, ${baseOpacity * 0.7}) 30%, 
        transparent 60%)`,
      transition: "background 0.15s ease-out",
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 font-mono">
      <div className="relative w-full max-w-md mx-auto">
        {/* Card Container with 3D perspective */}
        <div
          ref={cardContainerRef}
          className="relative w-full h-[600px] cursor-pointer"
          style={{ perspective: "1000px" }}
          onClick={handleCardClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
        >
          {/* Flip Container */}
          <div
            className="relative w-full h-full"
            style={{
              transformStyle: "preserve-3d",
              transform: getTransform(),
              // 統一されたフリップアニメーション設定
              transitionProperty: "transform",
              transitionDuration: "0.5s",
              transitionTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }}
          >
            {/* Front Side */}
            <Card
              className="absolute inset-0 w-full h-full bg-zinc-900 border-zinc-800 overflow-hidden shadow-2xl rounded-xl"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(0deg)",
              }}
            >
              {/* Cosmic gradient header */}
              <div
                className="h-48 relative bg-cover bg-center bg-no-repeat rounded-t-xl"
                style={{ backgroundImage: "url(/images/bg2.png)" }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/30 to-transparent rounded-t-xl"></div>

                {/* Front side holographic overlay (only when hovered) */}
                <div
                  className="absolute inset-0 rounded-t-xl mix-blend-screen"
                  style={getFrontHolographicStyle()}
                ></div>
              </div>

              <CardHeader className="text-center -mt-20 relative z-10 pb-8">
                <div className="relative">
                  <Avatar className="w-[120px] h-[120px] mx-auto mb-6 bg-black border-zinc-800 border-[1]">
                    <AvatarImage
                      src="/icons/jack.svg"
                      alt="Jack's profile"
                      className="w-[80%] h-[80%] absolute inset-0 m-auto object-contain"
                    />
                    <AvatarFallback className="bg-black text-emerald-400 text-3xl font-mono">👻</AvatarFallback>
                  </Avatar>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2 font-mono">Jack</h1>
                <p className="text-zinc-400 text-lg font-mono py-[0]">Ambassador of Liam</p>

                {/* MapPin icon section */}
                <div className="flex items-center justify-center gap-2 mt-4">
                  <MapPin className="w-4 h-4" style={{ color: "#1DED83" }} />
                  <span className="font-mono text-white">Coding Galaxy</span>
                </div>
              </CardHeader>

              <CardContent className="px-6 pb-6 relative">
                {/* Front side body holographic overlay (only when hovered) */}
                <div
                  className="absolute inset-0 rounded-b-xl mix-blend-soft-light opacity-50"
                  style={getFrontHolographicStyle()}
                ></div>

                {/* Bio */}
                <div className="text-center mb-8 relative z-10">
                  <p className="text-zinc-300 leading-relaxed font-mono text-xs">
                    From the distant Cosmic Ocean,
                    <br />I travel galaxies to decode mysteries
                    <br />
                    and collect strange codes.
                  </p>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-zinc-700 mb-6 relative z-10"></div>

                {/* Social Links */}
                <div className="flex justify-center gap-4 relative z-10">
                  <a
                    href="https://github.com/liam-hq/liam"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 transition-all duration-200 rounded-lg"
                    >
                      <Image
                        src="/icons/github-logo.svg"
                        alt="GitHub"
                        width={20}
                        height={20}
                        className="text-zinc-300"
                      />
                      <span className="sr-only">GitHub</span>
                    </Button>
                  </a>

                  <a
                    href="https://x.com/liam_app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 transition-all duration-200 rounded-lg"
                    >
                      <Image
                        src="/icons/x-logo.svg"
                        alt="X (Twitter)"
                        width={20}
                        height={20}
                        className="text-zinc-300"
                      />
                      <span className="sr-only">X (Twitter)</span>
                    </Button>
                  </a>

                  <a
                    href="https://liambx.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 transition-all duration-200 rounded-lg h-10 w-auto px-3"
                    >
                      <div className="flex items-center justify-center">
                        <Image
                          src="/icons/liam-logo.svg"
                          alt="Liam"
                          width={70}
                          height={16}
                          className="object-contain"
                        />
                      </div>
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Back Side */}
            <Card
              ref={backCardRef}
              className="absolute inset-0 w-full h-full bg-zinc-900 border-zinc-800 overflow-hidden shadow-2xl rounded-xl"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              {/* Background image */}
              <div
                className="h-full w-full bg-cover bg-center bg-no-repeat rounded-xl relative"
                style={{
                  backgroundImage: "url(/images/jack-card.jpg)",
                  backgroundPosition: "center top",
                  backgroundSize: "cover",
                }}
              >
                {/* Enhanced holographic overlay (always active when flipped) */}
                <div
                  className="absolute inset-0 rounded-xl opacity-90 mix-blend-multiply"
                  style={getHolographicStyle()}
                ></div>

                {/* Additional shimmer effect with tilt influence (always active when flipped) */}
                <div
                  className="absolute inset-0 rounded-xl opacity-25 mix-blend-overlay"
                  style={{
                    background: isFlipped
                      ? `linear-gradient(${(mousePosition.x + cardTilt.y) * 2}deg, 
                    transparent 30%, 
                    rgba(255, 255, 255, ${0.3 + Math.abs(cardTilt.x + cardTilt.y) / 100}) 50%, 
                    transparent 70%)`
                      : "transparent",
                    transition: "none", // リアルタイム追従のためtransitionを無効化
                  }}
                ></div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
