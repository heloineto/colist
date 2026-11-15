import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it } from 'vitest';
import { type MockProxy, mock } from 'vitest-mock-extended';
import type { MembershipRepository } from '@/list/application/ports/membership.repository';
import { AuthorizeMembershipUseCase } from '@/list/application/use-cases/authorize-membership.use-case';
import type { Membership } from '@/list/domain/membership';

const USER_ID = 'a0000000-0000-4000-8000-000000000001';
const LIST_ID = 7;
const createdAt = new Date();

function membership(role: Membership['role']): Membership {
  return { userId: USER_ID, listId: LIST_ID, role, createdAt };
}

describe('AuthorizeMembershipUseCase', () => {
  let membershipRepository: MockProxy<MembershipRepository>;
  let authorize: AuthorizeMembershipUseCase;

  beforeEach(() => {
    membershipRepository = mock<MembershipRepository>();
    authorize = new AuthorizeMembershipUseCase(membershipRepository);
  });

  it('hides the list from non-members', async () => {
    membershipRepository.findOne.mockResolvedValue(null);

    await expect(authorize.execute(USER_ID, LIST_ID)).rejects.toThrow(
      NotFoundException
    );
  });

  it('returns the membership when no role is required', async () => {
    membershipRepository.findOne.mockResolvedValue(membership('member'));

    await expect(authorize.execute(USER_ID, LIST_ID)).resolves.toEqual(
      membership('member')
    );
  });

  it('rejects the wrong role', async () => {
    membershipRepository.findOne.mockResolvedValue(membership('member'));

    await expect(authorize.execute(USER_ID, LIST_ID, 'owner')).rejects.toThrow(
      ForbiddenException
    );
  });
});
