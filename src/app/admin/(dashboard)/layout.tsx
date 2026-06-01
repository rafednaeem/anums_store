import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminNavLink from "./AdminNavLink";

const navItems = [
  { href: "/admin", label: "Dashboard", iconName: "dashboard" },
  { href: "/admin/orders", label: "Orders", iconName: "orders" },
  { href: "/admin/products", label: "Products", iconName: "products" },
  { href: "/admin/customers", label: "Customers", iconName: "customers" },
  { href: "/admin/reviews", label: "Reviews", iconName: "reviews" },
];

function isNextRedirectError(error: unknown): boolean {
  if (error && typeof error === "object" && "digest" in error) {
    const digest = (error as { digest?: unknown }).digest;
    return typeof digest === "string" && digest.startsWith("NEXT_REDIRECT");
  }
  return false;
}


export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)");
    }

    const cookieStore = cookies();
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
        },
      },
    );

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const role = session?.user?.app_metadata?.role;

    if (!session || role !== "admin") {
      redirect("/admin/login");
    }


  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <aside className="hidden w-64 flex-shrink-0 border-r border-gray-200 bg-white p-6 md:block">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-ethereal-blush">
          Operations
        </p>
        <h2 className="mb-6 text-2xl font-heading text-ethereal-lavender">Admin</h2>
        <nav className="space-y-1">
          {navItems.map(({ href, label, iconName }) => (
            <AdminNavLink
              key={href}
              href={href}
              label={label}
              iconName={iconName}
            />
          ))}
        </nav>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
  } catch (error: unknown) {
    if (isNextRedirectError(error)) {
      throw error;
    }
    const err = error instanceof Error ? error : new Error(String(error));
    return (
      <div className="p-8 text-center text-red-500 bg-white border-t-8 border-red-500 max-w-2xl mx-auto my-12 shadow-lg">
        <h2 className="text-2xl font-bold font-heading mb-4">Admin Layout Rendering Error</h2>
        <p className="text-sm text-foreground/80 mb-4 font-mono bg-red-50 p-3 border border-red-100 rounded text-left overflow-auto whitespace-pre-wrap">
          {err.message}
        </p>
        {err.stack && (
          <p className="text-xs text-foreground/60 text-left font-mono bg-gray-50 p-3 border border-gray-100 rounded overflow-auto max-h-60">
            {err.stack}
          </p>
        )}
      </div>
    );
  }
}
