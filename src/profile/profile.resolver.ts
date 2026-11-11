import { Args, Query, Resolver } from '@nestjs/graphql';
import { ProfileArgs } from './dto/profile.args.js';
import { ProfileModel } from './models/profile.model.js';
import { type Profile } from './profile.js';
import { ProfileService } from './profile.service.js';

@Resolver(() => ProfileModel)
export class ProfileResolver {
  constructor(private readonly profileService: ProfileService) {}

  @Query(() => ProfileModel)
  profile(@Args() { slug }: ProfileArgs): Promise<Profile> {
    return this.profileService.getProfile(slug);
  }
}
