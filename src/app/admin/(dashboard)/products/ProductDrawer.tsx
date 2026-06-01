"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  Download,
  Edit3,
  FileText,
  ImagePlus,
  Loader2,
  Plus,
  Settings,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import type { SupabaseProduct } from "@/lib/supabase-products";
import ProductDeleteModal from "./ProductDeleteModal";
import { createProductAction, updateProductAction } from "./actions";

const CATEGORY_OPTIONS = [
  "Women Suits",
  "Stitched Dresses",
  "Unstitched Fabric",
  "Accessories",
  "Corporate Gifting",
  "Kids",
];

type ProductFormState = {
  name: string;
  category: string;
  price: string;
  sale_price: string;
  description: string;
  sizes: string;
  quantity: string;
  in_stock: boolean;
  on_sale: boolean;
  show_price: boolean;
  cover_url: string;
  gallery_urls: string[];
  catalog_url: string;
};

const emptyForm: ProductFormState = {
  name: "",
  category: "Women Suits",
  price: "",
  sale_price: "",
  description: "",
  sizes: "",
  quantity: "0",
  in_stock: true,
  on_sale: false,
  show_price: true,
  cover_url: "",
  gallery_urls: [],
  catalog_url: "",
};

function toFormState(product?: SupabaseProduct | null): ProductFormState {
  if (!product) return emptyForm;
  return {
    name: product.name,
    category: product.category,
    price: String(product.price),
    sale_price: product.sale_price ? String(product.sale_price) : "",
    description: product.description ?? "",
    sizes: product.sizes.join(", "),
    quantity: String(product.quantity),
    in_stock: product.in_stock,
    on_sale: product.on_sale,
    show_price: product.show_price,
    cover_url: product.cover_url ?? "",
    gallery_urls: product.gallery_urls ?? [],
    catalog_url: product.catalog_url ?? "",
  };
}

function stockBadgeClass(quantity: number) {
  if (quantity >= 10) return "bg-amber-400 text-white";
  if (quantity >= 1) return "bg-yellow-300 text-black";
  return "bg-red-500 text-white";
}

function productToCsv(product: SupabaseProduct) {
  const headers = ["id", "name", "category", "price", "sale_price", "quantity", "in_stock", "cover_url"];
  const row = headers.map((key) => {
    const value = product[key as keyof SupabaseProduct];
    return `"${String(value ?? "").replace(/"/g, '""')}"`;
  });
  return `${headers.join(",")}\n${row.join(",")}`;
}

