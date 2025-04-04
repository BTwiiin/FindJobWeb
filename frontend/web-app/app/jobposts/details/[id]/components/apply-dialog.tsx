"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { applyToJobPost } from "@/app/actions/jobPostActions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import type { JobPost } from "@/types"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const formSchema = z.object({
  email: z.string().email("Неверный email адрес").min(1, "Email обязателен"),
  phone: z.string().min(1, "Номер телефона обязателен"),
  message: z.string().optional(),
  contactType: z.enum(["email", "phone", "both"], {
    required_error: "Выберите предпочтительный способ связи",
  }),
})

type ApplyDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  jobPost: JobPost
}

export default function ApplyDialog({ open, onOpenChange, jobPost }: ApplyDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      phone: "",
      message: "",
      contactType: "both",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      const result = await applyToJobPost(jobPost.id, {
        email: values.email,
        phone: values.phone,
        coverLetter: values.message,
        contactType: values.contactType
      })
      
      if (result.error) {
        throw new Error(result.error.message || "Не удалось отправить отклик")
      }
      
      toast.success("Отклик успешно отправлен")
      onOpenChange(false)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Не удалось отправить отклик")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Откликнуться на вакансию {jobPost.title}</DialogTitle>
          <DialogDescription>
            Заполните форму ниже, чтобы откликнуться на эту вакансию.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Введите ваш email" {...field} />
                    </FormControl>
                    <FormDescription>
                      Работодатель будет использовать этот email для связи с вами.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Номер телефона</FormLabel>
                  <FormControl>
                    <Input placeholder="Введите ваш номер телефона" {...field} />
                  </FormControl>
                  <FormDescription>
                    Работодатель будет использовать этот номер для связи с вами.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Сопроводительное письмо (необязательно)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Кратко объясните, почему вы подходите на эту должность"
                      className="resize-none"
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Опишите ваши навыки и опыт, релевантные для этой должности. Это поле не является обязательным.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Предпочтительный способ связи</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите способ связи" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Телефон</SelectItem>
                      <SelectItem value="both">Email и телефон</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Выберите, как работодатель может связаться с вами.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Отправка..." : "Отправить отклик"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
