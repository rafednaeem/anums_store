"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";

export default function AdminNavLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}) {
  const pathname = usePathname();
  const active = href === "/admin" ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 border-l-4 px-3 py-2 text-sm font-bold transition-colors ${
        active
          ? "border-ethereal-blush bg-ethereal-blush/10 text-ethereal-blush"
          : "border-transparent text-foreground/70 hover:bg-ethereal-blush/10 hover:text-ethereal-blush"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
