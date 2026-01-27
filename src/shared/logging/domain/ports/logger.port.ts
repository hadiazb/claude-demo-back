export interface LogMetadata {
  [key: string]: unknown;
}

export interface LoggerPort {
  setContext(context: string): LoggerPort;
  error(message: string, trace?: string, metadata?: LogMetadata): void;
  warn(message: string, trace?: string, metadata?: LogMetadata): void;
  info(message: string, trace?: string, metadata?: LogMetadata): void;
  http(message: string, trace?: string, metadata?: LogMetadata): void;
  debug(message: string, trace?: string, metadata?: LogMetadata): void;
  verbose(message: string, trace?: string, metadata?: LogMetadata): void;
}
