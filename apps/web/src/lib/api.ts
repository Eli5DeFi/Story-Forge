// API client for Story-Forge backend

import type {
  Story,
  Chapter,
  Outcome,
  Character,
  Item,
  Location,
  Monster,
  CharacterRelation,
  LoreEntry,
  StoryStats,
  UserStats,
  Bet,
  LeaderboardEntry,
  ActivePoolOutcome,
  StoryNFTs,
  NFTStats,
} from '@/types/story';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.message || `API request failed: ${response.statusText}`,
    );
  }

  return response.json();
}

// Auth functions
export async function authenticateWithWallet(
  walletAddress: string,
  signature: string,
  message: string,
): Promise<{ accessToken: string; user: { id: string; walletAddress: string } }> {
  return fetchApi('/auth/wallet', {
    method: 'POST',
    body: JSON.stringify({ walletAddress, signature, message }),
  });
}

export async function getNonce(walletAddress: string): Promise<{ nonce: string; message: string }> {
  return fetchApi(`/auth/nonce?walletAddress=${walletAddress}`);
}

// Story functions
export async function getStories(params?: {
  status?: string;
  genre?: string;
  limit?: number;
  offset?: number;
}): Promise<{ stories: Story[]; total: number }> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.genre) searchParams.set('genre', params.genre);
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.offset) searchParams.set('offset', params.offset.toString());

  const query = searchParams.toString();
  return fetchApi(`/stories${query ? `?${query}` : ''}`);
}

export async function getStory(storyId: string): Promise<Story> {
  return fetchApi(`/stories/${storyId}`);
}

export async function getStoryStats(storyId: string): Promise<StoryStats> {
  return fetchApi(`/stories/${storyId}/stats`);
}

// Chapter functions
export async function getChapters(
  storyId: string,
  params?: { limit?: number; offset?: number },
): Promise<{ chapters: Chapter[]; total: number }> {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.offset) searchParams.set('offset', params.offset.toString());

  const query = searchParams.toString();
  return fetchApi(`/stories/${storyId}/chapters${query ? `?${query}` : ''}`);
}

export async function getChapter(storyId: string, chapterNumber: number): Promise<Chapter> {
  return fetchApi(`/stories/${storyId}/chapters/${chapterNumber}`);
}

export async function getLatestChapter(storyId: string): Promise<Chapter> {
  return fetchApi(`/stories/${storyId}/chapters/latest`);
}

// Betting functions
export async function getOutcomes(chapterId: string): Promise<Outcome[]> {
  return fetchApi(`/chapters/${chapterId}/outcomes`);
}

export async function placeBet(
  outcomeId: string,
  amount: string,
  token: 'USDC' | 'USDT',
  accessToken: string,
): Promise<Bet> {
  return fetchApi(`/betting/bet`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ outcomeId, amount, token }),
  });
}

export async function getUserBets(
  accessToken: string,
): Promise<Bet[]> {
  return fetchApi(`/betting/user/bets`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function getUserStats(
  accessToken: string,
): Promise<UserStats> {
  return fetchApi(`/users/me/stats`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

// Active betting pools
export async function getActivePools(storyId?: string): Promise<ActivePoolOutcome[]> {
  const searchParams = new URLSearchParams();
  if (storyId) searchParams.set('storyId', storyId);
  const query = searchParams.toString();
  return fetchApi(`/betting/pools/active${query ? `?${query}` : ''}`);
}

// Leaderboard
export async function getLeaderboard(limit?: number): Promise<LeaderboardEntry[]> {
  const query = limit ? `?limit=${limit}` : '';
  return fetchApi(`/leaderboard${query}`);
}

export async function getLeaderboardByWinRate(limit?: number): Promise<LeaderboardEntry[]> {
  const query = limit ? `?limit=${limit}` : '';
  return fetchApi(`/leaderboard/win-rate${query}`);
}

// Story NFTs
export async function getStoryNFTs(storyId: string): Promise<StoryNFTs> {
  return fetchApi(`/stories/${storyId}/nfts`);
}

export async function getNFTStats(storyId: string): Promise<NFTStats> {
  return fetchApi(`/stories/${storyId}/nft-stats`);
}

// Compendium functions
export async function getCharacters(storyId: string): Promise<Character[]> {
  return fetchApi(`/stories/${storyId}/compendium/characters`);
}

export async function getCharacter(storyId: string, characterId: string): Promise<Character> {
  return fetchApi(`/stories/${storyId}/compendium/characters/${characterId}`);
}

export async function getCharacterRelations(
  storyId: string,
  characterId: string,
): Promise<CharacterRelation[]> {
  return fetchApi(`/stories/${storyId}/compendium/characters/${characterId}/relations`);
}

export async function getItems(storyId: string): Promise<Item[]> {
  return fetchApi(`/stories/${storyId}/compendium/items`);
}

export async function getItem(storyId: string, itemId: string): Promise<Item> {
  return fetchApi(`/stories/${storyId}/compendium/items/${itemId}`);
}

export async function getLocations(storyId: string): Promise<Location[]> {
  return fetchApi(`/stories/${storyId}/compendium/locations`);
}

export async function getLocation(storyId: string, locationId: string): Promise<Location> {
  return fetchApi(`/stories/${storyId}/compendium/locations/${locationId}`);
}

export async function getMonsters(storyId: string): Promise<Monster[]> {
  return fetchApi(`/stories/${storyId}/compendium/monsters`);
}

export async function getMonster(storyId: string, monsterId: string): Promise<Monster> {
  return fetchApi(`/stories/${storyId}/compendium/monsters/${monsterId}`);
}

export async function getLoreEntries(
  storyId: string,
  category?: string,
): Promise<LoreEntry[]> {
  const query = category ? `?category=${category}` : '';
  return fetchApi(`/stories/${storyId}/compendium/lore${query}`);
}

export async function getLoreEntry(storyId: string, loreId: string): Promise<LoreEntry> {
  return fetchApi(`/stories/${storyId}/compendium/lore/${loreId}`);
}

// NFT functions
export async function mintEntityNFT(
  entityType: 'character' | 'item' | 'monster',
  entityId: string,
  accessToken: string,
): Promise<{ tokenId: number; transactionHash: string }> {
  return fetchApi(`/nft/mint`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ entityType, entityId }),
  });
}

export async function getNFTMetadata(tokenId: number): Promise<{
  name: string;
  description: string;
  image: string;
  attributes: Array<{ trait_type: string; value: string | number }>;
}> {
  return fetchApi(`/nft/metadata/${tokenId}`);
}

export { ApiError };
