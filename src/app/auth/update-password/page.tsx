import type { Metadata } from "next"
import { UpdatePasswordForm } from "./UpdatePasswordForm"

export const metadata: Metadata = {
  title: "Update Password",
  description: "Update your Anums Store account password",
}

export default function UpdatePasswordPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-cormorant text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          Update Password
        </h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Enter your new password below
        </p>
      </div>
      <UpdatePasswordForm />
    </div>
  )
}
