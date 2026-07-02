"use client"

import { Loader2 } from "lucide-react"
import { storeName } from "@/lib/constants"

export default function AuthLoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-neutral-950">
      <Loader2 className="h-10 w-10 animate-spin text-neutral-900 dark:text-neutral-100" />
      <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
        {storeName}
      </p>
    </div>
  )
}
