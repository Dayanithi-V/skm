"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, signOut, User } from "firebase/auth"
import { toast } from "sonner"

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  logout: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Immediately redirect to login if not on login page
    if (pathname !== "/login" && !isAuthenticated && !loading) {
      router.push("/login")
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user)
      setUser(user)
      setLoading(false)

      if (!user && pathname !== "/login") {
        router.push("/login")
      }
    })

    return () => unsubscribe()
  }, [pathname, router, isAuthenticated, loading])

  const logout = async () => {
    try {
      await signOut(auth)
      router.push("/login")
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  // Show loading state or login page while checking auth
  if (loading) {
    return null // or a loading spinner if you prefer
  }

  // Only render children if authenticated or on login page
  if (!isAuthenticated && pathname !== "/login") {
    return null
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext) 