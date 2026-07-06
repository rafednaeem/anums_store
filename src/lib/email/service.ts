import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { getProvider } from './providers';
import type { SendEmailParams } from './providers';

export async function sendEmail(params: SendEmailParams): Promise<{ id: string; provider: string }> {
  const provider = getProvider();
  return provider.send(params);
}

export async function sendWithRetry(
  params: SendEmailParams,
  maxAttempts: number = 3
): Promise<{ id: string; provider: string }> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await sendEmail(params);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(
        `Email send attempt ${attempt}/${maxAttempts} failed:`,
        lastError.message
      );

      if (attempt < maxAttempts) {
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Email send failed after all attempts');
}

export async function isDuplicate(dedupKey: string, withinMinutes: number = 24): Promise<boolean> {
  const supabase = createServiceRoleClient();
  const cutoff = new Date(Date.now() - withinMinutes * 60 * 1000).toISOString();

  const { data, error } = await (
    supabase.from('email_logs') as unknown as {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          gte: (col: string, val: string) => {
            limit: (n: number) => Promise<{ data: unknown[] | null; error: { message: string } | null }>
          }
        }
      }
    }
  )
    .select('id')
    .eq('dedup_key', dedupKey)
    .gte('created_at', cutoff)
    .limit(1);

  if (error) {
    console.error('Error checking email dedup:', error.message);
    return false;
  }

  return (data && data.length > 0) || false;
}

export async function logEmail(
  params: SendEmailParams,
  status: 'sent' | 'failed' | 'duplicate',
  messageId?: string,
  error?: string
): Promise<void> {
  const supabase = createServiceRoleClient();

  const dedupKey = `${params.to}:${params.subject}:${new Date().toISOString().slice(0, 13)}`;

  const { error: insertError } = await (
    supabase.from('email_logs') as unknown as {
      insert: (values: Record<string, unknown>) => Promise<{ error: { message: string } | null }>
    }
  ).insert({
    to_email: params.to,
    subject: params.subject,
    status,
    message_id: messageId || null,
    error: error || null,
    dedup_key: dedupKey,
  });

  if (insertError) {
    console.error('Failed to log email:', insertError.message);
  }
}
