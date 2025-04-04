"use client"

import { useSearchParams } from "next/navigation"
import { AuthLayout } from "@/app/components/auth-layout"
import ProfileCompletionForm from "./profile-completion-form"

export default function CompleteProfilePage() {
  const searchParams = useSearchParams()
  const id = searchParams.get("id")

  if (!id) {
    return (
      <AuthLayout
        title="Ошибка"
        subtitle="ID пользователя не найден"
        backLinkText="Вернуться в профиль"
        backLinkHref="/profile"
      >
        <div className="text-center text-muted-foreground">
          Произошла ошибка при загрузке страницы. Пожалуйста, попробуйте снова.
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Заполнение профиля"
      subtitle="Дополните информацию о себе"
      backLinkText="Вернуться в профиль"
      backLinkHref="/profile"
    >
      <ProfileCompletionForm />
    </AuthLayout>
  )
} 