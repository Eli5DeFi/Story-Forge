// Story types for the frontend

export type StoryStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
export type ChapterStatus = 'GENERATING' | 'BETTING_OPEN' | 'BETTING_CLOSED' | 'RESOLVED';
export type BetStatus = 'PENDING' | 'WON' | 'LOST' | 'REFUNDED';

export interface Story {
  id: string;
  title: string;
  description: string;
  genre: string;
  coverImage?: string;
  status: StoryStatus;
  currentChapter: number;
  createdAt: string;
  updatedAt: string;
  worldState?: WorldState;
  _count?: {
    chapters: number;
    characters: number;
    items: number;
    locations: number;
    monsters: number;
  };
}

export interface Chapter {
  id: string;
  storyId: string;
  chapterNumber: number;
  title: string;
  content: string;
  summary: string;
  status: ChapterStatus;
  publishedAt: string;
  bettingEndsAt?: string;
  selectedOutcome?: string;
  aiReasoning?: string;
  ipfsHash?: string;
  outcomes: Outcome[];
}

export interface Outcome {
  id: string;
  chapterId: string;
  optionNumber: number;
  teaserText: string;
  emotionalTone: string;
  plotImplications: string[];
  isSelected: boolean;
  bettingPool?: BettingPool;
}

export interface BettingPool {
  id: string;
  chapterId: string;
  outcomeId: string;
  totalAmount: string;
  status: string;
  bets: Bet[];
  _count?: {
    bets: number;
  };
}

export interface Bet {
  id: string;
  poolId: string;
  walletAddress: string;
  amount: string;
  status: BetStatus;
  createdAt: string;
  payout?: string;
}

export interface Character {
  id: string;
  storyId: string;
  name: string;
  description: string;
  imageUrl?: string;
  status: string;
  traits?: {
    personality?: string[];
    abilities?: string[];
  };
  firstAppearance: number;
  nftTokenId?: number;
  nftIpfsUri?: string;
}

export interface Item {
  id: string;
  storyId: string;
  name: string;
  description: string;
  imageUrl?: string;
  type: string;
  rarity: string;
  firstAppearance: number;
  nftTokenId?: number;
  nftIpfsUri?: string;
}

export interface Location {
  id: string;
  storyId: string;
  name: string;
  description: string;
  imageUrl?: string;
  type: string;
  region?: string;
  firstAppearance: number;
}

export interface Monster {
  id: string;
  storyId: string;
  name: string;
  description: string;
  imageUrl?: string;
  species?: string;
  threatLevel: number;
  abilities: string[];
  weaknesses: string[];
  isBoss: boolean;
  firstAppearance: number;
  nftTokenId?: number;
  nftIpfsUri?: string;
}

export interface CharacterRelation {
  id: string;
  characterA: Character;
  characterB: Character;
  relationship: string;
  description?: string;
  establishedCh: number;
}

export interface LoreEntry {
  id: string;
  storyId: string;
  category: string;
  title: string;
  content: string;
  relatedEntities: string[];
  chapterRefs: number[];
}

export interface WorldState {
  currentLocation?: string;
  timeOfDay?: string;
  weather?: string;
  activeQuests?: string[];
  recentEvents?: string[];
  factions?: Record<string, { reputation: number; stance: string }>;
}

export interface StoryStats {
  totalBets: string;
  totalBettors: number;
  totalChapters: number;
  totalEntities: number;
}

export interface UserStats {
  totalBets: number;
  totalWins: number;
  totalLosses: number;
  totalEarnings: string;
  winRate: number;
  // Extended stats for profile page
  wins?: number;
  losses?: number;
  pending?: number;
  totalWinnings?: string;
  totalWagered?: string;
  netProfit?: string;
  biggestWin?: string;
  uniqueStories?: number;
}

export interface PlaceBetParams {
  outcomeId: string;
  amount: string;
  token: 'USDC' | 'USDT';
}

export interface LeaderboardEntry {
  walletAddress: string;
  username?: string;
  totalBets: number;
  totalWins: number;
  totalLosses: number;
  totalWon: string;
  winRate: number;
  winStreak: number;
}

export type ActivePoolOutcome = Outcome & {
  chapter: {
    id: string;
    chapterNumber: number;
    title: string;
    bettingEndsAt?: string;
    story: { id: string; title: string };
  };
};

export interface StoryNFTs {
  characters: Character[];
  items: Item[];
  locations: Location[];
  monsters: Monster[];
}

export interface NFTStats {
  totalEntities: number;
  totalMinted: number;
  entityCounts: {
    characters: number;
    items: number;
    locations: number;
    monsters: number;
  };
}
