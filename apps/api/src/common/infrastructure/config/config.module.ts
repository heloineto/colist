import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigService } from '@/common/infrastructure/config/config.service';
import { ConfigSchema } from '@/common/infrastructure/config/config.type';
import { getEnvFilePath } from '@/common/infrastructure/utils/get-env-file-path.util';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      envFilePath: getEnvFilePath(),
      validate: (env) => ConfigSchema.parse(env),
      isGlobal: true,
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
