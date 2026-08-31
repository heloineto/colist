import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ActivityRecorder,
  type RecordInput,
} from '@/activity/application/ports/activity-recorder.port';
import { ActivityRepository } from '@/activity/application/ports/activity.repository';
import {
  LIST_CHANGED_EVENT,
  type ListChangedEvent,
} from '@/activity/domain/list-changed-event';
import { MembershipRepository } from '@/list/application/ports/membership.repository';

@Injectable()
export class EventEmitterActivityRecorder implements ActivityRecorder {
  constructor(
    private readonly activityRepository: ActivityRepository,
    private readonly membershipRepository: MembershipRepository,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async record(input: RecordInput): Promise<void> {
    const [userIds] = await Promise.all([
      this.resolveUserIds(input.listId, input.notify),
      this.activityRepository.insert({
        listId: input.listId,
        actorId: input.actor.id,
        actorName: input.actor.name,
        action: input.action,
        targetName: input.targetName,
      }),
    ]);

    this.emit(input.listId, userIds);
  }

  async notify(listId: number, userIds?: string[]): Promise<void> {
    this.emit(listId, await this.resolveUserIds(listId, userIds));
  }

  private resolveUserIds(listId: number, userIds?: string[]) {
    return userIds ?? this.membershipRepository.findMemberIds(listId);
  }

  private emit(listId: number, userIds: string[]) {
    const event: ListChangedEvent = { listId, userIds };
    // ponytail: in-process bus; Postgres LISTEN/NOTIFY if the API ever runs >1 instance.
    this.eventEmitter.emit(LIST_CHANGED_EVENT, event);
  }
}
