import { Controller, Get, Query } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';
import { LookupUserUseCase } from '@/iam/application/use-cases/lookup-user.use-case';
import {
  LookupUserQueryDto,
  UserPreviewDto,
} from '@/iam/presentation/http/dto/lookup-user.dto';

@ApiCookieAuth()
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly lookupUser: LookupUserUseCase) {}

  @Get('lookup')
  @ApiOperation({
    summary: 'Find a user by email',
    description: 'Preview shown before adding someone to a list.',
    operationId: 'usersLookup',
  })
  @ZodResponse({ status: 200, type: UserPreviewDto })
  lookup(@Query() query: LookupUserQueryDto) {
    return this.lookupUser.execute(query.email);
  }
}
