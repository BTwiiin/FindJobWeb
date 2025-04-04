import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { createCalendarEvent } from "@/app/actions/calendarActions"
import { useToast } from "@/hooks/use-toast"
import { CalendarEvent } from "@/app/actions/calendarActions"

const formSchema = z.object({
  title: z.string().min(1, "Введите название события"),
  description: z.string().optional(),
  eventDate: z.date({
    required_error: "Выберите дату и время события",
  }),
})

interface CreateEventDialogProps {
  isOpen: boolean
  onClose: () => void
  onEventCreated: () => void
  defaultDate?: Date
}

export function CreateEventDialog({ isOpen, onClose, onEventCreated, defaultDate }: CreateEventDialogProps) {
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      eventDate: defaultDate ? new Date(defaultDate) : new Date(),
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await createCalendarEvent({
        title: values.title,
        description: values.description || "",
        eventDate: values.eventDate.toISOString(),
        type: 'CUSTOM'
      })
      
      toast({
        title: "Событие создано",
        description: "Новое событие успешно добавлено в календарь",
      })
      
      form.reset()
      onEventCreated()
      onClose()
    } catch (error) {
      console.error('Error creating event:', error)
      toast({
        title: "Ошибка",
        description: "Не удалось создать событие",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Создать событие</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название</FormLabel>
                  <FormControl>
                    <Input placeholder="Введите название события" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Введите описание события (необязательно)" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="eventDate"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>Дата и время</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      value={value.toISOString().slice(0, 16)}
                      onChange={(e) => {
                        const inputDate = new Date(e.target.value);
                        // Create date without timezone offset
                        const date = new Date(
                          inputDate.getFullYear(),
                          inputDate.getMonth(),
                          inputDate.getDate(),
                          inputDate.getHours(),
                          inputDate.getMinutes()
                        );
                        onChange(date);
                      }}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Отмена
              </Button>
              <Button type="submit">
                Создать
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 