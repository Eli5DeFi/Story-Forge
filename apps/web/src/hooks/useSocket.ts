'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

interface NewEntity {
  type: 'character' | 'item' | 'location' | 'monster';
  id: string;
  name: string;
  chapterNumber: number;
}

interface NFTMinted {
  storyId: string;
  tokenId: number;
  entityType: string;
  entityName: string;
  mintedTo: string;
}

interface Announcement {
  message: string;
  type: 'info' | 'warning' | 'success';
  timestamp: Date;
}

type SocketEvents = {
  'betting:update': BettingUpdate;
  'chapter:update': ChapterUpdate;
  'chapter:new': ChapterUpdate;
  'chapter:new:global': ChapterUpdate & { storyId: string };
  'pool:resolved': PoolResolution;
  'betting:closing_soon': { poolId: number; minutesRemaining: number };
  'entity:new': NewEntity;
  'nft:minted': NFTMinted;
  'nft:minted:global': NFTMinted;
  'announcement': Announcement;
};

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Create socket connection
    socketRef.current = io(`${SOCKET_URL}/events`, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const subscribe = useCallback(
    <K extends keyof SocketEvents>(
      event: K,
      callback: (data: SocketEvents[K]) => void,
    ) => {
      socketRef.current?.on(event, callback as any);

      return () => {
        socketRef.current?.off(event, callback as any);
      };
    },
    [],
  );

  const subscribeToStory = useCallback((storyId: string) => {
    socketRef.current?.emit('subscribe:story', storyId);

    return () => {
      socketRef.current?.emit('unsubscribe:story', storyId);
    };
  }, []);

  const subscribeToPool = useCallback((poolId: number) => {
    socketRef.current?.emit('subscribe:pool', poolId);

    return () => {
      socketRef.current?.emit('unsubscribe:pool', poolId);
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    subscribe,
    subscribeToStory,
    subscribeToPool,
  };
}

// ============ Specialized Hooks ============

export function useStoryUpdates(
  storyId: string,
  callbacks: {
    onChapterUpdate?: (update: ChapterUpdate) => void;
    onNewChapter?: (chapter: ChapterUpdate) => void;
    onNewEntity?: (entity: NewEntity) => void;
    onNFTMinted?: (nft: NFTMinted) => void;
  },
) {
  const { subscribe, subscribeToStory, isConnected } = useSocket();

  useEffect(() => {
    if (!storyId || !isConnected) return;

    const unsubscribe = subscribeToStory(storyId);

    const unsubCallbacks: (() => void)[] = [];

    if (callbacks.onChapterUpdate) {
      unsubCallbacks.push(subscribe('chapter:update', callbacks.onChapterUpdate));
    }
    if (callbacks.onNewChapter) {
      unsubCallbacks.push(subscribe('chapter:new', callbacks.onNewChapter));
    }
    if (callbacks.onNewEntity) {
      unsubCallbacks.push(subscribe('entity:new', callbacks.onNewEntity));
    }
    if (callbacks.onNFTMinted) {
      unsubCallbacks.push(subscribe('nft:minted', callbacks.onNFTMinted));
    }

    return () => {
      unsubscribe();
      unsubCallbacks.forEach((unsub) => unsub());
    };
  }, [storyId, isConnected, subscribe, subscribeToStory, callbacks]);
}

export function usePoolUpdates(
  poolId: number,
  callbacks: {
    onBettingUpdate?: (update: BettingUpdate) => void;
    onPoolResolved?: (resolution: PoolResolution) => void;
    onClosingSoon?: (data: { poolId: number; minutesRemaining: number }) => void;
  },
) {
  const { subscribe, subscribeToPool, isConnected } = useSocket();

  useEffect(() => {
    if (!poolId || !isConnected) return;

    const unsubscribe = subscribeToPool(poolId);

    const unsubCallbacks: (() => void)[] = [];

    if (callbacks.onBettingUpdate) {
      unsubCallbacks.push(subscribe('betting:update', callbacks.onBettingUpdate));
    }
    if (callbacks.onPoolResolved) {
      unsubCallbacks.push(subscribe('pool:resolved', callbacks.onPoolResolved));
    }
    if (callbacks.onClosingSoon) {
      unsubCallbacks.push(subscribe('betting:closing_soon', callbacks.onClosingSoon));
    }

    return () => {
      unsubscribe();
      unsubCallbacks.forEach((unsub) => unsub());
    };
  }, [poolId, isConnected, subscribe, subscribeToPool, callbacks]);
}

export function useGlobalUpdates(callbacks: {
  onNewChapter?: (chapter: ChapterUpdate & { storyId: string }) => void;
  onNFTMinted?: (nft: NFTMinted) => void;
  onAnnouncement?: (announcement: Announcement) => void;
}) {
  const { subscribe, isConnected } = useSocket();

  useEffect(() => {
    if (!isConnected) return;

    const unsubCallbacks: (() => void)[] = [];

    if (callbacks.onNewChapter) {
      unsubCallbacks.push(subscribe('chapter:new:global', callbacks.onNewChapter));
    }
    if (callbacks.onNFTMinted) {
      unsubCallbacks.push(subscribe('nft:minted:global', callbacks.onNFTMinted));
    }
    if (callbacks.onAnnouncement) {
      unsubCallbacks.push(subscribe('announcement', callbacks.onAnnouncement));
    }

    return () => {
      unsubCallbacks.forEach((unsub) => unsub());
    };
  }, [isConnected, subscribe, callbacks]);
}
