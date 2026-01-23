import {
  Controller,
  Get,
  Patch,
  Body,
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
import { UserService } from './user.service';

class UpdateProfileDto {
  username?: string;
  avatarUrl?: string;
}

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Returns user profile' })
  async getProfile(@Request() req: any) {
    return this.userService.getProfile(req.user.id);
  }

  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Returns updated profile' })
  async updateProfile(@Request() req: any, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(req.user.id, dto);
  }

  @Get('me/stats')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user betting statistics' })
  @ApiResponse({ status: 200, description: 'Returns betting stats' })
  async getStats(@Request() req: any) {
    return this.userService.getStats(req.user.id);
  }

  @Get('me/bets')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user betting history' })
  @ApiResponse({ status: 200, description: 'Returns betting history' })
  async getBettingHistory(
    @Request() req: any,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.userService.getBettingHistory(req.user.id, { limit, offset });
  }

  @Get('me/payouts')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user payout history' })
  @ApiResponse({ status: 200, description: 'Returns payout history' })
  async getPayoutHistory(@Request() req: any) {
    return this.userService.getPayoutHistory(req.user.id);
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get global leaderboard' })
  @ApiResponse({ status: 200, description: 'Returns top users by winnings' })
  async getLeaderboard(@Query('limit') limit?: number) {
    return this.userService.getLeaderboard(limit);
  }

  @Get('leaderboard/winrate')
  @ApiOperation({ summary: 'Get leaderboard by win rate' })
  @ApiResponse({ status: 200, description: 'Returns top users by win rate' })
  async getLeaderboardByWinRate(@Query('limit') limit?: number) {
    return this.userService.getLeaderboardByWinRate(limit);
  }
}
