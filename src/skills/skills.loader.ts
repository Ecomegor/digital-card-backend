import { Injectable } from '@nestjs/common';
import { GroupedLoader } from '../common/dataloader/grouped-loader.js';
import { type Skill } from './skill.js';
import { SkillsService } from './skills.service.js';

@Injectable()
export class SkillsLoader extends GroupedLoader<string, Skill> {
  constructor(private readonly skillsService: SkillsService) {
    super();
  }

  protected findByKeys(profileIds: readonly string[]): Promise<Skill[]> {
    return this.skillsService.findByProfileIds(profileIds);
  }

  protected keyOf(skill: Skill): string {
    return skill.profileId;
  }
}
