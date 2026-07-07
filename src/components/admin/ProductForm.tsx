"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { productSchema, type ProductInput } from "@/lib/validations"
import { createProduct, updateProduct } from "@/lib/admin/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { X, Plus } from "lucide-react"
import { ImageUploader } from "@/components/shared/ImageUploader"
import { MultiImageUploader } from "@/components/shared/MultiImageUploader"

interface ProductFormProps {
  initialData?: ProductInput & { id?: string }
  categories?: { id: string; name: string }[]
}

export function ProductForm({ initialData, categories = [] }: ProductFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sizeInput, setSizeInput] = useState("")
  const [colorName, setColorName] = useState("")
  const [colorHex, setColorHex] = useState("#000000")
  const [coverUrl, setCoverUrl] = useState<string | null>(initialData?.cover_url ?? null)
  const [galleryUrls, setGalleryUrls] = useState<string[]>(
    initialData?.gallery_urls ?? []
  )

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      slug: initialData?.slug ?? "",
      description: initialData?.description ?? "",
      category_id: initialData?.category_id ?? undefined,
      price: initialData?.price ?? 0,
      sale_price: initialData?.sale_price ?? null,
      inventory_count: initialData?.inventory_count ?? 0,
      craft_type: initialData?.craft_type ?? "",
      cover_url: initialData?.cover_url ?? null,
      is_active: initialData?.is_active ?? true,
      is_featured: initialData?.is_featured ?? false,
      sizes: initialData?.sizes ?? [],
      colors: initialData?.colors ?? [],
      gallery_urls: initialData?.gallery_urls ?? [],
    },
  })

  const sizes = watch("sizes") ?? []
  const colors = watch("colors") ?? []
  const categoryId = watch("category_id")

  function addSize() {
    const val = sizeInput.trim()
    if (!val || sizes.includes(val)) return
    setValue("sizes", [...sizes, val], { shouldValidate: true })
    setSizeInput("")
  }

  function removeSize(s: string) {
    setValue(
      "sizes",
      sizes.filter((x) => x !== s),
      { shouldValidate: true }
    )
  }

  function addColor() {
    const name = colorName.trim()
    if (!name) return
    if (colors.some((c) => c.name === name)) return
    setValue("colors", [...colors, { name, hex: colorHex }], {
      shouldValidate: true,
    })
    setColorName("")
    setColorHex("#000000")
  }

  function removeColor(name: string) {
    setValue(
      "colors",
      colors.filter((c) => c.name !== name),
      { shouldValidate: true }
    )
  }

  function handleCoverChange(url: string | null) {
    setCoverUrl(url)
    setValue("cover_url", url, { shouldValidate: true })
  }

  function handleGalleryChange(urls: string[]) {
    setGalleryUrls(urls)
    setValue("gallery_urls", urls, { shouldValidate: true })
  }

  async function onSubmit(data: ProductInput) {
    setIsSubmitting(true)
    try {
      if (initialData?.id) {
        const result = await updateProduct(initialData.id, {
          ...data,
          cover_url: coverUrl,
          gallery_urls: galleryUrls,
        })
        if (!result.ok) {
          toast.error(result.error)
          return
        }
        toast.success("Product updated")
        router.push("/admin/products")
        router.refresh()
      } else {
        const result = await createProduct({
          ...data,
          cover_url: coverUrl,
          gallery_urls: galleryUrls,
        })
        if (!result.ok) {
          toast.error(result.error)
          return
        }
        toast.success("Product created")
        router.push("/admin/products")
        router.refresh()
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                {...register("slug")}
                placeholder="auto-generated from name"
              />
              {errors.slug && (
                <p className="text-xs text-red-500">{errors.slug.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} rows={4} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category_id">Category</Label>
              <Select
                value={categoryId ?? "none"}
                onValueChange={(val) =>
                  setValue("category_id", val === "none" ? undefined : val)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="craft_type">Craft Type</Label>
              <Input
                id="craft_type"
                {...register("craft_type")}
                placeholder="e.g. Embroidered, Handwoven"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing & Inventory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Price (PKR) *</Label>
              <Input
                id="price"
                type="number"
                step="1"
                min="0"
                {...register("price", { valueAsNumber: true })}
              />
              {errors.price && (
                <p className="text-xs text-red-500">{errors.price.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sale_price">Sale Price</Label>
              <Input
                id="sale_price"
                type="number"
                step="1"
                min="0"
                {...register("sale_price", {
                  setValueAs: (v) => (v === "" || v == null ? null : Number(v)),
                })}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="inventory_count">Inventory Count</Label>
              <Input
                id="inventory_count"
                type="number"
                min="0"
                {...register("inventory_count", { valueAsNumber: true })}
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-neutral-300"
                  checked={watch("is_active") ?? true}
                  onChange={(e) => setValue("is_active", e.target.checked)}
                />
                <span className="text-sm font-medium">Active</span>
              </label>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-neutral-300"
                  checked={watch("is_featured") ?? false}
                  onChange={(e) => setValue("is_featured", e.target.checked)}
                />
                <span className="text-sm font-medium">Featured Product</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Cover Image</Label>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              The main image shown in product cards and the product page hero.
            </p>
            <div className="max-w-xs">
              <ImageUploader
                value={coverUrl}
                onChange={handleCoverChange}
                endpoint="/api/admin/upload/product-image"
                folder="products/cover"
                aspectRatio="portrait"
                label="Upload Cover"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Gallery Images</Label>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Additional product images. Drag and drop to reorder. The first image is used as the cover if no cover is set.
            </p>
            <MultiImageUploader
              values={galleryUrls}
              onChange={handleGalleryChange}
              endpoint="/api/admin/upload/product-image"
              folder="products/gallery"
              max={10}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Variants</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Sizes</Label>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Add sizes such as S, M, L, XL.
            </p>
            <div className="flex gap-2">
              <Input
                value={sizeInput}
                onChange={(e) => setSizeInput(e.target.value)}
                placeholder="e.g. S, M, L, XL"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addSize()
                  }
                }}
              />
              <Button type="button" variant="outline" size="icon" onClick={addSize}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {sizes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <div
                    key={s}
                    className="flex items-center gap-1 rounded-md border border-neutral-200 px-2 py-1 text-xs dark:border-neutral-800"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => removeSize(s)}
                      className="ml-1 text-neutral-400 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Colors</Label>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Add colors with hex codes.
            </p>
            <div className="flex gap-2">
              <Input
                value={colorName}
                onChange={(e) => setColorName(e.target.value)}
                placeholder="Color name"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addColor()
                  }
                }}
              />
              <input
                type="color"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                className="h-10 w-10 cursor-pointer rounded-md border border-neutral-200 dark:border-neutral-800"
              />
              <Button type="button" variant="outline" size="icon" onClick={addColor}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {colors.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <div
                    key={c.name}
                    className="flex items-center gap-2 rounded-md border border-neutral-200 px-2 py-1 text-xs dark:border-neutral-800"
                  >
                    <span
                      className="h-3 w-3 rounded-full border border-neutral-200 dark:border-neutral-800"
                      style={{ backgroundColor: c.hex }}
                    />
                    {c.name}
                    <button
                      type="button"
                      onClick={() => removeColor(c.name)}
                      className="text-neutral-400 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : initialData?.id
              ? "Update Product"
              : "Create Product"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
