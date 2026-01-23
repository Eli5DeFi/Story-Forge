import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompendiumService {
  constructor(private prisma: PrismaService) {}

  // ============ Characters ============

  async getCharacters(storyId: string, options?: { limit?: number; offset?: number }) {
    return this.prisma.character.findMany({
      where: { story: { OR: [{ id: storyId }, { slug: storyId }] } },
      include: {
        relationshipsA: {
          include: { characterB: { select: { id: true, name: true, imageUrl: true } } },
        },
        relationshipsB: {
          include: { characterA: { select: { id: true, name: true, imageUrl: true } } },
        },
        ownedItems: { select: { id: true, name: true, type: true, rarity: true } },
      },
      orderBy: { firstAppearance: 'asc' },
      take: options?.limit,
      skip: options?.offset,
    });
  }

  async getCharacter(characterId: string) {
    const character = await this.prisma.character.findUnique({
      where: { id: characterId },
      include: {
        story: { select: { id: true, title: true, slug: true } },
        relationshipsA: {
          include: { characterB: true },
        },
        relationshipsB: {
          include: { characterA: true },
        },
        ownedItems: true,
      },
    });

    if (!character) {
      throw new NotFoundException('Character not found');
    }

    return character;
  }

  // ============ Items ============

  async getItems(storyId: string, type?: string) {
    return this.prisma.item.findMany({
      where: {
        story: { OR: [{ id: storyId }, { slug: storyId }] },
        ...(type && { type: type as any }),
      },
      include: {
        ownerCharacter: { select: { id: true, name: true, imageUrl: true } },
      },
      orderBy: { firstAppearance: 'asc' },
    });
  }

  async getItem(itemId: string) {
    const item = await this.prisma.item.findUnique({
      where: { id: itemId },
      include: {
        story: { select: { id: true, title: true, slug: true } },
        ownerCharacter: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    return item;
  }

  // ============ Locations ============

  async getLocations(storyId: string) {
    return this.prisma.location.findMany({
      where: { story: { OR: [{ id: storyId }, { slug: storyId }] } },
      orderBy: { firstAppearance: 'asc' },
    });
  }

  async getLocation(locationId: string) {
    const location = await this.prisma.location.findUnique({
      where: { id: locationId },
      include: {
        story: { select: { id: true, title: true, slug: true } },
      },
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    return location;
  }

  // ============ Monsters ============

  async getMonsters(storyId: string) {
    return this.prisma.monster.findMany({
      where: { story: { OR: [{ id: storyId }, { slug: storyId }] } },
      orderBy: [{ threatLevel: 'desc' }, { firstAppearance: 'asc' }],
    });
  }

  async getMonster(monsterId: string) {
    const monster = await this.prisma.monster.findUnique({
      where: { id: monsterId },
      include: {
        story: { select: { id: true, title: true, slug: true } },
      },
    });

    if (!monster) {
      throw new NotFoundException('Monster not found');
    }

    return monster;
  }

  // ============ Lore ============

  async getLoreEntries(storyId: string, category?: string) {
    return this.prisma.loreEntry.findMany({
      where: {
        story: { OR: [{ id: storyId }, { slug: storyId }] },
        ...(category && { category }),
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  // ============ Relationship Graph ============

  async getRelationshipGraph(storyId: string) {
    const characters = await this.prisma.character.findMany({
      where: { story: { OR: [{ id: storyId }, { slug: storyId }] } },
      select: { id: true, name: true, imageUrl: true, status: true },
    });

    const relations = await this.prisma.characterRelation.findMany({
      where: {
        characterA: { story: { OR: [{ id: storyId }, { slug: storyId }] } },
      },
      select: {
        id: true,
        characterAId: true,
        characterBId: true,
        relationship: true,
        establishedCh: true,
      },
    });

    // Build D3-compatible graph structure
    const nodes = characters.map((c) => ({
      id: c.id,
      label: c.name,
      image: c.imageUrl,
      status: c.status,
      type: 'character',
    }));

    const edges = relations.map((r) => ({
      id: r.id,
      source: r.characterAId,
      target: r.characterBId,
      label: r.relationship,
      establishedChapter: r.establishedCh,
    }));

    return { nodes, edges };
  }

  // ============ Search ============

  async searchCompendium(storyId: string, query: string) {
    const searchTerm = `%${query}%`;

    const [characters, items, locations, monsters, lore] = await Promise.all([
      this.prisma.character.findMany({
        where: {
          story: { OR: [{ id: storyId }, { slug: storyId }] },
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 10,
      }),
      this.prisma.item.findMany({
        where: {
          story: { OR: [{ id: storyId }, { slug: storyId }] },
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 10,
      }),
      this.prisma.location.findMany({
        where: {
          story: { OR: [{ id: storyId }, { slug: storyId }] },
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 10,
      }),
      this.prisma.monster.findMany({
        where: {
          story: { OR: [{ id: storyId }, { slug: storyId }] },
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 10,
      }),
      this.prisma.loreEntry.findMany({
        where: {
          story: { OR: [{ id: storyId }, { slug: storyId }] },
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 10,
      }),
    ]);

    return {
      characters,
      items,
      locations,
      monsters,
      lore,
      totalResults:
        characters.length + items.length + locations.length + monsters.length + lore.length,
    };
  }

  // ============ Stats ============

  async getCompendiumStats(storyId: string) {
    const [characters, items, locations, monsters, lore] = await Promise.all([
      this.prisma.character.count({
        where: { story: { OR: [{ id: storyId }, { slug: storyId }] } },
      }),
      this.prisma.item.count({
        where: { story: { OR: [{ id: storyId }, { slug: storyId }] } },
      }),
      this.prisma.location.count({
        where: { story: { OR: [{ id: storyId }, { slug: storyId }] } },
      }),
      this.prisma.monster.count({
        where: { story: { OR: [{ id: storyId }, { slug: storyId }] } },
      }),
      this.prisma.loreEntry.count({
        where: { story: { OR: [{ id: storyId }, { slug: storyId }] } },
      }),
    ]);

    return { characters, items, locations, monsters, lore };
  }
}
