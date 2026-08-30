import { compare } from 'bcryptjs';
import { hashPassword, verifyPassword } from 'better-auth/crypto';

const BCRYPT_PREFIX = '$2';

export const hashAnyPassword = hashPassword;

/** Supabase-imported accounts keep their bcrypt hash; better-auth writes scrypt for new ones. */
export function verifyAnyPassword(input: {
  hash: string;
  password: string;
}): Promise<boolean> {
  if (input.hash.startsWith(BCRYPT_PREFIX)) {
    return compare(input.password, input.hash);
  }

  return verifyPassword(input);
}
