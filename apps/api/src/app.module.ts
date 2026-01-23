import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';

import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { StoryModule } from './modules/story/story.module';
import { BettingModule } from './modules/betting/betting.module';
import { CompendiumModule } from './modules/compendium/compendium.module';
import { NftModule } from './modules/nft/nft.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Scheduling for chapter generation
    ScheduleModule.forRoot(),

    // Bull queue for background jobs
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),

    // Core modules
    PrismaModule,
    AuthModule,
    StoryModule,
    BettingModule,
    CompendiumModule,
    NftModule,
    UserModule,
  ],
})
export class AppModule {}
