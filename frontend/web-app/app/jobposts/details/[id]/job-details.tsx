"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  getApplicants,
  getJobPostById,
  getMyRequests,
  getSimilarJobPosts,
  getImages,
  updateApplicationStatus,
  deleteJobPost
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"
import UpdateStatusDialog from "./components/update-status-dialog"
import { applyToJobPost } from "@/app/actions/applicationActions"
import { saveJobPost } from "@/app/actions/savedJobActions"


export default function JobDetails({ id }: { id: string }) {
  const [jobPost, setJobPost] = useState<JobPost | null>(null)
  const [user, setUser] = useState<any>(null)
  const [images, setImages] = useState<string[]>([])
  const [hasApplied, setHasApplied] = useState(false)
  const [applicants, setApplicants] = useState<JobPostRequest[]>([])
  const [similarJobs, setSimilarJobs] = useState<JobPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showApplyDialog, setShowApplyDialog] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [selectedApplicant, setSelectedApplicant] = useState<{ id: string; name: string; status: string } | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<"approved" | "rejected" | null>(null)
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
          if (userData.username === jobData.employer?.username) {
            const applicantsData = await getApplicants()
            // Filter applications to only show those for this job post
            const filteredApplicants = Array.isArray(applicantsData) 
              ? applicantsData.filter((applicant: JobPostRequest) => applicant.jobPostId === id)
              : []
            setApplicants(filteredApplicants)
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

  const handleStatusUpdate = async (applicationId: string, newStatus: string, notes?: string) => {
    try {
      setUpdatingStatus(applicationId)
      await updateApplicationStatus(applicationId, newStatus, notes)
      // Refresh applicants list
      const applicantsData = await getApplicants()
      setApplicants(Array.isArray(applicantsData) ? applicantsData : [])
    } catch (error) {
      console.error("Error updating application status:", error)
    } finally {
      setUpdatingStatus(null)
    }
  }

  const openStatusDialog = (applicant: JobPostRequest, status: "approved" | "rejected") => {
    setSelectedApplicant({
      id: applicant.id,
      name: applicant.applicant?.username || "Неизвестный пользователь",
      status: applicant.status
    })
    setSelectedStatus(status)
    setStatusDialogOpen(true)
  }

  if (loading || !jobPost) {
    return <div className="container mx-auto p-6 animate-pulse">{/* Add loading skeleton here */}</div>
  }

  const isEmployer = user?.username === jobPost.employer.username

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
          К списку вакансий
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
                    {jobPost.employer?.username || "Название компании"}
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
                  Опубликовано {new Date(jobPost.createdAt).toLocaleDateString()}
                </Badge>
                <Badge variant="secondary">
                  <DollarSign className="h-3 w-3 mr-1" />
                  {jobPost.paymentAmount}
                </Badge>
                <Badge>{getCategoryLabel(jobPost.category)}</Badge>
                <Badge variant={jobPost.status === "open" ? "default" : "secondary"}>{jobPost.status === "open" ? "Открыто" : "Закрыто"}</Badge>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Описание</h3>
                <p className="text-muted-foreground whitespace-pre-line">{jobPost.description}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="font-semibold">Срок подачи</h3>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {new Date(jobPost.deadline).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Местоположение</h3>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {jobPost.location?.city + ", " + jobPost.location?.street || "Местоположение не указано"}
                  </p>
                </div>
              </div>
            </CardContent>
            {!isEmployer && user && (
              <CardFooter>
                <Button className="w-full" onClick={() => setShowApplyDialog(true)} disabled={hasApplied}>
                  {hasApplied ? "Вы уже откликнулись" : "Откликнуться"}
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
                  Фотографии
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
                  Местоположение
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
                  Отклики к вакансии
                </CardTitle>
                <CardDescription>
                  {Array.isArray(applicants) ? applicants.length : 0} отклик{(Array.isArray(applicants) ? applicants.length : 0) !== 1 && "ов"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {Array.isArray(applicants) && applicants.length > 0 ? (
                      applicants.map((applicant, i) => (
                        <div key={applicant.id}>
                          {i > 0 && <Separator className="my-2" />}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar>
                                <AvatarImage src="/placeholder.svg" />
                                <AvatarFallback>{applicant.applicant?.username?.[0].toUpperCase() || "?"}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{applicant.applicant?.username || "Неизвестный пользователь"}</p>
                                <p className="text-sm text-muted-foreground">
                                  Откликнулся {applicant.createdAt ? new Date(applicant.createdAt).toLocaleDateString() : "Дата не указана"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge>{applicant.status === "pending" ? "На рассмотрении" : applicant.status === "approved" ? "Одобрено" : "Отклонено"}</Badge>
                              {applicant.status === "pending" && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" disabled={updatingStatus === applicant.id}>
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => openStatusDialog(applicant, "approved")}
                                      disabled={updatingStatus === applicant.id}
                                    >
                                      Одобрить
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => openStatusDialog(applicant, "rejected")}
                                      disabled={updatingStatus === applicant.id}
                                    >
                                      Отклонить
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Users className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Пока нет откликов на вакансию</p>
                        <p className="text-sm text-muted-foreground mt-2">Когда кто-то откликнется, вы увидите его здесь</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Similar Jobs */}
          {!isEmployer && (
            <Card>
              <CardHeader>
                <CardTitle>Похожие вакансии</CardTitle>
                <CardDescription>Другие вакансии в категории {getCategoryLabel(jobPost.category)}</CardDescription>
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
                            <p className="text-sm text-muted-foreground">{job.employer?.username || "Название компании"}</p>
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

      {/* Status Update Dialog */}
      {selectedApplicant && selectedStatus && (
        <UpdateStatusDialog
          open={statusDialogOpen}
          onOpenChange={setStatusDialogOpen}
          onConfirm={(notes) => handleStatusUpdate(selectedApplicant.id, selectedStatus, notes)}
          status={selectedStatus}
          applicantName={selectedApplicant.name}
        />
      )}
    </div>
  )
}

