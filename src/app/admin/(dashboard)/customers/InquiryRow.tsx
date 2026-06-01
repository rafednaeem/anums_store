"use client";

import { useState, useTransition } from "react";
import { MessageSquare, ExternalLink } from "lucide-react";
import { toast } from "react-hot-toast";
import { updateInquiryStatus } from "./actions";

const STATUS_OPTIONS = ["new", "read", "replied"] as const;

export default function InquiryRow({
  inquiry,
}: {
  inquiry: {
    id: string;
    name: string;
    contact: string;
    message: string;
    status: string;
    created_at: string;
  };
}) {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState(inquiry.status);
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === status) return;
    startTransition(async () => {
      const result = await updateInquiryStatus(inquiry.id, newStatus);
      if (result.error) {
        toast.error(result.error);
      } else {
        setStatus(newStatus);
        toast.success(`Marked as ${newStatus}`);
      }
    });
  };

  const isPhone = /^[\d\+\-\(\)\s]{7,}$/.test(inquiry.contact);
  const whatsappLink = isPhone
    ? `https://wa.me/${inquiry.contact.replace(/[^0-9]/g, "").replace(/^0/, "92")}`
    : null;

  const statusColor = (s: string) => {
    switch (s) {
      case "new":
        return "bg-blue-100 text-blue-700";
      case "read":
        return "bg-yellow-100 text-yellow-700";
      case "replied":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div
      className={`border ${
        status === "new" ? "border-ethereal-blush/30 bg-ethereal-blush/[0.02]" : "border-gray-200 bg-white"
      } p-5 shadow-sm transition-colors`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">{inquiry.name}</span>
            <span
              className={`inline-block rounded px-2 py-0.5 text-xs font-bold ${statusColor(status)}`}
            >
              {status}
            </span>
          </div>
          <p className="mt-1 text-sm text-foreground/65">{inquiry.contact}</p>
          <p className="mt-1 text-xs text-foreground/40">
            {new Date(inquiry.created_at).toLocaleDateString("en-PK", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded border-2 border-green-200 px-3 py-1.5 text-xs font-bold text-green-700 transition-colors hover:border-green-400 hover:bg-green-50"
              title="Contact via WhatsApp"
            >
              <MessageSquare className="h-3 w-3" />
              WhatsApp
            </a>
          )}
          {!whatsappLink && (
            <a
              href={`mailto:${inquiry.contact}`}
              className="flex items-center gap-1 rounded border-2 border-gray-200 px-3 py-1.5 text-xs font-bold text-foreground/60 transition-colors hover:border-ethereal-blush hover:text-ethereal-blush"
            >
              <ExternalLink className="h-3 w-3" />
              Email
            </a>
          )}
        </div>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-3 text-xs font-bold text-ethereal-lavender underline underline-offset-2 transition-colors hover:text-ethereal-blush"
      >
        {expanded ? "Hide message" : "Show message"}
      </button>

      {expanded && (
        <div className="mt-3 rounded border border-gray-100 bg-gray-50 p-4 text-sm leading-relaxed text-foreground/80">
          {inquiry.message}
        </div>
      )}
    </div>
  );
}
