import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Search, SlidersHorizontal } from "lucide-react"
import { ApplicationStatus } from "@/types/job-application"
import { FiltersPanel } from "./filters-panel"

interface SearchAndFiltersProps {
    searchQuery: string
    onSearchChange: (value: string) => void
    activeTab: string
    activeStatusFilter: "all" | "open" | "closed"
    applicationsStatusFilter: "all" | ApplicationStatus
    dateFilter: string
    onActiveStatusChange: (value: "all" | "open" | "closed") => void
    onApplicationsStatusChange: (value: "all" | ApplicationStatus) => void
    onDateFilterChange: (value: string) => void
    onResetFilters: () => void
}

export function SearchAndFilters({
    searchQuery,
    onSearchChange,
    activeTab,
    activeStatusFilter,
    applicationsStatusFilter,
    dateFilter,
    onActiveStatusChange,
    onApplicationsStatusChange,
    onDateFilterChange,
    onResetFilters
}: SearchAndFiltersProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Поиск..."
                    className="pl-8 w-full bg-white"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto gap-2">
                        <SlidersHorizontal className="h-4 w-4" />
                        <span>Фильтры</span>
                        {((activeTab === "active" && activeStatusFilter !== "all") || 
                          (activeTab === "applications" && applicationsStatusFilter !== "all") || 
                          dateFilter !== "all") && (
                            <Badge variant="secondary" className="ml-1">
                                {((activeTab === "active" && activeStatusFilter !== "all") ? 1 : 0) +
                                 ((activeTab === "applications" && applicationsStatusFilter !== "all") ? 1 : 0) +
                                 (dateFilter !== "all" ? 1 : 0)}
                            </Badge>
                        )}
                    </Button>
                </SheetTrigger>
                <FiltersPanel
                    activeTab={activeTab}
                    activeStatusFilter={activeStatusFilter}
                    applicationsStatusFilter={applicationsStatusFilter}
                    dateFilter={dateFilter}
                    onActiveStatusChange={onActiveStatusChange}
                    onApplicationsStatusChange={onApplicationsStatusChange}
                    onDateFilterChange={onDateFilterChange}
                    onResetFilters={onResetFilters}
                />
            </Sheet>
        </div>
    )
} 