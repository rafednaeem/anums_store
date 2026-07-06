import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/service-role';

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

  const { action, rejection_reason } = body;

  if (!action || !['verify', 'reject'].includes(action)) {
    return NextResponse.json(
      { error: 'Action must be either "verify" or "reject"' },
      { status: 400 }
    );
  }

  if (action === 'reject' && (!rejection_reason || typeof rejection_reason !== 'string' || rejection_reason.trim().length < 5)) {
    return NextResponse.json(
      { error: 'Rejection reason is required (min 5 characters)' },
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

  const newPaymentStatus = action === 'verify' ? 'verified' : 'rejected';

  const { error: paymentUpdateError } = await (
    serviceRole.from('payments') as unknown as {
      update: (values: Record<string, unknown>) => {
        eq: (col: string, val: string) => {
          eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>
        }
      }
    }
  )
    .update({
      status: newPaymentStatus,
      verified_by: user.id,
      verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      rejection_reason: action === 'reject' ? rejection_reason.trim() : null,
    })
    .eq('order_id', id)
    .eq('status', 'submitted');

  if (paymentUpdateError) {
    console.error('Failed to update payment status:', paymentUpdateError.message);
    return NextResponse.json({ error: 'Failed to update payment status' }, { status: 500 });
  }

  const newOrderStatus =
    action === 'verify' ? 'payment_verified' : 'payment_rejected';

  const { error: orderUpdateError } = await (
    serviceRole.from('orders') as unknown as {
      update: (values: Record<string, unknown>) => {
        eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>
      }
    }
  )
    .update({
      payment_status: newPaymentStatus,
      status: newOrderStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (orderUpdateError) {
    console.error('Failed to update order status:', orderUpdateError.message);
  }

  const { error: timelineError } = await (
    serviceRole.from('order_timeline') as unknown as {
      insert: (values: Record<string, unknown>) => Promise<{ error: { message: string } | null }>
    }
  ).insert({
    order_id: id,
    status: newOrderStatus,
    note:
      action === 'verify'
        ? 'Payment verified by admin'
        : `Payment rejected: ${rejection_reason.trim()}`,
    created_by: user.id,
  });

  if (timelineError) {
    console.error('Failed to insert timeline entry:', timelineError.message);
  }

  return NextResponse.json({
    message: `Payment ${action === 'verify' ? 'verified' : 'rejected'} successfully`,
    order: {
      id,
      payment_status: newPaymentStatus,
      status: newOrderStatus,
      previous_status: order.status,
    },
  });
}
