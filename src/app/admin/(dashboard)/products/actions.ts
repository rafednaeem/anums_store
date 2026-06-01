"use server";

import { revalidatePath } from "next/cache";
import {
  createProduct,
  deleteProduct,
  updateProduct,
  type ProductInput,
} from "@/lib/supabase-products";

type ProductActionData = Omit<ProductInput, "slug"> & {
  slug?: string;
};

function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    Date.now().toString(36)
  );
}

function normalizeProductData(data: ProductActionData, withSlug: boolean) {
  return {
    ...data,
    name: data.name.trim(),
    slug: withSlug ? data.slug || slugify(data.name) : data.slug,
    category: data.category || "Women Suits",
    price: Number(data.price),
    sale_price: data.sale_price ? Number(data.sale_price) : null,
    description: data.description?.trim() || null,
    sizes: data.sizes ?? [],
    quantity: Number(data.quantity ?? 0),
    in_stock: Boolean(data.in_stock),
    on_sale: Boolean(data.on_sale),
    show_price: Boolean(data.show_price),
    cover_url: data.cover_url || null,
    gallery_urls: data.gallery_urls ?? [],
    catalog_url: data.catalog_url || null,
  };
}

export async function createProductAction(data: ProductActionData) {
  try {
    await createProduct(normalizeProductData(data, true));
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to create product" };
  }
}

export async function updateProductAction(id: string, data: ProductActionData) {
  try {
    const normalized = normalizeProductData(data, false);
    const updates = { ...normalized };
    delete updates.slug;
    await updateProduct(id, updates);
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to update product" };
  }
}

export async function deleteProductAction(id: string) {
  try {
    await deleteProduct(id);
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to delete product" };
  }
}
