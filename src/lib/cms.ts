import { createServiceRoleClient } from "./supabase/service-role"

export type PageContent = Record<string, string>

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

interface CacheEntry {
  data: Record<string, Record<string, string>>
  timestamp: number
}

const cache = new Map<string, CacheEntry>()

function isCacheValid(entry: CacheEntry | undefined): boolean {
  return !!entry && Date.now() - entry.timestamp < CACHE_TTL
}

async function fetchPageContent(pageSlug: string): Promise<Record<string, Record<string, string>>> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("page_content")
    .select("section_key, content_key, content_value")
    .eq("page_slug", pageSlug)
    .order("sort_order", { ascending: true })

  if (error || !data) {
    return {}
  }

  const rows = (data ?? []) as Array<{
    section_key: string
    content_key: string
    content_value: string | null
  }>

  const result: Record<string, Record<string, string>> = {}
  for (const row of rows) {
    if (!result[row.section_key]) {
      result[row.section_key] = {}
    }
    result[row.section_key][row.content_key] = row.content_value ?? ""
  }

  return result
}

export async function getRawPageContent(pageSlug: string): Promise<Record<string, Record<string, string>>> {
  const cached = cache.get(pageSlug)
  if (isCacheValid(cached)) {
    return cached!.data
  }

  const data = await fetchPageContent(pageSlug)
  cache.set(pageSlug, { data, timestamp: Date.now() })
  return data
}

export async function getPageContent(pageSlug: string): Promise<PageContent> {
  const structured = await getRawPageContent(pageSlug)

  const flat: PageContent = {}
  for (const [sectionKey, entries] of Object.entries(structured)) {
    for (const [contentKey, value] of Object.entries(entries)) {
      flat[`${sectionKey}.${contentKey}`] = value
    }
  }
  return flat
}

export function cms(
  pageContent: Record<string, string>,
  sectionKey: string,
  contentKey: string,
  fallback: string = ""
): string {
  return pageContent[`${sectionKey}.${contentKey}`] ?? fallback
}

export function invalidatePageCache(pageSlug?: string) {
  if (pageSlug) {
    cache.delete(pageSlug)
  } else {
    cache.clear()
  }
}
