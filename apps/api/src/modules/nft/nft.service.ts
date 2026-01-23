import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type EntityType = 'character' | 'item' | 'location' | 'monster';

@Injectable()
export class NftService {
  constructor(private prisma: PrismaService) {}

  async getStoryNfts(storyId: string) {
    const [characters, items, locations, monsters] = await Promise.all([
      this.prisma.character.findMany({
        where: {
          story: { OR: [{ id: storyId }, { slug: storyId }] },
          nftMinted: true,
        },
        select: {
          id: true,
          name: true,
          imageUrl: true,
          nftTokenId: true,
          nftIpfsUri: true,
          firstAppearance: true,
        },
      }),
      this.prisma.item.findMany({
        where: {
          story: { OR: [{ id: storyId }, { slug: storyId }] },
          nftMinted: true,
        },
        select: {
          id: true,
          name: true,
          imageUrl: true,
          type: true,
          rarity: true,
          nftTokenId: true,
          nftIpfsUri: true,
          firstAppearance: true,
        },
      }),
      this.prisma.location.findMany({
        where: {
          story: { OR: [{ id: storyId }, { slug: storyId }] },
          nftMinted: true,
        },
        select: {
          id: true,
          name: true,
          imageUrl: true,
          type: true,
          nftTokenId: true,
          nftIpfsUri: true,
          firstAppearance: true,
        },
      }),
      this.prisma.monster.findMany({
        where: {
          story: { OR: [{ id: storyId }, { slug: storyId }] },
          nftMinted: true,
        },
        select: {
          id: true,
          name: true,
          imageUrl: true,
          threatLevel: true,
          nftTokenId: true,
          nftIpfsUri: true,
          firstAppearance: true,
        },
      }),
    ]);

    return {
      characters: characters.map((c) => ({ ...c, entityType: 'character' })),
      items: items.map((i) => ({ ...i, entityType: 'item' })),
      locations: locations.map((l) => ({ ...l, entityType: 'location' })),
      monsters: monsters.map((m) => ({ ...m, entityType: 'monster' })),
      total: characters.length + items.length + locations.length + monsters.length,
    };
  }

  async getNftByTokenId(tokenId: string) {
    // Search all entity types for this token ID
    const character = await this.prisma.character.findFirst({
      where: { nftTokenId: tokenId },
      include: { story: { select: { id: true, title: true, slug: true } } },
    });
    if (character) {
      return { ...character, entityType: 'character' };
    }

    const item = await this.prisma.item.findFirst({
      where: { nftTokenId: tokenId },
      include: { story: { select: { id: true, title: true, slug: true } } },
    });
    if (item) {
      return { ...item, entityType: 'item' };
    }

    const location = await this.prisma.location.findFirst({
      where: { nftTokenId: tokenId },
      include: { story: { select: { id: true, title: true, slug: true } } },
    });
    if (location) {
      return { ...location, entityType: 'location' };
    }

    const monster = await this.prisma.monster.findFirst({
      where: { nftTokenId: tokenId },
      include: { story: { select: { id: true, title: true, slug: true } } },
    });
    if (monster) {
      return { ...monster, entityType: 'monster' };
    }

    throw new NotFoundException('NFT not found');
  }

  async getUnmintedEntities(storyId: string) {
    const [characters, items, locations, monsters] = await Promise.all([
      this.prisma.character.findMany({
        where: {
          story: { OR: [{ id: storyId }, { slug: storyId }] },
          nftMinted: false,
        },
      }),
      this.prisma.item.findMany({
        where: {
          story: { OR: [{ id: storyId }, { slug: storyId }] },
          nftMinted: false,
        },
      }),
      this.prisma.location.findMany({
        where: {
          story: { OR: [{ id: storyId }, { slug: storyId }] },
          nftMinted: false,
        },
      }),
      this.prisma.monster.findMany({
        where: {
          story: { OR: [{ id: storyId }, { slug: storyId }] },
          nftMinted: false,
        },
      }),
    ]);

    return { characters, items, locations, monsters };
  }

  async markAsMinted(
    entityType: EntityType,
    entityId: string,
    tokenId: string,
    ipfsUri: string,
  ) {
    const updateData = {
      nftMinted: true,
      nftTokenId: tokenId,
      nftIpfsUri: ipfsUri,
    };

    switch (entityType) {
      case 'character':
        return this.prisma.character.update({
          where: { id: entityId },
          data: updateData,
        });
      case 'item':
        return this.prisma.item.update({
          where: { id: entityId },
          data: updateData,
        });
      case 'location':
        return this.prisma.location.update({
          where: { id: entityId },
          data: updateData,
        });
      case 'monster':
        return this.prisma.monster.update({
          where: { id: entityId },
          data: updateData,
        });
      default:
        throw new Error('Invalid entity type');
    }
  }

  async getNftStats(storyId: string) {
    const [
      totalCharacters,
      mintedCharacters,
      totalItems,
      mintedItems,
      totalLocations,
      mintedLocations,
      totalMonsters,
      mintedMonsters,
    ] = await Promise.all([
      this.prisma.character.count({
        where: { story: { OR: [{ id: storyId }, { slug: storyId }] } },
      }),
      this.prisma.character.count({
        where: {
          story: { OR: [{ id: storyId }, { slug: storyId }] },
          nftMinted: true,
        },
      }),
      this.prisma.item.count({
        where: { story: { OR: [{ id: storyId }, { slug: storyId }] } },
      }),
      this.prisma.item.count({
        where: {
          story: { OR: [{ id: storyId }, { slug: storyId }] },
          nftMinted: true,
        },
      }),
      this.prisma.location.count({
        where: { story: { OR: [{ id: storyId }, { slug: storyId }] } },
      }),
      this.prisma.location.count({
        where: {
          story: { OR: [{ id: storyId }, { slug: storyId }] },
          nftMinted: true,
        },
      }),
      this.prisma.monster.count({
        where: { story: { OR: [{ id: storyId }, { slug: storyId }] } },
      }),
      this.prisma.monster.count({
        where: {
          story: { OR: [{ id: storyId }, { slug: storyId }] },
          nftMinted: true,
        },
      }),
    ]);

    return {
      characters: { total: totalCharacters, minted: mintedCharacters },
      items: { total: totalItems, minted: mintedItems },
      locations: { total: totalLocations, minted: mintedLocations },
      monsters: { total: totalMonsters, minted: mintedMonsters },
      totalMinted: mintedCharacters + mintedItems + mintedLocations + mintedMonsters,
      totalEntities: totalCharacters + totalItems + totalLocations + totalMonsters,
    };
  }
}
