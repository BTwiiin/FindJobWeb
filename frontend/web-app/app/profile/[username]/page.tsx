import type { Metadata } from "next"
import UserProfileContent from "./user-profile-content"

interface UserProfilePageProps {
  params: {
    username: string
  }
}

export async function generateMetadata({ params }: UserProfilePageProps): Promise<Metadata> {
  // In Next.js App Router, we need to ensure params are properly handled
  const username = params.username
  
  return {
    title: `${username}'s Profile | FindJob`,
    description: `View ${username}'s profile and reviews on FindJob`,
  }
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  // By making this an async function, we ensure params are properly resolved
  const username = params.username
  
  return <UserProfileContent username={username} />
}

