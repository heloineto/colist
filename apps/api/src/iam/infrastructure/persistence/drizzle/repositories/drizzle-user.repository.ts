import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import {
  DRIZZLE,
  type Drizzle,
} from '@/common/infrastructure/persistence/drizzle/drizzle.token';
import {
  type UserPreview,
  UserRepository,
} from '@/iam/application/ports/user.repository';
import { user } from '@/iam/infrastructure/persistence/drizzle/iam.schema';

@Injectable()
export class DrizzleUserRepository implements UserRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Drizzle) {}

  async findByEmail(email: string): Promise<UserPreview | null> {
    const rows = await this.db
      .select({ id: user.id, name: user.name, image: user.image })
      .from(user)
      .where(eq(user.email, email.toLowerCase()))
      .limit(1);

    return rows[0] ?? null;
  }
}
