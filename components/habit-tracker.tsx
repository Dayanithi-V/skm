"use client"

import { useState } from "react"
import { PlusCircle, Sparkles } from "lucide-react"
import { HabitForm } from "./habit-form"
import { HabitList } from "./habit-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"

export type Habit = {
  id: string
  name: string
  description?: string
  frequency: "daily" | "weekly"
  completedDates: string[]
  createdAt: string
  color: string
}

interface HabitTrackerProps {
  habits: Habit[]
  onAddHabit: (habit: Habit) => void
  onToggleCompletion: (habitId: string, date: string) => void
  onDeleteHabit: (habitId: string) => void
}

export function HabitTracker({ habits, onAddHabit, onToggleCompletion, onDeleteHabit }: HabitTrackerProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)

  const addHabit = (habit: Omit<Habit, "id" | "createdAt" | "completedDates" | "color">) => {
    const colors = [
      "bg-gradient-to-r from-red-50 to-pink-50 border-pink-100",
      "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-100",
      "bg-gradient-to-r from-green-50 to-emerald-50 border-green-100",
      "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-100",
      "bg-gradient-to-r from-purple-50 to-violet-50 border-purple-100",
      "bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-100",
      "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-100",
    ]

    const newHabit: Habit = {
      id: Date.now().toString(),
      ...habit,
      completedDates: [],
      createdAt: new Date().toISOString(),
      color: colors[Math.floor(Math.random() * colors.length)],
    }

    onAddHabit(newHabit)
    setIsFormOpen(false)
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border overflow-hidden">
        <CardHeader className="border-b bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle>Your Habits</CardTitle>
            </div>
            <Button 
              onClick={() => setIsFormOpen(true)} 
              className="bg-primary hover:bg-primary/90"
              size="sm"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Habit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {habits.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <Sparkles className="h-12 w-12 text-primary/40 animate-pulse" />
              </div>
              <p className="text-lg text-muted-foreground mb-2">
                Start Your Journey to Better Habits!
              </p>
              <p className="text-sm text-muted-foreground">
                Click the "Add Habit" button to begin tracking your first habit.
              </p>
            </div>
          ) : (
            <HabitList habits={habits} onToggleCompletion={onToggleCompletion} onDelete={onDeleteHabit} />
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <HabitForm onSubmit={addHabit} onCancel={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}