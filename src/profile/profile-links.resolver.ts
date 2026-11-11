import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { type GraphqlContext } from '../common/graphql/graphql-context.js';
import { ProfileLinkModel } from './models/profile-link.model.js';
import { ProfileModel } from './models/profile.model.js';
import { type ProfileLink } from './profile-link.js';
import { ProfileLinksLoader } from './profile-links.loader.js';

@Resolver(() => ProfileModel)
export class ProfileLinksResolver {
  constructor(private readonly profileLinksLoader: ProfileLinksLoader) {}

  @ResolveField(() => [ProfileLinkModel])
  links(
    @Parent() profile: ProfileModel,
    @Context() context: GraphqlContext,
  ): Promise<ProfileLink[]> {
    return this.profileLinksLoader.load(context, profile.id);
  }
}
