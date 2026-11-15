import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '@/iam/application/ports/user.repository';
import type { ActiveUserType } from '@/iam/domain/active-user';

/** Resolves a token subject (user id) to the `ActiveUser` that acts on lists. */
@Injectable()
export class FindUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string): Promise<ActiveUserType> {
    const user = await this.userRepository.findById(id);

    if (user === null) throw new NotFoundException('User not found');

    return user;
  }
}
