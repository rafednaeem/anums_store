import type { Metadata } from "next"
import { Suspense } from "react"
import { LoginForm } from "./LoginForm"

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Anums Store account",
}

export default function LoginPage() {
  return (
    <>
      {/* Auth Header */}
      <header className="mb-10 text-center">
        <h1 className="font-heading text-3xl text-ethereal-dark mb-2">
          Welcome Back
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your account
        </p>
      </header>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </>
  )
}
