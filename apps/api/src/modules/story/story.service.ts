import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, StoryStatus, ChapterStatus } from '@prisma/client';

@Injectable()
export class StoryService {
  constructor(private prisma: PrismaService) {}

  async findAll(status?: StoryStatus) {
    return this.prisma.story.findMany({
      where: status ? { status } : undefined,
      include: {
        _count: {
          select: { chapters: true, characters: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(idOrSlug: string) {
    const story = await this.prisma.story.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        chapters: {
          where: { status: { not: 'DRAFT' } },
          orderBy: { chapterNumber: 'asc' },
          select: {
            id: true,
            chapterNumber: true,
            title: true,
            publishedAt: true,
            status: true,
          },
        },
        _count: {
          select: {
            characters: true,
            items: true,
            locations: true,
            monsters: true,
          },
        },
      },
    });

    if (!story) {
      throw new NotFoundException('Story not found');
    }

    return story;
  }

  async getChapter(storyId: string, chapterNumber: number) {
    const chapter = await this.prisma.chapter.findFirst({
      where: {
        story: {
          OR: [{ id: storyId }, { slug: storyId }],
        },
        chapterNumber,
      },
      include: {
        outcomes: {
          include: {
            bettingPool: {
              select: {
                id: true,
                totalAmountUsdc: true,
                totalAmountUsdt: true,
                voterCount: true,
                status: true,
              },
            },
          },
          orderBy: { optionNumber: 'asc' },
        },
        story: {
          select: {
            id: true,
            title: true,
            slug: true,
            currentChapter: true,
          },
        },
      },
    });

    if (!chapter) {
      throw new NotFoundException('Chapter not found');
    }

    return chapter;
  }

  async getChaptersList(storyId: string) {
    return this.prisma.chapter.findMany({
      where: {
        story: {
          OR: [{ id: storyId }, { slug: storyId }],
        },
        status: { not: 'DRAFT' },
      },
      select: {
        id: true,
        chapterNumber: true,
        title: true,
        publishedAt: true,
        status: true,
        selectedOutcome: true,
      },
      orderBy: { chapterNumber: 'asc' },
    });
  }

  async getCurrentBettingChapter(storyId: string) {
    return this.prisma.chapter.findFirst({
      where: {
        story: {
          OR: [{ id: storyId }, { slug: storyId }],
        },
        status: 'BETTING_OPEN',
      },
      include: {
        outcomes: {
          include: {
            bettingPool: true,
          },
          orderBy: { optionNumber: 'asc' },
        },
      },
    });
  }

  async create(data: Prisma.StoryCreateInput) {
    return this.prisma.story.create({
      data,
    });
  }

  async updateWorldState(storyId: string, worldState: any) {
    return this.prisma.story.update({
      where: { id: storyId },
      data: { worldState },
    });
  }
}
