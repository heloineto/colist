import { resolve } from 'node:path';
import { Global, Inject, Module, type OnModuleInit } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Logger } from '@/common/application/ports/logger.port';
import { ConfigService } from '@/common/infrastructure/config/config.service';
import {
  DRIZZLE,
  type Drizzle,
} from '@/common/infrastructure/persistence/drizzle/drizzle.token';

const MIGRATIONS_FOLDER = resolve(process.cwd(), 'migrations');

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Drizzle =>
        drizzle(configService.get('DATABASE_URL')),
    },
  ],
  exports: [DRIZZLE],
})
export class DrizzleModule implements OnModuleInit {
  constructor(
    @Inject(DRIZZLE) private readonly db: Drizzle,
    private readonly logger: Logger
  ) {}

  async onModuleInit(): Promise<void> {
    await migrate(this.db, { migrationsFolder: MIGRATIONS_FOLDER });
    this.logger.info({ message: 'Migrations applied' });
  }
}
