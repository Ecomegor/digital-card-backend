import { Module } from '@nestjs/common';
import { ExperienceLoader } from './experience.loader.js';
import { ExperienceRepository } from './experience.repository.js';
import { ExperienceResolver } from './experience.resolver.js';
import { ExperienceService } from './experience.service.js';

@Module({
  providers: [ExperienceResolver, ExperienceService, ExperienceRepository, ExperienceLoader],
})
export class ExperienceModule {}
