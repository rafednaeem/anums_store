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
  updateHeartbeat,
  clearHeartbeat,
  getRememberMe,
  HEARTBEAT_INTERVAL_MS,
  type SessionState,
} from "@/lib/session"
import AuthLoadingScreen from "./AuthLoadingScreen"

interface AuthContextValue {
  state: SessionState
  signOut: () => Promise<void>
  setAuthenticated: (user: { id: string }) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

function applySession(
  sessionState: SessionState,
  setState: React.Dispatch<React.SetStateAction<SessionState>>
) {
  if (sessionState.status === "stale_session") {
    const supabase = createClient()
    clearAllSessionData()
    supabase.auth.signOut()
    setState({ status: "guest" })
    return
  }

  setState(sessionState)

  if (
    sessionState.status === "authenticated" &&
    !getRememberMe().rememberMe
  ) {
    updateHeartbeat()
  }
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>({ status: "loading" })
  const router = useRouter()
  const initialised = useRef(false)
  const stateRef = useRef(state)
  stateRef.current = state

  // ── Initial session check + sign-out listener ──────────────
  useEffect(() => {
    const supabase = createClient()
    let cancelled = false

    async function initSession() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (cancelled) return

      if (!user) {
        setState({ status: "guest" })
        return
      }

      applySession(evaluateSession(user), setState)
    }

    if (!initialised.current) {
      initialised.current = true
      initSession()
    }

    // Listen for sign-out events (token expiry, other tabs, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (cancelled) return

      if (event === "SIGNED_OUT") {
        clearHeartbeat()
        clearAllSessionData()
        setState({ status: "guest" })
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  // ── Heartbeat: active tab keeps timestamp fresh ────────────
  useEffect(() => {
    const timer = setInterval(() => {
      const current = stateRef.current
      if (
        current.status === "authenticated" &&
        !getRememberMe().rememberMe
      ) {
        updateHeartbeat()
      }
    }, HEARTBEAT_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [])

  // ── Cleanup on tab/window close ────────────────────────────
  useEffect(() => {
    function handleCleanup() {
      try {
        sessionStorage.removeItem("session_owner_tab")
        clearHeartbeat()
      } catch {
        /* ignore */
      }
    }
    window.addEventListener("beforeunload", handleCleanup)
    window.addEventListener("pagehide", handleCleanup)
    return () => {
      window.removeEventListener("beforeunload", handleCleanup)
      window.removeEventListener("pagehide", handleCleanup)
    }
  }, [])

  // ── Mark this tab as session owner after login ─────────────
  useEffect(() => {
    if (state.status === "authenticated" && !state.isRestored) {
      setSessionOwner()
    }
  }, [state])

  // ── Explicit login handler (called by LoginForm) ──────────
  // Avoids race condition with onAuthStateChange — the LoginForm
  // sets sessionStorage values BEFORE calling this, so evaluateSession
  // reads the correct ownership state.
  const setAuthenticated = useCallback((user: { id: string }) => {
    applySession(evaluateSession(user), setState)
  }, [])

  const signOut = useCallback(async () => {
    const supabase = createClient()
    clearAllSessionData()
    clearHeartbeat()
    await supabase.auth.signOut()
    setState({ status: "guest" })
    router.push("/")
  }, [router])

  return (
    <AuthContext.Provider value={{ state, signOut, setAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

// ── Tab Mismatch Screen ───────────────────────────────────────────

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

export function WelcomeBackScreen() {
  return <AuthLoadingScreen message="Welcome back to Anum's Shop. Signing you in..." />
}
