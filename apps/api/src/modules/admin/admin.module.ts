import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { JobsModule } from '../../jobs/jobs.module';
import { StoryModule } from '../story/story.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [JobsModule, StoryModule, PrismaModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
