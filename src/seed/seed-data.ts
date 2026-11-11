import { type Prisma } from '../generated/prisma/client.js';

export const profileSeed = {
  slug: 'developer',
  name: 'Alex Developer',
  description: 'Senior TypeScript Backend Engineer',
} as const satisfies Prisma.ProfileCreateInput;
