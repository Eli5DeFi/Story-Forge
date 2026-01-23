# Story-Forge 📚⚔️

An interactive AI-generated web novel platform where readers predict story outcomes and earn rewards.

## Overview

Story-Forge combines AI storytelling with blockchain-based prediction markets. Every 3 days, a new chapter is generated with 4-5 possible outcomes. Readers bet on which direction the story will take, and winners share the pool.

### Key Features

- **AI Story Generation**: Claude/GPT-4 powered fantasy narratives with consistent world-building
- **Prediction Markets**: Bet USDC/USDT on story outcomes (winner-takes-all)
- **1/1 NFTs**: Mint unique characters, items, and monsters from the story
- **Live Compendium**: Auto-generated wiki with character relationships
- **Real-time Updates**: WebSocket-powered live betting pools

## Architecture

```
Story-Forge/
├── apps/
│   ├── api/          # NestJS backend
│   └── web/          # Next.js frontend
├── packages/
│   └── contracts/    # Solidity smart contracts
└── IMPLEMENTATION_PLAN.md
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, RainbowKit |
| Backend | NestJS, Prisma, PostgreSQL, Redis, Bull |
| Blockchain | Solidity, Hardhat, viem/wagmi |
| AI | Claude API, OpenAI GPT-4, DALL-E 3 |
| Storage | IPFS (Pinata) |

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- pnpm or npm

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/your-org/story-forge.git
cd story-forge
npm install
```

### 2. Environment Setup

Copy the example environment files:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp packages/contracts/.env.example packages/contracts/.env
```

Configure your environment variables (see [Configuration](#configuration)).

### 3. Database Setup

```bash
# Start PostgreSQL and Redis (or use Docker)
docker-compose up -d

# Run migrations
cd apps/api
npx prisma migrate dev
npx prisma generate
```

### 4. Start Development

```bash
# From root directory
npm run dev
```

This starts:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- API Docs: http://localhost:3001/api

## Configuration

### Backend (`apps/api/.env`)

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/storyforge

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# AI Services
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# IPFS
PINATA_API_KEY=your-key
PINATA_SECRET_KEY=your-secret

# Blockchain
CHAIN_NAME=baseSepolia
RPC_URL=https://sepolia.base.org
ORACLE_PRIVATE_KEY=0x...

# Contract Addresses (after deployment)
BETTING_POOL_ADDRESS=0x...
NFT_ADDRESS=0x...
```

### Frontend (`apps/web/.env`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your-project-id
NEXT_PUBLIC_ENABLE_TESTNETS=true
NEXT_PUBLIC_BETTING_POOL_ADDRESS=0x...
NEXT_PUBLIC_NFT_ADDRESS=0x...
```

## Smart Contract Deployment

### Local Development

```bash
cd packages/contracts
npm run node          # Start local Hardhat node
npm run deploy:local  # Deploy contracts
```

### Testnet (Base Sepolia)

```bash
cd packages/contracts
npm run deploy:sepolia
npm run verify -- --network baseSepolia
```

### Mainnet

```bash
npm run deploy:base
```

## Project Structure

### Backend Modules

| Module | Description |
|--------|-------------|
| `auth` | Wallet authentication with SIWE |
| `story` | AI generation, chapters, outcomes |
| `betting` | Pools, bets, payouts |
| `compendium` | Characters, items, locations, monsters |
| `nft` | Entity NFT minting |
| `blockchain` | Contract interactions |
| `events` | WebSocket gateway |

### Frontend Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage with featured stories |
| `/stories` | Story listing |
| `/stories/[id]` | Story detail with chapters |
| `/stories/[id]/read/[chapter]` | Chapter reader + betting |
| `/stories/[id]/compendium` | Wiki for story entities |
| `/profile` | User bets, NFTs, stats |

## Story Generation Flow

1. **Scheduled Job** runs every 3 days
2. **Context Building**: Gather world state, characters, plot threads
3. **Outcome Selection**: AI picks winning outcome from previous bets
4. **Chapter Generation**: AI writes next chapter based on selected outcome
5. **Entity Extraction**: Parse characters, items, locations from narrative
6. **IPFS Upload**: Store chapter and metadata permanently
7. **Image Generation**: Create visuals for new entities
8. **Pool Creation**: Open new betting pool for next outcomes

## Betting Mechanics

- **Pool Duration**: 3 days per chapter
- **Fee Structure**: 2% platform fee
- **Distribution**: 85% to winners, 15% to treasury
- **Tokens**: USDC, USDT (6 decimals)
- **Carryover**: Unpicked outcomes roll to next pool

## API Endpoints

### Stories
- `GET /api/stories` - List stories
- `GET /api/stories/:id` - Get story details
- `GET /api/stories/:id/chapters` - List chapters

### Betting
- `GET /api/chapters/:id/outcomes` - Get betting options
- `POST /api/betting/place` - Place a bet
- `GET /api/betting/user/:address` - User bet history

### Compendium
- `GET /api/stories/:id/compendium/characters` - List characters
- `GET /api/stories/:id/compendium/items` - List items

## Testing

```bash
# Backend tests
cd apps/api
npm test

# Contract tests
cd packages/contracts
npm test

# E2E tests
npm run test:e2e
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with ❤️ by the Story-Forge team
