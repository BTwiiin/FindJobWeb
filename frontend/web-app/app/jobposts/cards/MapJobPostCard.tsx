import Link from "next/link"
import type { JobPost } from "@/types"
import { MapPin, Clock, DollarSign, Calendar, ArrowUpRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type Props = {
  jobPost: JobPost
}

export default function MapJobPostCard({ jobPost }: Props) {
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
    <div className="w-full">
      <div className="p-3 border-b bg-muted/10">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-md overflow-hidden bg-muted flex items-center justify-center">
            <img src="/favicon.ico" alt={`Company logo for ${jobPost.title}`} className="h-full w-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{jobPost.title}</h3>
            <p className="text-muted-foreground text-xs">{jobPost.employer || "Company Name"}</p>
          </div>
          <Badge
            variant={jobPost.category === "IT" ? "default" : jobPost.category === "Marketing" ? "secondary" : "outline"}
            className="text-xs"
          >
            {jobPost.category}
          </Badge>
        </div>
      </div>

      <div className="p-3 space-y-2">
        <div className="flex items-center gap-2 text-xs">
          <DollarSign className="h-3 w-3 text-green-500" />
          <span className="font-medium text-green-600">
            {jobPost.paymentAmount ? `${jobPost.paymentAmount}$` : "Undisclosed"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          <span className="text-muted-foreground truncate">{locationString || "Location not provided"}</span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Calendar className={`h-3 w-3 ${deadlineColorClass}`} />
          <span className={`${deadlineColorClass}`}>
            {deadline.toLocaleDateString()} {deadline.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            {isNew ? (
              <span className="text-[10px] bg-green-100 text-green-600 font-semibold px-1.5 py-0.5 rounded-full">
                New
              </span>
            ) : (
              <span className="text-[10px] text-muted-foreground">{diffDays}d ago</span>
            )}
          </div>
          <Link href={`/jobposts/details/${jobPost.id}`}>
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
              View Details
              <ArrowUpRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

