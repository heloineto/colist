import { Writable } from 'node:stream';
import { Test } from '@nestjs/testing';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { __resetOutOfContextForTests } from 'nestjs-pino/PinoLogger';
import { beforeEach, describe, expect, it } from 'vitest';
import { Logger } from '@/common/application/ports/logger.port';
import { PinoLoggerAdapter } from '@/common/infrastructure/logger/pino-logger.adapter';

async function createLogger() {
  const lines: Record<string, unknown>[] = [];
  const stream = new Writable({
    write(chunk: Buffer, _encoding, callback) {
      lines.push(JSON.parse(chunk.toString()) as Record<string, unknown>);
      callback();
    },
  });

  const module = await Test.createTestingModule({
    imports: [
      PinoLoggerModule.forRoot({
        pinoHttp: [
          { messageKey: 'message', errorKey: 'error', base: undefined },
          stream,
        ],
      }),
    ],
    providers: [{ provide: Logger, useClass: PinoLoggerAdapter }],
  }).compile();

  const logger = await module.resolve(Logger);
  return { logger, lines };
}

describe('LoggerModule (integration)', () => {
  beforeEach(() => {
    __resetOutOfContextForTests();
  });

  it('serializes info under message key without pid/hostname', async () => {
    const { logger, lines } = await createLogger();

    logger.info({ message: 'hello', data: { item: 1 } });

    expect(lines[0]).toEqual({
      level: 30,
      time: expect.any(Number) as unknown,
      context: expect.any(String) as unknown,
      message: 'hello',
      data: { item: 1 },
    });
  });

  it('omits undefined fields', async () => {
    const { logger, lines } = await createLogger();

    logger.info({ message: 'bare' });

    expect(lines[0]).not.toHaveProperty('data');
    expect(lines[0]).not.toHaveProperty('error');
  });

  it('serializes Error instance under error key', async () => {
    const { logger, lines } = await createLogger();

    logger.error({ message: 'failed', error: new Error('boom') });

    expect(lines[0]).toMatchObject({
      level: 50,
      message: 'failed',
      error: {
        type: 'Error',
        message: 'boom',
        stack: expect.any(String) as unknown,
      },
    });
  });
});
