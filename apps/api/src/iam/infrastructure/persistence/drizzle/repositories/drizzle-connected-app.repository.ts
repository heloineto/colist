import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import {
  DRIZZLE,
  type Drizzle,
} from '@/common/infrastructure/persistence/drizzle/drizzle.token';
import { ConnectedAppRepository } from '@/iam/application/ports/connected-app.repository';
import {
  oauthConsent,
  oauthRefreshToken,
} from '@/iam/infrastructure/persistence/drizzle/iam.schema';

@Injectable()
export class DrizzleConnectedAppRepository implements ConnectedAppRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Drizzle) {}

  disconnect(userId: string, consentId: string): Promise<boolean> {
    return this.db.transaction(async (tx) => {
      const deleted = await tx
        .delete(oauthConsent)
        .where(
          and(eq(oauthConsent.id, consentId), eq(oauthConsent.userId, userId))
        )
        .returning({ clientId: oauthConsent.clientId });

      if (deleted.length === 0) return false;

      // Opaque access tokens minted by these refresh tokens cascade with them.
      await tx
        .delete(oauthRefreshToken)
        .where(
          and(
            eq(oauthRefreshToken.userId, userId),
            eq(oauthRefreshToken.clientId, deleted[0].clientId)
          )
        );
      return true;
    });
  }
}
