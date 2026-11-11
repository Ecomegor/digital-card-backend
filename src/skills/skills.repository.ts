import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { type Skill } from './skill.js';

@Injectable()
export class SkillsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByProfileIds(profileIds: readonly string[]): Promise<Skill[]> {
    return this.prisma.skill.findMany({
      where: { profileId: { in: [...profileIds] } },
      select: { id: true, profileId: true, name: true, category: true },
      orderBy: [{ profileId: 'asc' }, { sortOrder: 'asc' }],
    });
  }
}
