"use client"

import { create } from "zustand"

interface SearchStore {
  open: boolean
  setOpen: (open: boolean) => void
}

export const useSearch = create<SearchStore>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
})) 