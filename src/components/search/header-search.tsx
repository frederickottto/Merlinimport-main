"use client"

import { Search } from "lucide-react"
import { useSearch } from "@/hooks/use-search"
import { Button } from "@/components/ui/button"

export function HeaderSearch() {
  const { setOpen } = useSearch()

  return (
    <Button
      variant="ghost"
      className="w-full justify-end text-muted-foreground rounded-full hover:bg-muted/50 transition-colors"
      onClick={() => setOpen(true)}
    >
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4" />
        <span>Search...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>
    </Button>
  )
} 