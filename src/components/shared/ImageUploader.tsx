"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { Loader2, Upload, X, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ImageUploaderProps {
  value: string | null | undefined
  onChange: (url: string | null) => void
  endpoint?: string
  folder?: string
  aspectRatio?: "square" | "portrait" | "landscape"
  label?: string
  disabled?: boolean
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_SIZE = 8 * 1024 * 1024

export function ImageUploader({
  value,
  onChange,
  endpoint = "/api/admin/upload/product-image",
  folder,
  aspectRatio = "portrait",
  label = "Upload Image",
  disabled = false,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const aspectClass =
    aspectRatio === "square"
      ? "aspect-square"
      : aspectRatio === "landscape"
        ? "aspect-video"
        : "aspect-[3/4]"

  async function upload(file: File) {
    if (disabled) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Invalid file type. Please upload JPG, PNG, WEBP, or GIF.")
      return
    }

    if (file.size > MAX_SIZE) {
      toast.error("File is too large. Maximum size is 8MB.")
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      if (folder) formData.append("folder", folder)

      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Upload failed")
      }

      onChange(data.url)
      toast.success("Image uploaded")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed"
      toast.error(message)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) upload(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    if (disabled) return
    const file = e.dataTransfer.files?.[0]
    if (file) upload(file)
  }

  function handleRemove() {
    if (disabled) return
    onChange(null)
  }

  if (value) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-800",
          aspectClass
        )}
      >
        <Image
          src={value}
          alt="Uploaded image"
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 400px"
          unoptimized={value.includes("supabase")}
        />
        {!disabled && (
          <div className="absolute right-2 top-2 flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-md bg-white/90 p-1.5 text-neutral-700 shadow-sm transition-colors hover:bg-white"
              aria-label="Replace image"
            >
              <Upload className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="rounded-md bg-white/90 p-1.5 text-red-600 shadow-sm transition-colors hover:bg-red-50"
              aria-label="Remove image"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        disabled={uploading || disabled}
        className={cn(
          "flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 px-4 py-8 text-sm transition-colors hover:border-neutral-400 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-600",
          dragOver && "border-neutral-900 bg-neutral-100 dark:border-neutral-50",
          aspectClass
        )}
      >
        {uploading ? (
          <>
            <Loader2 className="mb-2 h-6 w-6 animate-spin text-neutral-500" />
            <span className="text-neutral-600 dark:text-neutral-400">
              Uploading...
            </span>
          </>
        ) : (
          <>
            <Upload className="mb-2 h-6 w-6 text-neutral-400" />
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              {label}
            </span>
            <span className="mt-1 flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
              <AlertCircle className="h-3 w-3" />
              JPG, PNG, WEBP, GIF up to 8MB
            </span>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
