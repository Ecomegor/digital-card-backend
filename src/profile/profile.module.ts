import { Module } from '@nestjs/common';
import { ProfileLinksLoader } from './profile-links.loader.js';
import { ProfileLinksRepository } from './profile-links.repository.js';
import { ProfileLinksResolver } from './profile-links.resolver.js';
import { ProfileLinksService } from './profile-links.service.js';
import { ProfileRepository } from './profile.repository.js';
import { ProfileResolver } from './profile.resolver.js';
import { ProfileService } from './profile.service.js';

@Module({
  providers: [
    ProfileResolver,
    ProfileService,
    ProfileRepository,
    ProfileLinksResolver,
    ProfileLinksService,
    ProfileLinksRepository,
    ProfileLinksLoader,
  ],
})
export class ProfileModule {}
