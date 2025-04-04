"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { motion } from "framer-motion"
import { Loader2, CheckCircle2, XCircle, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { resendVerificationEmail } from "@/app/actions/authActions"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const token = searchParams.get("token")
  const email = searchParams.get("email")

  useEffect(() => {
    if (token) {
      verifyEmail(token)
    }
  }, [token])

  const verifyEmail = async (token: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email?token=${token}`)
      const data = await response.json()

      if (response.ok) {
        toast.success("Email успешно подтвержден!")
        router.push("/auth/login")
      } else {
        toast.error(data.message || "Ошибка подтверждения email")
      }
    } catch (error) {
      toast.error("Произошла ошибка при подтверждении email")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!email) return

    try {
      setIsResending(true)
      await resendVerificationEmail(email)
      toast.success("Письмо с подтверждением отправлено повторно")
    } catch (error: any) {
      toast.error(error.message || "Ошибка при отправке письма")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container max-w-lg mx-auto py-8"
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Подтверждение Email</CardTitle>
          <CardDescription className="text-center">
            {isLoading
              ? "Подтверждаем ваш email..."
              : token
              ? "Подтверждение email..."
              : "Проверьте вашу почту для подтверждения email"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Подтверждение email...</p>
            </div>
          ) : token ? (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Подтверждение email...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <Mail className="h-12 w-12 text-primary" />
              <p className="text-sm text-center text-muted-foreground">
                Мы отправили письмо с подтверждением на ваш email. Пожалуйста, проверьте почту и перейдите по ссылке для подтверждения.
              </p>
              <Button
                variant="outline"
                onClick={handleResendVerification}
                disabled={isResending}
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Отправка...
                  </>
                ) : (
                  "Отправить письмо повторно"
                )}
              </Button>
              <Button variant="outline" onClick={() => router.push("/auth/login")}>
                Перейти ко входу
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
} 