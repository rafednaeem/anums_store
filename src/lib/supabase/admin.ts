import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function requireAdmin() {
  const { createClient } = await import("@supabase/ssr")
  const { cookies } = await import("next/headers")

  const cookieStore = await cookies()
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.app_metadata?.role !== "admin") {
    return null
  }

  return user
}

export async function requireAdminThrow() {
  const user = await requireAdmin()
  if (!user) {
    throw new Error("Unauthorized: admin access required")
  }
  return user
}
