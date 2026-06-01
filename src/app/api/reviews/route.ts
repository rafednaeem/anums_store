import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";

export async function GET(req: Request) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }

  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const total = reviews?.length ?? 0;
  const avgRating =
    total > 0
      ? reviews!.reduce((sum, r) => sum + r.rating, 0) / total
      : 0;

  return NextResponse.json({ reviews, avgRating, total });
}

export async function POST(req: Request) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "You must be logged in to submit a review." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { productId, name, rating, title, body: reviewBody } = body;

  if (!productId || !name || !rating || !reviewBody) {
    return NextResponse.json(
      { error: "productId, name, rating, and body are required" },
      { status: 400 },
    );
  }

  const numericRating = Number(rating);
  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    return NextResponse.json({ error: "Rating must be an integer between 1 and 5" }, { status: 400 });
  }

  const { error } = await supabase.from("reviews").insert({
    product_id: productId,
    user_id: user.id,
    name,
    rating: numericRating,
    title: title || null,
    body: reviewBody,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
