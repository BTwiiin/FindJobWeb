"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Clock, FileText, Search, SlidersHorizontal, X, Star, Check } from "lucide-react"
import { getCurrentUser } from "@/app/actions/authActions"
import { getMyRequests, withdrawApplication } from "@/app/actions/applicationActions"
import { createReview, getAlreadyReviewed, getReviewsByUser } from "@/app/actions/reviewActions"
import type { JobPost, User } from "@/types"
import { useJobPostStore } from "@/app/hooks/useJobPostStore"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ApplicationStatus, JobPostRequest } from "@/types/job-application"
import { ReviewDialog } from "./components/review-dialog"
import useAlreadyReviewedStore from "../hooks/useAlreadyReviewedStore"
import { getJobPostById } from "../actions/jobPostActions"

const getStatusColor = (status: ApplicationStatus) => {
  switch (status) {
    case ApplicationStatus.ACCEPTED:
      return "bg-green-500"
    case ApplicationStatus.REJECTED:
      return "bg-red-500"
    case ApplicationStatus.PENDING:
      return "bg-yellow-500"
    case ApplicationStatus.COMPLETED:
      return "bg-blue-500"
    case ApplicationStatus.WITHDRAWN:
      return "bg-gray-500"
    case ApplicationStatus.CANCELLED:
      return "bg-gray-500"
    default:
      return "bg-gray-500"
  }
}

const getStatusText = (status: ApplicationStatus) => {
  switch (status) {
    case ApplicationStatus.ACCEPTED:
      return "Принято"
    case ApplicationStatus.REJECTED:
      return "Отклонено"
    case ApplicationStatus.PENDING:
      return "На рассмотрении"
    case ApplicationStatus.COMPLETED:
      return "Завершено"
    case ApplicationStatus.WITHDRAWN:
      return "Отозвано"
    case ApplicationStatus.CANCELLED:
      return "Отменено"
    default:
      return status
  }
}

interface ApplicationsListProps {
  applications: JobPostRequest[]
  jobPosts: JobPost[]
  getJobPostDetails: (id: string) => JobPost | undefined
  formatDate: (date: string) => string
  router: ReturnType<typeof useRouter>
  handleWithdraw: (applicationId: string) => Promise<void>
  withdrawingId: string | null
  reviews: Record<string, boolean>
  handleReview: (applicationId: string) => void
  isSubmittingReview: boolean
}

