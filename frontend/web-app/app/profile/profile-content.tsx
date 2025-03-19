"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, MapPin, Phone, User, Pencil, Plus } from "lucide-react"
import { getCurrentUser } from "@/app/actions/authActions"
import { getMyRequests } from "@/app/actions/jobPostActions"
import type { JobPostRequest, JobPost } from "@/types"
import { useJobPostStore } from "@/app/hooks/useJobPostStore"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import EditIconButton from "@/app/profile/components/edit-icon-button"
import DeleteIconButton from "@/app/profile/components/delete-icon-button"
import CalendarView from "@/app/profile/components/calendar-view"
import { Profile } from "next-auth"


export default function ProfileContent() {
  const [user, setUser] = useState<Profile | null>(null)
  const [jobRequests, setJobRequests] = useState<JobPostRequest[]>([])
  const [filteredJobPosts, setFilteredJobPosts] = useState<JobPost[]>([])
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const { jobPosts } = useJobPostStore((state) => state)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = (await getCurrentUser()) as Profile
        if (userData) {
          setUser(userData)
          const requests = await getMyRequests()
          setJobRequests(requests)
          const postsForUser = jobPosts.filter((post) => post.employer === userData.username)
          setFilteredJobPosts(postsForUser)
        } else {
          setError("User not found")
        }
      } catch (err: unknown) {
        setError(`An error occurred while fetching user data: ${err}`)
      }
    }

    fetchUserData()
  }, [jobPosts])

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

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Please wait while we fetch your profile</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Categorize job requests by status
  const pendingAndApprovedRequests = jobRequests.filter(
    req => req.status === "Pending" || req.status === "Approved"
  );
  const rejectedRequests = jobRequests.filter(req => req.status === "Rejected");

  const isEmployer = user.role === "Employer";

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
      {/* Left Column - Profile & Activity */}
      <div className="w-full lg:w-1/3 p-6 border-r">
        <div className="space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4"
                onClick={() => router.push("/edit-profile")}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/placeholder.svg" alt={user.name ?? ""} />
                  <AvatarFallback>{user.name?.[0] ?? ""}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <CardTitle>{user.name}</CardTitle>
                  <CardDescription>{user.username}</CardDescription>
                  {user.role && (
                    <Badge className="mt-2" variant="secondary">{user.role}</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>Add phone number</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Add location</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Add bio</span>
              </div>
            </CardContent>
          </Card>

          {/* Activity Tabs - Conditionally rendered based on role */}
          {isEmployer ? (
            // Employer View - Show only Job Posts
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Job Posts</CardTitle>
                  <CardDescription>Jobs you&apos;ve posted</CardDescription>
                </div>
                <Button size="sm" onClick={() => router.push("/jobposts/create")}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Post
                </Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {filteredJobPosts.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>You haven&apos;t posted any jobs yet.</p>
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => router.push("/jobposts/create")}
                        >
                          Create your first job post
                        </Button>
                      </div>
                    ) : (
                      filteredJobPosts.map((post) => (
                        <Card key={post.id} className="cursor-pointer hover:bg-muted/50"
                          onClick={() => router.push(`/jobposts/details/${post.id}`)}>
                          <CardHeader className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-base">{post.title}</CardTitle>
                                <CardDescription>
                                  Posted: {new Date(post.createdAt).toLocaleDateString()}
                                </CardDescription>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline">{post.status}</Badge>
                                  <Badge variant="secondary">${post.paymentAmount}</Badge>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2">
                                <EditIconButton id={post.id} />
                                <DeleteIconButton id={post.id} />
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ) : (
            // Employee View - Show Job Applications with tabs for status
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="active" className="relative">
                  Active
                  <Badge variant="secondary" className="ml-2">
                    {pendingAndApprovedRequests.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="rejected" className="relative">
                  Rejected
                  <Badge variant="secondary" className="ml-2">
                    {rejectedRequests.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="active">
                <Card>
                  <CardHeader>
                    <CardTitle>Active Applications</CardTitle>
                    <CardDescription>Pending and approved job requests</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-4">
                        {pendingAndApprovedRequests.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <p>No active applications found.</p>
                            <Button 
                              variant="outline" 
                              className="mt-4"
                              onClick={() => router.push("/")}
                            >
                              Browse jobs
                            </Button>
                          </div>
                        ) : (
                          pendingAndApprovedRequests.map((request) => {
                            const jobPost = jobPosts.find((post) => post.id === request.jobPostId)
                            return (
                              <Card key={request.id} className="cursor-pointer hover:bg-muted/50">
                                <CardHeader className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <CardTitle className="text-base">
                                        {jobPost ? jobPost.title : "Job Post Not Found"}
                                      </CardTitle>
                                      <CardDescription>
                                        Applied: {new Date(request.applyDate).toLocaleDateString()}
                                      </CardDescription>
                                    </div>
                                    <Badge variant={request.status === "Approved" ? "secondary" : "outline"}>
                                      {request.status}
                                    </Badge>
                                  </div>
                                </CardHeader>
                              </Card>
                            )
                          })
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="rejected">
                <Card>
                  <CardHeader>
                    <CardTitle>Rejected Applications</CardTitle>
                    <CardDescription>Applications that weren&apos;t successful</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-4">
                        {rejectedRequests.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <p>No rejected applications.</p>
                          </div>
                        ) : (
                          rejectedRequests.map((request) => {
                            const jobPost = jobPosts.find((post) => post.id === request.jobPostId)
                            return (
                              <Card key={request.id} className="cursor-pointer hover:bg-muted/50">
                                <CardHeader className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <CardTitle className="text-base">
                                        {jobPost ? jobPost.title : "Job Post Not Found"}
                                      </CardTitle>
                                      <CardDescription>
                                        Applied: {new Date(request.applyDate).toLocaleDateString()}
                                      </CardDescription>
                                    </div>
                                    <Badge variant="destructive">{request.status}</Badge>
                                  </div>
                                </CardHeader>
                              </Card>
                            )
                          })
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>

      {/* Right Column - Calendar */}
      <div className="w-full lg:w-2/3 p-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
            <CardDescription>Your upcoming events and deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            <CalendarView />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

