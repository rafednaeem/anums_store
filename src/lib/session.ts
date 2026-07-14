const TAB_ID_KEY = "tab_id"
const SESSION_OWNER_KEY = "session_owner_tab"
const REMEMBER_ME_KEY = "remember_me"
const REMEMBER_ME_USER_KEY = "remember_me_user_id"

function getStorage(storage: "session" | "local"): Storage | null {
  if (typeof window === "undefined") return null
  try {
    return storage === "session" ? sessionStorage : localStorage
  } catch {
    return null
  }
}

// ── Tab ID ────────────────────────────────────────────────────────
// Every tab gets a unique ID stored in sessionStorage.
// A new tab always gets a new ID (sessionStorage is tab-scoped).

export function getTabId(): string {
  const storage = getStorage("session")
  if (!storage) return ""

  let tabId = storage.getItem(TAB_ID_KEY)
  if (!tabId) {
    tabId = crypto.randomUUID()
    storage.setItem(TAB_ID_KEY, tabId)
  }
  return tabId
}

// ── Session Ownership ─────────────────────────────────────────────
// Tracks which tab "owns" the current authenticated session.
// Stored in sessionStorage so each tab has its own value.

export function setSessionOwner(): void {
  const storage = getStorage("session")
  if (!storage) return
  storage.setItem(SESSION_OWNER_KEY, getTabId())
}

export function clearSessionOwner(): void {
  const storage = getStorage("session")
  if (!storage) return
  storage.removeItem(SESSION_OWNER_KEY)
}

export function isSessionOwner(): boolean {
  const storage = getStorage("session")
  if (!storage) return false

  const ownerTab = storage.getItem(SESSION_OWNER_KEY)
  if (!ownerTab) return false

  return ownerTab === getTabId()
}

// ── Remember Me ───────────────────────────────────────────────────
// "Remember Me" persists in localStorage (shared across tabs, survives restart).
// When set, any tab can restore the session on page load.

export function setRememberMe(userId: string): void {
  const storage = getStorage("local")
  if (!storage) return
  storage.setItem(REMEMBER_ME_KEY, "true")
  storage.setItem(REMEMBER_ME_USER_KEY, userId)
}

export function clearRememberMe(): void {
  const storage = getStorage("local")
  if (!storage) return
  storage.removeItem(REMEMBER_ME_KEY)
  storage.removeItem(REMEMBER_ME_USER_KEY)
}

export function getRememberMe(): { rememberMe: boolean; userId: string | null } {
  const storage = getStorage("local")
  if (!storage) return { rememberMe: false, userId: null }

  const rememberMe = storage.getItem(REMEMBER_ME_KEY) === "true"
  const userId = storage.getItem(REMEMBER_ME_USER_KEY)
  return { rememberMe, userId }
}

// ── Full Session Cleanup ──────────────────────────────────────────
// Clears all session-related data from both storages.

export function clearAllSessionData(): void {
  const session = getStorage("session")
  const local = getStorage("local")

  if (session) {
    session.removeItem(TAB_ID_KEY)
    session.removeItem(SESSION_OWNER_KEY)
    session.removeItem("guest_cart")
  }

  if (local) {
    local.removeItem(REMEMBER_ME_KEY)
    local.removeItem(REMEMBER_ME_USER_KEY)
  }
}

// ── Session Restore Check ─────────────────────────────────────────
// Determines what state the session is in on page load.

export type SessionState =
  | { status: "loading" }
  | { status: "guest" }
  | { status: "authenticated"; userId: string; isRestored: boolean }
  | { status: "tab_mismatch"; message: string }

export function evaluateSession(
  supabaseUser: { id: string } | null
): SessionState {
  if (!supabaseUser) {
    return { status: "guest" }
  }

  const { rememberMe, userId: rememberedUserId } = getRememberMe()

  // "Remember Me" is set and matches this user: any tab can use this session
  if (rememberMe && rememberedUserId === supabaseUser.id) {
    return {
      status: "authenticated",
      userId: supabaseUser.id,
      isRestored: !isSessionOwner(),
    }
  }

  // "Remember Me" is set but for a different user: clear it
  if (rememberMe && rememberedUserId !== supabaseUser.id) {
    clearRememberMe()
  }

  // No "Remember Me": session is tab-scoped
  if (isSessionOwner()) {
    return { status: "authenticated", userId: supabaseUser.id, isRestored: false }
  }

  // Tab doesn't own the session and no "Remember Me"
  return {
    status: "tab_mismatch",
    message:
      "Your account is already active in another tab. Please continue there or sign in again.",
  }
}
