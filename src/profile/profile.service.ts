import { Injectable } from '@nestjs/common';
import { Profile } from '../generated/prisma/client.js';
import { ProfileRepository } from './profile.repository.js';

@Injectable()
export class ProfileService {
  constructor(private readonly profileRepository: ProfileRepository) {}

  findBySlug(slug: string): Promise<Profile | null> {
    return this.profileRepository.findBySlug(slug);
  }
}
