import { Suspense } from "react";
import { isAdminConfigured } from "@/lib/supabase-admin";
import { getAdminProducts } from "@/lib/supabase-products";
import { ProductsAdminClient } from "./ProductDrawer";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  if (!isAdminConfigured) {
    return (
      <div className="p-8 text-center text-foreground/65">
        Admin database client is not configured. Set <code>SUPABASE_SERVICE_ROLE_KEY</code> in
        your environment.
      </div>
    );
  }

  const products = await getAdminProducts();
  return (
    <Suspense fallback={
      <div className="p-6 text-center text-foreground/65">
        Loading products panel...
      </div>
    }>
      <ProductsAdminClient products={products} />
    </Suspense>
  );
}

