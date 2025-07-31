"use client"

import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSearch } from "@/hooks/use-search"
import { useEffect, useRef } from "react"
import gsap from "gsap"

export function SearchButton() {
  const { open, setOpen } = useSearch()
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      gsap.fromTo(
        ".search-dialog",
        {
          scale: 0.95,
          opacity: 0,
          x: centerX - window.innerWidth / 2,
          y: centerY - window.innerHeight / 2,
        },
        {
          scale: 1,
          opacity: 1,
          x: 0,
          y: 0,
          duration: 0.2,
          ease: "power2.out",
        }
      )
    }
  }, [open])

  return (
    <Button
      ref={buttonRef}
      variant="outline"
      size="sm"
      className="relative w-64 justify-start text-muted-foreground"
      onClick={() => setOpen(true)}
    >
      <Search className="mr-2 h-4 w-4" />
      <span>Search anything...</span>
      <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  )
} 