"use client"

import { useEffect, useState, useMemo } from "react"
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { useShallow } from "zustand/shallow"
import type { JobPost, PagedResult } from "@/types"
import qs from "query-string"
import { getData } from "@/app/actions/jobPostActions"
import { useParamsStore } from "@/app/hooks/useParamsStore"
import { useJobHoverStore } from "@/app/hooks/useJobHoverStore"
import MarkerClusterGroup from "react-leaflet-cluster"
import MapJobPostCard from "@/app/jobposts/cards/MapJobPostCard"
import { Button } from "@/components/ui/button"
import { Loader2, MapPin, Maximize, LocateFixed } from "lucide-react"

// Move constants outside component for better performance
const defaultMapCenter: [number, number] = [51.9194, 19.1451]
const defaultMapZoom = 6.3

// Create icons outside component to prevent recreation on each render
const createIcon = (size: number) =>
  new L.Icon({
    iconUrl: "/marker.png",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  })

const defaultIcon = createIcon(32)
const hoverIcon = createIcon(48)

// Component to handle user geolocation
function LocationFinder() {
  const map = useMap()

  const handleLocateUser = () => {
    map.locate({ setView: true, maxZoom: 10 })
  }

  return (
    <Button
      onClick={handleLocateUser}
      className="absolute bottom-20 right-2 z-[5] bg-white text-black hover:bg-gray-100"
      size="icon"
      variant="outline"
      title="Find my location"
    >
      <LocateFixed className="h-4 w-4" />
    </Button>
  )
}

// Component to handle fullscreen toggle
function FullscreenControl() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true)
      })
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false)
      })
    }
  }

  return (
    <Button
      onClick={toggleFullscreen}
      className="absolute bottom-32 right-2 z-[5] bg-white text-black hover:bg-gray-100"
      size="icon"
      variant="outline"
      title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
    >
      <Maximize className="h-4 w-4" />
    </Button>
  )
}

const MapComponent = () => {
  const hoveredJobPostId = useJobHoverStore((state) => state.hoveredJobPostId)
  const [data, setData] = useState<PagedResult<JobPost>>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use responsive styling based on screen size
  const mapContainerStyle = useMemo(
    () => ({
      width: "100%",
      height: "100%",
      position: "relative" as const
    }),
    [],
  )

  // Get params from store with useShallow for performance
  const params = useParamsStore(
    useShallow((state) => ({
      searchTerm: state.searchTerm,
      pageSize: state.pageSize,
      searchValue: state.searchValue,
      orderBy: state.orderBy,
      filterBy: state.filterBy,
      employer: state.employer,
    })),
  )

  // Memoize URL to prevent unnecessary recalculations
  const url = useMemo(
    () =>
      qs.stringifyUrl({
        url: "",
        query: params,
      }),
    [params],
  )

  // Fetch data with proper loading and error states
  useEffect(() => {
    setIsLoading(true)
    setError(null)

    getData(url)
      .then((data) => {
        setData(data)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error("Error fetching job data:", err)
        setError("Failed to load job listings. Please try again later.")
        setIsLoading(false)
      })
  }, [url])

  // Memoize job markers to prevent unnecessary re-renders
  const jobMarkers = useMemo(() => {
    if (!data?.results) return null

    return data.results
      .map((job) => {
        // Skip jobs without valid coordinates
        if (!job.location?.latitude || !job.location?.longitude) return null

        const isHovered = job.id === hoveredJobPostId

        return (
          <Marker
            key={job.id}
            position={[job.location.latitude, job.location.longitude]}
            icon={isHovered ? hoverIcon : defaultIcon}
            zIndexOffset={isHovered ? 20 : 0}
            eventHandlers={{
              mouseover: () => useJobHoverStore.setState({ hoveredJobPostId: job.id }),
              mouseout: () => useJobHoverStore.setState({ hoveredJobPostId: null }),
            }}
          >
            <Popup closeButton={false}>
              <MapJobPostCard jobPost={job} />
            </Popup>
          </Marker>
        )
      })
      .filter(Boolean) // Filter out null markers
  }, [data?.results, hoveredJobPostId])

  return (
    <div className="w-full h-[calc(100vh-128px)]"> {/* 64px header + 48px info panel */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-[100]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-[100]">
          <div className="text-center p-4">
            <MapPin className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-destructive">{error}</p>
            <Button
              onClick={() =>
                getData(url)
                  .then((data) => {
                    setData(data)
                    setError(null)
                  })
                  .catch((err) => setError("Failed to load job listings. Please try again later."))
              }
              className="mt-4"
              variant="outline"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      <MapContainer
        center={defaultMapCenter}
        zoom={defaultMapZoom}
        zoomControl={false}
        style={mapContainerStyle}
        className="h-full"
      >
        {/* Custom map tile layer with better styling */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains="abcd"
          maxZoom={19}
        />

        {/* Add custom controls */}
        <ZoomControl position="bottomright" />
        <LocationFinder />
        <FullscreenControl />

        {/* Job Markers with improved clustering */}
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={60}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          zIndexOffset={10}
          disableClusteringAtZoom={13}
        >
          {jobMarkers}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  )
}

export default MapComponent

