"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Package, MapPin, Heart, LogOut, User } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { clearAllSessionData, clearSessionTokenCookie } from "@/lib/session"
import AuthGuard from "@/components/shared/AuthGuard"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

interface Profile {
  full_name: string | null
  email: string
  phone: string | null
}

export default function AccountPage() {
  return (
    <Suspense fallback={null}>
      <AuthGuard>
        <AccountContent />
      </AuthGuard>
    </Suspense>
  )
}

function AccountContent() {
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from("profiles")
        .select("full_name, email, phone")
        .eq("id", user.id)
        .single()

      if (data) {
        setProfile({
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
        })
      }
    }
    loadProfile()
  }, [supabase])

  async function handleSignOut() {
    setSigningOut(true)

    // Clear single-session record from DB
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      try {
        await supabase
          .from("profiles")
          .update({
            active_session_token: null,
            active_session_at: null,
          })
          .eq("id", user.id)
      } catch {
        // Best-effort
      }
    }

    clearSessionTokenCookie()
    clearAllSessionData()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-bold text-ethereal-dark">
        My Account
      </h1>

      {/* Profile Card */}
      <div className="mt-8 rounded-lg border border-ethereal-silver/30 bg-white p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ethereal-cream">
            <User className="h-8 w-8 text-ethereal-dark" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold text-ethereal-dark">
              {profile?.full_name || "Customer"}
            </h2>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
            {profile?.phone && (
              <p className="text-sm text-muted-foreground">{profile.phone}</p>
            )}
          </div>
        </div>
      </div>

      {/* Account Links */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Link
          href="/account/orders"
          className="flex items-center gap-4 rounded-lg border border-ethereal-silver/30 bg-white p-6 transition-colors hover:border-ethereal-maroon/30 hover:shadow-sm"
        >
          <Package className="h-8 w-8 text-ethereal-maroon" />
          <div>
            <h3 className="font-medium text-ethereal-dark">Orders</h3>
            <p className="text-sm text-muted-foreground">View order history</p>
          </div>
        </Link>

        <Link
          href="/account/addresses"
          className="flex items-center gap-4 rounded-lg border border-ethereal-silver/30 bg-white p-6 transition-colors hover:border-ethereal-maroon/30 hover:shadow-sm"
        >
          <MapPin className="h-8 w-8 text-ethereal-maroon" />
          <div>
            <h3 className="font-medium text-ethereal-dark">Addresses</h3>
            <p className="text-sm text-muted-foreground">
              Manage your addresses
            </p>
          </div>
        </Link>

        <Link
          href="/account/wishlist"
          className="flex items-center gap-4 rounded-lg border border-ethereal-silver/30 bg-white p-6 transition-colors hover:border-ethereal-maroon/30 hover:shadow-sm"
        >
          <Heart className="h-8 w-8 text-ethereal-maroon" />
          <div>
            <h3 className="font-medium text-ethereal-dark">Wishlist</h3>
            <p className="text-sm text-muted-foreground">
              View your saved items
            </p>
          </div>
        </Link>
      </div>

      {/* Sign Out */}
      <div className="mt-8">
        <Button
          variant="outline"
          onClick={handleSignOut}
          disabled={signingOut}
          className="gap-2 text-red-600 hover:text-red-700"
        >
          <LogOut className="h-4 w-4" />
          {signingOut ? "Signing out..." : "Sign Out"}
        </Button>
      </div>
    </div>
  )
}
