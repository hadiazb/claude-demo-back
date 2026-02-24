import { EmailPort } from '@shared/email/domain/ports/email.port';

export const createMockEmail = (): EmailPort => ({
  send: jest
    .fn()
    .mockResolvedValue({ success: true, messageId: 'mock-email-id' }),
  sendWelcomeEmail: jest
    .fn()
    .mockResolvedValue({ success: true, messageId: 'mock-welcome-id' }),
});
