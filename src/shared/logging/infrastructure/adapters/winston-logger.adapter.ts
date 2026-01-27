import { Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { LEVEL, MESSAGE } from 'triple-beam';
import { LoggerPort, LogMetadata } from '../../domain/ports';
import { AsyncContextService } from '../context';
import { sanitize } from '../sanitizers';

const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
    verbose: 5,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
    verbose: 'cyan',
  },
};

winston.addColors(customLevels.colors);

@Injectable()
export class WinstonLoggerAdapter implements LoggerPort, LoggerService {
  private logger: winston.Logger;
  private context?: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly asyncContext: AsyncContextService,
  ) {
    this.logger = this.createLogger();
  }

  private createLogger(): winston.Logger {
    const level = this.configService.get<string>('logger.level', 'debug');
    const format = this.configService.get<string>('logger.format', 'pretty');
    const toFile = this.configService.get<boolean>('logger.toFile', false);
    const directory = this.configService.get<string>(
      'logger.directory',
      'logs',
    );
    const appName = this.configService.get<string>(
      'logger.appName',
      'claude-demo',
    );

    const transports: winston.transport[] = [
      new winston.transports.Console({
        format:
          format === 'json'
            ? this.createJsonFormat(appName)
            : this.createPrettyFormat(),
      }),
    ];

    if (toFile) {
      transports.push(
        new DailyRotateFile({
          dirname: directory,
          filename: `${appName}-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
          format: this.createJsonFormat(appName),
        }),
        new DailyRotateFile({
          dirname: directory,
          filename: `${appName}-error-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '30d',
          level: 'error',
          format: this.createJsonFormat(appName),
        }),
      );
    }

    return winston.createLogger({
      levels: customLevels.levels,
      level,
      transports,
    });
  }

  private createJsonFormat(appName: string): winston.Logform.Format {
    return winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format((info) => {
        info.app = appName;
        info.requestId = this.asyncContext.getRequestId();
        return info;
      })(),
      winston.format.json(),
    );
  }

  private createPrettyFormat(): winston.Logform.Format {
    return winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.colorize({ all: false }),
      winston.format.printf((info) => {
        const requestId = this.asyncContext.getRequestId();
        const contextStr = this.context ? `[${this.context}]` : '';
        const requestIdStr = requestId ? `[${requestId}]` : '';
        const level = info[LEVEL] || info.level;
        const message = String(info[MESSAGE] || info.message);
        const timestamp = String(info.timestamp);

        const coloredLevel = winston.format.colorize().colorize(level, level);
        let logMessage = `${timestamp} [${coloredLevel}] ${contextStr} ${requestIdStr} ${message}`;

        const stack = info.stack as string | undefined;
        if (stack) {
          logMessage += `\n${stack}`;
        }

        const excludeKeys = new Set([
          'timestamp',
          'level',
          'message',
          'stack',
          LEVEL,
          MESSAGE,
        ]);

        const metadata = Object.fromEntries(
          Object.entries(info).filter(([key]) => !excludeKeys.has(key)),
        );

        if (Object.keys(metadata).length > 0) {
          logMessage += ` ${JSON.stringify(sanitize(metadata))}`;
        }

        return logMessage;
      }),
    );
  }

  setContext(context: string): LoggerPort {
    const newLogger = Object.create(this);
    newLogger.context = context;
    newLogger.logger = this.logger;
    newLogger.asyncContext = this.asyncContext;
    newLogger.configService = this.configService;
    return newLogger;
  }

  private logWithLevel(
    level: string,
    message: string,
    trace?: string,
    metadata?: LogMetadata,
  ): void {
    const sanitizedMetadata = metadata ? sanitize(metadata) : undefined;

    this.logger.log({
      level,
      message,
      context: this.context,
      ...(trace && { stack: trace }),
      ...(sanitizedMetadata as object),
    });
  }

  error(message: string, trace?: string, metadata?: LogMetadata): void {
    this.logWithLevel('error', message, trace, metadata);
  }

  warn(message: string, trace?: string, metadata?: LogMetadata): void {
    this.logWithLevel('warn', message, trace, metadata);
  }

  info(message: string, trace?: string, metadata?: LogMetadata): void {
    this.logWithLevel('info', message, trace, metadata);
  }

  http(message: string, trace?: string, metadata?: LogMetadata): void {
    this.logWithLevel('http', message, trace, metadata);
  }

  debug(message: string, trace?: string, metadata?: LogMetadata): void {
    this.logWithLevel('debug', message, trace, metadata);
  }

  verbose(message: string, trace?: string, metadata?: LogMetadata): void {
    this.logWithLevel('verbose', message, trace, metadata);
  }

  log(message: string, context?: string): void {
    this.logger.info(message, { context: context || this.context });
  }
}
