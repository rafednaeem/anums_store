import { BarChart3, Boxes, Megaphone, PackageCheck, ShieldCheck, UsersRound } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const modules = [
    [BarChart3, "Analytics", "Revenue, order, customer, and product KPIs should be read from Supabase reporting views."],
    [Boxes, "Products", "Products, categories, variants, media, and inventory are managed in Sanity Studio."],
    [PackageCheck, "Orders", "Orders are stored in Supabase with status, payment status, shipment, and item payloads."],
    [UsersRound, "Customers", "Customer profiles should be governed by Supabase Auth roles and row level security."],
    [Megaphone, "Promotions", "Homepage banners, coupons, and campaign content belong in CMS documents."],
    [ShieldCheck, "Moderation", "Reviews and admin permissions need role-backed database policies before public launch."],
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10 flex flex-col justify-between gap-4 border-b border-gray-200 pb-8 md:flex-row md:items-end">
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-ethereal-blush">Operations</p>
          <h1 className="text-4xl font-heading text-ethereal-lavender md:text-5xl">Admin Dashboard</h1>
          <p className="mt-3 max-w-2xl text-foreground/65">
            A production admin must be protected by Supabase roles and RLS. This page maps the management modules now connected across Sanity and Supabase.
          </p>
        </div>
        <Link href="/all-products" className="bg-ethereal-lavender px-5 py-3 text-sm font-bold uppercase tracking-widest text-ethereal-silver hover:bg-ethereal-blush hover:text-white">
          View Storefront
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {modules.map(([Icon, title, copy]) => {
          const CardIcon = Icon as typeof BarChart3;
          return (
            <section key={title as string} className="border border-gray-200 bg-white p-6 shadow-sm">
              <CardIcon className="mb-4 h-7 w-7 text-ethereal-blush" />
              <h2 className="mb-2 text-xl font-heading text-ethereal-lavender">{title as string}</h2>
              <p className="text-sm leading-6 text-foreground/65">{copy as string}</p>
            </section>
          );
        })}
      </div>
    </div>
  );
}
