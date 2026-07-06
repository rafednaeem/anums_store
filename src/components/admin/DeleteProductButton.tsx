"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { deleteProduct } from "@/lib/admin/actions"

interface DeleteProductButtonProps {
  id: string
  name: string
}

export function DeleteProductButton({ id, name }: DeleteProductButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [confirming, setConfirming] = useState(false)

  function handleDelete() {
    if (!confirming) {
      setConfirming(true)
      setTimeout(() => setConfirming(false), 3000)
      return
    }

    startTransition(async () => {
      try {
        await deleteProduct(id)
        toast.success(`Deleted ${name}`)
        router.refresh()
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to delete"
        toast.error(message)
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className={`inline-flex items-center gap-1 text-sm font-medium transition-colors ${
        confirming
          ? "text-red-600 hover:text-red-700"
          : "text-neutral-500 hover:text-red-600"
      }`}
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
      {confirming ? "Confirm" : "Delete"}
    </button>
  )
}
