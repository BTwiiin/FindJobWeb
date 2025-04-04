import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Star } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

interface ReviewDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (rating: number, comment: string) => Promise<void>
  jobTitle: string
}

export function ReviewDialog({ isOpen, onClose, onSubmit, jobTitle }: ReviewDialogProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, выберите оценку",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      await onSubmit(rating, comment)
      toast({
        title: "Отзыв отправлен",
        description: "Спасибо за ваш отзыв!",
      })
      onClose()
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить отзыв",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Оставить отзыв о работе</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Вакансия</p>
            <p>{jobTitle}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Оценка</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  variant="ghost"
                  size="icon"
                  onClick={() => setRating(star)}
                  className={star <= rating ? "text-yellow-400" : "text-muted-foreground"}
                >
                  <Star className="h-6 w-6 fill-current" />
                </Button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Комментарий</p>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Опишите ваши впечатления о работе..."
              className="min-h-[100px]"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              Отправить отзыв
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 