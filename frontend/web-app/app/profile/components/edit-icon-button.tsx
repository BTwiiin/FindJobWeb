"use client"

import { useRouter } from "next/navigation"
import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"

type Props = {
  id: string
}

export default function EditIconButton({ id }: Props) {
  const router = useRouter()

  return (
    <Button variant="ghost" size="icon" onClick={() => router.push(`/jobposts/update/${id}`)} title="Edit Job Post">
      <Pencil className="h-4 w-4" />
    </Button>
  )
}

