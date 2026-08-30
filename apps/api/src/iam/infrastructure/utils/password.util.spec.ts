import { hash } from 'bcryptjs';
import { describe, expect, it } from 'vitest';
import {
  hashAnyPassword,
  verifyAnyPassword,
} from '@/iam/infrastructure/utils/password.util';

describe('verifyAnyPassword', () => {
  it('accepts Supabase-era bcrypt hashes', async () => {
    const bcryptHash = await hash('senha-antiga', 10);

    expect(
      await verifyAnyPassword({ hash: bcryptHash, password: 'senha-antiga' })
    ).toBe(true);
    expect(
      await verifyAnyPassword({ hash: bcryptHash, password: 'errada' })
    ).toBe(false);
  });

  it('accepts better-auth scrypt hashes', async () => {
    const scryptHash = await hashAnyPassword('senha-nova');

    expect(scryptHash.startsWith('$2')).toBe(false);
    expect(
      await verifyAnyPassword({ hash: scryptHash, password: 'senha-nova' })
    ).toBe(true);
    expect(
      await verifyAnyPassword({ hash: scryptHash, password: 'errada' })
    ).toBe(false);
  });
});
