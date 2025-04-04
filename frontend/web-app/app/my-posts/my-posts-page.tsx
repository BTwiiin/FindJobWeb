"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus, Briefcase, Users, Archive, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { JobPost } from "@/types"
import { getMyJobPosts } from "@/app/actions/jobPostActions"
import { getApplicants } from "@/app/actions/applicationActions"
import { useToast } from "@/hooks/use-toast"
import { JobApplication, ApplicationStatus } from "@/types/job-application"
import { ApplicationResponseDialog } from "./components/application-response-dialog"
import { JobPostCard } from "./components/job-post-card"
import { ApplicationCard } from "./components/application-card"
import { SearchAndFilters } from "./components/search-and-filters"
import { ConstructionLoading } from "../components/loading-screens/construction-loading"

export default function MyPostsPage() {
    const [jobPosts, setJobPosts] = useState<JobPost[]>([])
    const [applications, setApplications] = useState<JobApplication[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [activeTab, setActiveTab] = useState("active")
    const [activeStatusFilter, setActiveStatusFilter] = useState<"all" | "open" | "closed">("all")
    const [applicationsStatusFilter, setApplicationsStatusFilter] = useState<"all" | ApplicationStatus>("all")
    const [dateFilter, setDateFilter] = useState<string>("all")
    const [filteredJobPosts, setFilteredJobPosts] = useState<JobPost[]>([])
    const [filteredApplications, setFilteredApplications] = useState<JobApplication[]>([])
    const { toast } = useToast()

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [postsData, applicationsData] = await Promise.all([
                    getMyJobPosts(),
                    getApplicants()
                ])
                setJobPosts(postsData)
                setApplications(applicationsData)
            } catch (error) {
                toast({
                    title: "Ошибка",
                    description: "Не удалось загрузить данные",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [toast])

    useEffect(() => {
        // Apply filters to job posts
        let result = jobPosts

        // Apply search filter
        if (searchQuery) {
            result = result.filter((post) => 
                post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.description.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        // Apply status filter based on active tab
        if (activeTab === "active" && activeStatusFilter !== "all") {
            result = result.filter((post) => post.status === activeStatusFilter)
        }

        // Apply date filter
        if (dateFilter !== "all") {
            const now = new Date()
            const oneDay = 24 * 60 * 60 * 1000
            const oneWeek = 7 * oneDay
            const oneMonth = 30 * oneDay

            result = result.filter((post) => {
                const postDate = new Date(post.createdAt)
                const timeDiff = now.getTime() - postDate.getTime()

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

        setFilteredJobPosts(result)
    }, [jobPosts, searchQuery, activeStatusFilter, dateFilter, activeTab])

    useEffect(() => {
        // Apply filters to applications
        let result = applications

        // Apply search filter
        if (searchQuery) {
            result = result.filter((app) => 
                app.jobPost.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                app.applicant.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                app.applicant.lastName.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        // Apply status filter for applications
        if (applicationsStatusFilter !== "all") {
            result = result.filter((app) => app.status === applicationsStatusFilter)
        }

        setFilteredApplications(result)
    }, [applications, searchQuery, applicationsStatusFilter])

    const handleResponseSuccess = async () => {
        // Refresh applications data
        try {
            const applicationsData = await getApplicants()
            setApplications(applicationsData)
        } catch (error) {
            toast({
                title: "Ошибка",
                description: "Не удалось обновить данные",
                variant: "destructive",
            })
        }
    }

    if (isLoading) {
        return <ConstructionLoading />
    }

    return (
        <div className="container py-8">
            
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Мои вакансии</h1>
                <Link href="/jobposts/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Создать вакансию
                    </Button>
                </Link>
            </div>

            <Tabs defaultValue="active" className="space-y-4" onValueChange={setActiveTab}>
                <div className="flex flex-col gap-4">
                    <TabsList className="w-full">
                        <TabsTrigger value="active" className="flex-1">
                            <Briefcase className="mr-2 h-4 w-4" />
                            Активные ({filteredJobPosts.filter(post => !post.isArchived).length})
                        </TabsTrigger>
                        <TabsTrigger value="applications" className="flex-1">
                            <Users className="mr-2 h-4 w-4" />
                            Заявки ({filteredApplications.length})
                        </TabsTrigger>
                        <TabsTrigger value="archived" className="flex-1">
                            <Archive className="mr-2 h-4 w-4" />
                            Архив ({filteredJobPosts.filter(post => post.isArchived).length})
                        </TabsTrigger>
                    </TabsList>

                    <SearchAndFilters
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        activeTab={activeTab}
                        activeStatusFilter={activeStatusFilter}
                        applicationsStatusFilter={applicationsStatusFilter}
                        dateFilter={dateFilter}
                        onActiveStatusChange={setActiveStatusFilter}
                        onApplicationsStatusChange={setApplicationsStatusFilter}
                        onDateFilterChange={setDateFilter}
                        onResetFilters={() => {
                            if (activeTab === "active") {
                                setActiveStatusFilter("all")
                            } else if (activeTab === "applications") {
                                setApplicationsStatusFilter("all")
                            }
                            setDateFilter("all")
                        }}
                    />
                </div>

                <TabsContent value="active" className="space-y-4">
                    {filteredJobPosts.filter(post => !post.isArchived).map((post) => (
                        <JobPostCard key={post.id} post={post} />
                    ))}
                </TabsContent>

                <TabsContent value="applications" className="space-y-4">
                    {filteredApplications.map((application) => (
                        <ApplicationCard
                            key={application.id}
                            application={application}
                            onRespond={setSelectedApplication}
                        />
                    ))}
                </TabsContent>

                <TabsContent value="archived" className="space-y-4">
                    {filteredJobPosts.filter(post => post.isArchived).map((post) => (
                        <JobPostCard key={post.id} post={post} isArchived />
                    ))}
                </TabsContent>
            </Tabs>

            {selectedApplication && (
                <ApplicationResponseDialog
                    applicationId={selectedApplication.id}
                    isOpen={!!selectedApplication}
                    onClose={() => setSelectedApplication(null)}
                    onSuccess={handleResponseSuccess}
                    currentStatus={selectedApplication.status}
                    applicantId={selectedApplication.applicant.id}
                />
            )}
        </div>
    )
}
