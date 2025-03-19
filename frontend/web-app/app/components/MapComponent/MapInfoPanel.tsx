"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Info, X } from "lucide-react"

export default function MapInfoPanel() {
  const [isOpen, setIsOpen] = useState(true)

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="absolute top-4 left-4 z-[1000] bg-white text-black hover:bg-gray-100"
        size="icon"
        variant="outline"
      >
        <Info className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Card className="absolute top-4 left-4 z-[1000] w-64 shadow-lg bg-white/90 backdrop-blur-sm">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Map Controls</CardTitle>
        <Button onClick={() => setIsOpen(false)} variant="ghost" size="icon" className="h-6 w-6">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        <CardDescription>
          <ul className="list-disc pl-4 space-y-1">
            <li>Click markers to view job details</li>
            <li>Use bottom-right controls to zoom in/out</li>
            <li>Use the location button to find jobs near you</li>
            <li>Clusters show the number of jobs in an area</li>
          </ul>
        </CardDescription>
      </CardContent>
    </Card>
  )
}

