/**
 * Email sending options interface.
 */
export interface SendEmailOptions {
  /** Recipient email address */
  to: string;
  /** Email subject line */
  subject: string;
  /** HTML content of the email */
  html: string;
  /** Optional plain text version */
  text?: string;
}

/**
 * Result of sending an email.
 */
export interface SendEmailResult {
  /** Whether the email was sent successfully */
  success: boolean;
  /** Email ID from the provider (if successful) */
  messageId?: string;
  /** Error message (if failed) */
  error?: string;
}

/**
 * Port interface for email sending operations.
 * Implementations can use different providers (Resend, SendGrid, etc.)
 */
export interface EmailPort {
  /**
   * Sends an email using the configured provider.
   * @param options - Email options (to, subject, html, text)
   * @returns Promise with the result of the operation
   */
  send(options: SendEmailOptions): Promise<SendEmailResult>;

  /**
   * Sends a welcome email to a newly registered user.
   * @param to - Recipient email address
   * @param firstName - User's first name for personalization
   * @returns Promise with the result of the operation
   */
  sendWelcomeEmail(to: string, firstName: string): Promise<SendEmailResult>;
}
