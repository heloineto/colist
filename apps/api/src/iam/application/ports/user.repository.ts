import type { ActiveUserType } from '@/iam/domain/active-user';

export type UserPreview = Pick<ActiveUserType, 'id' | 'name' | 'image'>;

export abstract class UserRepository {
  abstract findByEmail(email: string): Promise<UserPreview | null>;
  abstract findById(id: string): Promise<ActiveUserType | null>;
}
