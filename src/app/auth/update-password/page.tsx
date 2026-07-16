import type { Metadata } from "next"
import { UpdatePasswordForm } from "./UpdatePasswordForm"

export const metadata: Metadata = {
  title: "Update Password",
  description: "Update your Anums Store account password",
}

export default function UpdatePasswordPage() {
  return (
    <div className="auth-card w-full max-w-[440px] border border-border/30 bg-white p-10 md:p-12">
      {/* Auth Header */}
      <header className="mb-10 text-center">
        <h1 className="font-heading text-3xl text-ethereal-dark mb-2">
          Update Password
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your new password below
        </p>
      </header>
      <UpdatePasswordForm />
    </div>
  )
}
