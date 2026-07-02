import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendInquiryConfirmation } from '@/lib/email';

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

const inquirySchema = {
  validate(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
      errors.push('Name is required (min 2 characters)');
    }
    if (!data.email || typeof data.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Valid email is required');
    }
    if (!data.subject || typeof data.subject !== 'string' || data.subject.trim().length < 3) {
      errors.push('Subject is required (min 3 characters)');
    }
    if (!data.message || typeof data.message !== 'string' || data.message.trim().length < 10) {
      errors.push('Message is required (min 10 characters)');
    }

    return { valid: errors.length === 0, errors };
  },
};

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const validation = inquirySchema.validate(body);
  if (!validation.valid) {
    return NextResponse.json({ error: 'Validation failed', details: validation.errors }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: inquiry, error: insertError } = await supabase
    .from('inquiries')
    .insert({
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      subject: body.subject.trim(),
      message: body.message.trim(),
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

  sendInquiryConfirmation(inquiry.id).catch((err) => {
    console.error('Failed to send inquiry confirmation email:', err);
  });

  return NextResponse.json(
    { message: 'Inquiry submitted successfully', id: inquiry.id },
    { status: 201 }
  );
}
