"use client"

import type React from "react"

import { useState, useRef } from "react"
import { toast } from "react-hot-toast"
import { uploadImages } from "@/app/actions/jobPostActions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Image, Loader2 } from "lucide-react"

interface ImageUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  jobPostId: string
  onSuccess: (imageUrl: string) => void
}

export default function ImageUploadDialog({ open, onOpenChange, jobPostId, onSuccess }: ImageUploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Check file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file")
        return
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB")
        return
      }

      setSelectedFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select an image to upload")
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("images", selectedFile)

      const response = await uploadImages(jobPostId, formData)
      console.log('Upload response:', response)

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.imageUrls && response.imageUrls.length > 0) {
        onSuccess(response.imageUrls[0])
      } else if (response.url) {
        onSuccess(response.url)
      } else {
        throw new Error('No image URL in response')
      }
      
      onOpenChange(false)
      setSelectedFile(null)
      setPreview(null)
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(`Upload failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSelectedFile(null)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) resetForm()
        onOpenChange(newOpen)
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Image</DialogTitle>
          <DialogDescription>Add a new image to your job posting. Images should be less than 5MB.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image">Select Image</Label>
            <Input ref={fileInputRef} id="image" type="file" accept="image/*" onChange={handleFileChange} />
          </div>

          {preview && (
            <div className="rounded-md border overflow-hidden">
              <img
                src={preview || "/placeholder.svg"}
                alt="Preview"
                className="w-full h-auto max-h-[200px] object-contain"
              />
            </div>
          )}

          {!preview && (
            <div className="flex h-[200px] flex-col items-center justify-center rounded-md border border-dashed p-4 text-center">
              <Image className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No image selected</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!selectedFile || loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

