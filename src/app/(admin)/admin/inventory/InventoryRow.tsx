"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { updateInventory } from "@/lib/admin/actions"
import { toast } from "sonner"

interface InventoryRowProps {
  variant: {
    id: string
    size: string
    color: string
    color_hex: string | null
    inventory_count: number
    products: { name: string; cover_url: string | null } | null
  }
}

export function InventoryRow({ variant }: InventoryRowProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const count = Number(formData.get("count"))
    if (isNaN(count) || count < 0) {
      toast.error("Invalid stock number")
      return
    }
    startTransition(async () => {
      try {
        await updateInventory(variant.id, count)
        toast.success("Stock updated")
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed")
      }
    })
  }

  return (
    <tr
      className={`border-b border-neutral-100 last:border-0 dark:border-neutral-800/50 ${
        variant.inventory_count <= 5 ? "bg-red-50/50 dark:bg-red-950/20" : ""
      }`}
    >
      <td className="px-4 py-3 font-medium">
        {variant.products?.name ?? "N/A"}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {variant.color_hex && (
            <span
              className="h-3 w-3 rounded-full border border-neutral-200 dark:border-neutral-800"
              style={{ backgroundColor: variant.color_hex }}
            />
          )}
          <span>
            {variant.size !== "Default" && variant.size}
            {variant.size !== "Default" && variant.color !== "Default" && " / "}
            {variant.color !== "Default" && variant.color}
            {variant.size === "Default" &&
              variant.color === "Default" &&
              "Default"}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-center">
        <span
          className={
            variant.inventory_count <= 5
              ? "font-bold text-red-600 dark:text-red-400"
              : ""
          }
        >
          {variant.inventory_count}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <form onSubmit={handleSubmit} className="inline-flex items-center gap-2">
          <Input
            name="count"
            type="number"
            min="0"
            defaultValue={variant.inventory_count}
            className="h-8 w-20 text-center text-xs"
          />
          <button
            type="submit"
            disabled={isPending}
            className="rounded bg-neutral-900 px-2 py-1 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            {isPending ? "..." : "Save"}
          </button>
        </form>
      </td>
    </tr>
  )
}
