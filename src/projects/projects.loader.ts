import { Injectable } from '@nestjs/common';
import { GroupedLoader } from '../common/dataloader/grouped-loader.js';
import { type Project } from './project.js';
import { ProjectsService } from './projects.service.js';

@Injectable()
export class ProjectsLoader extends GroupedLoader<string, Project> {
  constructor(private readonly projectsService: ProjectsService) {
    super();
  }

  protected findByKeys(profileIds: readonly string[]): Promise<Project[]> {
    return this.projectsService.findByProfileIds(profileIds);
  }

  protected keyOf(project: Project): string {
    return project.profileId;
  }
}
