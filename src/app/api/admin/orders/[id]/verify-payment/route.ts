import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendOrderEmail } from '@/lib/email';

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

  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const newPaymentStatus = action === 'verify' ? 'verified' : 'rejected';
  const newOrderStatus = action === 'verify' ? 'confirmed' : order.status;

  const { error: paymentUpdateError } = await supabase
    .from('orders')
    .update({
      payment_status: newPaymentStatus,
      status: newOrderStatus,
      payment_verified_at: action === 'verify' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (paymentUpdateError) {
    console.error('Failed to update payment status:', paymentUpdateError.message);
    return NextResponse.json({ error: 'Failed to update payment status' }, { status: 500 });
  }

  const { error: timelineError } = await supabase.from('order_timeline').insert({
    order_id: id,
    event: `payment_${action}`,
    details: {
      previous_payment_status: order.payment_status,
      new_payment_status: newPaymentStatus,
      previous_order_status: order.status,
      new_order_status: newOrderStatus,
      rejection_reason: action === 'reject' ? rejection_reason.trim() : null,
      verified_by: user.id,
    },
    created_at: new Date().toISOString(),
  });

  if (timelineError) {
    console.error('Failed to insert timeline entry:', timelineError.message);
  }

  const emailEvent = action === 'verify' ? 'payment_verified' : 'payment_rejected';
  sendOrderEmail(id, emailEvent, action === 'reject' ? rejection_reason.trim() : undefined).catch(
    (err) => {
      console.error('Failed to send payment verification email:', err);
    }
  );

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
