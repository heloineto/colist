import { requireMcpAuth } from '@better-auth/mcp';
import { Injectable } from '@nestjs/common';
import {
  McpAuthenticator,
  type McpRequestHandler,
} from '@/iam/application/ports/mcp-authenticator.port';
import {
  BetterAuthInstance,
  MCP_SCOPE,
} from '@/iam/infrastructure/better-auth/better-auth';

/** In-process JWT check (signature, iss, aud = MCP resource, exp, azp, `lists` scope). */
@Injectable()
export class BetterAuthMcpAuthenticator implements McpAuthenticator {
  readonly resource: string;

  constructor(private readonly betterAuth: BetterAuthInstance) {
    this.resource = betterAuth.mcpResource;
  }

  protect(handler: McpRequestHandler): (request: Request) => Promise<Response> {
    return requireMcpAuth(
      this.betterAuth.auth,
      (request, claims) => handler(request, String(claims.sub)),
      { resource: this.resource, requiredScopes: [MCP_SCOPE] }
    );
  }
}
