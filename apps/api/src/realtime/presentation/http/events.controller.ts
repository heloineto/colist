import { Controller, type MessageEvent, Sse } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { type Observable, fromEvent, interval, map, merge } from 'rxjs';
import { filter } from 'rxjs/operators';
import {
  LIST_CHANGED_EVENT,
  type ListChangedEvent,
} from '@/activity/domain/list-changed-event';
import type { ActiveUserType } from '@/iam/domain/active-user';
import { ActiveUser } from '@/iam/presentation/http/decorators/active-user.decorator';

const KEEP_ALIVE_MS = 25_000;

@ApiCookieAuth()
@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  @Sse()
  @ApiOperation({
    summary: 'Per-user change stream (SSE)',
    description:
      'Emits `list.changed` with `{ listId }` for every list the user belongs to; clients refetch. Stateless — re-fetch everything on (re)connect.',
    operationId: 'events',
  })
  stream(@ActiveUser() user: ActiveUserType): Observable<MessageEvent> {
    const changes = fromEvent(this.eventEmitter, LIST_CHANGED_EVENT).pipe(
      map((event) => event as ListChangedEvent),
      filter((event) => event.userIds.includes(user.id)),
      map((event) => ({ type: 'list.changed', data: { listId: event.listId } }))
    );
    const keepAlive = interval(KEEP_ALIVE_MS).pipe(
      map(() => ({ type: 'ping', data: '' }))
    );

    return merge(changes, keepAlive);
  }
}
