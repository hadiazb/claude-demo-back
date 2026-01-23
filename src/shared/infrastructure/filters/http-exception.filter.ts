import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  ApiErrorResponse,
  ApiFieldError,
} from '../../interfaces/api-response.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: ApiFieldError[] | undefined;

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
          errors = responseObj.message.map((msg) => this.parseFieldError(msg));
        } else {
          message = responseObj.message || exception.message;
        }
      }
    }

    const errorResponse: ApiErrorResponse = {
      success: false,
      statusCode: status,
      message,
      ...(errors && { errors }),
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }

  private parseFieldError(message: string): ApiFieldError {
    const parts = message.split(' ');
    const field = parts[0] || 'unknown';
    return {
      field: field.toLowerCase(),
      message,
    };
  }
}
