import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { StoryService } from './story.service';
import { StoryController } from './story.controller';
import { ChapterGenerationProcessor } from './processors/chapter-generation.processor';
import { AiGenerationService } from './services/ai-generation.service';
import { EntityExtractionService } from './services/entity-extraction.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'chapter-generation',
    }),
  ],
  controllers: [StoryController],
  providers: [
    StoryService,
    AiGenerationService,
    EntityExtractionService,
    ChapterGenerationProcessor,
  ],
  exports: [StoryService, AiGenerationService],
})
export class StoryModule {}
