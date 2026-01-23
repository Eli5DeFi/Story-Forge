-- Story-Forge Database Schema
-- Generated from Prisma schema

-- Create ENUMs
CREATE TYPE "StoryStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED');
CREATE TYPE "ChapterStatus" AS ENUM ('DRAFT', 'GENERATING', 'PUBLISHED', 'BETTING_OPEN', 'BETTING_CLOSED', 'RESOLVED', 'FAILED');
CREATE TYPE "PoolStatus" AS ENUM ('OPEN', 'CLOSED', 'RESOLVING', 'RESOLVED', 'CARRIED_OVER');
CREATE TYPE "TokenType" AS ENUM ('USDC', 'USDT');
CREATE TYPE "BetStatus" AS ENUM ('PENDING', 'CONFIRMED', 'WON', 'LOST', 'CLAIMED', 'REFUNDED');
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');
CREATE TYPE "ItemType" AS ENUM ('WEAPON', 'ARMOR', 'ACCESSORY', 'CONSUMABLE', 'KEY_ITEM', 'ARTIFACT', 'TOOL', 'CURRENCY');
CREATE TYPE "Rarity" AS ENUM ('COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC');

-- Users table
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "username" TEXT,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "total_wagered" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "total_won" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "win_streak" INTEGER NOT NULL DEFAULT 0,
    "best_streak" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_wallet_address_key" ON "users"("wallet_address");

-- Stories table
CREATE TABLE "stories" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "synopsis" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "status" "StoryStatus" NOT NULL DEFAULT 'ACTIVE',
    "cover_image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "current_chapter" INTEGER NOT NULL DEFAULT 0,
    "world_state" JSONB,
    "plot_threads" JSONB,
    "style_guide" TEXT,
    CONSTRAINT "stories_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "stories_slug_key" ON "stories"("slug");

