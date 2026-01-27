import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { AsyncContextService } from '../context';

export const REQUEST_ID_HEADER = 'x-request-id';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  constructor(private readonly asyncContext: AsyncContextService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const requestId =
      (req.headers[REQUEST_ID_HEADER] as string) || randomUUID();
    const startTime = Date.now();

    res.setHeader(REQUEST_ID_HEADER, requestId);

    this.asyncContext.run({ requestId, startTime }, () => {
      next();
    });
  }
}
