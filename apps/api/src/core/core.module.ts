import { Module } from '@nestjs/common';
import { ConfigModule } from '@/common/infrastructure/config/config.module';
import { LoggerModule } from '@/common/infrastructure/logger/logger.module';
import { DrizzleModule } from '@/common/infrastructure/persistence/drizzle/drizzle.module';

@Module({
  imports: [ConfigModule, LoggerModule, DrizzleModule],
})
export class CoreModule {}
