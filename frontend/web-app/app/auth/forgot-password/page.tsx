"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "react-hot-toast"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { AuthLayout } from "@/app/components/auth-layout"
import { requestPasswordReset } from "@/app/actions/authActions"

const formSchema = z.object({
  email: z.string().email({
    message: "Введите корректный email",
  }),
})

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true)
      await requestPasswordReset(values.email)
      toast.success("Инструкции по сбросу пароля отправлены на ваш email")
      router.push("/auth/login")
    } catch (error: any) {
      toast.error(error.message || "Ошибка при запросе сброса пароля")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Восстановление пароля"
      subtitle="Введите ваш email, и мы отправим инструкции по сбросу пароля"
      backLinkText="Вернуться к входу"
      backLinkHref="/auth/login"
    >
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Введите ваш email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Отправка...
                </>
              ) : (
                "Отправить инструкции"
              )}
            </Button>
          </form>
        </Form>
      </motion.div>
    </AuthLayout>
  )
} 