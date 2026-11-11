import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed/seed.module.js';
import { SeedService } from './seed/seed.service.js';

async function seed(): Promise<void> {
  const app = await NestFactory.createApplicationContext(SeedModule);
  await app.get(SeedService).run();
  await app.close();
}

await seed();
