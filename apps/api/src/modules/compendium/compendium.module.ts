import { Module } from '@nestjs/common';
import { CompendiumService } from './compendium.service';
import { CompendiumController } from './compendium.controller';

@Module({
  controllers: [CompendiumController],
  providers: [CompendiumService],
  exports: [CompendiumService],
})
export class CompendiumModule {}
