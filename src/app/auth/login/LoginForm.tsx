"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { loginSchema, type LoginInput } from "@/lib/validations"
import {
  setSessionOwner,
  setRememberMe,
  clearRememberMe,
  generateSessionToken,
  setSessionTokenCookie,
  isStoredSessionActive,
} from "@/lib/session"
import { useAuth } from "@/components/shared/SessionRestoreProvider"

const SESSION_DENIED_MSG =
  "This account is already signed in on another device or browser. Please sign out there before signing in here."

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/account"
  const errorParam = searchParams.get("error")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [sessionDenied, setSessionDenied] = useState(
    errorParam === "session_superseded" ? SESSION_DENIED_MSG : ""
  )
  const { setAuthenticated } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember_me: false,
    },
  })

  async function onSubmit(data: LoginInput) {
    setIsLoading(true)
    setSessionDenied("")
    const supabase = createClient()

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast.error("Failed to get user information")
        return
      }

      // ── Single-session enforcement (customers only) ──────────
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, active_session_token, active_session_at")
          .eq("id", user.id)
          .single()

        const isCustomer = profile?.role !== "admin"

        if (isCustomer && profile?.active_session_token) {
          if (isStoredSessionActive(profile.active_session_at)) {
            await supabase.auth.signOut()
            setIsLoading(false)
            setSessionDenied(SESSION_DENIED_MSG)
            return
          }
        }

        const token = generateSessionToken()

        if (isCustomer) {
          await supabase
            .from("profiles")
            .update({
              active_session_token: token,
              active_session_at: new Date().toISOString(),
            })
            .eq("id", user.id)

          setSessionTokenCookie(token)
        }
      } catch {
        // Profile query failed (transient DB issue) — allow login (fail-open)
      }

      setSessionOwner()

      if (data.remember_me) {
        setRememberMe(user.id)
      } else {
        clearRememberMe()
      }

      setAuthenticated(user)

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (profile?.role === "admin") {
        toast.success("Welcome back, Admin!")
        router.push("/admin")
      } else {
        toast.success("Welcome back!")
        router.push(redirect)
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {sessionDenied && (
        <div className="border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {sessionDenied}
        </div>
      )}

      {/* Email Field */}
      <div className="relative">
        <Label
          htmlFor="email"
          className="mb-1 block text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
        >
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="email@example.com"
          autoComplete="email"
          disabled={isLoading}
          className="editorial-input h-auto border-0 border-b border-border bg-transparent py-3 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-ethereal-dark"
          {...register("email")}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="relative">
        <div className="mb-1 flex items-center justify-between">
          <Label
            htmlFor="password"
            className="text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
          >
            Password
          </Label>
          <Link
            href="/auth/reset-password"
            className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ethereal-maroon opacity-80 transition-opacity hover:opacity-100"
          >
            Forgot?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={isLoading}
            className="editorial-input h-auto border-0 border-b border-border bg-transparent py-3 pr-10 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-ethereal-dark"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-muted-foreground transition-colors hover:text-ethereal-dark"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      {/* Remember Me */}
      <div className="flex items-center space-x-2">
        <input
          id="remember_me"
          type="checkbox"
          className="h-4 w-4 border-border accent-ethereal-dark"
          disabled={isLoading}
          {...register("remember_me")}
        />
        <Label htmlFor="remember_me" className="text-sm font-normal">
          Remember Me
        </Label>
      </div>

      {/* Primary Action */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-ethereal-dark py-4 text-sm font-medium uppercase tracking-widest text-white transition-all hover:bg-ethereal-dark/90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing In...
            </span>
          ) : (
            "Sign In"
          )}
        </button>
      </div>

      {/* Secondary Action */}
      <div className="border-t border-border/20 pt-6 text-center">
        <p className="mb-4 text-sm text-muted-foreground">
          New to Anums Store?
        </p>
        <Link
          href="/auth/signup"
          className="inline-block w-full border border-ethereal-dark py-4 text-center text-sm font-medium uppercase tracking-widest text-ethereal-dark transition-all hover:bg-ethereal-dark hover:text-white"
        >
          Create an Account
        </Link>
      </div>
    </form>
  )
}
