import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { type GraphqlContext } from '../common/graphql/graphql-context.js';
import { ProfileModel } from '../profile/models/profile.model.js';
import { type Experience } from './experience.js';
import { ExperienceLoader } from './experience.loader.js';
import { ExperienceModel } from './models/experience.model.js';

@Resolver(() => ProfileModel)
export class ExperienceResolver {
  constructor(private readonly experienceLoader: ExperienceLoader) {}

  @ResolveField(() => [ExperienceModel])
  experience(
    @Parent() profile: ProfileModel,
    @Context() context: GraphqlContext,
  ): Promise<Experience[]> {
    return this.experienceLoader.load(context, profile.id);
  }
}
