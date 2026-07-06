import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { inquirySchema } from '@/lib/validations';

const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 3;
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const validation = inquirySchema.safeParse(body);
  if (!validation.success) {
    const firstError = validation.error.errors[0];
    return NextResponse.json(
      { error: firstError?.message ?? 'Validation failed' },
      { status: 400 }
    );
  }

  const data = validation.data;
  const supabase = await createClient();

  const { data: inquiry, error: insertError } = await supabase
    .from('inquiries')
    .insert({
      name: data.name,
      contact: data.email,
      message: `[${data.subject || 'No subject'}]\n\n${data.message}`,
      status: 'new',
    })
    .select('id')
    .single();

  if (insertError) {
    console.error('Failed to insert inquiry:', insertError.message);
    return NextResponse.json(
      { error: 'Failed to submit inquiry. Please try again.' },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: 'Inquiry submitted successfully', id: inquiry.id },
    { status: 201 }
  );
}
