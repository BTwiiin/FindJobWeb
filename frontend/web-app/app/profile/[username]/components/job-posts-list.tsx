import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Briefcase, DollarSign, MapPin, Clock, ExternalLink } from "lucide-react"
import { format } from "date-fns"
import { JobPost, PagedResult } from "@/types"
import { GetUserDto } from "@/types"
import { useRouter } from "next/navigation"

interface JobPostsListProps {
    jobPosts: PagedResult<JobPost> | null
    user: GetUserDto
}

export function JobPostsList({ jobPosts, user }: JobPostsListProps) {
    const router = useRouter()

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Вакансии
                </CardTitle>
                <CardDescription>Вакансии, размещенные пользователем {user.username}</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                    {jobPosts?.results.length === 0 ? (
                        <div className="text-center py-12">
                            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium">Вакансий пока нет</h3>
                            <p className="text-muted-foreground mt-2">{user.username} пока не разместил ни одной вакансии.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {jobPosts?.results.map((job) => (
                                <Card key={job.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                    <CardContent className="p-0">
                                        <div className="p-4 border-b bg-muted/10">
                                            <div className="flex items-start gap-3">
                                                <div className="h-10 w-10 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                                                    <img
                                                        src="/favicon.ico"
                                                        alt={`Логотип компании для ${job.title}`}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-lg truncate">{job.title}</h3>
                                                    <p className="text-muted-foreground text-sm">{user.firstName} {user.lastName}</p>
                                                </div>
                                                <Badge
                                                    variant={
                                                        job.category === "IT"
                                                            ? "default"
                                                            : job.category === "Marketing"
                                                                ? "secondary"
                                                                : "outline"
                                                    }
                                                >
                                                    {job.category}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="p-4 space-y-3">
                                            <div className="flex items-center gap-2 text-sm">
                                                <DollarSign className="h-4 w-4 text-green-500" />
                                                <span className="font-medium text-green-600">
                                                    {job.paymentAmount ? `${job.paymentAmount}₽` : "Не указана"}
                                                </span>
                                            </div>

                                            {job.location && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-muted-foreground truncate">
                                                        {job.location.city || "Место не указано"}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-muted-foreground">
                                                    Размещено {format(new Date(job.createdAt), "d MMM yyyy")}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-end pt-2">
                                                <Button
                                                    size="sm"
                                                    className="gap-1"
                                                    onClick={() => router.push(`/jobposts/details/${job.id}`)}
                                                >
                                                    Подробнее
                                                    <ExternalLink className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    )
} 