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

@Injectable()
export class WebhookSecretGuard implements CanActivate {
  private readonly logger: LoggerPort;

  constructor(
    private readonly configService: ConfigService,
    @Inject(INJECTION_TOKENS.LOGGER)
    logger: LoggerPort,
  ) {
    this.logger = logger.setContext(WebhookSecretGuard.name);
  }

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
