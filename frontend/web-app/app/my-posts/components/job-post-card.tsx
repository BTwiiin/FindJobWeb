import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { JobPost } from "@/types"
import { archiveJobPost } from "@/app/actions/jobPostActions"

interface JobPostCardProps {
    post: JobPost
    isArchived?: boolean
}

export function JobPostCard({ post, isArchived = false }: JobPostCardProps) {
    return (
        <Card className="hover:bg-gray-100 transition-colors duration-200">
            <Link href={`/jobposts/details/${post.id}`}>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>{post.title}</CardTitle>
                            <CardDescription>
                                Создано {format(new Date(post.createdAt), "d MMMM yyyy", { locale: ru })}
                            </CardDescription>
                        </div>
                        <Badge variant={isArchived ? "secondary" : post.status === "open" ? "default" : "secondary"}>
                            {isArchived ? "В архиве" : post.status === "open" ? "Открыто" : "Закрыто"}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">{post.description}</p>
                            <p className="text-sm font-medium">
                                Оплата: {post.paymentAmount} ₽
                            </p>
                        </div>
                        <Button variant="outline" onClick={() => archiveJobPost(post.id)}>
                            Архивировать
                        </Button>
                    </div>
                </CardContent>
            </Link>
        </Card>
    )
} 