import { StrapiWebhookController } from '@strapi/infrastructure/adapters';
import { StrapiWebhookService } from '@strapi/application/services';
import { StrapiWebhookPayloadDto } from '@strapi/application/dto';

describe('StrapiWebhookController', () => {
  let controller: StrapiWebhookController;
  let mockService: jest.Mocked<StrapiWebhookService>;

  const createMockService = (): jest.Mocked<StrapiWebhookService> =>
    ({
      invalidateCache: jest.fn(),
      getCacheTimestamp: jest.fn(),
    }) as unknown as jest.Mocked<StrapiWebhookService>;

  beforeEach(() => {
    mockService = createMockService();
    controller = new StrapiWebhookController(mockService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('invalidateCache', () => {
    const payload: StrapiWebhookPayloadDto = {
      event: 'entry.update',
      model: 'module',
    };

    const serviceResponse = {
      message: 'Cache invalidated successfully',
      timestamp: '2024-01-01T00:00:00.000Z',
      event: 'entry.update',
      model: 'module',
    };

    it('should call service.invalidateCache with payload', async () => {
      mockService.invalidateCache.mockResolvedValue(serviceResponse);

      await controller.invalidateCache(payload);

      expect(mockService.invalidateCache).toHaveBeenCalledWith(payload);
    });

    it('should return service response', async () => {
      mockService.invalidateCache.mockResolvedValue(serviceResponse);

      const result = await controller.invalidateCache(payload);

      expect(result).toEqual(serviceResponse);
    });

    it('should handle payload with entry data', async () => {
      const payloadWithEntry: StrapiWebhookPayloadDto = {
        event: 'entry.create',
        model: 'tabs-menu',
        entry: { id: 1, label: 'Dashboard' },
      };
      mockService.invalidateCache.mockResolvedValue({
        ...serviceResponse,
        event: 'entry.create',
        model: 'tabs-menu',
      });

      await controller.invalidateCache(payloadWithEntry);

      expect(mockService.invalidateCache).toHaveBeenCalledWith(
        payloadWithEntry,
      );
    });

    it('should propagate service errors', async () => {
      mockService.invalidateCache.mockRejectedValue(new Error('Cache error'));

      await expect(controller.invalidateCache(payload)).rejects.toThrow(
        'Cache error',
      );
    });

    it('should call service exactly once per request', async () => {
      mockService.invalidateCache.mockResolvedValue(serviceResponse);

      await controller.invalidateCache(payload);

      expect(mockService.invalidateCache).toHaveBeenCalledTimes(1);
    });
  });

  describe('getCacheTimestamp', () => {
    it('should return timestamp from service', async () => {
      const timestampResponse = { timestamp: '2024-01-01T00:00:00.000Z' };
      mockService.getCacheTimestamp.mockResolvedValue(timestampResponse);

      const result = await controller.getCacheTimestamp();

      expect(result).toEqual(timestampResponse);
    });

    it('should call service.getCacheTimestamp', async () => {
      mockService.getCacheTimestamp.mockResolvedValue({ timestamp: null });

      await controller.getCacheTimestamp();

      expect(mockService.getCacheTimestamp).toHaveBeenCalledTimes(1);
    });

    it('should return null timestamp when no cache invalidation has occurred', async () => {
      mockService.getCacheTimestamp.mockResolvedValue({ timestamp: null });

      const result = await controller.getCacheTimestamp();

      expect(result).toEqual({ timestamp: null });
    });

    it('should propagate service errors', async () => {
      mockService.getCacheTimestamp.mockRejectedValue(new Error('Cache error'));

      await expect(controller.getCacheTimestamp()).rejects.toThrow(
        'Cache error',
      );
    });
  });
});
