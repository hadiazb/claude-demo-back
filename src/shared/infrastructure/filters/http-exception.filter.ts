import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { ApiErrorResponse, ApiFieldError } from '@shared/interfaces';
import { INJECTION_TOKENS } from '@shared/constants';
import { LoggerPort } from '@shared/logging';

/**
 * Rate limit configuration per endpoint type.
 * Maps endpoint patterns to their TTL in seconds for retry messages.
 */
const THROTTLE_CONFIG: Record<string, { ttl: number; message: string }> = {
  '/auth/login': {
    ttl: 300,
    message: 'Demasiados intentos de login. Intenta de nuevo en 5 minutos.',
  },
  '/auth/register': {
    ttl: 600,
    message: 'Demasiados intentos de registro. Intenta de nuevo en 10 minutos.',
  },
  '/auth/refresh': {
    ttl: 60,
    message:
      'Demasiadas solicitudes de refresh token. Intenta de nuevo en 1 minuto.',
  },
  default: {
    ttl: 60,
    message: 'Demasiadas solicitudes. Intenta de nuevo en 1 minuto.',
  },
};

/**
 * Global exception filter that catches all exceptions thrown in the application.
 * Transforms exceptions into a standardized API error response format.
 *
 * @implements {ExceptionFilter}
 */
@Injectable()
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger: LoggerPort;

  constructor(@Inject(INJECTION_TOKENS.LOGGER) logger: LoggerPort) {
    this.logger = logger.setContext('HttpExceptionFilter');
  }

  /**
   * Catches and processes exceptions, converting them into standardized API error responses.
   *
   * @param {unknown} exception - The exception that was thrown
   * @param {ArgumentsHost} host - The arguments host providing access to the request/response context
   * @returns {void} Sends a JSON error response to the client
   */
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: ApiFieldError[] | undefined;
    let stack: string | undefined;
    let retryAfter: number | undefined;

    if (exception instanceof ThrottlerException) {
      return this.handleThrottlerException(exception, request, response);
    }

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else {
        const responseObj = exceptionResponse as {
          message: string | string[];
          error?: string;
        };

        if (Array.isArray(responseObj.message)) {
          message = responseObj.error || 'Validation failed';
          errors = responseObj.message.map(
            (msg: string): ApiFieldError => this.parseFieldError(msg),
          );
        } else {
          message = responseObj.message || exception.message;
        }
      }

      stack = exception.stack;
    } else if (exception instanceof Error) {
      message = exception.message;
      stack = exception.stack;
    }

    const errorResponse: ApiErrorResponse = {
      success: false,
      statusCode: status,
      message,
      ...(errors && { errors }),
      ...(retryAfter && { retryAfter }),
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    const logMetadata = {
      statusCode: status,
      method: request.method,
      url: request.url,
      body: request.body,
    };

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(message, stack, logMetadata);
    } else {
      this.logger.warn(message, stack, logMetadata);
    }

    response.status(status).json(errorResponse);
  }

  /**
   * Handles ThrottlerException with custom messages based on the endpoint.
   *
   * @param exception - The ThrottlerException that was thrown
   * @param request - The incoming request
   * @param response - The outgoing response
   */
  private handleThrottlerException(
    exception: ThrottlerException,
    request: Request,
    response: Response,
  ): void {
    const endpoint = this.getThrottleEndpoint(request.url);
    const config = THROTTLE_CONFIG[endpoint] || THROTTLE_CONFIG['default'];

    const errorResponse: ApiErrorResponse = {
      success: false,
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      message: config.message,
      retryAfter: config.ttl,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    this.logger.warn(config.message, exception.stack, {
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      method: request.method,
      url: request.url,
      retryAfter: config.ttl,
    });

    response
      .status(HttpStatus.TOO_MANY_REQUESTS)
      .setHeader('Retry-After', config.ttl.toString())
      .json(errorResponse);
  }

  /**
   * Extracts the base endpoint path for throttle configuration matching.
   *
   * @param url - The full request URL
   * @returns The base endpoint path without query parameters and API prefix
   */
  private getThrottleEndpoint(url: string): string {
    const pathWithoutQuery = url.split('?')[0];
    const pathWithoutPrefix = pathWithoutQuery.replace(/^\/api\/v\d+/, '');
    return pathWithoutPrefix;
  }

  /**
   * Parses an error message string to extract field information.
   * Assumes the first word of the message is the field name.
   *
   * @param message - The error message string to parse
   * @returns An ApiFieldError object containing the field name and error message
   */
  private parseFieldError(message: string): ApiFieldError {
    const parts = message.split(' ');
    const field = parts[0] || 'unknown';
    return {
      field: field.toLowerCase(),
      message,
    };
  }
}
