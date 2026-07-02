"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { updateCategory, deleteCategory } from "@/lib/admin/actions"
import { Plus, Edit2, Trash2 } from "lucide-react"

export function CategoryActions() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newName, setNewName] = useState("")
  const [editName, setEditName] = useState("")

  function handleAdd() {
    if (!newName.trim()) return
    startTransition(async () => {
      try {
        await updateCategory(null, { name: newName.trim() })
        toast.success("Category created")
        setNewName("")
        setShowAddForm(false)
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed")
      }
    })
  }

  function handleEdit(id: string) {
    if (!editName.trim()) return
    startTransition(async () => {
      try {
        await updateCategory(id, { name: editName.trim() })
        toast.success("Category updated")
        setEditingId(null)
        setEditName("")
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed")
      }
    })
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this category?")) return
    startTransition(async () => {
      try {
        await deleteCategory(id)
        toast.success("Category deleted")
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed")
      }
    })
  }

  return (
    <>
      <Card>
        <CardContent className="p-4">
          {showAddForm ? (
            <div className="flex items-center gap-3">
              <Input
                placeholder="Category name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="max-w-sm"
              />
              <Button
                onClick={handleAdd}
                disabled={isPending || !newName.trim()}
              >
                {isPending ? "Saving..." : "Save"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowAddForm(false)
                  setNewName("")
                }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          )}
        </CardContent>
      </Card>

      {editingId && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Input
                placeholder="Category name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEdit(editingId)}
                className="max-w-sm"
                autoFocus
              />
              <Button
                onClick={() => handleEdit(editingId)}
                disabled={isPending || !editName.trim()}
              >
                {isPending ? "Saving..." : "Update"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setEditingId(null)
                  setEditName("")
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}
