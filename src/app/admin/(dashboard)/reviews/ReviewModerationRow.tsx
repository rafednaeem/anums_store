"use client";

import { useState, useTransition } from "react";
import { Star, ExternalLink } from "lucide-react";
import { toast } from "react-hot-toast";
import { updateReviewStatus } from "./actions";

const STATUS_OPTIONS = ["pending", "approved", "rejected"] as const;

export default function ReviewModerationRow({
  review,
}: {
  review: {
    id: string;
    product_id: string;
    name: string;
    rating: number;
    title: string | null;
    body: string;
    status: string;
    created_at: string;
  };
}) {
  const [status, setStatus] = useState(review.status);
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === status) return;
    startTransition(async () => {
      const result = await updateReviewStatus(review.id, newStatus);
      if (result.error) {
        toast.error(result.error);
      } else {
        setStatus(newStatus);
        toast.success(`Review ${newStatus}`);
      }
    });
  };

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ));

  const statusColor = (s: string) => {
    switch (s) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "approved":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div
      className={`border p-5 shadow-sm transition-colors ${
        status === "pending"
          ? "border-yellow-300 bg-yellow-50/50"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-foreground">{review.name}</span>
            <span className="text-xs text-foreground/40">
              on{" "}
              <a
                href={`/product/${review.product_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-ethereal-lavender underline underline-offset-2 hover:text-ethereal-blush"
              >
                {review.product_id}
                <ExternalLink className="ml-0.5 inline h-3 w-3" />
              </a>
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <div className="flex">{renderStars(review.rating)}</div>
            {review.title && (
              <span className="text-sm font-bold text-foreground/80">
                {review.title}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm leading-relaxed text-foreground/70">
            {review.body}
          </p>
          <p className="mt-2 text-xs text-foreground/40">
            {new Date(review.created_at).toLocaleDateString("en-PK", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-block rounded px-2 py-0.5 text-xs font-bold ${statusColor(status)}`}
          >
            {status}
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt}
            onClick={() => handleStatusChange(opt)}
            disabled={isPending || status === opt}
            className={`rounded px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-40 ${
              status === opt
                ? "bg-ethereal-lavender text-ethereal-silver"
                : "border-2 border-gray-200 text-foreground/60 hover:border-ethereal-blush hover:text-ethereal-blush"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
