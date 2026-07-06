import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { updateInquiryStatus } from "@/lib/admin/actions"
import type { Database } from "@/types/database"

export const dynamic = "force-dynamic"

type Inquiry = Database["public"]["Tables"]["inquiries"]["Row"]

export default async function InquiriesPage() {
  const supabase = createAdminClient()

  const { data: inquiries } = await supabase
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false })

  const list = (inquiries ?? []) as Inquiry[]

  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    new: { label: "New", variant: "destructive" },
    read: { label: "Read", variant: "secondary" },
    replied: { label: "Replied", variant: "default" },
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
          Inquiries
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Contact form submissions
        </p>
      </div>

      <div className="space-y-4">
        {list.length === 0 ? (
          <Card>
            <CardContent className="px-4 py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
              No inquiries yet
            </CardContent>
          </Card>
        ) : (
          list.map((inquiry) => {
            const status = statusConfig[inquiry.status] ?? statusConfig.new
            return (
              <Card key={inquiry.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{inquiry.name}</span>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {inquiry.contact}
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-300">
                        {inquiry.message}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {new Date(inquiry.created_at).toLocaleDateString("en-PK", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  {inquiry.status === "new" && (
                    <div className="mt-3 flex gap-2">
                      <form action={updateInquiryStatus.bind(null, inquiry.id, "read")}>
                        <Button type="submit" size="sm" variant="secondary">
                          Mark as Read
                        </Button>
                      </form>
                      <form action={updateInquiryStatus.bind(null, inquiry.id, "replied")}>
                        <Button type="submit" size="sm" variant="default">
                          Mark as Replied
                        </Button>
                      </form>
                    </div>
                  )}
                  {inquiry.status === "read" && (
                    <div className="mt-3">
                      <form action={updateInquiryStatus.bind(null, inquiry.id, "replied")}>
                        <Button type="submit" size="sm" variant="default">
                          Mark as Replied
                        </Button>
                      </form>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
