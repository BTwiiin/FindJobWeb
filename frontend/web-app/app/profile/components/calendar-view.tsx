"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Task {
  id: string
  date: string
  task: string
  type: "meeting" | "deadline" | "presentation" | "call"
}

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  const startDay = startOfMonth.getDay()
  const daysInMonth = endOfMonth.getDate()

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const generateCalendarGrid = () => {
    const totalDays = startDay + daysInMonth
    const weeks = Math.ceil(totalDays / 7)
    const calendar = []
    for (let i = 0; i < weeks; i++) {
      const week = []
      for (let j = 0; j < 7; j++) {
        const day = i * 7 + j - startDay + 1
        week.push(day > 0 && day <= daysInMonth ? day : null)
      }
      calendar.push(week)
    }
    return calendar
  }

  const calendarGrid = generateCalendarGrid()

  // Mock tasks with different types
  const mockTasks: Task[] = [
    {
      id: "1",
      date: `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, "0")}-05`,
      task: "Team Meeting",
      type: "meeting",
    },
    {
      id: "2",
      date: `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, "0")}-12`,
      task: "Project Deadline",
      type: "deadline",
    },
    {
      id: "3",
      date: `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, "0")}-19`,
      task: "Client Call",
      type: "call",
    },
    {
      id: "4",
      date: `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, "0")}-25`,
      task: "Presentation",
      type: "presentation",
    },
  ]

  const getTasksForDate = (date: string) => {
    return mockTasks.filter((task) => task.date === date)
  }

  const getTaskBadgeVariant = (type: Task["type"]) => {
    switch (type) {
      case "meeting":
        return "default"
      case "deadline":
        return "destructive"
      case "presentation":
        return "secondary"
      case "call":
        return "outline"
      default:
        return "default"
    }
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {currentDate.toLocaleString("default", { month: "long" })} {currentDate.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-4">
        {/* Day Headers */}
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {calendarGrid.flat().map((day, index) => {
          const formattedDate = day
            ? `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1)
                .toString()
                .padStart(2, "0")}-${String(day).padStart(2, "0")}`
            : null
          const dayTasks = formattedDate ? getTasksForDate(formattedDate) : []

          return (
            <Card key={index} className={`p-2 min-h-[100px] ${day ? "hover:bg-muted/50" : "bg-muted/10"} relative`}>
              {day && (
                <>
                  <span
                    className={`text-sm font-medium ${dayTasks.length > 0 ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {day}
                  </span>
                  <div className="mt-2 space-y-1">
                    {dayTasks.map((task) => (
                      <Badge
                        key={task.id}
                        variant={getTaskBadgeVariant(task.type)}
                        className="w-full justify-start text-xs"
                      >
                        {task.task}
                      </Badge>
                    ))}
                  </div>
                </>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}

