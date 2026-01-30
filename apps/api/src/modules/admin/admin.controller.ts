import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';

// Note: In production, protect these endpoints with admin authentication
// @UseGuards(AdminGuard)
@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stories')
  @ApiOperation({ summary: 'List all stories with stats' })
  @ApiResponse({ status: 200, description: 'Returns all stories' })
  async listStories() {
    return this.adminService.listStories();
  }

  @Post('stories')
  @ApiOperation({ summary: 'Create a new story' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['title', 'slug', 'genre', 'description'],
      properties: {
        title: { type: 'string', example: 'The Chronicles of Eldoria' },
        slug: { type: 'string', example: 'chronicles-of-eldoria' },
        genre: { type: 'string', example: 'Epic Fantasy' },
        description: { type: 'string', example: 'An epic tale of magic and adventure...' },
        coverImage: { type: 'string', example: 'https://...' },
        styleGuide: { type: 'string', example: 'Dark fantasy with morally grey characters...' },
        worldState: { type: 'object' },
        plotThreads: { type: 'array' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Story created' })
  async createStory(
    @Body()
    body: {
      title: string;
      slug: string;
      genre: string;
      description: string;
      coverImage?: string;
      styleGuide?: string;
      worldState?: any;
      plotThreads?: any[];
    },
  ) {
    return this.adminService.createStory(body);
  }

  @Post('stories/:storyId/seed-chapter')
  @ApiOperation({ summary: 'Seed an initial chapter for a story' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['title', 'content', 'summary'],
      properties: {
        title: { type: 'string', example: 'The Beginning' },
        content: { type: 'string', example: 'The story begins...' },
        summary: { type: 'string', example: 'Aria discovers her magical abilities...' },
        outcomes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              teaserText: { type: 'string' },
              emotionalTone: { type: 'string' },
              plotImplications: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Chapter seeded' })
  async seedChapter(
    @Param('storyId') storyId: string,
    @Body()
    body: {
      title: string;
      content: string;
      summary: string;
      outcomes?: Array<{
        teaserText: string;
        emotionalTone: string;
        plotImplications: string[];
      }>;
    },
  ) {
    return this.adminService.seedInitialChapter(storyId, body);
  }

  @Post('stories/:storyId/generate')
  @ApiOperation({ summary: 'Trigger chapter generation for a story' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        selectedOutcomeId: {
          type: 'string',
          description: 'Optional: Force selection of a specific outcome',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Generation queued' })
  async triggerGeneration(
    @Param('storyId') storyId: string,
    @Body() body: { selectedOutcomeId?: string },
  ) {
    return this.adminService.triggerChapterGeneration(
      storyId,
      body.selectedOutcomeId,
    );
  }

  @Get('stories/:storyId/generation-status')
  @ApiOperation({ summary: 'Get chapter generation status' })
  @ApiResponse({ status: 200, description: 'Returns generation job status' })
  async getGenerationStatus(@Param('storyId') storyId: string) {
    return this.adminService.getGenerationStatus(storyId);
  }

  @Post('stories/:storyId/close-betting')
  @ApiOperation({ summary: 'Close current betting period for a story' })
  @ApiResponse({ status: 200, description: 'Betting closed' })
  async closeBetting(@Param('storyId') storyId: string) {
    return this.adminService.closeCurrentBetting(storyId);
  }

  @Get('stories/:storyId/context')
  @ApiOperation({ summary: 'Get AI context for a story' })
  @ApiResponse({ status: 200, description: 'Returns story context for AI generation' })
  async getStoryContext(@Param('storyId') storyId: string) {
    return this.adminService.getStoryContext(storyId);
  }

  @Delete('stories/:storyId')
  @ApiOperation({ summary: 'Delete a story and all related data' })
  @ApiResponse({ status: 200, description: 'Story deleted' })
  async deleteStory(@Param('storyId') storyId: string) {
    return this.adminService.deleteStory(storyId);
  }
}
