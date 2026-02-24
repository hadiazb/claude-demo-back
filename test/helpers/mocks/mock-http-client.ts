import {
  HttpClientPort,
  HttpResponse,
} from '@shared/http-client/domain/ports/http-client.port';

export const createMockHttpClient = (): HttpClientPort => ({
  get: jest.fn().mockResolvedValue(createEmptyResponse()),
  post: jest.fn().mockResolvedValue(createEmptyResponse()),
  put: jest.fn().mockResolvedValue(createEmptyResponse()),
  patch: jest.fn().mockResolvedValue(createEmptyResponse()),
  delete: jest.fn().mockResolvedValue(createEmptyResponse()),
});

function createEmptyResponse(): HttpResponse {
  return {
    data: { data: [] },
    status: 200,
    statusText: 'OK',
    headers: {},
  };
}

export function buildStrapiListResponse(items: unknown[]): HttpResponse {
  return {
    data: { data: items },
    status: 200,
    statusText: 'OK',
    headers: {},
  };
}

export function buildStrapiSingleResponse(item: unknown): HttpResponse {
  return {
    data: { data: item },
    status: 200,
    statusText: 'OK',
    headers: {},
  };
}
