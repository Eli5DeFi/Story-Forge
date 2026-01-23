import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { StoryService } from './story.service';
import { StoryController } from './story.controller';
import { ChapterGenerationProcessor } from './processors/chapter-generation.processor';
import { AiGenerationService } from './services/ai-generation.service';
import { EntityExtractionService } from './services/entity-extraction.service';
import { StoryContextService } from './services/story-context.service';
import { ImageGenerationService } from './services/image-generation.service';
import { IpfsService } from './services/ipfs.service';

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
    StoryContextService,
    ImageGenerationService,
    IpfsService,
    ChapterGenerationProcessor,
  ],
  exports: [
    StoryService,
    AiGenerationService,
    StoryContextService,
    ImageGenerationService,
    IpfsService,
  ],
})
export class StoryModule {}
