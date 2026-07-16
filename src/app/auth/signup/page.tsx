import type { Metadata } from "next"
import { SignupForm } from "./SignupForm"

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your Anums Store account",
}

export default function SignupPage() {
  return (
    <>
      {/* Auth Header */}
      <header className="mb-10 text-center">
        <h1 className="font-heading text-3xl text-ethereal-dark mb-2">
          Create Account
        </h1>
        <p className="text-sm text-muted-foreground">
          Join us to start shopping handcrafted elegance
        </p>
      </header>
      <SignupForm />
    </>
  )
}
