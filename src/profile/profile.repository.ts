import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { type Profile } from './profile.js';

@Injectable()
export class ProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  findFirst(): Promise<Profile | null> {
    return this.prisma.profile.findFirst({
      select: { id: true, name: true, description: true },
      orderBy: { createdAt: 'asc' },
    });
  }
}
