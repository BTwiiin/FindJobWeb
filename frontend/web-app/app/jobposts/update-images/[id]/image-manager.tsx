"use client"

import { useEffect, useState } from "react"
import { deleteImage, getImages } from "@/app/actions/jobPostActions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "react-hot-toast"
import { ArrowLeft, Loader2, Plus, Trash2, Upload } from "lucide-react"
import ImageUploadDialog from "./components/image-upload-dialog"
import { useRouter } from "next/navigation"

export default function ImageManager({ id }: { id: string }) {
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingImage, setDeletingImage] = useState<string | null>(null)
  const [showUploadDialog, setShowUploadDialog] = useState(false)

  const router = useRouter()

  useEffect(() => {
    async function fetchImages() {
      try {
        console.log('Fetching images for job post:', id)
        const fetchedImages = await getImages(id)
        console.log('Fetched images:', fetchedImages)
        setImages(Array.isArray(fetchedImages) ? fetchedImages : [])
        console.log('Images state set to:', Array.isArray(fetchedImages) ? fetchedImages : [])
      } catch (error) {
        console.error('Error fetching images:', error)
        toast.error("Failed to load images")
      } finally {
        setLoading(false)
      }
    }

    fetchImages()
  }, [id])

  const handleDelete = async (imageUrl: string) => {
    setDeletingImage(imageUrl)
    try {
      console.log('Deleting image:', imageUrl)
      const cleanUrl = imageUrl.split("?")[0]
      const key = cleanUrl.substring(cleanUrl.lastIndexOf("/") + 1)
      console.log('Extracted key:', key)

      if (!key) {
        throw new Error("Failed to extract image key")
      }

      await deleteImage(key, id)
      setImages((prev) => prev.filter((img) => img !== imageUrl))
      toast.success("Image deleted successfully")
    } catch (error) {
      console.error('Error deleting image:', error)
      toast.error("Failed to delete image")
    } finally {
      setDeletingImage(null)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <div className="h-7 bg-muted rounded w-1/3 animate-pulse" />
            <div className="h-5 bg-muted rounded w-1/2 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-square bg-muted rounded animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => router.push(`/jobposts/details/${id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
          Go to Details
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Images</CardTitle>
          <CardDescription>Add or remove images for your job posting</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {images.length} image{images.length !== 1 && "s"}
              </p>
              <Button onClick={() => setShowUploadDialog(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </Button>
            </div>

            <ScrollArea className="h-[500px] rounded-md border">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
                {images.map((image, index) => (
                  <div key={index} className="group relative aspect-square rounded-md overflow-hidden">
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Job image ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(image)}
                        disabled={deletingImage === image}
                      >
                        {deletingImage === image ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}

                {images.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                    <Plus className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No images uploaded yet</p>
                    <Button variant="outline" className="mt-4" onClick={() => setShowUploadDialog(true)}>
                      Upload your first image
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      <ImageUploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        jobPostId={id}
        onSuccess={(newImage) => {
          setImages((prev) => [...prev, newImage])
          toast.success("Image uploaded successfully")
        }}
      />
    </div>
  )
}

