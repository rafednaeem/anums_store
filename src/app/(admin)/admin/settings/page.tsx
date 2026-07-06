import { createAdminClient } from "@/lib/supabase/admin"
import { SettingsForm } from "./SettingsForm"

export const dynamic = "force-dynamic"

type SiteSetting = {
  key: string
  value: string
}

export default async function SettingsPage() {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from("site_settings")
    .select("key, value")

  const list = (data ?? []) as SiteSetting[]

  const settings = list.reduce(
    (acc, row) => {
      acc[row.key] = row.value
      return acc
    },
    {} as Record<string, string>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
          Settings
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Configure your store settings
        </p>
      </div>
      <SettingsForm initialSettings={settings} />
    </div>
  )
}
