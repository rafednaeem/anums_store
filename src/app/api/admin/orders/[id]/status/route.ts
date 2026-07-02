import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendOrderEmail } from '@/lib/email';

const VALID_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
] as const;

type ValidStatus = (typeof VALID_STATUSES)[number];

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { status, notes } = body;

  if (!status || !VALID_STATUSES.includes(status as ValidStatus)) {
    return NextResponse.json(
      { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
      { status: 400 }
    );
  }

  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update({
      status,
      updated_at: new Date().toISOString(),
      ...(status === 'cancelled' ? { cancelled_at: new Date().toISOString() } : {}),
      ...(status === 'delivered' ? { delivered_at: new Date().toISOString() } : {}),
      ...(status === 'shipped' ? { shipped_at: new Date().toISOString() } : {}),
    })
    .eq('id', id);

  if (updateError) {
    console.error('Failed to update order status:', updateError.message);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }

  const { error: timelineError } = await supabase.from('order_timeline').insert({
    order_id: id,
    event: `status_changed_${status}`,
    details: {
      previous_status: order.status,
      new_status: status,
      notes: notes || null,
      changed_by: user.id,
    },
    created_at: new Date().toISOString(),
  });

  if (timelineError) {
    console.error('Failed to insert timeline entry:', timelineError.message);
  }

  const emailEventMap: Record<ValidStatus, string> = {
    pending: 'confirmed',
    confirmed: 'confirmed',
    processing: 'confirmed',
    shipped: 'shipped',
    delivered: 'delivered',
    cancelled: 'cancelled',
  };

  const emailEvent = emailEventMap[status as ValidStatus];
  if (emailEvent && emailEvent !== order.status) {
    sendOrderEmail(id, emailEvent as any).catch((err) => {
      console.error('Failed to send order status email:', err);
    });
  }

  return NextResponse.json({
    message: `Order status updated to ${status}`,
    order: {
      id,
      status,
      previous_status: order.status,
    },
  });
}
