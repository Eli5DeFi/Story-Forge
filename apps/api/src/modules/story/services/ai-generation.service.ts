import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

interface StoryContext {
  storyId: string;
  title: string;
  genre: string;
  worldState: any;
  plotThreads: any[];
  previousChapters: { number: number; summary: string; selectedOutcome?: string }[];
  currentChapter: number;
  selectedOutcome?: {
    teaserText: string;
    fullNarrative?: string;
  };
}

interface GeneratedChapter {
  title: string;
  content: string;
  summary: string;
}

interface OutcomeTeaser {
  optionNumber: number;
  teaserText: string;
  emotionalTone: string;
  plotImplications: string[];
}

@Injectable()
export class AiGenerationService {
  private readonly logger = new Logger(AiGenerationService.name);
  private anthropic: Anthropic;

  constructor(private configService: ConfigService) {
    this.anthropic = new Anthropic({
      apiKey: this.configService.get('ANTHROPIC_API_KEY'),
    });
  }

  async generateChapter(context: StoryContext): Promise<GeneratedChapter> {
    const systemPrompt = this.buildSystemPrompt(context);
    const userPrompt = this.buildChapterPrompt(context);

    this.logger.log(`Generating chapter ${context.currentChapter + 1} for story ${context.storyId}`);

    const response = await this.anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 8000,
      temperature: 0.8,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from AI');
    }

    return this.parseChapterResponse(content.text);
  }

  async generateOutcomes(
    context: StoryContext,
    chapterContent: string,
  ): Promise<OutcomeTeaser[]> {
    const prompt = this.buildOutcomePrompt(context, chapterContent);

    const response = await this.anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 2000,
      temperature: 0.9,
      system: OUTCOME_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from AI');
    }

    return this.parseOutcomeResponse(content.text);
  }

  async selectOutcome(
    context: StoryContext,
    outcomes: OutcomeTeaser[],
  ): Promise<{ selectedOption: number; reasoning: string }> {
    const prompt = this.buildSelectionPrompt(context, outcomes);

    const response = await this.anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1000,
      temperature: 0.3,
      system: SELECTION_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from AI');
    }

    return this.parseSelectionResponse(content.text);
  }

  private buildSystemPrompt(context: StoryContext): string {
    return `You are a master Fantasy Story Writer creating chapters for "${context.title}".

Genre: ${context.genre}

Writing Style:
- Rich, sensory descriptions without purple prose
- Complex characters with distinct voices
- Balance dialogue, action, and internal reflection
- End chapters on compelling hooks
- Maintain consistency with established lore and character behaviors

World State:
${JSON.stringify(context.worldState, null, 2)}

Previous Chapter Summaries:
${context.previousChapters.map(ch => `Chapter ${ch.number}: ${ch.summary}`).join('\n')}

Output your response in the following format:
<title>Chapter Title</title>
<content>
The full chapter content (2500-3500 words)...
</content>
<summary>
A 2-3 sentence summary of key events...
</summary>`;
  }

  private buildChapterPrompt(context: StoryContext): string {
    if (context.selectedOutcome) {
      return `Continue the story from this selected outcome:

"${context.selectedOutcome.teaserText}"

${context.selectedOutcome.fullNarrative ? `Additional context: ${context.selectedOutcome.fullNarrative}` : ''}

Write Chapter ${context.currentChapter + 1}, expanding on this direction while maintaining narrative tension and advancing the overall plot.`;
    }

    return `Write Chapter ${context.currentChapter + 1} of the story, continuing from where we left off.
Introduce compelling conflicts and character development while advancing the main plot threads.`;
  }

  private buildOutcomePrompt(context: StoryContext, chapterContent: string): string {
    return `Based on the following chapter, generate 4-5 possible story outcomes for readers to predict.

Chapter Content:
${chapterContent.substring(0, 3000)}...

Requirements:
1. Each outcome should be genuinely different, not variations of the same idea
2. Include a range from expected to surprising outcomes
3. Each teaser should be 2-3 sentences that entice without spoiling
4. At least one should be a "dark horse" - unexpected but logical
5. Consider the established world rules and character motivations

Format each outcome as:
<outcome number="1">
<teaser>The reader-facing preview text...</teaser>
<tone>emotional tone (e.g., hopeful, dark, mysterious)</tone>
<implications>plot implication 1, plot implication 2</implications>
</outcome>`;
  }

  private buildSelectionPrompt(context: StoryContext, outcomes: OutcomeTeaser[]): string {
    return `Select the best narrative outcome for the story to continue.

Story: ${context.title}
Current Chapter: ${context.currentChapter}

Available Outcomes:
${outcomes.map(o => `${o.optionNumber}. ${o.teaserText} (Tone: ${o.emotionalTone})`).join('\n')}

Consider:
1. Narrative momentum and story arc progression
2. Character development opportunities
3. World-building potential
4. Balance of expected vs. surprising choices across the story

Respond with:
<selected>option number</selected>
<reasoning>Your detailed reasoning...</reasoning>`;
  }

  private parseChapterResponse(text: string): GeneratedChapter {
    const titleMatch = text.match(/<title>([\s\S]*?)<\/title>/);
    const contentMatch = text.match(/<content>([\s\S]*?)<\/content>/);
    const summaryMatch = text.match(/<summary>([\s\S]*?)<\/summary>/);

    return {
      title: titleMatch?.[1]?.trim() || 'Untitled Chapter',
      content: contentMatch?.[1]?.trim() || text,
      summary: summaryMatch?.[1]?.trim() || '',
    };
  }

  private parseOutcomeResponse(text: string): OutcomeTeaser[] {
    const outcomes: OutcomeTeaser[] = [];
    const outcomeMatches = text.matchAll(/<outcome number="(\d+)">([\s\S]*?)<\/outcome>/g);

    for (const match of outcomeMatches) {
      const outcomeContent = match[2];
      const teaserMatch = outcomeContent.match(/<teaser>([\s\S]*?)<\/teaser>/);
      const toneMatch = outcomeContent.match(/<tone>([\s\S]*?)<\/tone>/);
      const implMatch = outcomeContent.match(/<implications>([\s\S]*?)<\/implications>/);

      outcomes.push({
        optionNumber: parseInt(match[1]),
        teaserText: teaserMatch?.[1]?.trim() || '',
        emotionalTone: toneMatch?.[1]?.trim() || 'neutral',
        plotImplications: implMatch?.[1]?.split(',').map(s => s.trim()) || [],
      });
    }

    return outcomes;
  }

  private parseSelectionResponse(text: string): { selectedOption: number; reasoning: string } {
    const selectedMatch = text.match(/<selected>(\d+)<\/selected>/);
    const reasoningMatch = text.match(/<reasoning>([\s\S]*?)<\/reasoning>/);

    return {
      selectedOption: parseInt(selectedMatch?.[1] || '1'),
      reasoning: reasoningMatch?.[1]?.trim() || '',
    };
  }
}

const OUTCOME_SYSTEM_PROMPT = `You are creating story outcome teasers for a prediction market.
Generate compelling, distinct outcomes that give readers meaningful choices to predict.
Each outcome should be plausible within the story's logic but offer different narrative directions.`;

const SELECTION_SYSTEM_PROMPT = `You are a narrative director selecting the next story direction.
Choose the outcome that best serves the overall story arc while maintaining reader engagement.
Your selection should feel earned and satisfying, not random.`;
