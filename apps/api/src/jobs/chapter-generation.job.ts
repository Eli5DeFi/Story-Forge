import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../modules/prisma/prisma.service';

@Injectable()
export class ChapterGenerationJob {
  private readonly logger = new Logger(ChapterGenerationJob.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue('chapter-generation') private chapterQueue: Queue,
  ) {}

  /**
   * Main scheduled job - runs every 3 days at midnight UTC
   * Generates new chapters for all active stories
   */
  @Cron('0 0 */3 * *', {
    name: 'generate-chapters',
    timeZone: 'UTC',
  })
  async handleScheduledGeneration() {
    this.logger.log('Starting scheduled chapter generation...');

    try {
      // Find all active stories that need a new chapter
      const activeStories = await this.prisma.story.findMany({
        where: { status: 'ACTIVE' },
        include: {
          chapters: {
            where: { status: 'BETTING_OPEN' },
            take: 1,
          },
        },
      });

      for (const story of activeStories) {
        // Skip if there's still an open betting chapter
        if (story.chapters.length > 0) {
          const bettingChapter = story.chapters[0];
          if (bettingChapter.bettingEndsAt && new Date() < bettingChapter.bettingEndsAt) {
            this.logger.log(`Skipping ${story.title} - betting still open`);
            continue;
          }
        }

        // Queue chapter generation
        await this.queueChapterGeneration(story.id);
      }

      this.logger.log(`Queued chapter generation for ${activeStories.length} stories`);
    } catch (error) {
      this.logger.error('Failed to run scheduled chapter generation', error);
    }
  }

  /**
   * Queue a chapter generation job
   */
  async queueChapterGeneration(storyId: string, selectedOutcomeId?: string) {
    this.logger.log(`Queueing chapter generation for story ${storyId}`);

    await this.chapterQueue.add(
      'generate',
      {
        storyId,
        selectedOutcomeId,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 60000, // 1 minute initial delay
        },
        removeOnComplete: 100, // Keep last 100 completed jobs
        removeOnFail: 50, // Keep last 50 failed jobs
      },
    );
  }

  /**
   * Close betting and select outcome for a story
   */
  async closeBettingAndSelectOutcome(storyId: string): Promise<string | null> {
    const chapter = await this.prisma.chapter.findFirst({
      where: {
        storyId,
        status: 'BETTING_OPEN',
      },
      include: {
        outcomes: {
          include: {
            bettingPool: true,
          },
        },
      },
    });

    if (!chapter) {
      this.logger.warn(`No betting chapter found for story ${storyId}`);
      return null;
    }

    // Close the betting
    await this.prisma.chapter.update({
      where: { id: chapter.id },
      data: { status: 'BETTING_CLOSED' },
    });

    // Close all pools
    await this.prisma.bettingPool.updateMany({
      where: { chapterId: chapter.id },
      data: { status: 'CLOSED' },
    });

    return chapter.id;
  }

  /**
   * Check for chapters that need betting closure
   * Runs every hour
   */
  @Cron(CronExpression.EVERY_HOUR, {
    name: 'check-betting-closure',
    timeZone: 'UTC',
  })
  async checkBettingClosure() {
    this.logger.log('Checking for chapters needing betting closure...');

    try {
      // Find chapters where betting has ended but status is still BETTING_OPEN
      const chaptersToClose = await this.prisma.chapter.findMany({
        where: {
          status: 'BETTING_OPEN',
          bettingEndsAt: {
            lte: new Date(),
          },
        },
        include: {
          story: true,
        },
      });

      for (const chapter of chaptersToClose) {
        this.logger.log(`Closing betting for chapter ${chapter.id} of ${chapter.story.title}`);

        // Close the chapter
        await this.prisma.chapter.update({
          where: { id: chapter.id },
          data: { status: 'BETTING_CLOSED' },
        });

        // Close all pools
        await this.prisma.bettingPool.updateMany({
          where: { chapterId: chapter.id },
          data: { status: 'CLOSED' },
        });

        // Queue the next chapter generation
        await this.queueChapterGeneration(chapter.storyId);
      }

      if (chaptersToClose.length > 0) {
        this.logger.log(`Closed betting for ${chaptersToClose.length} chapters`);
      }
    } catch (error) {
      this.logger.error('Failed to check betting closure', error);
    }
  }

  /**
   * Manual trigger for chapter generation (admin use)
   */
  async triggerManualGeneration(storyId: string, selectedOutcomeId?: string) {
    this.logger.log(`Manual chapter generation triggered for story ${storyId}`);

    // Close any open betting first
    await this.closeBettingAndSelectOutcome(storyId);

    // Queue the generation
    await this.queueChapterGeneration(storyId, selectedOutcomeId);

    return { queued: true, storyId };
  }

  /**
   * Get the status of generation jobs for a story
   */
  async getGenerationStatus(storyId: string) {
    const waiting = await this.chapterQueue.getWaiting();
    const active = await this.chapterQueue.getActive();
    const completed = await this.chapterQueue.getCompleted();
    const failed = await this.chapterQueue.getFailed();

    const storyJobs = {
      waiting: waiting.filter((j) => j.data.storyId === storyId),
      active: active.filter((j) => j.data.storyId === storyId),
      completed: completed.filter((j) => j.data.storyId === storyId).slice(0, 5),
      failed: failed.filter((j) => j.data.storyId === storyId).slice(0, 5),
    };

    return {
      queueLength: waiting.length + active.length,
      storyJobs: {
        waiting: storyJobs.waiting.length,
        active: storyJobs.active.length,
        recentCompleted: storyJobs.completed.map((j) => ({
          id: j.id,
          completedAt: j.finishedOn,
          result: j.returnvalue,
        })),
        recentFailed: storyJobs.failed.map((j) => ({
          id: j.id,
          failedAt: j.finishedOn,
          error: j.failedReason,
        })),
      },
    };
  }
}
