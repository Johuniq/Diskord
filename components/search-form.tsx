"use client"

import type React from "react"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LoadingScreen } from "@/components/loading-screen"

export function SearchForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [id, setId] = useState(searchParams.get("id") || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return

    startTransition(() => {
      router.push(`/?id=${id}`)
    })
  }

  return (
    <>
      {isPending && <LoadingScreen />}
      <form onSubmit={handleSubmit} className="max-w-md mx-auto lg:mx-0 space-y-4 relative z-20">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition-opacity" />
          <div className="relative flex gap-2">
            <Input
              name="id"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="Enter Discord User ID..."
              className="h-14 bg-black/80 border-white/10 text-white placeholder:text-white/20 text-lg font-mono focus:ring-purple-500 focus:border-purple-500 transition-all relative z-10"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isPending}
              className="h-14 w-14 shrink-0 bg-white text-black hover:bg-white/90 transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 relative z-10"
            >
              <Search className="w-5 h-5" />
            </Button>
          </div>
        </div>
        <p className="text-xs text-white/30 font-mono">
          *User must have "Use data to improve Discord" enabled for full stats.
        </p>
      </form>
    </>
  )
}
