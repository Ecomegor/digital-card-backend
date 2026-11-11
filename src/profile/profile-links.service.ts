import { Injectable } from '@nestjs/common';
import { type ProfileLink } from './profile-link.js';
import { ProfileLinksRepository } from './profile-links.repository.js';

@Injectable()
export class ProfileLinksService {
  constructor(private readonly profileLinksRepository: ProfileLinksRepository) {}

  findByProfileIds(profileIds: readonly string[]): Promise<ProfileLink[]> {
    return this.profileLinksRepository.findByProfileIds(profileIds);
  }
}
