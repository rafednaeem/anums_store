import { NextResponse } from 'next/server';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 });
    }

    const { name, contact, message } = await req.json() as {
      name?: string;
      contact?: string;
      message?: string;
    };

    if (!name?.trim() || !contact?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Name, contact, and message are required.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('inquiries')
      .insert([{ name: name.trim(), contact: contact.trim(), message: message.trim() }]);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Inquiry error:', error);
    return NextResponse.json({ error: 'Unable to send inquiry right now.' }, { status: 500 });
  }
}
