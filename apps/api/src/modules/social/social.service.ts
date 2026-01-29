import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

export interface ShareContent {
  type: 'prediction' | 'story_outcome' | 'achievement' | 'creator_milestone';
  title: string;
  description: string;
  imageUrl?: string;
  storyId?: number;
  chapterId?: number;
  outcomeId?: number;
  userId: number;
}

export interface ViralMoment {
  id: string;
  content: ShareContent;
  shares: number;
  views: number;
  engagements: number;
  viralScore: number;
  createdAt: Date;
}

export interface ReferralReward {
  userId: number;
  referredUserId: number;
  rewardType: 'tokens' | 'premium_access' | 'nft';
  rewardAmount: number;
  claimed: boolean;
}

@Injectable()
export class SocialService {
  private readonly logger = new Logger(SocialService.name);
  private readonly VIRAL_SCORE_THRESHOLD = 100;
  private readonly REFERRAL_BONUS = 50; // $STORY tokens

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  /**
   * Generate shareable content for social media platforms
   */
  async generateShareContent(
    userId: number,
    type: ShareContent['type'],
    metadata: any,
  ): Promise<ShareContent> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { walletAddress: true, username: true },
    });

    const username = user?.username || `${user?.walletAddress?.slice(0, 6)}...`;

    let content: ShareContent;

    switch (type) {
      case 'prediction':
        content = {
          type,
          userId,
          title: `🔮 ${username} predicted: "${metadata.outcomeTitle}"`,
          description: `Will this prediction come true in "${metadata.storyTitle}"? Join the betting pool and see if you can beat them! 💰`,
          imageUrl: metadata.storyImageUrl,
          storyId: metadata.storyId,
          chapterId: metadata.chapterId,
          outcomeId: metadata.outcomeId,
        };
        break;

      case 'story_outcome':
        content = {
          type,
          userId,
          title: `⚡ OUTCOME REVEALED: "${metadata.outcomeTitle}"`,
          description: `The AI has chosen! ${metadata.winnersCount} players won ${metadata.totalPayout} $STORY tokens. Read the new chapter now! 📚`,
          imageUrl: metadata.outcomeImageUrl,
          storyId: metadata.storyId,
          chapterId: metadata.chapterId,
        };
        break;

      case 'achievement':
        content = {
          type,
          userId,
          title: `🏆 ${username} achieved: ${metadata.achievementTitle}`,
          description: `${metadata.achievementDescription} Join Story-Forge to earn your own achievements! 🎮`,
          imageUrl: metadata.badgeImageUrl,
        };
        break;

      case 'creator_milestone':
        content = {
          type,
          userId,
          title: `🎨 Creator Milestone: ${metadata.milestoneTitle}`,
          description: `${username}'s story "${metadata.storyTitle}" just hit ${metadata.milestone}! Congratulations! 🎉`,
          imageUrl: metadata.storyImageUrl,
          storyId: metadata.storyId,
        };
        break;

      default:
        throw new Error(`Unsupported share content type: ${type}`);
    }

    // Store in cache for quick retrieval
    await this.redis.setex(
      `share_content:${userId}:${Date.now()}`,
      3600, // 1 hour TTL
      JSON.stringify(content),
    );

    return content;
  }

  /**
   * Track viral moments and calculate viral scores
   */
  async trackViralMoment(
    shareId: string,
    action: 'share' | 'view' | 'engagement',
    platform?: string,
  ): Promise<ViralMoment> {
    const key = `viral:${shareId}`;
    
    // Get existing viral moment or create new one
    let viralMoment = await this.redis.get(key);
    let viralData: ViralMoment;

    if (!viralMoment) {
      viralData = {
        id: shareId,
        content: null, // Will be populated if needed
        shares: 0,
        views: 0,
        engagements: 0,
        viralScore: 0,
        createdAt: new Date(),
      };
    } else {
      viralData = JSON.parse(viralMoment);
    }

    // Update metrics
    switch (action) {
      case 'share':
        viralData.shares += 1;
        break;
      case 'view':
        viralData.views += 1;
        break;
      case 'engagement':
        viralData.engagements += 1;
        break;
    }

    // Calculate viral score (weighted formula)
    viralData.viralScore = 
      viralData.shares * 10 + 
      viralData.views * 1 + 
      viralData.engagements * 5;

    // Store updated metrics
    await this.redis.setex(key, 86400 * 7, JSON.stringify(viralData)); // 7 days

    // Check if it's gone viral and needs special handling
    if (viralData.viralScore >= this.VIRAL_SCORE_THRESHOLD) {
      await this.handleViralMoment(viralData);
    }

    // Log platform-specific analytics
    if (platform) {
      await this.redis.incr(`analytics:${platform}:${action}:${new Date().toISOString().split('T')[0]}`);
    }

    this.logger.log(`Viral moment tracked: ${shareId} - ${action} - Score: ${viralData.viralScore}`);
    
    return viralData;
  }

  /**
   * Process referrals and distribute rewards
   */
  async processReferral(
    referrerCode: string,
    newUserId: number,
  ): Promise<ReferralReward | null> {
    try {
      // Find referrer by code
      const referrer = await this.prisma.user.findUnique({
        where: { referralCode: referrerCode },
        select: { id: true, walletAddress: true },
      });

      if (!referrer) {
        this.logger.warn(`Invalid referral code: ${referrerCode}`);
        return null;
      }

      // Check if user was already referred
      const existingReferral = await this.prisma.referral.findFirst({
        where: { referredUserId: newUserId },
      });

      if (existingReferral) {
        this.logger.warn(`User ${newUserId} already has a referral`);
        return null;
      }

      // Create referral record
      const referral = await this.prisma.referral.create({
        data: {
          referrerId: referrer.id,
          referredUserId: newUserId,
          rewardType: 'tokens',
          rewardAmount: this.REFERRAL_BONUS,
          claimed: false,
        },
      });

      // Queue reward distribution (will be processed by background job)
      await this.redis.lpush(
        'referral_rewards_queue',
        JSON.stringify({
          referralId: referral.id,
          referrerId: referrer.id,
          referredUserId: newUserId,
          rewardAmount: this.REFERRAL_BONUS,
        }),
      );

      const reward: ReferralReward = {
        userId: referrer.id,
        referredUserId: newUserId,
        rewardType: 'tokens',
        rewardAmount: this.REFERRAL_BONUS,
        claimed: false,
      };

      this.logger.log(`Referral processed: ${referrer.id} -> ${newUserId}`);
      
      return reward;
    } catch (error) {
      this.logger.error(`Error processing referral: ${error.message}`);
      return null;
    }
  }

  /**
   * Generate unique referral code for user
   */
  async generateReferralCode(userId: number): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { walletAddress: true, referralCode: true },
    });

    if (user?.referralCode) {
      return user.referralCode;
    }

    // Generate unique code
    const baseCode = user?.walletAddress?.slice(2, 8).toUpperCase() || 
                     Math.random().toString(36).substr(2, 6).toUpperCase();
    
    let referralCode = baseCode;
    let attempts = 0;
    
    while (attempts < 10) {
      const existing = await this.prisma.user.findFirst({
        where: { referralCode },
      });
      
      if (!existing) break;
      
      referralCode = `${baseCode}${attempts + 1}`;
      attempts++;
    }

    // Update user with referral code
    await this.prisma.user.update({
      where: { id: userId },
      data: { referralCode },
    });

    return referralCode;
  }

  /**
   * Get social leaderboard (most viral users)
   */
  async getSocialLeaderboard(period: 'day' | 'week' | 'month' = 'week'): Promise<any[]> {
    const periodDays = period === 'day' ? 1 : period === 'week' ? 7 : 30;
    const since = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

    // Get top users by viral score and referrals
    const topUsers = await this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        walletAddress: true,
        createdAt: true,
        _count: {
          select: {
            referrals: {
              where: { createdAt: { gte: since } },
            },
          },
        },
      },
      orderBy: [
        {
          referrals: { _count: 'desc' },
        },
      ],
      take: 50,
    });

    // Calculate viral scores from Redis
    const leaderboard = await Promise.all(
      topUsers.map(async (user) => {
        const viralScoreKey = `user_viral_score:${user.id}:${period}`;
        const viralScore = await this.redis.get(viralScoreKey) || '0';
        
        return {
          userId: user.id,
          username: user.username || `${user.walletAddress?.slice(0, 6)}...`,
          walletAddress: user.walletAddress,
          referrals: user._count.referrals,
          viralScore: parseInt(viralScore),
          totalScore: user._count.referrals * 100 + parseInt(viralScore),
        };
      })
    );

    return leaderboard
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 20);
  }

  /**
   * Get user's social stats
   */
  async getUserSocialStats(userId: number): Promise<any> {
    const [user, referralStats, viralScore] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          referralCode: true,
          _count: {
            select: {
              referrals: true,
            },
          },
        },
      }),
      this.prisma.referral.findMany({
        where: { referrerId: userId },
        select: {
          rewardAmount: true,
          claimed: true,
          createdAt: true,
        },
      }),
      this.redis.get(`user_viral_score:${userId}:week`) || '0',
    ]);

    const totalEarned = referralStats.reduce(
      (sum, ref) => sum + (ref.claimed ? ref.rewardAmount : 0),
      0
    );

    const pendingRewards = referralStats.reduce(
      (sum, ref) => sum + (!ref.claimed ? ref.rewardAmount : 0),
      0
    );

    return {
      referralCode: user?.referralCode,
      totalReferrals: user?._count.referrals || 0,
      totalEarned,
      pendingRewards,
      viralScore: parseInt(viralScore as string),
      recentReferrals: referralStats.slice(-10),
    };
  }

  /**
   * Private method to handle viral moments
   */
  private async handleViralMoment(viralMoment: ViralMoment): Promise<void> {
    this.logger.log(`🔥 VIRAL MOMENT DETECTED: ${viralMoment.id} - Score: ${viralMoment.viralScore}`);
    
    // Queue special rewards for viral content creators
    await this.redis.lpush(
      'viral_rewards_queue',
      JSON.stringify({
        momentId: viralMoment.id,
        viralScore: viralMoment.viralScore,
        timestamp: new Date().toISOString(),
      }),
    );

    // Update user's viral score
    if (viralMoment.content?.userId) {
      const currentScore = await this.redis.get(`user_viral_score:${viralMoment.content.userId}:week`) || '0';
      const newScore = parseInt(currentScore) + viralMoment.viralScore;
      await this.redis.setex(
        `user_viral_score:${viralMoment.content.userId}:week`,
        86400 * 7, // 7 days
        newScore.toString()
      );
    }
  }
}