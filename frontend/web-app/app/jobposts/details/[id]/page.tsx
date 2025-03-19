import type { Metadata } from "next"
import JobDetails from "./job-details"

export const metadata: Metadata = {
  title: "Job Details | FindJob",
  description: "View detailed information about this job posting",
}

export default function JobDetailsPage({ params }: { params: { id: string } }) {
  return <JobDetails id={params.id} />
}