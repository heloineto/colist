import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import type { Config } from '@/common/infrastructure/config/config.type';

@Injectable()
export class ConfigService {
  constructor(
    private readonly nestConfigService: NestConfigService<Config, true>
  ) {}

  get<T extends keyof Config>(key: T) {
    return this.nestConfigService.get(key, { infer: true });
  }
}
