"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Plus, Edit2, Trash2, X, Upload, ImageIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateCategory, deleteCategory } from "@/lib/admin/actions"
import { ImageUploader } from "@/components/shared/ImageUploader"

interface Category {
  id: string
  name: string
  slug: string
  parent_id: string | null
  sort_order: number
  is_active: boolean
  image_url: string | null
}

interface CategoryActionsProps {
  categories: Category[]
}

export function CategoryActions({ categories }: CategoryActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [mode, setMode] = useState<"closed" | "add" | "edit">("closed")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<{
    name: string
    slug: string
    parent_id: string | null
    sort_order: number
    is_active: boolean
    image_url: string | null
  }>({
    name: "",
    slug: "",
    parent_id: null,
    sort_order: 0,
    is_active: true,
    image_url: null,
  })

  function startAdd() {
    setForm({
      name: "",
      slug: "",
      parent_id: null,
      sort_order: 0,
      is_active: true,
      image_url: null,
    })
    setEditingId(null)
    setMode("add")
  }

  function startEdit(cat: Category) {
    setForm({
      name: cat.name,
      slug: cat.slug,
      parent_id: cat.parent_id,
      sort_order: cat.sort_order,
      is_active: cat.is_active,
      image_url: cat.image_url,
    })
    setEditingId(cat.id)
    setMode("edit")
  }

  function close() {
    setMode("closed")
    setEditingId(null)
  }

  function handleSave() {
    if (!form.name.trim()) {
      toast.error("Name is required")
      return
    }

    startTransition(async () => {
      try {
        if (mode === "add") {
          await updateCategory(null, form)
          toast.success("Category created")
        } else if (mode === "edit" && editingId) {
          await updateCategory(editingId, form)
          toast.success("Category updated")
        }
        close()
        router.refresh()
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed"
        toast.error(message)
      }
    })
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    startTransition(async () => {
      try {
        await deleteCategory(id)
        toast.success("Category deleted")
        router.refresh()
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed"
        toast.error(message)
      }
    })
  }

  const otherCategories = categories.filter((c) => c.id !== editingId)

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Categories</CardTitle>
          {mode === "closed" && (
            <Button onClick={startAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {categories.length === 0 ? (
            <p className="py-4 text-center text-sm text-neutral-500">
              No categories yet
            </p>
          ) : (
            <div className="space-y-2">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-3 rounded-md border border-neutral-200 p-3 dark:border-neutral-800"
                >
                  {cat.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      className="h-10 w-10 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-neutral-100 dark:bg-neutral-800">
                      <ImageIcon className="h-4 w-4 text-neutral-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{cat.name}</p>
                    <p className="text-xs text-neutral-500">/{cat.slug}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(cat)}
                    disabled={isPending}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(cat.id, cat.name)}
                    disabled={isPending}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    {isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {mode !== "closed" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {mode === "add" ? "New Category" : "Edit Category"}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={close}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cat-name">Name *</Label>
                <Input
                  id="cat-name"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-slug">Slug</Label>
                <Input
                  id="cat-slug"
                  value={form.slug}
                  onChange={(e) =>
                    setForm({ ...form, slug: e.target.value })
                  }
                  placeholder="auto-generated"
                />
              </div>
              <div className="space-y-2">
                <Label>Parent Category</Label>
                <Select
                  value={form.parent_id ?? "none"}
                  onValueChange={(val) =>
                    setForm({ ...form, parent_id: val === "none" ? null : val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No parent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No parent</SelectItem>
                    {otherCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-order">Sort Order</Label>
                <Input
                  id="cat-order"
                  type="number"
                  value={form.sort_order}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      sort_order: Number(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Category Image</Label>
              <div className="max-w-xs">
                <ImageUploader
                  value={form.image_url}
                  onChange={(url) => setForm({ ...form, image_url: url })}
                  endpoint="/api/admin/upload/media"
                  folder="categories"
                  aspectRatio="square"
                  label="Upload Category Image"
                />
              </div>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) =>
                  setForm({ ...form, is_active: e.target.checked })
                }
                className="h-4 w-4 rounded border-neutral-300"
              />
              <span className="text-sm font-medium">Active</span>
            </label>

            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : mode === "add" ? (
                  "Create Category"
                ) : (
                  "Update Category"
                )}
              </Button>
              <Button variant="outline" onClick={close} disabled={isPending}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}
