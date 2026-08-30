import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { AppModule } from '@/app.module';
import { ConfigService } from '@/common/infrastructure/config/config.service';
import { DocsSetup } from '@/core/presentation/http/docs.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));

  DocsSetup.setup(app);

  const configService = app.get(ConfigService);

  app.enableCors({ origin: configService.get('WEB_URL'), credentials: true });

  await app.listen(configService.get('PORT'));
}

void bootstrap();
