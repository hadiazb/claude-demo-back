import { Controller, Get, Post, UseGuards } from '@nestjs/common';
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

/**
 * REST controller for Strapi webhook operations.
 * Provides endpoints for cache invalidation triggered by Strapi content changes
 * and cache timestamp retrieval for frontend synchronization.
 * @route /strapi/webhook
 */
@ApiTags('Strapi - Webhook')
@Controller('strapi/webhook')
export class StrapiWebhookController {
  /**
   * Creates a new StrapiWebhookController instance.
   * @param strapiWebhookService - The service for webhook operations
   */
  constructor(private readonly strapiWebhookService: StrapiWebhookService) {}

  /**
   * Invalidates all Strapi-related cache entries.
   * Authenticated via x-webhook-secret header instead of JWT.
   * Called by Strapi when content is modified.
   * @returns Promise resolving to a success message and timestamp
   * @throws UnauthorizedException if the webhook secret is invalid or missing
   */
  @Post('cache-invalidation')
  @UseGuards(WebhookSecretGuard)
  @ApiOperation({ summary: 'Invalidate Strapi cache via webhook' })
  @ApiHeader({
    name: 'x-webhook-secret',
    required: true,
    description: 'Webhook authentication secret',
  })
  @ApiResponse({ status: 201, description: 'Cache invalidated successfully' })
  @ApiResponse({
    status: 401,
    description: 'Invalid or missing webhook secret',
  })
  async invalidateCache() {
    return this.strapiWebhookService.invalidateCache();
  }

  /**
   * Retrieves the timestamp of the last cache invalidation.
   * Used by the frontend to determine if its local cache is stale.
   * @returns Promise resolving to an object containing the timestamp or null
   */
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
