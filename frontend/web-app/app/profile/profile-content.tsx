"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, MapPin, Phone, User as UserIcon, Pencil, Plus } from "lucide-react"
import { getCurrentUser, getUserByUsername } from "@/app/actions/authActions"
import { getMyRequests } from "@/app/actions/jobPostActions"
import type { JobPostRequest, JobPost, User } from "@/types"
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

export default function ProfileContent() {
  const [user, setUser] = useState<User | null>(null)
  const [jobRequests, setJobRequests] = useState<JobPostRequest[]>([])
  const [filteredJobPosts, setFilteredJobPosts] = useState<JobPost[]>([])
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const { jobPosts } = useJobPostStore((state) => state)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const _user = await getCurrentUser()

        if (_user) {
          const userData = await getUserByUsername(_user.username)
          console.log("User data:", userData)
          setUser(userData)
          const requests = await getMyRequests()
          setJobRequests(Array.isArray(requests) ? requests : [])
          const postsForUser = jobPosts.filter((post) => post.employer.username === userData.username)
          setFilteredJobPosts(postsForUser)
        } else {
          setError("Пользователь не найден")
        }
      } catch (err: unknown) {
        setError(`Произошла ошибка при загрузке данных пользователя: ${err}`)
        setJobRequests([])
      }
    }

    fetchUserData()
  }, [jobPosts])

  const handleEditProfile = () => {
    if (!user) return;
    router.push(`/auth/complete-profile?id=${user.id}&username=${user.username}`);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Card>
          <CardHeader>
            <CardTitle>Ошибка</CardTitle>
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
            <CardTitle>Загрузка...</CardTitle>
            <CardDescription>Пожалуйста, подождите, пока мы загружаем ваш профиль</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const pendingAndApprovedRequests = jobRequests.filter(
    req => req.status === "ending" || req.status === "approved"
  );
  const rejectedRequests = jobRequests.filter(req => req.status === "rejected");

  const isEmployer = user.role?.toLowerCase() === "employer";

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
      <div className="w-full lg:w-1/3 p-6 border-r">
        <div className="space-y-6">
          <Card>
            <CardHeader className="relative">
              <Button
                variant="ghost"
                size="icon"
                disabled={!user.id}
                className="absolute right-4 top-4"
                onClick={handleEditProfile}
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
                    <Badge className="mt-2" variant="secondary">
                      {user.role === 'employer' ? 'Работодатель' : 'Соискатель'}
                    </Badge>
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
                <span>{user.phoneNumber || "Добавьте номер телефона"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{user.location?.city || "Добавьте местоположение"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <UserIcon className="h-4 w-4" />
                <span>{user.about || "Добавьте информацию о себе"}</span>
              </div>
            </CardContent>
          </Card>

          {isEmployer ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Мои вакансии</CardTitle>
                  <CardDescription>Опубликованные вами вакансии</CardDescription>
                </div>
                <Button size="sm" onClick={() => router.push("/jobposts/create")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Создать
                </Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {filteredJobPosts.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>У вас пока нет опубликованных вакансий.</p>
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => router.push("/jobposts/create")}
                        >
                          Создать первую вакансию
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
                                  Опубликовано: {new Date(post.createdAt).toLocaleDateString()}
                                </CardDescription>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline">{post.status}</Badge>
                                  <Badge variant="secondary">{post.paymentAmount}₽</Badge>
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
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="active" className="relative">
                  Активные
                  <Badge variant="secondary" className="ml-2">
                    {pendingAndApprovedRequests.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="rejected" className="relative">
                  Отклоненные
                  <Badge variant="secondary" className="ml-2">
                    {rejectedRequests.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="active">
                <Card>
                  <CardHeader>
                    <CardTitle>Активные заявки</CardTitle>
                    <CardDescription>Заявки на рассмотрении и принятые</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-4">
                        {pendingAndApprovedRequests.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <p>Нет активных заявок.</p>
                            <Button 
                              variant="outline" 
                              className="mt-4"
                              onClick={() => router.push("/")}
                            >
                              Просмотреть вакансии
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
                                        {jobPost ? jobPost.title : "Вакансия не найдена"}
                                      </CardTitle>
                                      <CardDescription>
                                        Отправлено: {new Date(request.applyDate).toLocaleDateString()}
                                      </CardDescription>
                                    </div>
                                    <Badge variant={request.status === "Approved" ? "secondary" : "outline"}>
                                      {request.status === "approved" ? "Принято" : "На рассмотрении"}
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
                    <CardTitle>Отклоненные заявки</CardTitle>
                    <CardDescription>Заявки, которые были отклонены</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-4">
                        {rejectedRequests.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <p>Нет отклоненных заявок.</p>
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
                                        {jobPost ? jobPost.title : "Вакансия не найдена"}
                                      </CardTitle>
                                      <CardDescription>
                                        Отправлено: {new Date(request.applyDate).toLocaleDateString()}
                                      </CardDescription>
                                    </div>
                                    <Badge variant="destructive">Отклонено</Badge>
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

      <div className="w-full lg:w-2/3 p-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Календарь</CardTitle>
            <CardDescription>Ваши предстоящие события и дедлайны</CardDescription>
          </CardHeader>
          <CardContent>
            <CalendarView />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

