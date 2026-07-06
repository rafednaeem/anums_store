import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { reviewSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');

  if (!productId) {
    return NextResponse.json({ error: 'productId query parameter is required' }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('id, product_id, user_id, name, rating, title, body, status, created_at')
    .eq('product_id', productId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch reviews:', error.message);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }

  const { data: stats } = await supabase
    .from('reviews')
    .select('rating')
    .eq('product_id', productId)
    .eq('status', 'approved');

  const averageRating = stats && stats.length > 0
    ? stats.reduce((sum, r) => sum + r.rating, 0) / stats.length
    : 0;

  return NextResponse.json({
    reviews: reviews || [],
    avgRating: Math.round(averageRating * 10) / 10,
    stats: {
      total: reviews?.length || 0,
      averageRating: Math.round(averageRating * 10) / 10,
    },
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const validation = reviewSchema.safeParse(body);
  if (!validation.success) {
    const firstError = validation.error.errors[0]
    return NextResponse.json(
      { error: firstError?.message ?? 'Validation failed' },
      { status: 400 }
    )
  }

  const data = validation.data

  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('product_id', data.product_id)
    .eq('user_id', user?.id ?? '')
    .maybeSingle();

  if (existingReview) {
    return NextResponse.json(
      { error: 'You have already reviewed this product' },
      { status: 409 }
    );
  }

  const { data: review, error: insertError } = await supabase
    .from('reviews')
    .insert({
      product_id: data.product_id,
      user_id: user?.id ?? null,
      name: data.name,
      rating: data.rating,
      title: data.title ?? null,
      body: data.body,
      status: 'pending',
    })
    .select('id, product_id, rating, title, body, name, status, created_at')
    .single();

  if (insertError) {
    console.error('Failed to insert review:', insertError.message);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }

  return NextResponse.json(
    { message: 'Review submitted successfully. It will be visible after approval.', review },
    { status: 201 }
  );
}