function ApplicationsList({ 
  applications, 
  getJobPostDetails, 
  formatDate, 
  router, 
  handleWithdraw, 
  withdrawingId, 
  reviews,
  handleReview,
  isSubmittingReview 
}: ApplicationsListProps) {
  const { alreadyReviewed } = useAlreadyReviewedStore()
  const [jobPostsMap, setJobPostsMap] = useState<Record<string, JobPost>>({})

  useEffect(() => {
    const fetchMissingJobPosts = async () => {
      const missingJobPosts = applications.filter(app => {
        return !getJobPostDetails(app.jobPostId) && !jobPostsMap[app.jobPostId]
      })

      if (missingJobPosts.length === 0) return

      const newJobPosts: Record<string, JobPost> = {}
      
      await Promise.all(
        missingJobPosts.map(async (app) => {
          try {
            const jobPost = await getJobPostById(app.jobPostId)
            if (jobPost) {
              newJobPosts[app.jobPostId] = jobPost
            }
          } catch (error) {
            console.error("Error fetching job post:", error)
          }
        })
      )

      setJobPostsMap(prev => ({ ...prev, ...newJobPosts }))
    }

    fetchMissingJobPosts()
  }, [applications])

  return (
    <div className="grid gap-4">
      {applications.map((application) => {
        const jobPost = getJobPostDetails(application.jobPostId) || jobPostsMap[application.jobPostId]

        if (!jobPost) return null

        return (
          <Card
            key={application.id}
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => router.push(`/jobposts/details/${application.jobPostId}`)}
          >
            <CardContent className="p-6">
              <div className="grid md:grid-cols-[1fr_auto] gap-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg">{jobPost.title}</h3>
                    <p className="text-muted-foreground">{jobPost.employer.username}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={
                        application.status === ApplicationStatus.ACCEPTED
                          ? "secondary"
                          : application.status === ApplicationStatus.REJECTED
                            ? "destructive"
                            : application.status === ApplicationStatus.WITHDRAWN
                              ? "outline"
                              : "outline"
                      }
                      className={getStatusColor(application.status)}
                    >
                      {getStatusText(application.status)}
                    </Badge>
                    <Badge variant="outline">{jobPost.paymentAmount}₽</Badge>
                    {jobPost.location && <Badge variant="outline">{jobPost.location.city}</Badge>}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Откликнулся: {formatDate(application.createdAt)}</span>
                    </div>
                    {application.status !== ApplicationStatus.PENDING && application.updatedAt && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{getStatusText(application.status)}: {formatDate(application.updatedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {application.status === ApplicationStatus.PENDING && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-2"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleWithdraw(application.id)
                      }}
                      disabled={withdrawingId === application.id}
                    >
                      <X className="h-4 w-4" />
                      <span>Отозвать</span>
                    </Button>
                  )}
                  {application.status === ApplicationStatus.COMPLETED && !alreadyReviewed.includes(application.id) && (
                    <Button
                      variant="default"
                      size="sm"
                      className="gap-2"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleReview(application.id)
                      }}
                      disabled={isSubmittingReview}
                    >
                      <Star className="h-4 w-4" />
                      <span>{isSubmittingReview ? "Отправка..." : "Оставить отзыв"}</span>
                    </Button>
                  )}
                  {application.status === ApplicationStatus.COMPLETED && reviews[application.id] && (
                    <Badge variant="secondary" className="gap-2">
                      <Check className="h-4 w-4" />
                      <span>Отзыв оставлен</span>
                    </Badge>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/jobposts/details/${application.jobPostId}`)
                    }}
                  >
                    <FileText className="h-4 w-4" />
                    <span>Подробнее</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default function ApplicationsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [applications, setApplications] = useState<JobPostRequest[]>([])
  const [filteredApplications, setFilteredApplications] = useState<JobPostRequest[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null)
  const [reviews, setReviews] = useState<{ [key: string]: boolean }>({})
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false)
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null)
  const router = useRouter()

  const { jobPosts } = useJobPostStore((state) => state)
  const store = useAlreadyReviewedStore()

  const handleReview = (applicationId: string) => {
    setSelectedApplicationId(applicationId)
    store.addAlreadyReviewed(applicationId)
  }

  const handleReviewSuccess = () => {
    setReviews(prev => ({
      ...prev,
      [selectedApplicationId!]: true
    }))
  }

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!store._hasHydrated) {
        try {
          const initialData = await getAlreadyReviewed();
          store.hydrateFromServer(initialData);
        } catch (error) {
          console.error('Failed to fetch initial already reviewed data:', error);
        }
      }
    };

    fetchInitialData();
  }, [store._hasHydrated, store.hydrateFromServer]);

  useEffect(() => {
    const fetchApplicationsData = async () => {
      try {
        setIsLoading(true)
        const userData = await getCurrentUser()
        if (userData) {
          setUser(userData)
          const applications = await getMyRequests()
          setApplications(applications)
          setFilteredApplications(applications)
          
          // Fetch reviews for completed applications
          const reviewsData = await Promise.all(
            applications
              .filter((app: JobPostRequest) => app.status === ApplicationStatus.COMPLETED)
              .map(async (app: JobPostRequest) => {
                try {
                  const reviews = await getReviewsByUser(app.id);
                  return { id: app.id, hasReview: reviews.length > 0 };
                } catch (error) {
                  console.error(`Error fetching review for application ${app.id}:`, error);
                  return { id: app.id, hasReview: false };
                }
              })
          )
          
          const reviewsMap = reviewsData.reduce((acc, { id, hasReview }) => {
            acc[id] = hasReview
            return acc
          }, {} as { [key: string]: boolean })
          
          setReviews(reviewsMap)
        } else {
          setError("User not found")
        }
      } catch (err: unknown) {
        setError(`An error occurred while fetching applications data: ${err}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchApplicationsData()
  }, [])

  useEffect(() => {
    // Apply filters whenever filter states change
    let result = applications

    // Apply search filter
    if (searchQuery) {
      result = result.filter((app) => {
        const jobPost = jobPosts.find((post) => post.id === app.jobPostId)
        return jobPost?.title.toLowerCase().includes(searchQuery.toLowerCase())
      })
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((app) => app.status === statusFilter)
    }

    // Apply date filter
    if (dateFilter !== "all") {
      const now = new Date()
      const oneDay = 24 * 60 * 60 * 1000
      const oneWeek = 7 * oneDay
      const oneMonth = 30 * oneDay

      result = result.filter((app) => {
        const appDate = new Date(app.createdAt)
        const timeDiff = now.getTime() - appDate.getTime()

        switch (dateFilter) {
          case "today":
            return timeDiff < oneDay
          case "week":
            return timeDiff < oneWeek
          case "month":
            return timeDiff < oneMonth
          default:
            return true
        }
      })
    }

    setFilteredApplications(result)
  }, [applications, searchQuery, statusFilter, dateFilter, jobPosts])

  // Categorize applications by status
  const pendingApplications = filteredApplications.filter((app) => app.status === ApplicationStatus.PENDING)
  const acceptedApplications = filteredApplications.filter((app) => app.status === ApplicationStatus.ACCEPTED)
  const completedApplications = filteredApplications.filter((app) => app.status === ApplicationStatus.COMPLETED)
  const rejectedApplications = filteredApplications.filter((app) => app.status === ApplicationStatus.REJECTED)
  const withdrawnApplications = filteredApplications.filter((app) => app.status === ApplicationStatus.WITHDRAWN)
  const cancelledApplications = filteredApplications.filter((app) => app.status === ApplicationStatus.CANCELLED)

  const getJobPostDetails = (jobPostId: string) => {
    return jobPosts.find((post) => post.id === jobPostId)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleWithdraw = async (applicationId: string) => {
    try {
      setWithdrawingId(applicationId)
      await withdrawApplication(applicationId)
      // Refresh applications list
      const updatedApplications = await getMyRequests()
      setApplications(updatedApplications)
      setFilteredApplications(updatedApplications)
    } catch (error) {
      console.error("Error withdrawing application:", error)
    } finally {
      setWithdrawingId(null)
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Please wait while we fetch your applications</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => router.push(`/`)}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">К списку вакансий</span>
        </Button>
      </div>

      <div className="flex flex-col gap-6 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Мои заявки</h1>
          <p className="text-muted-foreground">Отслеживайте и управляйте всеми вашими заявками</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Поиск заявок..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                <span>Фильтры</span>
                {(statusFilter !== "all" || dateFilter !== "all") && (
                  <Badge variant="secondary" className="ml-1">
                    {statusFilter !== "all" && dateFilter !== "all" ? 2 : 1}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Фильтры заявок</SheetTitle>
                <SheetDescription>Отфильтруйте заявки по статусу и дате</SheetDescription>
              </SheetHeader>
              <div className="grid gap-6 py-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Статус</h3>
                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ApplicationStatus | "all")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все статусы</SelectItem>
                      <SelectItem value={ApplicationStatus.PENDING}>На рассмотрении</SelectItem>
                      <SelectItem value={ApplicationStatus.ACCEPTED}>Принято</SelectItem>
                      <SelectItem value={ApplicationStatus.COMPLETED}>Завершено</SelectItem>
                      <SelectItem value={ApplicationStatus.REJECTED}>Отклонено</SelectItem>
                      <SelectItem value={ApplicationStatus.WITHDRAWN}>Отозвано</SelectItem>
                      <SelectItem value={ApplicationStatus.CANCELLED}>Отменено</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Дата подачи</h3>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите период" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все время</SelectItem>
                      <SelectItem value="today">Сегодня</SelectItem>
                      <SelectItem value="week">Эта неделя</SelectItem>
                      <SelectItem value="month">Этот месяц</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setStatusFilter("all")
                    setDateFilter("all")
                  }}
                >
                  Сбросить фильтры
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {filteredApplications.length === 0 ? (
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle>Нет заявок</CardTitle>
            <CardDescription>
              {applications.length === 0
                ? "Вы еще не откликнулись ни на одну вакансию."
                : "Нет заявок, соответствующих текущим фильтрам."}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center pb-6">
            <Button onClick={() => router.push("/")}>Просмотреть вакансии</Button>
          </CardFooter>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-7 gap-2">
            <TabsTrigger value="all" className="text-sm">
              Все
              <Badge variant="secondary" className="ml-2">
                {filteredApplications.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-sm">
              На рассмотрении
              <Badge variant="secondary" className="ml-2">
                {pendingApplications.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="accepted" className="text-sm hidden sm:block">
              Принято
              <Badge variant="secondary" className="ml-2">
                {acceptedApplications.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-sm hidden sm:block">
              Завершено
              <Badge variant="secondary" className="ml-2">
                {completedApplications.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="text-sm hidden sm:block">
              Отклонено
              <Badge variant="secondary" className="ml-2">
                {rejectedApplications.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="withdrawn" className="text-sm hidden sm:block">
              Отозвано
              <Badge variant="secondary" className="ml-2">
                {withdrawnApplications.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="text-sm hidden sm:block">
              Отменено
              <Badge variant="secondary" className="ml-2">
                {cancelledApplications.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <ApplicationsList
              applications={filteredApplications}
              jobPosts={jobPosts}
              getJobPostDetails={getJobPostDetails}
              formatDate={formatDate}
              router={router}
              handleWithdraw={handleWithdraw}
              withdrawingId={withdrawingId}
              reviews={reviews}
              handleReview={handleReview}
              isSubmittingReview={isSubmittingReview}
            />
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <ApplicationsList
              applications={pendingApplications}
              jobPosts={jobPosts}
              getJobPostDetails={getJobPostDetails}
              formatDate={formatDate}
              router={router}
              handleWithdraw={handleWithdraw}
              withdrawingId={withdrawingId}
              reviews={reviews}
              handleReview={handleReview}
              isSubmittingReview={isSubmittingReview}
            />
          </TabsContent>

          <TabsContent value="accepted" className="mt-6">
            <ApplicationsList
              applications={acceptedApplications}
              jobPosts={jobPosts}
              getJobPostDetails={getJobPostDetails}
              formatDate={formatDate}
              router={router}
              handleWithdraw={handleWithdraw}
              withdrawingId={withdrawingId}
              reviews={reviews}
              handleReview={handleReview}
              isSubmittingReview={isSubmittingReview}
            />
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <ApplicationsList
              applications={completedApplications}
              jobPosts={jobPosts}
              getJobPostDetails={getJobPostDetails}
              formatDate={formatDate}
              router={router}
              handleWithdraw={handleWithdraw}
              withdrawingId={withdrawingId}
              reviews={reviews}
              handleReview={handleReview}
              isSubmittingReview={isSubmittingReview}
            />
          </TabsContent>

          <TabsContent value="rejected" className="mt-6">
            <ApplicationsList
              applications={rejectedApplications}
              jobPosts={jobPosts}
              getJobPostDetails={getJobPostDetails}
              formatDate={formatDate}
              router={router}
              handleWithdraw={handleWithdraw}
              withdrawingId={withdrawingId}
              reviews={reviews}
              handleReview={handleReview}
              isSubmittingReview={isSubmittingReview}
            />
          </TabsContent>

          <TabsContent value="withdrawn" className="mt-6">
            <ApplicationsList
              applications={withdrawnApplications}
              jobPosts={jobPosts}
              getJobPostDetails={getJobPostDetails}
              formatDate={formatDate}
              router={router}
              handleWithdraw={handleWithdraw}
              withdrawingId={withdrawingId}
              reviews={reviews}
              handleReview={handleReview}
              isSubmittingReview={isSubmittingReview}
            />
          </TabsContent>

          <TabsContent value="cancelled" className="mt-6">
            <ApplicationsList
              applications={cancelledApplications}
              jobPosts={jobPosts}
              getJobPostDetails={getJobPostDetails}
              formatDate={formatDate}
              router={router}
              handleWithdraw={handleWithdraw}
              withdrawingId={withdrawingId}
              reviews={reviews}
              handleReview={handleReview}
              isSubmittingReview={isSubmittingReview}
            />
          </TabsContent>
        </Tabs>
      )}

      <ReviewDialog
        applicationId={selectedApplicationId!}
        isOpen={!!selectedApplicationId}
        onClose={() => setSelectedApplicationId(null)}
        onSuccess={handleReviewSuccess}
      />
    </div>
  )
}


