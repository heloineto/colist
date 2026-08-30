import { describe, expect, it } from 'vitest';
import { createCrashGuard } from '@/shared/lib/crash-report';

describe('crash guard', () => {
  it('dedups identical signatures and caps the budget', () => {
    const shouldReport = createCrashGuard(3);
    expect(shouldReport('a')).toBe(true);
    expect(shouldReport('a')).toBe(false);
    expect(shouldReport('b')).toBe(true);
    expect(shouldReport('c')).toBe(true);
    expect(shouldReport('d')).toBe(false);
    expect(shouldReport('a')).toBe(false);
  });
});
