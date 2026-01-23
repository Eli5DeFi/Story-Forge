import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BlockchainService } from './blockchain.service';
import { BettingContractService } from './betting-contract.service';
import { NFTContractService } from './nft-contract.service';

@Module({
  imports: [ConfigModule],
  providers: [BlockchainService, BettingContractService, NFTContractService],
  exports: [BlockchainService, BettingContractService, NFTContractService],
})
export class BlockchainModule {}
