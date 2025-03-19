"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

// Dynamically import Leaflet components to handle SSR
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false })

interface MapViewProps {
  latitude?: number
  longitude?: number
}

export default function MapView({ latitude, longitude }: MapViewProps) {
  const [isClient, setIsClient] = useState(false)
  const [mapReady, setMapReady] = useState(false)
  const [icon, setIcon] = useState<any>(null)

  // Default coordinates (Warsaw, Poland) if none provided
  const position: [number, number] = [latitude || 52.2297, longitude || 21.0122]

  useEffect(() => {
    setIsClient(true)

    // Import Leaflet and create custom icon
    import("leaflet").then((L) => {


      // Create custom marker icon
      const customIcon = new L.Icon({
        iconUrl: "/marker.png",
        iconRetinaUrl: "/marker.png",
        shadowUrl: "/marker.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      })

      setIcon(customIcon)
      setMapReady(true)
    })
  }, [])

  if (!isClient || !mapReady) {
    return (
      <div className="flex h-64 items-center justify-center rounded-md border bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!latitude || !longitude) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-md border border-dashed bg-muted/30 p-4 text-center">
        <p className="text-sm text-muted-foreground">No location information available</p>
      </div>
    )
  }

  return (
    <div className="h-64 overflow-hidden rounded-md border">
      <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%" }} zoomControl={false}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {icon && <Marker position={position} icon={icon} />}
      </MapContainer>
    </div>
  )
}

