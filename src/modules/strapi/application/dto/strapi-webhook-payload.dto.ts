import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StrapiWebhookPayloadDto {
  @ApiProperty({
    description: 'Strapi lifecycle event (e.g. entry.create, entry.update)',
  })
  event: string;

  @ApiProperty({ description: 'Strapi content type model name' })
  model: string;

  @ApiPropertyOptional({ description: 'Strapi entry data' })
  entry?: any;
}
