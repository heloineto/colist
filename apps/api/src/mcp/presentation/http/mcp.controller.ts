import {
  type NodeMcpRequestHandler,
  originValidation,
  toNodeHandler,
} from '@modelcontextprotocol/node';
import { createMcpHandler } from '@modelcontextprotocol/server';
import { All, Controller, Req, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { McpAuthenticator } from '@/iam/application/ports/mcp-authenticator.port';
import { FindUserUseCase } from '@/iam/application/use-cases/find-user.use-case';
import { ActiveUserSchema } from '@/iam/domain/active-user';
import { Public } from '@/iam/presentation/http/decorators/public.decorator';
import { McpTools } from '@/mcp/presentation/http/mcp-tools.service';

/**
 * Streamable HTTP MCP endpoint (= the OAuth resource). Stateless; the SDK's
 * default legacy mode also serves 2025-era clients (claude.ai today).
 * `@Public()`: the bearer check below answers 401 with the challenge Claude needs.
 */
@Public()
@ApiExcludeController()
@Controller('mcp')
export class McpController {
  private readonly handle: NodeMcpRequestHandler;
  private readonly isAllowedOrigin: ReturnType<typeof originValidation>;

  constructor(
    authenticator: McpAuthenticator,
    findUser: FindUserUseCase,
    tools: McpTools
  ) {
    const mcp = createMcpHandler(({ authInfo }) =>
      tools.createServer(ActiveUserSchema.parse(authInfo?.extra?.['user']))
    );
    const fetch = authenticator.protect(async (request, userId) => {
      const user = await findUser.execute(userId);
      return mcp.fetch(request, {
        authInfo: { token: '', clientId: '', scopes: [], extra: { user } },
      });
    });

    this.handle = toNodeHandler({ fetch });
    // DNS-rebinding guard: browsers send `Origin`, Claude's servers don't.
    this.isAllowedOrigin = originValidation([
      new URL(authenticator.resource).hostname,
    ]);
  }

  @All()
  async serve(@Req() request: Request, @Res() response: Response) {
    if (!this.isAllowedOrigin(request, response)) return;

    await this.handle(request, response, request.body);
  }
}
