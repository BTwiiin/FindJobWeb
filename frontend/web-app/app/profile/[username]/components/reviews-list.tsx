import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Star, MessageSquare, Briefcase } from "lucide-react"
import { format } from "date-fns"
import { Review } from "@/types"
import { GetUserDto } from "@/types"

interface ReviewsListProps {
    reviews: Review[]
    user: GetUserDto
}

export function ReviewsList({ reviews, user }: ReviewsListProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Отзывы
                </CardTitle>
                <CardDescription>
                    Что говорят о {user.role === "employer" ? "работе с" : ""} {user.firstName} {user.lastName}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                    {reviews.length === 0 ? (
                        <div className="text-center py-12">
                            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium">Отзывов пока нет</h3>
                            <p className="text-muted-foreground mt-2">{user.firstName} {user.lastName} пока не получил ни одного отзыва.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {reviews.map((review) => (
                                <div key={review.id} className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={"/placeholder.svg"} />
                                            <AvatarFallback>{review.reviewer.username[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium">{review.reviewer.name}</h4>
                                                <div className="flex">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={`h-4 w-4 ${
                                                                star <= review.rating
                                                                    ? "text-yellow-500 fill-yellow-500"
                                                                    : "text-muted-foreground"
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {format(new Date(review.createdAt), "d MMMM yyyy")}
                                            </p>
                                            <p className="mt-2">{review.comment}</p>

                                            {review.jobApplicationId && (
                                                <div className="mt-2 pt-2 border-t flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Briefcase className="h-3 w-3" />
                                                    <span>Для заявки: {review.jobApplicationId}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <Separator />
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    )
}