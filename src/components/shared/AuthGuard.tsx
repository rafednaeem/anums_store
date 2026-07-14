"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import AuthLoadingScreen from "./AuthLoadingScreen"

const AUTH_TIMEOUT_MS = 5000

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const timedOut = useRef(false)

  useEffect(() => {
    const supabase = createClient()
    let cancelled = false

    const timeoutId = setTimeout(() => {
      if (!cancelled) {
        timedOut.current = true
        const redirect = searchParams.get("redirect") || "/auth/login"
        const params = new URLSearchParams({ redirect: window.location.pathname })
        router.push(`${redirect}?${params.toString()}`)
        setIsAuthenticated(false)
      }
    }, AUTH_TIMEOUT_MS)

    supabase.auth
      .getUser()
      .then(({ data: { user } }) => {
        if (cancelled) return
        clearTimeout(timeoutId)
        if (user) {
          setIsAuthenticated(true)
        } else {
          const redirect = searchParams.get("redirect") || "/auth/login"
          const params = new URLSearchParams({ redirect: window.location.pathname })
          router.push(`${redirect}?${params.toString()}`)
          setIsAuthenticated(false)
        }
      })
      .catch(() => {
        if (cancelled) return
        clearTimeout(timeoutId)
        const redirect = searchParams.get("redirect") || "/auth/login"
        const params = new URLSearchParams({ redirect: window.location.pathname })
        router.push(`${redirect}?${params.toString()}`)
        setIsAuthenticated(false)
      })

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
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
