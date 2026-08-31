export type LogPayload = {
  message: string;
  data?: Record<string, unknown>;
};

export type ErrorLogPayload = {
  error: unknown;
} & LogPayload;

export abstract class Logger {
  abstract debug(payload: LogPayload): void;
  abstract info(payload: LogPayload): void;
  abstract warn(payload: LogPayload): void;
  abstract error(payload: ErrorLogPayload): void;
}
