import type { Metadata } from "next"
import SavedContent from "./saved-content"

export const metadata: Metadata = {
  title: "Saved Jobs | FindJob",
  description: "View and manage your saved job posts",
}

export default function SavedPage() {
  return <SavedContent />
}
