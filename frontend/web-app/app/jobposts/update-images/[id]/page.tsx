import type { Metadata } from "next"
import ImageManager from "./image-manager"

export const metadata: Metadata = {
  title: "Manage Images | FindJob",
  description: "Add or remove images for your job posting",
}

export default function ImageManagementPage({ params }: { params: { id: string } }) {
  return <ImageManager id={params.id} />
}

