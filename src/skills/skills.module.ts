import { Module } from '@nestjs/common';
import { SkillsLoader } from './skills.loader.js';
import { SkillsRepository } from './skills.repository.js';
import { SkillsResolver } from './skills.resolver.js';
import { SkillsService } from './skills.service.js';

@Module({
  providers: [SkillsResolver, SkillsService, SkillsRepository, SkillsLoader],
})
export class SkillsModule {}
