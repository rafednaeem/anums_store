import type { EmailProvider, SendEmailParams } from './types';

export class ConsoleProvider implements EmailProvider {
  async send(params: SendEmailParams): Promise<{ id: string; provider: string }> {
    const messageId = `console-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    console.log('='.repeat(60));
    console.log('EMAIL (Console Provider - Development Only)');
    console.log('='.repeat(60));
    console.log(`Message ID: ${messageId}`);
    console.log(`To: ${params.to}`);
    console.log(`Subject: ${params.subject}`);
    console.log('-'.repeat(60));
    console.log('HTML Content:');
    console.log(params.html);
    if (params.text) {
      console.log('-'.repeat(60));
      console.log('Text Content:');
      console.log(params.text);
    }
    console.log('='.repeat(60));

    return { id: messageId, provider: 'console' };
  }
}
