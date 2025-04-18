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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ApplicationStatus } from "@/types/job-application"
import { updateApplicationStatus } from "@/app/actions/jobPostActions"
import { toast } from "react-hot-toast"
import { Star } from "lucide-react"
import { createReview, markJobAsCompleted } from "@/app/actions/reviewActions"

interface ApplicationResponseDialogProps {
  applicationId: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  currentStatus: ApplicationStatus
  applicantId: string
}

export function ApplicationResponseDialog({
  applicationId,
  isOpen,
  onClose,
  onSuccess,
  currentStatus,
  applicantId,
}: ApplicationResponseDialogProps) {
  const [status, setStatus] = useState<ApplicationStatus>(currentStatus)
  const [notes, setNotes] = useState("")
  const [rating, setRating] = useState(5)
  const [reviewComment, setReviewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      
      if (currentStatus === ApplicationStatus.ACCEPTED) {
            // Mark job as completed
            await updateApplicationStatus(applicationId, ApplicationStatus.COMPLETED, notes)

            // Then create review
            await createReview(applicationId, rating, reviewComment || "")
            // TODO: revalidate path
      } else {
        // For pending applications, just update the status
        await updateApplicationStatus(applicationId, status, notes)
      }

      toast.success("Статус заявки обновлен");
      onSuccess()
      onClose()
    } catch (error) {
      toast.error("Не удалось обновить статус заявки");
    } finally {
      setIsSubmitting(false)
    }
  }

  const isCompletingWork = currentStatus === ApplicationStatus.ACCEPTED

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isCompletingWork ? "Завершить работу" : "Ответить на заявку"}
          </DialogTitle>
          <DialogDescription>
            {isCompletingWork 
              ? "Отметьте работу как завершенную и оставьте отзыв о сотруднике"
              : "Выберите статус заявки и добавьте комментарий"
            }
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {!isCompletingWork && (
            <div className="grid gap-2">
              <label htmlFor="status" className="text-sm font-medium">
                Статус
              </label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as ApplicationStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ApplicationStatus.ACCEPTED}>
                    Принято
                  </SelectItem>
                  <SelectItem value={ApplicationStatus.REJECTED}>
                    Отклонено
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {isCompletingWork && (
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
          )}
          <div className="grid gap-2">
            <label htmlFor="notes" className="text-sm font-medium">
              {isCompletingWork ? "Отзыв о работе (необязательно)" : "Комментарий (необязательно)"}
            </label>
            <Textarea
              id="notes"
              value={isCompletingWork ? reviewComment : notes}
              onChange={(e) => isCompletingWork ? setReviewComment(e.target.value) : setNotes(e.target.value)}
              placeholder={isCompletingWork 
                ? "Опишите качество выполненной работы..."
                : "Введите ваш комментарий..."
              }
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
            {isSubmitting 
              ? "Отправка..." 
              : isCompletingWork 
                ? "Завершить и оставить отзыв" 
                : "Отправить"
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 