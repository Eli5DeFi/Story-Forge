import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { StoryService } from './story.service';
import { StoryStatus } from '@prisma/client';

@ApiTags('stories')
@Controller('stories')
export class StoryController {
  constructor(private storyService: StoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get all stories' })
  @ApiQuery({ name: 'status', enum: StoryStatus, required: false })
  @ApiResponse({ status: 200, description: 'Returns list of stories' })
  async findAll(@Query('status') status?: StoryStatus) {
    return this.storyService.findAll(status);
  }

  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Get a story by ID or slug' })
  @ApiResponse({ status: 200, description: 'Returns story details' })
  @ApiResponse({ status: 404, description: 'Story not found' })
  async findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.storyService.findOne(idOrSlug);
  }

  @Get(':idOrSlug/chapters')
  @ApiOperation({ summary: 'Get all chapters for a story' })
  @ApiResponse({ status: 200, description: 'Returns list of chapters' })
  async getChapters(@Param('idOrSlug') idOrSlug: string) {
    return this.storyService.getChaptersList(idOrSlug);
  }

  @Get(':idOrSlug/chapters/:chapterNumber')
  @ApiOperation({ summary: 'Get a specific chapter' })
  @ApiResponse({ status: 200, description: 'Returns chapter with outcomes' })
  @ApiResponse({ status: 404, description: 'Chapter not found' })
  async getChapter(
    @Param('idOrSlug') idOrSlug: string,
    @Param('chapterNumber', ParseIntPipe) chapterNumber: number,
  ) {
    return this.storyService.getChapter(idOrSlug, chapterNumber);
  }

  @Get(':idOrSlug/betting')
  @ApiOperation({ summary: 'Get current betting chapter' })
  @ApiResponse({ status: 200, description: 'Returns chapter with active betting' })
  async getCurrentBetting(@Param('idOrSlug') idOrSlug: string) {
    return this.storyService.getCurrentBettingChapter(idOrSlug);
  }
}
