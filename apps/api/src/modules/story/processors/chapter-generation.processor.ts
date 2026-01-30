import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { AiGenerationService } from '../services/ai-generation.service';
import { EntityExtractionService } from '../services/entity-extraction.service';
import { StoryContextService } from '../services/story-context.service';
import { ImageGenerationService } from '../services/image-generation.service';
import { IpfsService } from '../services/ipfs.service';
import { EventsGateway } from '../../events/events.gateway';

interface ChapterGenerationJob {
  storyId: string;
  selectedOutcomeId?: string;
}

@Processor('chapter-generation')
export class ChapterGenerationProcessor {
  private readonly logger = new Logger(ChapterGenerationProcessor.name);

  constructor(
    private prisma: PrismaService,
    private aiGeneration: AiGenerationService,
    private entityExtraction: EntityExtractionService,
    private storyContext: StoryContextService,
    private imageGeneration: ImageGenerationService,
    private ipfsService: IpfsService,
    private eventsGateway: EventsGateway,
  ) {}

  @Process('generate')
  async handleGeneration(job: Job<ChapterGenerationJob>) {
    const { storyId, selectedOutcomeId } = job.data;
    this.logger.log(`Starting chapter generation for story ${storyId}`);

    try {
      // Update job progress
      await job.progress(10);

      // 1. Build comprehensive story context
      const context = await this.storyContext.buildContext(storyId);
      this.logger.log(`Built context for ${context.storyTitle}, chapter ${context.currentChapter + 1}`);

      // 2. Select winning outcome if needed (resolve previous chapter's betting)
      let selectedOutcome = null;
      if (selectedOutcomeId) {
        selectedOutcome = await this.prisma.outcome.findUnique({
          where: { id: selectedOutcomeId },
        });

        // Mark outcome as selected
        await this.prisma.outcome.update({
          where: { id: selectedOutcomeId },
          data: { isSelected: true },
        });
      } else {
        // Auto-select using AI if no outcome was specified
        const lastChapter = await this.prisma.chapter.findFirst({
          where: { storyId, status: 'BETTING_CLOSED' },
          include: {
            outcomes: {
              include: { bettingPool: true },
            },
          },
          orderBy: { chapterNumber: 'desc' },
        });

        if (lastChapter && lastChapter.outcomes.length > 0) {
          // Transform chapterSummaries to match expected interface
          const previousChapters = context.chapterSummaries.map((ch) => ({
            number: ch.chapterNumber,
            summary: ch.summary,
            selectedOutcome: ch.selectedOutcome,
          }));

          const selection = await this.aiGeneration.selectOutcome(
            {
              storyId: context.storyId,
              title: context.storyTitle,
              genre: context.genre,
              worldState: context.worldState,
              plotThreads: context.plotThreads,
              previousChapters,
              currentChapter: context.currentChapter,
            },
            lastChapter.outcomes.map((o: any) => ({
              optionNumber: o.optionNumber,
              teaserText: o.teaserText,
              emotionalTone: o.emotionalTone || 'neutral',
              plotImplications: (o.plotImplications as string[]) || [],
            })),
          );

          const winningOutcome = lastChapter.outcomes.find(
            (o: any) => o.optionNumber === selection.selectedOption,
          );

          if (winningOutcome) {
            selectedOutcome = winningOutcome;

            // Mark as selected and update AI reasoning
            await this.prisma.outcome.update({
              where: { id: winningOutcome.id },
              data: {
                isSelected: true,
              },
            });

            // Update chapter with AI reasoning
            await this.prisma.chapter.update({
              where: { id: lastChapter.id },
              data: {
                selectedOutcome: winningOutcome.id,
                aiReasoning: selection.reasoning,
                status: 'RESOLVED',
              },
            });

            this.logger.log(
              `AI selected outcome ${selection.selectedOption}: ${winningOutcome.teaserText.substring(0, 50)}...`,
            );
          }
        }
      }

      await job.progress(25);

      // 3. Generate chapter content
      // Transform chapterSummaries to match expected interface
      const previousChaptersForGen = context.chapterSummaries.map((ch) => ({
        number: ch.chapterNumber,
        summary: ch.summary,
        selectedOutcome: ch.selectedOutcome,
      }));

      const generationContext = {
        storyId: context.storyId,
        title: context.storyTitle,
        genre: context.genre,
        worldState: context.worldState,
        plotThreads: context.plotThreads,
        previousChapters: previousChaptersForGen,
        currentChapter: context.currentChapter,
        selectedOutcome: selectedOutcome
          ? {
              teaserText: selectedOutcome.teaserText,
              fullNarrative: (selectedOutcome as any).fullNarrative,
            }
          : undefined,
      };

      const generated = await this.aiGeneration.generateChapter(generationContext);
      this.logger.log(`Generated chapter: ${generated.title}`);

      await job.progress(50);

      // 4. Extract entities from the new chapter
      const story = await this.prisma.story.findUnique({
        where: { id: storyId },
        include: {
          characters: { select: { name: true } },
          items: { select: { name: true } },
          locations: { select: { name: true } },
          monsters: { select: { name: true } },
        },
      });

      const entities = await this.entityExtraction.extractEntities(
        generated.content,
        {
          characters: story?.characters.map((c: { name: string }) => c.name) || [],
          items: story?.items.map((i: { name: string }) => i.name) || [],
          locations: story?.locations.map((l: { name: string }) => l.name) || [],
          monsters: story?.monsters.map((m: { name: string }) => m.name) || [],
        },
      );

      this.logger.log(
        `Extracted entities: ${entities.characters.length} characters, ${entities.items.length} items`,
      );

      await job.progress(65);

      // 5. Generate outcome teasers for the new chapter
      const outcomes = await this.aiGeneration.generateOutcomes(
        generationContext,
        generated.content,
      );
      this.logger.log(`Generated ${outcomes.length} outcome teasers`);

      await job.progress(75);

      // 6. Upload chapter content to IPFS
      const newChapterNumber = context.currentChapter + 1;
      const ipfsHash = await this.ipfsService.uploadChapterContent(
        storyId,
        newChapterNumber,
        generated.content,
      );

      // 7. Create chapter in database
      const newChapter = await this.prisma.chapter.create({
        data: {
          storyId,
          chapterNumber: newChapterNumber,
          title: generated.title,
          content: generated.content,
          summary: generated.summary,
          status: 'BETTING_OPEN',
          publishedAt: new Date(),
          bettingEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
          extractedEntities: entities as any,
          ipfsHash,
          outcomes: {
            create: outcomes.map((o) => ({
              optionNumber: o.optionNumber,
              teaserText: o.teaserText,
              emotionalTone: o.emotionalTone,
              plotImplications: o.plotImplications,
            })),
          },
        },
        include: {
          outcomes: true,
        },
      });

      // 8. Create betting pools for each outcome
      for (const outcome of newChapter.outcomes) {
        await this.prisma.bettingPool.create({
          data: {
            chapterId: newChapter.id,
            outcomeId: outcome.id,
            status: 'OPEN',
          },
        });
      }

      // 9. Update story current chapter
      await this.prisma.story.update({
        where: { id: storyId },
        data: { currentChapter: newChapterNumber },
      });

      await job.progress(85);

      // 10. Store extracted entities in compendium
      await this.storeExtractedEntities(storyId, newChapterNumber, entities);

      // 11. Generate images for new entities (async, don't block)
      this.generateEntityImages(storyId, newChapterNumber, entities).catch((err) =>
        this.logger.error('Failed to generate entity images', err),
      );

      await job.progress(100);

      this.logger.log(
        `Chapter ${newChapter.chapterNumber} generated and published for story ${storyId}`,
      );

      // Emit WebSocket event for new chapter
      this.eventsGateway.emitNewChapter(storyId, {
        storyId,
        chapterId: newChapter.id,
        chapterNumber: newChapter.chapterNumber,
        status: 'BETTING_OPEN',
        title: newChapter.title,
      });

      // Emit events for new entities
      for (const char of entities.characters.filter((c: any) => c.isNew)) {
        this.eventsGateway.emitNewEntity(storyId, {
          type: 'character',
          id: char.name,
          name: char.name,
          chapterNumber: newChapterNumber,
        });
      }

      return {
        chapterId: newChapter.id,
        chapterNumber: newChapter.chapterNumber,
        title: newChapter.title,
        outcomesCount: newChapter.outcomes.length,
        entitiesExtracted: {
          characters: entities.characters.length,
          items: entities.items.length,
          locations: entities.locations.length,
          monsters: entities.monsters.length,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to generate chapter for story ${storyId}`, error);
      throw error;
    }
  }

  private async storeExtractedEntities(
    storyId: string,
    chapterNumber: number,
    entities: any,
  ) {
    // Store new characters
    for (const char of entities.characters || []) {
      if (char.isNew) {
        await this.prisma.character.upsert({
          where: { storyId_name: { storyId, name: char.name } },
          create: {
            storyId,
            name: char.name,
            description: char.description,
            status: char.status || 'alive',
            traits: { personality: char.traits || [] },
            firstAppearance: chapterNumber,
          },
          update: {
            description: char.description,
            status: char.status,
          },
        });
      }
    }

    // Store new items
    for (const item of entities.items || []) {
      if (item.isNew) {
        await this.prisma.item.upsert({
          where: { storyId_name: { storyId, name: item.name } },
          create: {
            storyId,
            name: item.name,
            description: item.description,
            type: (item.type as any) || 'KEY_ITEM',
            rarity: (item.rarity as any) || 'COMMON',
            firstAppearance: chapterNumber,
          },
          update: {
            description: item.description,
          },
        });
      }
    }

    // Store new locations
    for (const loc of entities.locations || []) {
      if (loc.isNew) {
        await this.prisma.location.upsert({
          where: { storyId_name: { storyId, name: loc.name } },
          create: {
            storyId,
            name: loc.name,
            description: loc.description,
            type: loc.type || 'unknown',
            region: loc.region,
            firstAppearance: chapterNumber,
          },
          update: {
            description: loc.description,
          },
        });
      }
    }

    // Store new monsters
    for (const monster of entities.monsters || []) {
      if (monster.isNew) {
        await this.prisma.monster.upsert({
          where: { storyId_name: { storyId, name: monster.name } },
          create: {
            storyId,
            name: monster.name,
            description: monster.description,
            species: monster.species,
            threatLevel: monster.threatLevel || 5,
            abilities: monster.abilities || [],
            weaknesses: monster.weaknesses || [],
            isBoss: monster.isBoss || false,
            firstAppearance: chapterNumber,
          },
          update: {
            description: monster.description,
          },
        });
      }
    }

    // Store character relationships
    for (const rel of entities.relationships || []) {
      if (rel.isNew) {
        const charA = await this.prisma.character.findFirst({
          where: { storyId, name: rel.characterA },
        });
        const charB = await this.prisma.character.findFirst({
          where: { storyId, name: rel.characterB },
        });

        if (charA && charB) {
          await this.prisma.characterRelation.upsert({
            where: {
              characterAId_characterBId: {
                characterAId: charA.id,
                characterBId: charB.id,
              },
            },
            create: {
              characterAId: charA.id,
              characterBId: charB.id,
              relationship: rel.relationship,
              description: rel.description,
              establishedCh: chapterNumber,
            },
            update: {
              relationship: rel.relationship,
              description: rel.description,
            },
          });
        }
      }
    }

    // Store lore entries
    for (const lore of entities.lore || entities.loreEntries || []) {
      await this.prisma.loreEntry.create({
        data: {
          storyId,
          category: lore.category,
          title: lore.title,
          content: lore.content,
          relatedEntities: lore.relatedEntities || [],
          chapterRefs: [chapterNumber],
        },
      });
    }
  }

  private async generateEntityImages(
    storyId: string,
    chapterNumber: number,
    entities: any,
  ) {
    const story = await this.prisma.story.findUnique({
      where: { id: storyId },
      select: { title: true },
    });

    const chapter = await this.prisma.chapter.findFirst({
      where: { storyId, chapterNumber },
      select: { title: true },
    });

    const storyInfo = {
      storyId,
      storyTitle: story?.title || 'Unknown Story',
      chapterTitle: chapter?.title || `Chapter ${chapterNumber}`,
    };

    // Generate images for new characters
    for (const char of (entities.characters || []).filter((c: any) => c.isNew)) {
      try {
        const image = await this.imageGeneration.generateEntityImage(
          'character',
          char.name,
          char.description,
        );

        // Upload image to IPFS
        const imageCid = await this.ipfsService.uploadImageFromUrl(
          image.url,
          `${char.name.toLowerCase().replace(/\s+/g, '-')}.png`,
        );

        // Build and upload NFT metadata
        const metadata = await this.ipfsService.buildNFTMetadata(
          {
            name: char.name,
            description: char.description,
            type: 'CHARACTER',
            firstAppearance: chapterNumber,
            traits: { personality: char.traits },
          },
          storyInfo,
          imageCid,
        );

        const metadataCid = await this.ipfsService.uploadNFTMetadata(metadata);

        // Update character with image URL
        await this.prisma.character.updateMany({
          where: { storyId, name: char.name },
          data: {
            imageUrl: this.ipfsService.buildGatewayUrl(imageCid),
            nftIpfsUri: this.ipfsService.buildIpfsUrl(metadataCid),
          },
        });

        this.logger.log(`Generated image for character: ${char.name}`);
      } catch (error) {
        this.logger.error(`Failed to generate image for ${char.name}`, error);
      }
    }

    // Generate images for new monsters (they're visually interesting)
    for (const monster of (entities.monsters || []).filter((m: any) => m.isNew)) {
      try {
        const image = await this.imageGeneration.generateEntityImage(
          'monster',
          monster.name,
          monster.description,
        );

        const imageCid = await this.ipfsService.uploadImageFromUrl(
          image.url,
          `${monster.name.toLowerCase().replace(/\s+/g, '-')}.png`,
        );

        const metadata = await this.ipfsService.buildNFTMetadata(
          {
            name: monster.name,
            description: monster.description,
            type: 'MONSTER',
            firstAppearance: chapterNumber,
            traits: {
              threat_level: monster.threatLevel,
              abilities: monster.abilities?.join(', '),
            },
          },
          storyInfo,
          imageCid,
        );

        const metadataCid = await this.ipfsService.uploadNFTMetadata(metadata);

        await this.prisma.monster.updateMany({
          where: { storyId, name: monster.name },
          data: {
            imageUrl: this.ipfsService.buildGatewayUrl(imageCid),
            nftIpfsUri: this.ipfsService.buildIpfsUrl(metadataCid),
          },
        });

        this.logger.log(`Generated image for monster: ${monster.name}`);
      } catch (error) {
        this.logger.error(`Failed to generate image for ${monster.name}`, error);
      }
    }
  }
}
