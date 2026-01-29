/**
 * HTTP request configuration options.
 */
export interface HttpRequestConfig {
  /** Request headers */
  headers?: Record<string, string>;
  /** Query parameters */
  params?: Record<string, string | number | boolean>;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Number of retry attempts on failure */
  retries?: number;
  /** Base URL to prepend to the path */
  baseUrl?: string;
}

/**
 * HTTP response wrapper.
 */
export interface HttpResponse<T = unknown> {
  /** Response data */
  data: T;
  /** HTTP status code */
  status: number;
  /** HTTP status text */
  statusText: string;
  /** Response headers */
  headers: Record<string, string>;
}

/**
 * HTTP error class with additional context.
 * Extends Error to be throwable while carrying HTTP-specific details.
 */
export class HttpClientError extends Error {
  /** HTTP status code (if available) */
  readonly status?: number;
  /** Response data (if available) */
  readonly data?: unknown;

  constructor(message: string, status?: number, data?: unknown, cause?: Error) {
    super(message);
    this.name = 'HttpClientError';
    this.status = status;
    this.data = data;
    this.cause = cause;
  }
}

/**
 * Port interface for HTTP client operations.
 * Follows the hexagonal architecture pattern for external HTTP communications.
 * Implementations should handle retry logic, timeouts, and request ID propagation.
 */
export interface HttpClientPort {
  /**
   * Performs an HTTP GET request.
   * @param url - The URL or path to request
   * @param config - Optional request configuration
   * @returns Promise resolving to the response data
   */
  get<T = unknown>(
    url: string,
    config?: HttpRequestConfig,
  ): Promise<HttpResponse<T>>;

  /**
   * Performs an HTTP POST request.
   * @param url - The URL or path to request
   * @param data - Request body data
   * @param config - Optional request configuration
   * @returns Promise resolving to the response data
   */
  post<T = unknown>(
    url: string,
    data?: unknown,
    config?: HttpRequestConfig,
  ): Promise<HttpResponse<T>>;

  /**
   * Performs an HTTP PUT request.
   * @param url - The URL or path to request
   * @param data - Request body data
   * @param config - Optional request configuration
   * @returns Promise resolving to the response data
   */
  put<T = unknown>(
    url: string,
    data?: unknown,
    config?: HttpRequestConfig,
  ): Promise<HttpResponse<T>>;

  /**
   * Performs an HTTP PATCH request.
   * @param url - The URL or path to request
   * @param data - Request body data
   * @param config - Optional request configuration
   * @returns Promise resolving to the response data
   */
  patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: HttpRequestConfig,
  ): Promise<HttpResponse<T>>;

  /**
   * Performs an HTTP DELETE request.
   * @param url - The URL or path to request
   * @param config - Optional request configuration
   * @returns Promise resolving to the response data
   */
  delete<T = unknown>(
    url: string,
    config?: HttpRequestConfig,
  ): Promise<HttpResponse<T>>;
}
