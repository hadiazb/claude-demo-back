import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import { AxiosHttpClientAdapter } from '@shared/http-client/infrastructure/adapters/axios-http-client.adapter';
import { AsyncContextService } from '@shared/logging/infrastructure/context/async-context.service';
import { INJECTION_TOKENS } from '@shared';
import { createMockLogger } from '../../../mocks/logger.mock';

jest.mock('axios');

describe('AxiosHttpClientAdapter (Integration)', () => {
  let adapter: AxiosHttpClientAdapter;
  let mockAxiosInstance: any;

  beforeEach(async () => {
    mockAxiosInstance = {
      request: jest.fn(),
    };

    (axios.create as jest.Mock).mockReturnValue(mockAxiosInstance);
    (axios.isAxiosError as unknown as jest.Mock) = jest
      .fn()
      .mockReturnValue(false);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AxiosHttpClientAdapter,
        {
          provide: AsyncContextService,
          useValue: {
            getRequestId: jest.fn().mockReturnValue('test-request-id'),
          },
        },
        {
          provide: INJECTION_TOKENS.LOGGER,
          useValue: createMockLogger(),
        },
      ],
    }).compile();

    adapter = module.get(AxiosHttpClientAdapter);
  });

  describe('GET request', () => {
    it('should make GET request with headers and query params', async () => {
      mockAxiosInstance.request.mockResolvedValue({
        data: { message: 'success' },
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
      });

      const result = await adapter.get('https://api.test/data', {
        headers: { Authorization: 'Bearer token' },
        params: { page: 1, limit: 10 },
      });

      expect(result.data).toEqual({ message: 'success' });
      expect(result.status).toBe(200);
      expect(result.statusText).toBe('OK');
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: 'https://api.test/data',
          params: { page: 1, limit: 10 },
        }),
      );

      const callHeaders = mockAxiosInstance.request.mock.calls[0][0].headers;
      expect(callHeaders.Authorization).toBe('Bearer token');
      expect(callHeaders['x-request-id']).toBe('test-request-id');
    });
  });

  describe('POST request', () => {
    it('should make POST request with body and Content-Type', async () => {
      mockAxiosInstance.request.mockResolvedValue({
        data: { id: 1 },
        status: 201,
        statusText: 'Created',
        headers: { 'content-type': 'application/json' },
      });

      const body = { name: 'Test', value: 42 };
      const result = await adapter.post('https://api.test/items', body);

      expect(result.data).toEqual({ id: 1 });
      expect(result.status).toBe(201);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: 'https://api.test/items',
          data: body,
        }),
      );

      const callHeaders = mockAxiosInstance.request.mock.calls[0][0].headers;
      expect(callHeaders['Content-Type']).toBe('application/json');
    });
  });

  describe('Retry on 5xx', () => {
    it('should retry on server errors and eventually succeed', async () => {
      const serverError = {
        message: 'Internal Server Error',
        response: { status: 500, data: 'Server error' },
        isAxiosError: true,
      };

      (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(true);

      mockAxiosInstance.request
        .mockRejectedValueOnce(serverError)
        .mockResolvedValueOnce({
          data: { recovered: true },
          status: 200,
          statusText: 'OK',
          headers: {},
        });

      const result = await adapter.get('https://api.test/flaky', {
        retries: 1,
      });

      expect(result.data).toEqual({ recovered: true });
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(2);
    });

    it('should throw after exhausting retries', async () => {
      const serverError = {
        message: 'Internal Server Error',
        response: { status: 500, data: 'Server error' },
        isAxiosError: true,
      };

      (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(true);
      mockAxiosInstance.request.mockRejectedValue(serverError);

      await expect(
        adapter.get('https://api.test/always-fails', { retries: 0 }),
      ).rejects.toThrow();
    });
  });

  describe('Error handling on 4xx', () => {
    it('should not retry on 4xx errors and throw HttpClientError', async () => {
      const clientError = {
        message: 'Not Found',
        response: { status: 404, data: { error: 'Not found' } },
        isAxiosError: true,
      };

      (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(true);
      mockAxiosInstance.request.mockRejectedValue(clientError);

      await expect(adapter.get('https://api.test/missing')).rejects.toThrow();

      // Should not retry - only 1 initial request + no retries for 4xx
      // With default retries=3, but 4xx should not trigger retry
      // The adapter makes 1 call then breaks (shouldRetry returns false for 4xx)
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(1);
    });
  });
});
