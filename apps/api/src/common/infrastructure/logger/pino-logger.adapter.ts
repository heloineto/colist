import { Inject, Injectable, Scope } from '@nestjs/common';
import { INQUIRER } from '@nestjs/core';
import { PinoLogger } from 'nestjs-pino';
import type {
  ErrorLogPayload,
  LogPayload,
} from '@/common/application/ports/logger.port';
import { Logger } from '@/common/application/ports/logger.port';

const FALLBACK_CONTEXT = 'App';

export function resolveContext(inquirer?: object): string {
  if (!inquirer) return FALLBACK_CONTEXT;

  const name = (inquirer as { constructor?: { name?: string } }).constructor
    ?.name;

  return name ?? FALLBACK_CONTEXT;
}

@Injectable({ scope: Scope.TRANSIENT })
export class PinoLoggerAdapter extends Logger {
  constructor(
    private readonly pino: PinoLogger,
    @Inject(INQUIRER) inquirer?: object
  ) {
    super();
    this.pino.setContext(resolveContext(inquirer));
  }

  debug({ message, data }: LogPayload): void {
    this.pino.debug({ data }, message);
  }

  info({ message, data }: LogPayload): void {
    this.pino.info({ data }, message);
  }

  warn({ message, data }: LogPayload): void {
    this.pino.warn({ data }, message);
  }

  error({ message, error, data }: ErrorLogPayload): void {
    this.pino.error({ error, data }, message);
  }
}
