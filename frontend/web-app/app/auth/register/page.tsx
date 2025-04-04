import type { Metadata } from "next"
import RegisterForm from "./register-form"
import { AuthLayout } from "@/app/components/auth-layout"

export const metadata: Metadata = {
  title: "Регистрация | FindJob",
  description: "Создайте новый аккаунт FindJob",
}

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Создать аккаунт"
      subtitle="Присоединяйтесь к FindJob, чтобы начать свой путь"
      backLinkText="Уже есть аккаунт?"
      backLinkHref="/auth/login"
    >
      <RegisterForm />
    </AuthLayout>
  )
}

