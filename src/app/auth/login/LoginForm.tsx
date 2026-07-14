"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
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
      // Check if this account already has an active session elsewhere.
      // Must run BEFORE we set ownership / cookie so we can roll back cleanly.
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, active_session_token, active_session_at")
          .eq("id", user.id)
          .single()

        const isCustomer = profile?.role !== "admin"

        if (isCustomer && profile?.active_session_token) {
          // Another session exists — is it still alive?
          if (isStoredSessionActive(profile.active_session_at)) {
            await supabase.auth.signOut()
            setIsLoading(false)
            setSessionDenied(SESSION_DENIED_MSG)
            return
          }
        }

        // ── No blocking session — claim this one ──────────────
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

      // Set storage values BEFORE updating AuthProvider state,
      // so evaluateSession reads the correct ownership flag.
      setSessionOwner()

      if (data.remember_me) {
        setRememberMe(user.id)
      } else {
        clearRememberMe()
      }

      // Update AuthProvider state — evaluateSession will see
      // the ownership flag we just set and return "authenticated".
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {sessionDenied && (
        <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          {sessionDenied}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          disabled={isLoading}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/auth/reset-password"
            className="text-sm text-neutral-600 underline-offset-4 hover:underline dark:text-neutral-400"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          disabled={isLoading}
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <input
          id="remember_me"
          type="checkbox"
          className="h-4 w-4 rounded border-neutral-300 accent-neutral-900"
          disabled={isLoading}
          {...register("remember_me")}
        />
        <Label htmlFor="remember_me" className="text-sm font-normal">
          Remember Me
        </Label>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </Button>

      <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/signup"
          className="font-medium text-neutral-900 underline-offset-4 hover:underline dark:text-neutral-50"
        >
          Sign up
        </Link>
      </p>
    </form>
  )
}
