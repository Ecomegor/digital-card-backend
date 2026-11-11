import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { profileSeed } from './seed-data.js';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async run(): Promise<void> {
    const { slug, ...profileData } = profileSeed;

    await this.prisma.profile.upsert({
      where: { slug },
      create: profileSeed,
      update: profileData,
    });

    this.logger.log(`Profile "${slug}" seeded`);
  }
}
