"use client"

import { useState } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
} from "date-fns"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import type { Habit } from "./habit-tracker"

interface CalendarViewProps {
  habits: Habit[]
  onToggleCompletion: (habitId: string, date: string) => void
}

export function CalendarView({ habits, onToggleCompletion }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Calculate days needed to fill the grid from previous and next months
  const startDay = getDay(monthStart)
  const daysFromPreviousMonth = startDay === 0 ? 6 : startDay - 1 // Adjust for Monday start

  // Get the days from the previous month to display
  const previousMonthDays = eachDayOfInterval({
    start: subMonths(monthStart, 1),
    end: subMonths(monthEnd, 1),
  }).slice(-daysFromPreviousMonth)

  // Calculate how many days we need from the next month
  const totalDaysDisplayed = previousMonthDays.length + monthDays.length
  const daysFromNextMonth = Math.ceil(totalDaysDisplayed / 7) * 7 - totalDaysDisplayed

  // Get the days from the next month to display
  const nextMonthDays = eachDayOfInterval({
    start: addMonths(monthStart, 1),
    end: addMonths(monthEnd, 1),
  }).slice(0, daysFromNextMonth)

  // Combine all days
  const allDays = [...previousMonthDays, ...monthDays, ...nextMonthDays]

  // Group days into weeks
  const weeks = []
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7))
  }

  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const handleDayClick = (date: Date) => {
    setSelectedDate(date)
    setIsDialogOpen(true)
  }

  const getHabitsForDate = (date: Date) => {
    const formattedDate = format(date, "yyyy-MM-dd")
    return habits.map((habit) => ({
      ...habit,
      isCompleted: habit.completedDates.includes(formattedDate),
    }))
  }

  const getHabitCompletionCount = (date: Date) => {
    const formattedDate = format(date, "yyyy-MM-dd")
    return habits.filter((habit) => habit.completedDates.includes(formattedDate)).length
  }

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between items-center">
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span>{format(currentDate, "MMMM yyyy")}</span>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div key={day} className="text-center py-2 text-sm font-medium">
                {day}
              </div>
            ))}

            {weeks.map((week, weekIndex) =>
              week.map((day, dayIndex) => {
                const isCurrentMonth = isSameMonth(day, currentDate)
                const isToday = isSameDay(day, new Date())
                const habitCount = getHabitCompletionCount(day)
                const totalHabits = habits.length

                return (
                  <button
                    key={`${weekIndex}-${dayIndex}`}
                    onClick={() => handleDayClick(day)}
                    className={`
                      aspect-square p-1 relative flex flex-col items-center rounded-md
                      ${isCurrentMonth ? "" : "text-muted-foreground"}
                      ${isToday ? "bg-primary/10 font-bold" : "hover:bg-muted"}
                    `}
                  >
                    <span className="text-sm">{format(day, "d")}</span>

                    {totalHabits > 0 && (
                      <div className="mt-1 flex gap-0.5 flex-wrap justify-center">
                        {habitCount > 0 && (
                          <div
                            className={`h-1.5 w-1.5 rounded-full ${
                              habitCount === totalHabits
                                ? "bg-green-500"
                                : habitCount > totalHabits / 2
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            }`}
                          />
                        )}
                      </div>
                    )}
                  </button>
                )
              }),
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")}</DialogTitle>
            <DialogDescription>Track your habits for this day</DialogDescription>
          </DialogHeader>

          {selectedDate && (
            <div className="space-y-4 mt-4">
              {habits.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No habits to track yet. Add some habits in the weekly view.
                </p>
              ) : (
                habits.map((habit) => {
                  const formattedDate = format(selectedDate, "yyyy-MM-dd")
                  const isCompleted = habit.completedDates.includes(formattedDate)

                  return (
                    <div
                      key={habit.id}
                      className={`flex items-center justify-between p-3 rounded-md border ${habit.color}`}
                    >
                      <span className="font-medium">{habit.name}</span>
                      <button
                        onClick={() => onToggleCompletion(habit.id, formattedDate)}
                        className={`w-8 h-8 rounded-md border flex items-center justify-center transition-colors
                          ${
                            isCompleted
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                      >
                        {isCompleted && <Check className="h-4 w-4" />}
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}