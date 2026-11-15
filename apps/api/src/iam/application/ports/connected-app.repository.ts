export abstract class ConnectedAppRepository {
  /**
   * Deletes the user's consent and their refresh tokens for its client, so the
   * app can't mint new access tokens. Returns false when the consent isn't theirs.
   */
  abstract disconnect(userId: string, consentId: string): Promise<boolean>;
}
