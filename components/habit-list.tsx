"use client"

import { useState } from "react"
import { format, startOfWeek, addDays, isSameDay, startOfToday, isAfter, addWeeks } from "date-fns"
import { ChevronLeft, ChevronRight, Check, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Habit } from "./habit-tracker"

interface HabitListProps {
  habits: Habit[]
  onToggleCompletion: (habitId: string, date: string) => void
  onDelete: (habitId: string) => void
}

export function HabitList({ habits, onToggleCompletion, onDelete }: HabitListProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    // Start with the current week (Monday to Sunday)
    return startOfWeek(new Date(), { weekStartsOn: 1 })
  })

  // Generate dates for Monday to Sunday of the current week
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(currentWeekStart, i)
    return {
      date,
      formattedDate: format(date, "yyyy-MM-dd"),
      dayName: format(date, "EEE"),
      dayNumber: format(date, "d"),
    }
  })

  const goToPreviousWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, -7))
  }

  const goToNextWeek = () => {
    // Allow going to future weeks (up to 8 weeks ahead)
    const nextWeekStart = addDays(currentWeekStart, 7)
    const maxFutureDate = addWeeks(startOfWeek(new Date(), { weekStartsOn: 1 }), 8)

    if (isAfter(nextWeekStart, maxFutureDate)) {
      return // Don't go beyond 8 weeks in the future
    }

    setCurrentWeekStart(nextWeekStart)
  }

  const isToday = (date: Date) => {
    return isSameDay(date, new Date())
  }

  const isFutureWeek = isAfter(currentWeekStart, startOfToday())

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-sm font-medium">
          {format(dates[0].date, "MMM d")} - {format(dates[6].date, "MMM d, yyyy")}
          {isFutureWeek && (
            <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Future Week</span>
          )}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={goToNextWeek}
          disabled={isAfter(currentWeekStart, addWeeks(startOfWeek(new Date(), { weekStartsOn: 1 }), 7))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-8 gap-4">
        {/* Header row with day names */}
        <div className="col-span-1"></div>
        {dates.map((date) => (
          <div key={date.formattedDate} className="text-center">
            <div className="text-sm text-muted-foreground">{date.dayName}</div>
            <div className={`text-sm font-medium ${isToday(date.date) ? "text-primary" : ""}`}>
              {date.dayNumber}
            </div>
          </div>
        ))}

        {/* Habit rows */}
        {habits.map((habit) => (
          <div key={habit.id} className="contents">
            <div className={`col-span-1 flex items-center justify-between p-3 rounded-lg ${habit.color}`}>
              <div className="flex-1">
                <div className="font-medium truncate">{habit.name}</div>
                <div className="text-xs text-muted-foreground">{habit.frequency}</div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(habit.id)}
                className="h-6 w-6 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            {dates.map((date) => {
              const isCompleted = habit.completedDates.includes(date.formattedDate)
              return (
                <div key={`${habit.id}-${date.formattedDate}`} className="flex items-center justify-center">
                  <button
                    onClick={() => onToggleCompletion(habit.id, date.formattedDate)}
                    className={`w-8 h-8 rounded-md border flex items-center justify-center transition-all duration-200
                      ${
                        isCompleted
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-gray-200 hover:border-gray-300"
                      }
                      ${new Date(date.formattedDate) > new Date() ? "opacity-50 cursor-not-allowed" : ""}
                    `}
                    disabled={new Date(date.formattedDate) > new Date()}
                  >
                    {isCompleted && <Check className="h-4 w-4" />}
                  </button>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}