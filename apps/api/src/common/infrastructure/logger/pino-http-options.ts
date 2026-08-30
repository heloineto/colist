import { randomUUID } from 'node:crypto';
import type { Params } from 'nestjs-pino';
import type { Options } from 'pino-http';
import type { ConfigService } from '@/common/infrastructure/config/config.service';

const REDACT_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["set-cookie"]',
  '*.password',
  '*.token',
];

function buildTransport(mode: string): Options['transport'] | undefined {
  if (mode === 'production') return undefined;

  return {
    target: 'pino-pretty',
    options: {
      colorize: mode === 'development',
      ignore: 'pid,hostname',
      translateTime: 'SYS:HH:MM:ss.l',
      sync: mode === 'test',
    },
  };
}

export function createPinoHttpOptions(configService: ConfigService): Params {
  const mode = configService.get('MODE');
  const level = configService.get('LOG_LEVEL');
  const transport = buildTransport(mode);

  return {
    pinoHttp: {
      level,
      transport,
      messageKey: 'message',
      errorKey: 'error',
      base: undefined,
      redact: { paths: REDACT_PATHS, censor: '[REDACTED]' },
      genReqId: (request) => {
        const header = request.headers['x-request-id'];
        const upstream = Array.isArray(header) ? header[0] : header;
        return upstream ?? randomUUID();
      },
      autoLogging:
        mode === 'test'
          ? false
          : { ignore: (request) => request.url === '/health' },
    },
  };
}
