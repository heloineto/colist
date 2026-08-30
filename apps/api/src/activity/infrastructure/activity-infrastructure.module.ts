import { Global, Module } from '@nestjs/common';
import { ActivityRecorder } from '@/activity/application/ports/activity-recorder.port';
import { ActivityRepository } from '@/activity/application/ports/activity.repository';
import { EventEmitterActivityRecorder } from '@/activity/infrastructure/activity-recorder.service';
import { DrizzleActivityRepository } from '@/activity/infrastructure/persistence/drizzle/repositories/drizzle-activity.repository';

@Global()
@Module({
  providers: [
    { provide: ActivityRepository, useClass: DrizzleActivityRepository },
    { provide: ActivityRecorder, useClass: EventEmitterActivityRecorder },
  ],
  exports: [ActivityRepository, ActivityRecorder],
})
export class ActivityInfrastructureModule {}
