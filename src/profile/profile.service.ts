import { Injectable, NotFoundException } from '@nestjs/common';
import { type Profile } from './profile.js';
import { ProfileRepository } from './profile.repository.js';

@Injectable()
export class ProfileService {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async getProfile(slug?: string | null): Promise<Profile> {
    const profile =
      slug === undefined || slug === null
        ? await this.profileRepository.findFirst()
        : await this.profileRepository.findBySlug(slug);

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }
}
