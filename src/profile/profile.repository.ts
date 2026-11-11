import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { type Profile } from './profile.js';

const profileSelect = { id: true, name: true, description: true } as const;

@Injectable()
export class ProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  findFirst(): Promise<Profile | null> {
    return this.prisma.profile.findFirst({
      select: profileSelect,
      orderBy: { createdAt: 'asc' },
    });
  }

  findBySlug(slug: string): Promise<Profile | null> {
    return this.prisma.profile.findUnique({ where: { slug }, select: profileSelect });
  }
}
