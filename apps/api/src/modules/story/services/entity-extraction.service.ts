import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

export interface ExtractedEntities {
  characters: ExtractedCharacter[];
  items: ExtractedItem[];
  locations: ExtractedLocation[];
  monsters: ExtractedMonster[];
  relationships: ExtractedRelationship[];
  loreEntries: ExtractedLore[];
}

interface ExtractedCharacter {
  name: string;
  description: string;
  traits: string[];
  isNew: boolean;
}

interface ExtractedItem {
  name: string;
  description: string;
  type: string;
  rarity: string;
  owner?: string;
}

interface ExtractedLocation {
  name: string;
  description: string;
  type: string;
}

interface ExtractedMonster {
  name: string;
  description: string;
  threatLevel: number;
  abilities: string[];
  weaknesses: string[];
}

interface ExtractedRelationship {
  characterA: string;
  characterB: string;
  relationship: string;
  isNew: boolean;
}

interface ExtractedLore {
  category: string;
  title: string;
  content: string;
}

@Injectable()
export class EntityExtractionService {
  private readonly logger = new Logger(EntityExtractionService.name);
  private anthropic: Anthropic;

  constructor(private configService: ConfigService) {
    this.anthropic = new Anthropic({
      apiKey: this.configService.get('ANTHROPIC_API_KEY'),
    });
  }

  async extractEntities(
    chapterContent: string,
    existingEntities: {
      characters: string[];
      items: string[];
      locations: string[];
      monsters: string[];
    },
  ): Promise<ExtractedEntities> {
    const prompt = this.buildExtractionPrompt(chapterContent, existingEntities);

    const response = await this.anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4000,
      temperature: 0.2,
      system: EXTRACTION_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from AI');
    }

    return this.parseExtractionResponse(content.text);
  }

  private buildExtractionPrompt(
    chapterContent: string,
    existingEntities: {
      characters: string[];
      items: string[];
      locations: string[];
      monsters: string[];
    },
  ): string {
    return `Extract all named entities from the following chapter.

Known entities (mark as isNew: false if referenced):
- Characters: ${existingEntities.characters.join(', ') || 'None'}
- Items: ${existingEntities.items.join(', ') || 'None'}
- Locations: ${existingEntities.locations.join(', ') || 'None'}
- Monsters: ${existingEntities.monsters.join(', ') || 'None'}

Chapter Content:
${chapterContent}

Extract and categorize all entities in JSON format:
{
  "characters": [{ "name": "", "description": "", "traits": [], "isNew": true/false }],
  "items": [{ "name": "", "description": "", "type": "", "rarity": "", "owner": "" }],
  "locations": [{ "name": "", "description": "", "type": "" }],
  "monsters": [{ "name": "", "description": "", "threatLevel": 1-10, "abilities": [], "weaknesses": [] }],
  "relationships": [{ "characterA": "", "characterB": "", "relationship": "", "isNew": true/false }],
  "loreEntries": [{ "category": "", "title": "", "content": "" }]
}

Categories for lore: history, magic_system, culture, prophecy, religion, geography, politics`;
  }

  private parseExtractionResponse(text: string): ExtractedEntities {
    try {
      // Find JSON in the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        this.logger.warn('No JSON found in extraction response');
        return this.emptyEntities();
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return {
        characters: parsed.characters || [],
        items: parsed.items || [],
        locations: parsed.locations || [],
        monsters: parsed.monsters || [],
        relationships: parsed.relationships || [],
        loreEntries: parsed.loreEntries || [],
      };
    } catch (error) {
      this.logger.error('Failed to parse extraction response', error);
      return this.emptyEntities();
    }
  }

  private emptyEntities(): ExtractedEntities {
    return {
      characters: [],
      items: [],
      locations: [],
      monsters: [],
      relationships: [],
      loreEntries: [],
    };
  }
}

const EXTRACTION_SYSTEM_PROMPT = `You are an expert entity extractor for fantasy narratives.
Extract all named entities (characters, items, locations, monsters) and any new lore or relationships.
Be thorough but accurate - only extract entities that are explicitly named or described.
For threat levels: 1-3 = minor threat, 4-6 = moderate threat, 7-9 = major threat, 10 = world-ending threat.
For item rarity: COMMON, UNCOMMON, RARE, EPIC, LEGENDARY, MYTHIC.
For item types: WEAPON, ARMOR, ACCESSORY, CONSUMABLE, KEY_ITEM, ARTIFACT, TOOL.`;
