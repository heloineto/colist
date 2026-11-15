import { Injectable, NotFoundException } from '@nestjs/common';
import { ConnectedAppRepository } from '@/iam/application/ports/connected-app.repository';

@Injectable()
export class DisconnectAppUseCase {
  constructor(
    private readonly connectedAppRepository: ConnectedAppRepository
  ) {}

  async execute(userId: string, consentId: string): Promise<void> {
    const disconnected = await this.connectedAppRepository.disconnect(
      userId,
      consentId
    );

    if (!disconnected) throw new NotFoundException('Connected app not found');
  }
}
