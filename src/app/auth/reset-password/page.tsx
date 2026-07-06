import type { Metadata } from "next"
import { ResetForm } from "./ResetForm"

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your Anums Store account password",
}

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-cormorant text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          Reset Password
        </h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>
      <ResetForm />
    </div>
  )
}
