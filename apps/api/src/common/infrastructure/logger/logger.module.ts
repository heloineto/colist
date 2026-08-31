import { Global, Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { Logger } from '@/common/application/ports/logger.port';
import { ConfigService } from '@/common/infrastructure/config/config.service';
import { PinoLoggerAdapter } from '@/common/infrastructure/logger/pino-logger.adapter';
import { createPinoHttpOptions } from '@/common/infrastructure/logger/pino-http-options';

@Global()
@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return createPinoHttpOptions(configService);
      },
    }),
  ],
  providers: [{ provide: Logger, useClass: PinoLoggerAdapter }],
  exports: [Logger],
})
export class LoggerModule {}
