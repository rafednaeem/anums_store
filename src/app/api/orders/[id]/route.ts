import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

interface TimelineEntry {
  id: string
  status: string
  note: string | null
  created_at: string
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    const query = supabase
      .from("orders")
      .select(`
        *,
        order_items (*),
        payments (*),
        order_timeline (*)
      `)
      .eq("id", id)
      .single()

    const { data: order, error } = await query

    if (error || !order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      const isAdmin = (profile as Record<string, unknown>)?.role === "admin"

      if (!isAdmin && (order as Record<string, unknown>).user_id && (order as Record<string, unknown>).user_id !== user.id) {
        return NextResponse.json(
          { error: "Access denied" },
          { status: 403 }
        )
      }
    } else {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const orderData = order as Record<string, unknown>
    const timeline = ((orderData.order_timeline || []) as TimelineEntry[]).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return NextResponse.json({
      ...orderData,
      order_timeline: timeline,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error"
    console.error("Order fetch error:", error)
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
