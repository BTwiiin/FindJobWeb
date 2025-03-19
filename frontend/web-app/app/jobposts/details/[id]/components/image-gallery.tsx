"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ImageIcon, Maximize2 } from "lucide-react"

interface ImageGalleryProps {
  images: string[]
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (!images || images.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-md border border-dashed bg-muted/30 p-4 text-center">
        <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No images available</p>
      </div>
    )
  }

  const goToPrevious = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1))
  }

  const goToNext = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1))
  }

  return (
    <div className="relative h-64 overflow-hidden rounded-md">
      <div className="group relative h-full w-full cursor-pointer" onClick={() => setIsModalOpen(true)}>
        <img
          src={images[currentIndex] || "/placeholder.svg"}
          alt={`Job image ${currentIndex + 1}`}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
          <Maximize2 className="h-8 w-8 text-white" />
        </div>
      </div>

      {/* Navigation buttons */}
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70"
            onClick={(e) => {
              e.stopPropagation()
              goToPrevious()
            }}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70"
            onClick={(e) => {
              e.stopPropagation()
              goToNext()
            }}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </>
      )}

      {/* Image indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 space-x-1">
          {images.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 w-1.5 rounded-full ${index === currentIndex ? "bg-white" : "bg-white/50"}`}
            />
          ))}
        </div>
      )}

      {/* Fullscreen modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <div className="relative">
            <img
              src={images[currentIndex] || "/placeholder.svg"}
              alt={`Job image ${currentIndex + 1}`}
              className="w-full h-auto"
            />
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70"
                  onClick={goToNext}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}
            <DialogTitle className="absolute bottom-4 left-4 text-white bg-black/50 px-3 py-1 rounded-md">
              Image {currentIndex + 1} of {images.length}
            </DialogTitle>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

