import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mail, Phone, MapPin, Building2, Calendar, UserIcon } from "lucide-react"
import { format } from "date-fns"
import { GetUserDto } from "@/types"

interface ProfileCardProps {
    user: GetUserDto
}

export function ProfileCard({ user }: ProfileCardProps) {
    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={"/placeholder.svg"} alt={user.firstName + " " + user.lastName || ""} />
                        <AvatarFallback>{user.firstName?.[0] + user.lastName?.[0] || ""}</AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                        <CardTitle>{user.firstName} {user.lastName}</CardTitle>
                        <CardDescription>{user.username}</CardDescription>
                        {user.role && (
                            <Badge className="mt-2" variant="secondary">
                                {user.role === "employer" ? "Работодатель" : "Соискатель"}
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {user.email && (
                    <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{user.email}</span>
                    </div>
                )}

                {user.phoneNumber && (
                    <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{user.phoneNumber}</span>
                    </div>
                )}

                {user.location && (
                    <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{user.location?.city} {user.location?.country}</span>
                    </div>
                )}

                {user.role === "employer" && user.taxNumber && (
                    <div className="flex items-center gap-2 text-sm">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>ИНН: {user.taxNumber}</span>
                    </div>
                )}

                {user.createdAt && (
                    <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Участник с {format(new Date(user.createdAt), "MMMM yyyy")}</span>
                    </div>
                )}

                {user.about && (
                    <div className="mt-4 pt-4 border-t">
                        <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <UserIcon className="h-4 w-4" />
                            О себе
                        </h3>
                        <p className="text-sm text-muted-foreground">{user.about}</p>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => window.history.back()}>
                    Назад
                </Button>
            </CardFooter>
        </Card>
    )
} 