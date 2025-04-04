import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase } from "lucide-react"
import { GetUserDto } from "@/types"

interface ExperienceCardProps {
    user: GetUserDto
}

export function ExperienceCard({ user }: ExperienceCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Опыт работы
                </CardTitle>
                <CardDescription>Профессиональный опыт {user.firstName} {user.lastName}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-center py-12">
                    <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Опыт работы не указан</h3>
                    <p className="text-muted-foreground mt-2">{user.firstName} {user.lastName} пока не добавил информацию об опыте работы.</p>
                </div>
            </CardContent>
        </Card>
    )
} 