/**
 * Fantasy Story Writer Prompts
 * Comprehensive prompt system for AI-generated fantasy narratives
 */

export const FANTASY_WRITER_SYSTEM_PROMPT = `You are a master Fantasy Story Writer with decades of experience crafting epic narratives. You excel at:

## Core Competencies
- **World-Building**: Creating immersive, internally consistent fantasy worlds with rich history, magic systems, and cultures
- **Character Development**: Crafting complex, multi-dimensional characters with distinct voices, motivations, and growth arcs
- **Plot Architecture**: Weaving intricate narratives with foreshadowing, callbacks, and satisfying payoffs
- **Prose Craft**: Writing vivid, sensory descriptions that transport readers without becoming purple prose
- **Pacing**: Balancing action, dialogue, introspection, and world-building for maximum engagement

## Writing Style Guidelines
1. **Show, Don't Tell**: Reveal character traits through actions and dialogue, not exposition
2. **Sensory Immersion**: Engage all five senses in descriptions
3. **Distinct Voices**: Each character should have unique speech patterns, vocabulary, and cadence
4. **Active Voice**: Prefer dynamic, active constructions over passive
5. **Meaningful Conflict**: Every scene should contain tension—external, internal, or interpersonal
6. **Earned Emotions**: Build to emotional moments gradually; don't force sentiment
7. **Consistent Magic**: Follow established rules for any supernatural elements

## Chapter Structure
- **Opening Hook**: Begin in media res or with an intriguing moment
- **Rising Action**: Escalate tension through complications and discoveries
- **Turning Point**: Include at least one significant revelation or shift
- **Cliffhanger/Resolution**: End on a note that compels readers forward

## Narrative Voice
Write in third-person limited perspective, allowing deep insight into the protagonist's thoughts while maintaining mystery about others' true intentions. Use present-tense internal monologue sparingly for emphasis.

## Content Guidelines
- Fantasy violence is acceptable but should serve the narrative
- Maintain a tone appropriate for young adult and above
- Avoid gratuitous content; imply rather than depict graphic scenes
- Respect diverse cultures and avoid harmful stereotypes`;

export const CHAPTER_GENERATION_PROMPT = `Generate Chapter {chapterNumber} of "{storyTitle}".

## Story Context
{storyContext}

## World State
{worldState}

## Active Plot Threads
{plotThreads}

## Previous Chapter Summary
{previousSummary}

## Selected Outcome (if continuing from choice)
{selectedOutcome}

## Requirements
1. Write 2,500-3,500 words of engaging narrative
2. Advance at least one major plot thread
3. Include meaningful character interactions
4. End on a compelling hook that sets up the outcome choices
5. Maintain consistency with established lore and characterizations

## Output Format
Respond with your chapter in this exact format:

<chapter>
<title>Your Chapter Title</title>
<content>
Your full chapter narrative here...
</content>
<summary>
A 2-3 sentence summary of the key events and developments.
</summary>
<world_state_updates>
{
  "character_changes": [],
  "new_locations": [],
  "new_items": [],
  "plot_developments": [],
  "relationship_changes": []
}
</world_state_updates>
</chapter>`;

export const OUTCOME_GENERATION_PROMPT = `Based on the chapter ending, generate 4-5 possible story outcomes for readers to predict.

## Chapter Ending Context
{chapterEnding}

## Current Story State
{storyState}

## Requirements for Outcomes
1. **Diversity**: Each outcome must lead to genuinely different narrative paths
2. **Plausibility**: All outcomes must be logical within the story's rules
3. **Intrigue**: Write teasers that entice without spoiling
4. **Balance**: Include a mix of:
   - One "expected" outcome (what readers might predict)
   - Two "moderate surprise" outcomes
   - One "dark horse" outcome (unexpected but earned)
   - Optionally, one "wild card" that subverts expectations

## Emotional Tone Guidelines
Vary the emotional implications:
- Hopeful/Triumphant
- Dark/Ominous
- Mysterious/Intriguing
- Bittersweet/Complex
- Shocking/Dramatic

## Output Format
<outcomes>
<outcome number="1">
<teaser>A 2-3 sentence reader-facing preview that hooks without spoiling. Should create immediate intrigue.</teaser>
<tone>The primary emotional tone (e.g., hopeful, dark, mysterious, tense)</tone>
<implications>
- Plot implication 1
- Plot implication 2
- Character impact
</implications>
<narrative_seed>Brief internal notes on how this would develop in the next chapter</narrative_seed>
</outcome>

<outcome number="2">
...
</outcome>

<!-- Continue for all outcomes -->
</outcomes>`;

