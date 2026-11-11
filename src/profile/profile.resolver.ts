import { Query, Resolver } from '@nestjs/graphql';
import { ProfileModel } from './models/profile.model.js';
import { type Profile } from './profile.js';
import { ProfileService } from './profile.service.js';

@Resolver(() => ProfileModel)
export class ProfileResolver {
  constructor(private readonly profileService: ProfileService) {}

  @Query(() => ProfileModel)
  profile(): Promise<Profile> {
    return this.profileService.getProfile();
  }
}
