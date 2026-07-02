import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

const reviewSchema = {
  validate(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.product_id || typeof data.product_id !== 'string') {
      errors.push('Product ID is required');
    }
    if (!data.rating || typeof data.rating !== 'number' || data.rating < 1 || data.rating > 5) {
      errors.push('Rating must be between 1 and 5');
    }
    if (!data.title || typeof data.title !== 'string' || data.title.trim().length < 3) {
      errors.push('Title is required (min 3 characters)');
    }
    if (!data.comment || typeof data.comment !== 'string' || data.comment.trim().length < 10) {
      errors.push('Comment is required (min 10 characters)');
    }
    if (data.display_name && typeof data.display_name !== 'string') {
      errors.push('Display name must be a string');
    }

    return { valid: errors.length === 0, errors };
  },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');

  if (!productId) {
    return NextResponse.json({ error: 'productId query parameter is required' }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('id, product_id, user_id, rating, title, comment, display_name, status, created_at')
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
    stats: {
      total: reviews?.length || 0,
      averageRating: Math.round(averageRating * 10) / 10,
    },
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const validation = reviewSchema.validate(body);
  if (!validation.valid) {
    return NextResponse.json({ error: 'Validation failed', details: validation.errors }, { status: 400 });
  }

  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('product_id', body.product_id)
    .eq('user_id', user.id)
    .single();

  if (existingReview) {
    return NextResponse.json(
      { error: 'You have already reviewed this product' },
      { status: 409 }
    );
  }

  const { data: review, error: insertError } = await supabase
    .from('reviews')
    .insert({
      product_id: body.product_id,
      user_id: user.id,
      rating: body.rating,
      title: body.title.trim(),
      comment: body.comment.trim(),
      display_name: body.display_name?.trim() || user.email?.split('@')[0] || 'Anonymous',
      status: 'pending',
    })
    .select('id, product_id, rating, title, comment, display_name, status, created_at')
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
