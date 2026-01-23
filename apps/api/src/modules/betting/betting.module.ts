import { Module } from '@nestjs/common';
import { BettingService } from './betting.service';
import { BettingController } from './betting.controller';
import { BlockchainService } from './services/blockchain.service';

@Module({
  controllers: [BettingController],
  providers: [BettingService, BlockchainService],
  exports: [BettingService],
})
export class BettingModule {}
