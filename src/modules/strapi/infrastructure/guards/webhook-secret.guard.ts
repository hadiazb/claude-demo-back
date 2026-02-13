import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { LoggerPort } from '@shared/logging/domain/ports';
import { INJECTION_TOKENS } from '@shared/constants';

/**
 * Guard that validates the x-webhook-secret header for Strapi webhook endpoints.
 * Compares the incoming header value against the configured webhook secret
 * to authenticate requests from the Strapi CMS.
 */
@Injectable()
export class WebhookSecretGuard implements CanActivate {
  /** Logger instance scoped to the WebhookSecretGuard context */
  private readonly logger: LoggerPort;

  /**
   * Creates a new WebhookSecretGuard instance.
   * @param configService - The NestJS config service for reading the webhook secret
   * @param logger - The logger port for recording authentication events
   */
  constructor(
    private readonly configService: ConfigService,
    @Inject(INJECTION_TOKENS.LOGGER)
    logger: LoggerPort,
  ) {
    this.logger = logger.setContext(WebhookSecretGuard.name);
  }

  /**
   * Validates the webhook secret from the request header.
   * Extracts the x-webhook-secret header and compares it against the expected value.
   * @param context - The NestJS execution context containing the HTTP request
   * @returns True if the secret is valid
   * @throws UnauthorizedException if the secret is missing or invalid
   */
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const headerSecret = request.headers['x-webhook-secret'] as string;
    const expectedSecret = this.configService.get<string>(
      'strapi.webhookSecret',
    );

    if (!headerSecret || headerSecret !== expectedSecret) {
      this.logger.warn(
        'Webhook authentication failed: invalid or missing secret',
      );
      throw new UnauthorizedException('Invalid or missing webhook secret');
    }

    return true;
  }
}
