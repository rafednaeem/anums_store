import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { ArrowLeft } from "lucide-react"
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
      <div className="mt-8 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-ethereal-dark"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
    </>
  )
}
