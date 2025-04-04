"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface UpdateStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (notes: string) => void
  status: "approved" | "rejected"
  applicantName: string
}

export default function UpdateStatusDialog({
  open,
  onOpenChange,
  onConfirm,
  status,
  applicantName,
}: UpdateStatusDialogProps) {
  const [notes, setNotes] = useState("")

  const handleConfirm = () => {
    onConfirm(notes)
    setNotes("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {status === "approved" ? "Одобрить отклик" : "Отклонить отклик"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            {status === "approved"
              ? `Вы собираетесь одобрить отклик от ${applicantName}.`
              : `Вы собираетесь отклонить отклик от ${applicantName}.`}
          </p>
          <div className="space-y-2">
            <Label htmlFor="notes">Комментарий (необязательно)</Label>
            <Textarea
              id="notes"
              placeholder="Добавьте комментарий к вашему решению..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleConfirm}>
            {status === "approved" ? "Одобрить" : "Отклонить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 