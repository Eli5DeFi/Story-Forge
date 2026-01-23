import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface WorldState {
  currentTime: string;
  currentLocation: string;
  activeQuests: Quest[];
  globalEvents: GlobalEvent[];
  factions: FactionState[];
  magicSystemState: MagicState;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'failed';
  objectives: string[];
  completedObjectives: string[];
}

export interface GlobalEvent {
  name: string;
  description: string;
  chapter: number;
  ongoing: boolean;
}

export interface FactionState {
  name: string;
  disposition: 'friendly' | 'neutral' | 'hostile';
  power: number; // 1-10
  recentActions: string[];
}

export interface MagicState {
  currentManaLevel: string; // e.g., "high", "normal", "depleted"
  activeEnchantments: string[];
  magicalAnomalies: string[];
}

export interface CharacterState {
  id: string;
  name: string;
  status: 'alive' | 'deceased' | 'unknown' | 'transformed';
  currentLocation: string;
  health: 'healthy' | 'injured' | 'critical';
  emotionalState: string;
  inventory: string[];
  activeGoals: string[];
  recentActions: string[];
  relationships: { [characterName: string]: string };
}

export interface PlotThread {
  id: string;
  name: string;
  description: string;
  status: 'setup' | 'developing' | 'climax' | 'resolved';
  priority: 'main' | 'secondary' | 'background';
  involvedCharacters: string[];
  chapters: number[];
  foreshadowing: string[];
  payoffs: string[];
}

export interface StoryContext {
  storyId: string;
  storyTitle: string;
  genre: string;
  currentChapter: number;
  worldState: WorldState;
  characterStates: CharacterState[];
  plotThreads: PlotThread[];
  chapterSummaries: ChapterSummary[];
  styleGuide: string;
}

export interface ChapterSummary {
  chapterNumber: number;
  title: string;
  summary: string;
  keyEvents: string[];
  selectedOutcome?: string;
}

@Injectable()
export class StoryContextService {
  private readonly logger = new Logger(StoryContextService.name);

  constructor(private prisma: PrismaService) {}

  async buildContext(storyId: string): Promise<StoryContext> {
    const story = await this.prisma.story.findUnique({
      where: { id: storyId },
      include: {
        chapters: {
          where: { status: { not: 'DRAFT' } },
          orderBy: { chapterNumber: 'desc' },
          take: 10,
          include: {
            outcomes: {
              where: { isSelected: true },
            },
          },
        },
        characters: {
          include: {
            relationshipsA: { include: { characterB: true } },
            ownedItems: true,
          },
        },
        locations: true,
        items: true,
      },
    });

    if (!story) {
      throw new Error('Story not found');
    }

    // Build character states from database
    const characterStates: CharacterState[] = story.characters.map((char) => ({
      id: char.id,
      name: char.name,
      status: (char.status as CharacterState['status']) || 'alive',
      currentLocation: 'unknown',
      health: 'healthy',
      emotionalState: 'neutral',
      inventory: char.ownedItems.map((item) => item.name),
      activeGoals: [],
      recentActions: [],
      relationships: char.relationshipsA.reduce(
        (acc, rel) => ({
          ...acc,
          [rel.characterB.name]: rel.relationship,
        }),
        {},
      ),
    }));

    // Parse world state from story JSON or use defaults
    const worldState: WorldState = (story.worldState as WorldState) || {
      currentTime: 'Day 1',
      currentLocation: 'Unknown',
      activeQuests: [],
      globalEvents: [],
      factions: [],
      magicSystemState: {
        currentManaLevel: 'normal',
        activeEnchantments: [],
        magicalAnomalies: [],
      },
    };

    // Parse plot threads from story JSON or use defaults
    const plotThreads: PlotThread[] = (story.plotThreads as PlotThread[]) || [];

    // Build chapter summaries
    const chapterSummaries: ChapterSummary[] = story.chapters
      .reverse()
      .map((ch) => ({
        chapterNumber: ch.chapterNumber,
        title: ch.title,
        summary: ch.summary || '',
        keyEvents: [],
        selectedOutcome: ch.outcomes[0]?.teaserText,
      }));

    return {
      storyId: story.id,
      storyTitle: story.title,
      genre: story.genre,
      currentChapter: story.currentChapter,
      worldState,
      characterStates,
      plotThreads,
      chapterSummaries,
      styleGuide: story.styleGuide || '',
    };
  }

