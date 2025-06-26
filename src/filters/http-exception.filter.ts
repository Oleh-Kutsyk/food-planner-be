import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MyLoggerService } from '../logger/logger.service';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly loggerService: MyLoggerService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const expResponse = exception.getResponse();

    const messages = ((expResponse as any)?.message || [expResponse] || [
        exception.message,
      ]) as unknown as string[];

    const stack = ((exception as any)?.stack ||
      'No stack trace available') as unknown as string;

    this.loggerService.error(String(messages), {
      statusCode: status,
      path: request.url,
      stack,
    });

    response.status(status).json({
      statusCode: status,
      messages,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
