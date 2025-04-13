"use client"

import { useState, useEffect } from "react"
import { HabitTracker, type Habit } from "./habit-tracker"
import { Sidebar } from "./sidebar"
import { CalendarView } from "./calendar-view"
import { StatisticsDashboard } from "./statistics-dashboard"
import { SettingsDashboard } from "./settings-dashboard"
import { Sparkles } from "lucide-react"
import { useAuth } from "./auth-provider"

export function AppLayout() {
  const [activeView, setActiveView] = useState("habits")
  const [viewMode, setViewMode] = useState<"weekly" | "calendar">("weekly")
  const [habits, setHabits] = useState<Habit[]>([])
  const { user } = useAuth() // Get current user
  const username = user?.email || 'anonymous' // Use email as username or fallback to 'anonymous'

  const handleAddHabit = (habit: Habit) => {
    setHabits((prev) => [...prev, habit])
    // Save to localStorage with user-specific key
    const updatedHabits = [...habits, habit]
    localStorage.setItem(`habits_${username}`, JSON.stringify(updatedHabits))
  }

  const handleToggleCompletion = (habitId: string, date: string) => {
    setHabits((prevHabits) => {
      const updatedHabits = prevHabits.map((habit) => {
        if (habit.id === habitId) {
          const isCompleted = habit.completedDates.includes(date)
          const updatedHabit = {
            ...habit,
            completedDates: isCompleted
              ? habit.completedDates.filter((d: string) => d !== date)
              : [...habit.completedDates, date],
          }
          return updatedHabit
        }
        return habit
      })
      // Save to localStorage with user-specific key
      localStorage.setItem(`habits_${username}`, JSON.stringify(updatedHabits))
      return updatedHabits
    })
  }

  const handleDeleteHabit = (habitId: string) => {
    setHabits((prevHabits) => {
      const updatedHabits = prevHabits.filter((habit) => habit.id !== habitId)
      // Save to localStorage with user-specific key
      localStorage.setItem(`habits_${username}`, JSON.stringify(updatedHabits))
      return updatedHabits
    })
  }

  // Load habits from localStorage on component mount and when username changes
  useEffect(() => {
    if (username) {
      const savedHabits = localStorage.getItem(`habits_${username}`)
      if (savedHabits) {
        try {
          const parsedHabits = JSON.parse(savedHabits)
          setHabits(parsedHabits)
        } catch (error) {
          console.error('Error loading habits:', error)
        }
      } else {
        // If no habits found for this user, initialize with empty array
        setHabits([])
      }
    }
  }, [username]) // Re-run when username changes

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-background via-background to-background/95">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-1 overflow-auto">
        <div className="container py-6 px-4 max-w-5xl mx-auto">
          {activeView === "habits" && (
            <>
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-pink-500/10 rounded-lg blur-xl" />
                <div className="relative bg-background/60 backdrop-blur-sm rounded-lg p-6 border shadow-lg">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 text-transparent bg-clip-text">
                        Dhaya's Habit Tracker
                      </h1>
                    </div>
                    <div className="flex items-center gap-3 bg-muted/50 p-1 rounded-lg">
                      <button
                        onClick={() => setViewMode("weekly")}
                        className={`px-4 py-2 text-sm rounded-md transition-all duration-200 ${
                          viewMode === "weekly" 
                            ? "bg-primary text-primary-foreground shadow-lg" 
                            : "hover:bg-muted"
                        }`}
                      >
                        Weekly View
                      </button>
                      <button
                        onClick={() => setViewMode("calendar")}
                        className={`px-4 py-2 text-sm rounded-md transition-all duration-200 ${
                          viewMode === "calendar" 
                            ? "bg-primary text-primary-foreground shadow-lg" 
                            : "hover:bg-muted"
                        }`}
                      >
                        Calendar View
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-pink-500/5 rounded-lg blur-lg" />
                <div className="relative">
                  {viewMode === "weekly" ? (
                    <HabitTracker
                      habits={habits}
                      onAddHabit={handleAddHabit}
                      onToggleCompletion={handleToggleCompletion}
                      onDeleteHabit={handleDeleteHabit}
                    />
                  ) : (
                    <CalendarView habits={habits} onToggleCompletion={handleToggleCompletion} />
                  )}
                </div>
              </div>
            </>
          )}
          {activeView === "stats" && (
            <div className="space-y-4">
              <h1 className="text-3xl font-bold mb-8">Statistics</h1>
              <StatisticsDashboard habits={habits} />
            </div>
          )}
          {activeView === "settings" && (
            <div className="space-y-4">
              <h1 className="text-3xl font-bold mb-8">Settings</h1>
              <SettingsDashboard 
                habits={habits}
                onDeleteHabit={handleDeleteHabit}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}