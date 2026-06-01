import { isAdminConfigured, supabaseAdmin } from "@/lib/supabase-admin";

export interface SupabaseProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  category_id: string | null;
  price: number;
  sale_price: number | null;
  description: string | null;
  sizes: string[];
  quantity: number;
  stock: number;
  in_stock: boolean;
  is_active: boolean;
  on_sale: boolean;
  is_on_sale: boolean;
  show_price: boolean;
  cover_url: string | null;
  gallery_urls: string[];
  catalog_url: string | null;
  created_at: string;
  updated_at: string;
}

export type ProductInput = {
  name: string;
  slug?: string;
  category?: string;
  price: number;
  sale_price?: number | null;
  description?: string | null;
  sizes?: string[];
  quantity?: number;
  in_stock?: boolean;
  on_sale?: boolean;
  show_price?: boolean;
  cover_url?: string | null;
  gallery_urls?: string[];
  catalog_url?: string | null;
};

type AdminProductRow = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  category_id: string | null;
  price: number;
  sale_price: number | null;
  description: string | null;
  sizes: string[] | null;
  quantity: number | null;
  stock: number | null;
  in_stock: boolean | null;
  is_active: boolean | null;
  on_sale: boolean | null;
  is_on_sale: boolean | null;
  show_price: boolean | null;
  cover_url: string | null;
  catalog_url: string | null;
  created_at: string;
  updated_at: string;
  categories?: { name: string; slug: string } | null;
  product_images?: { image_url: string; sort_order: number }[];
};

function getAdminClient() {
  if (!isAdminConfigured) {
    throw new Error("Admin database client is not configured");
  }
  return supabaseAdmin;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function mapAdminProduct(row: AdminProductRow): SupabaseProduct {
  const gallery = (row.product_images ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((image) => image.image_url);

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.categories?.name ?? row.category ?? "Women Suits",
    category_id: row.category_id,
    price: Number(row.price),
    sale_price: row.sale_price === null ? null : Number(row.sale_price),
    description: row.description,
    sizes: row.sizes ?? [],
    quantity: row.stock ?? row.quantity ?? 0,
    stock: row.stock ?? row.quantity ?? 0,
    in_stock: row.is_active ?? row.in_stock ?? true,
    is_active: row.is_active ?? row.in_stock ?? true,
    on_sale: row.is_on_sale ?? row.on_sale ?? false,
    is_on_sale: row.is_on_sale ?? row.on_sale ?? false,
    show_price: row.show_price ?? true,
    cover_url: row.cover_url,
    gallery_urls: gallery,
    catalog_url: row.catalog_url,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function ensureCategory(name = "Women Suits") {
  const normalizedName = name.trim() || "Women Suits";
  const slug = slugify(normalizedName);
  const client = getAdminClient();

  const { data: existing, error: existingError } = await client
    .from("categories")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) return existing.id as string;

  const { data, error } = await client
    .from("categories")
    .insert({ name: normalizedName, slug })
    .select("id")
    .single();

  if (error) throw error;
  return data.id as string;
}

async function replaceProductImages(productId: string, galleryUrls: string[] = []) {
  const client = getAdminClient();
  const { error: deleteError } = await client
    .from("product_images")
    .delete()
    .eq("product_id", productId);

  if (deleteError) throw deleteError;

  const rows = galleryUrls
    .filter(Boolean)
    .map((image_url, sort_order) => ({ product_id: productId, image_url, sort_order }));

  if (rows.length === 0) return;

  const { error } = await client.from("product_images").insert(rows);
  if (error) throw error;
}

function productPayload(data: ProductInput, categoryId: string) {
  return {
    name: data.name,
    slug: data.slug,
    category: data.category || "Women Suits",
    category_id: categoryId,
    price: data.price,
    sale_price: data.sale_price ?? null,
    description: data.description ?? null,
    sizes: data.sizes ?? [],
    quantity: data.quantity ?? 0,
    stock: data.quantity ?? 0,
    in_stock: data.in_stock ?? true,
    is_active: data.in_stock ?? true,
    on_sale: data.on_sale ?? false,
    is_on_sale: data.on_sale ?? false,
    show_price: data.show_price ?? true,
    cover_url: data.cover_url ?? null,
    catalog_url: data.catalog_url ?? null,
    updated_at: new Date().toISOString(),
  };
}

export async function getAdminProducts() {
  const { data, error } = await getAdminClient()
    .from("products")
    .select(`
      *,
      categories(name, slug),
      product_images(image_url, sort_order)
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return ((data ?? []) as AdminProductRow[]).map(mapAdminProduct);
}

export async function createProduct(data: ProductInput) {
  const categoryId = await ensureCategory(data.category);
  const { gallery_urls = [], ...productData } = data;
  const { data: product, error } = await getAdminClient()
    .from("products")
    .insert([productPayload(productData, categoryId)])
    .select(`
      *,
      categories(name, slug),
      product_images(image_url, sort_order)
    `)
    .single();

  if (error) throw error;
  await replaceProductImages(product.id, gallery_urls);
  return mapAdminProduct({ ...(product as AdminProductRow), product_images: gallery_urls.map((image_url, sort_order) => ({ image_url, sort_order })) });
}

export async function updateProduct(id: string, data: Partial<ProductInput>) {
  const categoryId = await ensureCategory(data.category);
  const { gallery_urls, slug: _slug, ...productData } = data;
  const { error } = await getAdminClient()
    .from("products")
    .update(productPayload(productData as ProductInput, categoryId))
    .eq("id", id);

  if (error) throw error;
  if (gallery_urls) await replaceProductImages(id, gallery_urls);
}

export async function deleteProduct(id: string) {
  const { error } = await getAdminClient().from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadProductAsset(file: File, folder: "images" | "pdfs") {
  const extension = file.name.split(".").pop()?.toLowerCase() || "asset";
  const safeName = file.name
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const path = `${folder}/${Date.now().toString(36)}-${safeName}.${extension}`;

  const { error } = await getAdminClient()
    .storage
    .from("product-assets")
    .upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type || undefined,
      upsert: false,
    });

  if (error) throw error;

  const { data } = getAdminClient().storage.from("product-assets").getPublicUrl(path);
  return data.publicUrl;
}