export const OUTCOME_SELECTION_PROMPT = `As the Story Director, select which outcome should become canon for the next chapter.

## Story: {storyTitle}
## Current Chapter: {chapterNumber}

## Available Outcomes
{outcomesWithVotes}

## Selection Criteria (in order of priority)
1. **Narrative Coherence**: Does this choice serve the overall story arc?
2. **Character Integrity**: Does this align with established character motivations?
3. **World Consistency**: Does this respect the rules of the world?
4. **Dramatic Potential**: Does this create compelling future possibilities?
5. **Pacing**: Does this maintain appropriate story momentum?

## Important Notes
- Reader vote counts are provided for context but should NOT be the primary factor
- Occasionally choosing less popular options creates exciting, unpredictable narratives
- The AI should feel like a thoughtful author, not a democracy

## Output Format
<selection>
<chosen>outcome number (1-5)</chosen>
<reasoning>
Detailed explanation of why this outcome best serves the story, addressing each criterion above.
</reasoning>
<setup_notes>
Brief notes on how to effectively transition into this outcome in the next chapter.
</setup_notes>
</selection>`;

export const ENTITY_EXTRACTION_PROMPT = `Extract all named entities from the following chapter for the story compendium.

## Chapter Content
{chapterContent}

## Known Entities (mark as isNew: false)
Characters: {knownCharacters}
Items: {knownItems}
Locations: {knownLocations}
Monsters: {knownMonsters}

## Extraction Guidelines
1. **Characters**: Any named individual with dialogue or significant action
2. **Items**: Named weapons, artifacts, tools, or significant objects
3. **Locations**: Named places, buildings, regions, or landmarks
4. **Monsters/Creatures**: Named or described enemies, beasts, or supernatural beings
5. **Relationships**: Any new or changed relationships between characters
6. **Lore**: Historical facts, prophecies, cultural details, or magic system rules

## Output Format (JSON)
{
  "characters": [
    {
      "name": "Character Name",
      "description": "Physical appearance, role, and key traits",
      "traits": ["trait1", "trait2"],
      "status": "alive|deceased|unknown",
      "isNew": true|false
    }
  ],
  "items": [
    {
      "name": "Item Name",
      "description": "Appearance and properties",
      "type": "WEAPON|ARMOR|ACCESSORY|CONSUMABLE|KEY_ITEM|ARTIFACT",
      "rarity": "COMMON|UNCOMMON|RARE|EPIC|LEGENDARY|MYTHIC",
      "owner": "Character name or null",
      "isNew": true|false
    }
  ],
  "locations": [
    {
      "name": "Location Name",
      "description": "Physical description and atmosphere",
      "type": "city|village|dungeon|forest|mountain|etc",
      "region": "Larger region if mentioned",
      "isNew": true|false
    }
  ],
  "monsters": [
    {
      "name": "Monster Name",
      "description": "Appearance and behavior",
      "species": "Species or type",
      "threatLevel": 1-10,
      "abilities": ["ability1", "ability2"],
      "weaknesses": ["weakness1"],
      "isBoss": true|false,
      "isNew": true|false
    }
  ],
  "relationships": [
    {
      "characterA": "Name",
      "characterB": "Name",
      "relationship": "ally|enemy|family|romantic|mentor|rival|etc",
      "description": "Nature of the relationship",
      "isNew": true|false
    }
  ],
  "lore": [
    {
      "category": "history|magic_system|culture|prophecy|religion|politics",
      "title": "Lore Entry Title",
      "content": "The lore information",
      "relatedEntities": ["entity names"]
    }
  ]
}`;

export const IMAGE_PROMPT_GENERATION = `Generate a detailed image prompt for the following story entity.

## Entity Type: {entityType}
## Entity Name: {entityName}
## Description: {description}

## Style Guidelines
- Fantasy illustration style, detailed and atmospheric
- Rich colors with dramatic lighting
- Suitable for a high-fantasy novel
- Professional quality, could be book cover art

## Output Format
<image_prompt>
A detailed prompt for image generation (50-100 words) that captures the entity's essence while being specific enough for consistent generation.
</image_prompt>

<negative_prompt>
Elements to avoid in the image.
</negative_prompt>`;
