"use client"
import Link from "next/link"
import type { JobPost } from "@/types"
import { useJobHoverStore } from "@/app/hooks/useJobHoverStore"
import { MapPin, Clock, DollarSign, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getCategoryLabel } from "@/utils/categoryMapping"

type Props = {
  jobPost: JobPost
}

export default function JobPostCard({ jobPost }: Props) {
  const setHoveredJobPostId = useJobHoverStore((state) => state.setHoveredJobPostId)

  const deadline = new Date(jobPost.deadline)
  const createdAt = new Date(jobPost.createdAt)
  const now = new Date()
  const diffTime = now.getTime() - createdAt.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  // Color the deadline icon based on how old the post is
  let deadlineColorClass = "text-red-600"
  if (diffDays > 7) deadlineColorClass = "text-green-600"
  else if (diffDays <= 7 && diffDays >= 1) deadlineColorClass = "text-yellow-600"

  const isNew = diffDays < 2

  // Construct a formatted location string by filtering out empty fields
  const locationParts = [jobPost.location?.city, jobPost.location?.district, jobPost.location?.street].filter(Boolean)
  const locationString = locationParts.join(", ")

  return (
    <Card
      className="overflow-hidden hover:shadow-md transition-shadow"
      onMouseEnter={() => setHoveredJobPostId(jobPost.id)}
      onMouseLeave={() => setHoveredJobPostId(null)}
    >
      <CardContent className="p-0">
        <Link href={`/jobposts/details/${jobPost.id}`} className="block">
          <div className="p-4 border-b bg-muted/10">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                <img
                  src="/favicon.ico"
                  alt={`Company logo for ${jobPost.title}`}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">{jobPost.title}</h3>
                <p className="text-muted-foreground text-sm">{jobPost.employer.username || "Company Name"}</p>
              </div>
              <Badge
                variant="outline"
              >
                {getCategoryLabel(jobPost.category)}
              </Badge>
            </div>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="font-medium text-green-600">
                {jobPost.paymentAmount ? `${jobPost.paymentAmount}$` : "Undisclosed"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground truncate">{locationString || "Location not provided"}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Calendar className={`h-4 w-4 ${deadlineColorClass}`} />
              <span className={`${deadlineColorClass}`}>
                {deadline.toLocaleDateString()}{" "}
                {deadline.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {isNew ? (
                  <span className="text-xs bg-green-100 text-green-600 font-semibold px-2 py-0.5 rounded-full">
                    Новое
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">{diffDays}d ago</span>
                )}
              </div>
              <Button size="sm">Откликнуться</Button>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  )
}