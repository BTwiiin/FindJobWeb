import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Star } from "lucide-react"
import { Review } from "@/types"

interface RatingCardProps {
    reviews: Review[]
}

export function RatingCard({ reviews }: RatingCardProps) {
    const averageRating = reviews.length > 0
        ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
        : 0

    // Calculate rating distribution
    const ratingDistribution = [0, 0, 0, 0, 0] // 5 elements for 1-5 stars
    reviews.forEach((review) => {
        const index = Math.min(Math.max(Math.floor(review.rating) - 1, 0), 4)
        ratingDistribution[index]++
    })

    // Convert to percentages
    const ratingPercentages = ratingDistribution.map(
        (count) => (count / reviews.length) * 100
    )

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Рейтинг
                </CardTitle>
                <CardDescription>На основе {reviews.length} отзывов</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4 mb-6">
                    <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
                    <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`h-5 w-5 ${
                                    star <= Math.round(averageRating) ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"
                                }`}
                            />
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center gap-2">
                            <div className="w-8 text-sm text-right">{rating} ★</div>
                            <Progress value={ratingPercentages[rating - 1]} className="h-2" />
                            <div className="w-8 text-sm text-muted-foreground">{ratingDistribution[rating - 1]}</div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
} 