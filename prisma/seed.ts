import { Logger, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppConfigModule } from '../src/config/app-config.module.js';
import { PrismaModule } from '../src/prisma/prisma.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { profileSeed, type ProfileSeed } from './seed-data.js';

@Module({
  imports: [AppConfigModule, PrismaModule],
})
class SeedModule {}

function ownedInOrder<T extends object>(
  items: readonly T[],
  profileId: string,
): (T & { profileId: string; sortOrder: number })[] {
  return items.map((item, sortOrder) => ({ ...item, profileId, sortOrder }));
}

async function seedProfile(prisma: PrismaService, seed: ProfileSeed): Promise<void> {
  const { slug, name, description } = seed;

  await prisma.$transaction(async (tx) => {
    const { id: profileId } = await tx.profile.upsert({
      where: { slug },
      create: { slug, name, description },
      update: { name, description },
      select: { id: true },
    });
    const ownedByProfile = { where: { profileId } };

    await tx.profileLink.deleteMany(ownedByProfile);
    await tx.skill.deleteMany(ownedByProfile);
    await tx.experience.deleteMany(ownedByProfile);
    await tx.project.deleteMany(ownedByProfile);

    await tx.profileLink.createMany({ data: ownedInOrder(seed.links, profileId) });
    await tx.skill.createMany({ data: ownedInOrder(seed.skills, profileId) });
    await tx.experience.createMany({ data: ownedInOrder(seed.experiences, profileId) });
    await tx.project.createMany({ data: ownedInOrder(seed.projects, profileId) });
  });
}

const app = await NestFactory.createApplicationContext(SeedModule);

try {
  await seedProfile(app.get(PrismaService), profileSeed);
  new Logger('Seed').log(`Profile "${profileSeed.slug}" seeded`);
} finally {
  await app.close();
}
