import { Module } from '@nestjs/common';
import { McpController } from '@/mcp/presentation/http/mcp.controller';
import { McpTools } from '@/mcp/presentation/http/mcp-tools.service';

/** Presentation-only: the global iam/list/category/item use-cases as MCP tools at `/api/mcp`. */
@Module({
  controllers: [McpController],
  providers: [McpTools],
})
export class McpModule {}
