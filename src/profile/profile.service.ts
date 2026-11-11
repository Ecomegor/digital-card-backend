import { Injectable, NotFoundException } from '@nestjs/common';
import { type Profile } from './profile.js';
import { ProfileRepository } from './profile.repository.js';

@Injectable()
export class ProfileService {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async getProfile(): Promise<Profile> {
    const profile = await this.profileRepository.findFirst();

    if (!profile) {
      throw new NotFoundException('Profile is not initialized');
    }

    return profile;
  }
}
