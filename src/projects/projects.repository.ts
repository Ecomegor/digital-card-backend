import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { type Project } from './project.js';

@Injectable()
export class ProjectsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByProfileIds(profileIds: readonly string[]): Promise<Project[]> {
    return this.prisma.project.findMany({
      where: { profileId: { in: [...profileIds] } },
      select: { id: true, profileId: true, name: true, url: true, description: true },
      orderBy: [{ profileId: 'asc' }, { sortOrder: 'asc' }],
    });
  }
}
