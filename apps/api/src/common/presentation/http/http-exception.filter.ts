import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { ZodSerializationException } from 'nestjs-zod';
import { z } from 'zod';
import { Logger } from '@/common/application/ports/logger.port';

@Catch(HttpException)
export class HttpExceptionFilter extends BaseExceptionFilter {
  constructor(private readonly logger: Logger) {
    super();
  }

  catch(exception: HttpException, host: ArgumentsHost) {
    if (exception instanceof ZodSerializationException) {
      const zodError = exception.getZodError();

      if (zodError instanceof z.ZodError) {
        this.logger.error({
          message: 'ZodSerializationException',
          error: zodError,
        });
      }
    }

    super.catch(exception, host);
  }
}
