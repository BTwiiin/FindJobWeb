"use client"

import dynamic from "next/dynamic"

// Dynamically import the MapComponent with no SSR
const MapWithNoSSR = dynamic(() => import("./MapComponent").then((mod) => mod.default), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-muted/10">
      <div className="animate-pulse text-muted-foreground">Loading map...</div>
    </div>
  ),
})

export function MapComponent() {
  return <MapWithNoSSR />
}
