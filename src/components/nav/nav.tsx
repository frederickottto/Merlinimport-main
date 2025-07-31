import { SearchButton } from "@/components/search/search-button"

export function Nav() {
  return (
    <nav className="flex items-center gap-4">
      <SearchButton />
      {/* ... existing navigation items ... */}
    </nav>
  )
} 