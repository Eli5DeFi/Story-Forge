import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createReadStream } from 'fs';
import { writeFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomUUID } from 'crypto';

interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
    display_type?: string;
  }>;
  story_forge: {
    story_id: string;
    story_title: string;
    entity_type: string;
    first_appearance: {
      chapter: number;
      chapter_title: string;
    };
    lore_excerpt: string;
  };
}

@Injectable()
export class IpfsService {
  private readonly logger = new Logger(IpfsService.name);
  private readonly pinataApiKey: string;
  private readonly pinataSecretKey: string;
  private readonly pinataBaseUrl = 'https://api.pinata.cloud';

  constructor(private configService: ConfigService) {
    this.pinataApiKey = this.configService.get('PINATA_API_KEY') || '';
    this.pinataSecretKey = this.configService.get('PINATA_SECRET_KEY') || '';
  }

  private get isConfigured(): boolean {
    return !!(this.pinataApiKey && this.pinataSecretKey);
  }

  async uploadJSON(data: object, name?: string): Promise<string> {
    if (!this.isConfigured) {
      this.logger.warn('Pinata not configured, returning mock CID');
      return `Qm${randomUUID().replace(/-/g, '').substring(0, 44)}`;
    }

    try {
      const response = await fetch(`${this.pinataBaseUrl}/pinning/pinJSONToIPFS`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          pinata_api_key: this.pinataApiKey,
          pinata_secret_api_key: this.pinataSecretKey,
        },
        body: JSON.stringify({
          pinataContent: data,
          pinataMetadata: {
            name: name || `story-forge-${Date.now()}`,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Pinata upload failed: ${response.statusText}`);
      }

      const result: PinataResponse = await response.json();
      this.logger.log(`Uploaded JSON to IPFS: ${result.IpfsHash}`);
      return result.IpfsHash;
    } catch (error) {
      this.logger.error('Failed to upload JSON to IPFS', error);
      throw error;
    }
  }

  async uploadImageFromUrl(imageUrl: string, name?: string): Promise<string> {
    if (!this.isConfigured) {
      this.logger.warn('Pinata not configured, returning mock CID');
      return `Qm${randomUUID().replace(/-/g, '').substring(0, 44)}`;
    }

    try {
      // Download image to temp file
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to download image: ${imageResponse.statusText}`);
      }

      const buffer = await imageResponse.arrayBuffer();
      const tempPath = join(tmpdir(), `story-forge-${randomUUID()}.png`);
      await writeFile(tempPath, Buffer.from(buffer));

      // Upload to Pinata
      const formData = new FormData();
      const fileBlob = new Blob([await fetch(`file://${tempPath}`).then(r => r.arrayBuffer())]);
      formData.append('file', fileBlob, name || 'image.png');
      formData.append(
        'pinataMetadata',
        JSON.stringify({ name: name || `story-forge-image-${Date.now()}` }),
      );

      const response = await fetch(`${this.pinataBaseUrl}/pinning/pinFileToIPFS`, {
        method: 'POST',
        headers: {
          pinata_api_key: this.pinataApiKey,
          pinata_secret_api_key: this.pinataSecretKey,
        },
        body: formData,
      });

      // Clean up temp file
      await unlink(tempPath).catch(() => {});

      if (!response.ok) {
        throw new Error(`Pinata upload failed: ${response.statusText}`);
      }

      const result: PinataResponse = await response.json();
      this.logger.log(`Uploaded image to IPFS: ${result.IpfsHash}`);
      return result.IpfsHash;
    } catch (error) {
      this.logger.error('Failed to upload image to IPFS', error);
      throw error;
    }
  }

  async uploadBuffer(buffer: Buffer, filename: string): Promise<string> {
    if (!this.isConfigured) {
      this.logger.warn('Pinata not configured, returning mock CID');
      return `Qm${randomUUID().replace(/-/g, '').substring(0, 44)}`;
    }

    try {
      const formData = new FormData();
      const blob = new Blob([buffer]);
      formData.append('file', blob, filename);
      formData.append(
        'pinataMetadata',
        JSON.stringify({ name: filename }),
      );

      const response = await fetch(`${this.pinataBaseUrl}/pinning/pinFileToIPFS`, {
        method: 'POST',
        headers: {
          pinata_api_key: this.pinataApiKey,
          pinata_secret_api_key: this.pinataSecretKey,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Pinata upload failed: ${response.statusText}`);
      }

      const result: PinataResponse = await response.json();
      this.logger.log(`Uploaded buffer to IPFS: ${result.IpfsHash}`);
      return result.IpfsHash;
    } catch (error) {
      this.logger.error('Failed to upload buffer to IPFS', error);
      throw error;
    }
  }

  async uploadNFTMetadata(metadata: NFTMetadata): Promise<string> {
    return this.uploadJSON(metadata, `nft-${metadata.name.toLowerCase().replace(/\s+/g, '-')}`);
  }

  async uploadChapterContent(
    storyId: string,
    chapterNumber: number,
    content: string,
  ): Promise<string> {
    const data = {
      storyId,
      chapterNumber,
      content,
      timestamp: new Date().toISOString(),
    };

    return this.uploadJSON(data, `chapter-${storyId}-${chapterNumber}`);
  }

  buildIpfsUrl(cid: string): string {
    return `ipfs://${cid}`;
  }

  buildGatewayUrl(cid: string): string {
    return `https://gateway.pinata.cloud/ipfs/${cid}`;
  }

  async buildNFTMetadata(
    entity: {
      name: string;
      description: string;
      type: string;
      firstAppearance: number;
      traits?: Record<string, any>;
    },
    storyInfo: {
      storyId: string;
      storyTitle: string;
      chapterTitle: string;
    },
    imageCid: string,
  ): Promise<NFTMetadata> {
    const attributes: NFTMetadata['attributes'] = [
      { trait_type: 'Entity Type', value: entity.type },
      { trait_type: 'First Appearance', value: entity.firstAppearance },
      { trait_type: 'Story', value: storyInfo.storyTitle },
    ];

    // Add additional traits if available
    if (entity.traits) {
      for (const [key, value] of Object.entries(entity.traits)) {
        if (typeof value === 'string' || typeof value === 'number') {
          attributes.push({
            trait_type: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
            value,
          });
        }
      }
    }

    return {
      name: entity.name,
      description: entity.description,
      image: this.buildIpfsUrl(imageCid),
      external_url: `https://storyforge.io/compendium/${entity.type.toLowerCase()}s/${entity.name.toLowerCase().replace(/\s+/g, '-')}`,
      attributes,
      story_forge: {
        story_id: storyInfo.storyId,
        story_title: storyInfo.storyTitle,
        entity_type: entity.type,
        first_appearance: {
          chapter: entity.firstAppearance,
          chapter_title: storyInfo.chapterTitle,
        },
        lore_excerpt: entity.description.substring(0, 200) + '...',
      },
    };
  }
}
