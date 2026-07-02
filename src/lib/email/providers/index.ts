import type { EmailProvider } from './types';
import { ResendProvider } from './resend';
import { ConsoleProvider } from './console';

let cachedProvider: EmailProvider | null = null;

export function getProvider(): EmailProvider {
  if (cachedProvider) {
    return cachedProvider;
  }

  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey) {
    cachedProvider = new ResendProvider(resendApiKey);
  } else {
    console.warn(
      'RESEND_API_KEY not set. Using console email provider for development.'
    );
    cachedProvider = new ConsoleProvider();
  }

  return cachedProvider;
}

export type { EmailProvider, SendEmailParams } from './types';
