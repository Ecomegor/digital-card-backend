import { Module } from '@nestjs/common';
import { ProjectsLoader } from './projects.loader.js';
import { ProjectsRepository } from './projects.repository.js';
import { ProjectsResolver } from './projects.resolver.js';
import { ProjectsService } from './projects.service.js';

@Module({
  providers: [ProjectsResolver, ProjectsService, ProjectsRepository, ProjectsLoader],
})
export class ProjectsModule {}
