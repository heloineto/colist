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
    await this.activityRepository.insert({
      listId: input.listId,
      actorId: input.actor.id,
      actorName: input.actor.name,
      action: input.action,
      targetName: input.targetName ?? null,
    });

    await this.notify(input.listId, input.notify);
  }

  async notify(listId: number, userIds?: string[]): Promise<void> {
    const event: ListChangedEvent = {
      listId,
      userIds:
        userIds ?? (await this.membershipRepository.findMemberIds(listId)),
    };

    // ponytail: in-process bus; Postgres LISTEN/NOTIFY if the API ever runs >1 instance.
    this.eventEmitter.emit(LIST_CHANGED_EVENT, event);
  }
}
