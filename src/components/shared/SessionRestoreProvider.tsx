"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  evaluateSession,
  setSessionOwner,
  clearAllSessionData,
  type SessionState,
} from "@/lib/session"
import AuthLoadingScreen from "./AuthLoadingScreen"

interface AuthContextValue {
  state: SessionState
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>({ status: "loading" })
  const router = useRouter()
  const initialised = useRef(false)

  useEffect(() => {
    if (initialised.current) return
    initialised.current = true

    const supabase = createClient()
    let cancelled = false

    async function checkSession() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (cancelled) return

      const sessionState = evaluateSession(user)

      if (sessionState.status === "loading") {
        setState({ status: "guest" })
        return
      }

      setState(sessionState)
    }

    checkSession()

    return () => {
      cancelled = true
    }
  }, [])

  // Mark this tab as the session owner after successful login
  useEffect(() => {
    if (state.status === "authenticated" && !state.isRestored) {
      setSessionOwner()
    }
  }, [state])

  // Best-effort cleanup: clear session ownership on tab close
  useEffect(() => {
    function handleBeforeUnload() {
      try {
        sessionStorage.removeItem("session_owner_tab")
      } catch { /* ignore */ }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [])

  const signOut = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    clearAllSessionData()
    setState({ status: "guest" })
    router.push("/")
  }, [router])

  return (
    <AuthContext.Provider value={{ state, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

// ── Tab Mismatch Screen ───────────────────────────────────────────
// Shown when a new tab detects an active session it doesn't own.

export function TabMismatchScreen({ message }: { message: string }) {
  const router = useRouter()

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-neutral-950">
      <div className="mx-4 max-w-sm text-center">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {message}
        </p>
        <button
          onClick={() => router.push("/auth/login")}
          className="mt-6 rounded-md bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          Sign In Again
        </button>
        <button
          onClick={() => router.push("/")}
          className="mt-3 block w-full text-center text-sm text-neutral-500 underline-offset-4 hover:underline"
        >
          Continue as Guest
        </button>
      </div>
    </div>
  )
}

// ── Welcome Back Screen ───────────────────────────────────────────
// Shown when a returning "Remember Me" user session is being restored.

export function WelcomeBackScreen() {
  return <AuthLoadingScreen message="Welcome back to Anum's Shop. Signing you in..." />
}
