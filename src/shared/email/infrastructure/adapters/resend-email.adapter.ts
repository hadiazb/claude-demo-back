import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import {
  EmailPort,
  SendEmailOptions,
  SendEmailResult,
} from '../../domain/ports/email.port';
import {
  getWelcomeEmailHtml,
  getWelcomeEmailText,
} from '../templates/welcome.template';
import { LoggerPort } from '@shared/logging';
import { INJECTION_TOKENS } from '@shared/constants';

/**
 * Resend implementation of the EmailPort interface.
 * Uses Resend API to send transactional emails.
 */
@Injectable()
export class ResendEmailAdapter implements EmailPort {
  private readonly resend: Resend;
  private readonly fromEmail: string;
  private readonly appName: string;
  private readonly logger: LoggerPort;

  constructor(
    private readonly configService: ConfigService,
    @Inject(INJECTION_TOKENS.LOGGER) logger: LoggerPort,
  ) {
    const apiKey = this.configService.get<string>('email.resendApiKey');

    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    this.resend = new Resend(apiKey);
    this.fromEmail = this.configService.get<string>(
      'email.fromEmail',
      'onboarding@resend.dev',
    );
    this.appName = this.configService.get<string>('app.appName', 'Claude Demo');
    this.logger = logger.setContext('ResendEmailAdapter');
  }

  /**
   * Sends an email using Resend API.
   */
  async send(options: SendEmailOptions): Promise<SendEmailResult> {
    try {
      this.logger.debug('Sending email', undefined, {
        to: options.to,
        subject: options.subject,
      });

      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      if (error) {
        this.logger.error('Failed to send email', error.message, {
          to: options.to,
          errorName: error.name,
        });

        return {
          success: false,
          error: error.message,
        };
      }

      this.logger.info('Email sent successfully', undefined, {
        to: options.to,
        messageId: data?.id,
      });

      return {
        success: true,
        messageId: data?.id,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error('Unexpected error sending email', errorMessage, {
        to: options.to,
      });

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Sends a welcome email to a newly registered user.
   */
  async sendWelcomeEmail(
    to: string,
    firstName: string,
  ): Promise<SendEmailResult> {
    const templateData = {
      firstName,
      appName: this.appName,
      loginUrl: this.configService.get<string>('email.loginUrl'),
    };

    return this.send({
      to,
      subject: `¡Bienvenido a ${this.appName}, ${firstName}!`,
      html: getWelcomeEmailHtml(templateData),
      text: getWelcomeEmailText(templateData),
    });
  }
}
