// Server Component
import { getCurrentUser } from "../actions/authActions"
import JobSearchHeaderClient from "@/app/components/JobSearchHeaderClient"

export default async function JobSearchHeader() {
  // Server-side data fetching
  const user = await getCurrentUser();
  
  // Pass data to client component
  return <JobSearchHeaderClient user={user} />;
}

