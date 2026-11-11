import { Injectable } from '@nestjs/common';
import { type Project } from './project.js';
import { ProjectsRepository } from './projects.repository.js';

@Injectable()
export class ProjectsService {
  constructor(private readonly projectsRepository: ProjectsRepository) {}

  findByProfileIds(profileIds: readonly string[]): Promise<Project[]> {
    return this.projectsRepository.findByProfileIds(profileIds);
  }
}
