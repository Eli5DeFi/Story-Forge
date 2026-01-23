import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NftService } from './nft.service';

@ApiTags('nfts')
@Controller('nfts')
export class NftController {
  constructor(private nftService: NftService) {}

  @Get('story/:storyId')
  @ApiOperation({ summary: 'Get all NFTs for a story' })
  @ApiResponse({ status: 200, description: 'Returns all minted NFTs' })
  async getStoryNfts(@Param('storyId') storyId: string) {
    return this.nftService.getStoryNfts(storyId);
  }

  @Get('token/:tokenId')
  @ApiOperation({ summary: 'Get NFT by token ID' })
  @ApiResponse({ status: 200, description: 'Returns NFT metadata' })
  @ApiResponse({ status: 404, description: 'NFT not found' })
  async getNftByTokenId(@Param('tokenId') tokenId: string) {
    return this.nftService.getNftByTokenId(tokenId);
  }

  @Get('story/:storyId/stats')
  @ApiOperation({ summary: 'Get NFT minting statistics' })
  @ApiResponse({ status: 200, description: 'Returns minting stats' })
  async getNftStats(@Param('storyId') storyId: string) {
    return this.nftService.getNftStats(storyId);
  }

  @Get('story/:storyId/unminted')
  @ApiOperation({ summary: 'Get entities not yet minted as NFTs' })
  @ApiResponse({ status: 200, description: 'Returns unminted entities' })
  async getUnmintedEntities(@Param('storyId') storyId: string) {
    return this.nftService.getUnmintedEntities(storyId);
  }
}
