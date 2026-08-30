import type { INestApplication } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import type { App } from 'supertest/types';
import type { AppBootstrapOptions } from '@/app-bootstrap-options.type';
import { AppModule } from '@/app.module';
import { mountBetterAuth } from '@/iam/infrastructure/better-auth/mount-better-auth';

export async function createTestApp(
  options: AppBootstrapOptions = {}
): Promise<INestApplication<App>> {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule.register(options)],
  }).compile();

  const app = moduleFixture.createNestApplication<NestExpressApplication>({
    bodyParser: false,
  });
  app.setGlobalPrefix('api', { exclude: ['health'] });
  mountBetterAuth(app);
  app.useBodyParser('json');
  await app.init();

  return app;
}
