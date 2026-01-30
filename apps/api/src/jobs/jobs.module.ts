import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ChapterGenerationJob } from './chapter-generation.job';
import { PrismaModule } from '../modules/prisma/prisma.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'chapter-generation',
    }),
    PrismaModule,
  ],
  providers: [ChapterGenerationJob],
  exports: [ChapterGenerationJob],
})
export class JobsModule {}
