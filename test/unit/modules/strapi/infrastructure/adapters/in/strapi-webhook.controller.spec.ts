import { StrapiWebhookController } from '@strapi/infrastructure/adapters';
import { StrapiWebhookService } from '@strapi/application/services';

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
    const serviceResponse = {
      message: 'Cache invalidated successfully',
      timestamp: '2024-01-01T00:00:00.000Z',
    };

    it('should call service.invalidateCache', async () => {
      mockService.invalidateCache.mockResolvedValue(serviceResponse);

      await controller.invalidateCache();

      expect(mockService.invalidateCache).toHaveBeenCalled();
    });

    it('should return service response', async () => {
      mockService.invalidateCache.mockResolvedValue(serviceResponse);

      const result = await controller.invalidateCache();

      expect(result).toEqual(serviceResponse);
    });

    it('should propagate service errors', async () => {
      mockService.invalidateCache.mockRejectedValue(new Error('Cache error'));

      await expect(controller.invalidateCache()).rejects.toThrow('Cache error');
    });

    it('should call service exactly once per request', async () => {
      mockService.invalidateCache.mockResolvedValue(serviceResponse);

      await controller.invalidateCache();

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
