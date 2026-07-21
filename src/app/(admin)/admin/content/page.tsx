import type { Metadata } from "next"
import { getPageContents } from "@/lib/admin/actions"
import { ContentEditor } from "./ContentEditor"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Website Content | Admin",
}

export default async function ContentPage() {
  const contents = await getPageContents()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
          Website Content
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Manage all storefront content from one place
        </p>
      </div>
      <ContentEditor initialContents={contents} />
    </div>
  )
}
