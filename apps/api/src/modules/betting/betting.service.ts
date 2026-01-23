import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TokenType, PoolStatus, BetStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const FEE_PERCENTAGE = 0.02; // 2%
const WINNER_PERCENTAGE = 0.85; // 85%
const TREASURY_PERCENTAGE = 0.15; // 15%

@Injectable()
export class BettingService {
  constructor(private prisma: PrismaService) {}

  async getActivePools(storyId?: string) {
    return this.prisma.bettingPool.findMany({
      where: {
        status: PoolStatus.OPEN,
        ...(storyId && {
          chapter: {
            story: { OR: [{ id: storyId }, { slug: storyId }] },
          },
        }),
      },
      include: {
        outcome: {
          select: {
            id: true,
            optionNumber: true,
            teaserText: true,
            emotionalTone: true,
          },
        },
        chapter: {
          select: {
            id: true,
            chapterNumber: true,
            title: true,
            bettingEndsAt: true,
            story: {
              select: { id: true, title: true, slug: true },
            },
          },
        },
      },
    });
  }

  async getPoolDetails(poolId: string) {
    const pool = await this.prisma.bettingPool.findUnique({
      where: { id: poolId },
      include: {
        outcome: true,
        chapter: {
          include: {
            outcomes: {
              include: { bettingPool: true },
            },
          },
        },
        userBets: {
          select: {
            userId: true,
            amount: true,
            tokenType: true,
          },
        },
      },
    });

    if (!pool) {
      throw new NotFoundException('Pool not found');
    }

    return pool;
  }

  async placeBet(
    userId: string,
    outcomeId: string,
    amount: number,
    tokenType: TokenType,
    txHash: string,
  ) {
    // Get the pool for this outcome
    const pool = await this.prisma.bettingPool.findUnique({
      where: { outcomeId },
      include: {
        chapter: true,
      },
    });

    if (!pool) {
      throw new NotFoundException('Betting pool not found for this outcome');
    }

    if (pool.status !== PoolStatus.OPEN) {
      throw new BadRequestException('Betting is closed for this pool');
    }

    if (pool.chapter.bettingEndsAt && new Date() > pool.chapter.bettingEndsAt) {
      throw new BadRequestException('Betting period has ended');
    }

    // Calculate fee
    const fee = amount * FEE_PERCENTAGE;
    const netAmount = amount - fee;

    // Create bet and update pool in transaction
    const [bet] = await this.prisma.$transaction([
      // Create user bet
      this.prisma.userBet.create({
        data: {
          userId,
          outcomeId,
          poolId: pool.id,
          amount: new Decimal(netAmount),
          tokenType,
          feePaid: new Decimal(fee),
          txHash,
          status: BetStatus.CONFIRMED,
        },
      }),

      // Update pool totals
      this.prisma.bettingPool.update({
        where: { id: pool.id },
        data: {
          ...(tokenType === TokenType.USDC
            ? { totalAmountUsdc: { increment: netAmount } }
            : { totalAmountUsdt: { increment: netAmount } }),
          voterCount: { increment: 1 },
        },
      }),

      // Update user stats
      this.prisma.user.update({
        where: { id: userId },
        data: {
          totalWagered: { increment: amount },
        },
      }),

      // Record treasury fee
      this.prisma.treasuryEntry.create({
        data: {
          poolId: pool.id,
          amount: new Decimal(fee),
          tokenType,
          source: 'fee',
          txHash,
        },
      }),
    ]);

    return {
      betId: bet.id,
      amount: netAmount,
      feeDeducted: fee,
      poolId: pool.id,
    };
  }

