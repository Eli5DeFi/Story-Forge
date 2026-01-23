import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            bets: true,
            payouts: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, data: { username?: string; avatarUrl?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  async getStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        totalWagered: true,
        totalWon: true,
        winStreak: true,
        bestStreak: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get additional stats
    const [totalBets, wonBets, lostBets] = await Promise.all([
      this.prisma.userBet.count({ where: { userId } }),
      this.prisma.userBet.count({ where: { userId, status: 'WON' } }),
      this.prisma.userBet.count({ where: { userId, status: 'LOST' } }),
    ]);

    const winRate = totalBets > 0 ? (wonBets / totalBets) * 100 : 0;
    const profitLoss = Number(user.totalWon) - Number(user.totalWagered);

    return {
      totalWagered: user.totalWagered,
      totalWon: user.totalWon,
      profitLoss,
      winStreak: user.winStreak,
      bestStreak: user.bestStreak,
      totalBets,
      wonBets,
      lostBets,
      winRate: Math.round(winRate * 100) / 100,
    };
  }

  async getBettingHistory(userId: string, options?: { limit?: number; offset?: number }) {
    return this.prisma.userBet.findMany({
      where: { userId },
      include: {
        outcome: {
          select: {
            optionNumber: true,
            teaserText: true,
            isSelected: true,
          },
        },
        pool: {
          include: {
            chapter: {
              select: {
                chapterNumber: true,
                title: true,
                story: { select: { title: true, slug: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 50,
      skip: options?.offset,
    });
  }

  async getPayoutHistory(userId: string) {
    return this.prisma.payout.findMany({
      where: { userId },
      include: {
        pool: {
          include: {
            chapter: {
              select: {
                chapterNumber: true,
                title: true,
                story: { select: { title: true, slug: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getLeaderboard(limit: number = 20) {
    return this.prisma.user.findMany({
      where: {
        totalWon: { gt: 0 },
      },
      select: {
        id: true,
        walletAddress: true,
        username: true,
        avatarUrl: true,
        totalWagered: true,
        totalWon: true,
        winStreak: true,
        bestStreak: true,
      },
      orderBy: [{ totalWon: 'desc' }, { bestStreak: 'desc' }],
      take: limit,
    });
  }

  async getLeaderboardByWinRate(limit: number = 20) {
    // Get users with at least 10 bets
    const users = await this.prisma.user.findMany({
      where: {
        bets: {
          some: {},
        },
      },
      include: {
        _count: {
          select: {
            bets: {
              where: { status: { in: ['WON', 'LOST', 'CLAIMED'] } },
            },
          },
        },
        bets: {
          where: { status: 'WON' },
          select: { id: true },
        },
      },
    });

    // Calculate win rates and filter
    const usersWithWinRate = users
      .filter((u) => u._count.bets >= 10) // Minimum 10 bets
      .map((u) => ({
        id: u.id,
        walletAddress: u.walletAddress,
        username: u.username,
        avatarUrl: u.avatarUrl,
        totalBets: u._count.bets,
        wonBets: u.bets.length,
        winRate: (u.bets.length / u._count.bets) * 100,
      }))
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, limit);

    return usersWithWinRate;
  }
}