async function uploadAsset(file: File, folder: "images" | "pdfs") {
  const formData = new FormData();
  formData.set("file", file);
  formData.set("folder", folder);

  const response = await fetch("/api/admin/upload-asset", {
    method: "POST",
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Upload failed");
  return data.url as string;
}

export default function ProductDrawer({
  open,
  product,
  onClose,
}: {
  open: boolean;
  product?: SupabaseProduct | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormState>(() => toFormState(product));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [coverPreview, setCoverPreview] = useState("");
  const [isPending, startTransition] = useTransition();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setForm(toFormState(product));
    setErrors({});
    setActionError("");
    setCoverPreview("");
  }, [product, open]);

  const previewUrl = coverPreview || form.cover_url;

  const setField = <K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (errors[key]) {
      setErrors((current) => ({ ...current, [key]: "" }));
    }
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.name.trim()) nextErrors.name = "Name is required";
    if (!form.price || Number(form.price) < 0) nextErrors.price = "Price is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleFile = async (file: File, kind: "cover" | "gallery" | "catalog") => {
    try {
      if (kind === "catalog" && file.size > 10 * 1024 * 1024) {
        setErrors((current) => ({ ...current, catalog_url: "PDF must be 10 MB or smaller" }));
        return;
      }

      setUploading(kind);
      if (kind === "cover") setCoverPreview(URL.createObjectURL(file));
      const url = await uploadAsset(file, kind === "catalog" ? "pdfs" : "images");
      if (kind === "cover") setField("cover_url", url);
      if (kind === "catalog") setField("catalog_url", url);
      if (kind === "gallery") {
        setForm((current) => ({ ...current, gallery_urls: [...current.gallery_urls, url] }));
      }
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(null);
    }
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const payload = {
      name: form.name,
      category: form.category,
      price: Number(form.price),
      sale_price: form.sale_price ? Number(form.sale_price) : null,
      description: form.description || null,
      sizes: form.sizes
        .split(",")
        .map((size) => size.trim())
        .filter(Boolean),
      quantity: Number(form.quantity || 0),
      in_stock: form.in_stock,
      on_sale: form.on_sale,
      show_price: form.show_price,
      cover_url: form.cover_url || null,
      gallery_urls: form.gallery_urls,
      catalog_url: form.catalog_url || null,
    };

    startTransition(async () => {
      const result = product
        ? await updateProductAction(product.id, payload)
        : await createProductAction(payload);

      if ("error" in result) {
        setActionError(result.error ?? "Unable to save product");
        return;
      }

      onClose();
      router.refresh();
    });
  };

  return (
    <>
      {open && <div className="fixed inset-0 z-[120] bg-black/40" onClick={onClose} />}
      <aside
        className={`fixed right-0 top-0 z-[130] flex h-full w-full flex-col bg-white shadow-2xl transition-transform duration-300 ease-out sm:w-[480px] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-ethereal-silver/40 px-6 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-ethereal-blush">
              {product ? "Edit Product" : "New Product"}
            </p>
            <h2 className="font-heading text-3xl text-foreground">
              {product ? product.name : "Add product"}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 text-foreground/50 hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {actionError && (
            <div className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {actionError}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-bold text-foreground">Name</label>
            <input
              value={form.name}
              onChange={(event) => setField("name", event.target.value)}
              className="w-full border-2 border-gray-200 px-3 py-2 outline-none focus:border-ethereal-blush"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold text-foreground">Category</label>
            <select
              value={form.category}
              onChange={(event) => setField("category", event.target.value)}
              className="w-full border-2 border-gray-200 bg-white px-3 py-2 outline-none focus:border-ethereal-blush"
            >
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-bold text-foreground">Price</label>
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(event) => setField("price", event.target.value)}
                className="w-full border-2 border-gray-200 px-3 py-2 outline-none focus:border-ethereal-blush"
              />
              {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-foreground">Sale Price</label>
              <input
                type="number"
                min="0"
                value={form.sale_price}
                onChange={(event) => setField("sale_price", event.target.value)}
                className="w-full border-2 border-gray-200 px-3 py-2 outline-none focus:border-ethereal-blush"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold text-foreground">Description</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(event) => setField("description", event.target.value)}
              className="w-full border-2 border-gray-200 px-3 py-2 outline-none focus:border-ethereal-blush"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-bold text-foreground">Sizes</label>
              <input
                value={form.sizes}
                onChange={(event) => setField("sizes", event.target.value)}
                placeholder="S, M, L"
                className="w-full border-2 border-gray-200 px-3 py-2 outline-none focus:border-ethereal-blush"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-foreground">Stock Quantity</label>
              <input
                type="number"
                min="0"
                value={form.quantity}
                onChange={(event) => setField("quantity", event.target.value)}
                className="w-full border-2 border-gray-200 px-3 py-2 outline-none focus:border-ethereal-blush"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              ["in_stock", "Active"],
              ["on_sale", "On Sale"],
              ["show_price", "Show Price"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm font-bold text-foreground/75">
                <input
                  type="checkbox"
                  checked={Boolean(form[key as keyof ProductFormState])}
                  onChange={(event) => setField(key as keyof ProductFormState, event.target.checked as never)}
                  className="h-4 w-4 accent-ethereal-maroon"
                />
                {label}
              </label>
            ))}
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-foreground">Main Image</label>
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              onDrop={(event) => {
                event.preventDefault();
                const file = event.dataTransfer.files[0];
                if (file) void handleFile(file, "cover");
              }}
              onDragOver={(event) => event.preventDefault()}
              className="flex w-full items-center gap-4 border-2 border-dashed border-ethereal-silver/70 bg-ethereal-cream/40 p-3 text-left hover:border-ethereal-blush"
            >
              <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden bg-white">
                {previewUrl ? (
                  <Image src={previewUrl} alt="Product cover preview" fill className="object-cover" sizes="64px" unoptimized />
                ) : (
                  <div className="flex h-full items-center justify-center text-foreground/30">
                    <ImagePlus className="h-6 w-6" />
                  </div>
                )}
              </div>
              <span className="text-sm text-foreground/65">
                {uploading === "cover" ? "Uploading..." : "Drop image here or click to upload"}
              </span>
            </button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleFile(file, "cover");
              }}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-foreground">Product Catalog PDF</label>
            <button
              type="button"
              onClick={() => pdfInputRef.current?.click()}
              className="flex w-full items-center justify-between border border-ethereal-silver/60 px-3 py-2 text-sm text-foreground/70 hover:bg-ethereal-cream"
            >
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {form.catalog_url ? "Catalog uploaded" : "Upload PDF catalog"}
              </span>
              {uploading === "catalog" ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
            </button>
            {errors.catalog_url && <p className="mt-1 text-xs text-red-600">{errors.catalog_url}</p>}
            <input
              ref={pdfInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleFile(file, "catalog");
              }}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-bold text-foreground">Gallery Images</label>
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="text-xs font-bold uppercase tracking-wider text-ethereal-maroon"
              >
                Add images
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {form.gallery_urls.map((url) => (
                <div key={url} className="group relative aspect-[4/5] overflow-hidden bg-ethereal-cream">
                  <Image src={url} alt="Gallery image" fill className="object-cover" sizes="96px" unoptimized />
                  <button
                    type="button"
                    onClick={() => setField("gallery_urls", form.gallery_urls.filter((item) => item !== url))}
                    className="absolute right-1 top-1 hidden bg-white/90 p-1 text-red-600 group-hover:block"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="flex aspect-[4/5] items-center justify-center border border-dashed border-ethereal-silver text-foreground/40"
              >
                {uploading === "gallery" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
              </button>
            </div>
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => {
                Array.from(event.target.files ?? []).forEach((file) => void handleFile(file, "gallery"));
              }}
            />
          </div>
        </div>

        <div className="border-t border-ethereal-silver/40 px-6 py-4">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || Boolean(uploading)}
            className="flex w-full items-center justify-center gap-2 bg-[#1a4a4a] py-3 text-sm font-bold uppercase tracking-[0.18em] text-white hover:bg-foreground disabled:opacity-60"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {product ? "Save Changes" : "Create Product"}
          </button>
        </div>
      </aside>
    </>
  );
}

export function ProductsAdminClient({ products }: { products: SupabaseProduct[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [editingProduct, setEditingProduct] = useState<SupabaseProduct | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<SupabaseProduct | null>(null);
  const isAdding = searchParams.get("action") === "add";

  const currentProduct = useMemo(() => editingProduct, [editingProduct]);
  const drawerOpen = isAdding || Boolean(currentProduct);

  const closeDrawer = () => {
    setEditingProduct(null);
    if (isAdding) router.push("/admin/products");
  };

  const exportProduct = (product: SupabaseProduct) => {
    const blob = new Blob([productToCsv(product)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${product.slug}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h1 className="text-3xl font-heading text-ethereal-lavender">Products</h1>
          <p className="mt-1 text-sm text-foreground/60">Manage catalog items, images and categories.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => console.log("Insta Settings")}
            className="inline-flex items-center gap-2 border border-ethereal-silver px-4 py-2 text-sm font-bold text-foreground/70 hover:bg-ethereal-cream"
          >
            <Settings className="h-4 w-4" />
            Insta Settings
          </button>
          <button
            type="button"
            onClick={() => console.log("Sync Instagram")}
            className="border border-ethereal-silver px-4 py-2 text-sm font-bold text-foreground/70 hover:bg-ethereal-cream"
          >
            Sync Instagram
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/products?action=add")}
            className="inline-flex items-center gap-2 bg-[#1a4a4a] px-4 py-2 text-sm font-bold text-white hover:bg-foreground"
          >
            <Plus className="h-4 w-4" />
            Add new product
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs font-bold uppercase tracking-wider text-foreground/50">
              <th className="py-3 pr-4">Name</th>
              <th className="py-3 pr-4">Category</th>
              <th className="py-3 pr-4">Price</th>
              <th className="py-3 pr-4">Stock</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-gray-100 transition-colors hover:bg-ethereal-blush/5">
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-14 w-10 flex-shrink-0 overflow-hidden bg-ethereal-cream">
                      {product.cover_url ? (
                        <Image src={product.cover_url} alt={product.name} fill className="object-cover" sizes="64px" unoptimized />
                      ) : null}
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{product.name}</p>
                      <p className="text-xs text-foreground/40">{product.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-4 text-foreground/65">{product.category}</td>
                <td className="py-3 pr-4">
                  {product.show_price ? (
                    <span className="font-bold text-ethereal-blush">
                      Rs. {(product.on_sale && product.sale_price ? product.sale_price : product.price).toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-foreground/45">Hidden</span>
                  )}
                </td>
                <td className="py-3 pr-4">
                  <span className={`inline-block rounded px-2 py-0.5 text-xs font-bold ${stockBadgeClass(product.quantity)}`}>
                    {product.quantity} items
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <span
                    className={`inline-block rounded px-2 py-0.5 text-xs font-bold ${
                      product.in_stock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {product.in_stock ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingProduct(product)}
                      className="p-2 text-foreground/50 hover:text-ethereal-blush"
                      aria-label={`Edit ${product.name}`}
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => exportProduct(product)}
                      className="p-2 text-foreground/50 hover:text-ethereal-lavender"
                      aria-label={`Export ${product.name}`}
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteProduct(product)}
                      className="p-2 text-foreground/50 hover:text-red-600"
                      aria-label={`Delete ${product.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="py-12 text-center text-foreground/60">No products found.</div>
        )}
      </div>

      <ProductDrawer open={drawerOpen} product={currentProduct} onClose={closeDrawer} />
      {deleteProduct && (
        <ProductDeleteModal
          product={deleteProduct}
          onClose={() => {
            setDeleteProduct(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
