import { supabaseAdmin, isAdminConfigured } from "@/lib/supabase-admin";
import InquiryRow from "./InquiryRow";

export const dynamic = "force-dynamic";

interface Inquiry {
  id: string;
  name: string;
  contact: string;
  message: string;
  status: string;
  created_at: string;
}

export default async function AdminCustomersPage() {
  if (!isAdminConfigured) {
    return (
      <div className="p-8 text-center text-foreground/65">
        Admin database client is not configured.
      </div>
    );
  }

  const { data: inquiries, error } = await supabaseAdmin
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load inquiries: {error.message}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-ethereal-blush">
          CRM
        </p>
        <h1 className="text-3xl font-heading text-ethereal-lavender">Customers</h1>
        <p className="mt-1 text-sm text-foreground/65">
          Contact form inquiries from the website.
        </p>
      </div>

      {!inquiries || inquiries.length === 0 ? (
        <p className="py-12 text-center text-foreground/65">No inquiries yet.</p>
      ) : (
        <div className="space-y-4">
          {(inquiries as Inquiry[]).map((inquiry) => (
            <InquiryRow key={inquiry.id} inquiry={inquiry} />
          ))}
        </div>
      )}
    </div>
  );
}
