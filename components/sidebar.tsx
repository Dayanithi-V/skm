"use client"

import { BarChart3, Calendar, Home, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "./auth-provider"

interface SidebarProps {
  activeView: string
  setActiveView: (view: string) => void
}

export function Sidebar({ activeView, setActiveView }: SidebarProps) {
  const { user, logout } = useAuth()
  
  const navItems = [
    {
      id: "habits",
      label: "Habits",
      icon: Home,
    },
    {
      id: "stats",
      label: "Statistics",
      icon: BarChart3,
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
    },
  ]

  return (
    <div className="w-64 border-r bg-muted/30 h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          <h1 className="font-bold text-xl">Dhaya's Habit Tracker</h1>
        </div>
      </div>
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveView(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  activeView === item.id ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t">
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Signed in as{" "}
            <span className="font-medium text-foreground break-all">
              {user?.email}
            </span>
          </p>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}