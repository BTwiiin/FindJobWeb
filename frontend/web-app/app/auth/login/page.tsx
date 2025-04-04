import type { Metadata } from "next"
import LoginForm from "./login-form"
import { AuthLayout } from "@/app/components/auth-layout"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { Loader2 } from "lucide-react"

export const metadata: Metadata = {
  title: "Вход | FindJob",
  description: "Войдите в свой аккаунт FindJob",
}

export default function LoginPage() {
  return (
    <AuthLayout
      title="С возвращением"
      subtitle="Введите свои учетные данные для входа в аккаунт"
      backLinkText="Нет аккаунта?"
      backLinkHref="/auth/register"
    >
      <LoginForm />
    </AuthLayout>
  )
}

