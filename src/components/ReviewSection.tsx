"use client";

import { useEffect, useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

interface Review {
  id: string;
  product_id: string;
  name: string;
  rating: number;
  title: string | null;
  body: string;
  created_at: string;
}

export default function ReviewSection({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ name: "", rating: 5, title: "", body: "" });
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = (pid: string) => {
    setLoading(true);
    return fetch(`/api/reviews?productId=${pid}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.reviews) {
          setReviews(data.reviews);
          setAvgRating(data.avgRating);
          setTotal(data.total);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReviews(productId);
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.body.trim()) {
      toast.error("Name and review are required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, ...form }),
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success("Review submitted! It will appear after moderation.");
        setForm({ name: "", rating: 5, title: "", body: "" });
        loadReviews(productId);
      }
    } catch {
      toast.error("Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ));

  return (
    <div className="border-t border-gray-200 pt-10">
      <h2 className="mb-6 text-2xl font-heading text-foreground">Customer Reviews</h2>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-foreground/65">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading reviews...
        </div>
      ) : (
        <>
          {total > 0 && (
            <div className="mb-6 flex items-center gap-3">
              <div className="flex">{renderStars(Math.round(avgRating))}</div>
              <span className="text-lg font-bold text-foreground">
                {avgRating.toFixed(1)}
              </span>
              <span className="text-sm text-foreground/65">
                ({total} review{total !== 1 ? "s" : ""})
              </span>
            </div>
          )}

          {reviews.length === 0 ? (
            <p className="mb-6 text-sm text-foreground/65">
              No reviews yet. Be the first to review this product!
            </p>
          ) : (
            <div className="mb-8 space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border border-gray-100 bg-white p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex">{renderStars(review.rating)}</div>
                    <span className="font-bold text-foreground">{review.name}</span>
                  </div>
                  {review.title && (
                    <p className="mt-1 font-bold text-foreground/80">{review.title}</p>
                  )}
                  <p className="mt-1 text-sm leading-relaxed text-foreground/70">
                    {review.body}
                  </p>
                  <p className="mt-2 text-xs text-foreground/40">
                    {new Date(review.created_at).toLocaleDateString("en-PK", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-heading text-foreground">Write a Review</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-gray-500">
                  Name *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border-2 border-gray-200 p-2 text-sm outline-none focus:border-ethereal-maroon"
                  placeholder="Your name"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-gray-500">
                  Rating *
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setForm({ ...form, rating: star })}
                    >
                      <Star
                        className={`h-6 w-6 transition-colors ${
                          star <= form.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300 hover:text-yellow-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-gray-500">
                  Title (optional)
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border-2 border-gray-200 p-2 text-sm outline-none focus:border-ethereal-maroon"
                  placeholder="Summary of your review"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-gray-500">
                  Review *
                </label>
                <textarea
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  rows={4}
                  className="w-full border-2 border-gray-200 p-2 text-sm outline-none focus:border-ethereal-maroon"
                  placeholder="Share your experience with this product"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-1 bg-ethereal-maroon px-5 py-3 text-sm font-bold uppercase tracking-widest text-ethereal-silver transition-colors hover:bg-ethereal-maroon hover:text-white disabled:opacity-50"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Submit Review
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
