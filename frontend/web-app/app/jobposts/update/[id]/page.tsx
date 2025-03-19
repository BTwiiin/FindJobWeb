import type { Metadata } from "next"
import { getJobPostById } from "@/app/actions/jobPostActions"
import JobPostForm from "@/app/components/job-post-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Update Job Post | FindJob",
  description: "Update your job posting details",
}

export default async function UpdateJobPostPage({ params }: { params: { id: string } }) {
  const jobPost = await getJobPostById(params.id)

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Update Job Post</CardTitle>
          <CardDescription>Make changes to your job posting here</CardDescription>
        </CardHeader>
        <CardContent>
          <JobPostForm jobPost={jobPost} />
        </CardContent>
      </Card>
    </div>
  )
}

