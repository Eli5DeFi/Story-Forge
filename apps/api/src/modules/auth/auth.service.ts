import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SiweMessage } from 'siwe';
import { PrismaService } from '../prisma/prisma.service';

export interface AuthPayload {
  sub: string; // user id
  address: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async generateNonce(): Promise<string> {
    return Math.random().toString(36).substring(2, 15);
  }

  async verifySignature(
    message: string,
    signature: string,
  ): Promise<{ address: string }> {
    try {
      const siweMessage = new SiweMessage(message);
      const fields = await siweMessage.verify({ signature });

      if (!fields.success) {
        throw new UnauthorizedException('Invalid signature');
      }

      return { address: fields.data.address };
    } catch (error) {
      throw new UnauthorizedException('Failed to verify signature');
    }
  }

  async login(address: string): Promise<{ accessToken: string; user: any }> {
    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { walletAddress: address.toLowerCase() },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          walletAddress: address.toLowerCase(),
        },
      });
    }

    const payload: AuthPayload = {
      sub: user.id,
      address: user.walletAddress,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        username: user.username,
        avatarUrl: user.avatarUrl,
        totalWagered: user.totalWagered,
        totalWon: user.totalWon,
        winStreak: user.winStreak,
      },
    };
  }

  async validateUser(payload: AuthPayload): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
