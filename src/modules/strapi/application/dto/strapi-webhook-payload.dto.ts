import { Allow } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class StrapiWebhookPayloadDto {
  @Allow()
  @ApiPropertyOptional({ description: 'Strapi webhook event name' })
  event?: string;

  @Allow()
  @ApiPropertyOptional({ description: 'Strapi content type model name' })
  model?: string;

  @Allow()
  @ApiPropertyOptional({ description: 'Timestamp of the webhook event' })
  createdAt?: string;

  @Allow()
  @ApiPropertyOptional({ description: 'Strapi entry data' })
  entry?: unknown;

  [key: string]: unknown;
}
