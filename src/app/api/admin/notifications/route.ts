import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/service-role';

export async function GET(request: NextRequest) {
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

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
  const unreadOnly = searchParams.get('unread') === 'true';

  const serviceRole = createServiceRoleClient();

  let query = serviceRole
    .from('admin_notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (unreadOnly) {
    query = query.eq('is_read', false);
  }

  const { data: notifications, error } = await query;

  if (error) {
    console.error('Failed to fetch notifications:', error.message);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }

  const { count: unreadCount } = await serviceRole
    .from('admin_notifications')
    .select('id', { count: 'exact', head: true })
    .eq('is_read', false);

  return NextResponse.json({
    notifications: notifications || [],
    unreadCount: unreadCount || 0,
  });
}

export async function PUT(request: NextRequest) {
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

  const { notification_ids, mark_all } = body;

  if (!mark_all && (!notification_ids || !Array.isArray(notification_ids) || notification_ids.length === 0)) {
    return NextResponse.json(
      { error: 'Provide notification_ids array or set mark_all to true' },
      { status: 400 }
    );
  }

  const serviceRole = createServiceRoleClient();

  if (mark_all) {
    const { error: updateError } = await (
      serviceRole.from('admin_notifications') as unknown as {
        update: (values: Record<string, unknown>) => {
          eq: (col: string, val: unknown) => Promise<{ error: { message: string } | null }>
        }
      }
    )
      .update({ is_read: true })
      .eq('is_read', false);

    if (updateError) {
      console.error('Failed to mark all notifications as read:', updateError.message);
      return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
    }
  } else {
    const { error: updateError } = await (
      serviceRole.from('admin_notifications') as unknown as {
        update: (values: Record<string, unknown>) => {
          in: (col: string, vals: string[]) => Promise<{ error: { message: string } | null }>
        }
      }
    )
      .update({ is_read: true })
      .in('id', notification_ids);

    if (updateError) {
      console.error('Failed to mark notifications as read:', updateError.message);
      return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
    }
  }

  return NextResponse.json({ message: 'Notifications marked as read' });
}
