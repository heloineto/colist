import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from 'nestjs-pino';
import { AppModule } from '@/app.module';
import { ConfigService } from '@/common/infrastructure/config/config.service';
import { DocsSetup } from '@/core/presentation/http/docs.setup';
import { mountBetterAuth } from '@/iam/infrastructure/better-auth/mount-better-auth';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule.register(),
    {
      bufferLogs: true,
      bodyParser: false,
    }
  );

  app.useLogger(app.get(Logger));
  app.set('trust proxy', 'loopback');
  app.setGlobalPrefix('api', { exclude: ['health'] });
  mountBetterAuth(app);
  app.useBodyParser('json');

  DocsSetup.setup(app);

  const configService = app.get(ConfigService);
  const webUrl =
    configService.get('WEB_URL') ?? configService.get('BETTER_AUTH_URL');

  app.enableCors({ origin: webUrl, credentials: true });

  await app.listen(configService.get('PORT'));
}

void bootstrap();
