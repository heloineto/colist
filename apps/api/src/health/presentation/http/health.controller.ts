import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthType } from '@/iam/domain/auth-type';
import { Auth } from '@/iam/presentation/http/decorators/auth.decorator';

@Auth(AuthType.None)
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
