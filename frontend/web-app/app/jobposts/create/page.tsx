import type { Metadata } from "next"
import JobPostForm from "@/app/components/job-post-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Создать вакансию | FindJob",
  description: "Создание новой вакансии",
}

export default function CreateJobPostPage() {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Создать вакансию</CardTitle>
          <CardDescription>Заполните форму ниже, чтобы создать новую вакансию</CardDescription>
        </CardHeader>
        <CardContent>
          <JobPostForm />
        </CardContent>
      </Card>
    </div>
  )
}

