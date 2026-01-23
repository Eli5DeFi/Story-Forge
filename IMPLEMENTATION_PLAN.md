# Story-Forge: Interactive AI Web Novel Platform
## Implementation Plan

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Core Features](#core-features)
5. [Database Schema](#database-schema)
6. [Smart Contract Architecture](#smart-contract-architecture)
7. [AI Story Generation System](#ai-story-generation-system)
8. [NFT Minting System](#nft-minting-system)
9. [Compendium System](#compendium-system)
10. [API Design](#api-design)
11. [Frontend Architecture](#frontend-architecture)
12. [Security Considerations](#security-considerations)
13. [Development Roadmap](#development-roadmap)
14. [Cost Estimates](#cost-estimates)

---

## Executive Summary

Story-Forge is an innovative Web3 platform that combines AI-generated fantasy storytelling with prediction markets. Every 3 days, an AI generates a new chapter, presenting readers with 4-5 possible story outcomes. Readers can stake USDC/USDT to predict which outcome the AI will select, creating a unique "winner-takes-all" betting experience tied to narrative progression.

### Key Features
- **AI Story Generation**: Fantasy novel chapters generated every 3 days
- **Prediction Markets**: Readers bet on story outcomes using USDC/USDT
- **Winner-Takes-All Distribution**: 85% to winners, 15% to treasury
- **NFT Collection**: 1/1 NFTs for characters, items, monsters, and locations
- **Living Compendium**: Dynamic lore database with relationship diagrams

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND LAYER                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │   Reader    │ │  Betting    │ │ Compendium  │ │      NFT Gallery        ││
│  │   Portal    │ │  Interface  │ │   & Lore    │ │     & Marketplace       ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY                                     │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  Authentication │ Rate Limiting │ Request Routing │ WebSocket Manager   ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          ▼                           ▼                           ▼
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────────────┐
│   STORY SERVICE  │      │  BETTING SERVICE │      │    COMPENDIUM SERVICE    │
│                  │      │                  │      │                          │
│ • Chapter Gen    │      │ • Pool Management│      │ • Entity Extraction      │
│ • Outcome Gen    │      │ • Deposit Handle │      │ • Relationship Mapping   │
│ • Story State    │      │ • Distribution   │      │ • Lore Aggregation       │
│ • AI Orchestrator│      │ • Fee Collection │      │ • Search & Query         │
└──────────────────┘      └──────────────────┘      └──────────────────────────┘
          │                           │                           │
          └───────────────────────────┼───────────────────────────┘
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BLOCKCHAIN LAYER                                   │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────────────────┐│
│  │  Betting Pool   │ │   Treasury      │ │       NFT Contracts             ││
│  │   Contract      │ │   Contract      │ │  (Characters/Items/Monsters)    ││
│  └─────────────────┘ └─────────────────┘ └─────────────────────────────────┘│
│                              (Story Chain / Base / Polygon)                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DATA LAYER                                        │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────────────────┐│
│  │   PostgreSQL    │ │     Redis       │ │          IPFS/Arweave           ││
│  │  (Main Store)   │ │  (Cache/Queue)  │ │   (Story & NFT Metadata)        ││
│  └─────────────────┘ └─────────────────┘ └─────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          AI GENERATION LAYER                                 │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────────────────┐│
│  │ Story Generator │ │ Image Generator │ │     Entity Extractor            ││
│  │   (Claude/GPT)  │ │  (DALL-E/MJ)    │ │    (NLP Pipeline)               ││
│  └─────────────────┘ └─────────────────┘ └─────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
| Component | Technology | Rationale |
|-----------|------------|-----------|
| Framework | Next.js 14+ | SSR, App Router, excellent DX |
| Language | TypeScript | Type safety, better maintainability |
| Styling | Tailwind CSS + shadcn/ui | Rapid development, consistent design |
| State Management | Zustand + TanStack Query | Lightweight, excellent async handling |
| Web3 Integration | wagmi + viem | Modern, type-safe Ethereum interaction |
| Wallet Connection | RainbowKit / ConnectKit | User-friendly wallet UX |
| Charts/Visualization | D3.js + Recharts | Relationship diagrams, betting analytics |
| Real-time Updates | Socket.io | Live betting updates, chapter releases |

### Backend
| Component | Technology | Rationale |
|-----------|------------|-----------|
| Runtime | Node.js 20+ | JavaScript ecosystem, async I/O |
| Framework | NestJS | Enterprise-grade, modular architecture |
| API | REST + GraphQL | Flexibility for different use cases |
| Database ORM | Prisma | Type-safe database access |
| Job Queue | BullMQ + Redis | Reliable background job processing |
| Caching | Redis | High-performance caching |
| WebSocket | Socket.io | Real-time communication |

### Blockchain
| Component | Technology | Rationale |
|-----------|------------|-----------|
| Primary Chain | Base / Polygon | Low fees, EVM compatible, stable |
| Smart Contracts | Solidity | Industry standard |
| Development | Hardhat + Foundry | Testing, deployment, verification |
| Stablecoins | USDC, USDT | User familiarity, stability |
| NFT Standard | ERC-721 | 1/1 unique tokens |
| Indexing | The Graph / Envio | Efficient on-chain data queries |

### AI & Storage
| Component | Technology | Rationale |
|-----------|------------|-----------|
| Story Generation | Claude API / GPT-4 | High-quality narrative generation |
| Image Generation | DALL-E 3 / Midjourney API | Character/scene illustrations |
| Entity Extraction | Custom NLP pipeline | Extract characters, items, locations |
| Decentralized Storage | IPFS + Arweave | Permanent story and NFT storage |
| File Storage | AWS S3 / Cloudflare R2 | CDN-backed media delivery |

### Infrastructure
| Component | Technology | Rationale |
|-----------|------------|-----------|
| Hosting | Vercel (Frontend) + Railway/Render (Backend) | Managed, auto-scaling |
| Database | Supabase / Neon PostgreSQL | Managed Postgres with realtime |
| Monitoring | Sentry + Datadog | Error tracking, performance |
| CI/CD | GitHub Actions | Automated testing and deployment |

---

## Core Features

### 1. Story Reading Experience

```
┌────────────────────────────────────────────────────────────────┐
│                     CHAPTER VIEWER                              │
├────────────────────────────────────────────────────────────────┤
│  Chapter 12: The Dragon's Bargain                              │
│  ─────────────────────────────────────────────────────────────│
│                                                                 │
│  [Immersive chapter content with inline illustrations]          │
│                                                                 │
│  The ancient dragon's scales shimmered like molten gold as      │
│  Aria raised her blade. "You seek the Cipher Stone," it        │
│  rumbled, smoke curling from its nostrils. "But what will      │
│  you sacrifice to claim it?"                                    │
│                                                                 │
│  [Character portrait: Aria]  [Scene illustration]              │
│                                                                 │
├────────────────────────────────────────────────────────────────┤
│  📖 Previous Chapters │ 🏆 Leaderboard │ 📚 Compendium         │
└────────────────────────────────────────────────────────────────┘
```

### 2. Prediction Market Interface

```
┌────────────────────────────────────────────────────────────────┐
│              CHAPTER 12 OUTCOME PREDICTIONS                     │
│              ⏱️ Time Remaining: 2d 14h 32m                      │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🔮 WHAT WILL ARIA CHOOSE?                                     │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Option A: Trade her memories for the stone               │  │
│  │ Pool: 12,450 USDC │ Odds: 3.2x │ Voters: 234            │  │
│  │ [───────────────█████░░░░░░░░░░░░] 31%                   │  │
│  │                              [Deposit USDC] [Deposit USDT]│  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Option B: Challenge the dragon to a riddle contest       │  │
│  │ Pool: 8,200 USDC │ Odds: 4.9x │ Voters: 156             │  │
│  │ [───────────────███░░░░░░░░░░░░░░] 20%                   │  │
│  │                              [Deposit USDC] [Deposit USDT]│  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Option C: Attempt to steal the stone while it sleeps     │  │
│  │ Pool: 15,800 USDC │ Odds: 2.5x │ Voters: 412            │  │
│  │ [───────────────███████░░░░░░░░░] 40%                    │  │
│  │                              [Deposit USDC] [Deposit USDT]│  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Option D: Form an alliance - share the stone's power     │  │
│  │ Pool: 3,550 USDC │ Odds: 11.3x │ Voters: 78             │  │
│  │ [───────────────█░░░░░░░░░░░░░░░░] 9%                    │  │
│  │                              [Deposit USDC] [Deposit USDT]│  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Total Pool: 40,000 USDC │ 2% Fee Applied                      │
│  Your Bets: Option C - 50 USDC                                 │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### 3. Betting Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BETTING LIFECYCLE                                  │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
  │   Chapter   │     │   Betting   │     │  AI Selects │     │   Payout    │
  │  Published  │────▶│   Period    │────▶│   Outcome   │────▶│ Distribution│
  │             │     │  (3 days)   │     │             │     │             │
  └─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                            │                    │                    │
                            ▼                    ▼                    ▼
                      ┌───────────┐        ┌───────────┐        ┌───────────┐
                      │ Users     │        │ Outcome   │        │ 85% to    │
                      │ deposit   │        │ revealed  │        │ winners   │
                      │ USDC/USDT │        │ with new  │        │           │
                      │ to pools  │        │ chapter   │        │ 15% to    │
                      │           │        │           │        │ treasury  │
                      │ 2% fee    │        │           │        │           │
                      │ deducted  │        │ If no     │        │ If no     │
                      └───────────┘        │ winners:  │        │ winners:  │
                                           │ carry over│        │ rollover  │
                                           └───────────┘        └───────────┘
```

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATABASE SCHEMA                                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     USERS       │       │     STORIES     │       │    CHAPTERS     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ wallet_address  │       │ title           │       │ story_id (FK)   │
│ username        │       │ synopsis        │       │ chapter_number  │
│ created_at      │       │ genre           │       │ title           │
│ total_wagered   │       │ status          │       │ content         │
│ total_won       │       │ cover_image_url │       │ published_at    │
│ win_streak      │       │ created_at      │       │ selected_outcome│
└────────┬────────┘       │ current_chapter │       │ ipfs_hash       │
         │                └────────┬────────┘       │ status          │
         │                         │                └────────┬────────┘
         │                         │                         │
         │    ┌────────────────────┘                         │
         │    │                                              │
         ▼    ▼                                              ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   USER_BETS     │       │    OUTCOMES     │       │  BETTING_POOLS  │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ user_id (FK)    │◀──────│ chapter_id (FK) │──────▶│ chapter_id (FK) │
│ outcome_id (FK) │       │ option_number   │       │ outcome_id (FK) │
│ pool_id (FK)    │       │ teaser_text     │       │ total_amount    │
│ amount          │       │ full_narrative  │       │ token_type      │
│ token_type      │       │ is_selected     │       │ voter_count     │
│ fee_paid        │       │ ai_reasoning    │       │ status          │
│ tx_hash         │       └─────────────────┘       │ created_at      │
│ status          │                                 │ resolved_at     │
│ created_at      │                                 │ carryover_amount│
│ claimed_at      │                                 └─────────────────┘
└─────────────────┘

┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   CHARACTERS    │       │   CHAR_RELS     │       │     ITEMS       │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ story_id (FK)   │◀──────│ char_a_id (FK)  │       │ story_id (FK)   │
│ name            │       │ char_b_id (FK)  │       │ name            │
│ description     │       │ relationship    │       │ description     │
│ first_appearance│       │ established_ch  │       │ type            │
│ image_url       │       │ notes           │       │ rarity          │
│ traits          │       └─────────────────┘       │ first_appearance│
│ nft_token_id    │                                 │ owner_char_id   │
│ nft_minted      │                                 │ image_url       │
└─────────────────┘                                 │ nft_token_id    │
                                                    └─────────────────┘

┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    LOCATIONS    │       │    MONSTERS     │       │  LORE_ENTRIES   │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ story_id (FK)   │       │ story_id (FK)   │       │ story_id (FK)   │
│ name            │       │ name            │       │ category        │
│ description     │       │ description     │       │ title           │
│ type            │       │ threat_level    │       │ content         │
│ first_appearance│       │ abilities       │       │ related_entities│
│ connected_locs  │       │ weaknesses      │       │ chapter_refs    │
│ image_url       │       │ first_appearance│       │ created_at      │
│ nft_token_id    │       │ image_url       │       │ updated_at      │
└─────────────────┘       │ nft_token_id    │       └─────────────────┘
                          └─────────────────┘

┌─────────────────┐       ┌─────────────────┐
│   TREASURY      │       │   PAYOUTS       │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ pool_id (FK)    │       │ user_id (FK)    │
│ amount          │       │ pool_id (FK)    │
│ token_type      │       │ amount          │
│ source          │       │ token_type      │
│ tx_hash         │       │ tx_hash         │
│ created_at      │       │ status          │
└─────────────────┘       │ created_at      │
                          └─────────────────┘
```

### Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id             String    @id @default(cuid())
  walletAddress  String    @unique @map("wallet_address")
  username       String?
  createdAt      DateTime  @default(now()) @map("created_at")
  totalWagered   Decimal   @default(0) @map("total_wagered") @db.Decimal(20, 6)
  totalWon       Decimal   @default(0) @map("total_won") @db.Decimal(20, 6)
  winStreak      Int       @default(0) @map("win_streak")

  bets           UserBet[]
  payouts        Payout[]

  @@map("users")
}

model Story {
  id              String      @id @default(cuid())
  title           String
  synopsis        String      @db.Text
  genre           String
  status          StoryStatus @default(ACTIVE)
  coverImageUrl   String?     @map("cover_image_url")
  createdAt       DateTime    @default(now()) @map("created_at")
  currentChapter  Int         @default(0) @map("current_chapter")

  chapters        Chapter[]
  characters      Character[]
  items           Item[]
  locations       Location[]
  monsters        Monster[]
  loreEntries     LoreEntry[]

  @@map("stories")
}

enum StoryStatus {
  ACTIVE
  PAUSED
  COMPLETED
  ARCHIVED
}

model Chapter {
  id              String        @id @default(cuid())
  storyId         String        @map("story_id")
  chapterNumber   Int           @map("chapter_number")
  title           String
  content         String        @db.Text
  publishedAt     DateTime?     @map("published_at")
  selectedOutcome String?       @map("selected_outcome")
  ipfsHash        String?       @map("ipfs_hash")
  status          ChapterStatus @default(DRAFT)

  story           Story         @relation(fields: [storyId], references: [id])
  outcomes        Outcome[]
  bettingPools    BettingPool[]

  @@unique([storyId, chapterNumber])
  @@map("chapters")
}

enum ChapterStatus {
  DRAFT
  PUBLISHED
  BETTING_OPEN
  BETTING_CLOSED
  RESOLVED
}

model Outcome {
  id            String   @id @default(cuid())
  chapterId     String   @map("chapter_id")
  optionNumber  Int      @map("option_number")
  teaserText    String   @map("teaser_text") @db.Text
  fullNarrative String?  @map("full_narrative") @db.Text
  isSelected    Boolean  @default(false) @map("is_selected")
  aiReasoning   String?  @map("ai_reasoning") @db.Text

  chapter       Chapter      @relation(fields: [chapterId], references: [id])
  bettingPool   BettingPool?
  userBets      UserBet[]

  @@unique([chapterId, optionNumber])
  @@map("outcomes")
}

model BettingPool {
  id              String          @id @default(cuid())
  chapterId       String          @map("chapter_id")
  outcomeId       String          @unique @map("outcome_id")
  totalAmount     Decimal         @default(0) @map("total_amount") @db.Decimal(20, 6)
  tokenType       TokenType       @map("token_type")
  voterCount      Int             @default(0) @map("voter_count")
  status          PoolStatus      @default(OPEN)
  createdAt       DateTime        @default(now()) @map("created_at")
  resolvedAt      DateTime?       @map("resolved_at")
  carryoverAmount Decimal         @default(0) @map("carryover_amount") @db.Decimal(20, 6)

  chapter         Chapter         @relation(fields: [chapterId], references: [id])
  outcome         Outcome         @relation(fields: [outcomeId], references: [id])
  userBets        UserBet[]
  treasuryEntries TreasuryEntry[]
  payouts         Payout[]

  @@map("betting_pools")
}

enum TokenType {
  USDC
  USDT
}

enum PoolStatus {
  OPEN
  CLOSED
  RESOLVED
  CARRIED_OVER
}

model UserBet {
  id        String    @id @default(cuid())
  userId    String    @map("user_id")
  outcomeId String    @map("outcome_id")
  poolId    String    @map("pool_id")
  amount    Decimal   @db.Decimal(20, 6)
  tokenType TokenType @map("token_type")
  feePaid   Decimal   @map("fee_paid") @db.Decimal(20, 6)
  txHash    String    @map("tx_hash")
  status    BetStatus @default(PENDING)
  createdAt DateTime  @default(now()) @map("created_at")
  claimedAt DateTime? @map("claimed_at")

  user      User        @relation(fields: [userId], references: [id])
  outcome   Outcome     @relation(fields: [outcomeId], references: [id])
  pool      BettingPool @relation(fields: [poolId], references: [id])

  @@map("user_bets")
}

enum BetStatus {
  PENDING
  CONFIRMED
  WON
  LOST
  CLAIMED
  REFUNDED
}

model Character {
  id              String   @id @default(cuid())
  storyId         String   @map("story_id")
  name            String
  description     String   @db.Text
  firstAppearance Int      @map("first_appearance")
  imageUrl        String?  @map("image_url")
  traits          Json?
  nftTokenId      String?  @map("nft_token_id")
  nftMinted       Boolean  @default(false) @map("nft_minted")

  story           Story              @relation(fields: [storyId], references: [id])
  relationshipsA  CharacterRelation[] @relation("CharacterA")
  relationshipsB  CharacterRelation[] @relation("CharacterB")
  items           Item[]

  @@unique([storyId, name])
  @@map("characters")
}

model CharacterRelation {
  id             String    @id @default(cuid())
  characterAId   String    @map("character_a_id")
  characterBId   String    @map("character_b_id")
  relationship   String
  establishedCh  Int       @map("established_chapter")
  notes          String?   @db.Text

  characterA     Character @relation("CharacterA", fields: [characterAId], references: [id])
  characterB     Character @relation("CharacterB", fields: [characterBId], references: [id])

  @@unique([characterAId, characterBId])
  @@map("character_relations")
}

model Item {
  id              String     @id @default(cuid())
  storyId         String     @map("story_id")
  name            String
  description     String     @db.Text
  type            ItemType
  rarity          Rarity     @default(COMMON)
  firstAppearance Int        @map("first_appearance")
  ownerCharId     String?    @map("owner_char_id")
  imageUrl        String?    @map("image_url")
  nftTokenId      String?    @map("nft_token_id")
  nftMinted       Boolean    @default(false) @map("nft_minted")

  story           Story      @relation(fields: [storyId], references: [id])
  ownerCharacter  Character? @relation(fields: [ownerCharId], references: [id])

  @@unique([storyId, name])
  @@map("items")
}

enum ItemType {
  WEAPON
  ARMOR
  ACCESSORY
  CONSUMABLE
  KEY_ITEM
  ARTIFACT
}

enum Rarity {
  COMMON
  UNCOMMON
  RARE
  EPIC
  LEGENDARY
  MYTHIC
}

model Location {
  id              String   @id @default(cuid())
  storyId         String   @map("story_id")
  name            String
  description     String   @db.Text
  type            String
  firstAppearance Int      @map("first_appearance")
  connectedLocs   String[] @map("connected_locations")
  imageUrl        String?  @map("image_url")
  nftTokenId      String?  @map("nft_token_id")
  nftMinted       Boolean  @default(false) @map("nft_minted")

  story           Story    @relation(fields: [storyId], references: [id])

  @@unique([storyId, name])
  @@map("locations")
}

model Monster {
  id              String   @id @default(cuid())
  storyId         String   @map("story_id")
  name            String
  description     String   @db.Text
  threatLevel     Int      @map("threat_level")
  abilities       String[]
  weaknesses      String[]
  firstAppearance Int      @map("first_appearance")
  imageUrl        String?  @map("image_url")
  nftTokenId      String?  @map("nft_token_id")
  nftMinted       Boolean  @default(false) @map("nft_minted")

  story           Story    @relation(fields: [storyId], references: [id])

  @@unique([storyId, name])
  @@map("monsters")
}

model LoreEntry {
  id              String   @id @default(cuid())
  storyId         String   @map("story_id")
  category        String
  title           String
  content         String   @db.Text
  relatedEntities String[] @map("related_entities")
  chapterRefs     Int[]    @map("chapter_refs")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  story           Story    @relation(fields: [storyId], references: [id])

  @@map("lore_entries")
}

model TreasuryEntry {
  id        String    @id @default(cuid())
  poolId    String    @map("pool_id")
  amount    Decimal   @db.Decimal(20, 6)
  tokenType TokenType @map("token_type")
  source    String
  txHash    String    @map("tx_hash")
  createdAt DateTime  @default(now()) @map("created_at")

  pool      BettingPool @relation(fields: [poolId], references: [id])

  @@map("treasury_entries")
}

model Payout {
  id        String       @id @default(cuid())
  userId    String       @map("user_id")
  poolId    String       @map("pool_id")
  amount    Decimal      @db.Decimal(20, 6)
  tokenType TokenType    @map("token_type")
  txHash    String?      @map("tx_hash")
  status    PayoutStatus @default(PENDING)
  createdAt DateTime     @default(now()) @map("created_at")

  user      User        @relation(fields: [userId], references: [id])
  pool      BettingPool @relation(fields: [poolId], references: [id])

  @@map("payouts")
}

enum PayoutStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}
```

---

## Smart Contract Architecture

### Contract Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SMART CONTRACT ARCHITECTURE                          │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            StoryForgeCore.sol                                │
│                         (Main Orchestrator Contract)                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  • Owner/Admin functions                                                     │
│  • Pause/Unpause functionality                                              │
│  • Contract upgrades (UUPS proxy pattern)                                   │
│  • Fee configuration                                                         │
│  • Treasury address management                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
           ┌──────────────────────────┼──────────────────────────┐
           ▼                          ▼                          ▼
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│  BettingPool.sol    │    │   Treasury.sol      │    │  StoryForgeNFT.sol  │
├─────────────────────┤    ├─────────────────────┤    ├─────────────────────┤
│ • Create pools      │    │ • Receive fees      │    │ • Mint 1/1 NFTs     │
│ • Accept deposits   │    │ • Withdraw funds    │    │ • Character NFTs    │
│ • Process outcomes  │    │ • Fund distribution │    │ • Item NFTs         │
│ • Distribute rewards│    │ • Emergency withdraw│    │ • Location NFTs     │
│ • Handle carryover  │    │ • Multi-sig support │    │ • Monster NFTs      │
└─────────────────────┘    └─────────────────────┘    │ • Metadata on IPFS  │
                                                       └─────────────────────┘
```

### BettingPool.sol (Core Contract)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title StoryForgeBettingPool
 * @notice Handles prediction market betting for Story-Forge chapters
 * @dev Winner-takes-all system with 2% fee and 85/15 winner/treasury split
 */
contract StoryForgeBettingPool is
    OwnableUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable
{
    using SafeERC20 for IERC20;

    // ============ Constants ============
    uint256 public constant FEE_PERCENTAGE = 200;        // 2% = 200 basis points
    uint256 public constant WINNER_PERCENTAGE = 8500;    // 85% = 8500 basis points
    uint256 public constant TREASURY_PERCENTAGE = 1500;  // 15% = 1500 basis points
    uint256 public constant BASIS_POINTS = 10000;

    // ============ Structs ============
    struct Pool {
        uint256 chapterId;
        uint256 totalDeposits;
        uint256 carryoverAmount;
        uint256 bettingEndsAt;
        address tokenAddress;           // USDC or USDT
        bool isResolved;
        uint256 winningOutcome;
        mapping(uint256 => uint256) outcomeDeposits;     // outcome => total deposits
        mapping(uint256 => uint256) outcomeVoterCount;   // outcome => voter count
    }

    struct UserBet {
        uint256 poolId;
        uint256 outcomeId;
        uint256 amount;
        bool claimed;
    }

    // ============ State Variables ============
    address public treasury;
    address public oracleAddress;        // Backend oracle for outcome resolution

    mapping(address => bool) public acceptedTokens;
    mapping(uint256 => Pool) public pools;
    mapping(address => mapping(uint256 => UserBet[])) public userBets;  // user => poolId => bets

    uint256 public poolCounter;

    // ============ Events ============
    event PoolCreated(uint256 indexed poolId, uint256 indexed chapterId, uint256 bettingEndsAt);
    event BetPlaced(
        address indexed user,
        uint256 indexed poolId,
        uint256 outcomeId,
        uint256 amount,
        uint256 feeDeducted
    );
    event OutcomeResolved(uint256 indexed poolId, uint256 winningOutcome);
    event WinningsClaimed(address indexed user, uint256 indexed poolId, uint256 amount);
    event CarryoverTransferred(uint256 fromPoolId, uint256 toPoolId, uint256 amount);

    // ============ Modifiers ============
    modifier onlyOracle() {
        require(msg.sender == oracleAddress, "Only oracle can call");
        _;
    }

    // ============ Initialization ============
    function initialize(
        address _treasury,
        address _oracle,
        address _usdc,
        address _usdt
    ) public initializer {
        __Ownable_init();
        __Pausable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        treasury = _treasury;
        oracleAddress = _oracle;
        acceptedTokens[_usdc] = true;
        acceptedTokens[_usdt] = true;
    }

    // ============ Pool Management ============

    /**
     * @notice Creates a new betting pool for a chapter
     * @param chapterId The chapter ID this pool is for
     * @param bettingDuration Duration in seconds for betting period
     * @param tokenAddress The stablecoin address (USDC/USDT)
     * @param carryoverFromPool Previous pool ID to carry over from (0 if none)
     */
    function createPool(
        uint256 chapterId,
        uint256 bettingDuration,
        address tokenAddress,
        uint256 carryoverFromPool
    ) external onlyOwner returns (uint256) {
        require(acceptedTokens[tokenAddress], "Token not accepted");

        poolCounter++;
        Pool storage pool = pools[poolCounter];
        pool.chapterId = chapterId;
        pool.bettingEndsAt = block.timestamp + bettingDuration;
        pool.tokenAddress = tokenAddress;

        // Handle carryover from previous pool
        if (carryoverFromPool > 0) {
            Pool storage prevPool = pools[carryoverFromPool];
            require(prevPool.isResolved, "Previous pool not resolved");
            pool.carryoverAmount = prevPool.carryoverAmount;
            emit CarryoverTransferred(carryoverFromPool, poolCounter, pool.carryoverAmount);
        }

        emit PoolCreated(poolCounter, chapterId, pool.bettingEndsAt);
        return poolCounter;
    }

    // ============ Betting Functions ============

    /**
     * @notice Place a bet on a specific outcome
     * @param poolId The pool to bet on
     * @param outcomeId The outcome option (1-5)
     * @param amount Amount to bet (before fee deduction)
     */
    function placeBet(
        uint256 poolId,
        uint256 outcomeId,
        uint256 amount
    ) external nonReentrant whenNotPaused {
        Pool storage pool = pools[poolId];

        require(block.timestamp < pool.bettingEndsAt, "Betting period ended");
        require(outcomeId >= 1 && outcomeId <= 5, "Invalid outcome");
        require(amount > 0, "Amount must be positive");

        IERC20 token = IERC20(pool.tokenAddress);

        // Calculate fee (2%)
        uint256 fee = (amount * FEE_PERCENTAGE) / BASIS_POINTS;
        uint256 netAmount = amount - fee;

        // Transfer tokens from user
        token.safeTransferFrom(msg.sender, address(this), amount);

        // Transfer fee to treasury immediately
        token.safeTransfer(treasury, fee);

        // Update pool state
        pool.totalDeposits += netAmount;
        pool.outcomeDeposits[outcomeId] += netAmount;
        pool.outcomeVoterCount[outcomeId]++;

        // Record user bet
        userBets[msg.sender][poolId].push(UserBet({
            poolId: poolId,
            outcomeId: outcomeId,
            amount: netAmount,
            claimed: false
        }));

        emit BetPlaced(msg.sender, poolId, outcomeId, netAmount, fee);
    }

    // ============ Resolution Functions ============

    /**
     * @notice Resolve the pool with the winning outcome (called by oracle)
     * @param poolId The pool to resolve
     * @param winningOutcome The winning outcome (1-5)
     */
    function resolvePool(
        uint256 poolId,
        uint256 winningOutcome
    ) external onlyOracle nonReentrant {
        Pool storage pool = pools[poolId];

        require(!pool.isResolved, "Already resolved");
        require(block.timestamp >= pool.bettingEndsAt, "Betting still open");
        require(winningOutcome >= 1 && winningOutcome <= 5, "Invalid outcome");

        pool.isResolved = true;
        pool.winningOutcome = winningOutcome;

        uint256 winningDeposits = pool.outcomeDeposits[winningOutcome];
        uint256 totalPrize = pool.totalDeposits + pool.carryoverAmount;

        // If no one bet on winning outcome, carry over to next pool
        if (winningDeposits == 0) {
            pool.carryoverAmount = totalPrize;
        } else {
            // Calculate treasury cut from prize pool
            uint256 treasuryCut = (totalPrize * TREASURY_PERCENTAGE) / BASIS_POINTS;
            IERC20(pool.tokenAddress).safeTransfer(treasury, treasuryCut);
            pool.carryoverAmount = 0;
        }

        emit OutcomeResolved(poolId, winningOutcome);
    }

    // ============ Claim Functions ============

    /**
     * @notice Claim winnings for a resolved pool
     * @param poolId The pool to claim from
     */
    function claimWinnings(uint256 poolId) external nonReentrant {
        Pool storage pool = pools[poolId];

        require(pool.isResolved, "Pool not resolved");

        UserBet[] storage bets = userBets[msg.sender][poolId];
        uint256 totalClaim = 0;

        for (uint256 i = 0; i < bets.length; i++) {
            if (!bets[i].claimed && bets[i].outcomeId == pool.winningOutcome) {
                bets[i].claimed = true;

                // Calculate proportional share
                uint256 totalPrize = pool.totalDeposits + pool.carryoverAmount;
                uint256 winnerPool = (totalPrize * WINNER_PERCENTAGE) / BASIS_POINTS;
                uint256 share = (bets[i].amount * winnerPool) / pool.outcomeDeposits[pool.winningOutcome];

                totalClaim += share;
            }
        }

        require(totalClaim > 0, "Nothing to claim");

        IERC20(pool.tokenAddress).safeTransfer(msg.sender, totalClaim);

        emit WinningsClaimed(msg.sender, poolId, totalClaim);
    }

    // ============ View Functions ============

    function getPoolInfo(uint256 poolId) external view returns (
        uint256 chapterId,
        uint256 totalDeposits,
        uint256 carryoverAmount,
        uint256 bettingEndsAt,
        address tokenAddress,
        bool isResolved,
        uint256 winningOutcome
    ) {
        Pool storage pool = pools[poolId];
        return (
            pool.chapterId,
            pool.totalDeposits,
            pool.carryoverAmount,
            pool.bettingEndsAt,
            pool.tokenAddress,
            pool.isResolved,
            pool.winningOutcome
        );
    }

    function getOutcomeDeposits(uint256 poolId, uint256 outcomeId) external view returns (uint256) {
        return pools[poolId].outcomeDeposits[outcomeId];
    }

    function getOutcomeVoterCount(uint256 poolId, uint256 outcomeId) external view returns (uint256) {
        return pools[poolId].outcomeVoterCount[outcomeId];
    }

    function getUserBets(address user, uint256 poolId) external view returns (UserBet[] memory) {
        return userBets[user][poolId];
    }

    // ============ Admin Functions ============

    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
    }

    function setOracle(address _oracle) external onlyOwner {
        oracleAddress = _oracle;
    }

    function addAcceptedToken(address token) external onlyOwner {
        acceptedTokens[token] = true;
    }

    function removeAcceptedToken(address token) external onlyOwner {
        acceptedTokens[token] = false;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
```

### StoryForgeNFT.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title StoryForgeNFT
 * @notice 1/1 NFTs for Story-Forge entities (characters, items, locations, monsters)
 */
contract StoryForgeNFT is ERC721, ERC721URIStorage, ERC721Enumerable, AccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    Counters.Counter private _tokenIdCounter;

    enum EntityType { CHARACTER, ITEM, LOCATION, MONSTER }

    struct EntityMetadata {
        EntityType entityType;
        string storyId;
        string entityName;
        uint256 firstAppearanceChapter;
        uint256 mintedAt;
    }

    mapping(uint256 => EntityMetadata) public tokenMetadata;
    mapping(string => mapping(string => uint256)) public storyEntityToToken;  // storyId => entityName => tokenId

    event EntityMinted(
        uint256 indexed tokenId,
        EntityType entityType,
        string storyId,
        string entityName,
        address indexed mintedTo
    );

    constructor() ERC721("Story Forge Entities", "FORGE") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    /**
     * @notice Mint a new 1/1 entity NFT
     * @param to Recipient address
     * @param entityType Type of entity
     * @param storyId Story identifier
     * @param entityName Name of the entity
     * @param firstAppearance Chapter of first appearance
     * @param uri IPFS URI for metadata
     */
    function mintEntity(
        address to,
        EntityType entityType,
        string memory storyId,
        string memory entityName,
        uint256 firstAppearance,
        string memory uri
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        require(storyEntityToToken[storyId][entityName] == 0, "Entity already minted");

        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        tokenMetadata[tokenId] = EntityMetadata({
            entityType: entityType,
            storyId: storyId,
            entityName: entityName,
            firstAppearanceChapter: firstAppearance,
            mintedAt: block.timestamp
        });

        storyEntityToToken[storyId][entityName] = tokenId;

        emit EntityMinted(tokenId, entityType, storyId, entityName, to);

        return tokenId;
    }

    /**
     * @notice Batch mint multiple entities
     */
    function batchMintEntities(
        address to,
        EntityType[] memory entityTypes,
        string[] memory storyIds,
        string[] memory entityNames,
        uint256[] memory firstAppearances,
        string[] memory uris
    ) external onlyRole(MINTER_ROLE) returns (uint256[] memory) {
        require(
            entityTypes.length == storyIds.length &&
            storyIds.length == entityNames.length &&
            entityNames.length == firstAppearances.length &&
            firstAppearances.length == uris.length,
            "Array length mismatch"
        );

        uint256[] memory tokenIds = new uint256[](entityTypes.length);

        for (uint256 i = 0; i < entityTypes.length; i++) {
            tokenIds[i] = this.mintEntity(
                to,
                entityTypes[i],
                storyIds[i],
                entityNames[i],
                firstAppearances[i],
                uris[i]
            );
        }

        return tokenIds;
    }

    // Required overrides
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
```

---

## AI Story Generation System

### Story Generation Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AI STORY GENERATION PIPELINE                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  STORY CONTEXT  │     │   GENERATION    │     │   POST-PROCESS  │
│     MANAGER     │────▶│     ENGINE      │────▶│    PIPELINE     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ • World State   │     │ • Claude/GPT-4  │     │ • Entity Extract│
│ • Char States   │     │ • Prompt Engine │     │ • Image Gen     │
│ • Plot Threads  │     │ • Temp Control  │     │ • Consistency   │
│ • Previous      │     │ • Safety Filter │     │ • Quality Check │
│   Chapters      │     │                 │     │ • IPFS Upload   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Generation Flow

```typescript
// src/services/story-generation/story-generator.service.ts

interface StoryContext {
  storyId: string;
  worldState: WorldState;
  characters: CharacterState[];
  plotThreads: PlotThread[];
  previousChapters: ChapterSummary[];
  currentChapter: number;
  selectedOutcome?: OutcomeSelection;
}

interface GeneratedChapter {
  title: string;
  content: string;
  summary: string;
  extractedEntities: ExtractedEntities;
  outcomes: OutcomeTeaser[];
}

interface OutcomeTeaser {
  optionNumber: number;
  teaserText: string;
  emotionalTone: string;
  plotImplications: string[];
}

class StoryGeneratorService {
  private aiClient: AnthropicClient | OpenAIClient;
  private contextManager: StoryContextManager;
  private entityExtractor: EntityExtractor;
  private imageGenerator: ImageGeneratorService;

  async generateChapter(storyId: string): Promise<GeneratedChapter> {
    // 1. Build context from previous chapters and world state
    const context = await this.contextManager.buildContext(storyId);

    // 2. Generate chapter content
    const chapterContent = await this.generateChapterContent(context);

    // 3. Extract entities (characters, items, locations, monsters)
    const entities = await this.entityExtractor.extract(chapterContent);

    // 4. Generate outcome teasers
    const outcomes = await this.generateOutcomeTeasers(context, chapterContent);

    // 5. Generate images for new entities
    await this.generateEntityImages(entities);

    // 6. Update world state
    await this.contextManager.updateWorldState(storyId, chapterContent, entities);

    return {
      title: chapterContent.title,
      content: chapterContent.content,
      summary: chapterContent.summary,
      extractedEntities: entities,
      outcomes
    };
  }

  private async generateChapterContent(context: StoryContext): Promise<ChapterContent> {
    const prompt = this.buildChapterPrompt(context);

    const response = await this.aiClient.generate({
      model: 'claude-3-opus',
      systemPrompt: FANTASY_WRITER_SYSTEM_PROMPT,
      userPrompt: prompt,
      temperature: 0.8,
      maxTokens: 8000
    });

    return this.parseChapterResponse(response);
  }

  private async generateOutcomeTeasers(
    context: StoryContext,
    chapter: ChapterContent
  ): Promise<OutcomeTeaser[]> {
    const prompt = this.buildOutcomePrompt(context, chapter);

    const response = await this.aiClient.generate({
      model: 'claude-3-opus',
      systemPrompt: OUTCOME_GENERATOR_PROMPT,
      userPrompt: prompt,
      temperature: 0.9,  // Higher creativity for diverse outcomes
      maxTokens: 2000
    });

    return this.parseOutcomes(response);
  }
}
```

### AI Prompts System

```typescript
// src/services/story-generation/prompts/fantasy-writer.prompt.ts

export const FANTASY_WRITER_SYSTEM_PROMPT = `
You are a master Fantasy Story Writer with expertise in:
- Epic world-building and immersive descriptions
- Complex character development with distinct voices
- Intricate plot weaving with foreshadowing
- Vivid action sequences and emotional moments
- Consistent magic systems and lore

Writing Style Guidelines:
1. Use rich, sensory language without purple prose
2. Balance dialogue, action, and description
3. End chapters on compelling hooks
4. Maintain character consistency across chapters
5. Weave in subtle callbacks to previous events
6. Create tension through both external and internal conflict

Output Format:
- Chapter title (evocative, thematic)
- 2000-3500 words of narrative
- Clear scene breaks where appropriate
- Embedded character thoughts in italics
`;

export const OUTCOME_GENERATOR_PROMPT = `
You are creating story outcome teasers for a prediction market. Generate 4-5 distinct
possible directions the story could take based on the current chapter's ending.

Requirements:
1. Each outcome must be genuinely different (not just variations)
2. Outcomes should range from expected to surprising
3. Each teaser is 2-3 sentences, enticing but not spoiling
4. Outcomes should have different emotional tones
5. At least one outcome should be a "dark horse" - unexpected but logical
6. Each outcome must be narratively satisfying if chosen

Format each outcome as:
- Option number (1-5)
- Teaser text (the reader-facing preview)
- Internal notes: emotional tone, key plot implications
`;

export const OUTCOME_SELECTION_PROMPT = `
Based on the story context, narrative coherence, and dramatic potential,
select which outcome should become the next chapter's direction.

Selection Criteria:
1. Narrative momentum and story arc progression
2. Character development opportunities
3. World-building potential
4. Reader engagement and surprise factor
5. Long-term plot implications

You must select ONE outcome and provide reasoning for the choice.
The selection should feel earned and satisfying, not random.
`;
```

### Scheduled Generation Job

```typescript
// src/jobs/chapter-generation.job.ts

import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ChapterGenerationJob {
  constructor(
    private storyGenerator: StoryGeneratorService,
    private bettingService: BettingService,
    private notificationService: NotificationService,
    private prisma: PrismaService
  ) {}

  // Run every 3 days at midnight UTC
  @Cron('0 0 */3 * *')
  async generateNewChapters() {
    const activeStories = await this.prisma.story.findMany({
      where: { status: 'ACTIVE' }
    });

    for (const story of activeStories) {
      try {
        // 1. Close betting for current chapter
        await this.bettingService.closeBetting(story.id);

        // 2. Select winning outcome
        const selectedOutcome = await this.selectOutcome(story.id);

        // 3. Resolve betting pools
        await this.bettingService.resolvePools(story.id, selectedOutcome);

        // 4. Generate new chapter based on selected outcome
        const newChapter = await this.storyGenerator.generateChapter(
          story.id,
          selectedOutcome
        );

        // 5. Create new betting pools for new outcomes
        await this.bettingService.createPools(story.id, newChapter.outcomes);

        // 6. Notify readers
        await this.notificationService.notifyNewChapter(story.id, newChapter);

        // 7. Mint NFTs for new entities
        await this.mintNewEntities(story.id, newChapter.extractedEntities);

      } catch (error) {
        console.error(`Failed to generate chapter for story ${story.id}:`, error);
        // Alert operations team
        await this.notificationService.alertOperations(story.id, error);
      }
    }
  }

  private async selectOutcome(storyId: string): Promise<OutcomeSelection> {
    const currentChapter = await this.prisma.chapter.findFirst({
      where: { storyId, status: 'BETTING_CLOSED' },
      include: { outcomes: true }
    });

    // Use AI to select the best narrative outcome
    const selection = await this.storyGenerator.selectOutcome(
      storyId,
      currentChapter.outcomes
    );

    // Update the selected outcome in database
    await this.prisma.outcome.update({
      where: { id: selection.outcomeId },
      data: { isSelected: true, aiReasoning: selection.reasoning }
    });

    return selection;
  }
}
```

---

## NFT Minting System

### NFT Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           NFT MINTING PIPELINE                               │
└─────────────────────────────────────────────────────────────────────────────┘

       Entity Extracted              Image Generated              NFT Minted
       from Chapter                  via AI                       on Chain
            │                             │                            │
            ▼                             ▼                            ▼
┌─────────────────────┐      ┌─────────────────────┐      ┌─────────────────────┐
│   ENTITY EXTRACTOR  │─────▶│   IMAGE GENERATOR   │─────▶│    NFT MINTER       │
├─────────────────────┤      ├─────────────────────┤      ├─────────────────────┤
│                     │      │                     │      │                     │
│ • NLP Analysis      │      │ • DALL-E 3 API      │      │ • IPFS Upload       │
│ • Character Detect  │      │ • Style Consistency │      │ • Metadata Gen      │
│ • Item Recognition  │      │ • Portrait Mode     │      │ • Contract Call     │
│ • Location Extract  │      │ • Scene Mode        │      │ • Event Emission    │
│ • Monster Identify  │      │ • Item Render       │      │ • DB Update         │
│                     │      │                     │      │                     │
└─────────────────────┘      └─────────────────────┘      └─────────────────────┘
```

### NFT Metadata Schema

```typescript
// NFT Metadata following OpenSea standards

interface StoryForgeNFTMetadata {
  name: string;
  description: string;
  image: string;  // IPFS URI
  external_url: string;  // Link to compendium entry

  attributes: NFTAttribute[];

  // Story-Forge specific
  story_forge: {
    story_id: string;
    story_title: string;
    entity_type: 'CHARACTER' | 'ITEM' | 'LOCATION' | 'MONSTER';
    first_appearance: {
      chapter: number;
      chapter_title: string;
    };
    lore_excerpt: string;
    relationships?: EntityRelationship[];
  };
}

interface NFTAttribute {
  trait_type: string;
  value: string | number;
  display_type?: 'number' | 'date' | 'boost_percentage';
}

// Example: Character NFT
const exampleCharacterNFT: StoryForgeNFTMetadata = {
  name: "Aria Shadowmend",
  description: "A former assassin turned reluctant hero, Aria wields the cursed blade Nightwhisper...",
  image: "ipfs://QmXyz.../aria-shadowmend.png",
  external_url: "https://storyforge.io/compendium/characters/aria-shadowmend",

  attributes: [
    { trait_type: "Class", value: "Assassin" },
    { trait_type: "Alignment", value: "Chaotic Good" },
    { trait_type: "Power Level", value: 87, display_type: "number" },
    { trait_type: "First Appearance", value: 1640995200, display_type: "date" },
    { trait_type: "Chapter Count", value: 12, display_type: "number" }
  ],

  story_forge: {
    story_id: "chronicles-of-aethermoor",
    story_title: "Chronicles of Aethermoor",
    entity_type: "CHARACTER",
    first_appearance: {
      chapter: 1,
      chapter_title: "The Shadow's Edge"
    },
    lore_excerpt: "Born in the slums of Vexmire, Aria learned to survive by any means necessary...",
    relationships: [
      { entity: "Marcus Ironheart", type: "ally", since_chapter: 3 },
      { entity: "The Crimson Order", type: "enemy", since_chapter: 5 }
    ]
  }
};
```

### NFT Minting Service

```typescript
// src/services/nft/nft-minting.service.ts

@Injectable()
export class NFTMintingService {
  constructor(
    private imageGenerator: ImageGeneratorService,
    private ipfsService: IPFSService,
    private blockchainService: BlockchainService,
    private prisma: PrismaService
  ) {}

  async mintEntityNFT(
    storyId: string,
    entity: ExtractedEntity,
    mintTo: string = process.env.TREASURY_ADDRESS
  ): Promise<MintResult> {
    // 1. Generate image for entity
    const imagePrompt = this.buildImagePrompt(entity);
    const imageBuffer = await this.imageGenerator.generate(imagePrompt, {
      style: 'fantasy-portrait',
      aspectRatio: '1:1',
      quality: 'hd'
    });

    // 2. Upload image to IPFS
    const imageCID = await this.ipfsService.uploadImage(imageBuffer);

    // 3. Build metadata
    const metadata = this.buildMetadata(storyId, entity, imageCID);

    // 4. Upload metadata to IPFS
    const metadataCID = await this.ipfsService.uploadJSON(metadata);

    // 5. Mint NFT on-chain
    const txResult = await this.blockchainService.mintNFT({
      to: mintTo,
      entityType: this.mapEntityType(entity.type),
      storyId,
      entityName: entity.name,
      firstAppearance: entity.firstAppearanceChapter,
      tokenURI: `ipfs://${metadataCID}`
    });

    // 6. Update database
    await this.updateEntityWithNFT(entity, txResult.tokenId);

    return {
      tokenId: txResult.tokenId,
      txHash: txResult.transactionHash,
      imageCID,
      metadataCID
    };
  }

  async batchMintChapterEntities(
    storyId: string,
    chapterNumber: number
  ): Promise<BatchMintResult> {
    // Get all unminted entities from this chapter
    const entities = await this.getUnmintedEntities(storyId, chapterNumber);

    const results: MintResult[] = [];

    for (const entity of entities) {
      try {
        const result = await this.mintEntityNFT(storyId, entity);
        results.push(result);
      } catch (error) {
        console.error(`Failed to mint ${entity.name}:`, error);
        results.push({ error, entity: entity.name });
      }
    }

    return { results, total: entities.length, successful: results.filter(r => !r.error).length };
  }
}
```

---

## Compendium System

### Compendium Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           COMPENDIUM SYSTEM                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              COMPENDIUM UI                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Characters  │  │   Items     │  │  Locations  │  │  Monsters   │        │
│  │    Tab      │  │    Tab      │  │     Tab     │  │     Tab     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    RELATIONSHIP DIAGRAM                                │  │
│  │                                                                        │  │
│  │         [Marcus]────ally────[Aria]────enemy────[Dark Lord]            │  │
│  │             │                  │                    │                  │  │
│  │          mentor             owns                commands              │  │
│  │             │                  │                    │                  │  │
│  │         [Elder]         [Nightwhisper]        [Shadow Army]           │  │
│  │                                                                        │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    ENTITY DETAILS PANEL                                │  │
│  │  ┌────────────┐                                                       │  │
│  │  │   [IMG]    │  Aria Shadowmend                                      │  │
│  │  │            │  ─────────────────                                    │  │
│  │  │            │  Class: Assassin │ Alignment: Chaotic Good            │  │
│  │  └────────────┘                                                       │  │
│  │                                                                        │  │
│  │  Background:                                                          │  │
│  │  Born in the slums of Vexmire, Aria learned to survive...             │  │
│  │                                                                        │  │
│  │  Chapter Appearances: 1, 3, 5, 7, 8, 9, 10, 11, 12                    │  │
│  │                                                                        │  │
│  │  [View NFT]  [Timeline]  [Relationships]                              │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Compendium Service

```typescript
// src/services/compendium/compendium.service.ts

@Injectable()
export class CompendiumService {
  constructor(
    private prisma: PrismaService,
    private searchService: SearchService
  ) {}

  async getCharacters(storyId: string, options?: QueryOptions): Promise<CharacterWithRelations[]> {
    const characters = await this.prisma.character.findMany({
      where: { storyId },
      include: {
        relationshipsA: {
          include: { characterB: true }
        },
        relationshipsB: {
          include: { characterA: true }
        },
        items: true
      },
      orderBy: options?.sortBy || { firstAppearance: 'asc' }
    });

    return characters.map(c => this.transformCharacter(c));
  }

  async getRelationshipGraph(storyId: string): Promise<RelationshipGraph> {
    const characters = await this.prisma.character.findMany({
      where: { storyId },
      select: { id: true, name: true, imageUrl: true }
    });

    const relations = await this.prisma.characterRelation.findMany({
      where: {
        characterA: { storyId }
      }
    });

    // Build D3-compatible graph structure
    const nodes = characters.map(c => ({
      id: c.id,
      label: c.name,
      image: c.imageUrl,
      type: 'character'
    }));

    const edges = relations.map(r => ({
      source: r.characterAId,
      target: r.characterBId,
      label: r.relationship,
      establishedChapter: r.establishedCh
    }));

    return { nodes, edges };
  }

  async getEntityTimeline(entityId: string, entityType: EntityType): Promise<TimelineEntry[]> {
    // Get all chapter mentions of this entity
    const chapters = await this.searchService.findChapterMentions(entityId, entityType);

    return chapters.map(chapter => ({
      chapterNumber: chapter.chapterNumber,
      chapterTitle: chapter.title,
      snippet: chapter.mentionContext,
      significance: chapter.significanceScore
    }));
  }

  async searchCompendium(storyId: string, query: string): Promise<SearchResults> {
    return this.searchService.fullTextSearch(storyId, query, {
      entities: ['characters', 'items', 'locations', 'monsters', 'lore'],
      fuzzy: true,
      highlight: true
    });
  }

  async getLoreEntries(storyId: string, category?: string): Promise<LoreEntry[]> {
    return this.prisma.loreEntry.findMany({
      where: {
        storyId,
        ...(category && { category })
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  async updateCompendiumFromChapter(
    storyId: string,
    chapterNumber: number,
    extractedEntities: ExtractedEntities
  ): Promise<void> {
    // Update or create characters
    for (const char of extractedEntities.characters) {
      await this.prisma.character.upsert({
        where: { storyId_name: { storyId, name: char.name } },
        create: {
          storyId,
          name: char.name,
          description: char.description,
          firstAppearance: chapterNumber,
          traits: char.traits
        },
        update: {
          description: char.description, // May have evolved
          traits: char.traits
        }
      });
    }

    // Similar for items, locations, monsters...

    // Update relationships
    for (const rel of extractedEntities.relationships) {
      await this.prisma.characterRelation.upsert({
        where: {
          characterAId_characterBId: {
            characterAId: rel.characterAId,
            characterBId: rel.characterBId
          }
        },
        create: {
          characterAId: rel.characterAId,
          characterBId: rel.characterBId,
          relationship: rel.type,
          establishedCh: chapterNumber
        },
        update: {
          relationship: rel.type // Relationship may have changed
        }
      });
    }
  }
}
```

### Relationship Diagram Component

```typescript
// src/components/compendium/RelationshipDiagram.tsx

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface RelationshipDiagramProps {
  storyId: string;
  focusEntityId?: string;
}

export function RelationshipDiagram({ storyId, focusEntityId }: RelationshipDiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { data: graph } = useQuery(['relationship-graph', storyId], () =>
    api.getRelationshipGraph(storyId)
  );

  useEffect(() => {
    if (!graph || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Clear previous
    svg.selectAll('*').remove();

    // Create force simulation
    const simulation = d3.forceSimulation(graph.nodes)
      .force('link', d3.forceLink(graph.edges).id((d: any) => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(60));

    // Draw edges
    const links = svg.append('g')
      .selectAll('line')
      .data(graph.edges)
      .join('line')
      .attr('stroke', '#666')
      .attr('stroke-width', 2);

    // Draw edge labels
    const linkLabels = svg.append('g')
      .selectAll('text')
      .data(graph.edges)
      .join('text')
      .text(d => d.label)
      .attr('font-size', '10px')
      .attr('fill', '#999');

    // Draw nodes
    const nodes = svg.append('g')
      .selectAll('g')
      .data(graph.nodes)
      .join('g')
      .call(d3.drag()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded)
      );

    // Node circles with images
    nodes.append('clipPath')
      .attr('id', d => `clip-${d.id}`)
      .append('circle')
      .attr('r', 30);

    nodes.append('image')
      .attr('xlink:href', d => d.image || '/default-avatar.png')
      .attr('width', 60)
      .attr('height', 60)
      .attr('x', -30)
      .attr('y', -30)
      .attr('clip-path', d => `url(#clip-${d.id})`);

    nodes.append('circle')
      .attr('r', 30)
      .attr('fill', 'none')
      .attr('stroke', d => d.id === focusEntityId ? '#FFD700' : '#333')
      .attr('stroke-width', d => d.id === focusEntityId ? 3 : 2);

    // Node labels
    nodes.append('text')
      .text(d => d.label)
      .attr('text-anchor', 'middle')
      .attr('dy', 45)
      .attr('font-size', '12px')
      .attr('font-weight', 'bold');

    // Update positions on tick
    simulation.on('tick', () => {
      links
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      linkLabels
        .attr('x', d => (d.source.x + d.target.x) / 2)
        .attr('y', d => (d.source.y + d.target.y) / 2);

      nodes.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragStarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragEnded(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

  }, [graph, focusEntityId]);

  return (
    <div className="relationship-diagram-container">
      <svg ref={svgRef} width="100%" height="600" />
    </div>
  );
}
```

---

## API Design

### REST API Endpoints

```yaml
# API Specification

# ============ Stories ============
GET    /api/stories                    # List all stories
GET    /api/stories/:id                # Get story details
GET    /api/stories/:id/chapters       # List chapters for a story
GET    /api/stories/:id/chapters/:num  # Get specific chapter

# ============ Betting ============
GET    /api/betting/pools              # List active betting pools
GET    /api/betting/pools/:id          # Get pool details with odds
POST   /api/betting/bet                # Place a bet
GET    /api/betting/user/bets          # Get user's betting history
POST   /api/betting/claim/:poolId      # Claim winnings

# Request: POST /api/betting/bet
{
  "poolId": "pool_123",
  "outcomeId": "outcome_456",
  "amount": "100.00",
  "tokenType": "USDC"
}

# Response
{
  "betId": "bet_789",
  "transactionHash": "0x...",
  "amount": "98.00",
  "feeDeducted": "2.00",
  "outcome": {
    "id": "outcome_456",
    "optionNumber": 2,
    "teaserText": "Aria chooses to challenge the dragon...",
    "currentOdds": "3.2x",
    "poolTotal": "15000.00"
  }
}

# ============ Compendium ============
GET    /api/compendium/:storyId/characters      # List characters
GET    /api/compendium/:storyId/characters/:id  # Character details
GET    /api/compendium/:storyId/items           # List items
GET    /api/compendium/:storyId/locations       # List locations
GET    /api/compendium/:storyId/monsters        # List monsters
GET    /api/compendium/:storyId/lore            # List lore entries
GET    /api/compendium/:storyId/relationships   # Get relationship graph
GET    /api/compendium/:storyId/search          # Full-text search

# ============ NFTs ============
GET    /api/nfts/story/:storyId         # List NFTs for a story
GET    /api/nfts/:tokenId               # Get NFT metadata
GET    /api/nfts/user/:address          # Get user's NFTs

# ============ User ============
GET    /api/user/profile                # Get user profile
GET    /api/user/stats                  # Get betting statistics
GET    /api/user/leaderboard            # Global leaderboard
```

### GraphQL Schema

```graphql
type Query {
  # Stories
  stories(status: StoryStatus): [Story!]!
  story(id: ID!): Story
  chapter(storyId: ID!, chapterNumber: Int!): Chapter

  # Betting
  activePools(storyId: ID): [BettingPool!]!
  pool(id: ID!): BettingPool
  userBets(userId: ID!): [UserBet!]!

  # Compendium
  characters(storyId: ID!, first: Int, after: String): CharacterConnection!
  character(id: ID!): Character
  relationshipGraph(storyId: ID!): RelationshipGraph!
  searchCompendium(storyId: ID!, query: String!): SearchResults!

  # User
  user(address: String!): User
  leaderboard(limit: Int): [LeaderboardEntry!]!
}

type Mutation {
  # Betting
  placeBet(input: PlaceBetInput!): PlaceBetResult!
  claimWinnings(poolId: ID!): ClaimResult!

  # User
  updateProfile(input: UpdateProfileInput!): User!
}

type Subscription {
  # Real-time updates
  poolUpdated(poolId: ID!): BettingPool!
  newChapterPublished(storyId: ID!): Chapter!
  betPlaced(poolId: ID!): BetEvent!
}

type Story {
  id: ID!
  title: String!
  synopsis: String!
  genre: String!
  status: StoryStatus!
  coverImageUrl: String
  currentChapter: Int!
  chapters: [Chapter!]!
  characters: [Character!]!
  items: [Item!]!
  locations: [Location!]!
  monsters: [Monster!]!
}

type Chapter {
  id: ID!
  chapterNumber: Int!
  title: String!
  content: String!
  publishedAt: DateTime
  status: ChapterStatus!
  outcomes: [Outcome!]!
  bettingPool: BettingPool
}

type Outcome {
  id: ID!
  optionNumber: Int!
  teaserText: String!
  isSelected: Boolean!
  pool: BettingPool
}

type BettingPool {
  id: ID!
  chapter: Chapter!
  outcome: Outcome!
  totalDeposits: Decimal!
  voterCount: Int!
  status: PoolStatus!
  bettingEndsAt: DateTime!
  odds: Float!
  carryoverAmount: Decimal!
}

type Character {
  id: ID!
  name: String!
  description: String!
  imageUrl: String
  firstAppearance: Int!
  traits: JSON
  nft: NFT
  relationships: [CharacterRelation!]!
  items: [Item!]!
  timeline: [TimelineEntry!]!
}

type RelationshipGraph {
  nodes: [GraphNode!]!
  edges: [GraphEdge!]!
}

input PlaceBetInput {
  poolId: ID!
  outcomeId: ID!
  amount: Decimal!
  tokenType: TokenType!
}
```

---

## Frontend Architecture

### Page Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Homepage
│   ├── stories/
│   │   ├── page.tsx             # Story listing
│   │   └── [storyId]/
│   │       ├── page.tsx         # Story overview
│   │       ├── read/
│   │       │   └── [chapter]/page.tsx  # Chapter reader
│   │       ├── bet/
│   │       │   └── page.tsx     # Betting interface
│   │       └── compendium/
│   │           ├── page.tsx     # Compendium overview
│   │           ├── characters/page.tsx
│   │           ├── items/page.tsx
│   │           ├── locations/page.tsx
│   │           ├── monsters/page.tsx
│   │           └── relationships/page.tsx
│   ├── nfts/
│   │   ├── page.tsx             # NFT gallery
│   │   └── [tokenId]/page.tsx   # NFT detail
│   ├── profile/
│   │   └── page.tsx             # User profile & stats
│   └── leaderboard/
│       └── page.tsx             # Global leaderboard
├── components/
│   ├── story/
│   │   ├── ChapterReader.tsx
│   │   ├── ChapterNavigation.tsx
│   │   └── StoryCard.tsx
│   ├── betting/
│   │   ├── BettingPanel.tsx
│   │   ├── OutcomeCard.tsx
│   │   ├── OddsDisplay.tsx
│   │   ├── DepositModal.tsx
│   │   └── ClaimButton.tsx
│   ├── compendium/
│   │   ├── EntityCard.tsx
│   │   ├── EntityDetail.tsx
│   │   ├── RelationshipDiagram.tsx
│   │   ├── TimelineView.tsx
│   │   └── SearchBar.tsx
│   ├── nft/
│   │   ├── NFTCard.tsx
│   │   ├── NFTDetail.tsx
│   │   └── NFTGallery.tsx
│   ├── wallet/
│   │   ├── ConnectButton.tsx
│   │   ├── WalletProvider.tsx
│   │   └── TokenBalance.tsx
│   └── ui/                      # shadcn/ui components
├── hooks/
│   ├── useStory.ts
│   ├── useBetting.ts
│   ├── useCompendium.ts
│   ├── useNFT.ts
│   └── useWallet.ts
├── lib/
│   ├── api.ts                   # API client
│   ├── contracts.ts             # Contract ABIs & addresses
│   └── utils.ts
└── stores/
    ├── bettingStore.ts
    └── userStore.ts
```

### Key Components

```typescript
// src/components/betting/BettingPanel.tsx

'use client';

import { useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { OutcomeCard } from './OutcomeCard';
import { DepositModal } from './DepositModal';
import { useBettingPool } from '@/hooks/useBetting';
import { formatDistanceToNow } from 'date-fns';

interface BettingPanelProps {
  chapterId: string;
}

export function BettingPanel({ chapterId }: BettingPanelProps) {
  const { address } = useAccount();
  const { data: pool, isLoading } = useBettingPool(chapterId);
  const [selectedOutcome, setSelectedOutcome] = useState<string | null>(null);
  const [depositModalOpen, setDepositModalOpen] = useState(false);

  if (isLoading) return <BettingPanelSkeleton />;
  if (!pool) return <div>No active betting pool</div>;

  const timeRemaining = formatDistanceToNow(new Date(pool.bettingEndsAt), { addSuffix: true });
  const totalPool = pool.outcomes.reduce((sum, o) => sum + o.poolAmount, 0);

  return (
    <div className="betting-panel bg-slate-900 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Predict the Outcome</h2>
        <div className="text-amber-400 flex items-center gap-2">
          <ClockIcon className="w-5 h-5" />
          <span>Closes {timeRemaining}</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-sm text-gray-400">Total Pool</div>
        <div className="text-3xl font-bold text-green-400">
          {formatCurrency(totalPool)} USDC
        </div>
      </div>

      <div className="space-y-4">
        {pool.outcomes.map((outcome) => (
          <OutcomeCard
            key={outcome.id}
            outcome={outcome}
            totalPool={totalPool}
            isSelected={selectedOutcome === outcome.id}
            onSelect={() => {
              setSelectedOutcome(outcome.id);
              setDepositModalOpen(true);
            }}
          />
        ))}
      </div>

      {pool.carryoverAmount > 0 && (
        <div className="mt-4 p-3 bg-purple-900/50 rounded-lg">
          <span className="text-purple-300">
            🎁 Carryover from previous chapter: {formatCurrency(pool.carryoverAmount)} USDC
          </span>
        </div>
      )}

      <DepositModal
        open={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
        outcomeId={selectedOutcome}
        poolId={pool.id}
      />
    </div>
  );
}

// src/components/betting/OutcomeCard.tsx

interface OutcomeCardProps {
  outcome: Outcome;
  totalPool: number;
  isSelected: boolean;
  onSelect: () => void;
}

export function OutcomeCard({ outcome, totalPool, isSelected, onSelect }: OutcomeCardProps) {
  const percentage = totalPool > 0 ? (outcome.poolAmount / totalPool) * 100 : 0;
  const odds = totalPool > 0 ? totalPool / outcome.poolAmount : 0;

  return (
    <div
      className={`
        relative overflow-hidden rounded-lg border-2 p-4 cursor-pointer transition-all
        ${isSelected
          ? 'border-amber-400 bg-amber-400/10'
          : 'border-slate-700 bg-slate-800 hover:border-slate-500'}
      `}
      onClick={onSelect}
    >
      {/* Background progress bar */}
      <div
        className="absolute inset-y-0 left-0 bg-blue-900/30"
        style={{ width: `${percentage}%` }}
      />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-2">
          <span className="text-lg font-bold text-white">
            Option {outcome.optionNumber}
          </span>
          <span className="text-xl font-bold text-green-400">
            {odds.toFixed(1)}x
          </span>
        </div>

        <p className="text-gray-300 mb-3">{outcome.teaserText}</p>

        <div className="flex justify-between text-sm text-gray-400">
          <span>{formatCurrency(outcome.poolAmount)} USDC</span>
          <span>{outcome.voterCount} voters</span>
          <span>{percentage.toFixed(1)}%</span>
        </div>
      </div>

      <div className="absolute top-2 right-2">
        <button
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          Bet Now
        </button>
      </div>
    </div>
  );
}
```

---

## Security Considerations

### Smart Contract Security

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SECURITY MEASURES                                    │
└─────────────────────────────────────────────────────────────────────────────┘

1. SMART CONTRACT SECURITY
   ├── Reentrancy Guards (ReentrancyGuard)
   ├── Access Control (Ownable, AccessControl)
   ├── Pausable functionality for emergencies
   ├── UUPS Upgradeable pattern for bug fixes
   ├── SafeERC20 for token transfers
   ├── Audit by reputable firm (Certik, Trail of Bits, etc.)
   └── Formal verification for critical functions

2. ORACLE SECURITY
   ├── Dedicated oracle address for outcome resolution
   ├── Multi-sig requirement for oracle updates
   ├── Time-lock for sensitive operations
   └── Off-chain signature verification

3. BACKEND SECURITY
   ├── Rate limiting on all endpoints
   ├── Request signing for wallet verification
   ├── Input validation and sanitization
   ├── SQL injection prevention (Prisma ORM)
   ├── XSS protection (React auto-escaping)
   └── CORS configuration

4. WALLET SECURITY
   ├── Signature verification for all transactions
   ├── Transaction simulation before execution
   ├── Clear transaction previews
   └── Phishing protection warnings

5. AI SECURITY
   ├── Content moderation filters
   ├── Prompt injection prevention
   ├── Rate limiting on generation
   └── Human review for flagged content
```

### Audit Checklist

```markdown
## Pre-Launch Audit Checklist

### Smart Contracts
- [ ] Reentrancy attack prevention
- [ ] Integer overflow/underflow (Solidity 0.8+)
- [ ] Access control verification
- [ ] Oracle manipulation prevention
- [ ] Flash loan attack vectors
- [ ] Front-running mitigation
- [ ] Gas optimization
- [ ] Upgrade mechanism security

### Backend
- [ ] Authentication/Authorization
- [ ] Rate limiting
- [ ] Input validation
- [ ] SQL injection prevention
- [ ] Sensitive data encryption
- [ ] API key rotation
- [ ] Logging and monitoring

### Frontend
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Secure wallet integration
- [ ] Transaction verification UI
```

---

## Development Roadmap

### Phase 1: Foundation (Weeks 1-4)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PHASE 1: FOUNDATION                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Week 1-2: Project Setup                                                    │
│  ───────────────────────                                                    │
│  □ Initialize Next.js project with TypeScript                               │
│  □ Set up NestJS backend                                                    │
│  □ Configure PostgreSQL with Prisma                                         │
│  □ Set up Redis for caching/queues                                         │
│  □ Initialize Hardhat/Foundry for contracts                                 │
│  □ Set up CI/CD pipelines                                                   │
│  □ Configure development environments                                        │
│                                                                              │
│  Week 3-4: Core Smart Contracts                                             │
│  ─────────────────────────────                                              │
│  □ Implement BettingPool.sol                                                │
│  □ Implement Treasury.sol                                                   │
│  □ Implement StoryForgeNFT.sol                                              │
│  □ Write comprehensive tests                                                │
│  □ Deploy to testnet (Base Sepolia)                                         │
│  □ Initial security review                                                  │
│                                                                              │
│  Deliverables:                                                              │
│  ✓ Working development environment                                          │
│  ✓ Deployed testnet contracts                                               │
│  ✓ Basic API structure                                                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Phase 2: AI Story Engine (Weeks 5-8)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PHASE 2: AI STORY ENGINE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Week 5-6: Story Generation                                                 │
│  ─────────────────────────                                                  │
│  □ Set up Claude/GPT-4 API integration                                      │
│  □ Develop Fantasy Writer prompt system                                     │
│  □ Implement chapter generation pipeline                                    │
│  □ Build outcome teaser generator                                           │
│  □ Create story context manager                                             │
│  □ Implement world state tracking                                           │
│                                                                              │
│  Week 7-8: Entity Extraction & Images                                       │
│  ────────────────────────────────────                                       │
│  □ Build NLP entity extraction pipeline                                     │
│  □ Integrate DALL-E 3 for image generation                                  │
│  □ Create consistent style prompts                                          │
│  □ Implement IPFS upload service                                            │
│  □ Build entity database population                                         │
│  □ Set up scheduled chapter generation job                                  │
│                                                                              │
│  Deliverables:                                                              │
│  ✓ Working AI story generation                                              │
│  ✓ Automated entity extraction                                              │
│  ✓ AI image generation for entities                                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Phase 3: Betting System (Weeks 9-12)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PHASE 3: BETTING SYSTEM                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Week 9-10: Backend Betting Logic                                           │
│  ───────────────────────────────                                            │
│  □ Implement betting service                                                │
│  □ Build pool management system                                             │
│  □ Create deposit handling (USDC/USDT)                                      │
│  □ Implement fee calculation (2%)                                           │
│  □ Build distribution logic (85/15 split)                                   │
│  □ Handle carryover mechanics                                               │
│  □ Integrate with blockchain layer                                          │
│                                                                              │
│  Week 11-12: Frontend Betting UI                                            │
│  ───────────────────────────────                                            │
│  □ Build betting panel component                                            │
│  □ Create outcome cards with odds                                           │
│  □ Implement deposit modal                                                  │
│  □ Build claim winnings flow                                                │
│  □ Create betting history view                                              │
│  □ Add real-time pool updates (WebSocket)                                   │
│  □ Mobile-responsive design                                                 │
│                                                                              │
│  Deliverables:                                                              │
│  ✓ Complete betting flow                                                    │
│  ✓ Real-time odds updates                                                   │
│  ✓ Wallet integration                                                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Phase 4: Reader Experience (Weeks 13-16)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PHASE 4: READER EXPERIENCE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Week 13-14: Story Reader                                                   │
│  ───────────────────────                                                    │
│  □ Build chapter reader component                                           │
│  □ Implement inline illustrations                                           │
│  □ Create chapter navigation                                                │
│  □ Add reading progress tracking                                            │
│  □ Build chapter archive view                                               │
│  □ Implement dark/light theme                                               │
│                                                                              │
│  Week 15-16: Compendium                                                     │
│  ─────────────────────                                                      │
│  □ Build character compendium page                                          │
│  □ Create item/weapon catalog                                               │
│  □ Implement location/map views                                             │
│  □ Build monster bestiary                                                   │
│  □ Create relationship diagram (D3.js)                                      │
│  □ Implement full-text search                                               │
│  □ Add entity detail modals                                                 │
│                                                                              │
│  Deliverables:                                                              │
│  ✓ Immersive reading experience                                             │
│  ✓ Complete compendium system                                               │
│  ✓ Interactive relationship graph                                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Phase 5: NFT System (Weeks 17-20)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PHASE 5: NFT SYSTEM                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Week 17-18: NFT Minting                                                    │
│  ──────────────────────                                                     │
│  □ Build NFT minting service                                                │
│  □ Create metadata generation                                               │
│  □ Implement IPFS metadata upload                                           │
│  □ Build batch minting for new chapters                                     │
│  □ Create admin minting interface                                           │
│                                                                              │
│  Week 19-20: NFT Gallery                                                    │
│  ──────────────────────                                                     │
│  □ Build NFT gallery page                                                   │
│  □ Create NFT detail views                                                  │
│  □ Implement user NFT collection view                                       │
│  □ Add NFT linking from compendium                                          │
│  □ (Optional) Basic marketplace integration                                 │
│                                                                              │
│  Deliverables:                                                              │
│  ✓ Automated NFT minting                                                    │
│  ✓ NFT gallery and collection views                                        │
│  ✓ Metadata on IPFS                                                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Phase 6: Polish & Launch (Weeks 21-24)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PHASE 6: POLISH & LAUNCH                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Week 21-22: Testing & Security                                             │
│  ───────────────────────────────                                            │
│  □ Comprehensive E2E testing                                                │
│  □ Smart contract audit                                                     │
│  □ Penetration testing                                                      │
│  □ Load testing                                                             │
│  □ Bug bounty program setup                                                 │
│                                                                              │
│  Week 23-24: Launch Preparation                                             │
│  ───────────────────────────────                                            │
│  □ Mainnet deployment                                                       │
│  □ Production infrastructure setup                                          │
│  □ Monitoring and alerting                                                  │
│  □ Documentation                                                            │
│  □ Generate initial story content                                           │
│  □ Marketing materials                                                      │
│  □ Soft launch with limited users                                           │
│  □ Public launch                                                            │
│                                                                              │
│  Deliverables:                                                              │
│  ✓ Production-ready platform                                                │
│  ✓ Audited smart contracts                                                  │
│  ✓ Initial story with betting active                                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Milestone Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MILESTONE TIMELINE                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Week 4  ──► M1: Foundation Complete                                        │
│              • Dev environment ready                                        │
│              • Testnet contracts deployed                                   │
│                                                                              │
│  Week 8  ──► M2: AI Engine Complete                                         │
│              • Story generation working                                     │
│              • Entity extraction functional                                 │
│                                                                              │
│  Week 12 ──► M3: Betting System Complete                                    │
│              • Full betting flow operational                                │
│              • Wallet integration complete                                  │
│                                                                              │
│  Week 16 ──► M4: Reader Experience Complete                                 │
│              • Chapter reader polished                                      │
│              • Compendium fully functional                                  │
│                                                                              │
│  Week 20 ──► M5: NFT System Complete                                        │
│              • Automated NFT minting                                        │
│              • Gallery views ready                                          │
│                                                                              │
│  Week 24 ──► M6: LAUNCH 🚀                                                  │
│              • Mainnet deployment                                           │
│              • First story live with betting                                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Cost Estimates

### Development Costs (Estimated)

| Category | Item | Estimated Cost |
|----------|------|----------------|
| **Infrastructure** | | |
| | Vercel Pro (Frontend) | $20/month |
| | Railway/Render (Backend) | $50-100/month |
| | Supabase Pro (Database) | $25/month |
| | Redis Cloud | $30/month |
| | IPFS Pinning (Pinata) | $20/month |
| **AI Services** | | |
| | Claude API | $200-500/month |
| | DALL-E 3 API | $100-300/month |
| **Blockchain** | | |
| | Gas fees (testnet) | Free |
| | Gas fees (mainnet launch) | $500-1000 |
| | Contract audit | $15,000-50,000 |
| **Third-Party** | | |
| | The Graph (indexing) | $50/month |
| | Domain & SSL | $50/year |
| **Development** | | |
| | Developer(s) | Varies |

### Ongoing Monthly Costs (Post-Launch)

| Category | Low Traffic | Medium Traffic | High Traffic |
|----------|-------------|----------------|--------------|
| Infrastructure | $200/month | $500/month | $1,500/month |
| AI Generation | $300/month | $800/month | $2,000/month |
| Blockchain (gas) | $100/month | $300/month | $1,000/month |
| **Total** | ~$600/month | ~$1,600/month | ~$4,500/month |

---

## Appendix

### A. Environment Variables

```env
# .env.example

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/storyforge"
REDIS_URL="redis://localhost:6379"

# Blockchain
PRIVATE_KEY="0x..."
ALCHEMY_API_KEY="..."
BASE_RPC_URL="https://mainnet.base.org"
USDC_ADDRESS="0x..."
USDT_ADDRESS="0x..."

# AI Services
ANTHROPIC_API_KEY="sk-ant-..."
OPENAI_API_KEY="sk-..."

# Storage
IPFS_PROJECT_ID="..."
IPFS_PROJECT_SECRET="..."
ARWEAVE_KEY="..."

# Auth
JWT_SECRET="..."
NEXTAUTH_SECRET="..."

# Monitoring
SENTRY_DSN="..."
```

### B. Recommended Team Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         RECOMMENDED TEAM                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Core Team (Minimum Viable)                                                 │
│  ──────────────────────────                                                 │
│  • 1x Full-Stack Developer (Next.js + NestJS)                               │
│  • 1x Smart Contract Developer (Solidity)                                   │
│  • 1x AI/ML Engineer (for story generation)                                 │
│                                                                              │
│  Ideal Team                                                                 │
│  ─────────                                                                  │
│  • 2x Frontend Developers                                                   │
│  • 2x Backend Developers                                                    │
│  • 1x Smart Contract Developer                                              │
│  • 1x AI/ML Engineer                                                        │
│  • 1x DevOps Engineer                                                       │
│  • 1x UI/UX Designer                                                        │
│  • 1x Product Manager                                                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Conclusion

Story-Forge represents an innovative fusion of AI-generated storytelling and blockchain-based prediction markets. This implementation plan provides a comprehensive roadmap for building a production-ready platform that:

1. **Engages readers** with AI-generated fantasy narratives
2. **Creates excitement** through outcome prediction betting
3. **Builds value** with 1/1 NFT collectibles
4. **Establishes lore** through a living compendium

The modular architecture allows for iterative development while maintaining flexibility for future enhancements such as multiple simultaneous stories, community-driven plot suggestions, or secondary NFT markets.

---

*Document Version: 1.0*
*Last Updated: January 2026*
*Story-Forge Implementation Plan*
