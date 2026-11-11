import { Prisma } from '../generated/prisma/client.js';

export const profileSeed = {
  slug: 'developer',
  fullName: 'Alex Developer',
  headline: 'Senior TypeScript Backend Engineer',
  bio: 'Builds reliable backend systems with NestJS, GraphQL and PostgreSQL.',
} as const satisfies Prisma.ProfileCreateInput;
