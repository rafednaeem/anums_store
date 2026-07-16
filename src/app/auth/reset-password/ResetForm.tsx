"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations"

export function ResetForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(data: ResetPasswordInput) {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      setIsSuccess(true)
      toast.success("Reset link sent! Check your email.")
    } catch {
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="border border-green-200 bg-green-50 p-6 text-center">
        <h2 className="text-lg font-semibold text-green-800">
          Check Your Email
        </h2>
        <p className="mt-2 text-sm text-green-700">
          We&apos;ve sent a password reset link to your email address. Please
          click the link to reset your password.
        </p>
        <Link
          href="/auth/login"
          className="mt-4 inline-block text-sm font-medium text-green-800 underline-offset-4 hover:underline"
        >
          Back to Sign In
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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
              Sending Reset Link...
            </span>
          ) : (
            "Send Reset Link"
          )}
        </button>
      </div>

      {/* Secondary Action */}
      <div className="border-t border-border/20 pt-6 text-center">
        <p className="mb-4 text-sm text-muted-foreground">
          Remember your password?
        </p>
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
