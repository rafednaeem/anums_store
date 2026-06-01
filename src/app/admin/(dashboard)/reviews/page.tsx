import { supabaseAdmin, isAdminConfigured } from "@/lib/supabase-admin";
import ReviewModerationRow from "./ReviewModerationRow";

export const dynamic = "force-dynamic";

interface Review {
  id: string;
  product_id: string;
  name: string;
  rating: number;
  title: string | null;
  body: string;
  status: string;
  created_at: string;
}

export default async function AdminReviewsPage() {
  if (!isAdminConfigured) {
    return (
      <div className="p-8 text-center text-foreground/65">
        Admin database client is not configured.
      </div>
    );
  }

  const { data: reviews, error } = await supabaseAdmin
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load reviews: {error.message}
      </div>
    );
  }

  const pending = (reviews as Review[]).filter((r) => r.status === "pending");
  const approved = (reviews as Review[]).filter((r) => r.status === "approved");
  const rejected = (reviews as Review[]).filter((r) => r.status === "rejected");

  return (
    <div className="p-6">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-ethereal-blush">
          Moderation
        </p>
        <h1 className="text-3xl font-heading text-ethereal-lavender">Reviews</h1>
        <p className="mt-1 text-sm text-foreground/65">
          {pending.length} pending, {approved.length} approved, {rejected.length} rejected
        </p>
      </div>

      {(!reviews || reviews.length === 0) ? (
        <p className="py-12 text-center text-foreground/65">No reviews yet.</p>
      ) : (
        <div className="space-y-4">
          {(reviews as Review[]).map((review) => (
            <ReviewModerationRow key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}
