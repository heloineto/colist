import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { type MockProxy, mock } from 'vitest-mock-extended';
import { ActivityRecorder } from '@/activity/application/ports/activity-recorder.port';
import { ListRepository } from '@/list/application/ports/list.repository';
import { MembershipRepository } from '@/list/application/ports/membership.repository';
import { LeaveListUseCase } from '@/list/application/use-cases/leave-list.use-case';
import type { Member, Membership } from '@/list/domain/membership';

const LIST_ID = 7;
const owner = { id: 'a0000000-0000-4000-8000-000000000001', name: 'Ana' };
const oldest = { id: 'a0000000-0000-4000-8000-000000000002', name: 'Bia' };
const newest = { id: 'a0000000-0000-4000-8000-000000000003', name: 'Caio' };

function member(
  user: { id: string; name: string },
  role: Membership['role']
): Member {
  return {
    userId: user.id,
    listId: LIST_ID,
    role,
    createdAt: new Date(),
    name: user.name,
    email: `${user.name}@x.test`,
    image: null,
  };
}

describe('LeaveListUseCase', () => {
  let listRepository: MockProxy<ListRepository>;
  let membershipRepository: MockProxy<MembershipRepository>;
  let activityRecorder: MockProxy<ActivityRecorder>;
  let leaveList: LeaveListUseCase;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        LeaveListUseCase,
        { provide: ListRepository, useValue: mock<ListRepository>() },
        {
          provide: MembershipRepository,
          useValue: mock<MembershipRepository>(),
        },
        { provide: ActivityRecorder, useValue: mock<ActivityRecorder>() },
      ],
    }).compile();

    listRepository = module.get(ListRepository);
    membershipRepository = module.get(MembershipRepository);
    activityRecorder = module.get(ActivityRecorder);
    leaveList = module.get(LeaveListUseCase);
  });

  it('deletes the list when the last member leaves', async () => {
    membershipRepository.findMembers.mockResolvedValue([
      member(owner, 'owner'),
    ]);

    await leaveList.execute(owner, member(owner, 'owner'));

    expect(listRepository.remove).toHaveBeenCalledWith(LIST_ID);
    expect(membershipRepository.remove).not.toHaveBeenCalled();
    expect(activityRecorder.notify).toHaveBeenCalledWith(LIST_ID, [owner.id]);
  });

  it('promotes the longest-standing member when the owner leaves', async () => {
    membershipRepository.findMembers.mockResolvedValue([
      member(owner, 'owner'),
      member(oldest, 'member'),
      member(newest, 'member'),
    ]);

    await leaveList.execute(owner, member(owner, 'owner'));

    expect(membershipRepository.remove).toHaveBeenCalledWith(owner.id, LIST_ID);
    expect(membershipRepository.promote).toHaveBeenCalledWith(
      oldest.id,
      LIST_ID
    );
    expect(activityRecorder.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'owner.promoted',
        targetName: oldest.name,
      })
    );
    expect(listRepository.remove).not.toHaveBeenCalled();
  });

  it('just removes a plain member', async () => {
    membershipRepository.findMembers.mockResolvedValue([
      member(owner, 'owner'),
      member(oldest, 'member'),
    ]);

    await leaveList.execute(oldest, member(oldest, 'member'));

    expect(membershipRepository.remove).toHaveBeenCalledWith(
      oldest.id,
      LIST_ID
    );
    expect(membershipRepository.promote).not.toHaveBeenCalled();
    expect(activityRecorder.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'member.left',
        notify: [owner.id, oldest.id],
      })
    );
  });
});
