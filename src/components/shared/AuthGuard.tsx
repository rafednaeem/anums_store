"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import AuthLoadingScreen from "./AuthLoadingScreen"

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setIsAuthenticated(true)
      } else {
        const redirect = searchParams.get("redirect") || "/auth/login"
        const params = new URLSearchParams({ redirect: window.location.pathname })
        router.push(`${redirect}?${params.toString()}`)
        setIsAuthenticated(false)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (isAuthenticated === null) {
    return <AuthLoadingScreen />
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
