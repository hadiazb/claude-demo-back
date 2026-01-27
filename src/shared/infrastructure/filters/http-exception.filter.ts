import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorResponse, ApiFieldError } from '@shared/interfaces';
import { INJECTION_TOKENS } from '@shared/constants';
import { LoggerPort } from '@shared/logging';

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
