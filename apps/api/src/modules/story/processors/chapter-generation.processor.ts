import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { AiGenerationService } from '../services/ai-generation.service';
import { EntityExtractionService } from '../services/entity-extraction.service';

interface ChapterGenerationJob {
  storyId: string;
  selectedOutcomeId?: string;
}

@Processor('chapter-generation')
export class ChapterGenerationProcessor {
  private readonly logger = new Logger(ChapterGenerationProcessor.name);

  constructor(
    private prisma: PrismaService,
    private aiGeneration: AiGenerationService,
    private entityExtraction: EntityExtractionService,
  ) {}

  @Process('generate')
  async handleGeneration(job: Job<ChapterGenerationJob>) {
    const { storyId, selectedOutcomeId } = job.data;
    this.logger.log(`Starting chapter generation for story ${storyId}`);

    try {
      // Get story with context
      const story = await this.prisma.story.findUnique({
        where: { id: storyId },
        include: {
          chapters: {
            orderBy: { chapterNumber: 'desc' },
            take: 5,
            include: {
              outcomes: {
                where: { isSelected: true },
              },
            },
          },
          characters: { select: { name: true } },
          items: { select: { name: true } },
          locations: { select: { name: true } },
          monsters: { select: { name: true } },
        },
      });

      if (!story) {
        throw new Error('Story not found');
      }

      // Get selected outcome if any
      let selectedOutcome = null;
      if (selectedOutcomeId) {
        selectedOutcome = await this.prisma.outcome.findUnique({
          where: { id: selectedOutcomeId },
        });
      }

      // Build context for AI
      const context = {
        storyId: story.id,
        title: story.title,
        genre: story.genre,
        worldState: story.worldState,
        plotThreads: story.plotThreads as any[] || [],
        previousChapters: story.chapters.map(ch => ({
          number: ch.chapterNumber,
          summary: ch.summary || '',
          selectedOutcome: ch.outcomes[0]?.teaserText,
        })),
        currentChapter: story.currentChapter,
        selectedOutcome: selectedOutcome ? {
          teaserText: selectedOutcome.teaserText,
          fullNarrative: selectedOutcome.fullNarrative,
        } : undefined,
      };

      // Generate chapter
      const generated = await this.aiGeneration.generateChapter(context);

      // Extract entities
      const entities = await this.entityExtraction.extractEntities(
        generated.content,
        {
          characters: story.characters.map(c => c.name),
          items: story.items.map(i => i.name),
          locations: story.locations.map(l => l.name),
          monsters: story.monsters.map(m => m.name),
        },
      );

      // Generate outcomes
      const outcomes = await this.aiGeneration.generateOutcomes(context, generated.content);

      // Create chapter in database
      const newChapter = await this.prisma.chapter.create({
        data: {
          storyId: story.id,
          chapterNumber: story.currentChapter + 1,
          title: generated.title,
          content: generated.content,
          summary: generated.summary,
          status: 'PUBLISHED',
          publishedAt: new Date(),
          bettingEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
          extractedEntities: entities as any,
          outcomes: {
            create: outcomes.map(o => ({
              optionNumber: o.optionNumber,
              teaserText: o.teaserText,
              emotionalTone: o.emotionalTone,
              plotImplications: o.plotImplications,
            })),
          },
        },
        include: {
          outcomes: true,
        },
      });

      // Update story current chapter
      await this.prisma.story.update({
        where: { id: storyId },
        data: { currentChapter: story.currentChapter + 1 },
      });

      // Store new entities in compendium
      await this.storeExtractedEntities(storyId, newChapter.chapterNumber, entities);

      this.logger.log(`Chapter ${newChapter.chapterNumber} generated for story ${storyId}`);

      return { chapterId: newChapter.id, chapterNumber: newChapter.chapterNumber };
    } catch (error) {
      this.logger.error(`Failed to generate chapter for story ${storyId}`, error);
      throw error;
    }
  }

  private async storeExtractedEntities(
    storyId: string,
    chapterNumber: number,
    entities: any,
  ) {
    // Store new characters
    for (const char of entities.characters.filter((c: any) => c.isNew)) {
      await this.prisma.character.upsert({
        where: { storyId_name: { storyId, name: char.name } },
        create: {
          storyId,
          name: char.name,
          description: char.description,
          traits: { personality: char.traits },
          firstAppearance: chapterNumber,
        },
        update: {
          description: char.description,
        },
      });
    }

    // Store new items
    for (const item of entities.items) {
      await this.prisma.item.upsert({
        where: { storyId_name: { storyId, name: item.name } },
        create: {
          storyId,
          name: item.name,
          description: item.description,
          type: item.type as any || 'KEY_ITEM',
          rarity: item.rarity as any || 'COMMON',
          firstAppearance: chapterNumber,
        },
        update: {
          description: item.description,
        },
      });
    }

    // Store new locations
    for (const loc of entities.locations) {
      await this.prisma.location.upsert({
        where: { storyId_name: { storyId, name: loc.name } },
        create: {
          storyId,
          name: loc.name,
          description: loc.description,
          type: loc.type || 'unknown',
          firstAppearance: chapterNumber,
        },
        update: {
          description: loc.description,
        },
      });
    }

    // Store new monsters
    for (const monster of entities.monsters) {
      await this.prisma.monster.upsert({
        where: { storyId_name: { storyId, name: monster.name } },
        create: {
          storyId,
          name: monster.name,
          description: monster.description,
          threatLevel: monster.threatLevel || 5,
          abilities: monster.abilities || [],
          weaknesses: monster.weaknesses || [],
          firstAppearance: chapterNumber,
        },
        update: {
          description: monster.description,
        },
      });
    }

    // Store lore entries
    for (const lore of entities.loreEntries) {
      await this.prisma.loreEntry.create({
        data: {
          storyId,
          category: lore.category,
          title: lore.title,
          content: lore.content,
          chapterRefs: [chapterNumber],
        },
      });
    }
  }
}
