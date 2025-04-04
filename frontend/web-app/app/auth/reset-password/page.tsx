"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "react-hot-toast"
import { motion } from "framer-motion"
import { Eye, EyeOff, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { AuthLayout } from "@/app/components/auth-layout"
import { resetPassword } from "@/app/actions/authActions"

const formSchema = z.object({
  newPassword: z.string().min(6, {
    message: "Пароль должен содержать минимум 6 символов",
  }),
  confirmPassword: z.string().min(1, {
    message: "Подтвердите новый пароль",
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
})

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [isLoading, setIsLoading] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!token) {
      toast.error("Неверная ссылка для сброса пароля")
      return
    }

    try {
      setIsLoading(true)
      await resetPassword(token, values.newPassword)
      toast.success("Пароль успешно изменен!")
      router.push("/auth/login")
    } catch (error: any) {
      toast.error(error.message || "Ошибка при сбросе пароля")
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <AuthLayout
        title="Ошибка"
        subtitle="Неверная ссылка для сброса пароля. Пожалуйста, запросите новую ссылку."
        backLinkText="Запросить новую ссылку"
        backLinkHref="/auth/forgot-password"
      >
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Button
            className="w-full"
            onClick={() => router.push("/auth/forgot-password")}
          >
            Запросить новую ссылку
          </Button>
        </motion.div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Сброс пароля"
      subtitle="Введите новый пароль"
      backLinkText="Вернуться к входу"
      backLinkHref="/auth/login"
    >
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Новый пароль</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Введите новый пароль"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Подтвердите новый пароль</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Подтвердите новый пароль"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Сброс пароля...
                </>
              ) : (
                "Сбросить пароль"
              )}
            </Button>
          </form>
        </Form>
      </motion.div>
    </AuthLayout>
  )
} 