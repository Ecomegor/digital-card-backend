import { type Prisma } from '../src/generated/prisma/client.js';

type OrderedSeed<T> = Omit<T, 'id' | 'sortOrder'>;

export interface ProfileSeed {
  slug: string;
  name: string;
  description: string;
  links: OrderedSeed<Prisma.ProfileLinkCreateManyProfileInput>[];
  skills: OrderedSeed<Prisma.SkillCreateManyProfileInput>[];
  experiences: OrderedSeed<Prisma.ExperienceCreateManyProfileInput>[];
  projects: OrderedSeed<Prisma.ProjectCreateManyProfileInput>[];
}

export const profileSeed: ProfileSeed = {
  slug: 'developer',
  name: 'Егор',
  description: 'Профессиональная разработка с индивидуальным подходом',
  links: [{ label: 'Telegram', url: 'https://t.me/egorecom' }],
  skills: [],
  experiences: [],
  projects: [
    { name: 'caether.ai', url: 'https://caether.ai' },
    { name: 'twittor.net', url: 'https://twittor.net' },
  ],
};
