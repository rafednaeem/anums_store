import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  BarChart3, Boxes, PackageCheck, UsersRound, Star,
} from "lucide-react";
import AdminNavLink from "./AdminNavLink";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/orders", label: "Orders", icon: PackageCheck },
  { href: "/admin/products", label: "Products", icon: Boxes },
  { href: "/admin/customers", label: "Customers", icon: UsersRound },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
          {navItems.map(({ href, label, icon: Icon }) => (
            <AdminNavLink
              key={href}
              href={href}
              label={label}
              icon={Icon}
            />
          ))}
        </nav>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
