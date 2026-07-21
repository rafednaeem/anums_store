"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import {
  updatePasswordSchema,
  type UpdatePasswordInput,
} from "@/lib/validations"

export function UpdatePasswordForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSessionReady, setIsSessionReady] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdatePasswordInput>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: "",
      confirm_password: "",
    },
  })

  useEffect(() => {
    const supabase = createClient()
    const url = new URL(window.location.href)
    const code = url.searchParams.get("code")

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          toast.error("Invalid or expired reset link. Please request a new one.")
          router.push("/auth/reset-password")
        } else {
          setIsSessionReady(true)
          window.history.replaceState(null, "", window.location.pathname)
        }
      })
      return
    }

    const hash = window.location.hash
    if (hash) {
      const params = new URLSearchParams(hash.substring(1))
      const accessToken = params.get("access_token")
      const refreshToken = params.get("refresh_token")

      if (accessToken && refreshToken) {
        supabase.auth
          .setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          .then(({ error }) => {
            if (error) {
              toast.error("Invalid or expired reset link. Please request a new one.")
              router.push("/auth/reset-password")
            } else {
              setIsSessionReady(true)
              window.history.replaceState(null, "", window.location.pathname)
            }
          })
        return
      }
    }

    setIsSessionReady(true)
  }, [router])

  async function onSubmit(data: UpdatePasswordInput) {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success("Password updated successfully!")
      router.push("/account")
    } catch {
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isSessionReady) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Verifying reset link...</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* New Password Field */}
      <div className="relative">
        <Label
          htmlFor="password"
          className="mb-1 block text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
        >
          New Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="new-password"
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

      {/* Confirm New Password Field */}
      <div className="relative">
        <Label
          htmlFor="confirm_password"
          className="mb-1 block text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
        >
          Confirm New Password
        </Label>
        <div className="relative">
          <Input
            id="confirm_password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="new-password"
            disabled={isLoading}
            className="editorial-input h-auto border-0 border-b border-border bg-transparent py-3 pr-10 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-ethereal-dark"
            {...register("confirm_password")}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-muted-foreground transition-colors hover:text-ethereal-dark"
            tabIndex={-1}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.confirm_password && (
          <p className="mt-1 text-sm text-red-500">
            {errors.confirm_password.message}
          </p>
        )}
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
              Updating Password...
            </span>
          ) : (
            "Update Password"
          )}
        </button>
      </div>

      {/* Secondary Action */}
      <div className="border-t border-border/20 pt-6 text-center">
        <Link
          href="/auth/login"
          className="inline-block w-full border border-ethereal-dark py-4 text-center text-sm font-medium uppercase tracking-widest text-ethereal-dark transition-all hover:bg-ethereal-dark hover:text-white"
        >
          Back to Sign In
        </Link>
      </div>
    </form>
  )
}
