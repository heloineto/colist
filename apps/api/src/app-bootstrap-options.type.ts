export type AppBootstrapOptions = {
  /** Override the `/errors` rate limit (tests only). */
  throttle?: { limit: number; ttl: number };
};
