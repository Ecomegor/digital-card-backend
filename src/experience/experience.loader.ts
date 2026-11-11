import { Injectable } from '@nestjs/common';
import { GroupedLoader } from '../common/dataloader/grouped-loader.js';
import { type Experience } from './experience.js';
import { ExperienceService } from './experience.service.js';

@Injectable()
export class ExperienceLoader extends GroupedLoader<string, Experience> {
  constructor(private readonly experienceService: ExperienceService) {
    super();
  }

  protected findByKeys(profileIds: readonly string[]): Promise<Experience[]> {
    return this.experienceService.findByProfileIds(profileIds);
  }

  protected keyOf(experience: Experience): string {
    return experience.profileId;
  }
}
