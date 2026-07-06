import { createServiceRoleClient } from "./supabase/service-role"

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
let cache: Record<string, string> | null = null
let cacheTimestamp = 0

export async function getSettings(): Promise<Record<string, string>> {
  if (cache && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cache
  }

  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value")

  if (error || !data) {
    return cache || {}
  }

  const list = (data ?? []) as Array<{ key: string; value: string }>
  cache = list.reduce((acc, row) => {
    acc[row.key] = row.value
    return acc
  }, {} as Record<string, string>)

  cacheTimestamp = Date.now()
  return cache
}

export async function getSetting(key: string): Promise<string | null> {
  const settings = await getSettings()
  return settings[key] ?? null
}

export function extractSettings(settings: Record<string, string>) {
  return {
    storeName: settings.store_name || process.env.NEXT_PUBLIC_STORE_NAME || "Anums Store",
    storeEmail: settings.store_email || process.env.NEXT_PUBLIC_STORE_EMAIL || "",
    storePhone: settings.store_phone || process.env.NEXT_PUBLIC_STORE_PHONE || "",
    storeAddress: settings.store_address || "",
    whatsappNumber: settings.whatsapp_number || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
    bankName: settings.bank_name || "",
    bankAccount: settings.bank_account || "",
    bankIban: settings.bank_iban || "",
    bankAccountTitle: settings.bank_account_title || "",
    freeShippingThreshold: Number(settings.free_shipping_threshold) || 10000,
    defaultShippingRate: Number(settings.default_shipping_rate) || 500,
  }
}
