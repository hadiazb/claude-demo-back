import { Injectable, Inject } from '@nestjs/common';
import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import {
  HttpClientPort,
  HttpRequestConfig,
  HttpResponse,
  HttpClientError,
} from '../../domain/ports/http-client.port';
import { AsyncContextService } from '../../../logging/infrastructure/context/async-context.service';
import { LoggerPort } from '../../../logging/domain/ports/logger.port';
import { INJECTION_TOKENS } from '../../../constants/injection-tokens';

/**
 * Default configuration values for HTTP requests.
 */
const DEFAULT_CONFIG = {
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
};

/**
 * Supported HTTP methods for requests.
 */
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Axios-based implementation of the HttpClientPort.
 * Provides HTTP client functionality with retry logic, timeout handling,
 * request ID propagation, and integrated logging.
 */
@Injectable()
export class AxiosHttpClientAdapter implements HttpClientPort {
  private readonly client: AxiosInstance;
  private readonly logger: LoggerPort;

  constructor(
    private readonly asyncContext: AsyncContextService,
    @Inject(INJECTION_TOKENS.LOGGER) logger: LoggerPort,
  ) {
    this.logger = logger.setContext('HttpClient');
    this.client = axios.create({
      timeout: DEFAULT_CONFIG.timeout,
    });
  }

  /**
   * Performs an HTTP GET request.
   */
  async get<T = unknown>(
    url: string,
    config?: HttpRequestConfig,
  ): Promise<HttpResponse<T>> {
    return this.request<T>('GET', url, undefined, config);
  }

  /**
   * Performs an HTTP POST request.
   */
  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: HttpRequestConfig,
  ): Promise<HttpResponse<T>> {
    return this.request<T>('POST', url, data, config);
  }

  /**
   * Performs an HTTP PUT request.
   */
  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: HttpRequestConfig,
  ): Promise<HttpResponse<T>> {
    return this.request<T>('PUT', url, data, config);
  }

  /**
   * Performs an HTTP PATCH request.
   */
  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: HttpRequestConfig,
  ): Promise<HttpResponse<T>> {
    return this.request<T>('PATCH', url, data, config);
  }

  /**
   * Performs an HTTP DELETE request.
   */
  async delete<T = unknown>(
    url: string,
    config?: HttpRequestConfig,
  ): Promise<HttpResponse<T>> {
    return this.request<T>('DELETE', url, undefined, config);
  }

  /**
   * Internal method to perform HTTP requests with retry logic.
   */
  private async request<T>(
    method: HttpMethod,
    url: string,
    data?: unknown,
    config?: HttpRequestConfig,
  ): Promise<HttpResponse<T>> {
    const retries = config?.retries ?? DEFAULT_CONFIG.retries;
    const fullUrl = config?.baseUrl ? `${config.baseUrl}${url}` : url;

    const axiosConfig: AxiosRequestConfig = {
      method,
      url: fullUrl,
      data,
      headers: this.buildHeaders(config?.headers),
      params: config?.params,
      timeout: config?.timeout ?? DEFAULT_CONFIG.timeout,
    };

    let lastError: HttpClientError | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        if (attempt > 0) {
          this.logger.debug(`Retry attempt ${attempt}/${retries}`, undefined, {
            method,
            url: fullUrl,
          });
          await this.delay(DEFAULT_CONFIG.retryDelay * attempt);
        }

        this.logger.debug(`HTTP ${method} request`, undefined, {
          url: fullUrl,
          attempt: attempt + 1,
        });

        const response = await this.client.request<T>(axiosConfig);

        this.logger.debug(`HTTP ${method} response`, undefined, {
          url: fullUrl,
          status: response.status,
        });

        return {
          data: response.data,
          status: response.status,
          statusText: response.statusText,
          headers: this.normalizeHeaders(response.headers),
        };
      } catch (error) {
        lastError = this.handleError(error, method, fullUrl);

        if (!this.shouldRetry(error, attempt, retries)) {
          break;
        }
      }
    }

    const errorToThrow =
      lastError ??
      new HttpClientError(
        `HTTP ${method} request failed`,
        undefined,
        undefined,
      );

    this.logger.error(
      `HTTP ${method} request failed after ${retries + 1} attempts`,
      errorToThrow.stack,
      {
        url: fullUrl,
        status: errorToThrow.status,
        message: errorToThrow.message,
      },
    );

    throw errorToThrow;
  }

  /**
   * Builds request headers including request ID for tracing.
   */
  private buildHeaders(
    customHeaders?: Record<string, string>,
  ): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    const requestId = this.asyncContext.getRequestId();
    if (requestId) {
      headers['x-request-id'] = requestId;
    }

    return headers;
  }

  /**
   * Normalizes response headers to a simple record.
   */
  private normalizeHeaders(
    headers: Record<string, unknown>,
  ): Record<string, string> {
    const normalized: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers)) {
      if (typeof value === 'string') {
        normalized[key] = value;
      } else if (Array.isArray(value)) {
        normalized[key] = value.join(', ');
      }
    }
    return normalized;
  }

  /**
   * Handles and transforms Axios errors into HttpClientError.
   */
  private handleError(
    error: unknown,
    method: HttpMethod,
    url: string,
  ): HttpClientError {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const httpError = new HttpClientError(
        axiosError.message,
        axiosError.response?.status,
        axiosError.response?.data,
        axiosError,
      );

      this.logger.warn(`HTTP ${method} request failed`, undefined, {
        url,
        status: httpError.status,
        message: httpError.message,
      });

      return httpError;
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    const cause = error instanceof Error ? error : undefined;
    const genericError = new HttpClientError(
      message,
      undefined,
      undefined,
      cause,
    );

    this.logger.warn(`HTTP ${method} request failed`, undefined, {
      url,
      message: genericError.message,
    });

    return genericError;
  }

  /**
   * Determines if a request should be retried based on the error type.
   */
  private shouldRetry(
    error: unknown,
    attempt: number,
    maxRetries: number,
  ): boolean {
    if (attempt >= maxRetries) {
      return false;
    }

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      // Retry on network errors or 5xx server errors
      if (!axiosError.response) {
        return true;
      }

      const status = axiosError.response.status;
      return status >= 500 || status === 429;
    }

    return false;
  }

  /**
   * Creates a delay promise for retry backoff.
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
