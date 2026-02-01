"use client"

import { useEffect } from "react"

/**
 * Light copy deterrent: prevent image dragging only.
 * Does not disable right-click (better for accessibility).
 */
export function CopyDeterrent() {
  useEffect(() => {
    const preventDrag = (e: DragEvent) => {
      const target = e.target as HTMLElement
      if (target?.tagName === "IMG" || target?.closest?.("picture")) {
        e.preventDefault()
      }
    }
    document.addEventListener("dragstart", preventDrag, { passive: false })
    return () => document.removeEventListener("dragstart", preventDrag)
  }, [])
  return null
}
