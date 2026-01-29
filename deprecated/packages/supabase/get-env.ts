export function getEnv(env: string | undefined): string {
  if (!env) {
    throw new Error(`A required env variable is not set`);
  }
  return env;
}
