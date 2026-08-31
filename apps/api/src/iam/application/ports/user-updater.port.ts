import type { IncomingHttpHeaders } from 'node:http';
import type { UpdateMeDto } from '@/iam/application/dtos/update-me.dto';

export abstract class UserUpdater {
  abstract update(
    headers: IncomingHttpHeaders,
    dto: UpdateMeDto
  ): Promise<void>;
}
