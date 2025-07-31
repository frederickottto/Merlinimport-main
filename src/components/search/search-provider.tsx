"use client"

import { useEffect } from "react"
import { SearchDialog } from "./search-dialog"
import { useSearch } from "@/hooks/use-search"

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const { open, setOpen } = useSearch()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(!open)
      }
    }

    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
      }
    }

    document.addEventListener("keydown", down)
    document.addEventListener("keydown", escape)
    return () => {
      document.removeEventListener("keydown", down)
      document.removeEventListener("keydown", escape)
    }
  }, [open, setOpen])

  return (
    <>
      {children}
      <SearchDialog />
    </>
  )
} 