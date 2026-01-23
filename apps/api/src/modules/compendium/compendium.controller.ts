import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CompendiumService } from './compendium.service';

@ApiTags('compendium')
@Controller('compendium')
export class CompendiumController {
  constructor(private compendiumService: CompendiumService) {}

  // ============ Characters ============

  @Get(':storyId/characters')
  @ApiOperation({ summary: 'Get all characters for a story' })
  @ApiResponse({ status: 200, description: 'Returns list of characters' })
  async getCharacters(
    @Param('storyId') storyId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.compendiumService.getCharacters(storyId, { limit, offset });
  }

  @Get('characters/:characterId')
  @ApiOperation({ summary: 'Get character details' })
  @ApiResponse({ status: 200, description: 'Returns character with relationships' })
  async getCharacter(@Param('characterId') characterId: string) {
    return this.compendiumService.getCharacter(characterId);
  }

  // ============ Items ============

  @Get(':storyId/items')
  @ApiOperation({ summary: 'Get all items for a story' })
  @ApiQuery({ name: 'type', required: false })
  @ApiResponse({ status: 200, description: 'Returns list of items' })
  async getItems(@Param('storyId') storyId: string, @Query('type') type?: string) {
    return this.compendiumService.getItems(storyId, type);
  }

  @Get('items/:itemId')
  @ApiOperation({ summary: 'Get item details' })
  @ApiResponse({ status: 200, description: 'Returns item details' })
  async getItem(@Param('itemId') itemId: string) {
    return this.compendiumService.getItem(itemId);
  }

  // ============ Locations ============

  @Get(':storyId/locations')
  @ApiOperation({ summary: 'Get all locations for a story' })
  @ApiResponse({ status: 200, description: 'Returns list of locations' })
  async getLocations(@Param('storyId') storyId: string) {
    return this.compendiumService.getLocations(storyId);
  }

  @Get('locations/:locationId')
  @ApiOperation({ summary: 'Get location details' })
  @ApiResponse({ status: 200, description: 'Returns location details' })
  async getLocation(@Param('locationId') locationId: string) {
    return this.compendiumService.getLocation(locationId);
  }

  // ============ Monsters ============

  @Get(':storyId/monsters')
  @ApiOperation({ summary: 'Get all monsters for a story' })
  @ApiResponse({ status: 200, description: 'Returns list of monsters' })
  async getMonsters(@Param('storyId') storyId: string) {
    return this.compendiumService.getMonsters(storyId);
  }

  @Get('monsters/:monsterId')
  @ApiOperation({ summary: 'Get monster details' })
  @ApiResponse({ status: 200, description: 'Returns monster details' })
  async getMonster(@Param('monsterId') monsterId: string) {
    return this.compendiumService.getMonster(monsterId);
  }

  // ============ Lore ============

  @Get(':storyId/lore')
  @ApiOperation({ summary: 'Get lore entries for a story' })
  @ApiQuery({ name: 'category', required: false })
  @ApiResponse({ status: 200, description: 'Returns list of lore entries' })
  async getLoreEntries(
    @Param('storyId') storyId: string,
    @Query('category') category?: string,
  ) {
    return this.compendiumService.getLoreEntries(storyId, category);
  }

  // ============ Relationship Graph ============

  @Get(':storyId/relationships')
  @ApiOperation({ summary: 'Get relationship graph for a story' })
  @ApiResponse({ status: 200, description: 'Returns D3-compatible graph data' })
  async getRelationshipGraph(@Param('storyId') storyId: string) {
    return this.compendiumService.getRelationshipGraph(storyId);
  }

  // ============ Search ============

  @Get(':storyId/search')
  @ApiOperation({ summary: 'Search the compendium' })
  @ApiQuery({ name: 'q', required: true })
  @ApiResponse({ status: 200, description: 'Returns search results' })
  async searchCompendium(@Param('storyId') storyId: string, @Query('q') query: string) {
    return this.compendiumService.searchCompendium(storyId, query);
  }

  // ============ Stats ============

  @Get(':storyId/stats')
  @ApiOperation({ summary: 'Get compendium statistics' })
  @ApiResponse({ status: 200, description: 'Returns entity counts' })
  async getStats(@Param('storyId') storyId: string) {
    return this.compendiumService.getCompendiumStats(storyId);
  }
}
