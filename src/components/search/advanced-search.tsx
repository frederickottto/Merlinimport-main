"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSearch } from "@/hooks/use-search"
import { useState } from "react"

export function AdvancedSearch() {
  const [query, setQuery] = useState("")
  const { setOpen } = useSearch()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement search functionality
    setOpen(false)
  }

  return (
    <form onSubmit={handleSearch} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="search">Search</Label>
        <Input
          id="search"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full"
        />
      </div>
    </form>
  )
} 