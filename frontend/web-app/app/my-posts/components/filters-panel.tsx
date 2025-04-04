import { Button } from "@/components/ui/button"
import { SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ApplicationStatus } from "@/types/job-application"

interface FiltersPanelProps {
    activeTab: string
    activeStatusFilter: "all" | "open" | "closed"
    applicationsStatusFilter: "all" | ApplicationStatus
    dateFilter: string
    onActiveStatusChange: (value: "all" | "open" | "closed") => void
    onApplicationsStatusChange: (value: "all" | ApplicationStatus) => void
    onDateFilterChange: (value: string) => void
    onResetFilters: () => void
}

export function FiltersPanel({
    activeTab,
    activeStatusFilter,
    applicationsStatusFilter,
    dateFilter,
    onActiveStatusChange,
    onApplicationsStatusChange,
    onDateFilterChange,
    onResetFilters
}: FiltersPanelProps) {
    return (
        <SheetContent>
            <SheetHeader>
                <SheetTitle>Фильтры</SheetTitle>
                <SheetDescription>Отфильтруйте по статусу и дате</SheetDescription>
            </SheetHeader>
            <div className="grid gap-6 py-6">
                {activeTab === "active" && (
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium">Статус вакансии</h3>
                        <Select value={activeStatusFilter} onValueChange={onActiveStatusChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Выберите статус" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Все статусы</SelectItem>
                                <SelectItem value="open">Открыто</SelectItem>
                                <SelectItem value="closed">Закрыто</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}
                {activeTab === "applications" && (
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium">Статус заявки</h3>
                        <Select value={applicationsStatusFilter} onValueChange={onApplicationsStatusChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Выберите статус" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Все статусы</SelectItem>
                                <SelectItem value={ApplicationStatus.PENDING}>На рассмотрении</SelectItem>
                                <SelectItem value={ApplicationStatus.ACCEPTED}>Принято</SelectItem>
                                <SelectItem value={ApplicationStatus.REJECTED}>Отклонено</SelectItem>
                                <SelectItem value={ApplicationStatus.COMPLETED}>Завершено</SelectItem>
                                <SelectItem value={ApplicationStatus.CANCELLED}>Отменено</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}
                <div className="space-y-2">
                    <h3 className="text-sm font-medium">Дата создания</h3>
                    <Select value={dateFilter} onValueChange={onDateFilterChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Выберите период" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Все время</SelectItem>
                            <SelectItem value="today">Сегодня</SelectItem>
                            <SelectItem value="week">Эта неделя</SelectItem>
                            <SelectItem value="month">Этот месяц</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button
                    variant="outline"
                    onClick={onResetFilters}
                >
                    Сбросить фильтры
                </Button>
            </div>
        </SheetContent>
    )
} 