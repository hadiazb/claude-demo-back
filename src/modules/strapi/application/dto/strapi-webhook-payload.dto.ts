import { Allow } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Data Transfer Object for incoming Strapi webhook payloads.
 * Captures the event metadata sent by Strapi when content changes occur.
 * Used by the webhook controller for cache invalidation triggers.
 */
export class StrapiWebhookPayloadDto {
  /** Name of the Strapi event that triggered the webhook */
  @Allow()
  @ApiPropertyOptional({ description: 'Strapi webhook event name' })
  event?: string;

  /** Content type model name associated with the event */
  @Allow()
  @ApiPropertyOptional({ description: 'Strapi content type model name' })
  model?: string;

  /** ISO timestamp of when the webhook event was created */
  @Allow()
  @ApiPropertyOptional({ description: 'Timestamp of the webhook event' })
  createdAt?: string;

  /** The Strapi entry data associated with the event */
  @Allow()
  @ApiPropertyOptional({ description: 'Strapi entry data' })
  entry?: unknown;

  /** Additional dynamic properties from the webhook payload */
  [key: string]: unknown;
}
