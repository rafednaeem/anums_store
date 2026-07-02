"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import AuthLoadingScreen from "./AuthLoadingScreen"

interface SessionRestoreContextValue {
  isRestored: boolean
}

const SessionRestoreContext = createContext<SessionRestoreContextValue>({
  isRestored: false,
})

export function useSessionRestore() {
  return useContext(SessionRestoreContext)
}

export default function SessionRestoreProvider({
  children,
}: {
  children: ReactNode
}) {
  const [isRestored, setIsRestored] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const rememberMe = localStorage.getItem("remember_me")

    if (!rememberMe) {
      setIsRestored(true)
      return
    }

    supabase.auth
      .getSession()
      .then(() => {
        setIsRestored(true)
      })
      .catch(() => {
        setIsRestored(true)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!isRestored) {
    return <AuthLoadingScreen />
  }

  return (
    <SessionRestoreContext.Provider value={{ isRestored }}>
      {children}
    </SessionRestoreContext.Provider>
  )
}
