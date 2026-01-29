import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SocialService, ShareContent } from './social.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Social')
@Controller('social')
export class SocialController {
  private readonly logger = new Logger(SocialController.name);

  constructor(private readonly socialService: SocialService) {}

  @Post('share/generate')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Generate shareable content for social media' })
  @ApiResponse({ status: 200, description: 'Share content generated successfully' })
  async generateShareContent(
    @Req() req: any,
    @Body() body: {
      type: ShareContent['type'];
      metadata: any;
    }
  ) {
    const userId = req.user.id;
    
    try {
      const shareContent = await this.socialService.generateShareContent(
        userId,
        body.type,
        body.metadata
      );

      return {
        success: true,
        data: shareContent,
        shareUrls: {
          twitter: this.generateTwitterShareUrl(shareContent),
          discord: this.generateDiscordShareContent(shareContent),
          reddit: this.generateRedditShareUrl(shareContent),
          general: this.generateGeneralShareText(shareContent),
        }
      };
    } catch (error) {
      this.logger.error(`Error generating share content: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('viral/:shareId/track')
  @ApiOperation({ summary: 'Track viral moment metrics' })
  @ApiResponse({ status: 200, description: 'Viral moment tracked successfully' })
  async trackViralMoment(
    @Param('shareId') shareId: string,
    @Body() body: {
      action: 'share' | 'view' | 'engagement';
      platform?: string;
    }
  ) {
    try {
      const viralMoment = await this.socialService.trackViralMoment(
        shareId,
        body.action,
        body.platform
      );

      return {
        success: true,
        data: {
          viralScore: viralMoment.viralScore,
          shares: viralMoment.shares,
          views: viralMoment.views,
          engagements: viralMoment.engagements,
        }
      };
    } catch (error) {
      this.logger.error(`Error tracking viral moment: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('referral/process')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Process referral for new user signup' })
  @ApiResponse({ status: 200, description: 'Referral processed successfully' })
  async processReferral(
    @Req() req: any,
    @Body() body: { referralCode: string }
  ) {
    const newUserId = req.user.id;
    
    try {
      const reward = await this.socialService.processReferral(
        body.referralCode,
        newUserId
      );

      if (!reward) {
        return {
          success: false,
          message: 'Invalid referral code or user already referred',
        };
      }

      return {
        success: true,
        data: reward,
        message: `Welcome! Your referrer will receive ${reward.rewardAmount} $STORY tokens.`,
      };
    } catch (error) {
      this.logger.error(`Error processing referral: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('referral/code')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get or generate user referral code' })
  @ApiResponse({ status: 200, description: 'Referral code retrieved successfully' })
  async getReferralCode(@Req() req: any) {
    const userId = req.user.id;
    
    try {
      const referralCode = await this.socialService.generateReferralCode(userId);

      return {
        success: true,
        data: {
          referralCode,
          shareUrl: `https://storyforge.ai?ref=${referralCode}`,
          message: 'Invite friends and earn $STORY tokens!',
        }
      };
    } catch (error) {
      this.logger.error(`Error getting referral code: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get social activity leaderboard' })
  @ApiResponse({ status: 200, description: 'Leaderboard retrieved successfully' })
  async getLeaderboard(
    @Query('period') period?: 'day' | 'week' | 'month'
  ) {
    try {
      const leaderboard = await this.socialService.getSocialLeaderboard(period);

      return {
        success: true,
        data: leaderboard,
        period: period || 'week',
      };
    } catch (error) {
      this.logger.error(`Error getting leaderboard: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user social stats' })
  @ApiResponse({ status: 200, description: 'Social stats retrieved successfully' })
  async getUserStats(@Req() req: any) {
    const userId = req.user.id;
    
    try {
      const stats = await this.socialService.getUserSocialStats(userId);

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      this.logger.error(`Error getting user stats: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Helper methods for generating platform-specific share URLs

  private generateTwitterShareUrl(content: ShareContent): string {
    const text = `${content.title}\n\n${content.description}\n\n#StoryForge #Web3 #AI`;
    const url = content.storyId 
      ? `https://storyforge.ai/stories/${content.storyId}`
      : 'https://storyforge.ai';
    
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  }

  private generateDiscordShareContent(content: ShareContent): any {
    return {
      title: content.title,
      description: content.description,
      url: content.storyId 
        ? `https://storyforge.ai/stories/${content.storyId}`
        : 'https://storyforge.ai',
      color: 0x6366f1, // Indigo color
      thumbnail: {
        url: content.imageUrl || 'https://storyforge.ai/logo.png',
      },
      fields: [
        {
          name: 'Join the Action',
          value: 'Make your predictions and earn $STORY tokens!',
          inline: false,
        }
      ],
    };
  }

  private generateRedditShareUrl(content: ShareContent): string {
    const title = content.title;
    const url = content.storyId 
      ? `https://storyforge.ai/stories/${content.storyId}`
      : 'https://storyforge.ai';
    
    return `https://reddit.com/submit?title=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  }

  private generateGeneralShareText(content: ShareContent): string {
    const url = content.storyId 
      ? `https://storyforge.ai/stories/${content.storyId}`
      : 'https://storyforge.ai';
    
    return `${content.title}\n\n${content.description}\n\nJoin me on Story-Forge: ${url}`;
  }
}