import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from 'nestjs-pino';
import { AppModule } from '@/app.module';
import { ConfigService } from '@/common/infrastructure/config/config.service';
import { setupApp } from '@/app.setup';
import { setupDocs } from '@/core/presentation/http/docs.setup';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    bodyParser: false,
  });

  app.useLogger(app.get(Logger));
  app.set('trust proxy', 'loopback');
  setupApp(app);
  setupDocs(app);

  const configService = app.get(ConfigService);
  const webUrl =
    configService.get('WEB_URL') ?? configService.get('BETTER_AUTH_URL');

  app.enableCors({ origin: webUrl, credentials: true });

  await app.listen(configService.get('PORT'));
}

void bootstrap();
