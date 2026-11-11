import { Injectable } from '@nestjs/common';
import { type Skill } from './skill.js';
import { SkillsRepository } from './skills.repository.js';

@Injectable()
export class SkillsService {
  constructor(private readonly skillsRepository: SkillsRepository) {}

  findByProfileIds(profileIds: readonly string[]): Promise<Skill[]> {
    return this.skillsRepository.findByProfileIds(profileIds);
  }
}
