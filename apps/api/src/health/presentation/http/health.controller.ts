import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '@/iam/presentation/http/decorators/public.decorator';

@Public()
@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check', operationId: 'health' })
  @ApiOkResponse({ schema: { example: { status: 'ok' } } })
  check(): { status: string } {
    return { status: 'ok' };
  }
}