  async getUserBets(userId: string, status?: BetStatus) {
    return this.prisma.userBet.findMany({
      where: {
        userId,
        ...(status && { status }),
      },
      include: {
        outcome: {
          select: {
            optionNumber: true,
            teaserText: true,
            isSelected: true,
          },
        },
        pool: {
          select: {
            status: true,
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

  async resolvePool(chapterId: string, winningOutcomeId: string) {
    // Get all pools for this chapter
    const pools = await this.prisma.bettingPool.findMany({
      where: { chapterId },
      include: {
        outcome: true,
        userBets: {
          where: { status: BetStatus.CONFIRMED },
          include: { user: true },
        },
      },
    });

    const winningPool = pools.find(p => p.outcomeId === winningOutcomeId);
    if (!winningPool) {
      throw new NotFoundException('Winning outcome pool not found');
    }

    // Calculate total prize pool
    const totalUsdc = pools.reduce(
      (sum, p) => sum + Number(p.totalAmountUsdc) + Number(p.carryoverUsdc),
      0,
    );
    const totalUsdt = pools.reduce(
      (sum, p) => sum + Number(p.totalAmountUsdt) + Number(p.carryoverUsdt),
      0,
    );

    const winningAmountUsdc = Number(winningPool.totalAmountUsdc);
    const winningAmountUsdt = Number(winningPool.totalAmountUsdt);

    // Check if anyone bet on winning outcome
    const hasWinners = winningPool.userBets.length > 0;

    if (!hasWinners) {
      // Carry over to next chapter's pools
      // Mark pools as carried over
      await this.prisma.bettingPool.updateMany({
        where: { chapterId },
        data: {
          status: PoolStatus.CARRIED_OVER,
          resolvedAt: new Date(),
        },
      });

      return {
        hasWinners: false,
        carryoverUsdc: totalUsdc,
        carryoverUsdt: totalUsdt,
      };
    }

    // Calculate payouts
    const winnerPoolUsdc = totalUsdc * WINNER_PERCENTAGE;
    const winnerPoolUsdt = totalUsdt * WINNER_PERCENTAGE;
    const treasuryUsdc = totalUsdc * TREASURY_PERCENTAGE;
    const treasuryUsdt = totalUsdt * TREASURY_PERCENTAGE;

    // Create payouts for winners
    const payouts = [];
    for (const bet of winningPool.userBets) {
      const shareUsdc = winningAmountUsdc > 0
        ? (Number(bet.amount) / winningAmountUsdc) * winnerPoolUsdc
        : 0;
      const shareUsdt = winningAmountUsdt > 0
        ? (Number(bet.amount) / winningAmountUsdt) * winnerPoolUsdt
        : 0;

      if (bet.tokenType === TokenType.USDC && shareUsdc > 0) {
        payouts.push({
          userId: bet.userId,
          poolId: winningPool.id,
          amount: new Decimal(shareUsdc),
          tokenType: TokenType.USDC,
        });
      }
      if (bet.tokenType === TokenType.USDT && shareUsdt > 0) {
        payouts.push({
          userId: bet.userId,
          poolId: winningPool.id,
          amount: new Decimal(shareUsdt),
          tokenType: TokenType.USDT,
        });
      }
    }

    // Update database
    await this.prisma.$transaction([
      // Mark winning bets
      this.prisma.userBet.updateMany({
        where: {
          poolId: winningPool.id,
          status: BetStatus.CONFIRMED,
        },
        data: { status: BetStatus.WON },
      }),

      // Mark losing bets
      this.prisma.userBet.updateMany({
        where: {
          poolId: { in: pools.filter(p => p.id !== winningPool.id).map(p => p.id) },
          status: BetStatus.CONFIRMED,
        },
        data: { status: BetStatus.LOST },
      }),

      // Update pool status
      this.prisma.bettingPool.updateMany({
        where: { chapterId },
        data: {
          status: PoolStatus.RESOLVED,
          resolvedAt: new Date(),
        },
      }),

      // Create payouts
      this.prisma.payout.createMany({
        data: payouts,
      }),

      // Record treasury cuts
      ...(treasuryUsdc > 0
        ? [
            this.prisma.treasuryEntry.create({
              data: {
                poolId: winningPool.id,
                amount: new Decimal(treasuryUsdc),
                tokenType: TokenType.USDC,
                source: 'treasury_cut',
              },
            }),
          ]
        : []),
      ...(treasuryUsdt > 0
        ? [
            this.prisma.treasuryEntry.create({
              data: {
                poolId: winningPool.id,
                amount: new Decimal(treasuryUsdt),
                tokenType: TokenType.USDT,
                source: 'treasury_cut',
              },
            }),
          ]
        : []),

      // Update winner streaks
      ...winningPool.userBets.map(bet =>
        this.prisma.user.update({
          where: { id: bet.userId },
          data: {
            totalWon: { increment: Number(bet.amount) * (WINNER_PERCENTAGE / (winningAmountUsdc + winningAmountUsdt)) * (totalUsdc + totalUsdt) },
            winStreak: { increment: 1 },
          },
        }),
      ),
    ]);

    return {
      hasWinners: true,
      winnerCount: winningPool.userBets.length,
      totalDistributed: winnerPoolUsdc + winnerPoolUsdt,
      treasuryCut: treasuryUsdc + treasuryUsdt,
    };
  }

  async claimWinnings(userId: string, poolId: string) {
    const payouts = await this.prisma.payout.findMany({
      where: {
        userId,
        poolId,
        status: 'PENDING',
      },
    });

    if (payouts.length === 0) {
      throw new NotFoundException('No pending payouts found');
    }

    // In production, this would trigger blockchain payout
    // For now, just mark as completed
    await this.prisma.payout.updateMany({
      where: {
        id: { in: payouts.map(p => p.id) },
      },
      data: {
        status: 'COMPLETED',
        paidAt: new Date(),
      },
    });

    // Update user bets as claimed
    await this.prisma.userBet.updateMany({
      where: {
        userId,
        poolId,
        status: BetStatus.WON,
      },
      data: {
        status: BetStatus.CLAIMED,
        claimedAt: new Date(),
      },
    });

    return {
      claimed: payouts.reduce((sum, p) => sum + Number(p.amount), 0),
      payoutCount: payouts.length,
    };
  }

  async createPoolsForChapter(chapterId: string) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { outcomes: true },
    });

    if (!chapter) {
      throw new NotFoundException('Chapter not found');
    }

    // Create a betting pool for each outcome
    const pools = await this.prisma.bettingPool.createMany({
      data: chapter.outcomes.map(outcome => ({
        chapterId,
        outcomeId: outcome.id,
        status: PoolStatus.OPEN,
      })),
    });

    return pools;
  }
}
