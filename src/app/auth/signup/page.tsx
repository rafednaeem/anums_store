import type { Metadata } from "next"
import { SignupForm } from "./SignupForm"

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your Anums Store account",
}

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-cormorant text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          Create Account
        </h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Join us to start shopping handcrafted elegance
        </p>
      </div>
      <SignupForm />
    </div>
  )
}
