import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@auth/infrastructure/guards';
import { StrapiWebhookService } from '@strapi/application/services';
import { WebhookSecretGuard } from '@strapi/infrastructure/guards/webhook-secret.guard';

@ApiTags('Strapi - Webhook')
@Controller('strapi/webhook')
export class StrapiWebhookController {
  constructor(private readonly strapiWebhookService: StrapiWebhookService) {}

  @Get('cache-invalidation')
  @UseGuards(WebhookSecretGuard)
  @ApiOperation({ summary: 'Invalidate Strapi cache via webhook' })
  @ApiHeader({
    name: 'x-webhook-secret',
    required: true,
    description: 'Webhook authentication secret',
  })
  @ApiResponse({ status: 200, description: 'Cache invalidated successfully' })
  @ApiResponse({
    status: 401,
    description: 'Invalid or missing webhook secret',
  })
  async invalidateCache() {
    return this.strapiWebhookService.invalidateCache();
  }

  @Get('cache-timestamp')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get last cache invalidation timestamp',
  })
  @ApiResponse({
    status: 200,
    description: 'Cache invalidation timestamp',
  })
  async getCacheTimestamp() {
    return this.strapiWebhookService.getCacheTimestamp();
  }
}
