import type { Metadata } from "next"
import { LoginForm } from "./LoginForm"

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your Anums Store account",
}

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-cormorant text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          Welcome Back
        </h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Sign in to your account to continue
        </p>
      </div>
      <LoginForm />
    </div>
  )
}
