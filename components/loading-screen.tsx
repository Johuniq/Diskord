"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export function LoadingScreen() {
  const [progress, setProgress] = useState(0)
  const [text, setText] = useState("INITIALIZING")

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 1
      })
    }, 20)

    const texts = [
      "ESTABLISHING UPLINK...",
      "VERIFYING IDENTITY...",
      "DECODING ASSETS...",
      "SYNCING DATABASE...",
      "LOADING DISKORD...",
    ]

    let textIndex = 0
    const textInterval = setInterval(() => {
      textIndex = (textIndex + 1) % texts.length
      setText(texts[textIndex])
    }, 400)

    return () => {
      clearInterval(interval)
      clearInterval(textInterval)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white overflow-hidden font-mono">
      {/* Background Grid Effect */}
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />

      {/* Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] animate-[scanline_4s_linear_infinite]" />

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Glitching Logo */}
        <div className="relative">
          <motion.h1
            className="text-4xl md:text-6xl font-bold tracking-tighter animate-glitch text-transparent bg-clip-text bg-gradient-to-r from-[#5865F2] to-[#EB459E]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            DISKORD
          </motion.h1>
          <div className="absolute -inset-1 bg-gradient-to-r from-[#5865F2] to-[#EB459E] blur-xl opacity-20 animate-pulse" />
        </div>

        {/* Loading Bar container */}
        <div className="w-64 h-2 bg-gray-900 rounded-full overflow-hidden border border-gray-800 relative">
          {/* Loading Bar Fill */}
          <motion.div
            className="h-full bg-gradient-to-r from-[#5865F2] to-[#EB459E]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Terminal Text */}
        <div className="h-6 text-[#5865F2] text-sm tracking-widest uppercase animate-pulse">
          {`> ${text} [${progress}%]`}
        </div>
      </div>

      {/* Decorative corners */}
      <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-[#5865F2]/30" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-[#EB459E]/30" />
    </div>
  )
}
