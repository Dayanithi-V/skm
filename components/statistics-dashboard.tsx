"use client"

import { useMemo } from "react"
import { Trophy, Flame, Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Habit } from "./habit-tracker"

interface StatisticCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  description?: string
}

function StatisticCard({ title, value, icon, description }: StatisticCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  )
}

interface StatisticsDashboardProps {
  habits: Habit[]
}

export function StatisticsDashboard({ habits }: StatisticsDashboardProps) {
  const stats = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Calculate longest streak across all habits
    let longestStreak = 0
    habits.forEach((habit) => {
      let currentStreak = 0
      const sortedDates = [...habit.completedDates]
        .map((date) => new Date(date))
        .sort((a, b) => b.getTime() - a.getTime())

      if (sortedDates.length === 0) return

      // Check if completed today
      const isCompletedToday = sortedDates.some(
        (date) =>
          date.getFullYear() === today.getFullYear() &&
          date.getMonth() === today.getMonth() &&
          date.getDate() === today.getDate()
      )

      if (isCompletedToday) {
        currentStreak = 1
        const oneDayMs = 24 * 60 * 60 * 1000

        for (let i = 1; i < sortedDates.length; i++) {
          const currentDate = sortedDates[i - 1]
          const prevDate = sortedDates[i]
          const daysDiff = (currentDate.getTime() - prevDate.getTime()) / oneDayMs

          if (daysDiff === 1) {
            currentStreak++
          } else {
            break
          }
        }

        longestStreak = Math.max(longestStreak, currentStreak)
      }
    })

    // Calculate success rate
    const last30Days = new Date()
    last30Days.setDate(last30Days.getDate() - 30)
    
    let totalCompletions = 0
    let totalPossible = 0

    habits.forEach((habit) => {
      const completedInLast30Days = habit.completedDates.filter(
        (date) => new Date(date) >= last30Days
      ).length

      // For daily habits, there should be one completion per day
      // For weekly habits, there should be one completion per week
      const daysToCount = habit.frequency === "daily" ? 30 : 4
      totalPossible += daysToCount
      totalCompletions += completedInLast30Days
    })

    const successRate = totalPossible > 0 ? Math.round((totalCompletions / totalPossible) * 100) : 0

    // Calculate achievements
    const achievements = {
      total: 0,
      streakMilestones: false,
      consistencyKing: false,
      habitMaster: false,
    }

    if (longestStreak >= 7) {
      achievements.streakMilestones = true
      achievements.total++
    }
    if (successRate >= 80) {
      achievements.consistencyKing = true
      achievements.total++
    }
    if (habits.length >= 5) {
      achievements.habitMaster = true
      achievements.total++
    }

    return {
      longestStreak,
      successRate,
      achievements,
    }
  }, [habits])

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <StatisticCard
          title="Longest Streak"
          value={`${stats.longestStreak} days`}
          icon={<Flame className="h-4 w-4 text-orange-500" />}
          description="Your longest consecutive habit completion streak"
        />
        <StatisticCard
          title="Success Rate"
          value={`${stats.successRate}%`}
          icon={<Target className="h-4 w-4 text-blue-500" />}
          description="Habit completion rate over the last 30 days"
        />
        <StatisticCard
          title="Achievements"
          value={stats.achievements.total}
          icon={<Trophy className="h-4 w-4 text-yellow-500" />}
          description="Total achievements unlocked"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${stats.achievements.streakMilestones ? 'bg-orange-100 text-orange-500' : 'bg-gray-100 text-gray-400'}`}>
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Week Warrior</p>
                <p className="text-sm text-muted-foreground">Maintain a 7-day streak</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${stats.achievements.consistencyKing ? 'bg-blue-100 text-blue-500' : 'bg-gray-100 text-gray-400'}`}>
                <Target className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Consistency King</p>
                <p className="text-sm text-muted-foreground">Achieve 80% success rate</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${stats.achievements.habitMaster ? 'bg-yellow-100 text-yellow-500' : 'bg-gray-100 text-gray-400'}`}>
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Habit Master</p>
                <p className="text-sm text-muted-foreground">Track 5 or more habits</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 