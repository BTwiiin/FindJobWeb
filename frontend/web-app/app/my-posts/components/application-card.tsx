import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { JobApplication, ApplicationStatus } from "@/types/job-application"

interface ApplicationCardProps {
    application: JobApplication
    onRespond: (application: JobApplication) => void
}

const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
        case ApplicationStatus.ACCEPTED:
            return "bg-green-500"
        case ApplicationStatus.REJECTED:
            return "bg-red-500"
        case ApplicationStatus.PENDING:
            return "bg-yellow-500"
        case ApplicationStatus.COMPLETED:
            return "bg-blue-500"
        case ApplicationStatus.CANCELLED:
            return "bg-gray-500"
        default:
            return "bg-gray-500"
    }
}

const getStatusText = (status: ApplicationStatus) => {
    switch (status) {
        case ApplicationStatus.ACCEPTED:
            return "Принято"
        case ApplicationStatus.REJECTED:
            return "Отклонено"
        case ApplicationStatus.PENDING:
            return "На рассмотрении"
        case ApplicationStatus.COMPLETED:
            return "Завершено"
        case ApplicationStatus.CANCELLED:
            return "Отменено"
        default:
            return status
    }
}

export function ApplicationCard({ application, onRespond }: ApplicationCardProps) {
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{application.jobPost.title}</CardTitle>
                        <CardDescription className="underline text-sm hover:text-primary cursor-pointer hover:text-black">
                            <Link href={`/profile/${application.applicant.username}`}>
                                От {application.applicant.firstName} {application.applicant.lastName}
                            </Link>
                        </CardDescription>
                    </div>
                    <Badge className={getStatusColor(application.status)}>
                        {getStatusText(application.status)}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pb-2">
                <div className="space-y-4">
                    {application.coverLetter && (
                        <div>
                            <h4 className="font-medium mb-2">Сопроводительное письмо</h4>
                            <p className="text-sm text-muted-foreground">{application.coverLetter}</p>
                        </div>
                    )}
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <p className="text-sm">
                                <span className="font-medium">Email:</span> {application.email}
                            </p>
                            <p className="text-sm">
                                <span className="font-medium">Телефон:</span> {application.phone}
                            </p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Button variant="outline" className="mt-2">
                                <Link href={`/profile/${application.applicant.username}`}>
                                    Посмотреть профиль
                                </Link>
                            </Button>
                            <Link href={`/jobposts/details/${application.jobPostId}`}>
                                <Button variant="outline" className="w-full">Перейти к вакансии</Button>
                            </Link>
                            {application.status === ApplicationStatus.PENDING ? (
                                <Button 
                                    variant="outline" 
                                    className="w-full"
                                    onClick={() => onRespond(application)}
                                >
                                    Ответить
                                </Button>
                            ) : application.status === ApplicationStatus.ACCEPTED ? (
                                <Button 
                                    variant="outline" 
                                    className="w-full"
                                    onClick={() => onRespond(application)}
                                >
                                    Закончить работу
                                </Button>
                            ) : null}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
} 