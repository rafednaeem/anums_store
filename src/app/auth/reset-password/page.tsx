import type { Metadata } from "next"
import { ResetForm } from "./ResetForm"

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your Anums Store account password",
}

export default function ResetPasswordPage() {
  return (
    <div className="auth-card w-full max-w-[440px] border border-border/30 bg-white p-10 md:p-12">
      {/* Auth Header */}
      <header className="mb-10 text-center">
        <h1 className="font-heading text-3xl text-ethereal-dark mb-2">
          Reset Password
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </header>
      <ResetForm />
    </div>
  )
}
