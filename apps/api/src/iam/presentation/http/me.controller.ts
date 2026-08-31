import { Body, Controller, Get, Patch, Req } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { ZodResponse } from 'nestjs-zod';
import { UpdateMeDto } from '@/iam/application/dtos/update-me.dto';
import { UserUpdater } from '@/iam/application/ports/user-updater.port';
import type { ActiveUserType } from '@/iam/domain/active-user';
import { ActiveUser } from '@/iam/presentation/http/decorators/active-user.decorator';
import { MeDto } from '@/iam/presentation/http/dto/me.dto';

@ApiCookieAuth()
@ApiTags('Me')
@Controller('me')
export class MeController {
  constructor(private readonly userUpdater: UserUpdater) {}

  @Get()
  @ApiOperation({ summary: 'Current user', operationId: 'me' })
  @ZodResponse({ status: 200, type: MeDto })
  me(@ActiveUser() user: ActiveUserType): ActiveUserType {
    return user;
  }

  @Patch()
  @ApiOperation({ summary: 'Update name or avatar', operationId: 'meUpdate' })
  @ZodResponse({ status: 200, type: MeDto })
  async update(
    @ActiveUser() user: ActiveUserType,
    @Req() request: Request,
    @Body() dto: UpdateMeDto
  ): Promise<ActiveUserType> {
    await this.userUpdater.update(request.headers, dto);
    return {
      id: user.id,
      email: user.email,
      name: dto.name ?? user.name,
      image: dto.image === undefined ? user.image : dto.image,
    };
  }
}