  async updateWorldState(
    storyId: string,
    updates: Partial<WorldState>,
  ): Promise<void> {
    const story = await this.prisma.story.findUnique({
      where: { id: storyId },
      select: { worldState: true },
    });

    const currentState = (story?.worldState as WorldState) || {};
    const newState = { ...currentState, ...updates };

    await this.prisma.story.update({
      where: { id: storyId },
      data: { worldState: newState as any },
    });
  }

  async updateCharacterState(
    storyId: string,
    characterName: string,
    updates: Partial<CharacterState>,
  ): Promise<void> {
    await this.prisma.character.updateMany({
      where: {
        storyId,
        name: characterName,
      },
      data: {
        status: updates.status,
        // Other fields stored in JSON would need custom handling
      },
    });
  }

  async addPlotThread(storyId: string, thread: PlotThread): Promise<void> {
    const story = await this.prisma.story.findUnique({
      where: { id: storyId },
      select: { plotThreads: true },
    });

    const currentThreads = (story?.plotThreads as PlotThread[]) || [];
    const newThreads = [...currentThreads, thread];

    await this.prisma.story.update({
      where: { id: storyId },
      data: { plotThreads: newThreads as any },
    });
  }

  async updatePlotThread(
    storyId: string,
    threadId: string,
    updates: Partial<PlotThread>,
  ): Promise<void> {
    const story = await this.prisma.story.findUnique({
      where: { id: storyId },
      select: { plotThreads: true },
    });

    const currentThreads = (story?.plotThreads as PlotThread[]) || [];
    const updatedThreads = currentThreads.map((thread) =>
      thread.id === threadId ? { ...thread, ...updates } : thread,
    );

    await this.prisma.story.update({
      where: { id: storyId },
      data: { plotThreads: updatedThreads as any },
    });
  }

  formatContextForPrompt(context: StoryContext): string {
    const recentChapters = context.chapterSummaries.slice(-5);

    return `
## Story: ${context.storyTitle}
## Genre: ${context.genre}
## Current Chapter: ${context.currentChapter}

### World State
- Time: ${context.worldState.currentTime}
- Location: ${context.worldState.currentLocation}
- Active Quests: ${context.worldState.activeQuests.map((q) => q.name).join(', ') || 'None'}
- Global Events: ${context.worldState.globalEvents.filter((e) => e.ongoing).map((e) => e.name).join(', ') || 'None'}

### Main Characters
${context.characterStates
  .slice(0, 5)
  .map(
    (char) => `- ${char.name}: ${char.status}, ${char.emotionalState}. Goals: ${char.activeGoals.join(', ') || 'Unknown'}`,
  )
  .join('\n')}

### Active Plot Threads
${context.plotThreads
  .filter((t) => t.status !== 'resolved')
  .map((t) => `- [${t.priority.toUpperCase()}] ${t.name}: ${t.description} (${t.status})`)
  .join('\n') || 'None established'}

### Recent Chapter Summaries
${recentChapters.map((ch) => `Chapter ${ch.chapterNumber} - ${ch.title}: ${ch.summary}`).join('\n\n')}
`.trim();
  }

  formatWorldStateForPrompt(worldState: WorldState): string {
    return JSON.stringify(worldState, null, 2);
  }

  formatPlotThreadsForPrompt(plotThreads: PlotThread[]): string {
    return plotThreads
      .filter((t) => t.status !== 'resolved')
      .map(
        (t) => `
### ${t.name} [${t.priority}] - ${t.status}
${t.description}
- Characters: ${t.involvedCharacters.join(', ')}
- Foreshadowing: ${t.foreshadowing.join('; ') || 'None'}
`,
      )
      .join('\n');
  }
}
