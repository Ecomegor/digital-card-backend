import { Module } from '@nestjs/common';
import { ProfileRepository } from './profile.repository.js';
import { ProfileResolver } from './profile.resolver.js';
import { ProfileService } from './profile.service.js';

@Module({
  providers: [ProfileResolver, ProfileService, ProfileRepository],
})
export class ProfileModule {}
