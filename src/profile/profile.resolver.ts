import { Args, Query, Resolver } from '@nestjs/graphql';
import { ProfileArgs } from './dto/profile.args.js';
import { ProfileModel } from './models/profile.model.js';
import { ProfileService } from './profile.service.js';

@Resolver(() => ProfileModel)
export class ProfileResolver {
  constructor(private readonly profileService: ProfileService) {}

  @Query(() => ProfileModel, { nullable: true })
  profile(@Args() { slug }: ProfileArgs): Promise<ProfileModel | null> {
    return this.profileService.findBySlug(slug);
  }
}
