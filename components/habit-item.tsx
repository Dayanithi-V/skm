"use client"

import { Check, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Habit } from "./habit-tracker"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useState } from "react"

interface HabitItemProps {
  habit: Habit
  dates: {
    date: Date
    formattedDate: string
    dayName: string
    dayNumber: string
  }[]
  onToggleCompletion: (habitId: string, date: string) => void
  onDelete: (habitId: string) => void
}

export function HabitItem({ habit, dates, onToggleCompletion, onDelete }: HabitItemProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const getStreakCount = () => {
    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Sort completed dates in descending order
    const sortedDates = [...habit.completedDates]
      .map((dateStr) => new Date(dateStr))
      .sort((a, b) => b.getTime() - a.getTime())

    if (sortedDates.length === 0) return 0

    // Check if today is completed
    const isCompletedToday = sortedDates.some(
      (date) =>
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate(),
    )

    if (!isCompletedToday) return 0

    streak = 1
    const oneDayMs = 24 * 60 * 60 * 1000

    for (let i = 1; i < 1000; i++) {
      // Arbitrary limit to prevent infinite loop
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)

      const isCompleted = sortedDates.some(
        (date) =>
          date.getFullYear() === checkDate.getFullYear() &&
          date.getMonth() === checkDate.getMonth() &&
          date.getDate() === checkDate.getDate(),
      )

      if (isCompleted) {
        streak++
      } else {
        break
      }
    }

    return streak
  }

  return (
    <>
      <div className={`col-span-1 flex items-center ${habit.color} px-3 py-2 rounded-md border`}>
        <div className="w-full truncate">
          <div className="font-medium truncate">{habit.name}</div>
          <div className="text-xs text-muted-foreground flex items-center justify-between">
            <span>{habit.frequency}</span>
            {getStreakCount() > 0 && (
              <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-0.5 rounded">
                🔥 {getStreakCount()} day{getStreakCount() > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 ml-2 text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Habit</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{habit.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(habit.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {dates.map((date) => {
        const isCompleted = habit.completedDates.includes(date.formattedDate)
        return (
          <div key={`${habit.id}-${date.formattedDate}`} className="col-span-1 flex items-center justify-center">
            <button
              onClick={() => onToggleCompletion(habit.id, date.formattedDate)}
              className={`w-8 h-8 rounded-md border flex items-center justify-center transition-colors
                ${
                  isCompleted
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              disabled={new Date(date.formattedDate) > new Date()}
              aria-label={
                isCompleted
                  ? `Mark ${habit.name} as incomplete for ${date.dayName}`
                  : `Mark ${habit.name} as complete for ${date.dayName}`
              }
            >
              {isCompleted && <Check className="h-4 w-4" />}
            </button>
          </div>
        )
      })}
    </>
  )
}