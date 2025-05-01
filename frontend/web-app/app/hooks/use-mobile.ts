"use client"

import { useState, useEffect } from "react"

/**
 * A hook that returns true if the screen width is below the mobile breakpoint
 * @param breakpoint The width in pixels below which a device is considered mobile (default: 768)
 * @returns A boolean indicating if the current device is mobile
 */
export function useMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if window is defined (to avoid SSR issues)
    if (typeof window === "undefined") return

    // Initial check
    setIsMobile(window.innerWidth < breakpoint)

    // Function to update state based on window size
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }

    // Add event listener
    window.addEventListener("resize", handleResize)

    // Clean up
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [breakpoint])

  return isMobile
}
