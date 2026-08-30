import { errorsCreate } from '@/shared/api/generated/reports/reports';

/** Dedup by signature + hard cap per page load (ticket 16 storm guard). */
export function createCrashGuard(limit: number) {
  const seen = new Set<string>();
  return (signature: string) => {
    if (seen.has(signature) || seen.size >= limit) return false;
    seen.add(signature);
    return true;
  };
}

const shouldReport = createCrashGuard(10);

export function reportCrash(cause: unknown) {
  if (!navigator.onLine) return; // offline crashes are dropped (ticket 16)
  const error = cause instanceof Error ? cause : new Error(String(cause));
  if (!shouldReport(`${error.name}|${error.message}|${error.stack ?? ''}`)) {
    return;
  }
  void errorsCreate({
    error: {
      name: error.name.slice(0, 200) || 'Error',
      message: error.message.slice(0, 5000) || 'Unknown error',
      stack: error.stack?.slice(0, 20_000),
      route: window.location.pathname.slice(0, 500),
      userAgent: navigator.userAgent.slice(0, 500),
      appVersion: import.meta.env.VITE_APP_VERSION ?? 'dev',
    },
  }).catch(() => undefined);
}

export function installCrashCapture() {
  window.addEventListener('error', (event) => {
    reportCrash(event.error ?? event.message);
  });
  window.addEventListener('unhandledrejection', (event) => {
    reportCrash(event.reason);
  });
}
