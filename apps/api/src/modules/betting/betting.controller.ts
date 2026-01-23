import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { BettingService } from './betting.service';
import { TokenType } from '@prisma/client';

class PlaceBetDto {
  outcomeId: string;
  amount: number;
  tokenType: TokenType;
  txHash: string;
}

@ApiTags('betting')
@Controller('betting')
export class BettingController {
  constructor(private bettingService: BettingService) {}

  @Get('pools')
  @ApiOperation({ summary: 'Get all active betting pools' })
  @ApiResponse({ status: 200, description: 'Returns active pools' })
  async getActivePools(@Query('storyId') storyId?: string) {
    return this.bettingService.getActivePools(storyId);
  }

  @Get('pools/:poolId')
  @ApiOperation({ summary: 'Get pool details with odds' })
  @ApiResponse({ status: 200, description: 'Returns pool details' })
  async getPoolDetails(@Param('poolId') poolId: string) {
    return this.bettingService.getPoolDetails(poolId);
  }

  @Post('bet')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Place a bet on an outcome' })
  @ApiResponse({ status: 201, description: 'Bet placed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid bet or betting closed' })
  async placeBet(@Request() req: any, @Body() dto: PlaceBetDto) {
    return this.bettingService.placeBet(
      req.user.id,
      dto.outcomeId,
      dto.amount,
      dto.tokenType,
      dto.txHash,
    );
  }

  @Get('user/bets')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get user's betting history" })
  @ApiResponse({ status: 200, description: "Returns user's bets" })
  async getUserBets(@Request() req: any) {
    return this.bettingService.getUserBets(req.user.id);
  }

  @Post('claim/:poolId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Claim winnings from a pool' })
  @ApiResponse({ status: 200, description: 'Winnings claimed' })
  @ApiResponse({ status: 404, description: 'No pending payouts' })
  async claimWinnings(@Request() req: any, @Param('poolId') poolId: string) {
    return this.bettingService.claimWinnings(req.user.id, poolId);
  }
}
