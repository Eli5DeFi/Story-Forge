import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChapterGenerationJob } from '../../jobs/chapter-generation.job';
import { StoryContextService } from '../story/services/story-context.service';
import { Prisma } from '@prisma/client';

interface CreateStoryDto {
  title: string;
  slug: string;
  genre: string;
  description: string;
  synopsis?: string;
  coverImage?: string;
  styleGuide?: string;
  worldState?: any;
  plotThreads?: any[];
}

interface SeedChapterDto {
  title: string;
  content: string;
  summary: string;
  outcomes?: Array<{
    teaserText: string;
    emotionalTone: string;
    plotImplications: string[];
  }>;
}

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private prisma: PrismaService,
    private chapterGenerationJob: ChapterGenerationJob,
    private storyContextService: StoryContextService,
  ) {}

  async createStory(data: CreateStoryDto) {
    this.logger.log(`Creating new story: ${data.title}`);

    const story = await this.prisma.story.create({
      data: {
        title: data.title,
        slug: data.slug,
        genre: data.genre,
        synopsis: data.synopsis || data.description,
        coverImageUrl: data.coverImage,
        styleGuide: data.styleGuide || '',
        worldState: data.worldState || this.getDefaultWorldState(),
        plotThreads: data.plotThreads || [],
        status: 'ACTIVE',
        currentChapter: 0,
      },
    });

    this.logger.log(`Created story: ${story.id}`);
    return story;
  }

  async seedInitialChapter(storyId: string, data: SeedChapterDto) {
    const story = await this.prisma.story.findUnique({
      where: { id: storyId },
    });

    if (!story) {
      throw new NotFoundException('Story not found');
    }

    this.logger.log(`Seeding initial chapter for story: ${story.title}`);

    // Create the chapter
    const chapter = await this.prisma.chapter.create({
      data: {
        storyId,
        chapterNumber: 1,
        title: data.title,
        content: data.content,
        summary: data.summary,
        status: 'BETTING_OPEN',
        publishedAt: new Date(),
        bettingEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      },
    });

    // Create outcomes if provided
    if (data.outcomes && data.outcomes.length > 0) {
      for (let i = 0; i < data.outcomes.length; i++) {
        const outcome = data.outcomes[i];
        const createdOutcome = await this.prisma.outcome.create({
          data: {
            chapterId: chapter.id,
            optionNumber: i + 1,
            teaserText: outcome.teaserText,
            emotionalTone: outcome.emotionalTone,
            plotImplications: outcome.plotImplications,
          },
        });

        // Create betting pool for this outcome
        await this.prisma.bettingPool.create({
          data: {
            chapterId: chapter.id,
            outcomeId: createdOutcome.id,
            status: 'OPEN',
          },
        });
      }
    }

    // Update story current chapter
    await this.prisma.story.update({
      where: { id: storyId },
      data: { currentChapter: 1 },
    });

    this.logger.log(`Seeded chapter ${chapter.id} with ${data.outcomes?.length || 0} outcomes`);

    return this.prisma.chapter.findUnique({
      where: { id: chapter.id },
      include: {
        outcomes: {
          include: { bettingPool: true },
        },
      },
    });
  }

  async triggerChapterGeneration(storyId: string, selectedOutcomeId?: string) {
    const story = await this.prisma.story.findUnique({
      where: { id: storyId },
    });

    if (!story) {
      throw new NotFoundException('Story not found');
    }

    this.logger.log(`Triggering chapter generation for: ${story.title}`);

    return this.chapterGenerationJob.triggerManualGeneration(storyId, selectedOutcomeId);
  }

  async getGenerationStatus(storyId: string) {
    return this.chapterGenerationJob.getGenerationStatus(storyId);
  }

  async closeCurrentBetting(storyId: string) {
    return this.chapterGenerationJob.closeBettingAndSelectOutcome(storyId);
  }

  async getStoryContext(storyId: string) {
    return this.storyContextService.buildContext(storyId);
  }

  async listStories() {
    return this.prisma.story.findMany({
      include: {
        _count: {
          select: {
            chapters: true,
            characters: true,
            items: true,
            locations: true,
            monsters: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteStory(storyId: string) {
    const story = await this.prisma.story.findUnique({
      where: { id: storyId },
    });

    if (!story) {
      throw new NotFoundException('Story not found');
    }

    this.logger.log(`Deleting story: ${story.title}`);

    // Delete in order due to foreign keys
    await this.prisma.$transaction([
      // Delete betting related
      this.prisma.payout.deleteMany({
        where: { bet: { pool: { chapter: { storyId } } } },
      }),
      this.prisma.userBet.deleteMany({
        where: { pool: { chapter: { storyId } } },
      }),
      this.prisma.bettingPool.deleteMany({
        where: { chapter: { storyId } },
      }),
      // Delete story content
      this.prisma.outcome.deleteMany({
        where: { chapter: { storyId } },
      }),
      this.prisma.chapter.deleteMany({
        where: { storyId },
      }),
      // Delete compendium
      this.prisma.characterRelation.deleteMany({
        where: { characterA: { storyId } },
      }),
      this.prisma.character.deleteMany({
        where: { storyId },
      }),
      this.prisma.item.deleteMany({
        where: { storyId },
      }),
      this.prisma.location.deleteMany({
        where: { storyId },
      }),
      this.prisma.monster.deleteMany({
        where: { storyId },
      }),
      this.prisma.loreEntry.deleteMany({
        where: { storyId },
      }),
      // Delete story
      this.prisma.story.delete({
        where: { id: storyId },
      }),
    ]);

    return { deleted: true, storyId };
  }

  private getDefaultWorldState() {
    return {
      currentTime: 'Day 1, Morning',
      currentLocation: 'Unknown',
      activeQuests: [],
      globalEvents: [],
      factions: [],
      magicSystemState: {
        currentManaLevel: 'normal',
        activeEnchantments: [],
        magicalAnomalies: [],
      },
    };
  }
}
