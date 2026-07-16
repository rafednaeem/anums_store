"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { signupSchema, type SignupInput } from "@/lib/validations"

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      password: "",
      confirm_password: "",
    },
  })

  async function onSubmit(data: SignupInput) {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            phone: data.phone || null,
          },
        },
      })

      if (error) {
        toast.error(error.message)
        return
      }

      setIsSuccess(true)
      toast.success("Account created! Please check your email to verify your account.")
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
          We&apos;ve sent a verification link to your email address. Please click
          the link to verify your account and then sign in.
        </p>
        <Link
          href="/auth/login"
          className="mt-4 inline-block text-sm font-medium text-green-800 underline-offset-4 hover:underline"
        >
          Go to Sign In
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Full Name Field */}
      <div className="relative">
        <Label
          htmlFor="full_name"
          className="mb-1 block text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
        >
          Full Name
        </Label>
        <Input
          id="full_name"
          type="text"
          placeholder="John Doe"
          autoComplete="name"
          disabled={isLoading}
          className="editorial-input h-auto border-0 border-b border-border bg-transparent py-3 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-ethereal-dark"
          {...register("full_name")}
        />
        {errors.full_name && (
          <p className="mt-1 text-sm text-red-500">{errors.full_name.message}</p>
        )}
      </div>

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

      {/* Phone Field */}
      <div className="relative">
        <Label
          htmlFor="phone"
          className="mb-1 block text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
        >
          Phone (Optional)
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder="03212345678"
          autoComplete="tel"
          disabled={isLoading}
          className="editorial-input h-auto border-0 border-b border-border bg-transparent py-3 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-ethereal-dark"
          {...register("phone")}
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="relative">
        <Label
          htmlFor="password"
          className="mb-1 block text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
        >
          Password
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

      {/* Confirm Password Field */}
      <div className="relative">
        <Label
          htmlFor="confirm_password"
          className="mb-1 block text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
        >
          Confirm Password
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
              Creating Account...
            </span>
          ) : (
            "Create Account"
          )}
        </button>
      </div>

      {/* Secondary Action */}
      <div className="border-t border-border/20 pt-6 text-center">
        <p className="mb-4 text-sm text-muted-foreground">
          Already have an account?
        </p>
        <Link
          href="/auth/login"
          className="inline-block w-full border border-ethereal-dark py-4 text-center text-sm font-medium uppercase tracking-widest text-ethereal-dark transition-all hover:bg-ethereal-dark hover:text-white"
        >
          Sign In
        </Link>
      </div>
    </form>
  )
}
