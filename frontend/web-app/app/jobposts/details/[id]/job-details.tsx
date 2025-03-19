"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  getApplicants,
  getJobPostById,
  getMyRequests,
  getSimilarJobPosts,
  getImages,
} from "@/app/actions/jobPostActions"
import { getCurrentUser } from "@/app/actions/authActions"
import type { JobPost, JobPostRequest } from "@/types"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, DollarSign, MapPin, Briefcase, ImageIcon, Users, ChevronRight, ArrowLeft } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import EditIconButton from "@/app/profile/components/edit-icon-button"
import DeleteIconButton from "@/app/profile/components/delete-icon-button"
import ImageGallery from "./components/image-gallery"
import MapView from "./components/map-view"
import ApplyDialog from "./components/apply-dialog"
import { getCategoryLabel } from "@/utils/categoryMapping"


export default function JobDetails({ id }: { id: string }) {
  const [jobPost, setJobPost] = useState<JobPost | null>(null)
  const [user, setUser] = useState<any>(null)
  const [images, setImages] = useState<string[]>([])
  const [hasApplied, setHasApplied] = useState(false)
  const [applicants, setApplicants] = useState<JobPostRequest[]>([])
  const [similarJobs, setSimilarJobs] = useState<JobPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showApplyDialog, setShowApplyDialog] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      try {
        const [jobData, userData, imagesData] = await Promise.all([getJobPostById(id), getCurrentUser(), getImages(id)])

        console.log('Job data received:', jobData)
        setJobPost(jobData)
        setUser(userData)
        setImages(Array.isArray(imagesData) ? imagesData : [])

        // Fetch similar jobs immediately after getting job data
        if (jobData?.category) {
          console.log('Fetching similar jobs for category:', jobData.category)
          const similar = await getSimilarJobPosts(jobData.category.toLowerCase())
          console.log('Similar jobs received:', similar)
          // Filter out the current job and ensure we have valid jobs
          const filteredJobs = similar.filter((job) => job && job.id && job.id !== id)
          console.log('Filtered similar jobs:', filteredJobs)
          setSimilarJobs(filteredJobs)
        }

        if (userData) {
          if (userData.username === jobData.employer) {
            const applicantsData = await getApplicants(id)
            setApplicants(Array.isArray(applicantsData) ? applicantsData : [])
          } else {
            const requests = await getMyRequests()
            setHasApplied(Array.isArray(requests) && requests.some((request: JobPostRequest) => request.jobPostId === id))
          }
        }
      } catch (error) {
        console.error("Error fetching job details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  if (loading || !jobPost) {
    return <div className="container mx-auto p-6 animate-pulse">{/* Add loading skeleton here */}</div>
  }

  const isEmployer = user?.username === jobPost.employer

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => router.push(`/`)}
        >
          <ArrowLeft className="h-4 w-4" />
          Go to Job Posts
        </Button>

      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-2xl">{jobPost.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    {jobPost.employer}
                  </CardDescription>
                </div>
                {isEmployer && (
                  <div className="flex gap-2">
                    <EditIconButton id={jobPost.id} />
                    <DeleteIconButton id={jobPost.id} />
                    
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  <Calendar className="h-3 w-3 mr-1" />
                  Posted {new Date(jobPost.createdAt).toLocaleDateString()}
                </Badge>
                <Badge variant="secondary">
                  <DollarSign className="h-3 w-3 mr-1" />
                  {jobPost.paymentAmount}
                </Badge>
                <Badge>{getCategoryLabel(jobPost.category)}</Badge>
                <Badge variant={jobPost.status === "Open" ? "default" : "secondary"}>{jobPost.status}</Badge>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Description</h3>
                <p className="text-muted-foreground whitespace-pre-line">{jobPost.description}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="font-semibold">Deadline</h3>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {new Date(jobPost.deadline).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Location</h3>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {jobPost.location?.city + ", " + jobPost.location?.street || "Location not specified"}
                  </p>
                </div>
              </div>
            </CardContent>
            {!isEmployer && (
              <CardFooter>
                <Button className="w-full" onClick={() => setShowApplyDialog(true)} disabled={hasApplied}>
                  {hasApplied ? "Already Applied" : "Apply Now"}
                </Button>
              </CardFooter>
            )}
          </Card>

          {/* Images and Map */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Images
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ImageGallery images={images} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MapView latitude={jobPost.location?.latitude} longitude={jobPost.location?.longitude} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Applicants Section (for employer) */}
          {isEmployer && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Applicants
                </CardTitle>
                <CardDescription>
                  {Array.isArray(applicants) ? applicants.length : 0} application{(Array.isArray(applicants) ? applicants.length : 0) !== 1 && "s"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {Array.isArray(applicants) && applicants.map((applicant, i) => (
                      <div key={applicant.id}>
                        {i > 0 && <Separator className="my-2" />}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar>
                              <AvatarImage src="/placeholder.svg" />
                              <AvatarFallback>{applicant.employee[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{applicant.employee}</p>
                              <p className="text-sm text-muted-foreground">
                                Applied {new Date(applicant.applyDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge>{applicant.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Similar Jobs */}
          {!isEmployer && (
            <Card>
              <CardHeader>
                <CardTitle>Similar Jobs</CardTitle>
                <CardDescription>More {getCategoryLabel(jobPost.category)} jobs you might like</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {similarJobs.map((job, i) => (
                      <div
                        key={job.id}
                        className="group cursor-pointer"
                        onClick={() => router.push(`/jobposts/details/${job.id}`)}
                      >
                        {i > 0 && <Separator className="my-4" />}
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <p className="font-medium group-hover:text-primary">{job.title}</p>
                            <p className="text-sm text-muted-foreground">{job.employer}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">
                                <DollarSign className="h-3 w-3 mr-1" />
                                {job.paymentAmount}
                              </Badge>
                              <Badge variant="outline">{getCategoryLabel(job.category)}</Badge>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Apply Dialog */}
      <ApplyDialog open={showApplyDialog} onOpenChange={setShowApplyDialog} jobPost={jobPost} />
    </div>
  )
}

