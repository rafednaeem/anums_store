import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";

export type ProductSort = "newest" | "price-asc" | "price-desc";

export interface ProductListItem {
  id: string;
  name: string;
  slug: { current: string };
  price: number;
  comparePrice?: number;
  images?: string[];
  category?: string;
  categorySlug?: string;
  inStock?: boolean;
  quantity?: number;
  rating?: number;
  reviewCount?: number;
  showPrice?: boolean;
  catalogUrl?: string | null;
}

export interface ProductDetailItem extends ProductListItem {
  sizes?: string[];
  description?: string | null;
  details?: string[];
}

export interface ProductFilters {
  category?: string;
  occasion?: string;
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSort;
  limit?: number;
}

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  description: string | null;
  sizes: string[] | null;
  stock: number | null;
  quantity: number | null;
  is_active: boolean | null;
  in_stock: boolean | null;
  is_on_sale: boolean | null;
  on_sale: boolean | null;
  show_price: boolean | null;
  cover_url: string | null;
  catalog_url: string | null;
  category: string | null;
  created_at: string;
  categories?: { name: string; slug: string }[] | null;
  product_images?: { image_url: string; sort_order: number }[];
  product_reviews?: { rating: number }[];
};

const sortColumn: Record<ProductSort, { column: string; ascending: boolean }> = {
  newest: { column: "created_at", ascending: false },
  "price-asc": { column: "price", ascending: true },
  "price-desc": { column: "price", ascending: false },
};

function mapProduct(row: ProductRow): ProductListItem {
  const gallery = (row.product_images ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((image) => image.image_url);
  const images = [row.cover_url, ...gallery].filter(Boolean) as string[];
  const reviews = row.product_reviews ?? [];
  const reviewCount = reviews.length;
  const rating =
    reviewCount > 0
      ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviewCount
      : undefined;
  const onSale = row.is_on_sale ?? row.on_sale ?? false;
  const salePrice = row.sale_price ?? undefined;

  return {
    id: row.id,
    name: row.name,
    slug: { current: row.slug },
    price: onSale && salePrice ? Number(salePrice) : Number(row.price),
    comparePrice: onSale && salePrice ? Number(row.price) : undefined,
    images,
    category: row.categories?.[0]?.name ?? row.category ?? undefined,
    categorySlug: row.categories?.[0]?.slug ?? row.category ?? undefined,
    inStock: row.is_active ?? row.in_stock ?? true,
    quantity: row.stock ?? row.quantity ?? 0,
    rating,
    reviewCount,
    showPrice: row.show_price ?? true,
    catalogUrl: row.catalog_url,
  };
}

function mapProductDetail(row: ProductRow): ProductDetailItem {
  return {
    ...mapProduct(row),
    description: row.description,
    sizes: row.sizes ?? [],
    details: [],
  };
}

function queryBase() {
  return supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      price,
      sale_price,
      description,
      sizes,
      stock,
      quantity,
      is_active,
      in_stock,
      is_on_sale,
      on_sale,
      show_price,
      cover_url,
      catalog_url,
      category,
      created_at,
      categories(name, slug),
      product_images(image_url, sort_order),
      product_reviews!product_reviews_product_id_fkey(rating)
    `)
    .eq("is_active", true);
}

export async function getProducts({
  category,
  query,
  minPrice = 0,
  maxPrice = 9999999,
  sort = "newest",
  limit = 48,
}: ProductFilters = {}) {
  if (!isSupabaseConfigured) return [];

  const selectedSort = sortColumn[sort] || sortColumn.newest;
  let request = queryBase()
    .gte("price", minPrice)
    .lte("price", maxPrice)
    .order(selectedSort.column, { ascending: selectedSort.ascending })
    .limit(limit);

  if (category) {
    const { data: matchedCategory } = await supabase
      .from("categories")
      .select("id,name,slug")
      .or(`slug.eq.${category},name.eq.${category}`)
      .maybeSingle();

    if (matchedCategory?.id) {
      request = request.eq("category_id", matchedCategory.id);
    } else {
      request = request.eq("category", category);
    }
  }

  if (query) {
    request = request.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
  }

  const { data, error } = await request;
  if (error || !data) {
    console.error("getProducts error:", error);
    return [];
  }

  return (data as ProductRow[]).map(mapProduct);
}

export async function getFeaturedProducts() {
  return getProducts({ limit: 6 });
}

export async function getProductBySlug(slug: string) {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await queryBase().eq("slug", slug).single();
  if (error || !data) {
    console.error("getProductBySlug error:", error);
    return null;
  }

  return mapProductDetail(data as ProductRow);
}

export async function getRelatedProducts(categorySlug: string | undefined, currentSlug: string) {
  if (!categorySlug) return [];
  const products = await getProducts({ category: categorySlug, limit: 4 });
  return products.filter((product) => product.slug.current !== currentSlug).slice(0, 3);
}
