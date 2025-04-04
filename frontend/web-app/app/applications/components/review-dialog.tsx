"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"
import { createReview } from "@/app/actions/reviewActions"
import { toast } from "react-hot-toast"

interface ReviewDialogProps {
  applicationId: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ReviewDialog({
  applicationId,
  isOpen,
  onClose,
  onSuccess,
}: ReviewDialogProps) {
  const [rating, setRating] = useState(5)
  const [reviewComment, setReviewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      await createReview(applicationId, rating, reviewComment || "")
      toast.success("Отзыв успешно отправлен")
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error submitting review:", error)
      toast.error("Не удалось отправить отзыв")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Оставить отзыв</DialogTitle>
          <DialogDescription>
            Оцените качество выполненной работы и оставьте комментарий
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">
              Оценка работы
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  {star <= rating ? (
                    <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                  ) : (
                    <Star className="h-6 w-6 text-gray-300" />
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            <label htmlFor="review" className="text-sm font-medium">
              Отзыв о работе (необязательно)
            </label>
            <Textarea
              id="review"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Опишите качество выполненной работы..."
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Отправка..." : "Отправить отзыв"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 