import type { Metadata } from "next"
import UserProfileContent from "./user-profile-content"

interface UserProfilePageProps {
  params: {
    username: string
  }
}

export async function generateMetadata({ params }: UserProfilePageProps): Promise<Metadata> {
  // You could fetch the user here to get their actual name for the title
  return {
    title: `${params.username}'s Profile | FindJob`,
    description: `View ${params.username}'s profile and reviews on FindJob`,
  }
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
  return <UserProfileContent username={params.username} />
}

