import { type DynamicModule, Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerErrorInterceptor } from 'nestjs-pino';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { ActivityModule } from '@/activity/activity.module';
import type { AppBootstrapOptions } from '@/app-bootstrap-options.type';
import { CategoryModule } from '@/category/category.module';
import { HttpExceptionFilter } from '@/common/presentation/http/http-exception.filter';
import { CoreModule } from '@/core/core.module';
import { HealthModule } from '@/health/health.module';
import { IamModule } from '@/iam/iam.module';
import { ItemModule } from '@/item/item.module';
import { ListModule } from '@/list/list.module';
import { RealtimeModule } from '@/realtime/realtime.module';
import { ReportModule } from '@/report/report.module';
import { UploadModule } from '@/upload/upload.module';

const DEFAULT_THROTTLE = { limit: 10, ttl: 60_000 };

@Module({})
export class AppModule {
  static register(options: AppBootstrapOptions = {}): DynamicModule {
    return {
      module: AppModule,
      imports: [
        CoreModule,
        EventEmitterModule.forRoot(),
        ThrottlerModule.forRoot([options.throttle ?? DEFAULT_THROTTLE]),
        HealthModule,
        IamModule,
        ListModule,
        ActivityModule,
        CategoryModule,
        ItemModule,
        RealtimeModule,
        ReportModule,
        UploadModule,
      ],
      providers: [
        { provide: APP_PIPE, useClass: ZodValidationPipe },
        { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
        { provide: APP_INTERCEPTOR, useClass: LoggerErrorInterceptor },
        { provide: APP_FILTER, useClass: HttpExceptionFilter },
      ],
    };
  }
}
