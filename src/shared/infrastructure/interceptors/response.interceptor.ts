import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response } from 'express';
import { ApiResponse } from '@shared/interfaces';

/**
 * Global response interceptor that standardizes all HTTP responses.
 * Wraps the response data in a consistent ApiResponse structure containing
 * success status, status code, message, data, timestamp, and request path.
 *
 * @template T - The type of the response data being intercepted
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  /**
   * Intercepts outgoing responses and transforms them into a standardized format.
   *
   * @param context - The execution context containing request and response objects
   * @param next - The call handler to proceed with the request pipeline
   * @returns An Observable that emits the standardized ApiResponse
   */
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    return next.handle().pipe(
      map((data: T) => ({
        success: true,
        statusCode: response.statusCode,
        message: this.getSuccessMessage(request.method, response.statusCode),
        data,
        timestamp: new Date().toISOString(),
        path: request.url,
      })),
    );
  }

  /**
   * Generates an appropriate success message based on the HTTP method and status code.
   *
   * @param method - The HTTP method of the request (GET, POST, PATCH, PUT, DELETE)
   * @param statusCode - The HTTP status code of the response
   * @returns A human-readable success message describing the operation result
   */
  private getSuccessMessage(method: string, statusCode: number): string {
    if (statusCode === 201) {
      return 'Resource created successfully';
    }

    const messages: Record<string, string> = {
      GET: 'Data retrieved successfully',
      POST: 'Operation completed successfully',
      PATCH: 'Resource updated successfully',
      PUT: 'Resource updated successfully',
      DELETE: 'Resource deleted successfully',
    };

    return messages[method] || 'Operation completed successfully';
  }
}
