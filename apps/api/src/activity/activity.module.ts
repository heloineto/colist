import { Module } from '@nestjs/common';
import { FindActivitiesUseCase } from '@/activity/application/use-cases/find-activities.use-case';
import { ActivityInfrastructureModule } from '@/activity/infrastructure/activity-infrastructure.module';
import { ActivitiesController } from '@/activity/presentation/http/activities.controller';

@Module({
  imports: [ActivityInfrastructureModule],
  controllers: [ActivitiesController],
  providers: [FindActivitiesUseCase],
})
export class ActivityModule {}
