import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CalendarEvent } from "@/app/actions/calendarActions"
import { getEventTitle } from "@/types/options"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { deleteCalendarEvent } from "@/app/actions/calendarActions"
import { CreateEventDialog } from "./create-event-dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

interface EventDetailsDialogProps {
  event: CalendarEvent | null
  isOpen: boolean
  onClose: () => void
  onEventUpdated: () => void
  onEventDeleted: () => void
}

export function EventDetailsDialog({ event, isOpen, onClose, onEventUpdated, onEventDeleted }: EventDetailsDialogProps) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { toast } = useToast()

  if (!event) return null

  const eventDate = new Date(event.eventDate)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await deleteCalendarEvent(event.id)
      toast({
        title: "Событие удалено",
        description: "Событие успешно удалено из календаря",
      })
      onEventDeleted()
      onClose()
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить событие",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleEdit = () => {
    setIsEditMode(true)
  }

  const handleEditComplete = () => {
    setIsEditMode(false)
    onEventUpdated()
    onClose()
  }

  if (isEditMode) {
    return (
      <CreateEventDialog
        isOpen={true}
        onClose={() => setIsEditMode(false)}
        onEventCreated={handleEditComplete}
        defaultDate={eventDate}
      />
    )
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center justify-between mr-4">
              <DialogTitle>{event.title}</DialogTitle>
              {event.type === 'CUSTOM' && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleEdit}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              )}
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Тип события</p>
              <p>{getEventTitle(event.type)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Дата и время</p>
              <p>
                {format(eventDate, "d MMMM yyyy", { locale: ru })} в{" "}
                {format(eventDate, "HH:mm", { locale: ru })}
              </p>
            </div>
            {event.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Описание</p>
                <p className="whitespace-pre-wrap">{event.description}</p>
              </div>
            )}
            {event.jobPostId && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Связанная вакансия</p>
                <a 
                  href={`/jobposts/details/${event.jobPostId}`} 
                  className="text-primary hover:underline"
                >
                  Перейти к вакансии
                </a>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить событие?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Событие будет удалено из календаря.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 