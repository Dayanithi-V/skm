"use client"

import { useState, useEffect } from "react"
import { 
  Palette, 
  Bell, 
  User,
  LogOut,
  Trash2
} from "lucide-react"
import { useAuth } from "./auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Habit } from "./habit-tracker"

interface SettingsSectionProps {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}

function SettingsSection({ icon, title, children }: SettingsSectionProps) {
  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center gap-2">
        {icon}
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

interface SettingsDashboardProps {
  habits: Habit[]
  onDeleteHabit: (habitId: string) => void
}

export function SettingsDashboard({ habits, onDeleteHabit }: SettingsDashboardProps) {
  const { user, logout } = useAuth()
  const [theme, setTheme] = useState(() => {
    // Get initial theme from localStorage or default to system
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'system'
    }
    return 'system'
  })
  const [emailNotifications, setEmailNotifications] = useState(false)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [reminderTime, setReminderTime] = useState("20:00")

  // Handle theme changes
  useEffect(() => {
    const root = window.document.documentElement
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    
    // Remove all theme classes
    root.classList.remove('light', 'dark')
    
    // Apply the appropriate theme
    if (theme === 'system') {
      root.classList.add(systemTheme)
      document.body.style.backgroundColor = systemTheme === 'dark' ? '#09090B' : '#ffffff'
    } else {
      root.classList.add(theme)
      document.body.style.backgroundColor = theme === 'dark' ? '#09090B' : '#ffffff'
    }

    localStorage.setItem('theme', theme)
  }, [theme])

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        const systemTheme = mediaQuery.matches ? 'dark' : 'light'
        document.documentElement.classList.remove('light', 'dark')
        document.documentElement.classList.add(systemTheme)
        document.body.style.backgroundColor = systemTheme === 'dark' ? '#09090B' : '#ffffff'
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  return (
    <div className="space-y-6">
      <SettingsSection icon={<Palette className="h-5 w-5 text-purple-500" />} title="Customization">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="theme">Theme</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection icon={<Bell className="h-5 w-5 text-blue-500" />} title="Notifications">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive daily summaries via email</p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Get reminded of your habits</p>
            </div>
            <Switch
              checked={pushNotifications}
              onCheckedChange={setPushNotifications}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="reminderTime">Daily Reminder Time</Label>
            <input
              type="time"
              id="reminderTime"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            />
          </div>
        </div>
      </SettingsSection>

      <SettingsSection icon={<User className="h-5 w-5 text-sky-500" />} title="Account Settings">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
            <div>
              <p className="font-medium">Email</p>
              <p className="text-sm text-muted-foreground break-all">
                {user?.email}
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={logout}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </SettingsSection>
    </div>
  )
} 