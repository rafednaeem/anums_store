"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3, Boxes, PackageCheck, UsersRound, Star,
} from "lucide-react";

const icons: Record<string, typeof BarChart3> = {
  dashboard: BarChart3,
  orders: PackageCheck,
  products: Boxes,
  customers: UsersRound,
  reviews: Star,
};

export default function AdminNavLink({
  href,
  label,
  iconName,
}: {
  href: string;
  label: string;
  iconName: string;
}) {
  const pathname = usePathname();
  const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
  const Icon = icons[iconName];

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 border-l-4 px-3 py-2 text-sm font-bold transition-colors ${
        active
          ? "border-ethereal-blush bg-ethereal-blush/10 text-ethereal-blush"
          : "border-transparent text-foreground/70 hover:bg-ethereal-blush/10 hover:text-ethereal-blush"
      }`}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {label}
    </Link>
  );
}
