import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { type ExperienceRecord } from './experience.js';

@Injectable()
export class ExperienceRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByProfileIds(profileIds: readonly string[]): Promise<ExperienceRecord[]> {
    return this.prisma.experience.findMany({
      where: { profileId: { in: [...profileIds] } },
      select: {
        id: true,
        profileId: true,
        company: true,
        position: true,
        startDate: true,
        endDate: true,
        achievements: true,
      },
      orderBy: [{ profileId: 'asc' }, { sortOrder: 'asc' }],
    });
  }
}
