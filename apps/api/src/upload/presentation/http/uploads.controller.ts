import { Body, Controller, Post } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';
import type { ActiveUserType } from '@/iam/domain/active-user';
import { ActiveUser } from '@/iam/presentation/http/decorators/active-user.decorator';
import { PresignUploadDto } from '@/upload/application/dtos/presign-upload.dto';
import { PresignUploadUseCase } from '@/upload/application/use-cases/presign-upload.use-case';
import { PresignedUploadDto } from '@/upload/presentation/http/dto/presigned-upload.dto';

@ApiCookieAuth()
@ApiTags('Uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly presignUpload: PresignUploadUseCase) {}

  @Post('presign')
  @ApiOperation({
    summary: 'Presign an S3 PUT',
    description:
      'Avatars are public-read under `avatars/`; attachments are private.',
    operationId: 'uploadsPresign',
  })
  @ZodResponse({ status: 201, type: PresignedUploadDto })
  presign(@ActiveUser() user: ActiveUserType, @Body() dto: PresignUploadDto) {
    return this.presignUpload.execute(user.id, dto);
  }
}
