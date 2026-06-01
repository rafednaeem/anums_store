import { Clock, Truck, CheckCircle2, XCircle } from "lucide-react";

const badgeConfig: Record<
  string,
  { label: string; class: string; icon: typeof Clock }
> = {
  new: { label: "New", class: "bg-blue-100 text-blue-700", icon: Clock },
  confirmed: {
    label: "Confirmed",
    class: "bg-cyan-100 text-cyan-700",
    icon: CheckCircle2,
  },
  shipped: {
    label: "Shipped",
    class: "bg-indigo-100 text-indigo-700",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    class: "bg-green-100 text-green-700",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    class: "bg-red-100 text-red-700",
    icon: XCircle,
  },
};

export default function OrderStatusBadge({ status }: { status: string }) {
  const cfg = badgeConfig[status] ?? badgeConfig.new;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-bold ${cfg.class}`}
    >
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}
