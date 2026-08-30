import { Module } from '@nestjs/common';
import { EventsController } from '@/realtime/presentation/http/events.controller';

@Module({ controllers: [EventsController] })
export class RealtimeModule {}
