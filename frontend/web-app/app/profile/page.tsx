import type { Metadata } from "next"
import ProfileContent from "@/app/profile/profile-content"

export const metadata: Metadata = {
  title: "Profile | FindJob",
  description: "Your FindJob profile and activity",
}

export default function ProfilePage() {
  return <ProfileContent />
}

