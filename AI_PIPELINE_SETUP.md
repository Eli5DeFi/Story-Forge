# Story-Forge AI Pipeline - Setup Complete

## What Was Implemented

### 1. Jobs Module (`/apps/api/src/jobs/`)
- Created `jobs.module.ts` to properly register the `ChapterGenerationJob` with NestJS
- The job module is now imported in the main `app.module.ts`

### 2. Admin Module (`/apps/api/src/modules/admin/`)
- **`admin.module.ts`** - Wires together admin functionality
- **`admin.service.ts`** - Core admin operations:
  - `createStory()` - Create new stories with world state
  - `seedInitialChapter()` - Seed a story's first chapter with outcomes
  - `triggerChapterGeneration()` - Manually trigger AI chapter generation
  - `getGenerationStatus()` - Monitor queue status
  - `closeCurrentBetting()` - Force close betting period
  - `getStoryContext()` - Debug AI context
  - `deleteStory()` - Clean up test data
- **`admin.controller.ts`** - REST endpoints at `/api/admin/`

### 3. WebSocket Event Integration
- Updated `ChapterGenerationProcessor` to emit events via `EventsGateway`:
  - `chapter:new` - When new chapter is published
  - `chapter:update` - When chapter status changes
  - `entity:new` - When new characters/items are extracted

### 4. Type Fixes
- Fixed `StoryContext` interface mismatch between services
- Added proper type annotations for Prisma callbacks
- Removed unused `BettingService` import

### 5. Database Seed Script (`/apps/api/prisma/seed.ts`)
- Creates "The Chronicles of Eldoria" sample story
- Seeds Chapter 1 with full narrative content
- Creates 5 betting outcomes for readers to predict
- Populates initial characters (Aria, Master Venn, Shadow Sovereign)
- Creates locations and items

## API Endpoints

### Admin Endpoints (no auth for now)
```
GET    /api/admin/stories                    - List all stories
POST   /api/admin/stories                    - Create a story
POST   /api/admin/stories/:id/seed-chapter   - Seed initial chapter
POST   /api/admin/stories/:id/generate       - Trigger AI generation
GET    /api/admin/stories/:id/generation-status - Queue status
POST   /api/admin/stories/:id/close-betting  - Close current betting
GET    /api/admin/stories/:id/context        - View AI context
DELETE /api/admin/stories/:id                - Delete story
```

## How to Test the AI Pipeline

### Prerequisites
1. PostgreSQL database running
2. Redis running (for Bull queue)
3. Anthropic API key set in `.env`
4. OpenAI API key (optional, for image generation)
5. Pinata API keys (optional, for IPFS)

### Setup Steps

```bash
cd apps/api

# 1. Copy environment file
cp .env.example .env

# 2. Configure .env with:
#    - DATABASE_URL
#    - REDIS_HOST/PORT
#    - ANTHROPIC_API_KEY

# 3. Generate Prisma client
npm run db:generate

# 4. Push schema to database
npm run db:push

# 5. Seed the database
npm run db:seed

# 6. Start the API
npm run dev
```

### Trigger Chapter Generation

```bash
# Get the story ID from seed output, then:
curl -X POST http://localhost:3001/api/admin/stories/{STORY_ID}/generate

# Monitor progress:
curl http://localhost:3001/api/admin/stories/{STORY_ID}/generation-status
```

### View Generated Content

```bash
# Get story details
curl http://localhost:3001/api/stories/chronicles-of-eldoria

# Get latest chapter
curl http://localhost:3001/api/stories/chronicles-of-eldoria/chapters/2
```

## Pipeline Flow

1. **Scheduled Job** (every 3 days) or **Manual Trigger** → Queue job
2. **Build Context** - Gather world state, characters, plot threads
3. **Select Outcome** - AI picks winning outcome from betting
4. **Generate Chapter** - AI writes ~3000 word chapter
5. **Extract Entities** - Parse new characters, items, locations
6. **Generate Outcomes** - Create 4-5 new betting options
7. **Upload to IPFS** - Store chapter permanently
8. **Create Records** - Save to database
9. **Open Betting** - Create pools for each outcome
10. **Generate Images** - DALL-E images for new entities (async)
11. **Emit Events** - WebSocket notifications

## Known Issues

- Some TypeScript errors in betting/blockchain services need Prisma generate
- Blockchain contract interactions need `chain` parameter added
- Image generation uses placeholders when OpenAI not configured

## Next Steps

1. Run `npm install` to get viem dependency
2. Run `npm run db:generate` to create Prisma types
3. Add authentication to admin endpoints
4. Set up Oracle service for on-chain resolution
5. Deploy to testnet and verify contract integration
