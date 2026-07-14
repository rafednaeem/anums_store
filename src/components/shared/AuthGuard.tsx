"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  useAuth,
  TabMismatchScreen,
  WelcomeBackScreen,
} from "./SessionRestoreProvider"
import AuthLoadingScreen from "./AuthLoadingScreen"

const WELCOME_BACK_DURATION_MS = 2000

function AuthGuardInner({ children }: { children: React.ReactNode }) {
  const { state } = useAuth()
  const router = useRouter()
  const [showWelcome, setShowWelcome] = useState(false)

  // Redirect guests to login (defense-in-depth, middleware should already do this)
  useEffect(() => {
    if (state.status === "guest") {
      const params = new URLSearchParams({
        redirect: window.location.pathname,
      })
      router.push(`/auth/login?${params.toString()}`)
    }
  }, [state, router])

  // Show welcome-back screen briefly for restored sessions
  useEffect(() => {
    if (state.status === "authenticated" && state.isRestored) {
      setShowWelcome(true)
      const timer = setTimeout(() => setShowWelcome(false), WELCOME_BACK_DURATION_MS)
      return () => clearTimeout(timer)
    }
  }, [state])

  if (state.status === "loading") {
    return <AuthLoadingScreen />
  }

  if (state.status === "tab_mismatch") {
    return <TabMismatchScreen message={state.message} />
  }

  if (state.status === "guest") {
    return <AuthLoadingScreen />
  }

  if (showWelcome) {
    return <WelcomeBackScreen />
  }

  return <>{children}</>
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  return <AuthGuardInner>{children}</AuthGuardInner>
}
