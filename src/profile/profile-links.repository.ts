import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { type ProfileLink } from './profile-link.js';

@Injectable()
export class ProfileLinksRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByProfileIds(profileIds: readonly string[]): Promise<ProfileLink[]> {
    return this.prisma.profileLink.findMany({
      where: { profileId: { in: [...profileIds] } },
      select: { id: true, profileId: true, label: true, url: true },
      orderBy: [{ profileId: 'asc' }, { sortOrder: 'asc' }],
    });
  }
}
