import { Injectable, NotFoundException } from '@nestjs/common';
import {
  type UserPreview,
  UserRepository,
} from '@/iam/application/ports/user.repository';

@Injectable()
export class LookupUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(email: string): Promise<UserPreview> {
    const user = await this.userRepository.findByEmail(email);

    if (user === null) throw new NotFoundException('User not found');

    return user;
  }
}
