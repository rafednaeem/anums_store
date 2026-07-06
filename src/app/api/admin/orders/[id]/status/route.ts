import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/service-role';

const VALID_STATUSES = [
  'new',
  'payment_submitted',
  'payment_verified',
  'payment_rejected',
  'processing',
  'shipped',
  'dispatched',
  'delivered',
  'cancelled',
  'refunded',
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

  const serviceRole = createServiceRoleClient();

  const { data: order, error: fetchError } = await (
    serviceRole.from('orders') as unknown as {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          single: () => Promise<{ data: Record<string, unknown> | null; error: { message: string } | null }>
        }
      }
    }
  )
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const updatePayload: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  }

  const { error: updateError } = await (
    serviceRole.from('orders') as unknown as {
      update: (values: Record<string, unknown>) => {
        eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>
      }
    }
  )
    .update(updatePayload)
    .eq('id', id);

  if (updateError) {
    console.error('Failed to update order status:', updateError.message);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }

  const { error: timelineError } = await (
    serviceRole.from('order_timeline') as unknown as {
      insert: (values: Record<string, unknown>) => Promise<{ error: { message: string } | null }>
    }
  ).insert({
    order_id: id,
    status,
    note: notes || `Status changed from ${order.status} to ${status}`,
    created_by: user.id,
  });

  if (timelineError) {
    console.error('Failed to insert timeline entry:', timelineError.message);
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
