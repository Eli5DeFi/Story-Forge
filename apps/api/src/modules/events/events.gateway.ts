import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

interface BettingUpdate {
  poolId: number;
  outcomeId: number;
  totalAmount: string;
  voterCount: number;
}

interface ChapterUpdate {
  storyId: string;
  chapterId: string;
  chapterNumber: number;
  status: 'GENERATING' | 'BETTING_OPEN' | 'BETTING_CLOSED' | 'RESOLVED';
  title?: string;
}

interface PoolResolution {
  poolId: number;
  winningOutcome: number;
  totalPayout: string;
  winners: number;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/events',
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);

  // Track subscriptions
  private storySubscriptions = new Map<string, Set<string>>(); // storyId -> Set<socketId>
  private poolSubscriptions = new Map<number, Set<string>>(); // poolId -> Set<socketId>

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    // Clean up subscriptions
    this.storySubscriptions.forEach((sockets, storyId) => {
      sockets.delete(client.id);
      if (sockets.size === 0) {
        this.storySubscriptions.delete(storyId);
      }
    });

    this.poolSubscriptions.forEach((sockets, poolId) => {
      sockets.delete(client.id);
      if (sockets.size === 0) {
        this.poolSubscriptions.delete(poolId);
      }
    });
  }

  // ============ Client Subscriptions ============

  @SubscribeMessage('subscribe:story')
  handleSubscribeStory(
    @ConnectedSocket() client: Socket,
    @MessageBody() storyId: string,
  ) {
    if (!this.storySubscriptions.has(storyId)) {
      this.storySubscriptions.set(storyId, new Set());
    }
    this.storySubscriptions.get(storyId)!.add(client.id);

    client.join(`story:${storyId}`);
    this.logger.debug(`Client ${client.id} subscribed to story ${storyId}`);

    return { success: true, storyId };
  }

  @SubscribeMessage('unsubscribe:story')
  handleUnsubscribeStory(
    @ConnectedSocket() client: Socket,
    @MessageBody() storyId: string,
  ) {
    this.storySubscriptions.get(storyId)?.delete(client.id);
    client.leave(`story:${storyId}`);

    return { success: true, storyId };
  }

  @SubscribeMessage('subscribe:pool')
  handleSubscribePool(
    @ConnectedSocket() client: Socket,
    @MessageBody() poolId: number,
  ) {
    if (!this.poolSubscriptions.has(poolId)) {
      this.poolSubscriptions.set(poolId, new Set());
    }
    this.poolSubscriptions.get(poolId)!.add(client.id);

    client.join(`pool:${poolId}`);
    this.logger.debug(`Client ${client.id} subscribed to pool ${poolId}`);

    return { success: true, poolId };
  }

  @SubscribeMessage('unsubscribe:pool')
  handleUnsubscribePool(
    @ConnectedSocket() client: Socket,
    @MessageBody() poolId: number,
  ) {
    this.poolSubscriptions.get(poolId)?.delete(client.id);
    client.leave(`pool:${poolId}`);

    return { success: true, poolId };
  }

  // ============ Server-side Events ============

  /**
   * Emit when a bet is placed on a pool outcome
   */
  emitBettingUpdate(poolId: number, update: BettingUpdate) {
    this.server.to(`pool:${poolId}`).emit('betting:update', update);
    this.logger.debug(`Emitted betting update for pool ${poolId}`);
  }

  /**
   * Emit when a chapter status changes
   */
  emitChapterUpdate(storyId: string, update: ChapterUpdate) {
    this.server.to(`story:${storyId}`).emit('chapter:update', update);
    this.logger.debug(`Emitted chapter update for story ${storyId}`);
  }

  /**
   * Emit when a new chapter is published
   */
  emitNewChapter(storyId: string, chapter: ChapterUpdate) {
    this.server.to(`story:${storyId}`).emit('chapter:new', chapter);
    // Also emit globally for homepage updates
    this.server.emit('chapter:new:global', chapter);
    this.logger.debug(`Emitted new chapter for story ${storyId}`);
  }

  /**
   * Emit when a pool is resolved
   */
  emitPoolResolution(poolId: number, resolution: PoolResolution) {
    this.server.to(`pool:${poolId}`).emit('pool:resolved', resolution);
    this.logger.debug(`Emitted pool resolution for pool ${poolId}`);
  }

  /**
   * Emit when betting is about to close (countdown warning)
   */
  emitBettingClosingSoon(poolId: number, minutesRemaining: number) {
    this.server.to(`pool:${poolId}`).emit('betting:closing_soon', {
      poolId,
      minutesRemaining,
    });
  }

  /**
   * Emit when a new entity is extracted from a chapter
   */
  emitNewEntity(
    storyId: string,
    entity: {
      type: 'character' | 'item' | 'location' | 'monster';
      id: string;
      name: string;
      chapterNumber: number;
    },
  ) {
    this.server.to(`story:${storyId}`).emit('entity:new', entity);
  }

  /**
   * Emit when an NFT is minted
   */
  emitNFTMinted(
    storyId: string,
    nft: {
      tokenId: number;
      entityType: string;
      entityName: string;
      mintedTo: string;
    },
  ) {
    this.server.to(`story:${storyId}`).emit('nft:minted', nft);
    // Also emit globally
    this.server.emit('nft:minted:global', { storyId, ...nft });
  }

  /**
   * Broadcast a system-wide announcement
   */
  emitAnnouncement(message: string, type: 'info' | 'warning' | 'success' = 'info') {
    this.server.emit('announcement', { message, type, timestamp: new Date() });
  }

  // ============ Stats ============

  getConnectionStats() {
    return {
      totalConnections: this.server.sockets.sockets.size,
      storySubscriptions: Object.fromEntries(
        Array.from(this.storySubscriptions.entries()).map(([k, v]) => [k, v.size]),
      ),
      poolSubscriptions: Object.fromEntries(
        Array.from(this.poolSubscriptions.entries()).map(([k, v]) => [k, v.size]),
      ),
    };
  }
}
