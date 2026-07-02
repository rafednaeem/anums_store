import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { updateReviewStatus } from "@/lib/admin/actions"
import { Star } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ReviewsPage() {
  const supabase = createAdminClient()

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, products(name)")
    .order("created_at", { ascending: false })

  const pending = reviews?.filter((r) => r.status === "pending") ?? []
  const approved = reviews?.filter((r) => r.status === "approved") ?? []
  const rejected = reviews?.filter((r) => r.status === "rejected") ?? []

  function renderReview(review: typeof reviews extends (infer T)[] | null ? T : never) {
    const product = review.products as { name: string } | null
    return (
      <div
        key={review.id}
        className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{review.name}</span>
              <Badge
                variant={
                  review.status === "approved"
                    ? "default"
                    : review.status === "rejected"
                    ? "destructive"
                    : "secondary"
                }
              >
                {review.status}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < review.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-neutral-300 dark:text-neutral-600"
                  }`}
                />
              ))}
              <span className="ml-1 text-xs text-neutral-500 dark:text-neutral-400">
                ({review.rating}/5)
              </span>
            </div>
            {product && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                for {product.name}
              </p>
            )}
            {review.title && (
              <p className="text-sm font-medium">{review.title}</p>
            )}
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              {review.body}
            </p>
            <p className="text-xs text-neutral-400">
              {new Date(review.created_at).toLocaleDateString("en-PK")}
            </p>
          </div>
        </div>
        {review.status === "pending" && (
          <div className="mt-3 flex gap-2">
            <form action={updateReviewStatus.bind(null, review.id, "approved")}>
              <Button type="submit" size="sm" variant="default">
                Approve
              </Button>
            </form>
            <form action={updateReviewStatus.bind(null, review.id, "rejected")}>
              <Button type="submit" size="sm" variant="destructive">
                Reject
              </Button>
            </form>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
          Reviews
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Moderate customer reviews
        </p>
      </div>

      <div className="space-y-8">
        {pending.length > 0 && (
          <div>
            <div className="mb-4 flex items-center gap-2">
              <h2 className="text-lg font-semibold">Pending</h2>
              <Badge variant="secondary">{pending.length}</Badge>
            </div>
            <div className="space-y-4">
              {pending.map(renderReview)}
            </div>
          </div>
        )}

        {approved.length > 0 && (
          <div>
            <div className="mb-4 flex items-center gap-2">
              <h2 className="text-lg font-semibold">Approved</h2>
              <Badge variant="default">{approved.length}</Badge>
            </div>
            <div className="space-y-4">
              {approved.map(renderReview)}
            </div>
          </div>
        )}

        {rejected.length > 0 && (
          <div>
            <div className="mb-4 flex items-center gap-2">
              <h2 className="text-lg font-semibold">Rejected</h2>
              <Badge variant="destructive">{rejected.length}</Badge>
            </div>
            <div className="space-y-4">
              {rejected.map(renderReview)}
            </div>
          </div>
        )}

        {reviews?.length === 0 && (
          <Card>
            <CardContent className="px-4 py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
              No reviews yet
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
