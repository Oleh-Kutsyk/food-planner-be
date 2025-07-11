import { Injectable, ConsoleLogger } from '@nestjs/common';
import * as winston from 'winston';
import * as WinstonCloudWatch from 'winston-cloudwatch';

enum LogLevel {
  Error = 'error', // Error events are likely to cause problems
  Warn = 'warning', // Warning events might cause problems in the future and deserve eyes
  Info = 'info', // Routine information, such as ongoing status or performance
  Debug = 'debug', // Debug or trace information
}

type LogData = [...any, string?];

@Injectable()
export class MyLoggerService extends ConsoleLogger {
  private logger: winston.Logger;

  constructor() {
    super();
    // Create winston logger
    this.logger = winston.createLogger(this.getLoggerFormatOptions());
  }

  private getLoggerFormatOptions(): winston.LoggerOptions {
    // Setting log levels for winston
    const levels: winston.LoggerOptions['levels'] = {};
    let cont = 0;
    Object.values(LogLevel).forEach((level) => {
      levels[level] = cont;
      cont++;
    });

    return {
      level: LogLevel.Debug,
      levels: levels,
      format: winston.format.combine(
        // Add timestamp and format the date
        winston.format.timestamp({
          format: 'DD/MM/YYYY, HH:mm:ss',
        }),
        // Errors will be logged with stack trace
        winston.format.errors({ stack: true }),
        // Add custom fields to the data property
        winston.format.metadata({
          key: 'data',
          fillExcept: ['timestamp', 'level', 'message'],
        }),
        // Format the log as JSON
        winston.format.json(),
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.Http(),
        new WinstonCloudWatch({
          logGroupName: `food-planner-${process.env.NODE_ENV || 'dev'}-logs`,
          logStreamName: () => new Date().toISOString().split('T')[0],
          awsRegion: process.env.AWS_REGION,
          jsonMessage: true,
        }),
      ],
      exceptionHandlers: [
        new WinstonCloudWatch({
          logGroupName: `food-planner-${process.env.NODE_ENV}-exceptions`,
          logStreamName: `exceptions-${new Date().toISOString().split('T')[0]}`,
          awsRegion: process.env.AWS_REGION,
          jsonMessage: true,
        }),
      ],
      rejectionHandlers: [
        new WinstonCloudWatch({
          logGroupName: `food-planner-${process.env.NODE_ENV}-rejections`,
          logStreamName: `rejections-${new Date().toISOString().split('T')[0]}`,
          awsRegion: process.env.AWS_REGION,
          jsonMessage: true,
        }),
      ],
    };
  }

  private consoleLog(
    level: LogLevel,
    message: string | Error,
    context: string,
    data?: Record<string, any>,
  ) {
    const logData: winston.LogEntry = {
      level: level,
      message: message instanceof Error ? message.message : message,
      context,
      ...data,
    };
    this.logger.log(logData);
  }

  private getStackContext(): string {
    const stack = new Error().stack?.split('\n')[3] || '';
    return stack.trim();
  }

  log(message: string, ...optionalParams: LogData): void {
    super.log(`[Info] ${message} ${this.getStackContext()}`, optionalParams);
    this.consoleLog(
      LogLevel.Info,
      message,
      this.getStackContext(),
      optionalParams[0],
    );
  }

  error(message: string, ...optionalParams: LogData): void {
    super.error(`[Error] ${message} ${this.getStackContext()}`, optionalParams);
    this.consoleLog(
      LogLevel.Error,
      message,
      this.getStackContext(),
      optionalParams[0],
    );
  }
}
