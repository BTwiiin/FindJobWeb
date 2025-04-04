"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "react-hot-toast"
import { createJobPost, updateJobPost } from "@/app/actions/jobPostActions"
import { useLocationStore } from "@/app/hooks/useLocationStore"
import type { JobPost } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ArrowLeft, CalendarIcon, Loader2} from "lucide-react"
import LocationInput from "@/app/components/location-input"
import { categoryOptions } from "@/types/options"

const formSchema = z.object({
  title: z.string().min(1, "Введите название вакансии"),
  description: z.string().min(10, "Описание должно содержать минимум 10 символов"),
  paymentAmount: z.coerce.number().min(1, "Введите сумму оплаты"),
  deadline: z.date({
    required_error: "Выберите дату дедлайна",
  }),
  category: z.string({
    required_error: "Выберите категорию",
  }),
})

interface JobPostFormProps {
  jobPost?: JobPost
}

export default function JobPostForm({ jobPost }: JobPostFormProps) {
  const router = useRouter()
  const { selectedLocation } = useLocationStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      paymentAmount: 0,
      category: "",
    },
    mode: "onTouched",
  })

  useEffect(() => {
    if (jobPost) {
      form.reset({
        title: jobPost.title,
        description: jobPost.description,
        paymentAmount: jobPost.paymentAmount || 0,
        deadline: jobPost.deadline ? new Date(jobPost.deadline) : new Date(),
        category: jobPost.category,
      })
      form.setFocus("title")
    }
  }, [jobPost, form])

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    const payload = {
      ...data,
      paymentAmount: Number(data.paymentAmount),
      location: selectedLocation,
    }

    try {
      let id = ""
      let res

      if (!jobPost) {
        res = await createJobPost(payload)
        id = res.id
        toast.success("Вакансия успешно создана")
        router.push(`/jobposts/update-images/${id}`)
      } else {
        res = await updateJobPost(payload, jobPost.id)
        id = jobPost.id
        toast.success("Вакансия успешно обновлена")
        router.push(`/jobposts/details/${id}`)
      }

      if (res.error) {
        throw res.error
      }
    } catch (error: any) {
      toast.error(`Ошибка: ${error.status} ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
          <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => router.push(`/my-posts`)}
          >
              <ArrowLeft className="h-4 w-4" />
              На главную
          </Button>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Название</FormLabel>
                <FormControl>
                  <Input placeholder="Введите название вакансии" {...field} />
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
                  <Textarea placeholder="Введите описание вакансии" className="min-h-[120px]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <FormField
              control={form.control}
              name="paymentAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Оплата (₽)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Введите сумму оплаты" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Дедлайн</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Выберите дату</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Категория</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите категорию" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoryOptions.map((group) => (
                        <div key={group.group}>
                          <SelectGroup>
                            <SelectLabel>{group.group}</SelectLabel>
                            {group.options.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Местоположение</FormLabel>
              <LocationInput />
              <FormDescription>Поиск местоположения по адресу или названию места</FormDescription>
              <FormMessage />
            </FormItem>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {jobPost ? "Обновление..." : "Создание..."}
                </>
              ) : jobPost ? (
                "Обновить вакансию"
              ) : (
                "Создать вакансию"
              )}
            </Button>
          </div>
        </form>
      </Form>

      {/* Image Management Section - Only shown when updating an existing job post */}
      {jobPost && (
        <div className="mt-8 pt-6 border-t">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium">Изображения вакансии</h3>
              <p className="text-sm text-muted-foreground">
                Добавьте или управляйте изображениями для этой вакансии
              </p>
            </div>
            <Button
              onClick={() => {
                if (jobPost && jobPost.id) {
                  router.push(`/jobposts/update-images/${jobPost.id}`)
                }
              }}
              variant="outline"
              className="gap-2"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-4 h-4"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              Управление изображениями
            </Button>
          </div>
          <div className="bg-muted/40 rounded-md p-4 border border-dashed">
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-2">
                {(jobPost as any).imageCount > 0 
                  ? `У этой вакансии ${(jobPost as any).imageCount} изображений` 
                  : "Изображения еще не добавлены"}
              </p>
              <p className="text-sm text-muted-foreground">
                Нажмите "Управление изображениями", чтобы добавить, просмотреть или удалить изображения для этой вакансии
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

