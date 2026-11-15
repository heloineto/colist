/** Serves an MCP request already authenticated as `userId` (the token's `sub`). */
export type McpRequestHandler = (
  request: Request,
  userId: string
) => Promise<Response>;

/** Bearer auth for the MCP endpoint (OAuth resource server side). */
export abstract class McpAuthenticator {
  /** The OAuth resource (= the MCP endpoint URL) tokens must be issued for. */
  abstract readonly resource: string;

  /**
   * Wraps `handler`: missing/invalid/expired/foreign-audience tokens get a 401
   * with `WWW-Authenticate: Bearer resource_metadata=...` (what starts OAuth in Claude).
   */
  abstract protect(
    handler: McpRequestHandler
  ): (request: Request) => Promise<Response>;
}