-- Chapters table
CREATE TABLE "chapters" (
    "id" TEXT NOT NULL,
    "story_id" TEXT NOT NULL,
    "chapter_number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "published_at" TIMESTAMP(3),
    "betting_ends_at" TIMESTAMP(3),
    "selected_outcome" TEXT,
    "ai_reasoning" TEXT,
    "ipfs_hash" TEXT,
    "status" "ChapterStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "extracted_entities" JSONB,
    CONSTRAINT "chapters_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "chapters_story_id_chapter_number_key" ON "chapters"("story_id", "chapter_number");

-- Outcomes table
CREATE TABLE "outcomes" (
    "id" TEXT NOT NULL,
    "chapter_id" TEXT NOT NULL,
    "option_number" INTEGER NOT NULL,
    "teaser_text" TEXT NOT NULL,
    "full_narrative" TEXT,
    "emotional_tone" TEXT,
    "plot_implications" JSONB,
    "is_selected" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "outcomes_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "outcomes_chapter_id_option_number_key" ON "outcomes"("chapter_id", "option_number");

-- Betting Pools table
CREATE TABLE "betting_pools" (
    "id" TEXT NOT NULL,
    "chapter_id" TEXT NOT NULL,
    "outcome_id" TEXT NOT NULL,
    "total_amount_usdc" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "total_amount_usdt" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "voter_count" INTEGER NOT NULL DEFAULT 0,
    "status" "PoolStatus" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),
    "carryover_usdc" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "carryover_usdt" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "on_chain_pool_id" TEXT,
    CONSTRAINT "betting_pools_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "betting_pools_outcome_id_key" ON "betting_pools"("outcome_id");

-- User Bets table
CREATE TABLE "user_bets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "outcome_id" TEXT NOT NULL,
    "pool_id" TEXT NOT NULL,
    "amount" DECIMAL(20,6) NOT NULL,
    "token_type" "TokenType" NOT NULL,
    "fee_paid" DECIMAL(20,6) NOT NULL,
    "tx_hash" TEXT NOT NULL,
    "status" "BetStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claimed_at" TIMESTAMP(3),
    CONSTRAINT "user_bets_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "user_bets_user_id_idx" ON "user_bets"("user_id");
CREATE INDEX "user_bets_pool_id_idx" ON "user_bets"("pool_id");

-- Treasury Entries table
CREATE TABLE "treasury_entries" (
    "id" TEXT NOT NULL,
    "pool_id" TEXT NOT NULL,
    "amount" DECIMAL(20,6) NOT NULL,
    "token_type" "TokenType" NOT NULL,
    "source" TEXT NOT NULL,
    "tx_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "treasury_entries_pkey" PRIMARY KEY ("id")
);

-- Payouts table
CREATE TABLE "payouts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "pool_id" TEXT NOT NULL,
    "amount" DECIMAL(20,6) NOT NULL,
    "token_type" "TokenType" NOT NULL,
    "tx_hash" TEXT,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid_at" TIMESTAMP(3),
    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- Characters table
CREATE TABLE "characters" (
    "id" TEXT NOT NULL,
    "story_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "short_bio" TEXT,
    "first_appearance" INTEGER NOT NULL,
    "image_url" TEXT,
    "traits" JSONB,
    "status" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "nft_token_id" TEXT,
    "nft_minted" BOOLEAN NOT NULL DEFAULT false,
    "nft_ipfs_uri" TEXT,
    CONSTRAINT "characters_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "characters_story_id_name_key" ON "characters"("story_id", "name");

-- Character Relations table
CREATE TABLE "character_relations" (
    "id" TEXT NOT NULL,
    "character_a_id" TEXT NOT NULL,
    "character_b_id" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "description" TEXT,
    "established_chapter" INTEGER NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "character_relations_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "character_relations_character_a_id_character_b_id_key" ON "character_relations"("character_a_id", "character_b_id");

-- Items table
CREATE TABLE "items" (
    "id" TEXT NOT NULL,
    "story_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "ItemType" NOT NULL,
    "rarity" "Rarity" NOT NULL DEFAULT 'COMMON',
    "first_appearance" INTEGER NOT NULL,
    "owner_char_id" TEXT,
    "image_url" TEXT,
    "properties" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "nft_token_id" TEXT,
    "nft_minted" BOOLEAN NOT NULL DEFAULT false,
    "nft_ipfs_uri" TEXT,
    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "items_story_id_name_key" ON "items"("story_id", "name");

-- Locations table
CREATE TABLE "locations" (
    "id" TEXT NOT NULL,
    "story_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "region" TEXT,
    "first_appearance" INTEGER NOT NULL,
    "connected_locations" TEXT[],
    "image_url" TEXT,
    "coordinates" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "nft_token_id" TEXT,
    "nft_minted" BOOLEAN NOT NULL DEFAULT false,
    "nft_ipfs_uri" TEXT,
    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "locations_story_id_name_key" ON "locations"("story_id", "name");

-- Monsters table
CREATE TABLE "monsters" (
    "id" TEXT NOT NULL,
    "story_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "species" TEXT,
    "threat_level" INTEGER NOT NULL,
    "abilities" TEXT[],
    "weaknesses" TEXT[],
    "first_appearance" INTEGER NOT NULL,
    "image_url" TEXT,
    "is_boss" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "nft_token_id" TEXT,
    "nft_minted" BOOLEAN NOT NULL DEFAULT false,
    "nft_ipfs_uri" TEXT,
    CONSTRAINT "monsters_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "monsters_story_id_name_key" ON "monsters"("story_id", "name");

-- Lore Entries table
CREATE TABLE "lore_entries" (
    "id" TEXT NOT NULL,
    "story_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "related_entities" TEXT[],
    "chapter_refs" INTEGER[],
    "tags" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "lore_entries_pkey" PRIMARY KEY ("id")
);

-- System Config table
CREATE TABLE "system_config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "system_config_key_key" ON "system_config"("key");

-- Foreign Keys
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "outcomes" ADD CONSTRAINT "outcomes_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "betting_pools" ADD CONSTRAINT "betting_pools_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "betting_pools" ADD CONSTRAINT "betting_pools_outcome_id_fkey" FOREIGN KEY ("outcome_id") REFERENCES "outcomes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_bets" ADD CONSTRAINT "user_bets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "user_bets" ADD CONSTRAINT "user_bets_outcome_id_fkey" FOREIGN KEY ("outcome_id") REFERENCES "outcomes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "user_bets" ADD CONSTRAINT "user_bets_pool_id_fkey" FOREIGN KEY ("pool_id") REFERENCES "betting_pools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "treasury_entries" ADD CONSTRAINT "treasury_entries_pool_id_fkey" FOREIGN KEY ("pool_id") REFERENCES "betting_pools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_pool_id_fkey" FOREIGN KEY ("pool_id") REFERENCES "betting_pools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "characters" ADD CONSTRAINT "characters_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "character_relations" ADD CONSTRAINT "character_relations_character_a_id_fkey" FOREIGN KEY ("character_a_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "character_relations" ADD CONSTRAINT "character_relations_character_b_id_fkey" FOREIGN KEY ("character_b_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "items" ADD CONSTRAINT "items_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "items" ADD CONSTRAINT "items_owner_char_id_fkey" FOREIGN KEY ("owner_char_id") REFERENCES "characters"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "locations" ADD CONSTRAINT "locations_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "monsters" ADD CONSTRAINT "monsters_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lore_entries" ADD CONSTRAINT "lore_entries_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Prisma migrations tracking table
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" VARCHAR(36) NOT NULL,
    "checksum" VARCHAR(64) NOT NULL,
    "finished_at" TIMESTAMPTZ,
    "migration_name" VARCHAR(255) NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMPTZ,
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id")
);

-- Record migration
INSERT INTO "_prisma_migrations" ("id", "checksum", "migration_name", "finished_at", "applied_steps_count")
VALUES (gen_random_uuid()::text, 'manual_init', '20260123000000_init', NOW(), 1);
