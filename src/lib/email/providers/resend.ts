import type { EmailProvider, SendEmailParams } from './types';

export class ResendProvider implements EmailProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async send(params: SendEmailParams): Promise<{ id: string; provider: string }> {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'Anums Store <auth@avosira.com>',
        to: [params.to],
        subject: params.subject,
        html: params.html,
        text: params.text,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        `Resend API error: ${response.status} - ${errorData?.message || response.statusText}`
      );
    }

    const data = await response.json();
    return { id: data.id, provider: 'resend' };
  }
}
