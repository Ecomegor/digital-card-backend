import { Injectable } from '@nestjs/common';
import { GroupedLoader } from '../common/dataloader/grouped-loader.js';
import { type ProfileLink } from './profile-link.js';
import { ProfileLinksService } from './profile-links.service.js';

@Injectable()
export class ProfileLinksLoader extends GroupedLoader<string, ProfileLink> {
  constructor(private readonly profileLinksService: ProfileLinksService) {
    super();
  }

  protected findByKeys(profileIds: readonly string[]): Promise<ProfileLink[]> {
    return this.profileLinksService.findByProfileIds(profileIds);
  }

  protected keyOf(link: ProfileLink): string {
    return link.profileId;
  }
}
