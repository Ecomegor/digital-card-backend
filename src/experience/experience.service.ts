import { Injectable } from '@nestjs/common';
import { formatExperiencePeriod } from './experience-period.js';
import { ExperienceRepository } from './experience.repository.js';
import { type Experience } from './experience.js';

@Injectable()
export class ExperienceService {
  constructor(private readonly experienceRepository: ExperienceRepository) {}

  async findByProfileIds(profileIds: readonly string[]): Promise<Experience[]> {
    const records = await this.experienceRepository.findByProfileIds(profileIds);

    return records.map((record) => ({
      ...record,
      period: formatExperiencePeriod(record.startDate, record.endDate),
    }));
  }
}
