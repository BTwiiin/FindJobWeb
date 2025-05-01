"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Clock, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getCalendarEvents, type CalendarEvent } from "@/app/actions/calendarActions"
import { useToast } from "@/hooks/use-toast"
import { getEventBadgeVariant, getEventTitle } from "@/types/options"
import { format } from "date-fns"
import { EventDetailsDialog } from "./event-details-dialog"
import { CreateEventDialog } from "./create-event-dialog"

// Calendar Day Component
interface CalendarDayProps {
  day: number | null
  currentDate: Date
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
}

const CalendarDay = ({ day, currentDate, events = [], onEventClick }: CalendarDayProps) => {
  // Only format date and get events if day exists
  if (!day) {
    return <Card className="p-2 min-h-[100px] bg-muted/10 relative" />
  }

  const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${String(day).padStart(2, "0")}`

  const dayEvents = Array.isArray(events) ? events.filter((event) => {
    const eventDate = new Date(event.eventDate)
    const targetDate = new Date(formattedDate)
    return (
      eventDate.getDate() === targetDate.getDate() &&
      eventDate.getMonth() === targetDate.getMonth() &&
      eventDate.getFullYear() === targetDate.getFullYear()
    )
  }) : []

  return (
    <Card className="p-2 min-h-[100px] hover:bg-muted/50 relative">
      <span className={`text-sm font-medium ${dayEvents.length > 0 ? "text-primary" : "text-muted-foreground"}`}>
        {day}
      </span>
      <div className="mt-2 space-y-1">
        {dayEvents.map((event) => (
          <EventBadge key={event.id} event={event} onClick={() => onEventClick(event)} />
        ))}
      </div>
    </Card>
  )
}

// Event Badge Component
interface EventBadgeProps {
  event: CalendarEvent
  onClick: () => void
}

const EventBadge = ({ event, onClick }: EventBadgeProps) => {
  const eventDate = new Date(event.eventDate)
  
  return (
    <Badge 
      variant={getEventBadgeVariant(event.type)} 
      className="w-full justify-start text-xs cursor-pointer hover:opacity-80"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      <Clock className="h-3 w-3 mr-1" />
      {format(eventDate, "HH:mm")} - {event.title}
    </Badge>
  )
}

// Calendar Header Component
interface CalendarHeaderProps {
  currentDate: Date
  onPrevMonth: () => void
  onNextMonth: () => void
  onCreateEvent: () => void
}

const CalendarHeader = ({ currentDate, onPrevMonth, onNextMonth, onCreateEvent }: CalendarHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold">
          {currentDate.toLocaleString("ru-RU", { month: "long" })} {currentDate.getFullYear()}
        </h2>
        <Button variant="outline" size="sm" onClick={onCreateEvent}>
          <Plus className="h-4 w-4 mr-2" />
          Создать событие
        </Button>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="icon" onClick={onPrevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// Days of Week Header Component
interface DaysOfWeekProps {
  daysOfWeek: string[]
}

const DaysOfWeek = ({ daysOfWeek }: DaysOfWeekProps) => {
  return (
    <>
      {daysOfWeek.map((day) => (
        <div key={day} className="text-center text-sm font-medium text-muted-foreground">
          {day}
        </div>
      ))}
    </>
  )
}

// Main Calendar Component
export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false)
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const { toast } = useToast()
  const daysOfWeek = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"]

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setIsEventDetailsOpen(true)
  }

  const handleCreateEvent = (date?: Date) => {
    setSelectedDate(date)
    setIsCreateEventOpen(true)
  }

  const handleDayClick = (day: number) => {
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    handleCreateEvent(selectedDate)
  }

  const refreshEvents = () => {
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    fetchEvents(startDate, endDate)
  }

  const fetchEvents = async (startDate: Date, endDate: Date) => {
    try {
      setIsLoading(true)
      const fetchedEvents = await getCalendarEvents(startDate, endDate)
      setEvents(fetchedEvents)
    } catch (error) {
      console.error("Error fetching calendar events:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить события календаря",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    fetchEvents(startDate, endDate)
  }, [currentDate, toast])

  // Calendar grid generation
  const generateCalendarGrid = () => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    const startDay = startOfMonth.getDay()
    const daysInMonth = endOfMonth.getDate()

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

    return calendar.flat()
  }

  const calendarDays = generateCalendarGrid()

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <CalendarHeader 
        currentDate={currentDate} 
        onPrevMonth={handlePrevMonth} 
        onNextMonth={handleNextMonth}
        onCreateEvent={() => handleCreateEvent()}
      />

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-4">
        {/* Day Headers */}
        <DaysOfWeek daysOfWeek={daysOfWeek} />

        {/* Calendar Days */}
        {calendarDays.map((day, index) => (
          <div key={index} onClick={() => day && handleDayClick(day)}>
            <CalendarDay 
              day={day} 
              currentDate={currentDate} 
              events={events} 
              onEventClick={handleEventClick}
            />
          </div>
        ))}
      </div>

      {/* Event Details Dialog */}
      <EventDetailsDialog 
        event={selectedEvent}
        isOpen={isEventDetailsOpen}
        onClose={() => {
          setIsEventDetailsOpen(false)
          setSelectedEvent(null)
        }}
        onEventUpdated={refreshEvents}
        onEventDeleted={refreshEvents}
      />

      {/* Create Event Dialog */}
      <CreateEventDialog
        isOpen={isCreateEventOpen}
        onClose={() => {
          setIsCreateEventOpen(false)
          setSelectedDate(undefined)
        }}
        onEventCreated={refreshEvents}
        defaultDate={selectedDate}
      />
    </div>
  )
}

