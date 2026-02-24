import { LoggerPort } from '@shared/logging/domain/ports/logger.port';

export const createMockLoggerForE2e = (): LoggerPort => {
  const logger = {
    setContext: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    http: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  } as unknown as LoggerPort;
  (logger.setContext as jest.Mock).mockReturnValue(logger);
  return logger;
};
