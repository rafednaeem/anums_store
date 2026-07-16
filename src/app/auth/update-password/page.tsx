import type { Metadata } from "next"
import { UpdatePasswordForm } from "./UpdatePasswordForm"

export const metadata: Metadata = {
  title: "Update Password",
  description: "Update your Anums Store account password",
}

export default function UpdatePasswordPage() {
  return (
    <>
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
    </>
  )
}
