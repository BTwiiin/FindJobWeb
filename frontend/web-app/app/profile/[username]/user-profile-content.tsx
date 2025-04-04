"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { JobPost, GetUserDto, Review, PagedResult } from "@/types"
import { getUserByUsername } from "@/app/actions/authActions"
import { getData } from "@/app/actions/jobPostActions"
import { getReviewsByUser } from "@/app/actions/reviewActions"
import { ProfileCard } from "./components/profile-card"
import { RatingCard } from "./components/rating-card"
import { ReviewsList } from "./components/reviews-list"
import { JobPostsList } from "./components/job-posts-list"
import { ExperienceCard } from "./components/experience-card"

interface UserProfileContentProps {
    username: string
}

export default function UserProfileContent({ username }: UserProfileContentProps) {
    const [user, setUser] = useState<GetUserDto | null>(null)
    const [jobPosts, setJobPosts] = useState<PagedResult<JobPost> | null>(null)
    const [reviews, setReviews] = useState<Review[]>([])
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true)
                const userData = await getUserByUsername(username)

                if (userData) {
                    setUser(userData)

                    // If user is an employer, fetch their job posts
                    if (userData.role === "employer") {
                        const posts = await getData(`?employer=${username}`)
                        setJobPosts(posts || [])
                    }

                    // Fetch reviews for this user
                    const userReviews = await getReviewsByUser(userData.id)
                    setReviews(Array.isArray(userReviews) ? userReviews : [])
                } else {
                    setError("Пользователь не найден")
                }
            } catch (err: unknown) {
                setError(`An error occurred while fetching user data: ${err}`)
            } finally {
                setLoading(false)
            }
        }

        fetchUserData()
    }, [username])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                <Card>
                    <CardHeader>
                        <CardTitle className="animate-pulse bg-muted h-6 w-48 rounded"></CardTitle>
                        <CardDescription className="animate-pulse bg-muted h-4 w-32 rounded"></CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    if (error || !user) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                <Card>
                    <CardHeader>
                        <CardTitle>Ошибка</CardTitle>
                        <CardDescription>{error || "Пользователь не найден"}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button onClick={() => router.push("/")}>На главную</Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    const isEmployer = user.role === "employer"

    return (
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
            {/* Left Column - Profile & Activity */}
            <div className="w-full lg:w-1/3 p-6 border-r">
                <div className="space-y-6">
                    <ProfileCard user={user} />
                    <RatingCard reviews={reviews} />
                </div>
            </div>

            {/* Right Column - Tabs for Reviews and Job Posts */}
            <div className="w-full lg:w-2/3 p-6">
                <Tabs defaultValue={isEmployer ? "jobs" : "reviews"} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="reviews">
                            Отзывы
                            <Badge variant="secondary" className="ml-2">
                                {reviews.length}
                            </Badge>
                        </TabsTrigger>
                        {isEmployer && (
                            <TabsTrigger value="jobs">
                                Открытые вакансии
                                <Badge variant="secondary" className="ml-2">
                                    {jobPosts?.totalCount}
                                </Badge>
                            </TabsTrigger>
                        )}
                        {!isEmployer && <TabsTrigger value="experience">Опыт работы</TabsTrigger>}
                    </TabsList>

                    <TabsContent value="reviews" className="mt-6">
                        <ReviewsList reviews={reviews} user={user} />
                    </TabsContent>

                    {isEmployer && (
                        <TabsContent value="jobs" className="mt-6">
                            <JobPostsList jobPosts={jobPosts} user={user} />
                        </TabsContent>
                    )}

                    {!isEmployer && (
                        <TabsContent value="experience" className="mt-6">
                            <ExperienceCard user={user} />
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </div>
    )
}