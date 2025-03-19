import type { Metadata } from "next"
import JobPostForm from "@/app/components/job-post-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Create Job Post | FindJob",
  description: "Create a new job posting",
}

export default function CreateJobPostPage() {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Job Post</CardTitle>
          <CardDescription>Fill out the form below to create a new job posting</CardDescription>
        </CardHeader>
        <CardContent>
          <JobPostForm />
        </CardContent>
      </Card>
    </div>
  )
}

