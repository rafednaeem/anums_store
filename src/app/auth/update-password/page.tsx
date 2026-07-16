import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
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
      <div className="text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
    </div>
  )
}
