export function getEnvFilePath(): string[] {
  switch (process.env.NODE_ENV) {
    case 'production':
      return ['.env.production.local', '.env.production', '.env'];
    case 'test':
      return ['.env.test.local', '.env.test', '.env'];
    default:
      return ['.env.development.local', '.env.development', '.env'];
  }
}
