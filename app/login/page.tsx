"use client"

import { useState, useCallback, memo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Sparkles, UserPlus, AlertCircle, Mail, Lock, User, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { registerUser, loginUser, resetPassword, auth } from "@/lib/firebase"
import { toast } from "sonner"

// Memoized Input component for better performance
const MemoizedInput = memo(({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="space-y-2">
    <Label htmlFor={props.id}>{label}</Label>
    <Input {...props} />
  </div>
));
MemoizedInput.displayName = 'MemoizedInput';

const initialFormState = {
  email: "",
  password: "",
  username: ""
};

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState("login")
  const [formData, setFormData] = useState(initialFormState)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isResetting, setIsResetting] = useState(false)
  const router = useRouter()

  // Reset form when tab changes
  useEffect(() => {
    setFormData(initialFormState);
    setError("");
  }, [activeTab]);

  // Clear form on mount
  useEffect(() => {
    setFormData(initialFormState);
  }, []);

  // Add this effect to prevent redirect loop
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        router.push("/")
      }
    })

    return () => unsubscribe()
  }, [router])

  // Optimized form handling
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError("");
  }, [error]);

  // Updated login handler with enhanced new user detection
  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError("");

    try {
      await loginUser(formData.email, formData.password);
      router.push("/");
    } catch (error: any) {
      // Handle the case where user doesn't exist (new user)
      if (error.code === 'auth/user-not-found') {
        toast.error("Account Not Found", {
          duration: 6000,
          icon: <UserPlus className="h-5 w-5 text-blue-500" />,
          description: (
            <div className="flex flex-col gap-3">
              <p className="text-sm">Please sign up first to create your account.</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setActiveTab("signup");
                  // Preserve the email for convenience
                  setFormData(prev => ({
                    ...initialFormState,
                    email: prev.email
                  }));
                }}
                className="w-full flex items-center justify-center gap-2"
              >
                Sign Up Now <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ),
        });
      } 
      // Handle incorrect password
      else if (error.code === 'auth/wrong-password') {
        toast.error("Incorrect Password", {
          duration: 3000,
          icon: <Lock className="h-5 w-5 text-red-500" />,
          description: "Please check your password and try again."
        });
      }
      // Handle other errors
      else {
        toast.error("Login Failed", {
          duration: 3000,
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
          description: error.message
        });
      }
      
      // Clear password field on any error
      setFormData(prev => ({ ...prev, password: "" }));
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [formData, isLoading, router]);

  // Updated signup handler to not auto-login
  const handleSignup = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError("");

    try {
      await registerUser(formData.email, formData.password, formData.username);
      
      // Success message with instructions to login
      toast.success("Account created successfully!", {
        duration: 5000,
        icon: <UserPlus className="h-5 w-5 text-green-500" />,
        description: "Please login with your new account credentials."
      });

      // Reset form and switch to login tab
      setFormData(initialFormState);
      setActiveTab("login");
      
    } catch (error: any) {
      setError(error.message);
      toast.error("Registration failed", {
        duration: 5000,
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
        description: error.message
      });

      // Clear form fields on error
      if (error.message.includes("email")) {
        setFormData(prev => ({ ...prev, email: "" }));
      }
    } finally {
      setIsLoading(false);
    }
  }, [formData, isLoading]);

  // Handle password reset
  const handleForgotPassword = useCallback(async () => {
    const email = formData.email.trim();

    if (!email) {
      toast.error("Email Required", {
        description: "Please enter your email address to reset your password.",
        icon: <Mail className="h-5 w-5" />,
      });
      return;
    }

    setIsResetting(true);
    try {
      await resetPassword(email);
      toast.success("Reset Email Sent!", {
        description: `Password reset instructions have been sent to ${email}`,
        duration: 5000,
        icon: <Mail className="h-5 w-5 text-green-500" />,
      });
    } catch (error: any) {
      toast.error("Reset Failed", {
        description: error.message,
        duration: 5000,
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      });
    } finally {
      setIsResetting(false);
    }
  }, [formData.email]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-500 via-blue-500 to-pink-500">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <Card className="w-full max-w-md relative overflow-hidden">
        <CardHeader className="relative space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Calendar className="h-12 w-12 text-primary animate-pulse" />
              <Sparkles className="absolute -top-2 -right-2 h-5 w-5 text-yellow-400 animate-ping" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 text-transparent bg-clip-text">
            Habit Tracker
          </CardTitle>
          <CardDescription className="text-lg">
            {activeTab === "login" ? "Welcome back!" : "Create your account"}
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
                <MemoizedInput
                  label="Email"
                  id="login-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  autoComplete="off"
                  autoFocus
                  className={error ? "border-red-500 focus:ring-red-500" : ""}
                  disabled={isLoading}
                />
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">Password</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-sm text-blue-500 hover:text-blue-600 p-0 h-auto font-normal hover:bg-transparent"
                      onClick={handleForgotPassword}
                      disabled={isResetting}
                    >
                      {isResetting ? "Sending..." : "Forgot Password?"}
                    </Button>
                  </div>
                  <Input
                    id="login-password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    autoComplete="new-password"
                    className={error ? "border-red-500 focus:ring-red-500" : ""}
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </p>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4" autoComplete="off">
                <div className="space-y-2">
                  <Label htmlFor="signup-username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="signup-username"
                      name="username"
                      type="text"
                      placeholder="Choose a username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                      autoComplete="off"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`pl-10 ${error.includes("email") ? "border-red-500 focus:ring-red-500" : ""}`}
                      required
                      autoComplete="off"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 



