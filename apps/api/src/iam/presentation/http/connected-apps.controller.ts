import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DisconnectAppUseCase } from '@/iam/application/use-cases/disconnect-app.use-case';
import type { ActiveUserType } from '@/iam/domain/active-user';
import { ActiveUser } from '@/iam/presentation/http/decorators/active-user.decorator';

/** Listing is better-auth's own `GET /api/auth/oauth2/get-consents`. */
@ApiCookieAuth()
@ApiTags('Connected apps')
@Controller('connected-apps')
export class ConnectedAppsController {
  constructor(private readonly disconnectApp: DisconnectAppUseCase) {}

  @Delete(':consentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Disconnect an app',
    description:
      'Deletes the consent and its refresh tokens. Issued access tokens expire within 15 min.',
    operationId: 'connectedAppsDisconnect',
  })
  @ApiResponse({ status: 204 })
  async disconnect(
    @ActiveUser() user: ActiveUserType,
    @Param('consentId', ParseUUIDPipe) consentId: string
  ) {
    await this.disconnectApp.execute(user.id, consentId);
  }
}
