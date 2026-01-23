import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export interface ImageGenerationOptions {
  style?: 'fantasy-portrait' | 'fantasy-scene' | 'fantasy-item' | 'fantasy-creature';
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
}

export interface GeneratedImage {
  url: string;
  revisedPrompt: string;
}

@Injectable()
export class ImageGenerationService {
  private readonly logger = new Logger(ImageGenerationService.name);
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  async generateImage(
    prompt: string,
    options: ImageGenerationOptions = {},
  ): Promise<GeneratedImage> {
    if (!this.openai) {
      this.logger.warn('OpenAI not configured, returning placeholder');
      return {
        url: 'https://placehold.co/1024x1024/1a1a2e/eee?text=Image+Placeholder',
        revisedPrompt: prompt,
      };
    }

    const {
      style = 'fantasy-portrait',
      size = '1024x1024',
      quality = 'hd',
    } = options;

    const styledPrompt = this.applyStyleToPrompt(prompt, style);

    try {
      this.logger.log(`Generating image with DALL-E 3: ${styledPrompt.substring(0, 100)}...`);

      const response = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt: styledPrompt,
        n: 1,
        size,
        quality,
        response_format: 'url',
      });

      return {
        url: response.data[0].url!,
        revisedPrompt: response.data[0].revised_prompt || styledPrompt,
      };
    } catch (error) {
      this.logger.error('Failed to generate image', error);
      throw error;
    }
  }

  async generateEntityImage(
    entityType: 'character' | 'item' | 'location' | 'monster',
    name: string,
    description: string,
  ): Promise<GeneratedImage> {
    const prompt = this.buildEntityPrompt(entityType, name, description);
    const style = this.getStyleForEntityType(entityType);
    const size = this.getSizeForEntityType(entityType);

    return this.generateImage(prompt, { style, size, quality: 'hd' });
  }

  async generateChapterIllustration(
    chapterTitle: string,
    sceneDescription: string,
  ): Promise<GeneratedImage> {
    const prompt = `Epic fantasy book illustration for chapter "${chapterTitle}". Scene: ${sceneDescription}. Dramatic lighting, rich colors, cinematic composition, highly detailed digital art.`;

    return this.generateImage(prompt, {
      style: 'fantasy-scene',
      size: '1792x1024',
      quality: 'hd',
    });
  }

  private buildEntityPrompt(
    entityType: string,
    name: string,
    description: string,
  ): string {
    const styleGuides: Record<string, string> = {
      character: `Fantasy character portrait of ${name}. ${description}. Detailed face and upper body, dramatic lighting, rich colors, professional fantasy art style, suitable for a book cover. No text or labels.`,

      item: `Fantasy item illustration: ${name}. ${description}. Detailed rendering on a subtle gradient background, dramatic lighting, magical aura, professional concept art style. No text or labels.`,

      location: `Fantasy landscape: ${name}. ${description}. Epic vista, dramatic sky, rich atmospheric lighting, detailed environment art, cinematic composition. No text or labels.`,

      monster: `Fantasy creature illustration: ${name}. ${description}. Menacing pose, dramatic lighting, detailed scales/fur/features, professional monster design, dark fantasy style. No text or labels.`,
    };

    return styleGuides[entityType] || `Fantasy illustration of ${name}. ${description}`;
  }

  private applyStyleToPrompt(prompt: string, style: string): string {
    const styleModifiers: Record<string, string> = {
      'fantasy-portrait': 'High fantasy character portrait, detailed face, dramatic rim lighting, rich jewel tones, professional digital art, painterly style. ',

      'fantasy-scene': 'Epic fantasy scene, cinematic composition, volumetric lighting, rich atmosphere, detailed environment, professional concept art. ',

      'fantasy-item': 'Fantasy item on dark gradient background, magical glow, intricate details, professional concept art, game-ready quality. ',

      'fantasy-creature': 'Dark fantasy creature design, menacing presence, detailed anatomy, dramatic lighting, professional monster illustration. ',
    };

    const modifier = styleModifiers[style] || '';
    return `${modifier}${prompt} Absolutely no text, watermarks, signatures, or labels in the image.`;
  }

  private getStyleForEntityType(
    entityType: string,
  ): ImageGenerationOptions['style'] {
    const styles: Record<string, ImageGenerationOptions['style']> = {
      character: 'fantasy-portrait',
      item: 'fantasy-item',
      location: 'fantasy-scene',
      monster: 'fantasy-creature',
    };
    return styles[entityType] || 'fantasy-portrait';
  }

  private getSizeForEntityType(
    entityType: string,
  ): ImageGenerationOptions['size'] {
    const sizes: Record<string, ImageGenerationOptions['size']> = {
      character: '1024x1024',
      item: '1024x1024',
      location: '1792x1024',
      monster: '1024x1024',
    };
    return sizes[entityType] || '1024x1024';
  }

  async generateBatchImages(
    entities: Array<{
      type: 'character' | 'item' | 'location' | 'monster';
      name: string;
      description: string;
    }>,
  ): Promise<Map<string, GeneratedImage>> {
    const results = new Map<string, GeneratedImage>();

    // Process sequentially to avoid rate limits
    for (const entity of entities) {
      try {
        const image = await this.generateEntityImage(
          entity.type,
          entity.name,
          entity.description,
        );
        results.set(entity.name, image);

        // Rate limit: wait 1 second between requests
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        this.logger.error(`Failed to generate image for ${entity.name}`, error);
        results.set(entity.name, {
          url: 'https://placehold.co/1024x1024/1a1a2e/eee?text=Generation+Failed',
          revisedPrompt: '',
        });
      }
    }

    return results;
  }
}
