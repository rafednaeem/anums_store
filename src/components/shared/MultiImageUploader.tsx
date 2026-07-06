"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { Loader2, Upload, X, Star } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface MultiImageUploaderProps {
  values: string[]
  onChange: (urls: string[]) => void
  endpoint?: string
  folder?: string
  max?: number
  disabled?: boolean
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_SIZE = 8 * 1024 * 1024

export function MultiImageUploader({
  values,
  onChange,
  endpoint = "/api/admin/upload/product-image",
  folder,
  max = 10,
  disabled = false,
}: MultiImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function uploadFiles(files: File[]) {
    if (disabled) return
    if (values.length + files.length > max) {
      toast.error(`Maximum ${max} images allowed`)
      return
    }

    const valid = files.filter((f) => {
      if (!ALLOWED_TYPES.includes(f.type)) {
        toast.error(`${f.name}: invalid file type`)
        return false
      }
      if (f.size > MAX_SIZE) {
        toast.error(`${f.name}: file too large (max 8MB)`)
        return false
      }
      return true
    })

    if (valid.length === 0) return

    setUploading(true)
    try {
      const uploaded: string[] = []
      for (const file of valid) {
        const formData = new FormData()
        formData.append("file", file)
        if (folder) formData.append("folder", folder)

        const res = await fetch(endpoint, {
          method: "POST",
          body: formData,
        })

        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error || `Failed to upload ${file.name}`)
        }
        uploaded.push(data.url)
      }

      onChange([...values, ...uploaded])
      toast.success(`${uploaded.length} image${uploaded.length > 1 ? "s" : ""} uploaded`)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed"
      toast.error(message)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) uploadFiles(files)
  }

  function handleRemove(index: number) {
    if (disabled) return
    onChange(values.filter((_, i) => i !== index))
  }

  function handleMoveUp(index: number) {
    if (index === 0) return
    const next = [...values]
    ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
    onChange(next)
  }

  function handleMoveDown(index: number) {
    if (index === values.length - 1) return
    const next = [...values]
    ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
    onChange(next)
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {values.map((url, i) => (
          <div
            key={`${url}-${i}`}
            className="group relative aspect-square overflow-hidden rounded-md border border-neutral-200 bg-neutral-50 dark:border-neutral-800"
          >
            <Image
              src={url}
              alt={`Image ${i + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, 200px"
              unoptimized={url.includes("supabase")}
            />
            {i === 0 && (
              <div className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                <Star className="h-2.5 w-2.5" />
                Primary
              </div>
            )}
            {!disabled && (
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                {i > 0 && (
                  <button
                    type="button"
                    onClick={() => handleMoveUp(i)}
                    className="rounded bg-white/90 px-1.5 py-1 text-xs font-medium text-neutral-700 hover:bg-white"
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                )}
                {i < values.length - 1 && (
                  <button
                    type="button"
                    onClick={() => handleMoveDown(i)}
                    className="rounded bg-white/90 px-1.5 py-1 text-xs font-medium text-neutral-700 hover:bg-white"
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(i)}
                  className="rounded bg-red-600 px-1.5 py-1 text-xs font-medium text-white hover:bg-red-700"
                  aria-label="Remove"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        ))}

        {values.length < max && !disabled && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className={cn(
              "flex aspect-square flex-col items-center justify-center rounded-md border-2 border-dashed border-neutral-300 bg-neutral-50 text-xs text-neutral-500 transition-colors hover:border-neutral-400 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400",
              uploading && "pointer-events-none opacity-60"
            )}
          >
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <Upload className="mb-1 h-5 w-5" />
                <span>Add image</span>
              </>
            )}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        {values.length} of {max} images. First image is the primary cover.
      </p>
    </div>
  )
}
